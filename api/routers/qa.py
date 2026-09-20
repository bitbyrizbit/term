import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.supabase_client import db
from services.retriever import retrieve_context
from groq import Groq

router = APIRouter(prefix="/contracts", tags=["QA"])

class QARequest(BaseModel):
    query: str

@router.post("/{contract_id}/ask")
def ask_question(contract_id: str, request: QARequest):
    clauses = db.get_clauses_for_contract(contract_id)
    if not clauses:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing GROQ_API_KEY")
        
    client = Groq(api_key=api_key)
    
    # Retrieval step
    relevant_clauses = retrieve_context(request.query, clauses, top_k=3)
    
    context_text = []
    retrieved_refs = []
    
    for c in relevant_clauses:
        ref = c.get("section_ref", "Unknown")
        retrieved_refs.append(ref)
        context_text.append(f"--- SECTION: {ref} ---\n{c.get('text', '')}")
        
    full_context = "\n\n".join(context_text)
    
    prompt = f"""
    Answer the user's question STRICTLY using the provided contract clauses.
    Do not use outside knowledge. If the answer is not in the text, say so.
    
    Context Clauses:
    {full_context}
    
    Question: {request.query}
    
    Output ONLY JSON in this format:
    {{
      "answer": "your detailed answer",
      "reasoning": "step by step explanation of how you derived the answer",
      "cited_sections": ["Section 1", "Section 2"],
      "confidence": float between 0.0 and 1.0,
      "human_review_recommended": boolean
    }}
    """
    
    try:
        res = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a legal Q&A assistant. Output ONLY JSON."},
                {"role": "user", "content": prompt}
            ],
            model="openai/gpt-oss-20b",
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        data = json.loads(res.choices[0].message.content)
        
        # Verify citations (anti-hallucination check)
        cited = data.get("cited_sections", [])
        valid_citations = []
        for citation in cited:
            # Check if cited section appears anywhere in the retrieved refs
            if any(citation.lower() in ref.lower() or ref.lower() in citation.lower() for ref in retrieved_refs):
                valid_citations.append(citation)
            else:
                # If they cited something we didn't retrieve, confidence drops, human review required
                data["confidence"] = 0.5
                data["human_review_recommended"] = True
                
        data["cited_sections"] = valid_citations
        
        # We also want to return the actual clause IDs for the frontend to use ClauseSourceLink
        source_links = []
        for c in relevant_clauses:
            ref = c.get("section_ref", "")
            if ref in valid_citations or any(v.lower() in ref.lower() for v in valid_citations):
                source_links.append({
                    "clause_id": c.get("id"),
                    "section_ref": ref
                })
        
        data["source_links"] = source_links
        
        return data
        
    except Exception as e:
        print(f"Error in Q&A: {e}")
        raise HTTPException(status_code=500, detail=str(e))
