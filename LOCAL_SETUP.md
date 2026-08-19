# FlexHub NG — Local Test Setup

This package uses the complete marketplace version (Paystack, orders, seller payouts and admin tools) while preserving the current FlexHub NG orange/light brand system and shopping-bag logo.

## 1. Server environment
Copy `server/.env.example` to `server/.env` and fill in:

- `MONGO_URI`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY` (use a Paystack test secret key)
- `GEMINI_API_KEY` (required only for FlexGuide and AI listing checks)
- `CLIENT_URL` with the exact Vite address: `http://localhost:5180`

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

This test package intentionally uses `http://localhost:5180` so it cannot be confused with older FlexHub copies running on port 5173.

## 5. Create an admin account
Register normally, then from `server` run the admin script documented in `server/scripts/makeAdmin.js` using the registered email.

## Test mode safety
Use Paystack test keys only. Do not enable automatic transfers until payment verification, delivery status and payout calculations have been reviewed with test transactions.

## Product image and FlexProof uploads (Cloudinary)
The seller dashboard accepts product images (JPG, PNG or WebP, up to 5 MB) and optional FlexProof videos (MP4, WebM or MOV, up to 50 MB). Add these to `client/.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME=l4mrjyfd
VITE_CLOUDINARY_UPLOAD_PRESET=flexhub_products
```

The upload preset must be an **unsigned** Cloudinary upload preset that permits both image and video resources. Restart the Vite frontend after changing `.env`.

## Test the FlexHub Trust workflow

1. Approve a seller from `/admin/stores`.
2. Open that store's **Verification** panel and record only checks that were genuinely completed.
3. As the seller, create a product with its condition, warranty, return period, preparation time, fulfilment method and optional FlexProof video.
4. As an admin, open `/admin/marketplace`, choose **View product**, review the evidence and select **Approve & Flex Verify**, **Request changes** or **Reject**.
5. Open the approved product page. The Trust Card, seller tier, calculated score, verification evidence and FlexProof status appear automatically.
6. To test verified reviews, complete and deliver an order through FlexHub, then submit the review from the product page while logged into the purchasing account.

The green **FlexHub Verified** badge is controlled by the admin product-verification decision. Seller-submitted claims do not activate it.

## Test the AI support features

Add these values to `server/.env`, then restart the backend:

```env
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
```

1. Open `/shop` and ask FlexGuide for a product by budget, purpose, warranty or seller trust.
2. Select **Compare up to 3 products** to get a catalogue-grounded comparison.
3. As a seller, save a listing, then choose **AI quality check** in **Your catalogue**.
4. As an admin, choose **AI quality check** in the product approval queue before making a manual decision.

The API key is read only by the backend. FlexGuide receives approved catalogue facts, cannot place orders or take payment, and never changes a listing's verification status. The listing report is advisory; an administrator still approves, rejects or requests changes.
