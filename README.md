# 🎥 YouTube Analyzer - Backend Documentation

This is the backend service for the YouTube Comment Analyzer, responsible for fetching YouTube data, managing user authentication, and performing AI-driven sentiment analysis.

## 🚀 Tech Stack
- **Node.js & Express**: Backend framework
- **MongoDB & Mongoose**: Database and Schema management
- **YouTube Data API v3**: To fetch video comments
- **Nebius/OpenAI API**: For Llama-3 model analysis (Question & Answering)
- **JWT**: For secure user sessions

---

## 🛤️ API Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | `email`, `password`, `name` |
| `POST` | `/login` | Login existing user | `email`, `password` |
| `POST` | `/otp` | Generate/Send OTP | `email` |

### 2. Video Analysis (`/api/video`)
| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/comments` | Analyze YouTube comments | `videoId`, `userQuestion` |

---

## 🧠 Smart Caching Logic
The `/api/video/comments` route uses a **Two-Level Caching System** to save money and improve speed:

1.  **Level 1 (Chat Cache)**: If the **exact same question** was asked for the **exact same video**, it returns the previous answer instantly from `ChatHistory`.
2.  **Level 2 (Data Cache)**: If the question is new but the video has been analyzed before, it pulls the comments from `VideoData` (MongoDB) instead of calling the slow YouTube API again.

---

## 🛠️ Environment Variables (.env)
Required keys in your `.env` file:
```env
PORT = 8000
DB_URI = <mongodb_connection_string>
JWT_SECRET = <your_secret>
YOUTUBE_API_KEY = <google_cloud_api_key>
OPENAI_API_KEY = <nebius_or_openai_api_key>
EMAIL_USER = <gmail_address>
EMAIL_PASS = <gmail_app_password>
```

---

## 🏃 Getting Started
1. Install dependencies: `npm install`
2. Start server: `nodemon server.js`
3. Access API at `http://localhost:8000`
