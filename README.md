# demo-ecommerce-duplicate

## Overview
This variant demonstrates a scenario where both Meta Pixel and Conversions API (CAPI) events are fired for every user action, but without any deduplication mechanism. This results in event duplication and inflated reporting. This is part of a collection of demo e-commerce sites that showcase different levels of Meta Pixel and Conversions API (CAPI) implementation quality. Each variant is deployed on GitHub Pages.

**Live Site:** https://mishaberman.github.io/demo-ecommerce-duplicate/
**Quality Grade:** D

## Meta Pixel Setup

### Base Pixel Code
- **Pixel ID:** 1684145446350033
- **Location:** Loaded in the `<head>` tag of `index.html`.
- **Noscript Fallback:** The `<noscript>` tag is included to capture traffic from browsers with JavaScript disabled.

### Advanced Matching
- **User Data:** No user data is passed to `fbq(\'init\', ...)`.
- **setUserData:** The `setUserData` function is a no-op and does not send any user data.

## Conversions API (CAPI) Setup

### Method
This variant uses a **Client-Side Direct HTTP** method. CAPI events are sent directly from the user\'s browser to the Graph API endpoint using `fetch()`.

### Implementation Details
- **Endpoint:** Events are sent to `https://graph.facebook.com/v13.0/1684145446350033/events`.
- **Access Token:** The access token is **exposed** in the client-side JavaScript code.
- **User Data:** Only `fbp` and `fbc` are sent in the `user_data` object. No personally identifiable information (PII) is included.
- **Hashing:** Not applicable as no PII is sent.
- **Data Processing Options:** No data processing options (CCPA/GDPR) are included.

## Events Tracked

| Event Name | Pixel | CAPI | Parameters Sent | event_id |
|---|---|---|---|---|
| ViewContent | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency` | No |
| AddToCart | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency`, `num_items` | No |
| InitiateCheckout | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency`, `num_items` | No |
| Purchase | Yes | Yes | `content_ids`, `content_type`, `content_name`, `value`, `currency`, `num_items` | No |
| Lead | Yes | Yes | `content_name`, `value`, `currency` | No |
| CompleteRegistration | Yes | Yes | `content_name`, `value`, `currency` | No |
| Contact | Yes | Yes | `content_name` | No |

## Event Deduplication
- **`event_id`:** No `event_id` is generated or sent with either Pixel or CAPI events.
- **Result:** Deduplication is **broken**. Because there is no `event_id`, Meta cannot distinguish between the Pixel event and the CAPI event for the same user action. This leads to every event being counted twice.

## Custom Data
- No `custom_data` fields are sent with any events.
- No custom events are tracked.
- `content_type` is set to `product`.
- `content_ids` are SKU-like strings (e.g., `\'PROD123\\'`).

## Known Issues
- **Event Duplication:** The primary issue is that every event is fired twice—once via the Pixel and once via CAPI—with no deduplication key. This results in a 2x inflation of all event counts.
- **No `event_id`:** The lack of an `event_id` is the root cause of the deduplication failure.
- **No Advanced Matching:** No user PII is collected or sent for Advanced Matching, leading to lower match quality.

## Security Considerations
- **Exposed Access Token:** The CAPI access token is hardcoded in the client-side JavaScript, which is a major security risk.
- **PII Hashing:** Not applicable as no PII is sent.
- **Privacy Compliance:** No privacy compliance features like `data_processing_options` are implemented.

---
*This variant is part of the [Meta Pixel Quality Variants](https://github.com/mishaberman) collection for testing and educational purposes.*
