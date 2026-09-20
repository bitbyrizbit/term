from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import io

def sanitize(text):
    if not isinstance(text, str):
        return str(text)
    # Replace unicode dashes/hyphens with ASCII hyphen
    text = text.replace('\u2010', '-').replace('\u2011', '-').replace('\u2012', '-').replace('\u2013', '-').replace('\u2014', '-')
    # Replace smart quotes with straight quotes
    text = text.replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
    # Replace unicode space/bullet with standard chars
    text = text.replace('\u2022', '*').replace('\u25a0', '-').replace('\u00a0', ' ')
    return text

def generate_pdf_report(contract_title: str, risks: list, diff_changes: list = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    h2_style = styles['Heading2']
    normal_style = styles['Normal']
    
    elements = []
    
    # Title
    elements.append(Paragraph(f"TERM Contract Risk Report", title_style))
    elements.append(Paragraph(f"Document: {contract_title}", h2_style))
    elements.append(Spacer(1, 20))
    
    # Risk Radar Section
    elements.append(Paragraph("Risk Radar Overview", h2_style))
    
    data = [["Category", "Status", "Justification", "Next Action", "Source"]]
    
    for r in risks:
        status = r.get("status", "Green")
        status_color = colors.green if status == "Green" else (colors.orange if status == "Yellow" else colors.red)
        
        row = [
            Paragraph(sanitize(r.get("category", "")), normal_style),
            Paragraph(f"<font color='{status_color}'><b>{status}</b></font>", normal_style),
            Paragraph(sanitize(r.get("justification", "")), normal_style),
            Paragraph(sanitize(r.get("next_action", "")), normal_style),
            Paragraph(sanitize(r.get("source_ref", "")), normal_style)
        ]
        data.append(row)
        
    t = Table(data, colWidths=[80, 50, 150, 150, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN',(0,0),(-1,-1),'TOP')
    ]))
    
    elements.append(t)
    elements.append(Spacer(1, 30))
    
    # Optional Diff Section
    if diff_changes:
        elements.append(Paragraph("Version Impact Analysis", h2_style))
        for change in diff_changes:
            if change.get("is_material"):
                elements.append(Paragraph(f"<b>Material Change in {change.get('new_ref')}</b>", normal_style))
                elements.append(Paragraph(f"Reason: {change.get('reasoning')}", normal_style))
                impacts = change.get("impact", [])
                if impacts:
                    impact_str = ", ".join([i.get("action") for i in impacts])
                    elements.append(Paragraph(f"Affected Obligations: {impact_str}", normal_style))
                elements.append(Spacer(1, 10))
                
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

