from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from db.supabase_client import db
from graph.risk_radar import generate_risk_radar
from services.report_generator import generate_pdf_report

router = APIRouter(prefix="/contracts", tags=["Risk"])

@router.get("/{contract_id}/risk")
def get_risk_radar(contract_id: str):
    clauses = db.get_clauses_for_contract(contract_id)
    if not clauses:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    risks = generate_risk_radar(clauses)
    return {"risks": risks}

@router.get("/{contract_id}/risk/report")
def export_risk_report(contract_id: str):
    clauses = db.get_clauses_for_contract(contract_id)
    if not clauses:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    risks = generate_risk_radar(clauses)
    
    # We could fetch the contract title, but for now we'll use the ID
    pdf_bytes = generate_pdf_report(f"Contract {contract_id}", risks)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Risk_Report_{contract_id}.pdf"}
    )
