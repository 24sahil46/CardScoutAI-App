import os
import json
import re
import time
import google.generativeai as genai
from tavily import TavilyClient
from config.settings import APP_SETTINGS

# Initialize Tavily
tavily = TavilyClient(api_key=APP_SETTINGS["TAVILY_API_KEY"])

# Initialize Gemini Key Pool & Model Fallbacks
KEY_POOL = APP_SETTINGS["GEMINI_API_KEYS"]
current_key_index = 0
MODEL_FALLBACKS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash']

def get_gemini_model(model_name='gemini-3.5-flash-lite'):
    """Configures and returns the Gemini model using the current active key."""
    global current_key_index
    active_key = KEY_POOL[current_key_index]
    
    os.environ["GEMINI_API_KEY"] = active_key
    genai.configure(api_key=active_key)
    return genai.GenerativeModel(model_name)

def rotate_key():
    """Switches to the next available API key in the pool."""
    global current_key_index
    if len(KEY_POOL) > 1:
        current_key_index = (current_key_index + 1) % len(KEY_POOL)
        print(f"🔄 Switched to Gemini API Key #{current_key_index + 1}")
        return True
    return False

def generate_with_resilience(prompt):
    """Executes Gemini generation with automatic key rotation and model fallback."""
    for model_name in MODEL_FALLBACKS:
        attempts = 0
        max_attempts = max(len(KEY_POOL), 1)
        
        while attempts < max_attempts:
            try:
                model = get_gemini_model(model_name)
                response = model.generate_content(prompt)
                return response.text
            except Exception as e:
                err_lower = str(e).lower()
                is_quota = any(k in err_lower for k in ["429", "quota", "resourceexhausted", "resource_exhausted", "rate limit", "api_key_invalid"])
                is_model_err = any(k in err_lower for k in ["404", "not found", "not supported"])
                
                if is_model_err:
                    break
                
                if is_quota:
                    attempts += 1
                    rotate_key()
                    time.sleep(1)
                    continue
                
                raise e
                
    raise RuntimeError("All API keys and fallback models have reached their rate limit.")

def fetch_web_context(query, depth="basic", max_results=3):
    """Fetches real-time web context via Tavily."""
    return tavily.search(query=query, search_depth=depth, max_results=max_results)

def generate_card_roadmap(user_data):
    try:
        query = f"Best credit cards in India 2026 for {user_data.get('occ', 'professional')} with {user_data.get('income', 50000)} monthly income."
        web_data = fetch_web_context(query)
        
        prompt = f"""
        Act as an Expert Financial Advisor.
        User Profile: {user_data}
        Recent Web Data: {web_data}

        Analyze this profile and recommend the top 5 best credit cards. 
        You MUST return ONLY a valid JSON object. Do NOT wrap it in markdown blockticks.
        Format EXACTLY like this:
        {{
            "narrative": "A concise 2-paragraph financial strategy explaining why these cards were chosen based on their income and spend blueprint.",
            "cards": [
                {{
                    "name": "Exact Card Name",
                    "bank": "Bank Name",
                    "sub": "Category (e.g. Travel, Cashback)",
                    "net": "Visa",
                    "savings": "₹50,000",
                    "ret": "5.5%",
                    "yield": "₹60,000",
                    "fee": "₹2,500",
                    "forex": "2.0%",
                    "welc": "Welcome bonus text",
                    "cib": "750+",
                    "chan": "Online",
                    "steps": ["Step 1 to apply", "Step 2"],
                    "why": "Specific reason this card fits their profile."
                    "reward_desc": "<p><strong>Base Rewards:</strong> Details here...</p>",
                    "lounge_desc": "<p><strong>Domestic Lounge:</strong> Details here...</p>",
                    "milestone_desc": "<p><strong>Annual Waiver:</strong> Details here...</p>",
                    "fineprint_desc": "<p><strong>APR:</strong> Details here...</p>"
                }}
            ]
        }}
        Note: The 'cards' array MUST contain exactly 5 card objects.
        """
        text = generate_with_resilience(prompt)
        
        # EXTRACT JUST THE JSON BLOCK (Ignores conversational filler)
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            clean_json = match.group(0)
        else:
            clean_json = text.replace("```json", "").replace("```", "").strip()
            
        # NEW: Automatically remove trailing commas that crash the JSON parser
        clean_json = re.sub(r',\s*([\]}])', r'\1', clean_json)
            
        return json.loads(clean_json)
    except Exception as e:
        print("Roadmap Generation Error:", str(e))
        return {"error": str(e)}

