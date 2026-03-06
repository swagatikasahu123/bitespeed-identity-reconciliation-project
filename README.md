# 🚀 Bitespeed Identity Reconciliation


#📖 About The Project

This project is a backend service built for Bitespeed's Identity Reconciliation Task.
The problem is simple — a customer named Dr. Emmett Brown (Doc) shops on FluxKart.com using different email addresses and phone numbers for every purchase. FluxKart wants to recognize that all these orders belong to the same person and give him a personalized experience.
This service solves that problem by linking all contact details (emails and phone numbers) of the same person together and maintaining a single unified identity for each customer.

#🎯 What This Service Does

Receives an email or phone number from a checkout event
Searches the database for any matching contacts
Links all related contacts together under one primary contact
Creates new secondary contacts when new information is found
Merges two separate contact groups when they are found to belong to the same person
Returns a consolidated view of the customer's identity

#🔗 How Contacts Are Linked

Every customer can have multiple contact records in the database
All records are linked together — the oldest record = Primary, all others = Secondary
Two contacts are linked if they share either the same email or phone number
If two separate primary contacts get linked, the newer one gets demoted to secondary

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


** Render.com (Free Online)**
1. Go to https://render.com and sign up
2. Click "New" → "PostgreSQL"
3. Give it a name → Click "Create Database"
4. Copy the **External Database URL**


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
POST https://bitespeed-identity-reconciliation-project.onrender.com/identify
```


---

## 🛠️ Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Hosting:** Render.com
