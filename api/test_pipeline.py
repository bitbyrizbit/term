import asyncio
from services.pdf_parser import extract_text_and_sections
from services.section_splitter import chunk_into_sections
from services.extraction_agent import extract_clause_data

def test_pipeline():
    pdf_path = "../test-contracts/saas_subscription.pdf"
    
    print("1. Extracting text and sections...")
    full_text, meta = extract_text_and_sections(pdf_path)
    print(f"Extracted {len(meta)} lines with meta.")
    
    print("\n2. Chunking into sections...")
    sections = chunk_into_sections(meta)
    print(f"Found {len(sections)} sections.")
    
    print("\n3. Extracting clause data (using mock if no Groq key)...")
    for sec in sections:
        if sec["text"].strip():
            print(f"\n--- Section: {sec['section_ref']} ---")
            print(f"Text snippet: {sec['text'][:50]}...")
            extracted = extract_clause_data(sec["text"])
            print("Extracted Data:", extracted)

if __name__ == "__main__":
    test_pipeline()