def generate_battle_analysis(entered_card, original_recommendation, user_data):
    try:
        prompt = f"""
        Act as an Expert Financial Advisor.
        User Profile & Spends: {user_data}
        Card A (Our #1 Podium Pick): {original_recommendation}
        Card B (User's Chosen Challenger): {entered_card}
        
        Perform a brutal, honest peer-to-peer comparison between these two cards tailored strictly to the User Profile provided.
        Return ONLY valid HTML (no markdown blocks, no ```html wrappers).
        
        Structure your HTML exactly like this (use these exact inline styles):
        
        <p style="color: #e2e8f0; font-size: 0.9rem; line-height: 1.6; margin-bottom: 20px;">Here is a clear and concise comparison between your #1 podium recommendation (<strong>{original_recommendation}</strong>) and the <strong>{entered_card}</strong>, tailored specifically to your financial profile.</p>
        
        <h4 style="color: white; font-size: 1.1rem; margin-bottom: 10px;">Head-to-Head Comparison</h4>
        <div style="overflow-x: auto; margin-bottom: 25px;">
            <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 0.85rem; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1);">
                <tr style="background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">Feature</th>
                    <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">{original_recommendation} (#1 Podium)</th>
                    <th style="padding: 12px;">{entered_card}</th>
                </tr>
                <!-- Generate 5 rows here comparing: Card Type, Approval Odds for this user, Annual Fee, and 2 top spend categories based on their profile -->
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 12px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.1);">[Feature Name]</td><td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">[Card A Stat]</td><td style="padding: 12px;">[Card B Stat]</td></tr>
            </table>
        </div>
        
        <h4 style="color: white; font-size: 1.1rem; margin-bottom: 10px;">Which Card is Better for You?</h4>
        <p style="color: #34D399; font-weight: bold; margin-bottom: 15px;">The Winner: [Insert Winning Card Name]</p>
        <p style="color: #e2e8f0; font-size: 0.9rem; line-height: 1.6; margin-bottom: 15px;">[Write a 2-sentence explanation of why the winner is better for this specific user's age, income, and goals.]</p>
        
        <p style="color: #e2e8f0; font-size: 0.9rem; font-weight: bold; margin-bottom: 10px;">Why the winner wins:</p>
        <ul style="color: #e2e8f0; font-size: 0.9rem; line-height: 1.6; padding-left: 20px; margin-bottom: 10px;">
            <li style="margin-bottom: 8px;"><strong>[Key Point 1]:</strong> [Detailed reason]</li>
            <li style="margin-bottom: 8px;"><strong>[Key Point 2]:</strong> [Detailed reason]</li>
            <li style="margin-bottom: 8px;"><strong>[Key Point 3]:</strong> [Detailed reason]</li>
        </ul>
        """
        text = generate_with_resilience(prompt)
        return text.replace("```html", "").replace("```", "").strip()
    except Exception as e:
        return f"<p style='color:red;'>Error connecting to AI: {str(e)}</p>"

def get_fee_waiver_target(card_name):
    query = f"What is the annual fee waiver spend target for {card_name} credit card in India 2026?"
    web_data = fetch_web_context(query)
    
    prompt = f"""
    Based on this web data: {web_data}.
    What is the exact annual spend required in INR to waive the annual fee for the '{card_name}'? 
    Return ONLY the integer number (e.g., 100000). If it is lifetime free or has no waiver, return 0.
    """
    text = generate_with_resilience(prompt)
    numbers = re.findall(r'\d+', text.replace(',', ''))
    return int(numbers[0]) if numbers else 200000

def get_forex_markup(card_name):
    query = f"What is the exact forex markup fee percentage for {card_name} in India?"
    web_data = fetch_web_context(query)
    
    prompt = f"""
    Based on this web data: {web_data}.
    What is the base forex markup fee percentage (in %) charged by the '{card_name}'?
    Return ONLY the float number (e.g., 3.5, 0.0). Do not include the % sign.
    """
    text = generate_with_resilience(prompt)
    numbers = re.findall(r"[-+]?\d*\.\d+|\d+", text)
    if numbers:
        return min(float(numbers[0]), 5.0)
    return 3.5

def get_copilot_verdict(query, wallet_context):
    prompt = f"""
    You are a strict financial advisor. User Query: "{query}". Wallet Context: {wallet_context}
    1. If expense exceeds 30% of card limit, issue "🔴 HOLD" verdict. Advise splitting.
    2. If safe (<30%), recommend best card and issue "🟢 SWIPE" verdict.
    Keep under 4 sentences.
    """
    return generate_with_resilience(prompt)

