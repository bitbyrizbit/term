import os
import json
import difflib
from groq import Groq
from graph.consequence_tracer import trace_consequences

def get_clause_nodes(G):
    clauses = []
    for node_id, data in G.nodes(data=True):
        if data.get("type") == "Clause":
            clauses.append({"id": node_id, **data})
    return clauses

def compute_version_diff(G1, G2):
    """
    Compares two graphs by matching clauses on text similarity, 
    then classifies materiality using LLM.
    """
    api_key = os.getenv("GROQ_API_KEY", "")
    client = Groq(api_key=api_key)
    
    c1_nodes = get_clause_nodes(G1)
    c2_nodes = get_clause_nodes(G2)
    
    matches = []
    c2_unmatched = list(c2_nodes)
    
    for n1 in c1_nodes:
        best_match = None
        best_ratio = 0
        for n2 in c2_unmatched:
            ratio = difflib.SequenceMatcher(None, n1.get('text', ''), n2.get('text', '')).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = n2
                
        if best_match and best_ratio > 0.4:
            matches.append((n1, best_match, best_ratio))
            c2_unmatched.remove(best_match)
        else:
            matches.append((n1, None, 0)) # Deleted
            
    for n2 in c2_unmatched:
        matches.append((None, n2, 0)) # Added
        
    results = []
    for m in matches:
        old_node, new_node, ratio = m
        if ratio == 1.0:
            # Identical, no change
            continue
            
        change_type = "modified"
        if not old_node:
            change_type = "added"
        elif not new_node:
            change_type = "deleted"
            
        old_text = old_node.get("text", "") if old_node else ""
        new_text = new_node.get("text", "") if new_node else ""
        
        # Ask LLM if this is a material change
        materiality = classify_materiality(client, old_text, new_text, change_type)
        
        # If material and modified/added, find impact in G2
        impact = []
        if materiality.get("is_material") and new_node:
            # We trace from the Clause node in G2 to find affected downstream obligations
            # Wait, trace_consequences takes an Event. We can just pass the Clause node.
            # consequence_tracer treats Clause as a node and traces its successors.
            # But the tracer was built to go Obligation -> Event backwards.
            # Let's write a simple forward walk for impact.
            impact = trace_forward_impact(G2, new_node["id"])
            
        results.append({
            "change_type": change_type,
            "old_ref": old_node.get("label", "") if old_node else "",
            "new_ref": new_node.get("label", "") if new_node else "",
            "old_text": old_text,
            "new_text": new_text,
            "is_material": materiality.get("is_material", False),
            "reasoning": materiality.get("reasoning", ""),
            "affected_teams": materiality.get("affected_teams", []),
            "impact": impact
        })
        
    return results

def classify_materiality(client, old_text, new_text, change_type):
    prompt = f"""
    Analyze this contract change. Is it a MATERIAL change?
    Material changes alter obligations, deadlines, liabilities, or party rights.
    Cosmetic changes fix typos or reword without altering legal meaning.
    
    Change Type: {change_type}
    Old Text: {old_text}
    New Text: {new_text}
    
    Output JSON ONLY:
    {{
      "is_material": boolean,
      "reasoning": "brief explanation why",
      "affected_teams": ["Legal", "Procurement", "Finance", "Sales"] (pick 1-2 relevant)
    }}
    """
    try:
        res = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a legal diff classifier. Output ONLY JSON."},
                {"role": "user", "content": prompt}
            ],
            model="openai/gpt-oss-20b",
            temperature=0,
            response_format={"type": "json_object"}
        )
        return json.loads(res.choices[0].message.content)
    except Exception as e:
        print(f"Error classifying materiality: {e}")
        return {"is_material": True, "reasoning": "Failed to parse. Assuming material for safety.", "affected_teams": ["Legal"]}

def trace_forward_impact(G, clause_id):
    """
    Finds obligations that belong to this clause, or are connected to it.
    """
    affected = []
    # If the clause changed, all its explicit obligations are affected
    for node_id, data in G.nodes(data=True):
        if data.get("type") == "Obligation" and data.get("clause_id") == clause_id.replace("clause_", ""):
            affected.append({
                "action": data.get("label"),
                "owner": data.get("owner")
            })
            
    # Also find any clauses that depend_on this clause
    for succ in G.successors(clause_id):
        edge_data = G.get_edge_data(clause_id, succ)
        if edge_data and edge_data.get("relation") == "depends_on":
            succ_data = G.nodes[succ]
            affected.append({
                "action": f"Downstream impact on {succ_data.get('label')}",
                "owner": "System"
            })
            
    return affected
