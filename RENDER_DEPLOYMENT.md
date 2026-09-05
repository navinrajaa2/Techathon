# 🚀 Deploying PathCraft AI Backend to Render (render.com)

Your backend is now fully configured and **Render-supportable**. Follow the quick guide below to deploy it live.

---

## Option 1: Automatic Deployment using Blueprint (`render.yaml`)

1. Push your latest code changes to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → select **Blueprint**.
4. Connect your repository (`navinrajaa2/Techathon`).
5. Render will automatically detect [`render.yaml`](file:///c:/Users/navin/Desktop/New%20folder/render.yaml) and configure the Web Service!
6. Click **Apply**.

---

## Option 2: Manual Web Service Setup on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → select **Web Service**.
3. Connect your repository (`navinrajaa2/Techathon`).
4. Configure the service parameters:
   - **Name**: `pathcraft-ai-backend`
   - **Region**: Choose closest to your users (e.g. `Singapore`, `Frankfurt`, `Oregon`)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node index.js`)
   - **Health Check Path**: `/api/health`

---

## Environment Variables to add in Render Dashboard

Go to the **Environment** tab of your Render Web Service and add the following keys:

| Environment Variable | Recommended Value / Details |
| :--- | :--- |
| `PORT` | `10000` *(Render sets this automatically)* |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string (e.g. `mongodb+srv://...`) |
| `GEMINI_API_KEY` | Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/) |
| `CLIENT_URL` | *(Optional)* Your deployed frontend URL (e.g., `https://your-app.vercel.app` or `https://your-app.onrender.com`) |

---

## Verify Deployment

Once deployed, your live Render backend URL (e.g., `https://pathcraft-ai-backend.onrender.com`) will respond on:
- `GET /`: `{ "status": "ok", "message": "PathCraft AI Express Server is live on Render" }`
- `GET /api/health`: Health status of MongoDB Atlas and Gemini AI configuration.
