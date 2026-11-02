// --- 1. VIEW NAVIGATION LOGIC ---
const homeBtn = document.getElementById('home-btn');
const vaultNavBtn = document.getElementById('vault-nav-btn');
const enterDiscoveryBtn = document.getElementById('enter-discovery-btn');
const landingView = document.getElementById('landing-view');
const discoveryView = document.getElementById('discovery-view');
const expenseBlueprintView = document.getElementById('expense-blueprint-view');
const vaultAuthView = document.getElementById('vault-auth-view');
const vaultDashboardView = document.getElementById('vault-dashboard-view');
const nextStepBtn = document.getElementById('next-step-btn');
const backStepBtn = document.getElementById('back-step-btn');
const loadingView = document.getElementById('loading-view');
const resultsView = document.getElementById('results-view');
const mainContainer = document.getElementById('main-container');

function hideAllViews() {
    [discoveryView, expenseBlueprintView, loadingView, resultsView, landingView, vaultAuthView, vaultDashboardView].forEach(v => {
        if(v) v.classList.add('hidden');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
}

homeBtn.addEventListener('click', () => {
    hideAllViews();
    homeBtn.classList.add('active');
    if(landingView) landingView.classList.remove('hidden');
    document.querySelector('.container').style.maxWidth = '900px';
    document.querySelector('.navbar').style.maxWidth = '900px';
    if(mainContainer) mainContainer.classList.remove('hidden');
});

function openVaultAuth() {
    hideAllViews();
    vaultNavBtn.classList.add('active');
    if(vaultAuthView) vaultAuthView.classList.remove('hidden');
    document.querySelector('.container').style.maxWidth = '650px';
    document.querySelector('.navbar').style.maxWidth = '650px';
    if(mainContainer) mainContainer.classList.remove('hidden');
}

vaultNavBtn.addEventListener('click', openVaultAuth);
document.querySelectorAll('.vault-action-btn').forEach(btn => btn.addEventListener('click', openVaultAuth));

document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
    hideAllViews();
    if(expenseBlueprintView) expenseBlueprintView.classList.remove('hidden');
    document.querySelector('.container').style.maxWidth = '650px';
    document.querySelector('.navbar').style.maxWidth = '650px';
    if(mainContainer) mainContainer.classList.remove('hidden');
});

enterDiscoveryBtn.addEventListener('click', () => {
    hideAllViews();
    if(discoveryView) discoveryView.classList.remove('hidden');
    document.querySelector('.container').style.maxWidth = '650px';
    document.querySelector('.navbar').style.maxWidth = '650px';
    if(mainContainer) mainContainer.classList.remove('hidden');
    updateUI(); 
});
nextStepBtn.addEventListener('click', () => {
    if(discoveryView) discoveryView.classList.add('hidden');
    if(expenseBlueprintView) expenseBlueprintView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
backStepBtn.addEventListener('click', () => {
    if(expenseBlueprintView) expenseBlueprintView.classList.add('hidden');
    if(discoveryView) discoveryView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- 2. VAULT AUTHENTICATION TO DASHBOARD LOGIC ---
const authRadios = document.getElementsByName('auth_mode');
const groupName = document.getElementById('group-name');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const showPasswordCb = document.getElementById('show-password');
const vaultPasswordInput = document.getElementById('vault-password');
const vaultUsernameInput = document.getElementById('vault-username');
const lblLogin = document.getElementById('lbl-login');
const lblRegister = document.getElementById('lbl-register');

authRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'register') {
            if(groupName) groupName.classList.remove('hidden');
            if(authTitle) authTitle.textContent = "Create Account";
            if(authSubmitBtn) authSubmitBtn.textContent = "⚡ Create Commander Account";
            if(lblRegister) lblRegister.style.color = "#e2e8f0";
            if(lblLogin) lblLogin.style.color = "#64748b";
        } else {
            if(groupName) groupName.classList.add('hidden');
            if(authTitle) authTitle.textContent = "Secure Login";
            if(authSubmitBtn) authSubmitBtn.textContent = "⚡ Breach The Vault";
            if(lblLogin) lblLogin.style.color = "#e2e8f0";
            if(lblRegister) lblRegister.style.color = "#64748b";
        }
    });
});

if(showPasswordCb) {
    showPasswordCb.addEventListener('change', function() {
        if(vaultPasswordInput) vaultPasswordInput.type = this.checked ? 'text' : 'password';
    });
}

document.getElementById('demo-autofill-btn')?.addEventListener('click', () => {
    authRadios[0].checked = true;
    authRadios[0].dispatchEvent(new Event('change'));
    
    if(vaultUsernameInput) vaultUsernameInput.value = "abc_24";
    if(vaultPasswordInput) {
        vaultPasswordInput.value = "secret123";
        vaultPasswordInput.type = "password";
    }
    if(showPasswordCb) showPasswordCb.checked = false;
});

if(authSubmitBtn) {
    authSubmitBtn.addEventListener('click', async () => {
        const isRegister = authRadios[1].checked;
        const username = vaultUsernameInput.value.trim();
        const password = vaultPasswordInput.value.trim();

        if (!username || !password) {
            alert("Commander ID and Security Clearance are required.");
            return;
        }

        if (isRegister) {
            showCustomAlert("Authenticating...", "Executing PBKDF2-HMAC-SHA256 hash derivation and generating secure Vault profile...", "🔒");
        } else {
            showCustomAlert("Authenticating...", "Retrieving cryptographic salt and verifying Commander credentials...", "🔒");
        }
        
        try {
            const endpoint = isRegister ? 'https://cardscoutai-app.onrender.com/api/register' : 'https://cardscoutai-app.onrender.com/api/login';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                // Save user session locally
                localStorage.setItem("commanderID", username);
                
                // Transition to Dashboard
                setTimeout(() => {
                    alertModal.classList.add('hidden');
                    hideAllViews();
                    vaultNavBtn.classList.add('active');
                    if(vaultDashboardView) vaultDashboardView.classList.remove('hidden');
                    document.querySelector('.container').style.maxWidth = '1100px';
                    document.querySelector('.navbar').style.maxWidth = '1100px';
                    if(mainContainer) mainContainer.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Refresh Wallet Data on Login
                    currentVaultUser = username;
                    loadWallet();
                    loadSubscriptions();
                }, 800); // Slight delay for visual effect
            } else {
                alertModal.classList.add('hidden');
                alert("Access Denied: " + (data.detail || data.message));
            }
        } catch (error) {
            console.error("Auth Error:", error);
            alertModal.classList.add('hidden');
            alert("Connection to the Obsidian Vault server failed. Ensure your Python backend is running.");
        }
    });
}

// Vault Dashboard Interactions
document.getElementById('vault-logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem("commanderID"); // Clear session
    currentVaultUser = null; // Lock API calls
    window.walletCards = []; // WIPE AI MEMORY
    
    // Clear the Wallet UI immediately
    const walletGrid = document.getElementById('wallet-grid');
    if (walletGrid) walletGrid.innerHTML = '';
    
    // Reset AI Chatbox to default state
    const chatBox = document.getElementById('copilot-chat-box');
    if (chatBox) {
        chatBox.innerHTML = `
            <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div style="background: rgba(52,211,153,0.1); color: #34D399; padding: 10px; border-radius: 8px; font-size: 1.2rem;">🤖</div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-top-left-radius: 0; color: #e2e8f0; font-size: 0.9rem; line-height: 1.6; max-width: 85%;">
                    Greetings! I am CardScout Co-Pilot, your generative AI financial advisor. Tell me about any purchase you're about to make, and I will audit your digital wallet to find the optimal card with maximum yield while strictly guarding your 30% CIBIL credit utilization ceiling.
                    <div style="color: #64748b; font-size: 0.7rem; margin-top: 10px;">Just now</div>
                </div>
            </div>`;
    }

    openVaultAuth(); // Kick user to login screen
});

const walletManagerToggle = document.getElementById('wallet-manager-toggle');
const walletManagerContent = document.getElementById('wallet-manager-content');
if(walletManagerToggle && walletManagerContent) {
    walletManagerToggle.addEventListener('click', () => {
        walletManagerContent.classList.toggle('hidden');
        const arrow = walletManagerToggle.querySelector('div');
        arrow.textContent = walletManagerContent.classList.contains('hidden') ? 'v' : '∧';
    });
}


// --- DYNAMIC SUBSCRIPTION SAVER LOGIC ---
const engine4 = document.getElementById('engine-4');

async function loadSubscriptions() {
    const username = localStorage.getItem("commanderID");
    if (!username) return;

    try {
        const response = await fetch(`https://cardscoutai-app.onrender.com/api/subscriptions/${username}`);
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            // Remove previous dynamic subs
            const oldSubs = engine4.querySelectorAll('.dynamic-sub');
            oldSubs.forEach(sub => sub.remove());
            
            const addForm = engine4.querySelector('div[style*="background: rgba(168, 85, 247, 0.05)"]');
            
            data.subscriptions.forEach(sub => {
                // AI Cashback Logic
                let cashback = 0;
                if (sub.card_used.includes('Millennia') || sub.card_used.includes('Cashback')) {
                    cashback = Math.round(sub.monthly_cost * 0.05);
                } else if (sub.card_used.includes('BPCL') || sub.card_used.includes('Fuel')) {
                    cashback = Math.round(sub.monthly_cost * 0.01);
                } else {
                    cashback = Math.round(sub.monthly_cost * 0.015);
                }

                const subHTML = `
                <div class="dynamic-sub" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div><h4 style="color: white; font-size: 1rem; margin-bottom: 4px;">${sub.service_name}</h4><p style="color: #64748b; font-size: 0.75rem;">Charged to: ${sub.card_used}</p></div>
                    <div style="text-align: right; display: flex; align-items: center; gap: 15px;">
                        <div>
                            <div style="color: white; font-weight: bold; font-size: 1rem; margin-bottom: 2px;">₹${sub.monthly_cost} / mo</div>
                            <div style="color: #34D399; font-size: 0.75rem;">Earns ₹${cashback}/mo cashback (vs ₹0 on UPI)</div>
                        </div>
                        <span style="color: #64748b; cursor: pointer; font-size: 1.2rem;" onclick="removeSubscription('${sub.service_name}', '${sub.card_used}')">🗑️</span>
                    </div>
                </div>`;
                addForm.insertAdjacentHTML('beforebegin', subHTML);
            });
        }
    } catch (error) {
        console.error("Failed to load subscriptions:", error);
    }
}

