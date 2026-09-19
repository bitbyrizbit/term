def chunk_into_sections(lines_with_meta):
    """
    Groups lines into clauses keyed by their section header.
    Returns a list of dicts: [{"section_ref": "...", "text": "..."}, ...]
    """
    sections = []
    current_section = "Preamble"
    current_text = []
    
    for item in lines_with_meta:
        line = item["text"]
        
        if item["is_header"]:
            # If we were building a section, save it
            if current_text:
                sections.append({
                    "section_ref": current_section,
                    "text": "\n".join(current_text).strip()
                })
            
            # The header line itself might contain the section ref (e.g. '8.2 Auto-renewal')
            parts = line.split()
            if len(parts) >= 2 and parts[0].upper() in ["SECTION", "ARTICLE"]:
                current_section = f"{parts[0]} {parts[1]}".replace(":", "")
            elif len(parts) > 1 and parts[0].replace('.', '').isalnum():
                current_section = parts[0]
            else:
                current_section = line[:30]  # Fallback short name
            
            current_text = [line]
        else:
            current_text.append(line)
            
    # Add the last section
    if current_text:
        sections.append({
            "section_ref": current_section,
            "text": "\n".join(current_text).strip()
        })
        
    return sections
