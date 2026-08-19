# FlexHub NG — Gemini setup

FlexGuide now uses the Google Gemini API instead of OpenAI.

## Local setup

Create or edit `server/.env` and add:

```env
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
```

Do not put the API key in `client/.env`, do not prefix it with `VITE_`, and do not commit the real key to GitHub.

Restart the backend after changing the environment file:

```powershell
cd server
npm install
npm run dev
```

The existing frontend route and UI remain unchanged. FlexGuide shopping recommendations, comparisons, and seller listing reviews now use Gemini structured JSON responses.

## Deployment

Add `GEMINI_API_KEY` and `GEMINI_MODEL` to the environment variables of the platform hosting the Express backend, then redeploy it.
