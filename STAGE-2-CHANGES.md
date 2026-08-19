# FlexHub NG — Stage 2 Changes

## Customer order tracking
- Added a four-stage customer timeline: Paid, Preparing, Shipped, Delivered.
- Added per-item tracking history with timestamps.
- Added delivery carrier, tracking/reference number, shipped time, and promised delivery date to customer order views.
- Added lazy loading for order item images.

## Seller fulfilment
- Sellers must enter a carrier/rider name and tracking/reference number before marking an order shipped.
- Seller order cards now display shipment tracking information.
- Fulfilment status cannot move backwards and unpaid/uncommitted orders cannot be shipped.

## Customer delivery confirmation
- Added a protected customer endpoint to confirm a shipped store delivery.
- Confirmation marks that store's items delivered, records a tracking event, refreshes aggregate order status, updates delivery performance, and starts the existing payout hold workflow.
- Customers can confirm each store separately when one checkout contains items from multiple sellers.

## Backend data model
- Added `carrier`, `trackingNumber`, and `trackingEvents` to order items.
- Existing orders remain compatible; missing tracking arrays are safely treated as empty.

## Validation completed
- Frontend ESLint passed.
- Frontend Vite production build passed.
- Modified backend files passed Node syntax checks.
