# Code Review App - Vercel Deployment

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Set Environment Variables
After deployment, set your API key in Vercel dashboard:
- Go to your project dashboard
- Settings → Environment Variables
- Add: `GOOGLE_GEMINI_KEY` = `your_api_key_here`

### 5. Redeploy (if needed)
```bash
vercel --prod
```

## 📁 Project Structure
```
/api/
  get-review.js          # Non-streaming review endpoint
  get-review-stream.js   # Streaming review endpoint
/frontEnd/
  src/                   # React app source
  dist/                  # Built frontend (auto-generated)
/backEnd/
  .env                   # Environment variables (local only)
vercel.json             # Vercel configuration
```

## 🔧 API Endpoints
- `GET/POST /api/get-review` - Get code review (JSON response)
- `POST /api/get-review-stream` - Get streaming code review (text response)

## 🌐 Frontend
- Built with React + Vite
- Uses Prism.js for syntax highlighting
- Markdown rendering with rehype-highlight

## ⚙️ Environment Variables
- `GOOGLE_GEMINI_KEY` - Your Google AI Studio API key

## 📝 Notes
- API functions run as Vercel serverless functions
- Frontend is served as static files
- CORS is configured for cross-origin requests
- Rate limiting is handled by Google's API quotas