def fetch_live_card_offers(card_name):
    query = f"Latest active offers, discounts for {card_name} credit card in India on Amazon, Flipkart, Swiggy, Zomato, MakeMyTrip, IRCTC Train Booking, Fuel 2026"
    web_data = fetch_web_context(query)
    
    prompt = f"""
    Based on web data: {web_data}. List active offers for '{card_name}'.
    You must output exactly 5 HTML blocks for: 1. E-Commerce 2. Food 3. Travel 4. Trains 5. Fuel.
    Wrap each category EXACTLY like this (NO markdown blocks, NO extra text):
    
    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><span style="background: rgba(6,182,212,0.1); color: #06b6d4; font-size: 0.65rem; padding: 4px 10px; border-radius: 12px; font-weight: bold; letter-spacing: 1px;">[EMOJI] [CATEGORY]</span><span style="color: #64748b; font-size: 0.75rem;">Active 2026</span></div>
        <h4 style="color: white; font-size: 1.1rem; margin-bottom: 10px;">[BENEFIT]</h4>
        <p style="color: #e2e8f0; font-size: 0.85rem; margin-bottom: 20px;">[DETAIL]</p>
        <div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #64748b; font-size: 0.8rem;">Card: {card_name}</span><span style="border: 1px solid rgba(52,211,153,0.3); color: #34D399; font-size: 0.75rem; padding: 6px 12px; border-radius: 4px; font-weight: bold;">[PROMO]</span></div>
    </div>
    """
    return generate_with_resilience(prompt)

def get_hidden_milestones(card_name):
    query = f"Milestone rewards annual spend target for {card_name} credit card India 2026"
    web_data = fetch_web_context(query)
    
    prompt = f"""
    Based on web data: {web_data}. List the annual milestone rewards for '{card_name}'.
    You must output EXACTLY this HTML block per milestone (NO markdown blocks):
    
    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: flex-start;">
            <div style="display: flex; gap: 15px; align-items: center;">
                <div style="background: rgba(255,255,255,0.1); color: #94a3b8; width: 30px; height: 30px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 0.8rem;">[#]</div>
                <div><h4 style="color: white; font-size: 1.1rem; margin-bottom: 4px;">[REWARD]</h4><p style="color: #64748b; font-size: 0.8rem;">Target: ₹[SPEND] spend</p></div>
            </div>
            <div style="color: #FBBF24; font-weight: bold; font-size: 1.1rem;">+₹[VALUE] Value</div>
        </div>
        <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; margin-bottom: 8px;"><div style="height: 100%; width: 0%; background: #34D399; border-radius: 3px;"></div></div>
        <div style="display: flex; justify-content: space-between; color: #64748b; font-size: 0.75rem;"><span>Tracking...</span><span>₹[SPEND] spend to unlock</span></div>
    </div>
    """
    return generate_with_resilience(prompt)

def get_utility_cashback_rate(card_name, services):
    query = f"Cashback percentage for {services} using {card_name} credit card India"
    web_data = fetch_web_context(query)
    
    prompt = f"""
    Based on web data: {web_data}. What is the exact cashback % '{card_name}' gives for {services}?
    Return ONLY the float number (e.g., 5.0, 1.0). Do not include the % sign.
    """
    text = generate_with_resilience(prompt)
    numbers = re.findall(r"[-+]?\d*\.\d+|\d+", text)
    if numbers:
        return min(float(numbers[0]), 25.0)
    return 1.0

def get_reward_point_values(card_name):
    query = f"Value of 1 reward point in INR for {card_name} statement credit, vouchers, and travel miles transfer"
    web_data = fetch_web_context(query)
    
    prompt = f"""
    Based on web data: {web_data}. What is the monetary value of 1 Reward Point in INR for '{card_name}'?
    Return ONLY a valid JSON object. No markdown, no backticks.
    {{
        "cash_rate": 0.25,
        "voucher_rate": 0.35,
        "travel_rate": 1.0,
        "best_partner": "Vistara/Marriott"
    }}
    """
    text = generate_with_resilience(prompt).replace("```json", "").replace("```", "").strip()
    return json.loads(text)

def get_fee_and_penalty_audit(card_name):
    query = f"{card_name} hidden fees, interest rate APR, cash advance fee, late payment penalty, overlimit charge India"
    web_data = fetch_web_context(query)
    
    prompt = f"""
    Based on web data: {web_data}. Perform a strict financial audit of '{card_name}'.
    Return ONLY a valid JSON object. No markdown, no backticks. Match exactly:
    {{
        "joining_fee": "exact annual or joining fee amount (e.g., ₹500)",
        "apr": "3.6% per month",
        "late_fee": "Up to ₹1,300",
        "overlimit": "2.5% of overlimit",
        "cash_advance": "2.5% of amount",
        "critical_warning": "1 short sentence identifying the most dangerous penalty clause."
    }}
    """
    text = generate_with_resilience(prompt).replace("```json", "").replace("```", "").strip()
    return json.loads(text)