import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# We'll use a simple in-memory mock if Supabase keys are not set yet, so the app still runs.
mock_db = {
    "contracts": {},
    "clauses": []
}

class SupabaseClient:
    def __init__(self):
        self.is_mock = not (SUPABASE_URL and SUPABASE_KEY)
        if not self.is_mock:
            self.client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("Connected to Supabase")
        else:
            print("WARNING: Supabase credentials not found. Using in-memory mock database.")

    def create_contract(self, contract_id: str, filename: str, raw_text: str):
        if self.is_mock:
            mock_db["contracts"][contract_id] = {
                "id": contract_id,
                "filename": filename,
                "raw_text": raw_text,
                "status": "processing"
            }
            return
            
        data = {
            "id": contract_id,
            "filename": filename,
            "raw_text": raw_text,
            "status": "processing"
        }
        self.client.table("contracts").insert(data).execute()

    def update_contract_status(self, contract_id: str, status: str):
        if self.is_mock:
            if contract_id in mock_db["contracts"]:
                mock_db["contracts"][contract_id]["status"] = status
            return

        self.client.table("contracts").update({"status": status}).eq("id", contract_id).execute()

    def get_contract(self, contract_id: str):
        if self.is_mock:
            return mock_db["contracts"].get(contract_id)

        response = self.client.table("contracts").select("*").eq("id", contract_id).execute()
        if response.data:
            return response.data[0]
        return None

    def insert_clauses(self, clauses: list):
        if not clauses: return
        
        if self.is_mock:
            mock_db["clauses"].extend(clauses)
            return

        self.client.table("clauses").insert(clauses).execute()

    def get_clauses_for_contract(self, contract_id: str):
        if self.is_mock:
            return [c for c in mock_db["clauses"] if c["contract_id"] == contract_id]

        response = self.client.table("clauses").select("*").eq("contract_id", contract_id).execute()
        return response.data

db = SupabaseClient()
