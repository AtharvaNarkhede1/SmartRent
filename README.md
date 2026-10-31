# SmartRent — Modern Property Management SaaS

🌐 **Live Demo:** [https://smartrent-1-oqog.onrender.com/](https://smartrent-1-oqog.onrender.com/)

A full-stack property management web application built with React (Vite) on the frontend and Node.js/Express on the backend.

## 📁 Project Structure

```text
SmartRent/
├── frontend/          ← React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/           ← Node.js + Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── uploads/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── render.yaml        ← Render deployment config
└── README.md
```

---

## 🚀 Running Locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:5001` in the frontend `.env` file.

---

## ☁️ Deploying to Render

This project includes a `render.yaml` Blueprint for one-click deployment.

### Steps:

1. Push this repo to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect your GitHub repo.
4. Render will detect `render.yaml` and create both services automatically.

### Environment Variables to Set in Render:

**Backend service (`smartrent-backend`):**

| Variable | Description |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret key |

**Frontend static site (`smartrent-frontend`):**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Your backend Render URL ending in `/api` (e.g. `https://smartrent-v2qs.onrender.com/api`) |

> ⚠️ **Important Deployment Notes:**
> 1. Render creates **two separate URLs**: one for the Backend Web Service (API) and one for the Frontend Static Site (Website UI).
> 2. Opening the Backend URL directly in a browser only accesses the API (`/` and `/api/health`).
> 3. After the backend deploys, copy its URL, add `VITE_API_BASE_URL=https://<your-backend-url>/api` to the frontend static site's Environment tab in Render, and click **Manual Deploy → Clear build cache & deploy** (Vite embeds env variables during build time).

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, React Router, Recharts, Lucide
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Multer, Bcrypt
