# Romania Commerce Considerations

## Product baseline

The storefront targets customers in Romania. Product and legal requirements must be confirmed with a qualified local business/legal adviser before launch; this guide is a planning checklist, not legal advice.

## Customer experience

- Support Romanian and English with a shared header selector. Romanian is the default, and the customer can save an English preference.
- Display currency consistently in Romanian leu (RON), including unit price, discount, delivery cost, taxes, and final total.
- Make stock state, estimated delivery, returns, and customer-support details clear before checkout.
- Capture and validate delivery addresses in a format compatible with the selected courier; support localities, counties, postal codes, and optional pickup points when required.

## Checkout decisions to confirm

| Area | Questions to resolve |
| --- | --- |
| Payments | Which provider(s), cards, wallets, bank transfer, or cash on delivery will be offered? |
| Delivery | Which courier(s), pickup-point networks, delivery regions, cutoff times, and fees apply? |
| Tax and invoice | How are VAT, invoice generation, business customers, corrections, and accounting exports handled? |
| Returns | What is the customer-facing return/cancellation policy, timeframe, cost, and status workflow? |
| Customer service | What contact methods and support hours are published? |
| Privacy | What personal data is collected, why, how long it is retained, and how subject requests are handled? |

## Data-minimization rules

- Collect only the personal data required to fulfill an order, meet legal obligations, and provide explicitly chosen services.
- Separate operational order data from optional marketing consent.
- Give the customer clear choices for marketing and cookies; record consent appropriately.
- Define retention and deletion policies with the business and legal team before collecting production customer data.

## Operational order lifecycle

Use a documented server-owned lifecycle such as:

```text
draft -> awaiting payment -> paid/confirmed -> processing -> dispatched -> delivered
                                            -> cancelled/refunded
```

Exact statuses depend on the payment and courier integrations. Every transition should be authorized, auditable, and idempotent.

## Launch checklist

- Romanian copy, legal pages, policy links, pricing, and support contact details are approved.
- Payment and courier sandbox flows have been tested, including failures, cancellations, refunds, and webhook retries.
- Invoice/tax and stock behavior are confirmed against the chosen back-office process.
- Privacy, cookie, and consent handling have received appropriate review.
- Production monitoring, backup/recovery, incident contacts, and customer-support escalation paths exist.