// Add Subscription Logic
const addSubBtn = engine4.querySelector('.filled-btn');
if(addSubBtn) {
    addSubBtn.addEventListener('click', async () => {
        const username = localStorage.getItem("commanderID");
        const inputs = engine4.querySelectorAll('.text-input');
        const serviceName = inputs[0].value.trim();
        const monthlyCost = parseFloat(inputs[1].value);
        // Fallback card name since the dropdown isn't fully wired yet
        // Replace the old hardcoded line with this:
        // Replace the old hardcoded line with this:
        const cardSelect = document.getElementById('engine-4-card-select');
        const cardUsed = cardSelect ? cardSelect.value : "Vault Card";

        if (!serviceName || !monthlyCost) {
            alert("Enter a valid service name and cost.");
            return;
        }

        try {
            const response = await fetch('https://cardscoutai-app.onrender.com/api/subscriptions/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, service_name: serviceName, monthly_cost: monthlyCost, card_used: cardUsed })
            });
            if (response.ok) {
                inputs[0].value = '';
                inputs[1].value = '';
                loadSubscriptions(); 
            }
        } catch (error) {
            console.error("Add Subscription Error:", error);
        }
    });
}

window.removeSubscription = async function(serviceName, cardUsed) {
    const username = localStorage.getItem("commanderID");
    try {
        const response = await fetch('https://cardscoutai-app.onrender.com/api/subscriptions/remove', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, service_name: serviceName, card_used: cardUsed })
        });
        if (response.ok) loadSubscriptions();
    } catch (error) {
        console.error("Remove Subscription Error:", error);
    }
}

// Vault Engine Tabs
const engineTabs = document.querySelectorAll('.engine-tab');
const enginePanels = document.querySelectorAll('.engine-panel');
engineTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        engineTabs.forEach(t => t.classList.remove('active'));
        enginePanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-engine')).classList.add('active');
    });
});


// --- 3. OPTION SELECTIONS ---
document.querySelectorAll('#discovery-view .option-box').forEach(box => {
    box.addEventListener('click', () => {
        document.querySelectorAll('#discovery-view .option-box').forEach(b => b.classList.remove('active'));
        box.classList.add('active');
    });
});
document.querySelectorAll('.bank-box').forEach(box => { box.addEventListener('click', () => box.classList.toggle('active')); });
document.querySelectorAll('.reward-box').forEach(box => {
    box.addEventListener('click', () => {
        box.classList.toggle('active');
        const check = box.querySelector('.check-icon');
        if (box.classList.contains('active')) check.classList.remove('hidden'); else check.classList.add('hidden');
        document.getElementById('all-rewards').checked = false; 
    });
});
document.getElementById('all-rewards')?.addEventListener('change', (e) => {
    document.querySelectorAll('.reward-box').forEach(box => {
        if(e.target.checked) { box.classList.add('active'); box.querySelector('.check-icon').classList.remove('hidden'); } 
        else { box.classList.remove('active'); box.querySelector('.check-icon').classList.add('hidden'); }
    });
});

// --- 4. SLIDERS & GAUGES ---
const ageSlider = document.getElementById('age-slider'), ageLabel = document.getElementById('age-label');
const incomeSlider = document.getElementById('income-slider'), incomeInput = document.getElementById('income-input'), incomeFill = document.getElementById('income-fill');
const feeSlider = document.getElementById('fee-slider');

function updateUI() {
    if(!ageSlider) return;
    ageLabel.textContent = `${ageSlider.value} Years`;
    ageSlider.style.background = `linear-gradient(to right, #34D399 ${((ageSlider.value - 18) / 57) * 100}%, #1e293b ${((ageSlider.value - 18) / 57) * 100}%)`;
    
    // Update Income Visuals (Syncs slider to input box unless user is actively typing)
    let val = parseInt(incomeSlider.value);
    if(incomeInput && document.activeElement !== incomeInput) {
        incomeInput.value = val; 
    }
    
    const incPct = ((val - 10000) / 490000) * 100;
    incomeSlider.style.background = `linear-gradient(to right, #34D399 ${incPct}%, #1e293b ${incPct}%)`;
    if(incomeFill) incomeFill.style.strokeDashoffset = (125.6 - (125.6 * (incPct / 100))) + "px";
    
    if(feeSlider) feeSlider.style.background = `linear-gradient(to right, #34D399 ${(feeSlider.value / 2) * 100}%, #1e293b ${(feeSlider.value / 2) * 100}%)`;
}

if(ageSlider) ageSlider.addEventListener('input', updateUI); 
if(incomeSlider) incomeSlider.addEventListener('input', updateUI); 
if(feeSlider) feeSlider.addEventListener('input', updateUI);

// Listen for manual keyboard typing in the income box
if(incomeInput) {
    incomeInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value) || 0;
        
        // Clamp visually for the slider so it doesn't break UI bounds
        let sliderVal = val;
        if(sliderVal > 500000) sliderVal = 500000;
        if(sliderVal < 10000) sliderVal = 10000;
        
        incomeSlider.value = sliderVal;
        
        // Update the gauge ring live while typing
        const incPct = ((sliderVal - 10000) / 490000) * 100;
        incomeSlider.style.background = `linear-gradient(to right, #34D399 ${incPct}%, #1e293b ${incPct}%)`;
        if(incomeFill) incomeFill.style.strokeDashoffset = (125.6 - (125.6 * (incPct / 100))) + "px";
    });
}

// Credit Score Logic
const creditBtns = document.querySelectorAll('.credit-btn'), creditBadge = document.getElementById('credit-badge'), creditNeedle = document.getElementById('credit-needle');
const needleAngles = { "< 700": "-30deg", "700 - 750": "25deg", "> 750": "80deg", "Don't Know": "25deg" };
creditBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        creditBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
        const val = btn.getAttribute('data-val');
        if(creditBadge) creditBadge.innerHTML = val === "> 750" ? "785 • &gt; 750" : val;
        if(creditNeedle) creditNeedle.style.transform = `rotate(${needleAngles[val]})`;
    });
});
if(creditNeedle) creditNeedle.style.transform = `rotate(${needleAngles["Don't Know"]})`;

// EXPENSE STEPPERS
function updateTotalExpenses() {
    let total = 0; 
    document.querySelectorAll('#expense-blueprint-view .step-val input').forEach(input => { 
        total += parseInt(input.value) || 0; 
    });
    const tm = document.getElementById('total-monthly'); 
    const ta = document.getElementById('total-annual');
    if(tm) tm.textContent = total.toLocaleString('en-IN'); 
    if(ta) ta.textContent = (total * 12).toLocaleString('en-IN');
}

// 1. Listen for +/- button clicks
document.querySelectorAll('.step-btn').forEach(btn => { 
    btn.addEventListener('click', () => { 
        const input = document.getElementById(btn.getAttribute('data-target')); 
        if(!input) return; 
        let val = parseInt(input.value) || 0; 
        if (btn.classList.contains('plus')) val += 1000; 
        if (btn.classList.contains('minus') && val > 0) val -= 1000; 
        input.value = val; 
        updateTotalExpenses(); 
    }); 
});

// 2. Listen for Keyboard Typing
document.querySelectorAll('#expense-blueprint-view .step-val input').forEach(input => {
    input.addEventListener('input', updateTotalExpenses);
});

const ccYes = document.getElementById('cc-yes'), ccNo = document.getElementById('cc-no'), ccDetails = document.getElementById('cc-details');
ccYes?.addEventListener('click', () => { ccYes.classList.add('active'); ccNo.classList.remove('active'); ccDetails.classList.remove('hidden'); });
ccNo?.addEventListener('click', () => { ccNo.classList.add('active'); ccYes.classList.remove('active'); ccDetails.classList.add('hidden'); });


// --- 6. SPOTLIGHT & MOCK DATA ---
let aiCardsData = [
    { name: "HDFC Bank Infinia Metal Edition", bank: "HDFC Bank", sub: "Super Premium", net: "Visa", savings: "₹80,140", ret: "8.05%", yield: "₹92,640", fee: "₹12,500", forex: "2.0% + GST", welc: "12,500 Reward Points (Value: ₹12,500)", cib: "770+", chan: "Branch Relationship Manager", steps: ["Maintain CIBIL > 770.", "Target ₹10L annual spend for waiver.", "Apply with ITR verification."], why: "Since you already bank with HDFC, upgrading to Infinia captures maximum value on your high travel & lifestyle spends." },
    { name: "Tata Neu Infinity HDFC", bank: "HDFC Bank", sub: "Cashback", net: "RuPay", savings: "₹75,509", ret: "7.58%", yield: "₹77,008", fee: "₹1,499", forex: "2.0% + GST", welc: "1,499 NeuCoins", cib: "730+", chan: "Tata Neu App", steps: ["Ensure UPI linking via RuPay.", "Spend ₹3L annually for fee waiver."], why: "Perfect for UPI and grocery spends via the Tata Neu ecosystem." },
    { name: "HDFC Bank Regalia Gold", bank: "HDFC Bank", sub: "Premium", net: "Visa", savings: "₹73,072", ret: "7.34%", yield: "₹75,572", fee: "₹2,500", forex: "2.0% + GST", welc: "₹2,500 Gift Voucher", cib: "750+", chan: "NetBanking", steps: ["Spend ₹4L annually for waiver."], why: "A balanced stepping stone before Super Premium tiers." },
    { name: "Axis Bank Atlas", bank: "Axis Bank", sub: "Travel", net: "Visa", savings: "₹65,640", ret: "6.50%", yield: "₹70,640", fee: "₹5,000", forex: "3.5% + GST", welc: "5,000 Edge Miles", cib: "750+", chan: "Axis Website", steps: ["Target travel portals for 5x points."], why: "Directly aligns with your priority for Air Miles." },
    { name: "Airtel Axis Bank", bank: "Axis Bank", sub: "Cashback", net: "Visa", savings: "₹48,350", ret: "4.85%", yield: "₹48,850", fee: "₹500", forex: "3.5% + GST", welc: "₹500 Amazon Voucher", cib: "720+", chan: "Airtel Thanks App", steps: ["Pay utilities via Airtel app."], why: "Maximizes returns on your telecom and utility spends." }
];

