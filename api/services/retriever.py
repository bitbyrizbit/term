import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def retrieve_context(query: str, clauses: list, top_k: int = 3) -> list:
    """
    Retrieves the top-k most semantically relevant clauses using lightweight TF-IDF.
    This bypasses the need for heavy PyTorch embedding models on free tiers.
    """
    if not clauses:
        return []
        
    corpus = [c.get("text", "") for c in clauses]
    
    # Initialize TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words='english')
    
    # Fit and transform the corpus and query
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        query_vec = vectorizer.transform([query])
    except ValueError:
        # Failsafe if corpus is entirely empty or stopwords
        return clauses[:top_k]
    
    # Compute Cosine Similarity
    sims = cosine_similarity(query_vec, tfidf_matrix).flatten()
    
    top_indices = np.argsort(sims)[-top_k:][::-1]
    
    results = []
    for idx in top_indices:
        results.append(clauses[idx])
        
    return results
