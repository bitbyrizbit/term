from fastapi import APIRouter, HTTPException
from datetime import datetime
from db.supabase_client import db
from graph.builder import build_contract_graph
from graph.deadline_resolver import resolve_deadlines

router = APIRouter(prefix="/contracts", tags=["Obligations"])

@router.get("/{contract_id}/obligations")
def get_contract_obligations(contract_id: str):
    clauses = db.get_contract_clauses(contract_id)
    if not clauses:
        raise HTTPException(status_code=404, detail="Contract not found or no clauses")
        
    G = build_contract_graph(clauses)
    G = resolve_deadlines(G)
    
    now = datetime.now()
    
    buckets = {
        "overdue": [],
        "due_this_week": [],
        "upcoming": [],
        "completed": []
    }
    
    for node_id, data in G.nodes(data=True):
        if data.get("type") == "Obligation":
            resolved_date_str = data.get("resolved_date")
            status = "upcoming"
            
            if resolved_date_str:
                resolved_date = datetime.fromisoformat(resolved_date_str)
                days_diff = (resolved_date - now).days
                if days_diff < 0:
                    status = "overdue"
                elif 0 <= days_diff <= 7:
                    status = "due_this_week"
            
            buckets[status].append({
                "id": node_id,
                "owner": data.get("owner", "Unknown"),
                "action": data.get("label", ""),
                "deadline": resolved_date_str,
                "clause_id": data.get("clause_id")
            })
            
    return buckets
