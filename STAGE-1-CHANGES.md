# FlexHub NG — Stage 1 fixes

## Authentication and email
- Added explicit Resend configuration/status reporting.
- Added production sender guidance through `EMAIL_FROM`.
- Improved API responses when the email provider is unavailable.
- Added email/payment readiness to `/api/health`.

## Paystack callback
- Preserves the payment callback URL through login.
- Redirects to login when a stored token has expired during payment verification.
- Clears the cart only after the backend returns a paid order.

## Production configuration
- Added startup warnings for unsafe/missing JWT, `CLIENT_URL`, and Paystack configuration.
- Expanded `.env.example` with Resend and production variables.

## Required production environment variables
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL=https://www.flex-hub.com.ng`
- `RESEND_API_KEY`
- `EMAIL_FROM=FlexHub NG <no-reply@flex-hub.com.ng>` (after domain verification)
- `PAYSTACK_SECRET_KEY`

Do not place secret keys in the Vite/client environment.
