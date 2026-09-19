from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class ClauseType(str, Enum):
    payment = "payment"
    termination = "termination"
    sla = "SLA"
    renewal = "renewal"
    liability = "liability"
    confidentiality = "confidentiality"
    notice = "notice"
    other = "other"

class Obligation(BaseModel):
    owner: str = Field(..., description="The party responsible for this obligation")
    action: str = Field(..., description="The action that must be performed")
    condition_or_event: Optional[str] = Field(None, description="The condition or event that triggers this obligation, if any")
    explicit_deadline_or_null: Optional[str] = Field(None, description="An explicit calendar date or fixed day count, if stated")
    implicit_time_rule_or_null: Optional[str] = Field(None, description="A deadline derived from an event, e.g., 'within 10 days of discovering a breach', without a literal calendar date")

class ExtractedClauseData(BaseModel):
    parties_mentioned: List[str] = Field(..., description="Parties mentioned in this clause")
    clause_type: ClauseType = Field(..., description="The classification of this clause")
    obligations: List[Obligation] = Field(default_factory=list, description="List of obligations extracted from this clause")
    references_to_other_sections: List[str] = Field(default_factory=list, description="Any references to other section numbers in the contract")

class Clause(BaseModel):
    id: str = Field(..., description="UUID for the clause")
    contract_id: str = Field(..., description="UUID of the parent contract")
    section_ref: str = Field(..., description="Section number or reference (e.g., '8.2')")
    text: str = Field(..., description="Raw text of the clause")
    extracted_data: Optional[ExtractedClauseData] = Field(None, description="Structured data extracted by LLM")

class ContractCreateResponse(BaseModel):
    id: str
    filename: str
    status: str

class ContractStatusResponse(BaseModel):
    id: str
    filename: str
    status: str
    clauses: List[Clause] = []