let activeSpotlightIdx = 0;

function updateSpotlight(idx) {
    const d = aiCardsData[idx];
    if(!d) return;
    document.getElementById('spot-bank').textContent = d.bank.toUpperCase();
    document.getElementById('spot-name').textContent = d.name;
    document.getElementById('spot-net').textContent = d.net;
    document.getElementById('spot-yield').textContent = d.yield;
    document.getElementById('spot-fee').textContent = d.fee;
    document.getElementById('spot-forex').textContent = d.forex;
    document.getElementById('spot-welcome').textContent = d.welc;
    
    // Safety check for restored elements
    const cibilEl = document.getElementById('spot-cibil');
    if(cibilEl) cibilEl.textContent = d.cib;
    const chanEl = document.getElementById('spot-channel');
    if(chanEl) chanEl.textContent = d.chan;
    const stepsEl = document.getElementById('spot-steps');
    if(stepsEl) stepsEl.innerHTML = d.steps.map(s => `<li><span style="color:#34D399; margin-right:8px;">◎</span> ${s}</li>`).join('');
    
    document.getElementById('spot-why-btn').setAttribute('data-idx', idx);
    document.getElementById('spot-insp-btn').setAttribute('data-idx', idx);
    
    document.getElementById('spotlight-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.querySelectorAll('.clickable-card').forEach(card => {
    card.addEventListener('click', (e) => {
        if(e.target.classList.contains('why-btn') || e.target.classList.contains('insp-btn')) return; 
        updateSpotlight(card.getAttribute('data-idx'));
    });
});

// --- 7. MODALS & DELEGATED ACTION BUTTONS ---
const whyModal = document.getElementById('why-fits-modal'), inspModal = document.getElementById('inspect-modal'), alertModal = document.getElementById('custom-alert-modal');
document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => { 
    document.getElementById('why-fits-modal')?.classList.add('hidden'); 
    document.getElementById('inspect-modal')?.classList.add('hidden'); 
    document.getElementById('battle-input-modal')?.classList.add('hidden');
    document.getElementById('battle-result-modal')?.classList.add('hidden');
}));
document.querySelectorAll('.close-alert-btn').forEach(btn => btn.addEventListener('click', () => alertModal.classList.add('hidden') ));

function showCustomAlert(title, message, icon) {
    document.getElementById('alert-title').textContent = title;
    document.getElementById('alert-message').textContent = message;
    document.getElementById('alert-icon').textContent = icon;
    alertModal.classList.remove('hidden');
}

function openWhyModal(idx) {
    const d = aiCardsData[idx];
    document.getElementById('modal-why-name').textContent = d.name;
    document.getElementById('modal-why-bank').textContent = d.bank;
    document.getElementById('modal-why-savings').textContent = d.savings;
    document.getElementById('modal-why-narrative').textContent = d.why;
    whyModal.classList.remove('hidden');
}

function openInspModal(idx) {
    const d = aiCardsData[idx];
    document.getElementById('modal-insp-name').textContent = d.name;
    document.getElementById('modal-insp-savings').textContent = d.savings;
    document.getElementById('modal-insp-yield').textContent = d.ret;
    document.getElementById('modal-insp-fee').textContent = d.fee;
    document.getElementById('modal-insp-forex').textContent = d.forex;
    
    // Inject dynamic tab data generated by Gemini
    document.getElementById('tab-reward').innerHTML = d.reward_desc || "<p>Data not available.</p>";
    document.getElementById('tab-lounge').innerHTML = d.lounge_desc || "<p>Data not available.</p>";
    document.getElementById('tab-milestones').innerHTML = d.milestone_desc || "<p>Data not available.</p>";
    document.getElementById('tab-fineprint').innerHTML = d.fineprint_desc || "<p>Data not available.</p>";

    inspModal.classList.remove('hidden');
}

// EVENT DELEGATION
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('why-btn')) openWhyModal(e.target.getAttribute('data-idx'));
    if (e.target.classList.contains('insp-btn')) openInspModal(e.target.getAttribute('data-idx'));
    if (e.target.classList.contains('insp-btn-modal')) { document.getElementById('why-fits-modal')?.classList.add('hidden'); openInspModal(activeSpotlightIdx); }
    
    // OPEN BATTLEGROUND INPUT
    if (e.target.classList.contains('battleground-btn')) {
        document.getElementById('battle-input-modal').classList.remove('hidden');
    }
    
    if (e.target.classList.contains('add-vault-btn')) {
        const btn = e.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = "✔ Added to Vault";
        btn.style.background = "#10b981"; 
        setTimeout(() => { btn.innerHTML = originalText; btn.style.background = "#34D399"; }, 2000);
    }
});

// START BATTLE LOGIC
document.getElementById('start-battle-btn')?.addEventListener('click', async () => {
    const inputEl = document.getElementById('battle-card-input');
    const challengerCard = inputEl.value.trim();
    if (!challengerCard) return alert("Please enter a card name to compare.");

    const btn = document.getElementById('start-battle-btn');
    btn.textContent = "Analyzing Matchup... ⚔️";

    // Grab User Profile Data for Context
    const name = document.getElementById('user-name').value || "User";
    const age = document.getElementById('age-slider')?.value || "28";
    const income = document.getElementById('income-slider')?.value || "50000";
    const activeCreditBtn = document.querySelector('.credit-btn.active');
    const credit = activeCreditBtn ? activeCreditBtn.getAttribute('data-val') : "Don't Know";
    
    let occ = "Professional";
    const profBox = Array.from(document.querySelectorAll('#discovery-view .option-box.active')).find(box => !box.classList.contains('bank-box') && !box.classList.contains('reward-box'));
    if (profBox) {
        const parts = profBox.innerText.trim().split('\n');
        occ = parts[parts.length - 1].trim(); 
    }

    // Identify the AI's #1 Top Pick
    const topPick = (aiCardsData && aiCardsData[0]) ? aiCardsData[0].name : "Our Top Recommended Card";

    try {
        const response = await fetch('https://cardscoutai-app.onrender.com/api/engine/battleground', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                entered_card: challengerCard,
                original_recommendation: topPick,
                user_data: { name, age, occ, income, credit }
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            document.getElementById('battle-input-modal').classList.add('hidden');
            document.getElementById('battle-challenger-name').textContent = challengerCard;
            document.getElementById('battle-result-content').innerHTML = data.html;
            document.getElementById('battle-result-modal').classList.remove('hidden');
        } else {
            alert("Battleground analysis failed.");
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to Battleground AI engine.");
    }
    
    btn.textContent = "Compare Cards ⚔️";
    inputEl.value = ""; // Clear input for next time
});

// Modal Tab Switching (for Inspect)
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
});

// Custom Category Modal
document.getElementById('add-custom-cat-trigger')?.addEventListener('click', () => document.getElementById('custom-category-modal').classList.remove('hidden'));
document.getElementById('close-modal-btn')?.addEventListener('click', () => document.getElementById('custom-category-modal').classList.add('hidden'));
document.getElementById('add-custom-cat-btn')?.addEventListener('click', () => {
    const name = document.getElementById('custom-cat-name').value.trim() || 'Custom Category', spend = parseInt(document.getElementById('custom-cat-spend').value) || 0, id = 'cust-' + Date.now();
    const box = document.createElement('div'); box.className = 'expense-box';
    box.innerHTML = `<div class="expense-info"><span class="icon" style="color: #34D399;">✨</span><div><h4>${name}</h4><p>Custom added category</p></div></div><div class="stepper"><button class="step-btn minus" data-target="${id}">-</button><div class="step-val">₹<span id="${id}">${spend}</span></div><button class="step-btn plus" data-target="${id}">+</button></div>`;
    document.querySelector('.expense-grid').appendChild(box);
    box.querySelector('.minus').addEventListener('click', () => { const s = document.getElementById(id); let v = parseInt(s.textContent); if (v>0) v-=1000; s.textContent=v; updateTotalExpenses();});
    box.querySelector('.plus').addEventListener('click', () => { const s = document.getElementById(id); s.textContent = parseInt(s.textContent)+1000; updateTotalExpenses();});
    updateTotalExpenses(); document.getElementById('close-modal-btn').click(); 
});

