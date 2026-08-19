# Gemini migration changelog

- Removed the OpenAI SDK and OpenAI-specific response parsing.
- Added the official `@google/genai` SDK.
- Changed the default model to `gemini-2.5-flash`.
- Preserved catalogue-grounded shopping advice and product comparison output.
- Preserved structured listing-risk reviews.
- Added Gemini JSON-schema output validation with Zod.
- Added optional remote product-image analysis with a 4 MB safety limit.
- Added distinct messages for invalid keys, unavailable models, quota limits, and timeouts.
- Updated `.env.example` and added `GEMINI_SETUP.md`.
