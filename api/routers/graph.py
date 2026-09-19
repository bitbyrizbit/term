from fastapi import APIRouter, HTTPException
from db.supabase_client import db
from graph.builder import build_contract_graph, serialize_for_reactflow
from graph.deadline_resolver import resolve_deadlines
from graph.dependency_linker import link_dependencies

router = APIRouter(prefix="/contracts", tags=["Graph"])

@router.get("/{contract_id}/graph")
def get_contract_graph(contract_id: str):
    clauses = db.get_clauses_for_contract(contract_id)
    if not clauses:
        raise HTTPException(status_code=404, detail="Contract not found or no clauses")
        
    # Build base graph
    G = build_contract_graph(clauses)
    # Resolve explicit deadlines
    G = resolve_deadlines(G)
    # Perform second LLM pass for conflicts
    G = link_dependencies(G, clauses)
    
    return serialize_for_reactflow(G)
