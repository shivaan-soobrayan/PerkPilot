
# ==========================================
# PERKPILOT - AI LOYALTY ADVISOR
# Python FastAPI Backend
# ==========================================

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from google import genai
from google.genai import types


# INITIALISE APPLICATION

app = FastAPI(
    title="PerkPilot AI",
    version="1.0.0"
)


# LOCAL DEVELOPMENT CONNECTIONS

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "null",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://shivaan-soobrayan.github.io"   
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"]
)


# AI CONFIGURATION

MODEL_NAME = "gemini-3.5-flash-lite"


# LOYALTY PROGRAMME KNOWLEDGE

LOYALTY_KNOWLEDGE = """
PerkPilot helps South African customers discover
loyalty and rewards programmes.

Programmes to consider:

1. Ster-Kinekor SK Club
   Category: Movies and entertainment.
   Explore cinema rewards and member benefits.

2. Discovery Vitality
   Categories: Fitness, movies, groceries and travel.
   Eligibility and paid membership requirements apply.

3. Clicks ClubCard
   Category: Health, beauty and shopping.
   Explore points and qualifying cashback rewards.

4. Pick n Pay Smart Shopper
   Category: Groceries.
   Explore shopping points and member offers.

5. Checkers Xtra Savings
   Category: Groceries.
   Explore eligible product discounts.

6. Spur Family Club
   Category: Food and dining.
   Explore qualifying restaurant rewards.

7. Starbucks Rewards
   Category: Food and beverages.
   Explore Stars and eligible rewards.

8. SAA Voyager
   Category: Travel.
   Explore earning and redeeming miles.

These are examples, not a verified live offer feed.
Current benefits, fees and eligibility must be
confirmed with the official programme providers.
"""


SYSTEM_PROMPT = f"""
You are PerkPilot AI, a friendly and professional
South African loyalty programme advisor.

Your mission is to help customers identify suitable
loyalty programmes based on their needs and wants.

Rules:
- Be conversational, helpful and clear.
- Use South African rand (ZAR) when discussing money.
- Ask relevant questions about interests and budget.
- Recommend programmes suited to customer preferences.
- Explain why each programme is suitable.
- Compare advantages and possible limitations.
- Distinguish free and paid memberships.
- Never invent discounts, prices or savings figures.
- Do not claim to check live offers.
- Explain uncertainty about changing benefits.
- Encourage verification through official providers.
- Do not request passwords, banking details or IDs.
- Keep answers concise and easy to understand.

Programme reference information:
{LOYALTY_KNOWLEDGE}
"""


# REQUEST FORMAT

class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=1500
    )


# SERVER HEALTH CHECK

@app.get("/health")
def health():
    return {
        "status": "online",
        "application": "PerkPilot AI",
        "model": MODEL_NAME
    }


# AI CHAT ENDPOINT

@app.post("/chat")
def chat(request: ChatRequest):

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is not configured."
        )

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4,
                max_output_tokens=500
            )
        )

        return {
            "reply": response.text or (
                "Sorry, I couldn't generate a response. "
                "Please try again."
            )
        }

    except Exception as error:

        print(
            "AI request error:",
            type(error).__name__
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "The AI service is unavailable. "
                "Please try again later."
            )
        )

    finally:
        if "client" in locals():
            client.close()
