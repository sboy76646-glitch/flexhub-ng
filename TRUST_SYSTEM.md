# FlexHub Trust Stack

This test build introduces an evidence-based trust layer for products and sellers.

## Product status flow

```text
draft → pending → approved / changes_requested / rejected
changes_requested or rejected → seller edits → pending
```

Approving a pending product records `verificationStatus: "verified"`, the approval date and the administrator. Requesting changes or rejecting requires a reason.

## Seller tiers

- **Basic Seller:** approved store without completed identity and address checks.
- **Verified Seller:** identity and business address checks completed.
- **Premium Verified Seller:** full verification, at least 50 completed orders and a calculated trust score of at least 85.

## Trust score

The score is calculated out of 100 from recorded evidence:

- identity, address and business checks: 30 points;
- completed and on-time deliveries: 25 points;
- return performance: 10 points;
- response speed: 10 points;
- verified-product rate: 15 points;
- verified-purchase ratings: 10 points.

Missing evidence receives no points. Sellers cannot type or override their own score.

## FlexProof

Sellers may upload a product video. The admin separately records whether the submitted video matches the listing. Buyer-facing pages distinguish a seller-provided video from a FlexHub-reviewed FlexProof video.

## Verified-purchase reviews

The review endpoint checks for a paid, delivered FlexHub order containing the product. It rejects reviews from accounts without a qualifying order and prevents duplicate reviews for the same customer, product and order.
