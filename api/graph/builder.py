import networkx as nx
import random

def build_contract_graph(clauses: list):
    """
    Builds a NetworkX DiGraph representing the Contract Knowledge Graph.
    Nodes: Party, Clause, Obligation, Deadline, Event
    Edges: owned_by, from_clause, deadline_of, depends_on, conflicts_with
    """
    G = nx.DiGraph()
    
    # 1. Add Clauses and basic obligations
    for clause in clauses:
        clause_node_id = f"clause_{clause['id']}"
        G.add_node(clause_node_id, type="Clause", label=clause.get("section_ref", "Unknown"), text=clause.get("text", ""))
        
        extracted_data = clause.get("extracted_data")
        if not extracted_data:
            continue
            
        # Add parties
        for party in extracted_data.get("parties_mentioned", []):
            party_node_id = f"party_{party.lower().replace(' ', '_')}"
            if not G.has_node(party_node_id):
                G.add_node(party_node_id, type="Party", label=party)
                
        # Add obligations
        obligations = extracted_data.get("obligations", [])
        for i, obs in enumerate(obligations):
            obs_node_id = f"obs_{clause['id']}_{i}"
            action = obs.get("action", "")
            owner = obs.get("owner", "")
            
            G.add_node(obs_node_id, type="Obligation", label=action, owner=owner, clause_id=clause['id'])
            G.add_edge(obs_node_id, clause_node_id, relation="from_clause")
            
            if owner:
                party_node_id = f"party_{owner.lower().replace(' ', '_')}"
                if not G.has_node(party_node_id):
                    G.add_node(party_node_id, type="Party", label=owner)
                G.add_edge(obs_node_id, party_node_id, relation="owned_by")
                
            # Handle deadlines and events
            explicit = obs.get("explicit_deadline_or_null")
            implicit = obs.get("implicit_time_rule_or_null")
            condition = obs.get("condition_or_event")
            
            if explicit:
                deadline_node_id = f"deadline_{obs_node_id}"
                G.add_node(deadline_node_id, type="Deadline", label=explicit, rule_type="explicit")
                G.add_edge(deadline_node_id, obs_node_id, relation="deadline_of")
            
            if implicit and condition:
                event_node_id = f"event_{obs_node_id}"
                G.add_node(event_node_id, type="Event", label=condition)
                # Store the rule on the edge
                G.add_edge(obs_node_id, event_node_id, relation="depends_on", rule=implicit)
                
    return G

def serialize_for_reactflow(G: nx.DiGraph):
    nodes = []
    edges = []
    
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id": node_id,
            "type": "customNode", # We'll define this in React Flow
            "position": {"x": random.randint(0, 500), "y": random.randint(0, 500)}, # Will be positioned by dagre on frontend
            "data": {**data, "id": node_id}
        })
        
    for source, target, data in G.edges(data=True):
        edges.append({
            "id": f"e_{source}_{target}",
            "source": source,
            "target": target,
            "label": data.get("relation", ""),
            "data": data # Contains rules etc.
        })
        
    return {"nodes": nodes, "edges": edges}
