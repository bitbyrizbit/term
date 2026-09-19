from datetime import datetime, timedelta
from dateutil.parser import parse
from dateutil.relativedelta import relativedelta
import networkx as nx

def resolve_deadlines(G: nx.DiGraph):
    """
    Computes concrete dates for obligations with explicit deadlines.
    Adds `resolved_date` to Obligation nodes based on linked Deadline nodes.
    For implicit rules, leaves them on the depends_on edges (Phase 3).
    """
    for node_id, data in G.nodes(data=True):
        if data.get("type") == "Obligation":
            # Check for linked Deadline (relation="deadline_of")
            # In our builder, Deadline -(deadline_of)-> Obligation
            for neighbor in G.predecessors(node_id):
                edge_data = G.get_edge_data(neighbor, node_id)
                if edge_data and edge_data.get("relation") == "deadline_of":
                    neighbor_data = G.nodes[neighbor]
                    rule = neighbor_data.get("label", "")
                    resolved_date = compute_explicit_date(rule)
                    if resolved_date:
                        G.nodes[node_id]["resolved_date"] = resolved_date.isoformat()
    return G

def compute_explicit_date(rule: str) -> datetime:
    """
    A very basic parser for explicit dates or simple recurring schedules.
    For the hackathon, if we can't parse it, we default to 7 days from now.
    """
    now = datetime.now()
    
    # Simple keyword detection
    rule_lower = rule.lower()
    if "monthly" in rule_lower or "each month" in rule_lower:
        return now + relativedelta(months=1, day=5)
    if "annual" in rule_lower or "yearly" in rule_lower:
        return now + relativedelta(years=1)
        
    try:
        # Try a direct parse
        parsed = parse(rule, fuzzy=True)
        if parsed < now:
            parsed = parsed.replace(year=now.year + 1)
        return parsed
    except ValueError:
        # If parsing fails, extract days or default
        import re
        match = re.search(r'(\d+)\s*days?', rule_lower)
        if match:
            days = int(match.group(1))
            return now + timedelta(days=days)
            
        return now + timedelta(days=7) # Default fallback
