# core/db_manager.py
import os
import hashlib
import psycopg2
from psycopg2 import IntegrityError
from dotenv import load_dotenv

# Load local environment variables from api.env (if running locally)
load_dotenv("api.env")

def get_conn():
    """Smart connection handler that works locally and on Streamlit Cloud."""
    db_url = os.environ.get("DATABASE_URL")
    
    if not db_url:
        try:
            import streamlit as st
            db_url = st.secrets["DATABASE_URL"]
        except Exception:
            pass
            
    if not db_url:
        raise ValueError("DATABASE_URL missing. Please set it in api.env or Streamlit Secrets.")
        
    return psycopg2.connect(db_url)

def init_db():
    """Creates the necessary tables in PostgreSQL if they don't exist."""
    conn = get_conn()
    c = conn.cursor()
    
    # User Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL
        )
    ''')
    
    # Subscriptions Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            service_name TEXT NOT NULL,
            monthly_cost REAL NOT NULL,
            card_used TEXT NOT NULL,
            FOREIGN KEY(username) REFERENCES users(username)
        )
    ''')

    # Digital Wallet Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS wallet (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            card_name TEXT NOT NULL,
            card_limit REAL NOT NULL,
            FOREIGN KEY(username) REFERENCES users(username)
        )
    ''')
    
    conn.commit()
    c.close()
    conn.close()

def hash_password(password, salt=None):
    if salt is None:
        salt = os.urandom(16).hex()
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return pwd_hash, salt

def create_user(username, password):
    try:
        conn = get_conn()
        c = conn.cursor()
        pwd_hash, salt = hash_password(password)
        c.execute("INSERT INTO users (username, password_hash, salt) VALUES (%s, %s, %s)", (username, pwd_hash, salt))
        conn.commit()
        c.close()
        conn.close()
        return True
    except IntegrityError:
        return False 

def verify_user(username, password):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT password_hash, salt FROM users WHERE username=%s", (username,))
    result = c.fetchone()
    c.close()
    conn.close()
    
    if result:
        stored_hash, salt = result
        pwd_hash, _ = hash_password(password, salt)
        return pwd_hash == stored_hash
    return False

# --- SUBSCRIPTION FUNCTIONS ---
def add_subscription(username, service_name, monthly_cost, card_used):
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO subscriptions (username, service_name, monthly_cost, card_used) VALUES (%s, %s, %s, %s)", 
              (username, service_name, monthly_cost, card_used))
    conn.commit()
    c.close()
    conn.close()

def get_subscriptions(username):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT service_name, monthly_cost, card_used FROM subscriptions WHERE username=%s", (username,))
    results = c.fetchall()
    c.close()
    conn.close()
    return results

def delete_subscription(username, service_name, card_used):
    """Deletes a tracked subscription linked to a SPECIFIC card."""
    conn = get_conn()
    c = conn.cursor()
    c.execute("DELETE FROM subscriptions WHERE username = %s AND service_name = %s AND card_used = %s", (username, service_name, card_used))
    conn.commit()
    c.close()
    conn.close()

def update_subscription_card(username, service_name, new_card):
    """Re-routes an existing subscription to a different card."""
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE subscriptions SET card_used = %s WHERE username = %s AND service_name = %s", (new_card, username, service_name))
    conn.commit()
    c.close()
    conn.close()

# --- NEW DIGITAL WALLET FUNCTIONS ---
def add_wallet_card(username, card_name, card_limit):
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO wallet (username, card_name, card_limit) VALUES (%s, %s, %s)", (username, card_name, card_limit))
    conn.commit()
    c.close()
    conn.close()

def remove_wallet_card(username, card_name):
    conn = get_conn()
    c = conn.cursor()
    c.execute("DELETE FROM wallet WHERE username=%s AND card_name=%s", (username, card_name))
    conn.commit()
    c.close()
    conn.close()

def update_wallet_limit(username, card_name, new_limit):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE wallet SET card_limit=%s WHERE username=%s AND card_name=%s", (new_limit, username, card_name))
    conn.commit()
    c.close()
    conn.close()

def get_wallet_cards(username):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT card_name, card_limit FROM wallet WHERE username=%s", (username,))
    results = c.fetchall()
    c.close()
    conn.close()
    return results

# Initialize the database immediately
init_db()