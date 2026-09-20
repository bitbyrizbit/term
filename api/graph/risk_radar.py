import os
import json
from groq import Groq

def generate_risk_radar(clauses):
    api_key = os.getenv("GROQ_API_KEY", "")
    client = Groq(api_key=api_key)
    
    categories = [
        {"name": "Payment & Fees", "desc": "Penalties, late fees, hidden costs"},
        {"name": "Renewal & Term", "desc": "Auto-renewals, notice periods"},
        {"name": "Termination", "desc": "Rights to terminate, breaches"},
        {"name": "Liability & Indemnity", "desc": "Caps on liability, indemnification"},
        {"name": "SLA & Support", "desc": "Uptime, credits, support obligations"},
        {"name": "Data & Security", "desc": "Data protection, breach notification"}
    ]
    
    full_text = "\n".join([f"({c.get('section_ref', 'Unknown')}): {c.get('text', '')}" for c in clauses])
    
    prompt = f"""
    Evaluate the following contract for risk across these categories:
    {json.dumps(categories)}
    
    Contract Text:
    {full_text}
    
    For each category, determine the risk status (Red = High Risk/Onerous, Yellow = Medium/Standard, Green = Low Risk/Favorable).
    Provide a specific text justification and a concrete next action (e.g. "Calendar notice 60 days prior").
    Always cite the exact section reference in the source_ref field.
    
    Output JSON ONLY in this format:
    {{
        "risks": [
            {{
                "category": "Payment & Fees",
                "status": "Green",
                "justification": "Why this status was chosen based on the text",
                "next_action": "Concrete next action to take",
                "source_ref": "Section X"
            }}
        ]
    }}
    """
    
    try:
        res = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a legal risk analyst. Output ONLY JSON."},
                {"role": "user", "content": prompt}
            ],
            model="openai/gpt-oss-20b",
            temperature=0,
            response_format={"type": "json_object"}
        )
        data = json.loads(res.choices[0].message.content)
        
        # Link source_ref to actual clause IDs for the frontend
        risks = data.get("risks", [])
        for r in risks:
            ref = r.get("source_ref", "")
            r["clause_id"] = None
            for c in clauses:
                if ref.lower() in c.get("section_ref", "").lower():
                    r["clause_id"] = c["id"]
                    break
                    
        return risks
    except Exception as e:
        print(f"Error generating risk radar: {e}")
        return []
