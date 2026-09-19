from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os

styles = getSampleStyleSheet()
body_style = styles["Normal"]
heading_style = styles["Heading2"]
title_style = styles["Heading1"]

def create_pdf(filename, title, content_lines):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    story = []
    
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 12))
    
    for line in content_lines:
        if line.startswith("SECTION") or line.startswith("ARTICLE") or line[0].isdigit() and line[1] == ".":
            story.append(Paragraph(line, heading_style))
        else:
            story.append(Paragraph(line, body_style))
        story.append(Spacer(1, 12))
        
    doc.build(story)

vendor_msa = [
    "1. MASTER SERVICES AGREEMENT",
    "This Master Services Agreement is made between Acme Corp (Customer) and Globex Inc (Vendor).",
    "2. TERM AND TERMINATION",
    "2.1 This agreement shall commence on January 1, 2024 and run for an initial term of one year.",
    "2.2 Either party may terminate this agreement for convenience upon 30 days written notice.",
    "3. OBLIGATIONS AND SERVICE LEVELS",
    "3.1 Vendor agrees to maintain 99.9% uptime for all provided services.",
    "3.2 In the event of a breach of service levels, Customer must notify Vendor within 10 days of discovering the breach to claim service credits.",
    "3.3 Vendor shall provide a remediation plan no later than 5 business days after receiving a notice of breach from the Customer.",
    "4. PAYMENT TERMS",
    "4.1 Customer shall pay all undisputed invoices within 45 days of receipt.",
    "4.2 If Customer disputes an invoice, Customer must provide written notice of the dispute within 15 days of invoice receipt."
]

nda = [
    "ARTICLE I. CONFIDENTIALITY AGREEMENT",
    "This Non-Disclosure Agreement is entered into by and between Wayne Enterprises (Disclosing Party) and Stark Industries (Receiving Party).",
    "ARTICLE II. DEFINITION OF CONFIDENTIAL INFORMATION",
    "Confidential Information shall mean all non-public information disclosed by one party to the other.",
    "ARTICLE III. OBLIGATIONS OF RECEIVING PARTY",
    "The Receiving Party shall hold and maintain the Confidential Information in strictest confidence.",
    "Upon written request of the Disclosing Party, the Receiving Party must destroy all Confidential Information within 72 hours of receiving such request.",
    "ARTICLE IV. BREACH AND NOTIFICATION",
    "If the Receiving Party becomes legally compelled to disclose any Confidential Information, they must notify the Disclosing Party immediately.",
    "The Receiving Party shall promptly inform the Disclosing Party of any unauthorized access to Confidential Information within 24 hours of becoming aware of the incident."
]

saas = [
    "Section 1: SOFTWARE AS A SERVICE SUBSCRIPTION",
    "CloudSync (Vendor) agrees to provide secure cloud storage services to Pied Piper (Customer).",
    "Section 2: DATA SECURITY AND BREACH NOTIFICATION",
    "Vendor shall implement industry-standard security measures to protect Customer Data.",
    "In the event of a data breach compromising Customer Data, Vendor must notify Customer within 48 hours of confirming the breach.",
    "Customer shall change all administrative passwords immediately upon being notified of a breach.",
    "Section 3: RENEWAL AND CANCELLATION",
    "This agreement will auto-renew for successive one-year terms unless either party provides notice of non-renewal at least 60 days prior to the expiration of the current term.",
    "Section 4: SUPPORT AND MAINTENANCE",
    "Vendor will provide 24/7 technical support.",
    "If Vendor fails to resolve a Critical priority ticket within the agreed SLA, Vendor shall furnish a detailed Root Cause Analysis within 5 days of the ticket's resolution."
]

if __name__ == "__main__":
    create_pdf("vendor_msa.pdf", "Vendor Master Services Agreement", vendor_msa)
    create_pdf("nda.pdf", "Non-Disclosure Agreement", nda)
    create_pdf("saas_subscription.pdf", "SaaS Subscription Agreement", saas)
    print("Synthetic contracts generated.")
