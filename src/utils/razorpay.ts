/**
 * Razorpay Payment Gateway Integration Utility (Test Mode)
 *
 * Implements Razorpay Standard Checkout with:
 * - Dynamic SDK Loader
 * - Secure Backend Order Creation
 * - Strict Server-Side HMAC SHA256 Verification
 * - Zero exposure of Secret Key on the frontend
 */

export interface RazorpayConfig {
  keyId: string;
  currency: string;
  isTestMode: boolean;
  name?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };
  keyId: string;
  amount: number;
  currency: string;
  orderItems: any[];
  transactionId: string;
  error?: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderDetails: {
    orderId?: string;
    items: any[];
    pickupTime: string;
    storeCredit?: number;
    totalAmount: number;
    paymentMethod: string;
    methodDetails?: string;
    studentId?: string;
    studentName?: string;
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  order?: any;
  transaction?: any;
  walletBalance?: number;
  error?: string;
}

/**
 * Ensures Razorpay Checkout script is loaded in the browser.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Razorpay SDK] Failed to load external checkout.js, fallback available');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Fetch public Razorpay configuration (Key ID only).
 */
export async function getRazorpayConfig(): Promise<RazorpayConfig> {
  try {
    const res = await fetch('/api/v1/canteen/razorpay/config');
    if (!res.json) throw new Error('Invalid response');
    const data = await res.json();
    return {
      keyId: data.keyId || 'rzp_test_51PLACEHOLDER',
      currency: data.currency || 'INR',
      isTestMode: data.isTestMode !== false,
      name: data.name || 'SmartUni Campus Canteen',
    };
  } catch (err) {
    console.warn('[Razorpay Config Fetch] Using local test fallback config:', err);
    return {
      keyId: 'rzp_test_51PLACEHOLDER',
      currency: 'INR',
      isTestMode: true,
      name: 'SmartUni Campus Canteen',
    };
  }
}

/**
 * Create a Razorpay Order through the secure backend API.
 */
export async function createRazorpayOrder(params: {
  items: any[];
  pickupTime: string;
  storeCredit: number;
  studentId?: string;
  studentName?: string;
}): Promise<CreateOrderResponse> {
  const res = await fetch('/api/v1/canteen/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to create Razorpay order (${res.status})`);
  }

  return await res.json();
}

/**
 * Verify payment signature with the server using HMAC SHA256.
 * Orders are NEVER marked as paid without this verification!
 */
export async function verifyPaymentOnServer(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
  const res = await fetch('/api/v1/canteen/razorpay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({ success: false, verified: false, error: 'Network response error' }));
  if (!res.ok || !data.verified) {
    return {
      success: false,
      verified: false,
      error: data.error || 'Server rejected payment verification',
    };
  }

  return data;
}