// --- 8. MAIN API FETCH LOGIC (WITH FAILSAFE DEMO FALLBACK) ---
const submitBtn = document.getElementById('submit-btn');
if(submitBtn) {
    submitBtn.addEventListener('click', async () => {
        
        hideAllViews();
        const loadingView = document.getElementById('loading-view');
        const mainContainer = document.getElementById('main-container');

        if(loadingView) {
            loadingView.classList.remove('hidden');
            loadingView.style.display = 'flex';
        }
        if(mainContainer) {
            mainContainer.classList.add('hidden');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const activeCreditBtn = document.querySelector('.credit-btn.active');
        const name = document.getElementById('user-name').value || "User";
        const age = ageSlider?.value || "28";
        const income = document.getElementById('income-input')?.value || "50000";
        const credit = activeCreditBtn ? activeCreditBtn.getAttribute('data-val') : "Don't Know";
        // --- NEW: Dynamically grab the selected profession ---
        let occ = "Professional";
        // Find the active profession box (ignoring banks and rewards)
        const profBox = Array.from(document.querySelectorAll('#discovery-view .option-box.active'))
            .find(box => !box.classList.contains('bank-box') && !box.classList.contains('reward-box'));
        
        if (profBox) {
            // Splits "💼\n\nSalaried" and extracts just "Salaried"
            const parts = profBox.innerText.trim().split('\n');
            occ = parts[parts.length - 1].trim(); 
        }
        let totalSpend = 0; 
        document.querySelectorAll('.step-val span').forEach(span => totalSpend += parseInt(span.textContent));

        // RENDER FUNCTION (Used by both API Success and Demo Fallback)
        const renderIntelligenceHub = (narrativeText) => {
            if(loadingView) {
                loadingView.classList.add('hidden');
                loadingView.style.display = 'none';
            }
            if(mainContainer) {
                mainContainer.classList.remove('hidden');
            }
            
            document.querySelector('.container').style.maxWidth = '1100px'; 
            document.querySelector('.navbar').style.maxWidth = '1100px';
            
            const summaryGrid = document.getElementById('dynamic-summary-grid');
            if(summaryGrid) {
                summaryGrid.innerHTML = `
                    <div><span class="lbl">👤 APPLICANT</span><div class="val">${name}</div><div class="sub">${age} yrs • ${occ}</div></div>
                    <div><span class="lbl">💵 NET INCOME</span><div class="val text-green">₹${parseInt(income).toLocaleString('en-IN')}/mo</div><div class="sub">Verified</div></div>
                    <div><span class="lbl">🎯 CREDIT STANDING</span><div class="val text-green">${credit}</div><div class="sub">Tier</div></div>
                    <div><span class="lbl">📈 MONTHLY SPEND</span><div class="val">₹${totalSpend.toLocaleString('en-IN')}</div><div class="sub">₹${((totalSpend*12)/100000).toFixed(1)}L / yr</div></div>
                    <div><span class="lbl">🏦 BANKING REL.</span><div class="val">HDFC Bank</div><div class="sub">Limit: Active</div></div>
                    <div><span class="lbl">🏆 PRIORITY GOALS</span><div class="val text-orange">Premium Rewards</div><div class="sub">Selected</div></div>
                `;
            }

            const aiText = document.getElementById('dynamic-ai-text');
            if(aiText) {
                aiText.innerHTML = narrativeText.split('\n').filter(p=>p.trim()!=='').map(p => `<p style="margin-bottom:12px;">${p}</p>`).join('');
            }

            updateSpotlight(0); // This was crashing before because spot-steps was missing in HTML!
            if(resultsView) resultsView.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        try {
            const controller = new AbortController();
            // Extended timeout to 12 seconds to allow Gemini to generate all 5 cards
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            const response = await fetch('https://cardscoutai-app.onrender.com/api/generate-roadmap', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, age, occ: "Professional", income, credit }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const resData = await response.json();
            
            if (resData.status === 'success' && resData.data) {
                // 1. Overwrite the hardcoded dummy cards with Gemini's live JSON data!
                aiCardsData = resData.data.cards;
                
                // 2. Loop through and update the UI text for all 5 cards
                for(let i = 0; i < 5; i++) {
                    const c = aiCardsData[i];
                    if(!c) continue;
                    
                    const nameEl = document.getElementById(`r${i}-name`);
                    const subEl = document.getElementById(`r${i}-sub`);
                    const savingsEl = document.getElementById(`r${i}-savings`);
                    const retEl = document.getElementById(`r${i}-return`);
                    const netEl = document.getElementById(`r${i}-net`);
                    
                    if(nameEl) nameEl.textContent = c.name;
                    if(subEl) subEl.textContent = `${c.bank} • ${c.sub}`;
                    if(savingsEl) savingsEl.textContent = c.savings;
                    if(retEl) retEl.textContent = c.ret;
                    if(netEl) netEl.textContent = c.net;
                }
                // 2. NEW: Build and Inject the Top 5 Podium Table
                let tableHTML = `
                <h3 style="color: white; font-size: 1.3rem; margin-bottom: 15px;">1. Top 5 Podium Recommendations</h3>
                <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 0.85rem; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1);">
                    <tr style="background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1); text-align: center;">Rank</th>
                        <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">Card Name</th>
                        <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">Card Type</th>
                        <th style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">Primary Benefit for You</th>
                        <th style="padding: 12px;">Annual/Joining Fee</th>
                    </tr>
                `;
                
                aiCardsData.forEach((c, index) => {
                    if(!c) return;
                    tableHTML += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px; font-weight: bold; border-right: 1px solid rgba(255,255,255,0.1); text-align: center;">${index + 1}</td>
                        <td style="padding: 12px; font-weight: bold; color: white; border-right: 1px solid rgba(255,255,255,0.1);">${c.name}</td>
                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">${c.sub}</td>
                        <td style="padding: 12px; border-right: 1px solid rgba(255,255,255,0.1);">${c.why}</td>
                        <td style="padding: 12px;">${c.fee}</td>
                    </tr>`;
                });
                tableHTML += `</table>`;
                
                const tableContainer = document.getElementById('dynamic-podium-table');
                if(tableContainer) tableContainer.innerHTML = tableHTML;
                
                // 3. Render the hub with Gemini's custom narrative
                renderIntelligenceHub(resData.data.narrative);
            } else { 
                throw new Error("Backend generated error status");
            }

        } catch (e) {
            console.error("Backend offline or timed out. Engaging gracefully degraded Demo Mode.", e);
            const mockNarrative = "Based on the expenditure parameters mapped in your blueprint, we have initialized a forensic audit against 150+ live credit cards.\n\nYour primary routing strategy revolves around neutralizing your lifestyle and travel spends while actively protecting your CIBIL score below the 30% golden rule.";
            renderIntelligenceHub(mockNarrative);
        }
    });
}

// --- PHASE 2: DYNAMIC AI ENGINES LOGIC ---

// Helper function to get the currently selected card in the Vault
function getActiveVaultCardName() {
    const selectBox = document.getElementById('engine-1-card-select');
    return selectBox ? selectBox.value : ""; 
}

// Wire Engine 1: Fee Waiver Pacing
const trackWaiverBtn = document.getElementById('track-waiver-btn');
if (trackWaiverBtn) {
    trackWaiverBtn.addEventListener('click', async () => {
        const cardName = getActiveVaultCardName();
        trackWaiverBtn.textContent = "Consulting AI...";
        
        try {
            const response = await fetch('https://cardscoutai-app.onrender.com/api/engine/fee-waiver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ card_name: cardName })
            });
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                const target = data.target;
                
                // Get current user inputs from the UI
                const currentSpend = parseInt(document.getElementById('engine-1-spend').textContent);
                const monthsRemaining = 3; // Defaulting to 3 for the active UI state
                const creditLimit = 70000; // Simulated active card limit
                
                // Calculate real-time AI pacing metrics
                const remaining = target - currentSpend;
                const perMonth = remaining > 0 ? (remaining / monthsRemaining) : 0;
                const utilPct = (perMonth / creditLimit) * 100;
                
                // 1. Update Target
                document.getElementById('waiver-target-display').textContent = `₹${target.toLocaleString('en-IN')}`;
                
                // 2. Update Remaining Amount Badge
                const remainingBadge = document.querySelector('#engine-1 span[style*="border-radius: 4px"]');
                if(remainingBadge) {
                    remainingBadge.textContent = remaining > 0 ? `↑ ₹${remaining.toLocaleString('en-IN')} remaining` : `✓ Waiver Achieved`;
                    remainingBadge.style.color = remaining > 0 ? '#ef4444' : '#34D399';
                }
                
                // 3. Update Pacing Math Text
                const mathTextElements = document.querySelectorAll('#engine-1 p');
                if(mathTextElements.length >= 2) {
                    mathTextElements[1].innerHTML = `<strong>The Pacing Math:</strong> You need to spend <strong>₹${Math.round(perMonth).toLocaleString('en-IN')} / month</strong> for the next ${monthsRemaining} months to waive your fee.`;
                }
                
                // 4. Update AI Verdict
                const verdictBox = document.querySelector('#engine-1 div[style*="align-items: flex-start"]');
                if(verdictBox) {
                    const verdictText = verdictBox.querySelector('p');
                    const verdictDot = verdictBox.querySelector('div');
                    
                    if (remaining <= 0) {
                        verdictDot.style.color = '#34D399';
                        verdictText.innerHTML = `<strong style="color: white;">VERDICT: CLEAR.</strong> Target met. You will not be charged the annual fee.`;
                    } else if (utilPct > 30) {
                        verdictDot.style.color = '#ef4444';
                        verdictText.innerHTML = `<strong style="color: white;">VERDICT: HOLD.</strong> This requires a <strong style="color:#ef4444">${utilPct.toFixed(1)}%</strong> monthly utilization of your <strong>₹${creditLimit.toLocaleString('en-IN')}</strong> limit. Exceeding the 30% Golden Rule will damage your CIBIL score. Pay the fee or split spends.`;
                    } else {
                        verdictDot.style.color = '#34D399';
                        verdictText.innerHTML = `<strong style="color: white;">VERDICT: CLEAR.</strong> This requires a <strong style="color:#34D399">${utilPct.toFixed(1)}%</strong> monthly utilization of your limit, keeping your CIBIL score perfectly safe. Proceed with spends.`;
                    }
                }
                
                trackWaiverBtn.textContent = "Track Waiver";
            } else {
                trackWaiverBtn.textContent = "Tracking Failed";
            }
        } catch (error) {
            console.error("Engine 1 Error:", error);
            trackWaiverBtn.textContent = "Tracking Failed";
        }
    });
}
// Dynamic Slider & Stepper Real-time Recalculation for Engine 1
const monthsSlider = document.getElementById('months-slider');
const monthsDisplay = document.getElementById('months-display');

if (monthsSlider && monthsDisplay) {
    monthsSlider.addEventListener('input', (e) => {
        monthsDisplay.textContent = e.target.value;
        // Optionally trigger recalculation immediately when sliding
        const targetText = document.getElementById('waiver-target-display').textContent;
        const target = parseInt(targetText.replace(/[₹,]/g, '')) || 1000000;
        const currentSpend = parseInt(document.getElementById('engine-1-spend').textContent) || 0;
        const months = parseInt(e.target.value) || 3;
        const creditLimit = 70000;

        const remaining = target - currentSpend;
        const perMonth = remaining > 0 ? (remaining / months) : 0;
        const utilPct = (perMonth / creditLimit) * 100;

        // Update Math text dynamically
        const mathTextElements = document.querySelectorAll('#engine-1 p');
        if(mathTextElements.length >= 2) {
            mathTextElements[1].innerHTML = `<strong>The Pacing Math:</strong> You need to spend <strong>₹${Math.round(perMonth).toLocaleString('en-IN')} / month</strong> for the next ${months} months to waive your fee.`;
        }

        // Update Verdict dynamically
        const verdictBox = document.querySelector('#engine-1 div[style*="align-items: flex-start"]');
        if(verdictBox) {
            const verdictText = verdictBox.querySelector('p');
            const verdictDot = verdictBox.querySelector('div');
            
            if (remaining <= 0) {
                verdictDot.style.color = '#34D399';
                verdictText.innerHTML = `<strong style="color: white;">VERDICT: CLEAR.</strong> Target met. You will not be charged the annual fee.`;
            } else if (utilPct > 30) {
                verdictDot.style.color = '#ef4444';
                verdictText.innerHTML = `<strong style="color: white;">VERDICT: HOLD.</strong> This requires a <strong style="color:#ef4444">${utilPct.toFixed(1)}%</strong> monthly utilization of your <strong>₹${creditLimit.toLocaleString('en-IN')}</strong> limit. Exceeding the 30% Golden Rule will damage your CIBIL score. Pay the fee or split spends.`;
            } else {
                verdictDot.style.color = '#34D399';
                verdictText.innerHTML = `<strong style="color: white;">VERDICT: CLEAR.</strong> This requires a <strong style="color:#34D399">${utilPct.toFixed(1)}%</strong> monthly utilization of your limit, keeping your CIBIL score perfectly safe. Proceed with spends.`;
            }
        }
    });
}

// Wire Engine 7: Penalty Audit
const engine7Tab = document.querySelector('.engine-tab[data-engine="engine-7"]');
if (engine7Tab) {
    engine7Tab.addEventListener('click', async () => {
        const cardName = getActiveVaultCardName();
        const penaltyContainer = document.querySelector('#engine-7 .grid-template-columns');
        
        try {
            const response = await fetch('https://cardscoutai-app.onrender.com/api/engine/penalties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ card_name: cardName })
            });
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                const audit = data.audit;
                // Update the DOM elements with the live AI audit data
                const valueBoxes = document.querySelectorAll('#engine-7 .grid-template-columns > div > div');
                if (valueBoxes.length >= 4) {
                    valueBoxes[0].textContent = audit.apr;
                    valueBoxes[1].textContent = audit.late_fee;
                    valueBoxes[2].textContent = audit.overlimit;
                    valueBoxes[3].textContent = audit.cash_advance;
                }
                
                const warningBox = document.querySelector('#engine-7 h4 + p');
                if (warningBox) {
                    warningBox.textContent = audit.critical_warning;
                }
            }
        } catch (error) {
            console.error("Engine 7 Error:", error);
        }
    });
}

// --- DYNAMIC WALLET API SYNC (BLUEPRINT IMPLEMENTATION) ---
const API_BASE = 'https://cardscoutai-app.onrender.com/api/wallet';
const limitDisplay = document.getElementById('new-card-limit');
const cardNameInput = document.getElementById('new-card-name');
const walletGrid = document.getElementById('wallet-grid');
const walletList = document.getElementById('wallet-management-list');
const addWalletBtn = document.getElementById('add-wallet-btn');

// Capture active user from login session
let currentVaultUser = localStorage.getItem('commanderID');

// Stepper Logic
document.getElementById('limit-minus-btn')?.addEventListener('click', () => {
    let currentLimit = parseInt(limitDisplay.textContent);
    if (currentLimit > 5000) limitDisplay.textContent = currentLimit - 5000;
});
document.getElementById('limit-plus-btn')?.addEventListener('click', () => {
    limitDisplay.textContent = parseInt(limitDisplay.textContent) + 5000;
});

// Load Wallet from Supabase Database
async function loadWallet() {
    if(!currentVaultUser) return;
    try {
        const res = await fetch(`${API_BASE}/${currentVaultUser}`);
        const data = await res.json();
        if(data.status === 'success') {
            window.walletCards = data.cards; // Supplies Supabase data to the AI Co-Pilot
            renderWalletUI(data.cards);
        }
    } catch(err) { console.error("Supabase Load Error:", err); }
}

// Helper: Smart Bank Detection for Custom Cards
function getBankIcon(cardName) {
    const name = cardName.toLowerCase();
    if (name.includes('hdfc')) return { name: 'HDFC BANK', color: '#34D399' };
    if (name.includes('sbi')) return { name: 'SBI CARD', color: '#3b82f6' };
    if (name.includes('axis')) return { name: 'AXIS BANK', color: '#ef4444' };
    if (name.includes('icici')) return { name: 'ICICI BANK', color: '#f97316' };
    if (name.includes('tata')) return { name: 'TATA NEU', color: '#a855f7' };
    return { name: 'VAULT CARD', color: '#FBBF24' };
}

// Render Both Views (List & Grid) & Handle Empty State
function renderWalletUI(cards) {
    if(!walletGrid || !walletList) return;
    walletGrid.innerHTML = '';
    walletList.innerHTML = '';
    
    const badge = document.querySelector('#wallet-manager-toggle span');
    // --- NEW: Populate ALL Engine Dropdowns Dynamically ---
    const allEngineSelects = document.querySelectorAll('.vault-card-select, #engine-1-card-select, #engine-4-card-select');
    
    allEngineSelects.forEach(select => {
        select.innerHTML = cards.length === 0 ? '<option value="">No cards in vault</option>' : '';
    });

    cards.forEach(card => {
        allEngineSelects.forEach(select => {
            select.insertAdjacentHTML('beforeend', `<option value="${card.card_name}">${card.card_name}</option>`);
        });
    });
    // --------------------------------------------------
    
    // 1. EMPTY STATE LOGIC
    if (cards.length === 0) {
        if(badge) badge.textContent = "0 Active Cards";
        
        walletGrid.innerHTML = `<div style="width: 100%; text-align: center; padding: 40px; color: #94a3b8; background: rgba(0,0,0,0.4); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;">Your Digital Wallet is Empty (0 Cards).<br><br>Enter any credit card name above and click <strong>+ Add to Wallet</strong> to configure your independent cards.</div>`;
        walletList.innerHTML = `<div style="color: #64748b; font-size: 0.85rem; padding: 10px 0;">No active cards to manage.</div>`;
        return;
    }

    // Update Top Badge
    if(badge) badge.textContent = `${cards.length} Active Card${cards.length > 1 ? 's' : ''}`;
    
    cards.forEach((card, index) => {
        const bankInfo = getBankIcon(card.card_name);
        const isActive = index === 0 ? 'active' : '';

        // 2. Render Management List Row
        const row = document.createElement('div');
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 15px 20px; border-radius: 8px;";
        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 6px;">💳</span>
                <div style="display: flex; flex-direction: column;">
                    <span style="color: white; font-weight: bold; font-size: 0.95rem;">${card.card_name}</span>
                    <span style="color: ${bankInfo.color}; font-size: 0.65rem; font-weight: bold; letter-spacing: 1px;">${bankInfo.name}</span>
                </div>
            </div>
            <div style="display: flex; gap: 15px; align-items: center;">
                <div class="stepper" style="background: rgba(255,255,255,0.05); padding: 5px 10px;">
                    <button class="step-btn" onclick="updateLimit(${card.id}, ${card.credit_limit - 5000})">-</button>
                    <div class="step-val" style="width: 70px; text-align: center;">₹${card.credit_limit.toLocaleString('en-IN')}</div>
                    <button class="step-btn" onclick="updateLimit(${card.id}, ${card.credit_limit + 5000})">+</button>
                </div>
                <button class="action-btn outline-btn" onclick="deleteCard(${card.id})" style="border-color: rgba(239,68,68,0.4); color: #ef4444; margin: 0; padding: 8px 15px;">X Remove</button>
            </div>
        `;
        walletList.appendChild(row);

        // 3. Render Analytics Grid Card
        const gridCard = `
            <div class="wallet-card ${isActive}" style="background: rgba(8,16,12,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; flex: 1; min-width: 250px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span style="font-size: 0.65rem; color: ${bankInfo.color}; font-weight: bold; letter-spacing: 1px;">${bankInfo.name}</span>
                    <span style="color: #94a3b8; font-size: 0.75rem;">•••• ${String(card.id).padStart(4, '0')}</span>
                </div>
                <h4 style="color: white; font-size: 1.05rem; margin-bottom: 25px; line-height: 1.3;">${card.card_name}</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #64748b; font-size: 0.8rem;">Credit Limit:</span>
                    <span style="color: white; font-weight: bold; font-size: 0.85rem;">₹${card.credit_limit.toLocaleString('en-IN')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                    <span style="background: rgba(52,211,153,0.1); color: #34D399; font-size: 0.75rem; padding: 4px 10px; border-radius: 4px; font-weight: bold;">✔ Pacing Nominal</span>
                </div>
            </div>
        `;
        walletGrid.insertAdjacentHTML('beforeend', gridCard);
    });
}

// Add Card to DB
addWalletBtn?.addEventListener('click', async () => {
    const cardName = cardNameInput.value.trim();
    const limit = parseInt(limitDisplay.textContent);
    if(!cardName) return alert("Enter card name.");
    
    addWalletBtn.textContent = "Adding...";
    
    await fetch(API_BASE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: currentVaultUser, card_name: cardName, credit_limit: limit})
    });
    
    cardNameInput.value = '';
    limitDisplay.textContent = '50000';
    addWalletBtn.textContent = "+ Add to Wallet";
    loadWallet(); // Automatically re-renders UI
});

// Update Limit in DB
window.updateLimit = async function(id, newLimit) {
    if(newLimit < 5000) return;
    await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({credit_limit: newLimit})
    });
    loadWallet();
}

// Delete Card from DB
window.deleteCard = async function(id) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    loadWallet();
}

