# backend/pdf_generator.py
from fpdf import FPDF
import os
from datetime import datetime

# --- Font Setup (CRUCIAL for CJK characters) ---
# 1. Download a suitable TTF font (e.g., Noto Sans CJK)
# 2. Place it in your project (e.g., backend/fonts/NotoSansCJKsc-Regular.ttf)
FONT_DIR = os.path.join(os.path.dirname(__file__), 'fonts')
CJK_FONT_PATH = os.path.join(FONT_DIR, "NotoSansCJKsc-Regular.ttf") # Adjust filename

# --- Make sure the font directory exists ---
# os.makedirs(FONT_DIR, exist_ok=True)
# You need to manually download and place the font file here!
# Search: "Download Noto Sans CJK"

PDF_OUTPUT_DIR = "temp_pdf"
os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)


class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Meeting Notes Report', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
         # Use CJK font for titles that might contain CJK
        if os.path.exists(CJK_FONT_PATH):
             self.add_font('NotoSansCJK', '', CJK_FONT_PATH, uni=True)
             self.set_font('NotoSansCJK', '', 14)
        else:
             self.set_font('Arial', 'B', 14) # Fallback
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(5)

    def chapter_body(self, body):
         # Use CJK font for the body content
        if os.path.exists(CJK_FONT_PATH):
             # self.add_font('NotoSansCJK', '', CJK_FONT_PATH, uni=True) # Already added in title potentially
             self.set_font('NotoSansCJK', '', 12)
        else:
             self.set_font('Times', '', 12) # Fallback
        self.multi_cell(0, 5, body) # Use multi_cell for wrapping
        self.ln()


def create_report(meeting_data: dict) -> str:
    pdf = PDF()
    pdf.add_page()

    # --- Basic Info ---
    pdf.chapter_title(f"Meeting: {meeting_data.get('filename', 'N/A')}")
    timestamp = meeting_data.get('timestamp')
    if isinstance(timestamp, str):
         try:
              # Attempt to parse if it's a string like 'YYYY-MM-DD HH:MM:SS.ffffff'
             timestamp_dt = datetime.fromisoformat(timestamp.split('.')[0]) # Handle potential microseconds
             formatted_time = timestamp_dt.strftime('%Y-%m-%d %H:%M')
         except ValueError:
              formatted_time = timestamp # Use as is if parsing fails
    elif isinstance(timestamp, datetime):
        formatted_time = timestamp.strftime('%Y-%m-%d %H:%M')
    else:
        formatted_time = "N/A"

    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, f"Date: {formatted_time}", 0, 1)
    pdf.ln(5)

    # --- Summary ---
    pdf.chapter_title("Summary")
    pdf.chapter_body(meeting_data.get('summary', 'No summary available.'))

    # --- Action Items ---
    pdf.chapter_title("Action Items")
    action_items = meeting_data.get('action_items', [])
    if action_items:
        body_text = "\n".join([f"- {item}" for item in action_items])
    else:
        body_text = "No action items identified."
    pdf.chapter_body(body_text)

    # --- Optional: Full Transcript (Comment out if too long) ---
    # pdf.add_page() # Add new page for transcript
    # pdf.chapter_title("Full Transcript")
    # pdf.chapter_body(meeting_data.get('transcript', 'Transcript not available.'))

    # --- Save PDF ---
    output_filename = f"meeting_report_{meeting_data['id']}.pdf"
    output_path = os.path.join(PDF_OUTPUT_DIR, output_filename)
    try:
        pdf.output(output_path, "F")
        print(f"PDF generated: {output_path}")
        return output_path
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise

# --- Add cleanup for temp PDF files ---
import atexit
import shutil
def cleanup_temp_pdf():
    if os.path.exists(PDF_OUTPUT_DIR):
        print(f"Cleaning up temporary PDF directory: {PDF_OUTPUT_DIR}")
        shutil.rmtree(PDF_OUTPUT_DIR)
atexit.register(cleanup_temp_pdf)