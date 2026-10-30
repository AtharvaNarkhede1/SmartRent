# SmartRent — Modern Property Management SaaS

A full-stack property management web application built with React (Vite) on the frontend and Node.js/Express on the backend.

## 📁 Project Structure

```
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
cp .env.example .env    # fill in your values
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env    # set VITE_API_URL=http://localhost:5001
npm install
npm run dev
```

---

## ☁️ Deploying to Render

This project includes a `render.yaml` Blueprint for one-click deployment.

### Steps:

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create both services automatically

### Environment Variables to set in Render:

**Backend service (`smartrent-backend`):**
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret key |

**Frontend static site (`smartrent-frontend`):**
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your backend Render URL (e.g. `https://smartrent-backend.onrender.com`) |

> ⚠️ After deploying the backend, copy its URL and set it as `VITE_API_URL` in the frontend service, then trigger a redeploy of the frontend.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, React Router, Recharts, Lucide
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Multer, Bcrypt
