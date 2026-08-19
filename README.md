# FlexHub NG marketplace

FlexHub NG is now structured as a public multi-vendor marketplace. Sellers apply for a mini-store, admins approve the store and its products, customers place marketplace orders, and seller earnings move through a commission and payout ledger.

Nothing in this branch automatically deploys or sends live seller transfers.

## Run it locally

You need Node.js and a MongoDB connection.

### 1. Start the API

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and provide at least:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=a-long-random-secret
CLIENT_URL=http://localhost:5180
GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-2.5-flash
```

Then start the API:

```bash
npm run dev
```

### 2. Start the website

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5180`. This test package reserves port 5180 to avoid collisions with older FlexHub copies.

## Create the first admin

Register the intended admin through the website first. Then, from the `server` folder, run:

```bash
npm run make-admin -- admin@example.com
```

Log out and back in so the browser receives the updated role. Admin tools are available at:

- `/admin/stores` for seller applications
- `/admin/marketplace` for product approvals, orders, commissions and payouts

## Test the marketplace workflow

1. Register a seller account and submit a mini-store application.
2. Log in as admin and approve that store.
3. Log back in as the seller, open `/seller`, and submit a product.
4. Approve the product from `/admin/marketplace`.
5. Add the approved product to the cart and place an order from a customer account.
6. The seller marks their part of the order as processing, then shipped.
7. Admin confirms delivery for that store. This creates a held payout using the commission captured on the order.

Product listings currently accept a hosted image URL. Direct image-file uploads should be connected to durable object storage such as Cloudinary or S3 before launch; server-disk uploads are intentionally avoided because common hosts use temporary filesystems.

FlexGuide on `/shop` answers natural-language shopping requests using only the approved, in-stock FlexHub catalogue. Sellers and admins can also run an advisory AI listing-quality check. These features require `GEMINI_API_KEY`; the key stays on the server, AI cannot place orders, and AI reports never approve or verify products automatically.

## Paystack test setup

Add a Paystack **test** secret key to `server/.env`:

```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYOUT_HOLD_DAYS=7
ENABLE_PAYSTACK_TRANSFERS=false
ENABLE_AUTOMATED_PAYOUTS=false
```

Checkout initialization and verification happen only on the server. The callback page verifies the reference, amount, currency and successful status before marking an order paid.

For production, configure the Paystack webhook endpoint as:

```text
https://YOUR-API-DOMAIN/api/payments/paystack/webhook
```

Keep both transfer switches `false` during review. After business verification, test-mode transfer checks and explicit approval, enable `ENABLE_PAYSTACK_TRANSFERS` first. Only enable `ENABLE_AUTOMATED_PAYOUTS` when scheduled payouts are approved. A payout is never created until admin confirms delivery, and it stays held for the configured number of days.

## Version 3.0 AI features

FlexHub NG now includes FlexGuide catalogue recommendations, FlexWrite seller listing assistance, private order-grounded FlexSupport, and AI listing-quality checks. See `VERSION_3_RELEASE_NOTES.md`.