// Initialize on page load
if(walletGrid) loadWallet();

// Set initial width to 900px on page load
document.querySelector('.container').style.maxWidth = '900px';
document.querySelector('.navbar').style.maxWidth = '900px';
updateUI();

// --- ENGINE 1: Fee Waiver Target ---
document.getElementById('track-waiver-btn')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const cardSelect = document.getElementById('engine-1-card-select');
    if(!cardSelect || !cardSelect.value) return alert("Select a card first.");
    
    btn.textContent = "Fetching...";
    try {
        const res = await fetch('https://cardscoutai-app.onrender.com/api/engine/fee-waiver', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ card_name: cardSelect.value })
        });
        const data = await res.json();
        if(data.status === 'success') {
            const targetDisplay = document.getElementById('engine-1-target-display');
            if(targetDisplay) targetDisplay.textContent = `₹${data.target.toLocaleString('en-IN')}`;
            
            // ADD THIS EXACT LINE HERE:
            updateEngine1Math(); 
        }
    } catch (err) { console.error(err); }
    btn.textContent = "Track Waiver";
});

// --- ENGINE 7: Penalty Audit ---
document.getElementById('run-audit-btn')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const cardSelect = document.getElementById('engine-7-select');
    if(!cardSelect || !cardSelect.value) return alert("Select a card first.");
    
    btn.textContent = "Auditing Terms...";
    try {
        const res = await fetch('https://cardscoutai-app.onrender.com/api/engine/penalty', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ card_name: cardSelect.value })
        });
        const data = await res.json();
        
        if(data.status === 'success') {
            const audit = data.audit;
            
            // Inject the AI data directly into the 4 UI boxes
            document.getElementById('e7-joining-fee').textContent = audit.joining_fee || 'N/A'; // NEW LINE
            document.getElementById('e7-apr').textContent = audit.apr || 'N/A';
            document.getElementById('e7-late-fee').textContent = audit.late_fee || 'N/A';
            document.getElementById('e7-overlimit').textContent = audit.overlimit || 'N/A';
            document.getElementById('e7-cash-advance').textContent = audit.cash_advance || 'N/A';
            
            // Inject the dynamic red flag warning
            document.getElementById('e7-red-flag').textContent = audit.critical_warning || 'No critical warnings found for this card.';
        }
    } catch (err) { 
        console.error(err); 
        alert("Failed to fetch audit data from AI agent.");
    }
    btn.textContent = "⚠️ Run Forensic Audit";
});

