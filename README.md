# 🚀 Bitespeed Identity Reconciliation

A backend service to identify and track customer identity across multiple purchases.

---

## 📁 Project Structure

```
bitespeed-identity-reconciliation/
├── prisma/
│   └── schema.prisma          → Database table definition
├── src/
│   ├── index.js               → Express server entry point
│   ├── prismaClient.js        → Prisma DB connection
│   ├── routes/
│   │   └── identify.js        → Route: POST /identify
│   └── controllers/
│       └── identifyController.js  → Main business logic
├── .env                       → Your database URL (edit this!)
├── .env.example               → Example env file
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ How to Run Locally (Step by Step)

### Step 1 — Open project in VS Code terminal

### Step 2 — Install all dependencies
```bash
npm install
```

### Step 3 — Setup PostgreSQL Database
You can use either:

**Option A: Render.com (Free Online)**
1. Go to https://render.com and sign up
2. Click "New" → "PostgreSQL"
3. Give it a name → Click "Create Database"
4. Copy the **External Database URL**

**Option B: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database named `bitespeed`
3. Your URL will be: `postgresql://postgres:yourpassword@localhost:5432/bitespeed`

### Step 4 — Add Database URL to .env file
Open `.env` file and replace the DATABASE_URL:
```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB_NAME"
PORT=3000
```

### Step 5 — Run Prisma Migration (Creates the table in DB)
```bash
npx prisma migrate dev --name init
```

### Step 6 — Generate Prisma Client
```bash
npx prisma generate
```

### Step 7 — Start the server
```bash
npm run dev
```

You should see:
```
🚀 Server is running on http://localhost:3000
📡 Endpoint: POST http://localhost:3000/identify
```

---

## 📡 API Testing

### Using Postman or Thunder Client (VS Code Extension):

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/identify`
- Body: `raw` → `JSON`

```json
{
  "email": "doc@hillvalley.edu",
  "phoneNumber": "123456"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["doc@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

---

## 🧠 How The Logic Works

| Situation | What Happens |
|---|---|
| No match found | Creates new **primary** contact |
| Match found with new info | Creates new **secondary** contact |
| Two separate groups match | Older stays **primary**, newer becomes **secondary** |

---

## 🌐 Live Endpoint
```
POST https://YOUR-APP-NAME.onrender.com/identify
```
*(Update this after deploying to Render.com)*

---

## 🛠️ Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Hosting:** Render.com
