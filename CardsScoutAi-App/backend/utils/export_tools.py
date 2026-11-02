# utils/export_tools.py
import re
import urllib.parse
from fpdf import FPDF

def sanitize_for_pdf(text):
    """
    Cleans markdown characters, currency symbols, and strips unsupported unicode/emojis
    to ensure Helvetica renders cleanly in Latin-1.
    """
    if not text:
        return ""
    
    # Force convert known problem characters directly to ASCII equivalents
    text = text.replace("₹", "Rs. ").replace('₹', 'Rs. ')
    
    # Handle smart quotes, bullet points, and dashes
    replacements = {
        "•": "-", "—": "-", "–": "-", 
        '“': '"', '”': '"', "‘": "'", "’": "'",
        "\u20B9": "Rs. ", "\u2022": "-", "\u2014": "-", "\u2013": "-"
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Safely remove markdown dividers and bold tags
    text = re.sub(r'^[ \t]*[-*_]{3,}[ \t]*$', '', text, flags=re.MULTILINE)
    text = text.replace("**", "").replace("__", "")
    text = re.sub(r'#{1,6}\s*', '', text)
    
    # Strip ALL remaining characters outside the Latin-1 range
    # Ignore errors so it just silently deletes any leftover emojis or weird symbols
    sanitized = text.encode("latin-1", "ignore").decode("latin-1")
    return sanitized

def render_markdown_table(pdf, table_rows):
    """
    Renders buffered markdown table rows as a properly dimensioned, styled table.
    """
    if not table_rows:
        return
        
    max_cols = max(len(r) for r in table_rows)
    if max_cols < 2:
        return

    # Pad rows so every row has max_cols
    norm_rows = []
    for r in table_rows:
        padded = r + [""] * (max_cols - len(r))
        norm_rows.append([c.strip() for c in padded])

    pdf.set_x(15)
    pdf.ln(1)

    try:
        # Calibrated column widths totaling 180 mm (A4 210mm - 30mm margins)
        if max_cols == 5:
            col_widths = (14, 46, 36, 44, 40)
        elif max_cols == 4:
            col_widths = (20, 55, 50, 55)
        elif max_cols == 3:
            col_widths = (30, 75, 75)
        else:
            col_widths = tuple([180.0 / max_cols] * max_cols)

        pdf.set_font("helvetica", size=7.5)
        with pdf.table(
            col_widths=col_widths,
            line_height=4.5,
            text_align="LEFT",
            padding=(1.5, 1.5, 1.5, 1.5)
        ) as table:
            for idx, r in enumerate(norm_rows):
                row = table.row()
                if idx == 0:
                    pdf.set_font("helvetica", "B", 7.5)
                    pdf.set_text_color(255, 255, 255)
                    for cell in r:
                        row.cell(cell, fill_color=(13, 50, 86))  # Navy blue header
                else:
                    pdf.set_font("helvetica", "", 7.2)
                    pdf.set_text_color(30, 41, 59)
                    bg = (241, 245, 249) if idx % 2 == 1 else (255, 255, 255)
                    for cell in r:
                        row.cell(cell, fill_color=bg)
        pdf.ln(3)

    except Exception:
        # Fallback: Render as clean structured summary cards if table engine has any issue
        headers = norm_rows[0]
        for row in norm_rows[1:]:
            pdf.set_x(15)
            title = f"{row[0]}. {row[1]}" if len(row) > 1 else row[0]
            pdf.set_font("helvetica", "B", 9)
            pdf.set_text_color(13, 50, 86)
            
            # THE FIXED LINE:
            pdf.cell(0, 5, title, ln=1)
            
            pdf.set_font("helvetica", "", 8.5)
            pdf.set_text_color(71, 85, 105)
            specs = [f"{h}: {val}" for h, val in zip(headers[2:], row[2:]) if val]
            if specs:
                pdf.set_x(18)
                pdf.multi_cell(0, 4.5, " | ".join(specs))
            pdf.ln(1.5)


def generate_pdf_report(user_name, report_text):
    """
    Renders an executive-formatted PDF report with structured tables and bullets.
    """
    try:
        clean_name = sanitize_for_pdf(user_name)
        # Apply the sanitizer correctly to the incoming report_text
        clean_text = sanitize_for_pdf(report_text)
        
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.set_margins(15, 15, 15)
        pdf.add_page()
        
        # Header
        pdf.set_font("helvetica", "B", 18)
        pdf.set_text_color(13, 50, 86)
        pdf.cell(0, 10, "CardScout AI: Strategic Card Roadmap", align="C")
        pdf.set_x(15)
        pdf.ln(10)
        
        # Sub-header
        pdf.set_font("helvetica", "I", 10)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, f"Personalized Yield & Optimization Report for {clean_name}", align="C")
        pdf.set_x(15)
        pdf.ln(8)

        # Divider Line
        pdf.set_draw_color(6, 182, 212)
        pdf.set_line_width(0.6)
        pdf.line(15, pdf.get_y(), 195, pdf.get_y())
        pdf.ln(6)

        # Body Parsing
        lines = clean_text.split('\n')
        table_buffer = []

        for raw_line in lines:
            line = raw_line.strip()

            # Buffer table rows
            if line.count('|') >= 2:
                if '---' in line:
                    continue
                cells = [c.strip() for c in line.strip('|').split('|')]
                if any(cells):
                    table_buffer.append(cells)
                continue

            # Flush table buffer if current line is not part of a table
            if table_buffer:
                render_markdown_table(pdf, table_buffer)
                table_buffer = []

            # Ignore empty lines or stray divider characters
            if not line or line in ['*', '-', '_', '•']:
                pdf.ln(2)
                continue

            pdf.set_x(15)

            # Section Titles / Main Headings
            if any(line.startswith(prefix) for prefix in [
                "Top 5", "1.", "2.", "3.", "4.", "5.", "Strategic", 
                "Financial Advisor", "Detailed Card"
            ]):
                pdf.ln(3)
                pdf.set_font("helvetica", "B", 11)
                pdf.set_text_color(13, 50, 86)
                pdf.multi_cell(0, 6, line)
                pdf.set_font("helvetica", "", 10)
                pdf.set_text_color(30, 41, 59)

            # Bullet Points
            elif line.startswith("-") or line.startswith("*"):
                bullet_text = line.lstrip("-* ").strip()
                if bullet_text:
                    pdf.set_font("helvetica", "", 10)
                    pdf.set_text_color(30, 41, 59)
                    pdf.multi_cell(0, 5, f"  * {bullet_text}")

            # Standard Paragraphs
            else:
                pdf.set_font("helvetica", "", 10)
                pdf.set_text_color(30, 41, 59)
                pdf.multi_cell(0, 5.5, line)

        # Flush any trailing table at the end of the text
        if table_buffer:
            render_markdown_table(pdf, table_buffer)
            table_buffer = []

        # МӘҢГЕЛЕК КАРАР:
        return pdf.output(dest="S").encode("latin-1", "replace")

    except Exception as e:
        print(f"PDF Generator Error: {e}")
        try:
            fallback_pdf = FPDF(orientation="P", unit="mm", format="A4")
            fallback_pdf.set_margins(15, 15, 15)
            fallback_pdf.add_page()
            fallback_pdf.set_font("helvetica", "", 10)
            fallback_pdf.multi_cell(0, 6, sanitize_for_pdf(report_text))
            
            # МӘҢГЕЛЕК КАРАР (Fallback өчен):
            return fallback_pdf.output(dest="S").encode("latin-1", "replace")
        except Exception:
            return None


def get_share_links(user_profile_type, deployment_url="https://cardscout-advanced.streamlit.app/"):
    share_text = f"Check out my Credit Card Finder & Manager on CardScout! Profile: {user_profile_type}. App: {deployment_url}"
    whatsapp_url = f"https://wa.me/?text={urllib.parse.quote(share_text)}"
    mail_subject = urllib.parse.quote("My CardScout AI Financial Roadmap")
    mail_body = urllib.parse.quote(share_text)
    mail_url = f"mailto:?subject={mail_subject}&body={mail_body}"
    return deployment_url, whatsapp_url, mail_url