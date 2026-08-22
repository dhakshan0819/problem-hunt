# CODE HUNT — Interactive Programming Treasure Hunt Platform

**Code Hunt** is a full-stack, production-ready, interactive programming treasure-hunt platform designed for college Programming Club events.

Players navigate a digital world through 6 immersive location-based quests:
1. **The Ancient Gate** (Arithmetic & C Output -> Keypad Entry)
2. **Logic Forest** (Boolean Conditions -> Interactive Left/Right Path Choice)
3. **Loop Chamber** (Loop Iterations & Sum Accumulation -> Energy Keypad)
4. **Broken Laboratory** (Syntax & Logical Operator Debugging -> Code Editor Repair)
5. **Cipher Vault** (ASCII Array Conversion -> Vault Password)
6. **Final Temple** (Multi-Key Seal -> Math Key I + Collected Fragments Key II `CODER`)

---

## 🚀 Quick Start Instructions

### 🐧 One-Click Launch (Linux)
```bash
./start_all.sh
# or
./start_code_hunt.sh
```

### 🧹 System Reset & Database Wipe (Clear All Records)
```bash
./reset.sh
```

### 🪟 One-Click Launch (Windows)
Double-click `start_all.bat` or `START_CODE_HUNT.bat`.

### Manual Launch

#### 1. Backend Server (FastAPI + SQLite + WebSockets)
```bash
cd backend
python run.py
```
- **Local Access**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **LAN Access**: `http://192.168.x.x:8000` (auto-detected by server)

#### 2. Frontend Server (React + Vite + TypeScript)
```bash
cd frontend
npm run dev
```
- **Local Access**: `http://localhost:5173`
- **LAN Participant Access**: `http://192.168.x.x:5173`

---

## 🛡️ Admin Mission Control (`/admin`)
- **Default Credentials**: `admin` / `admin123`
- **Features**:
  - Event status controls: **START**, **PAUSE**, **RESUME**, **END EVENT**.
  - Real-time team monitoring table with lives, scores, current quest location, and attempt counts.
  - Automatic **STUCK TEAM** visual alerts (>5 minutes on a level).
  - Admin overrides: Add/subtract score, restore 3 lives, reset recovery lockouts, set quest level, or disqualify.
  - Live LAN IP display for participant Wi-Fi connections.

---

## 🔒 Security Architecture
- All answers, hint deductions, scoring, and level progression are strictly **server-authoritative**.
- Answers are stored as SHA-256 hashes; no answer key or hidden level data is exposed in client JavaScript.
- Team session authentication via `X-Team-Code` header.
- Idempotent level completion logic prevents duplicate point awards on page refresh.
