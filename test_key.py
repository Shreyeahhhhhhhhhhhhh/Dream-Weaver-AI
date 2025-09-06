# test_key.py
import os
from dotenv import load_dotenv

load_dotenv() # Read the .env file

api_key = os.getenv("OPENAI_API_KEY")

if api_key:
    print("✅ Success! Your API key was loaded correctly.")
    print(f"   Your key starts with: {api_key[:5]}...")
else:
    print("❌ Error: Could not find the OPENAI_API_KEY.")
    print("   Please check the location and content of your .env file.")