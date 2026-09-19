from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import contracts

app = FastAPI(title="TERM API", description="Contract Knowledge Graph Extraction Engine", version="1.0.0")

# Setup CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contracts.router, prefix="/contracts", tags=["contracts"])

@app.get("/")
def read_root():
    return {"message": "TERM API is running."}
