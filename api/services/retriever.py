import numpy as np
from sentence_transformers import SentenceTransformer

# Load model lazily to save memory during startup
_model = None

def get_model():
    global _model
    if _model is None:
        # Extremely lightweight local embedding model
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def retrieve_context(query: str, clauses: list, top_k: int = 3) -> list:
    """
    Retrieves the top-k most semantically relevant clauses using local embeddings.
    """
    if not clauses:
        return []
        
    model = get_model()
    
    corpus = [c.get("text", "") for c in clauses]
    
    query_emb = model.encode([query])[0]
    corpus_emb = model.encode(corpus)
    
    # Compute Cosine Similarity
    query_norm = np.linalg.norm(query_emb)
    corpus_norms = np.linalg.norm(corpus_emb, axis=1)
    
    # Avoid division by zero
    query_norm = query_norm if query_norm != 0 else 1e-10
    corpus_norms = np.where(corpus_norms == 0, 1e-10, corpus_norms)
    
    sims = np.dot(corpus_emb, query_emb) / (corpus_norms * query_norm)
    
    top_indices = np.argsort(sims)[-top_k:][::-1]
    
    results = []
    for idx in top_indices:
        results.append(clauses[idx])
        
    return results
