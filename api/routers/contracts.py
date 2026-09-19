import uuid
import os
import tempfile
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from db.supabase_client import db
from services.pdf_parser import extract_text_and_sections
from services.section_splitter import chunk_into_sections
from services.extraction_agent import extract_clause_data
from models.schemas import ContractCreateResponse, ContractStatusResponse, Clause

router = APIRouter()

def process_contract_background(contract_id: str, file_path: str):
    """
    Background task to parse the PDF, split into clauses, extract data, and save to DB.
    """
    try:
        # 1. Parse PDF
        full_text, lines_with_meta = extract_text_and_sections(file_path)
        
        # 2. Split into clauses
        sections = chunk_into_sections(lines_with_meta)
        
        # 3. Extract data for each section using Groq
        clauses_to_insert = []
        for sec in sections:
            if not sec["text"].strip():
                continue
                
            extracted = extract_clause_data(sec["text"])
            
            clause_id = str(uuid.uuid4())
            clauses_to_insert.append({
                "id": clause_id,
                "contract_id": contract_id,
                "section_ref": sec["section_ref"],
                "text": sec["text"],
                "clause_type": extracted.get("clause_type", "other"),
                "extracted_data": extracted
            })
            
        # 4. Save clauses
        db.insert_clauses(clauses_to_insert)
        
        # 5. Update contract status
        db.update_contract_status(contract_id, "completed")
        
    except Exception as e:
        print(f"Failed processing contract {contract_id}: {e}")
        db.update_contract_status(contract_id, "failed")
    finally:
        # Cleanup temp file
        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/upload", response_model=ContractCreateResponse)
async def upload_contract(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    contract_id = str(uuid.uuid4())
    
    # Save uploaded file temporarily
    temp_fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    with os.fdopen(temp_fd, "wb") as f:
        f.write(await file.read())
        
    # Create record in DB
    db.create_contract(contract_id, file.filename, "") # raw text saved later if needed
    
    # Kick off background processing
    background_tasks.add_task(process_contract_background, contract_id, temp_path)
    
    return ContractCreateResponse(
        id=contract_id,
        filename=file.filename,
        status="processing"
    )

@router.get("/{contract_id}", response_model=ContractStatusResponse)
async def get_contract(contract_id: str):
    contract = db.get_contract(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    clauses = db.get_clauses_for_contract(contract_id)
    
    # Format for response
    formatted_clauses = []
    for c in clauses:
        formatted_clauses.append(Clause(
            id=c["id"],
            contract_id=c["contract_id"],
            section_ref=c["section_ref"],
            text=c["text"],
            extracted_data=c.get("extracted_data")
        ))
        
    return ContractStatusResponse(
        id=contract["id"],
        filename=contract["filename"],
        status=contract["status"],
        clauses=formatted_clauses
    )
