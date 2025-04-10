# Example using Whisper (backend/asr.py)
import whisper
import os

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "temp_audio")

# Load model once (can be moved to main app startup for efficiency)
# Choose model size based on accuracy/resource needs. 'medium' is a good balance.
# model = whisper.load_model("medium")
# Consider using faster-whisper for better performance on CPU/GPU
# pip install faster-whisper
# from faster_whisper import WhisperModel
# model = WhisperModel("medium", device="cpu", compute_type="int8") # Or "cuda", "float16" etc.

_model = None

def load_asr_model(model_name="medium"):
    global _model
    if _model is None:
        print(f"Loading Whisper model: {model_name}...")
        try:
            # Using faster-whisper example
            from faster_whisper import WhisperModel
            # Adjust device ("cuda", "cpu") and compute_type ("float16", "int8") based on your hardware
            _model = WhisperModel(model_name, device="cpu", compute_type="int8")
            print("Whisper model loaded.")
        except ImportError:
            print("faster-whisper not installed, trying original openai-whisper")
            _model = whisper.load_model(model_name)
            print("Original Whisper model loaded.")
        except Exception as e:
            print(f"Error loading Whisper model: {e}")
            raise e # Or handle gracefully
    return _model

def transcribe_audio(file_path: str) -> str:
    model = load_asr_model() # Ensure model is loaded
    if not model:
         raise Exception("ASR Model not loaded")
    if not os.path.exists(file_path):
         raise FileNotFoundError(f"Audio file not found: {file_path}")

    try:
        print(f"Transcribing {file_path}...")
        # For faster-whisper:
        if hasattr(model, 'transcribe'): # Check if it's faster-whisper model
             segments, info = model.transcribe(file_path, beam_size=5, language=None) # Auto-detect language
             print(f"Detected language: {info.language} ({info.language_probability:.2f})")
             transcript = "".join([segment.text for segment in segments])
        # For original openai-whisper:
        else:
             result = model.transcribe(file_path, language=None) # Auto-detect language
             transcript = result["text"]

        print("Transcription complete.")
        return transcript
    except Exception as e:
        print(f"Error during transcription: {e}")
        # Consider cleanup of the temp file here if needed
        raise # Re-raise the exception to be caught by FastAPI

# --- Add cleanup for temp audio files ---
import atexit
import shutil
def cleanup_temp_audio():
    if os.path.exists(UPLOAD_DIR):
        print(f"Cleaning up temporary audio directory: {UPLOAD_DIR}")
        shutil.rmtree(UPLOAD_DIR)
atexit.register(cleanup_temp_audio)