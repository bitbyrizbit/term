import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.supabase_client import db
from graph.builder import build_contract_graph
from graph.consequence_tracer import trace_consequences
from groq import Groq

router = APIRouter(prefix="/contracts", tags=["Events"])

class EventRequest(BaseModel):
    query: str

@router.post("/{contract_id}/events")
def simulate_event(contract_id: str, request: EventRequest):
    clauses = db.get_clauses_for_contract(contract_id)
    if not clauses:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    G = build_contract_graph(clauses)
    
    # 1. Gather all Event nodes from the graph
    events = []
    for node_id, data in G.nodes(data=True):
        if data.get("type") == "Event":
            events.append({"id": node_id, "label": data.get("label", "")})
            
    if not events:
        return {"needs_clarification": True, "message": "No specific events tracked in this contract."}
        
    # 2. Use LLM to match the natural language query to an Event node
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing GROQ_API_KEY")
        
    client = Groq(api_key=api_key)
    
    prompt = f"""
    You must match the user's natural language event to one of the known contract events.
    
    User event: "{request.query}"
    
    Known events in the contract graph:
    {json.dumps(events, indent=2)}
    
    Return ONLY JSON with this format:
    {{
      "matched_event_id": "the node id, or null if no good match",
      "confidence": float between 0.0 and 1.0
    }}
    """
    
    try:
        res = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an intelligent mapping assistant. Return strictly JSON."},
                {"role": "user", "content": prompt}
            ],
            model="openai/gpt-oss-20b",
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        match_data = json.loads(res.choices[0].message.content)
        matched_id = match_data.get("matched_event_id")
        confidence = match_data.get("confidence", 0.0)
        
        if not matched_id or confidence < 0.70:
            return {
                "needs_clarification": True,
                "message": "I couldn't confidently map that event to a specific contract trigger. Could you clarify what happened?",
                "confidence": confidence
            }
            
        # 3. Trace Consequences
        chain = trace_consequences(G, matched_id)
        
        return {
            "needs_clarification": False,
            "matched_event_id": matched_id,
            "confidence": confidence,
            "chain": chain
        }
        
    except Exception as e:
        print(f"Error in event matching: {e}")
        raise HTTPException(status_code=500, detail=str(e))
