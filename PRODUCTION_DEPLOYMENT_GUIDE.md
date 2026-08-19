# FlexHub NG Production Deployment Guide

## 1. Backend environment

Create `server/.env` from `server/.env.example` and set real values. At minimum:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_unique_secret
CLIENT_URL=https://www.flex-hub.com.ng
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=FlexHub NG <no-reply@flex-hub.com.ng>
PAYSTACK_SECRET_KEY=your_live_or_test_secret_key
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
```

Use a sender address on a domain verified in Resend. Never commit `.env` files.

## 2. Frontend environment

Create `client/.env` from `client/.env.example`. Point the frontend API URL to the deployed backend and configure Cloudinary values used by seller uploads.

## 3. Build verification

```bash
cd client
npm ci
npm run lint
npm run build

cd ../server
npm ci
npm start
```

The frontend output is `client/dist`.

## 4. Paystack

- Configure the Paystack webhook to use:
  `https://YOUR-BACKEND-DOMAIN/api/payments/paystack/webhook`
- Confirm `CLIENT_URL` uses the final HTTPS frontend URL.
- Test a complete transaction using Paystack test mode before switching to live keys.
- Do not place the secret key in the frontend.

## 5. Resend

- Verify `flex-hub.com.ng` in Resend.
- Add the DNS records Resend provides.
- Use a verified sender in `EMAIL_FROM`.
- Test registration verification and password reset after deployment.

## 6. Smoke-test checklist

- Register, receive OTP and verify email.
- Log in and reset a password.
- Create/approve a seller store and publish a product.
- Add product to cart and complete a Paystack test payment.
- Confirm callback and webhook produce one paid order only.
- Seller accepts and ships with tracking information.
- Customer confirms delivery.
- Verified buyer submits a review; seller replies.
- Notifications appear for both buyer and seller.
- Shop, stores and storefront pagination work on mobile.
- `/api/health`, `/robots.txt`, `/sitemap.xml` and `/manifest.webmanifest` load.

## 7. Operational notes

- Monitor API logs using the returned `X-Request-Id` value when investigating failures.
- The built-in rate limiter is suitable for a single server instance. For multiple backend replicas, replace it with a shared Redis-backed limiter.
- The service worker only provides a navigation fallback; payment and account API responses are never cached.
- Take automated MongoDB backups before launch.
