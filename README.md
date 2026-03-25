# demo-ecommerce-duplicate ![Grade F](https://img.shields.io/badge/Grade-F-red)

This variant demonstrates one of the most common and damaging real-world bugs in a Meta Conversions API setup: **event duplication**. Every user action fires twice—once via the Meta Pixel (client-side) and once via a direct client-side HTTP call to the Conversions API (server-side)—but with different `event_id` parameters. This critical mistake makes it impossible for Meta's systems to deduplicate the events, leading to inflated event counts (2x), corrupted ad campaign optimization, and unreliable measurement.

### Quick Facts

| Attribute | Value |
|---|---|
| **Pixel ID** | `1684145446350033` |
| **CAPI Method** | Client-side direct HTTP |
| **Grade** | F |
| **Live Site** | [https://mishaberman.github.io/demo-ecommerce-duplicate/](https://mishaberman.github.io/demo-ecommerce-duplicate/) |
| **GitHub Repo** | [https://github.com/mishaberman/demo-ecommerce-duplicate](https://github.com/mishaberman/demo-ecommerce-duplicate) |

### What's Implemented

- [x] Meta Pixel base code
- [x] Conversions API (CAPI) events fired via client-side HTTP
- [x] `fbp` and `fbc` cookies are present
- [x] Data Processing Options (DPO) for CCPA/GDPR compliance
- [x] Standard events: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Lead`, `CompleteRegistration`

### What's Missing or Broken

- [ ] **CRITICAL: Event Deduplication is Broken**: Pixel and CAPI events fire with different `event_id`s, causing 2x event counts.
- [ ] **CRITICAL: Access Token Exposed**: The CAPI access token is visible in the public frontend JavaScript, a major security risk.
- [ ] **No Advanced Matching**: No user data (email, phone, etc.) is sent to improve Event Match Quality.
- [ ] **Missing `Search` Event**: The `Search` event does not fire on the search results page.
- [ ] **No Server-Side Implementation**: All CAPI calls are made from the client, defeating the purpose of a server-to-server connection.

### Event Coverage

This table shows which events are fired and through which channel. Note that because deduplication is broken, every event is counted twice.

| Event | Meta Pixel (Browser) | Conversions API (Server) |
|---|:---:|:---:|
| `ViewContent` | ✅ | ✅ |
| `AddToCart` | ✅ | ✅ |
| `InitiateCheckout` | ✅ | ✅ |
| `Purchase` | ✅ | ✅ |
| `Lead` | ✅ | ✅ |
| `CompleteRegistration` | ✅ | ✅ |
| `Search` | ❌ | ❌ |

### Parameter Completeness

This table shows which parameters are sent with each event. The implementation is basic and consistent across events.

| Event | `content_type` | `content_ids` | `value` | `currency` | `content_name` | `num_items` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `ViewContent` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `AddToCart` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `InitiateCheckout`| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `Purchase` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `Lead` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| `CompleteRegistration`| ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |

### Architecture

The tracking for this variant is implemented entirely in the frontend JavaScript (`assets/js/main.js`).

1.  **Pixel Events**: Standard `fbq('track', ...)` calls are used for all events, firing on page load or user actions (e.g., button clicks).
2.  **CAPI Events**: Immediately after each `fbq` call, a separate JavaScript function makes a `fetch` request directly to the Graph API endpoint (`https://graph.facebook.com/v13.0/PIXEL_ID/events`).
3.  **Broken Deduplication**: Crucially, the `event_id` for the pixel call is generated automatically by the pixel library, while the `event_id` for the CAPI call is generated separately in the JavaScript code. Because these IDs do not match, Meta cannot deduplicate the two identical events.
4.  **Exposed Token**: The CAPI access token is hardcoded directly in the `fetch` request, making it publicly visible to anyone inspecting the site's source code.

### How to Use This Variant

1.  **Browse the Site**: Navigate through the product pages, add items to the cart, and complete a test purchase.
2.  **Use Meta Pixel Helper**: Install the [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension to see the Pixel events fire in real-time.
3.  **Check Browser DevTools**: Open the Network tab in your browser's developer tools and filter for `facebook.com`. You will see two requests for every event:
    *   A `GET` request from the Pixel (`/tr?`)
    *   A `POST` request to the Graph API (`/events?`)
4.  **Inspect Event IDs**: Observe that the `eventID` in the Pixel payload and the `event_id` in the CAPI payload are different, confirming the duplication issue.
