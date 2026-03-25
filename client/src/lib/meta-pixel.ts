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

import { v4 as uuidv4 } from 'uuid';

const PIXEL_ID = '1684145446350033';

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}

export function setUserData(_data: { em?: string; ph?: string; fn?: string; ln?: string }) {
  // Does nothing — user data not utilized
}

// ============================================================
// PIXEL EVENTS — Each fires TWICE (duplicate!)
// ============================================================

function trackPixelEvent(eventName: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params, { eventID: eventId });
    console.log(`[Meta Pixel] Tracked: ${eventName}`, params, eventId);
  }
}

export function trackViewContent(productId: string, productName: string, value: number, currency: string) {
    const eventId = sendCAPIEvent('ViewContent', {
    content_ids: [productId], content_type: 'product', content_name: productName, value, currency,
  });
  trackPixelEvent('ViewContent', {
    content_ids: [productId],
    content_type: 'product',
    content_name: productName,
    value,
    currency,
  }, eventId);
}

export function trackAddToCart(productId: string, productName: string, value: number, currency: string, quantity: number) {
    const eventId = sendCAPIEvent('AddToCart', {
    content_ids: [productId], content_type: 'product', value, currency, num_items: quantity,
  });
  trackPixelEvent('AddToCart', {
    content_ids: [productId],
    content_type: 'product',
    content_name: productName,
    value,
    currency,
    num_items: quantity,
  }, eventId);
}

export function trackInitiateCheckout(value: number, currency: string, numItems: number) {
  const eventId = sendCAPIEvent('InitiateCheckout', { value, currency, num_items: numItems });
  trackPixelEvent('InitiateCheckout', {
    value,
    currency,
    num_items: numItems,
  }, eventId);
}

export function trackPurchase(value: number, currency: string, contentIds?: string[]) {
  const eventId = sendCAPIEvent('Purchase', {
    content_ids: contentIds || [], content_type: 'product', value, currency,
  });
  trackPixelEvent('Purchase', {
    content_ids: contentIds || [],
    content_type: 'product',
    value,
    currency,
    num_items: contentIds?.length || 0,
  }, eventId);
}

export function trackLead(formType?: string) {
    const eventId = sendCAPIEvent('Lead', { content_name: formType || 'lead_form', value: 10.00, currency: 'USD' });
  trackPixelEvent('Lead', {
    content_name: formType || 'lead_form',
    value: 10.00,
    currency: 'USD',
  }, eventId);
}

export function trackCompleteRegistration(method?: string) {
    const eventId = sendCAPIEvent('CompleteRegistration', { status: method || 'complete', value: 5.00, currency: 'USD' });
  trackPixelEvent('CompleteRegistration', {
    content_name: 'website_registration',
    status: method || 'complete',
    value: 5.00,
    currency: 'USD',
  }, eventId);
}

export function trackContact() {
    const eventId = sendCAPIEvent('Contact', { content_name: 'contact_form' });
  trackPixelEvent('Contact', { content_name: 'contact_form' }, eventId);
}

// ============================================================
// CAPI — No event_id, no hashing, incomplete user_data
// ============================================================

function sendCAPIEvent(eventName: string, eventData: Record<string, unknown>) {
  const eventId = uuidv4();
  fetch('/api/meta-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      eventName, 
      eventData, 
      eventId, 
      fbc: getCookie('_fbc'), 
      fbp: getCookie('_fbp'),
      user: { email: 'test@example.com' } // Replace with actual user data
    }),
  });
  return eventId;
}
