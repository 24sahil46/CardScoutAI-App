from core.ai_agent import (
    fetch_live_card_offers, 
    get_hidden_milestones, 
    get_forex_markup, 
    get_reward_point_values, 
    get_fee_and_penalty_audit,
    get_fee_waiver_target
)
from fastapi import FastAPI, HTTPException
import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi import Request
from fpdf import FPDF
from fastapi.responses import FileResponse
import tempfile
import os
from core.ai_agent import generate_with_resilience
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.ai_agent import (
    generate_card_roadmap, 
    get_fee_waiver_target, 
    get_forex_markup, 
    get_copilot_verdict,
    fetch_live_card_offers, 
    get_hidden_milestones, 
    get_utility_cashback_rate,
    get_reward_point_values, 
    get_fee_and_penalty_audit, 
    generate_battle_analysis
)
from core.db_manager import (
    create_user, verify_user, 
    add_wallet_card, remove_wallet_card, update_wallet_limit, get_wallet_cards,
    add_subscription, get_subscriptions, delete_subscription, update_subscription_card
)

app = FastAPI(title="CardScout API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    name: str
    age: int
    occ: str
    income: int
    credit: str

# New Pydantic model for Authentication
class AuthRequest(BaseModel):
    username: str
    password: str

@app.post("/api/register")
async def register_user(req: AuthRequest):
    success = create_user(req.username, req.password)
    if success:
        return {"status": "success", "message": "Commander account created."}
    raise HTTPException(status_code=400, detail="Username already exists.")

@app.post("/api/login")
async def login_user(req: AuthRequest):
    is_valid = verify_user(req.username, req.password)
    if is_valid:
        return {"status": "success", "message": "Vault Breached successfully."}
    raise HTTPException(status_code=401, detail="Invalid Commander ID or Security Clearance.")

@app.post("/api/generate-roadmap")
async def get_roadmap(user: UserProfile):
    try:
        user_data = user.model_dump()
        roadmap_data = generate_card_roadmap(user_data)
        
        if "error" in roadmap_data:
            raise Exception(roadmap_data["error"])
            
        return {"status": "success", "data": roadmap_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    
class SubscriptionRequest(BaseModel):
    username: str
    service_name: str
    monthly_cost: float
    card_used: str

class SubscriptionDeleteRequest(BaseModel):
    username: str
    service_name: str
    card_used: str

class SubscriptionUpdateRequest(BaseModel):
    username: str
    service_name: str
    new_card: str

@app.get("/api/subscriptions/{username}")
async def fetch_subscriptions(username: str):
    subs = get_subscriptions(username)
    formatted_subs = [
        {"service_name": s[0], "monthly_cost": s[1], "card_used": s[2]} 
        for s in subs
    ]
    return {"status": "success", "subscriptions": formatted_subs}

@app.post("/api/subscriptions/add")
async def create_subscription(req: SubscriptionRequest):
    try:
        add_subscription(req.username, req.service_name, req.monthly_cost, req.card_used)
        return {"status": "success", "message": f"{req.service_name} added to tracker."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/subscriptions/remove")
async def remove_subscription(req: SubscriptionDeleteRequest):
    try:
        delete_subscription(req.username, req.service_name, req.card_used)
        return {"status": "success", "message": f"{req.service_name} removed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/subscriptions/update")
async def update_subscription(req: SubscriptionUpdateRequest):
    try:
        update_subscription_card(req.username, req.service_name, req.new_card)
        return {"status": "success", "message": f"{req.service_name} card updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# --- PHASE 2: AI ENGINE REQUEST MODELS ---
class CardNameRequest(BaseModel):
    card_name: str

class CopilotRequest(BaseModel):
    query: str
    wallet_context: str

class UtilityRequest(BaseModel):
    card_name: str
    services: str

# --- ENGINE ENDPOINTS ---
@app.post("/api/engine/fee-waiver")
async def api_fee_waiver(req: CardNameRequest):
    try:
        target = get_fee_waiver_target(req.card_name)
        return {"status": "success", "target": target}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/engine/live-offers")
async def api_live_offers(req: CardNameRequest):
    try:
        html = fetch_live_card_offers(req.card_name)
        return {"status": "success", "html": html}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/engine/milestones")
async def api_milestones(req: CardNameRequest):
    try:
        html = get_hidden_milestones(req.card_name)
        return {"status": "success", "html": html}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/engine/forex")
async def api_forex(req: CardNameRequest):
    try:
        markup = get_forex_markup(req.card_name)
        return {"status": "success", "markup": markup}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/engine/rewards")
async def api_rewards(req: CardNameRequest):
    try:
        values = get_reward_point_values(req.card_name)
        return {"status": "success", "values": values}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/engine/penalties")
async def api_penalties(req: CardNameRequest):
    try:
        audit = get_fee_and_penalty_audit(req.card_name)
        return {"status": "success", "audit": audit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/engine/copilot")
async def api_copilot(req: CopilotRequest):
    try:
        verdict = get_copilot_verdict(req.query, req.wallet_context)
        return {"status": "success", "verdict": verdict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    

import os
from supabase import create_client, Client
from pydantic import BaseModel
from fastapi import HTTPException

# 1. Initialize Supabase Client
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://thimytmmzvvjmmknhhry.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaW15dG1tenZ2am1ta25oaHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTEwMzI2MSwiZXhwIjoyMTA2Njc5MjYxfQ.A4g5jbzUHN31QWLNbGMry1TOUe8wGC8pwxsWZZo08kA") # Make sure your long key is pasted here

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class CardData(BaseModel):
    username: str
    card_name: str
    credit_limit: int

class LimitUpdate(BaseModel):
    credit_limit: int

# 2. Fetch Wallet for User
@app.get("/api/wallet/{username}")
async def get_wallet(username: str):
    try:
        response = supabase.table("wallet_cards").select("id, card_name, credit_limit").eq("username", username).execute()
        return {"status": "success", "cards": response.data}
    except Exception as e:
        print(f"Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3. Add New Card
@app.post("/api/wallet")
async def add_card(card: CardData):
    try:
        data = {
            "username": card.username,
            "card_name": card.card_name,
            "credit_limit": card.credit_limit
        }
        response = supabase.table("wallet_cards").insert(data).execute()
        new_id = response.data[0]['id'] if response.data else None
        return {"status": "success", "id": new_id}
    except Exception as e:
        print(f"Insert Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4. Update Card Limit
@app.put("/api/wallet/{card_id}")
async def update_limit(card_id: int, update: LimitUpdate):
    try:
        supabase.table("wallet_cards").update({"credit_limit": update.credit_limit}).eq("id", card_id).execute()
        return {"status": "success"}
    except Exception as e:
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 5. Delete Card
@app.delete("/api/wallet/{card_id}")
async def delete_card(card_id: int):
    try:
        supabase.table("wallet_cards").delete().eq("id", card_id).execute()
        return {"status": "success"}
    except Exception as e:
        print(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class EngineRequest(BaseModel):
    card_name: str

# Engine 1: Fee Waiver Target
@app.post("/api/engine/fee-waiver")
async def engine_fee_waiver(req: EngineRequest):
    try:
        target = get_fee_waiver_target(req.card_name)
        return {"status": "success", "target": target}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Engine 2: Live Offers
@app.post("/api/engine/live-offers")
async def engine_live_offers(req: EngineRequest):
    try:
        html_blocks = fetch_live_card_offers(req.card_name)
        return {"status": "success", "html": html_blocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Engine 3: Milestones
@app.post("/api/engine/milestones")
async def engine_milestones(req: EngineRequest):
    try:
        html_blocks = get_hidden_milestones(req.card_name)
        return {"status": "success", "html": html_blocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Engine 5: Forex
@app.post("/api/engine/forex")
async def engine_forex(req: EngineRequest):
    try:
        markup = get_forex_markup(req.card_name)
        return {"status": "success", "markup": markup}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Engine 6: Points
@app.post("/api/engine/points")
async def engine_points(req: EngineRequest):
    try:
        rates = get_reward_point_values(req.card_name)
        return {"status": "success", "rates": rates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Engine 7: Penalty Audit
@app.post("/api/engine/penalty")
async def engine_penalty(req: EngineRequest):
    try:
        audit = get_fee_and_penalty_audit(req.card_name)
        return {"status": "success", "audit": audit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/api/engine/copilot-chat")
async def copilot_routing(request: Request):
    data = await request.json()
    description = data.get("description", "")
    amount = data.get("amount", 0)
    wallet_matrix = data.get("wallet_matrix", [])
    
    # Format the wallet matrix for the AI prompt
    matrix_str = "\n".join([
        f"- {c['card_name']}: Limit ₹{c['limit']}, Projected Utilization: {c['projected_utilization']}% (CIBIL Safe: {c['is_cibil_safe']})" 
        for c in wallet_matrix
    ])
    
    prompt = f"""
    You are CardScout Co-Pilot, an elite AI financial routing advisor.
    The user wants to make this exact purchase: "{description}" for ₹{amount}.
    
    Here is the pre-computed mathematical matrix of their Digital Wallet if they put the full ₹{amount} on a single card:
    {matrix_str}
    
    Your instructions:
    1. REWARD MATCHING: Identify which card in their wallet offers the best category multiplier (e.g., shopping, travel, dining) for "{description}".
    2. CIBIL GUARDIAN RULE (STRICT): Check the "Projected Utilization" for that specific card. 
       - If it is under 30%, explicitly state "✅ CIBIL SAFE" and recommend putting the full amount on that card.
       - If it exceeds 30%, explicitly state "🚨 CIBIL UTILIZATION ALERT". You MUST advise them to SPLIT the payment across multiple cards in their wallet to ensure NO card exceeds 30%.
    
    Write a concise, 3-paragraph response to the user. Use HTML formatting (like <strong> for emphasis, and <span style="color:#ef4444"> for alerts). Do not use markdown blocks.
    """
    
    try:
        # Properly links to your AI Agent and API Keys
        response_text = generate_with_resilience(prompt)
        return {"status": "success", "recommendation": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/engine/battleground")
async def battleground_api(request: Request):
    try:
        data = await request.json()
        entered_card = data.get("entered_card", "Unknown Card")
        original_recommendation = data.get("original_recommendation", "Top Pick")
        user_data = data.get("user_data", {})
        
        html_response = generate_battle_analysis(entered_card, original_recommendation, user_data)
        
        return {"status": "success", "html": html_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export-pdf")
async def export_pdf(request: Request):
    try:
        data = await request.json()
        
        pdf = FPDF()
        pdf.add_page()
        
        import re
        import textwrap

        # TANK-ARMORED SANITIZER (Bypasses FPDF wrapping completely)
        def sanitize(text, max_width=95):
            if not text: 
                return ""
            text = str(text)
            
            # Clean HTML and formatting
            text = re.sub(r'<[^>]+>', ' ', text)
            text = text.replace("₹", "Rs. ").replace("—", "-").replace("–", "-")
            text = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
            text = text.encode('ascii', 'ignore').decode('ascii')
            text = re.sub(r'\s+', ' ', text).strip()
            
            # Force Python to break the lines so FPDF doesn't have to guess and crash
            return '\n'.join(textwrap.wrap(text, width=max_width, break_long_words=True))

        # --- TITLE ---
        pdf.set_font("helvetica", "B", 18)
        pdf.multi_cell(0, 10, "CardScout AI: Strategic Card Roadmap")
        pdf.ln(2)
        
        pdf.set_font("helvetica", "B", 12)
        pdf.set_text_color(100, 100, 100)
        user_name = sanitize(data.get('name', 'User'), 50).replace('\n', '')
        pdf.multi_cell(0, 8, f"Personalized Yield & Optimization Report for {user_name}")
        pdf.ln(5)
        
        # --- NARRATIVE ---
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("helvetica", "", 10)
        narrative_clean = sanitize(data.get("narrative", ""), 100)
        pdf.multi_cell(0, 6, narrative_clean)
        pdf.ln(10)
        
        # --- TOP 5 PODIUM ---
        pdf.set_font("helvetica", "B", 14)
        pdf.multi_cell(0, 10, "1. Top 5 Podium Recommendations")
        pdf.ln(2)
        
        cards = data.get("cards", [])
        for i, c in enumerate(cards):
            pdf.set_font("helvetica", "B", 11)
            card_name = sanitize(c.get('name', 'Card'), 80).replace('\n', '')
            pdf.multi_cell(0, 8, f"{i+1}. {card_name}")
            
            pdf.set_font("helvetica", "", 9)
            sub = c.get('sub', '')
            why = c.get('why', '')
            fee = c.get('fee', '')
            
            details = f"Card Type: {sub} | Primary Benefit: {why} | Annual Fee: {fee}"
            # Sanitize the full combined string
            details_clean = sanitize(details, 105)
            pdf.multi_cell(0, 5, details_clean)
            pdf.ln(4)
            
        # --- DETAILED BREAKDOWN ---
        pdf.ln(5)
        pdf.set_font("helvetica", "B", 12)
        pdf.multi_cell(0, 10, "Detailed Card Breakdown:")
        pdf.ln(2)
        
        for i, c in enumerate(cards):
            pdf.set_font("helvetica", "B", 11)
            card_name = sanitize(c.get('name', 'Card'), 80).replace('\n', '')
            pdf.multi_cell(0, 8, f"{i+1}. {card_name}")
            
            pdf.set_font("helvetica", "", 9)
            reward = sanitize(c.get('reward_desc', ''), 100)
            why = sanitize(c.get('why', ''), 100)
            
            pdf.multi_cell(0, 5, f"* Rewards & Benefits:\n{reward}")
            pdf.multi_cell(0, 5, f"* Why it fits you:\n{why}")
            pdf.ln(6)
            
        import tempfile
        from fastapi.responses import FileResponse
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(temp_file.name)
        
        # Strip spaces from filename
        safe_filename = user_name.replace(" ", "_")
        return FileResponse(temp_file.name, media_type="application/pdf", filename=f"CardScout_{safe_filename}.pdf")

    except Exception as e:
        print("PDF Error:", str(e))
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))