import pymupdf
import re

def extract_text_and_sections(pdf_path: str):
    """
    Extracts text from a PDF and attempts to identify section headers.
    Returns the raw full text and a list of structured sections.
    """
    doc = pymupdf.open(pdf_path)
    full_text = ""
    
    # Regex to catch: 
    # "1. ", "1.1 ", "ARTICLE I", "Section 4", "SECTION 4"
    section_pattern = re.compile(r'^(?:ARTICLE\s+[IVX]+|SECTION\s+\d+|[0-9]+(?:\.[0-9]+)*\.)', re.IGNORECASE)
    
    lines_with_meta = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        full_text += text + "\n"
        
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            is_header = bool(section_pattern.match(line))
            lines_with_meta.append({
                "text": line,
                "is_header": is_header,
                "page": page_num + 1
            })
            
    doc.close()
    return full_text, lines_with_meta
