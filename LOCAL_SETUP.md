# FlexHub NG — Local Test Setup

This package uses the complete marketplace version (Paystack, orders, seller payouts and admin tools) while preserving the current FlexHub NG orange/light brand system and shopping-bag logo.

## 1. Server environment
Copy `server/.env.example` to `server/.env` and fill in:

- `MONGO_URI`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY` (use a Paystack test secret key)
- `CLIENT_URL` with the exact Vite address, e.g. `http://localhost:5173`

Keep these disabled while testing:

```env
ENABLE_PAYSTACK_TRANSFERS=false
ENABLE_AUTOMATED_PAYOUTS=false
```

## 2. Client environment
Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## 3. Run the backend

```bash
cd server
npm install
npm run dev
```

## 4. Run the frontend

```bash
cd client
npm install
npm run dev
```

If Vite uses another port such as 5175, set `CLIENT_URL=http://localhost:5175` in `server/.env`, then restart the backend.

## 5. Create an admin account
Register normally, then from `server` run the admin script documented in `server/scripts/makeAdmin.js` using the registered email.

## Test mode safety
Use Paystack test keys only. Do not enable automatic transfers until payment verification, delivery status and payout calculations have been reviewed with test transactions.

## Product image uploads (Cloudinary)
The seller dashboard now accepts image files directly (JPG, PNG or WebP, up to 5 MB). Add these to `client/.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME=l4mrjyfd
VITE_CLOUDINARY_UPLOAD_PRESET=flexhub_products
```

The upload preset must be an **unsigned** Cloudinary upload preset. Restart the Vite frontend after changing `.env`.
