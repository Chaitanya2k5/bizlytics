from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import pandas as pd
import os
import io
import re
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI(title="BizLytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database Setup ───────────────────────────────────────────────
DB_PATH = "bizlytics.db"
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)

def init_db():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                color TEXT DEFAULT '#f0b429',
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                profile_id INTEGER NOT NULL DEFAULT 0,
                filename TEXT,
                date TEXT,
                product TEXT,
                category TEXT,
                quantity_sold REAL,
                unit_price REAL,
                unit_cost REAL,
                stock_remaining REAL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (profile_id) REFERENCES profiles(id)
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                profile_id INTEGER NOT NULL DEFAULT 0,
                filename TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (profile_id) REFERENCES profiles(id)
            )
        """))
        conn.commit()

init_db()

# ── Auth Helpers ─────────────────────────────────────────────────
SECRET_KEY = "bizlytics-secret-key-2025"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(days=7)
    return jwt.encode(
        {"user_id": user_id, "email": email, "exp": expire},
        SECRET_KEY, algorithm=ALGORITHM
    )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ── Data Helpers ─────────────────────────────────────────────────
def get_df(user_id: int, profile_id: int):
    with engine.connect() as conn:
        df = pd.read_sql(
            "SELECT * FROM sales WHERE user_id = :uid AND profile_id = :pid",
            conn, params={"uid": user_id, "pid": profile_id}
        )
    return df

def get_data_summary(df=None):
    if df is None or df.empty:
        return "No data uploaded yet."

    df = df.copy()
    df["revenue"] = df["quantity_sold"] * df["unit_price"]
    df["cost"]    = df["quantity_sold"] * df["unit_cost"]
    df["profit"]  = df["revenue"] - df["cost"]

    total_revenue = df["revenue"].sum()
    total_profit  = df["profit"].sum()
    margin        = (total_profit / total_revenue * 100) if total_revenue else 0
    top_product   = df.groupby("product")["profit"].sum().idxmax()
    low_product   = df.groupby("product")["profit"].sum().idxmin()

    latest_stock  = df.sort_values("date").groupby("product")["stock_remaining"].last()
    stock_lines   = "\n".join([f"  - {p}: {int(v)} units remaining" for p, v in latest_stock.items()])
    low_stock     = [f"{p} ({int(v)} units)" for p, v in latest_stock.items() if 0 < v < 50]
    out_of_stock  = [f"{p}" for p, v in latest_stock.items() if v == 0]

    return f"""
Business Data Summary:
- Total Revenue: Rs.{total_revenue:,.0f}
- Total Profit: Rs.{total_profit:,.0f}
- Profit Margin: {margin:.1f}%
- Most profitable product: {top_product}
- Least profitable product: {low_product}
- Low stock items (under 50 units): {low_stock if low_stock else 'None'}
- Out of stock: {out_of_stock if out_of_stock else 'None'}

Current stock levels:
{stock_lines}

