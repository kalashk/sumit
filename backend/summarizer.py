# Example using LangChain (backend/summarizer.py)
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import google.generativeai as genai
from langchain_core.language_models import LLM
from langchain_core.outputs import Generation, LLMResult
from typing import List, Optional
import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import ClassVar

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
# Choose your LLM integration based on Qwen/DeepSeek access
# Example using a generic placeholder - REPLACE with your actual LLM setup
# from langchain_community.llms import Ollama # If using Ollama locally
# llm = Ollama(model="qwen") # Or "deepseek-coder", etc. - Make sure model is pulled in Ollama

# --- Replace with your actual LLM setup ---
# This is a placeholder - you MUST configure your specific LLM connection
# e.g., using Tongyi for Qwen API, or Ollama for local models
# class PlaceholderLLM(BaseLLM): # Define a dummy LLM if you don't have one setup yet for testing structure
#     def _call(self, prompt, stop=None, run_manager=None, **kwargs):
#         if "summary" in prompt.lower():
#             return "This is a placeholder summary. Key decisions were made about Project X."
#         elif "action items" in prompt.lower():
#             return "ACTION: John Doe to finalize report by Friday.\nACTION: Team to review proposal next week."
#         return "LLM Placeholder Response"
#     @property
#     def _llm_type(self) -> str:
#         return "placeholder"
# class GeminiLLM(BaseLLM):
#     def __init__(self):
#         self.model = genai.GenerativeModel("gemini-pro")

#     def _call(self, prompt: str, stop=None, run_manager=None, **kwargs):
#         response = self.model.generate_content(prompt)
#         return response.text

#     @property
#     def _llm_type(self) -> str:
#         return "gemini"

class GeminiLLM(LLM):
    model: ClassVar = genai.GenerativeModel("gemini-pro")

    def _call(self, prompts: List[str], stop: Optional[List[str]] = None) -> LLMResult:
        generations = []
        for prompt in prompts:
            response = self.model.generate_content(prompt)
            generations.append([Generation(text=response.text)])
        
        return LLMResult(generations=generations)

    @property
    def _llm_type(self) -> str:
        return "gemini-llm"

llm = GeminiLLM()# Replace with your actual llm = YourQwenOrDeepSeekLLM(...)
# --- End LLM Placeholder ---


def generate_summary_and_actions(transcript: str) -> tuple[str, list[str]]:
    # --- Summarization Chain ---
    summary_template = """
    You are an expert meeting summarizer. Given the following transcript of a meeting (which may contain English, Mandarin, and Cantonese), create a concise, neutral summary covering the key points, discussions, and decisions. Structure the summary logically.

    Transcript:
    {transcript}

    Concise Summary:
    """
    summary_prompt = PromptTemplate(template=summary_template, input_variables=["transcript"])
    summary_chain = LLMChain(llm=llm, prompt=summary_prompt)

    # --- Action Item Chain ---
    action_template = """
    You are an expert in identifying action items from meeting transcripts. Analyze the following transcript (which may contain English, Mandarin, and Cantonese) and extract all specific action items. List each action item clearly, mentioning the task and, if possible, the assigned person and deadline. If no action items are found, state that clearly.

    Format each action item starting with "ACTION: ".

    Transcript:
    {transcript}

    Action Items:
    """
    action_prompt = PromptTemplate(template=action_template, input_variables=["transcript"])
    action_chain = LLMChain(llm=llm, prompt=action_prompt)

    # --- Run Chains ---
    print("Generating summary...")
    summary_result = summary_chain.invoke({"transcript": transcript}) # Use invoke for newer LangChain versions
    summary_text = summary_result['text'].strip()
    print("Generating action items...")
    action_result = action_chain.invoke({"transcript": transcript})
    action_text = action_result['text'].strip()

    # --- Process Action Items ---
    action_items = [line.strip() for line in action_text.split('\n') if line.strip().upper().startswith("ACTION:")]
    if not action_items and "no action items" not in action_text.lower():
         # Handle cases where the LLM didn't format correctly but found actions
         if action_text.strip(): # If there's any output, maybe treat it as a single action if format failed
             print("Warning: Action item extraction might have failed format. Treating output as text.")
             # action_items = [action_text] # Decide how to handle this, maybe log a warning
             pass # Or just leave it empty if format is strict

    print("Summarization complete.")
    return summary_text, action_items