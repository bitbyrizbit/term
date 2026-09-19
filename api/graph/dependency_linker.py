import os
import json
import networkx as nx
from groq import Groq

def link_dependencies(G: nx.DiGraph, clauses: list):
    """
    Second LLM pass over clause pairs to detect depends_on and conflicts_with edges.
    Keeps pass scoped by only running on pairs that share an entity or cross-reference.
    """
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return G # Return unmodified graph if no key
        
    client = Groq(api_key=api_key)
    
    # Map section refs to their clause data for easy lookup
    ref_map = {}
    for clause in clauses:
        ref = clause.get("section_ref", "")
        if ref:
            ref_map[ref.lower()] = clause
            
    # Find cross-references
    pairs_to_check = []
    for clause in clauses:
        ext = clause.get("extracted_data", {})
        if not ext:
            continue
        refs = ext.get("references_to_other_sections", [])
        for ref in refs:
            # Simple matching logic
            for mapped_ref, target_clause in ref_map.items():
                if mapped_ref in ref.lower() or ref.lower() in mapped_ref:
                    pairs_to_check.append((clause, target_clause))
                    
    # Only process a small number to save tokens
    for (c1, c2) in pairs_to_check[:3]:
        # Avoid checking a clause against itself
        if c1["id"] != c2["id"]:
            check_clause_conflict(G, client, c1, c2)
        
    return G

def check_clause_conflict(G: nx.DiGraph, client, c1, c2):
    prompt = f"""
    Analyze these two clauses for logical conflicts or dependencies.
    Clause 1 ({c1.get('section_ref')}): {c1.get('text')}
    Clause 2 ({c2.get('section_ref')}): {c2.get('text')}
    
    Reply ONLY in JSON format:
    {{
      "has_conflict": boolean,
      "conflict_reason": "string describing the conflict",
      "depends_on": boolean
    }}
    """
    try:
        import time
        time.sleep(1.5) # Prevent rate limits
        res = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a legal contract analyzer. Output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="openai/gpt-oss-20b",
            temperature=0,
            response_format={"type": "json_object"}
        )
        data = json.loads(res.choices[0].message.content)
        
        c1_id = f"clause_{c1['id']}"
        c2_id = f"clause_{c2['id']}"
        
        if data.get("has_conflict"):
            G.add_edge(c1_id, c2_id, relation="conflicts_with", reason=data.get("conflict_reason"))
            G.add_edge(c2_id, c1_id, relation="conflicts_with", reason=data.get("conflict_reason"))
            
        if data.get("depends_on"):
            G.add_edge(c1_id, c2_id, relation="depends_on")
            
    except Exception as e:
        print(f"[!] Conflict check error: {e}")