// --- ENGINE 2: Live Offers ---
document.getElementById('scan-offers-btn')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const cardSelect = document.getElementById('engine-2-select');
    if(!cardSelect || !cardSelect.value) return alert("Select a card first.");
    
    btn.textContent = "Scanning Web...";
    try {
        const res = await fetch('https://cardscoutai-app.onrender.com/api/engine/live-offers', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ card_name: cardSelect.value })
        });
        const data = await res.json();
        if(data.status === 'success') {
            // Target the grid container and inject the AI-generated HTML blocks
            const grid = document.querySelector('#engine-2 .grid-template-columns, #engine-2 > div:last-child');
            if(grid) grid.innerHTML = data.html;
        }
    } catch (err) { console.error(err); }
    btn.textContent = "🎯 Scan Live Offers";
});

// --- ENGINE 3: Milestones ---
document.getElementById('check-milestones-btn')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const cardSelect = document.getElementById('engine-3-select');
    if(!cardSelect || !cardSelect.value) return alert("Select a card first.");
    
    btn.textContent = "Checking...";
    try {
        const res = await fetch('https://cardscoutai-app.onrender.com/api/engine/milestones', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ card_name: cardSelect.value })
        });
        const data = await res.json();
        
        if(data.status === 'success') {
            const container = document.getElementById('engine-3');
            container.querySelectorAll('div[style*="background: rgba(0,0,0,0.4)"]').forEach(el => el.remove());
            container.insertAdjacentHTML('beforeend', data.html);
            
            // --- NEW: Sync progress with Engine 1 Spend ---
            // 1. Get the current spend from Engine 1
            const spendText = document.getElementById('engine-1-spend')?.textContent || "0";
            const currentSpend = parseInt(spendText.replace(/\D/g, '')) || 0;
            
            // 2. Loop through all the new milestone blocks Gemini just generated
            const milestoneBlocks = container.querySelectorAll('div[style*="background: rgba(0,0,0,0.4)"]');
            
            milestoneBlocks.forEach(block => {
                // Find the target text (e.g., "Target: ₹3,00,000 spend") and extract the number
                const targetEl = block.querySelector('p[style*="font-size: 0.8rem"]');
                if (!targetEl) return;
                
                const targetText = targetEl.textContent;
                const targetNumber = parseInt(targetText.replace(/\D/g, '')) || 0;
                
                if (targetNumber > 0) {
                    // Calculate completion percentage
                    let percent = (currentSpend / targetNumber) * 100;
                    if (percent > 100) percent = 100;
                    
                    // Update the progress bar width
                    const barFill = block.querySelector('div[style*="background: #34D399"]');
                    if (barFill) barFill.style.width = `${percent}%`;
                    
                    // Update the "Tracking..." text to show completion percentage
                    const statusText = block.querySelector('div[style*="font-size: 0.75rem"] span:first-child');
                    if (statusText) {
                        statusText.textContent = percent >= 100 ? "✓ COMPLETED" : `${percent.toFixed(1)}% Completed`;
                        if (percent >= 100) statusText.style.color = "#34D399";
                    }
                }
            });
        }
    } catch (err) { console.error(err); }
    btn.textContent = "🏆 Check Milestones";
});

// --- ENGINE 5: Forex Engine & Live Currency API ---
let liveForexRates = { USD: 86.50, EUR: 93.20 }; // Fallback RBI rates
let activeForexCurrency = 'USD';
let activeCardMarkup = null; // BUG FIX: Track if a card was actually audited

async function fetchLiveExchangeRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.INR && data.rates.EUR) {
            liveForexRates.USD = data.rates.INR;
            liveForexRates.EUR = data.rates.INR / data.rates.EUR;
            document.getElementById('live-exchange-rate').textContent = `₹${liveForexRates[activeForexCurrency].toFixed(2)}`;
            updateForexMath();
        }
    } catch (err) {
        console.error("Live Rate API Failed, using RBI fallback", err);
        document.getElementById('live-exchange-rate').textContent = `₹${liveForexRates[activeForexCurrency].toFixed(2)} (Fallback)`;
    }
}

function updateForexMath() {
    const foreignAmount = parseFloat(document.getElementById('forex-foreign-amount').value) || 0;
    const currentRate = liveForexRates[activeForexCurrency];
    
    // Step 1: Base INR Conversion
    const baseInr = foreignAmount * currentRate;
    document.getElementById('forex-inr-preview').textContent = `≈ ₹${baseInr.toLocaleString('en-IN', {maximumFractionDigits: 0})} INR`;
    document.getElementById('forex-base-inr').textContent = `₹${baseInr.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
    
    // Only calculate markup if we have fetched it from Gemini
    if (activeCardMarkup !== null) {
        // Step 2: Bank Markup Fee
        const markupFee = baseInr * (activeCardMarkup / 100);
        document.getElementById('forex-markup-fee').textContent = `+₹${markupFee.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
        
        // Step 3: Mandatory 18% GST (Applied ONLY on the Markup Fee, not the base amount)
        const gstFee = markupFee * 0.18;
        document.getElementById('forex-gst-fee').textContent = `+₹${gstFee.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
        
        // Step 4: Total Outflow
        const totalOutflow = baseInr + markupFee + gstFee;
        document.getElementById('forex-total-outflow').textContent = `₹${totalOutflow.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
        
        // Step 5: Savings Alert (If user had a 0% card)
        const savingsAlert = document.getElementById('forex-savings-alert');
        if (activeCardMarkup > 0) {
            const savings = markupFee + gstFee;
            document.getElementById('forex-savings-amt').textContent = `₹${savings.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
            savingsAlert.style.display = 'block';
        } else {
            savingsAlert.style.display = 'none';
        }
    } else {
        // Reset if no card audited yet
        document.getElementById('forex-markup-fee').textContent = `+₹0`;
        document.getElementById('forex-gst-fee').textContent = `+₹0`;
        document.getElementById('forex-total-outflow').textContent = `₹${baseInr.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
        document.getElementById('forex-savings-alert').style.display = 'none';
    }
}

// Event Listener: Currency Toggle (USD/EUR)
document.getElementById('forex-currency-selector')?.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        // Update UI styling for active button
        document.querySelectorAll('#forex-currency-selector button').forEach(btn => {
            btn.style.background = 'rgba(255,255,255,0.05)';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
            btn.style.color = '#94a3b8';
        });
        e.target.style.background = '#3b82f6';
        e.target.style.border = '1px solid #60a5fa';
        e.target.style.color = 'white';
        
        // Update State
        activeForexCurrency = e.target.getAttribute('data-currency');
        document.getElementById('currency-symbol').textContent = activeForexCurrency === 'USD' ? '$' : '€';
        document.getElementById('live-exchange-rate').textContent = `₹${liveForexRates[activeForexCurrency].toFixed(2)}`;
        
        updateForexMath();
    }
});

