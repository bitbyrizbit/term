import networkx as nx
from typing import List, Dict
from datetime import datetime
from dateutil.relativedelta import relativedelta
import re

def trace_consequences(G: nx.DiGraph, event_node_id: str, max_depth: int = 6) -> List[Dict]:
    """
    Perform a BFS traversal from an Event node to trace consequence chains.
    Follows depends_on edges (which point from Obligation -> Event in our graph) backwards.
    Also traverses clause conflicts.
    """
    if not G.has_node(event_node_id):
        return []

    visited = set()
    # Queue stores: (node_id, current_trigger_date, depth)
    queue = [(event_node_id, datetime.now(), 0)]
    chain = []
    
    while queue:
        current_node, trigger_date, depth = queue.pop(0)
        if current_node in visited or depth >= max_depth:
            continue
            
        visited.add(current_node)
        node_data = G.nodes[current_node]
        
        # If it's an Obligation, add it to the chain
        if node_data.get("type") == "Obligation":
            clause_id = node_data.get("clause_id")
            clause_text = ""
            clause_ref = ""
            if clause_id:
                clause_node = f"clause_{clause_id}"
                if G.has_node(clause_node):
                    clause_text = G.nodes[clause_node].get("text", "")
                    clause_ref = G.nodes[clause_node].get("label", "")
            
            chain.append({
                "node_id": current_node,
                "type": "Obligation",
                "action": node_data.get("label"),
                "owner": node_data.get("owner"),
                "deadline": trigger_date.isoformat(),
                "source_clause": clause_text,
                "source_ref": clause_ref,
                "confidence": 0.95
            })
            
            # Check for conflicts and dependencies on this clause to extend the chain
            if clause_id:
                c_node = f"clause_{clause_id}"
                
                # Check outgoing edges from this clause
                for succ in G.successors(c_node):
                    e_data = G.get_edge_data(c_node, succ)
                    if not e_data: continue
                    
                    relation = e_data.get("relation")
                    target_ref = G.nodes[succ].get("label", "")
                    target_text = G.nodes[succ].get("text", "")
                    
                    if relation == "conflicts_with" and succ not in visited:
                        visited.add(succ)
                        chain.append({
                            "node_id": succ,
                            "type": "Conflict",
                            "action": f"Conflict detected with {target_ref}: {e_data.get('reason', '')}",
                            "owner": "System Warning",
                            "deadline": trigger_date.isoformat(),
                            "source_clause": target_text,
                            "source_ref": target_ref,
                            "confidence": 0.88
                        })
                        
                    elif relation == "depends_on" and succ not in visited:
                        # Escalation or related clause
                        queue.append((succ, trigger_date + relativedelta(days=5), depth + 1))
                        
                # Also check incoming depends_on edges to this clause (if another clause depends on this one)
                for pred in G.predecessors(c_node):
                    e_data = G.get_edge_data(pred, c_node)
                    if e_data and e_data.get("relation") == "depends_on" and pred not in visited:
                        queue.append((pred, trigger_date + relativedelta(days=5), depth + 1))
                        
        # Handle Clause nodes directly if they were added to the queue via clause-to-clause dependencies
        elif node_data.get("type") == "Clause":
            chain.append({
                "node_id": current_node,
                "type": "Escalation",
                "action": f"Escalation triggered in {node_data.get('label')}",
                "owner": "Legal / Management",
                "deadline": trigger_date.isoformat(),
                "source_clause": node_data.get("text", ""),
                "source_ref": node_data.get("label", ""),
                "confidence": 0.90
            })

        # 1. Find Obligations that depend on this node
        # For Event nodes, incoming edges are 'depends_on' from Obligations
        for predecessor in G.predecessors(current_node):
            edge_data = G.get_edge_data(predecessor, current_node)
            if edge_data and edge_data.get("relation") == "depends_on":
                rule = edge_data.get("rule", "")
                new_date = resolve_implicit_date(trigger_date, rule)
                queue.append((predecessor, new_date, depth + 1))
                        
    return chain

def resolve_implicit_date(base_date: datetime, rule: str) -> datetime:
    """
    Computes a concrete deadline based on the trigger event date and the implicit rule.
    """
    rule_lower = rule.lower()
    
    if "48 hours" in rule_lower:
        return base_date + relativedelta(hours=48)
        
    match = re.search(r'(\d+)\s*days?', rule_lower)
    if match:
        days = int(match.group(1))
        return base_date + relativedelta(days=days)
        
    # Default fallback if rule is unparseable
    return base_date + relativedelta(days=7)
