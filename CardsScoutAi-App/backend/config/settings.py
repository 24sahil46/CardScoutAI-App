# config/settings.py
import os
import re
from dotenv import load_dotenv

def load_environment():
    """Loads environment variables and collects all API keys safely."""
    # Dynamically calculate the absolute path to api.env in the root folder
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(root_dir, "api.env")
    
    # Load from this exact absolute path
    load_dotenv(dotenv_path=env_path)
    
    # 1. Grab raw Tavily Key (which accidentally includes the Database URL due to the trailing slash)
    raw_tavily = os.getenv("TAVILY_API_KEY", "")
    
    # 2. SMART EXTRACTION: Use regex to extract ONLY the exact 'tvly-...' key, ignoring merged lines
    tavily_match = re.search(r'(tvly-[a-zA-Z0-9\-_]+)', raw_tavily)
    tavily_key = tavily_match.group(1) if tavily_match else raw_tavily.strip()
    
    # Collect all available Gemini keys directly from your custom names
    raw_gemini_keys = [
        os.getenv("GEMINI_API_KEY_1", ""),
        os.getenv("GEMINI_API_KEY_2", ""),
        os.getenv("GEMINI_API_KEY_3", ""),
        os.getenv("GEMINI_API_KEY_4", ""),
        os.getenv("GEMINI_API_KEY_5", ""),
        os.getenv("GEMINI_API_KEY_6", ""), # <-- ADDED YOUR 6TH KEY!
        os.getenv("GEMINI_API_KEY_7", ""), # Added extra slots for future-proofing
        os.getenv("GEMINI_API_KEY_8", ""),
        os.getenv("GEMINI_API_KEY_9", ""),
        os.getenv("GEMINI_API_KEY_10", ""),
        os.getenv("GEMINI_API_KEY", "") 
    ]
    
    # Clean keys just in case they have invisible slashes or newlines too
    valid_gemini_keys = []
    for k in raw_gemini_keys:
        if k:
            clean_k = k.split('\n')[0].replace('\\', '').strip()
            if clean_k:
                valid_gemini_keys.append(clean_k)
    
    if not tavily_key or not valid_gemini_keys:
        print(f"⚠️ Warning: Missing critical API keys in {env_path}")
        
    return {
        "TAVILY_API_KEY": tavily_key,
        "GEMINI_API_KEYS": valid_gemini_keys
    }

APP_SETTINGS = load_environment()