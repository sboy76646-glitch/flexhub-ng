# FlexHub NG Version 3.0 — AI Marketplace Edition

## New AI workflows

### FlexWrite for sellers
- Creates an honest product title and description from rough seller notes.
- Identifies missing specifications instead of inventing them.
- Suggests buyer highlights and warranty wording.
- Lets sellers apply the draft directly to the product form before review.

### FlexSupport for customers
- Answers customer questions using only their own recent order records.
- Understands payment, fulfilment, courier, tracking and delivery events.
- Never exposes shipping address or phone details in AI context.
- Cannot change orders, confirm delivery, issue refunds or invent courier updates.

### Existing Gemini capabilities retained
- Catalogue-grounded shopping recommendations.
- Up-to-three-product comparison.
- Seller/admin listing quality and image review.

## Safety
- All Gemini keys remain server-side.
- Structured JSON output is schema validated.
- AI endpoints use authentication where private records are involved.
- Shopping and support requests remain rate limited.
- Product and seller text is explicitly treated as untrusted prompt input.

## Environment

```env
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

Use a model name available to your Google AI Studio project.
