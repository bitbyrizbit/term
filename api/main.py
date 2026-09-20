from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import contracts, graph, obligations, events, qa, versions, risk

app = FastAPI(title="Term API")

# Setup CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for hackathon deployment ease, restrict to specific Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
app.include_router(graph.router)
app.include_router(obligations.router)
app.include_router(events.router)
app.include_router(qa.router)
app.include_router(versions.router)
app.include_router(risk.router)

@app.get("/")
def read_root():
    return {"message": "TERM API is running."}