// Event Listener: User Types Amount
document.getElementById('forex-foreign-amount')?.addEventListener('input', updateForexMath);

// Fetch rates once on page load
fetchLiveExchangeRates();

// Event Listener: AI Sync Button
document.getElementById('calc-forex-btn')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const cardSelect = document.getElementById('engine-5-select');
    if(!cardSelect || !cardSelect.value) return alert("Select a card first.");
    
    btn.textContent = "Syncing Rates & Analyzing...";
    
    // Force a fresh fetch of the live market rates
    await fetchLiveExchangeRates();
    
    try {
        const res = await fetch('https://cardscoutai-app.onrender.com/api/engine/forex', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ card_name: cardSelect.value })
        });
        const data = await res.json();
        
        if(data.status === 'success') {
            // BUG FIX: Aggressive Regex Extraction
            // If Gemini says "The markup is 3.5%", this extracts exactly "3.5"
            const rawMarkup = String(data.markup);
            const match = rawMarkup.match(/\d+(\.\d+)?/);
            activeCardMarkup = match ? parseFloat(match[0]) : 0;
            
            // Update labels with the fetched AI markup
            const rateEl = document.getElementById('forex-markup-rate');
            if(rateEl) rateEl.textContent = activeCardMarkup;
            document.getElementById('forex-markup-label').textContent = `Bank Forex Markup (${activeCardMarkup}%):`;
            
            // Re-run the math with the new activeCardMarkup
            updateForexMath();
        }
    } catch (err) { console.error(err); }
    btn.textContent = "🌐 Sync Live Rates & Calculate";
});

// --- ENGINE 8: CardScout Co-Pilot ---
async function handleCopilotQuery(description, amount) {
    const chatBox = document.getElementById('copilot-chat-box');
    
    // 1. AUTHENTICATION LOCK: Prevent guests from using the AI
    const isLoggedIn = localStorage.getItem("commanderID");
    if (!isLoggedIn) {
        const errorHtml = `
            <div style="display: flex; gap: 15px; align-items: flex-start; margin-top: 10px;">
                <div style="background: rgba(239,68,68,0.1); color: #ef4444; padding: 10px; border-radius: 8px; font-size: 1.2rem;">🔒</div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(239,68,68,0.2); padding: 15px; border-radius: 8px; color: #e2e8f0; font-size: 0.9rem; line-height: 1.5;">
                    <strong style="color: #ef4444;">Access Denied.</strong><br>
                    You must log in to the Obsidian Vault to use the AI Co-Pilot.
                </div>
            </div>`;
        chatBox.insertAdjacentHTML('beforeend', errorHtml);
        chatBox.scrollTop = chatBox.scrollHeight;
        return; 
    }

    // 2. Append User Message
    const userHtml = `
        <div style="display: flex; justify-content: flex-end; width: 100%;">
            <div style="background: #34D399; color: #022c22; padding: 12px 18px; border-radius: 8px; border-top-right-radius: 0; font-size: 0.9rem; font-weight: bold;">
                ${description} - ₹${Number(amount).toLocaleString('en-IN')}
            </div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', userHtml);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 3. SHOW LOADING INDICATOR
    const loadingId = 'loading-' + Date.now();
    const loadingHtml = `
        <div id="${loadingId}" style="display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: rgba(52,211,153,0.1); color: #34D399; padding: 10px; border-radius: 8px; font-size: 1.2rem;">🤖</div>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-top-left-radius: 0; color: #94a3b8; font-size: 0.9rem;">
                Analyzing wallet multipliers and CIBIL impact...
            </div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', loadingHtml);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 4. Pre-compute Wallet Utilization Matrix
    const walletMatrix = (typeof window.walletCards !== 'undefined' ? window.walletCards : []).map(card => {
        const currentSpend = parseInt(document.getElementById('engine-1-spend')?.value || 0);
        const limit = card.credit_limit || 50000;
        const projectedSpend = currentSpend + Number(amount);
        const projectedUtil = ((projectedSpend / limit) * 100).toFixed(1);
        return {
            card_name: card.card_name,
            limit: limit,
            projected_utilization: parseFloat(projectedUtil),
            is_cibil_safe: projectedUtil <= 30.0
        };
    });

    // 5. Send to Backend
    try {
        const res = await fetch('https://cardscoutai-app.onrender.com/api/engine/copilot-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, amount, wallet_matrix: walletMatrix })
        });
        
        const data = await res.json();
        document.getElementById(loadingId)?.remove();
        
        if (data.status !== 'success') {
            throw new Error(data.detail || "AI generation failed");
        }
        
        const aiHtml = `
            <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div style="background: rgba(52,211,153,0.1); color: #34D399; padding: 10px; border-radius: 8px; font-size: 1.2rem;">🤖</div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-top-left-radius: 0; color: #e2e8f0; font-size: 0.9rem; line-height: 1.6; max-width: 85%;">
                    ${data.recommendation.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        chatBox.insertAdjacentHTML('beforeend', aiHtml);
        chatBox.scrollTop = chatBox.scrollHeight;
        
    } catch (err) {
        document.getElementById(loadingId)?.remove();
        console.error("Co-Pilot Error:", err);
        
        const errHtml = `
            <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div style="background: rgba(239,68,68,0.1); color: #ef4444; padding: 10px; border-radius: 8px; font-size: 1.2rem;">⚠️</div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(239,68,68,0.2); padding: 15px; border-radius: 8px; border-top-left-radius: 0; color: #ef4444; font-size: 0.9rem; max-width: 85%;">
                    Connection to AI Core failed. Ensure your Python backend is running and API keys are valid.
                </div>
            </div>
        `;
        chatBox.insertAdjacentHTML('beforeend', errHtml);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

}

// Listeners for Send Button
document.getElementById('copilot-send-btn')?.addEventListener('click', () => {
    const desc = document.getElementById('copilot-desc').value;
    const amt = document.getElementById('copilot-amt').value;
    if(desc && amt) {
        handleCopilotQuery(desc, amt);
        document.getElementById('copilot-desc').value = '';
        document.getElementById('copilot-amt').value = '';
    }
});

// Listeners for Quick Scenario Pills
document.querySelectorAll('.copilot-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
        const desc = e.target.getAttribute('data-desc');
        const amt = e.target.getAttribute('data-amt');
        handleCopilotQuery(desc, amt);
    });
});

// --- ENGINE 6: Arbitrage Engine (Points Valuation) ---
let currentPointRates = null; 
let selectedE6Box = null; // Tracks if you manually clicked a box

function updateEngine6Math() {
    if (!currentPointRates) return; 

    const pointsInput = document.getElementById('engine-6-points-input');
    const points = parseInt(pointsInput.value) || 0;

    const values = {
        cash: { type: 'Cash Statement Credit', val: points * (currentPointRates.cash_rate || 0), el: 'e6-box-cash', textEl: 'e6-val-cash' },
        voucher: { type: 'Brand Vouchers', val: points * (currentPointRates.voucher_rate || 0), el: 'e6-box-voucher', textEl: 'e6-val-voucher' },
        travel: { type: 'Travel / Airmiles', val: points * (currentPointRates.travel_rate || 0), el: 'e6-box-travel', textEl: 'e6-val-travel' }
    };

    // Update text values
    document.getElementById('e6-val-cash').textContent = `₹${values.cash.val.toLocaleString('en-IN')}`;
    document.getElementById('e6-val-voucher').textContent = `₹${values.voucher.val.toLocaleString('en-IN')}`;
    document.getElementById('e6-val-travel').textContent = `₹${values.travel.val.toLocaleString('en-IN')}`;
    
    document.getElementById('e6-rate-cash').textContent = `Rate: ₹${currentPointRates.cash_rate} / point`;
    document.getElementById('e6-rate-voucher').textContent = `Rate: ₹${currentPointRates.voucher_rate} / point`;
    document.getElementById('e6-rate-travel').textContent = `Rate: ₹${currentPointRates.travel_rate} / point`;

    // Find the mathematical best option
    const valsArr = [values.cash, values.voucher, values.travel];
    const max = valsArr.reduce((prev, curr) => (prev.val > curr.val) ? prev : curr);
    
    // Default to the best option if the user hasn't clicked one manually
    const activeSelection = selectedE6Box ? values[selectedE6Box] : max;

    // Reset styles & make boxes clickable
    valsArr.forEach(v => {
        const box = document.getElementById(v.el);
        box.style.borderColor = 'rgba(255,255,255,0.05)';
        box.style.cursor = 'pointer'; 
        document.getElementById(v.textEl).style.color = 'white';
    });

    // Highlight the selected box and update the arbitrage banner
    if (activeSelection.val > 0 || points === 0) {
        const isOptimal = activeSelection.val === max.val;
        
        document.getElementById(activeSelection.el).style.borderColor = isOptimal ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)';
        document.getElementById(activeSelection.textEl).style.color = isOptimal ? '#34D399' : '#ef4444';
        
        const alertBox = document.getElementById('e6-arbitrage-alert');
        alertBox.style.display = 'block';
        if (isOptimal) {
            alertBox.style.background = 'rgba(52,211,153,0.05)';
            alertBox.style.borderColor = 'rgba(52,211,153,0.2)';
            document.getElementById('e6-arb-title').innerHTML = `✨ Optimal Choice Detected: +₹${activeSelection.val.toLocaleString('en-IN')}`;
            document.getElementById('e6-arb-title').style.color = '#34D399';
            
            // Added the "Why" for optimal choices
            document.getElementById('e6-arb-desc').innerHTML = `Choosing ${activeSelection.type} yields the maximum possible return.<br><span style="color: #64748b; font-size: 0.75rem; margin-top: 8px; display: inline-block;"><strong>The Logic:</strong> Banks subsidize this specific redemption channel, giving your points their absolute highest purchasing power.</span>`;
        } else {
            const loss = max.val - activeSelection.val;
            alertBox.style.background = 'rgba(239,68,68,0.05)';
            alertBox.style.borderColor = 'rgba(239,68,68,0.2)';
            document.getElementById('e6-arb-title').innerHTML = `⚠️ Arbitrage Loss Warning: -₹${loss.toLocaleString('en-IN')}`;
            document.getElementById('e6-arb-title').style.color = '#ef4444';
            
            // Added the "Why" for losing choices
            document.getElementById('e6-arb-desc').innerHTML = `Redeeming for ${activeSelection.type} loses you ₹${loss.toLocaleString('en-IN')} compared to the best option (${max.type}).<br><span style="color: #94a3b8; font-size: 0.75rem; margin-top: 8px; display: inline-block;"><strong>The Trap:</strong> Banks deliberately devalue the per-point conversion rate on this channel to control their reward payout costs.</span>`;
        }
    }
}

// Input and Click Listeners
document.getElementById('engine-6-points-input')?.addEventListener('input', updateEngine6Math);
document.getElementById('e6-box-cash')?.addEventListener('click', () => { selectedE6Box = 'cash'; updateEngine6Math(); });
document.getElementById('e6-box-voucher')?.addEventListener('click', () => { selectedE6Box = 'voucher'; updateEngine6Math(); });
document.getElementById('e6-box-travel')?.addEventListener('click', () => { selectedE6Box = 'travel'; updateEngine6Math(); });

document.getElementById('eval-points-btn')?.addEventListener('click', async (e) => {
    const btn = e.target;
    const cardSelect = document.getElementById('engine-6-select');
    if(!cardSelect || !cardSelect.value) return alert("Select a card first.");
    
    btn.textContent = "Analyzing Redemptions...";
    try {
        const res = await fetch('https://cardscoutai-app.onrender.com/api/engine/points', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ card_name: cardSelect.value })
        });
        const data = await res.json();
        
        if(data.status === 'success') {
            currentPointRates = data.rates; 
            selectedE6Box = null; // Reset manual selection on new scan
            updateEngine6Math(); 
        }
    } catch (err) { console.error(err); }
    btn.textContent = "📈 Evaluate Points";
});

// --- ENGINE 1: Live Pacing Math Recalculation ---
function updateEngine1Math() {
    const targetText = document.getElementById('engine-1-target-display')?.textContent || "0";
    const spendText = document.getElementById('engine-1-spend')?.value || "0";
    const monthsVal = document.getElementById('months-slider')?.value || 1;
    
    // Clean strings to get numbers
    const target = parseInt(targetText.replace(/\D/g, '')) || 0;
    const currentSpend = parseInt(spendText.replace(/\D/g, '')) || 0;
    const months = parseInt(monthsVal) || 1;
    
    // Also update the math months display
    const mathMonthsDisplay = document.getElementById('math-months-display');
    if(mathMonthsDisplay) mathMonthsDisplay.textContent = months;

    const remainingDisplay = document.getElementById('engine-1-remaining');
    const monthlyDisplay = document.getElementById('engine-1-monthly-target');
    const verdictContainer = document.querySelector('#engine-1 > div:last-child > div');

    // IF TARGET IS 0 (Not fetched yet), Keep the Waiting State
    if (target === 0) {
        if(remainingDisplay) remainingDisplay.textContent = '---';
        if(monthlyDisplay) monthlyDisplay.textContent = '---';
        if(verdictContainer) {
            verdictContainer.style.background = "rgba(255,255,255,0.05)";
            verdictContainer.style.borderColor = "rgba(255,255,255,0.1)";
            verdictContainer.style.textAlign = "center";
            verdictContainer.innerHTML = 'Select a card and click "Track Waiver" to calculate pacing.';
        }
        return; 
    }

    const cardSelect = document.getElementById('engine-1-card-select');
    const selectedCardName = cardSelect ? cardSelect.value : "";
    const cardData = typeof walletCards !== 'undefined' ? walletCards.find(c => c.card_name === selectedCardName) : null;
    const limit = cardData ? cardData.credit_limit : 50000;

    const remaining = Math.max(0, target - currentSpend);
    const monthlyTarget = Math.ceil(remaining / months);
    const utilization = limit > 0 ? ((monthlyTarget / limit) * 100).toFixed(1) : 0;

    if (remainingDisplay) remainingDisplay.textContent = `₹${remaining.toLocaleString('en-IN')}`;
    if (monthlyDisplay) monthlyDisplay.textContent = `₹${monthlyTarget.toLocaleString('en-IN')}`;
    
    if (verdictContainer) {
        verdictContainer.style.textAlign = "left"; // Reset alignment
        
        if (remaining === 0) {
            verdictContainer.style.background = "rgba(52,211,153,0.05)";
            verdictContainer.style.borderColor = "rgba(52,211,153,0.2)";
            verdictContainer.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div style="color: #34D399; font-size: 1.2rem;">✓</div>
                    <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6;"><strong style="color: white;">VERDICT: TARGET MET.</strong> Annual fee waived. You have already reached the target! No further spend required.</p>
                </div>
            `;
        } else if (utilization <= 30.0) {
            verdictContainer.style.background = "rgba(52,211,153,0.05)";
            verdictContainer.style.borderColor = "rgba(52,211,153,0.2)";
            verdictContainer.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div style="color: #34D399; font-size: 1.2rem;">●</div>
                    <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6;"><strong style="color: white;">VERDICT: ON TRACK.</strong> This requires a safe <strong style="color:#34D399">${utilization}%</strong> monthly utilization of your <strong>₹${limit.toLocaleString('en-IN')}</strong> limit. Waives fee with 0 CIBIL penalty.</p>
                </div>
            `;
        } else {
            verdictContainer.style.background = "rgba(239,68,68,0.05)";
            verdictContainer.style.borderColor = "rgba(239,68,68,0.2)";
            verdictContainer.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div style="color: #ef4444; font-size: 1.2rem;">●</div>
                    <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6;"><strong style="color: white;">VERDICT: HOLD.</strong> This requires a <strong style="color:#ef4444">${utilization}%</strong> monthly utilization of your <strong>₹${limit.toLocaleString('en-IN')}</strong> limit. Exceeding the 30% Golden Rule will damage your CIBIL score.</p>
                </div>
            `;
        }
    }
}

