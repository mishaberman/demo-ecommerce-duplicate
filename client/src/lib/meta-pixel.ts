/**
 * Meta Pixel & Conversions API — "Duplicate Events" Variant
 * 
 * CONCEPT: Events fire TWICE — both pixel and CAPI duplicate.
 * - Each event function fires the pixel event twice (once directly, once via setTimeout)
 * - CAPI also sends each event twice
 * - No event_id on any event, so no deduplication possible
 * - This inflates conversion counts by 2x
 */

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = '1684145446350033';
const ACCESS_TOKEN = 'EAAEDq1LHx1gBRPAEq5cUOKS5JrrvMif65SN8ysCUrX5t0SUZB3ETInM6Pt71VHea0bowwEehinD0oZAeSmIPWivziiVu0FuEIcsmgvT3fiqZADKQDiFgKdsugONbJXELgvLuQxHT0krELKt3DPhm0EyUa44iXu8uaZBZBddgVmEnFdNMBmsWmYJdOT17DTitYKwZDZD';

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}

// NO event_id generation — deduplication impossible
// NO hashing function — PII sent raw

export function setUserData(_data: { em?: string; ph?: string; fn?: string; ln?: string }) {
  // Does nothing — user data not utilized
}

// ============================================================
// PIXEL EVENTS — Each fires TWICE (duplicate!)
// ============================================================

function trackPixelEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    // FIRST fire — immediate
    window.fbq('track', eventName, params);
    console.log(`[Meta Pixel] Tracked (1st): ${eventName}`, params);
    
    // SECOND fire — delayed duplicate via setTimeout (simulates a race condition bug)
    setTimeout(() => {
      window.fbq('track', eventName, params);
      console.log(`[Meta Pixel] Tracked (2nd DUPLICATE): ${eventName}`, params);
    }, 100);
  }
}

export function trackViewContent(productId: string, productName: string, value: number, currency: string) {
  trackPixelEvent('ViewContent', {
    content_ids: [productId],
    content_type: 'product',
    content_name: productName,
    value,
    currency,
  });
  // CAPI also fires twice
  sendCAPIEvent('ViewContent', {
    content_ids: [productId], content_type: 'product', content_name: productName, value, currency,
  });
  sendCAPIEvent('ViewContent', {
    content_ids: [productId], content_type: 'product', content_name: productName, value, currency,
  });
}

export function trackAddToCart(productId: string, productName: string, value: number, currency: string, quantity: number) {
  trackPixelEvent('AddToCart', {
    content_ids: [productId],
    content_type: 'product',
    content_name: productName,
    value,
    currency,
    num_items: quantity,
  });
  sendCAPIEvent('AddToCart', {
    content_ids: [productId], content_type: 'product', value, currency, num_items: quantity,
  });
  sendCAPIEvent('AddToCart', {
    content_ids: [productId], content_type: 'product', value, currency, num_items: quantity,
  });
}

export function trackInitiateCheckout(value: number, currency: string, numItems: number) {
  trackPixelEvent('InitiateCheckout', {
    value,
    currency,
    num_items: numItems,
  });
  sendCAPIEvent('InitiateCheckout', { value, currency, num_items: numItems });
  sendCAPIEvent('InitiateCheckout', { value, currency, num_items: numItems });
}

export function trackPurchase(value: number, currency: string, contentIds?: string[]) {
  trackPixelEvent('Purchase', {
    content_ids: contentIds || [],
    content_type: 'product',
    value,
    currency,
    num_items: contentIds?.length || 0,
  });
  sendCAPIEvent('Purchase', {
    content_ids: contentIds || [], content_type: 'product', value, currency,
  });
  sendCAPIEvent('Purchase', {
    content_ids: contentIds || [], content_type: 'product', value, currency,
  });
}

export function trackLead(formType?: string) {
  trackPixelEvent('Lead', {
    content_name: formType || 'lead_form',
    value: 10.00,
    currency: 'USD',
  });
  sendCAPIEvent('Lead', { content_name: formType || 'lead_form', value: 10.00, currency: 'USD' });
  sendCAPIEvent('Lead', { content_name: formType || 'lead_form', value: 10.00, currency: 'USD' });
}

export function trackCompleteRegistration(method?: string) {
  trackPixelEvent('CompleteRegistration', {
    content_name: 'website_registration',
    status: method || 'complete',
    value: 5.00,
    currency: 'USD',
  });
  sendCAPIEvent('CompleteRegistration', { status: method || 'complete', value: 5.00, currency: 'USD' });
  sendCAPIEvent('CompleteRegistration', { status: method || 'complete', value: 5.00, currency: 'USD' });
}

export function trackContact() {
  trackPixelEvent('Contact', { content_name: 'contact_form' });
  sendCAPIEvent('Contact', { content_name: 'contact_form' });
  sendCAPIEvent('Contact', { content_name: 'contact_form' });
}

// ============================================================
// CAPI — No event_id, no hashing, incomplete user_data
// ============================================================

function sendCAPIEvent(eventName: string, eventData: Record<string, unknown>) {
  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      // NO event_id — deduplication impossible!
      action_source: 'website',
      event_source_url: window.location.href,
      user_data: {
        // Only client_user_agent and fbp — very incomplete
        client_user_agent: navigator.userAgent,
        fbp: getCookie('_fbp'),
        // MISSING: fbc, em, ph, fn, ln, external_id
      },
      custom_data: eventData,
      // MISSING: data_processing_options
    }],
    access_token: ACCESS_TOKEN,
  };

  const endpoint = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;
  console.log(`[CAPI] Sending ${eventName} (NO event_id — duplicate risk!) — payload:`, JSON.parse(JSON.stringify(payload)));
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(res => res.json()).then(result => {
    console.log(`[CAPI] ${eventName} — response:`, result);
  }).catch(err => console.error(`[CAPI] Failed:`, err));
}
