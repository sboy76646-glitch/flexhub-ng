# FlexHub NG Unified AI Assistant

Version 3.1 consolidates customer-facing AI into one floating FlexGuide button displayed across the marketplace.

## Modes

- **Shop:** catalogue-grounded recommendations and natural product comparisons.
- **Orders:** authenticated customers can ask about their own payment, shipping and tracking records.
- **FlexWrite:** approved sellers and admins can generate honest product listing drafts.

The assistant automatically detects common order and seller-writing requests, while users can also select a mode manually. Conversation history is stored only for the current browser session.

Automated listing moderation and trust checks remain background/admin workflows because they should not be exposed as ordinary chatbot actions.

## UX changes

- Floating button on every page using the shared Layout.
- Mobile full-screen assistant and desktop chat drawer.
- Minimize, reopen, clear-chat and session-memory controls.
- Role-aware modes and sign-in prompt for private order support.
- Removed the large duplicate AI panels from Shop, My Orders and Seller Dashboard.

## Verification

- Frontend ESLint: passed.
- Vite production build: passed.