// Listen for Slider Changes
document.getElementById('months-slider')?.addEventListener('input', (e) => {
    document.getElementById('months-display').textContent = e.target.value;
    updateEngine1Math();
});

// Listen for Plus/Minus Button Clicks (Delegation)
document.querySelector('#engine-1 .stepper')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('step-btn')) {
        const spendDisplay = document.getElementById('engine-1-spend');
        let currentSpend = parseInt(spendDisplay.textContent.replace(/\D/g, '')) || 0;
        
        if (e.target.classList.contains('plus')) {
            currentSpend += 1000;
        } else if (e.target.classList.contains('minus')) {
            currentSpend = Math.max(0, currentSpend - 1000);
        }
        
        spendDisplay.textContent = currentSpend;
        updateEngine1Math(); // Trigger math update!
    }
});

// Listen for Slider Changes
document.getElementById('months-slider')?.addEventListener('input', (e) => {
    document.getElementById('months-display').textContent = e.target.value;
    updateEngine1Math();
});

// --- ENGINE 1: Keyboard Typing & Stepper Listeners ---

// 1. Listen for direct keyboard typing
document.getElementById('engine-1-spend')?.addEventListener('input', updateEngine1Math);

// 2. Listen for the + / - stepper buttons
document.querySelector('#engine-1 .stepper')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('step-btn')) {
        const spendInput = document.getElementById('engine-1-spend');
        let currentSpend = parseInt(spendInput.value) || 0;
        
        if (e.target.classList.contains('plus')) {
            currentSpend += 1000;
        } else if (e.target.classList.contains('minus')) {
            currentSpend = Math.max(0, currentSpend - 1000);
        }
        
        spendInput.value = currentSpend;
        updateEngine1Math(); // Trigger math update!
    }
});


// --- Navigation: Open Co-Pilot Modal ---
document.getElementById('copilot-nav-btn')?.addEventListener('click', (e) => {
    e.preventDefault(); 
    
    // 1. Check if the user is currently logged in
    const isLoggedIn = localStorage.getItem("commanderID");

    if (!isLoggedIn) {
        alert("Please breach the Vault (Log in) first to access the AI Co-Pilot.");
        document.getElementById('vault-nav-btn')?.click();
        return;
    }

    // 2. Unhide the Popup!
    const copilotModal = document.getElementById('copilot-modal');
    if (copilotModal) {
        copilotModal.classList.remove('hidden');
        
        // Auto-scroll to the bottom of the chat box when it opens
        const chatBox = document.getElementById('copilot-chat-box');
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }
});

// Close Co-Pilot Modal
document.getElementById('close-copilot-btn')?.addEventListener('click', () => {
    document.getElementById('copilot-modal')?.classList.add('hidden');
});

// --- PDF EXPORT LOGIC ---
document.querySelector('.export-btn')?.addEventListener('click', async function() {
    const btn = this;
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ Generating Report...";
    
    try {
        const name = document.getElementById('user-name').value || "User";
        const narrativeHTML = document.getElementById('dynamic-ai-text').innerHTML;
        // Strip HTML from narrative for the payload
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = narrativeHTML;
        const narrative = tempDiv.textContent || tempDiv.innerText || "";

        const payload = {
            name: name,
            narrative: narrative,
            cards: aiCardsData 
        };

        const response = await fetch('https://cardscoutai-app.onrender.com/api/export-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Failed to generate PDF");

        // Download the binary PDF file returned by Python
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CardScout_Roadmap_${name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        btn.innerHTML = originalText;
    } catch (err) {
        console.error("PDF Export Error:", err);
        btn.innerHTML = "⚠️ Export Failed";
        setTimeout(() => btn.innerHTML = originalText, 3000);
    }
});