- Date range: {df['date'].min()} to {df['date'].max()}
"""

# ── Auth Routes ──────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/signup")
def signup(req: SignupRequest):
    with engine.connect() as conn:
        existing = conn.execute(
            text("SELECT id FROM users WHERE email = :e"),
            {"e": req.email}
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed = hash_password(req.password)
        result = conn.execute(
            text("INSERT INTO users (name, email, password) VALUES (:n, :e, :p)"),
            {"n": req.name, "e": req.email, "p": hashed}
        )
        conn.commit()
        user_id = result.lastrowid

    token = create_token(user_id, req.email)
    return {"token": token, "name": req.name, "email": req.email}

@app.post("/login")
def login(req: LoginRequest):
    with engine.connect() as conn:
        user = conn.execute(
            text("SELECT id, name, password FROM users WHERE email = :e"),
            {"e": req.email}
        ).fetchone()

    if not user or not verify_password(req.password, user[2]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user[0], req.email)
    return {"token": token, "name": user[1], "email": req.email}

# ── Profile Routes ───────────────────────────────────────────────
class ProfileRequest(BaseModel):
    name: str
    color: str = "#f0b429"

@app.get("/profiles")
def get_profiles(user_id: int = Depends(get_current_user)):
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, name, color, created_at FROM profiles WHERE user_id = :uid ORDER BY created_at ASC"),
            {"uid": user_id}
        ).fetchall()
    return {"profiles": [{"id": r[0], "name": r[1], "color": r[2], "created_at": r[3]} for r in rows]}

@app.post("/profiles")
def create_profile(req: ProfileRequest, user_id: int = Depends(get_current_user)):
    with engine.connect() as conn:
        result = conn.execute(
            text("INSERT INTO profiles (user_id, name, color) VALUES (:uid, :n, :c)"),
            {"uid": user_id, "n": req.name, "c": req.color}
        )
        conn.commit()
        profile_id = result.lastrowid
    return {"id": profile_id, "name": req.name, "color": req.color}

@app.delete("/profiles/{profile_id}")
def delete_profile(profile_id: int, user_id: int = Depends(get_current_user)):
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM sales WHERE profile_id = :pid AND user_id = :uid"),
            {"pid": profile_id, "uid": user_id}
        )
        conn.execute(
            text("DELETE FROM files WHERE profile_id = :pid AND user_id = :uid"),
            {"pid": profile_id, "uid": user_id}
        )
        conn.execute(
            text("DELETE FROM profiles WHERE id = :pid AND user_id = :uid"),
            {"pid": profile_id, "uid": user_id}
        )
        conn.commit()
    return {"message": "Business profile deleted"}

# ── Route 1: Upload CSV ──────────────────────────────────────────
@app.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    profile_id: int = 0,
    user_id: int = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    required = {"date", "product", "quantity_sold", "unit_price", "unit_cost", "stock_remaining"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")

    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
    df["filename"] = file.filename
    df["user_id"] = user_id
    df["profile_id"] = profile_id

    with engine.connect() as conn:
        existing = conn.execute(
            text("SELECT id FROM files WHERE filename = :f AND user_id = :uid AND profile_id = :pid"),
            {"f": file.filename, "uid": user_id, "pid": profile_id}
        ).fetchone()

        if existing:
            return {"message": f"{file.filename} already uploaded", "rows": 0, "status": "ok"}

        conn.execute(
            text("INSERT INTO files (filename, user_id, profile_id) VALUES (:f, :uid, :pid)"),
            {"f": file.filename, "uid": user_id, "pid": profile_id}
        )
        df[["user_id","profile_id","filename","date","product","category",
            "quantity_sold","unit_price","unit_cost","stock_remaining"]].to_sql(
            "sales", conn, if_exists="append", index=False
        )
        conn.commit()

    return {"message": "Uploaded successfully", "rows": len(df), "status": "ok"}

# ── Route: List files ────────────────────────────────────────────
@app.get("/files")
def list_files(profile_id: int = 0, user_id: int = Depends(get_current_user)):
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT filename FROM files WHERE user_id = :uid AND profile_id = :pid"),
            {"uid": user_id, "pid": profile_id}
        ).fetchall()
    return {"files": [r[0] for r in rows]}

# ── Route: Remove file ───────────────────────────────────────────
@app.delete("/remove-csv/{filename}")
def remove_csv(filename: str, profile_id: int = 0, user_id: int = Depends(get_current_user)):
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM sales WHERE filename = :f AND user_id = :uid AND profile_id = :pid"),
            {"f": filename, "uid": user_id, "pid": profile_id}
        )
        conn.execute(
            text("DELETE FROM files WHERE filename = :f AND user_id = :uid AND profile_id = :pid"),
            {"f": filename, "uid": user_id, "pid": profile_id}
        )
        conn.commit()
    return {"message": f"{filename} removed"}

# ── Route 2: Reports ─────────────────────────────────────────────
@app.get("/reports")
def get_reports(profile_id: int = 0, user_id: int = Depends(get_current_user)):
    df = get_df(user_id, profile_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="No data uploaded yet")

    df["revenue"] = df["quantity_sold"] * df["unit_price"]
    df["cost"]    = df["quantity_sold"] * df["unit_cost"]
    df["profit"]  = df["revenue"] - df["cost"]

    total_revenue = float(df["revenue"].sum())
    total_cost    = float(df["cost"].sum())
    total_profit  = float(df["profit"].sum())
    margin        = round(total_profit / total_revenue * 100, 1) if total_revenue else 0

    df["month"] = pd.to_datetime(df["date"]).dt.to_period("M").astype(str)
    monthly = (
        df.groupby("month")
        .agg(revenue=("revenue","sum"), profit=("profit","sum"), cost=("cost","sum"))
        .reset_index()
        .to_dict(orient="records")
    )

    by_product = (
        df.groupby("product")
        .agg(revenue=("revenue","sum"), profit=("profit","sum"),
             quantity=("quantity_sold","sum"), stock=("stock_remaining","last"))
        .reset_index()
    )
    by_product["margin"] = (by_product["profit"] / by_product["revenue"] * 100).round(1)
    product_data = by_product.to_dict(orient="records")

    by_category = (
        df.groupby("category")
        .agg(revenue=("revenue","sum"), profit=("profit","sum"))
        .reset_index()
        .to_dict(orient="records")
    )

    latest = df.sort_values("date").groupby("product")["stock_remaining"].last().reset_index()
    inventory = []
    for _, row in latest.iterrows():
        stock = int(row["stock_remaining"])
        status = "out_of_stock" if stock == 0 else "low" if stock < 50 else "medium" if stock < 150 else "good"
        inventory.append({"product": row["product"], "stock": stock, "status": status})

    top3 = by_product.nlargest(3, "profit")[["product","profit"]].to_dict(orient="records")
    bot3 = by_product.nsmallest(3, "profit")[["product","profit"]].to_dict(orient="records")

    return {
        "kpis": {"total_revenue": total_revenue, "total_cost": total_cost,
                 "total_profit": total_profit, "margin": margin},
        "monthly": monthly,
        "products": product_data,
        "categories": by_category,
        "inventory": inventory,
        "top_performers": top3,
        "bottom_performers": bot3,
    }

# ── Route 3: AI Chat ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    profile_id: int = 0

@app.post("/chat")
async def chat(req: ChatRequest, user_id: int = Depends(get_current_user)):
    df = get_df(user_id, req.profile_id)
    summary = get_data_summary(df)
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a friendly business advisor helping a small business owner. Reply in simple plain English, 2-4 sentences max. Use actual numbers from the data. Use Rs. for currency."
                },
                {
                    "role": "user",
                    "content": f"Here is their business data:\n{summary}\n\nTheir question: {req.message}"
                }
            ],
            max_tokens=200
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        return {"reply": f"AI error: {str(e)}"}

# ── Route 4: Add/Remove stock ────────────────────────────────────
class StockRequest(BaseModel):
    instruction: str
    profile_id: int = 0

@app.post("/add-stock")
async def add_stock(req: StockRequest, user_id: int = Depends(get_current_user)):
    df = get_df(user_id, req.profile_id)
    if df.empty:
        raise HTTPException(status_code=404, detail="No data uploaded yet")

    message = req.instruction.lower()
    is_remove = any(w in message for w in ["remove","reduce","subtract","deduct","take","sold","minus"])
    numbers = re.findall(r'\d+', message)
    if not numbers:
        return {"message": "Could not find a number in your instruction", "success": False}

    quantity = int(numbers[0])
    products = df["product"].unique()
    matched = None
    for p in products:
        if p.lower() in message:
            matched = p
            break

    if not matched:
        return {"message": f"Product not found. Available: {list(products)}", "success": False}

    with engine.connect() as conn:
        if is_remove:
            conn.execute(text("""
                UPDATE sales SET stock_remaining = MAX(0, stock_remaining - :qty)
                WHERE product = :p AND user_id = :uid AND profile_id = :pid
            """), {"qty": quantity, "p": matched, "uid": user_id, "pid": req.profile_id})
            action = "Removed"
        else:
            conn.execute(text("""
                UPDATE sales SET stock_remaining = stock_remaining + :qty
                WHERE product = :p AND user_id = :uid AND profile_id = :pid
            """), {"qty": quantity, "p": matched, "uid": user_id, "pid": req.profile_id})
            action = "Added"
        conn.commit()

    updated_df = get_df(user_id, req.profile_id)
    new_stock = int(updated_df[updated_df["product"] == matched]["stock_remaining"].iloc[-1])
    return {"message": f"{action} {quantity} units for {matched}. New stock: {new_stock}", "success": True}

# ── Route 5: Health check ────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "BizLytics running"}
