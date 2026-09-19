import os
import json
from groq import Groq
from models.schemas import ExtractedClauseData

# Initialize Groq client
api_key = os.getenv("GROQ_API_KEY", "")
# if no key, we will simulate it for now so demo doesn't crash before user sets it up
if api_key:
    client = Groq(api_key=api_key)
else:
    client = None

SYSTEM_PROMPT = """You are a world-class legal AI contract extraction agent.
Your goal is to extract structured obligations and deadlines from contract clauses.
You MUST extract any implicit time rules (e.g. 'within 10 days of breach') separately from the event that triggers them.
Do not collapse the event and the time rule into the same field.
Return ONLY valid JSON matching the schema provided. Do not include markdown blocks or any preamble.
"""

def extract_clause_data(text: str) -> dict:
    """
    Calls Groq to extract structured data from a clause.
    Returns a dict matching ExtractedClauseData.
    """
    if not client:
        # Mock extraction for testing if Groq key isn't provided
        return {
            "parties_mentioned": ["Vendor", "Customer"],
            "clause_type": "other",
            "obligations": [
                {
                    "owner": "Customer",
                    "action": "Provide written notice",
                    "condition_or_event": "discovering a breach",
                    "explicit_deadline_or_null": None,
                    "implicit_time_rule_or_null": "within 10 days"
                }
            ],
            "references_to_other_sections": []
        }

    schema = ExtractedClauseData.model_json_schema()
    
    prompt = f"""
    Analyze the following contract clause:
    
    "{text}"
    
    Extract the data to match this JSON schema precisely:
    {json.dumps(schema, indent=2)}
    
    Return ONLY the raw JSON object.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant", # Fast model for quick extraction
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        response_text = chat_completion.choices[0].message.content
        return json.loads(response_text)
    except Exception as e:
        print(f"Error extracting data from Groq: {e}")
        # Return a fallback empty schema
        return {
            "parties_mentioned": [],
            "clause_type": "other",
            "obligations": [],
            "references_to_other_sections": []
        }
