# FlexHub NG — Personalization Phase 3

## Intelligent personalization
- Added weighted product ranking based on observed category interest.
- Added brand affinity tracking when product data contains a brand.
- Added typical browsing price estimation from viewed products.
- Added search-term matching to personalized marketplace ranking.
- Recently viewed products are penalized in recommendation ranking so discovery surfaces new products.
- Personalized ranking is applied to the Featured for you marketplace sort.
- Discovery sections now use the same local personalization ranking while preserving backend recommendation results.
- Personalized home now exposes favorite brands and typical browsing price as lightweight preference signals.

## Privacy and resilience
- Personalization remains local-first and account-scoped in browser storage.
- No new AI provider or paid API dependency was introduced.
- Personalization failures remain non-blocking so marketplace browsing continues normally.

## Existing systems preserved
- Existing authenticated `/api/recommendations` feed remains the source for server-side recommendation sections.
- Existing recommendation interaction tracking remains active from product views.
- Phase 1 recently viewed/search/category functionality remains compatible with the upgraded profile format.

## Validation note
- Repository files were reviewed for integration consistency after the changes.
- A local Vite production build was not executed through the GitHub connector environment, so production-build success is not claimed here.
