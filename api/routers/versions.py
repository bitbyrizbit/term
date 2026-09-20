from fastapi import APIRouter, HTTPException, File, UploadFile
from db.supabase_client import db
from graph.builder import build_contract_graph
from graph.version_diff import compute_version_diff
import tempfile
import os
import uuid
from services.pdf_parser import extract_text_and_sections
from services.section_splitter import chunk_into_sections
from services.extraction_agent import extract_clause_data

router = APIRouter(prefix="/contracts", tags=["Versions"])

@router.post("/{contract_id}/diff")
async def compute_diff(contract_id: str, file: UploadFile = File(...)):
    # 1. Fetch V1
    c1_clauses = db.get_clauses_for_contract(contract_id)
    if not c1_clauses:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    G1 = build_contract_graph(c1_clauses)
    
    # 2. Parse V2
    fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
            
        _, lines_meta = extract_text_and_sections(temp_path)
        sections = chunk_into_sections(lines_meta)
        
        c2_clauses = []
        for i, sec in enumerate(sections):
            extracted = extract_clause_data(sec["text"])
            c2_clauses.append({
                "id": f"temp_v2_{i}",
                "contract_id": contract_id,
                "section_ref": sec["section_ref"],
                "text": sec["text"],
                "extracted_data": extracted
            })
            
    finally:
        os.close(fd)
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    G2 = build_contract_graph(c2_clauses)
    diff_results = compute_version_diff(G1, G2)
    
    return {"diff": diff_results}
