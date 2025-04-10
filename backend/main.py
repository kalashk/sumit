# backend/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
import database
import pdf_generator
from fastapi.responses import FileResponse
import asr
import summarizer


app = FastAPI()

# --- CORS Middleware (Allow frontend to talk to backend) ---
origins = [
    "http://localhost:5173", # Default Vite dev server port
    "http://localhost:3000", # Default Create React App port
    # Add your deployed frontend URL here if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Temporary Storage for Audio ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "temp_audio")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "Meeting Agent API is running"}

# --- Placeholder Endpoints (We'll implement these properly later) ---
@app.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    file_path = None
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        # ... (save file code) ...
        print(f"Received file: {file.filename}")

        transcript = asr.transcribe_audio(file_path)
        summary, action_items = summarizer.generate_summary_and_actions(transcript)

        # --- Store results (Step 5) ---
        meeting_id = database.save_meeting(
             filename=file.filename,
             transcript=transcript,
             summary=summary,
             action_items=action_items # Assuming save_meeting handles list to string conversion if needed
         )
        print(f"Meeting saved with ID: {meeting_id}")

        # Clean up the temporary audio file now that processing is done
        if file_path and os.path.exists(file_path):
            os.remove(file_path)

        return {
            "meeting_id": meeting_id,
            "filename": file.filename,
            "transcript_preview": transcript[:200] + "...", # Send only a preview
            "summary": summary,
            "action_items": action_items,
        }
    except Exception as e:
        print(f"An error occurred: {e}")
        # Clean up the uploaded file if an error occurs
        if file_path and os.path.exists(file_path):
             os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"An error occurred during processing: {str(e)}")
  

@app.get("/search")
async def search_transcripts_endpoint(query: str):
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    try:
         results = database.search_transcripts(query)
         return {"query": query, "results": results}
    except Exception as e:
         print(f"Error during search: {e}")
         raise HTTPException(status_code=500, detail="Error performing search")

# Get full details for a specific meeting (useful for frontend display before download)
@app.get("/download/{meeting_id}")
async def download_report_endpoint(meeting_id: str):
     pdf_path = None
     try:
         meeting_data = database.get_meeting(meeting_id)
         if not meeting_data:
             raise HTTPException(status_code=404, detail="Meeting not found")

         # Call PDF generation function
         pdf_path = pdf_generator.create_report(meeting_data)

         # Return PDF file response
         return FileResponse(
             path=pdf_path,
             media_type='application/pdf',
             filename=f"meeting_report_{meeting_id}.pdf"
         )
     except Exception as e:
         print(f"Error generating or sending download for {meeting_id}: {e}")
         # Clean up the generated PDF if an error occurs before sending
         if pdf_path and os.path.exists(pdf_path):
             os.remove(pdf_path)
         raise HTTPException(status_code=500, detail="Error preparing or sending download")
  
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)