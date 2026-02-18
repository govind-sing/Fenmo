
# Fenmo: Production-Grade Personal Finance Tracker

A robust, full-stack MERN application designed for users to record and analyze personal expenses and income. This project was built with a focus on **data integrity**, **realistic network conditions**, and **maintainability**.

## 🚀 Deployment

* **Live Demo:** https://fenmofinance.vercel.app/

---

## ✨ Features

### 🛠 Core CRUD & Management

* **Transaction Tracking:** Record expenses and income with precise amount, category, description, and date.
* **Edit/Delete Support:** Full lifecycle management for every entry.
* **Real-time Search & Filter:** Instantly filter transactions by any field (description, category, or type) using a high-performance local filtering logic.
* **Smart Sorting:** Automatically defaults to **Newest First** for immediate relevance.

### 📊 Advanced Insights

* **Financial Analysis:** A dedicated dashboard view featuring a **Pie Chart** (Recharts) to visualize spending distribution.
* **Dynamic Balance:** A color-coded "Total Balance" card that calculates  in real-time based on your current view.

### 🛡️ Production Reliability

* **Idempotency (Duplicate Prevention):** Implements client-side generated `idempotencyKey` for POST requests. This ensures that even if a user double-clicks "Submit" or refreshes during a slow network response, duplicate transactions are never created.
* **Financial Precision:** Utilizes MongoDB's **Decimal128** type to prevent the floating-point precision errors () commonly found in basic JavaScript finance apps.
* **Deep-Link Persistence:** Custom `vercel.json` configuration to handle SPA routing, preventing 404 errors on page refreshes.

---

## 🏗️ Architecture & Design Decisions

### 1. Database: MongoDB Atlas

I chose a NoSQL approach (MongoDB) to allow for **Schema Flexibility**. In a real-world finance app, users often want to create custom categories or add metadata to transactions. MongoDB allows the app to evolve without the friction of complex SQL migrations.

### 2. State Management & UX

* **Optimistic UI Patterns:** The search and filtering happen locally on the fetched data, providing zero-latency feedback for the user.
* **Robust Auth:** Implemented JWT-based authentication with a "Guard" mechanism on the Dashboard to ensure private financial data is only accessible to authorized users.

### 3. Handling Unreliable Networks

By including an **idempotency key**, the system treats the "Create Transaction" action as a safe operation. If the server receives the same key twice within a short window, it returns the existing record instead of creating a new one—a critical feature for production financial systems.

---

## 🛠 Tech Stack

* **Frontend:** React.js (Vite), Tailwind CSS, Recharts, Lucide Icons.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Mongoose).
* **Auth:** JWT, Bcrypt.js.

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js (v16+)
* MongoDB Atlas Account

### Backend Setup

1. `cd server`
2. `npm install`
3. Create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

```


4. `npm start`

### Frontend Setup

1. `cd client`
2. `npm install`
3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api

```


4. `npm run dev`

---

## 📝 Intentional Omissions

* **Unit Testing:** Within the 4-hour time constraint, I prioritized building high-value features (Analysis, Edit/Delete, Idempotency) over high test coverage.
* **Password Reset:** Currently requires manual intervention; a production system would integrate an email service like SendGrid/SES.
