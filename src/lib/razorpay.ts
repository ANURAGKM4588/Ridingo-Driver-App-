// Utility for Razorpay Payment Gateway integration with Test Mode support

export interface RazorpayOptions {
  key?: string;
  amount: number; // in smallest currency unit (e.g., paise / cents)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: any) => void;
    };
  }
}

// Standard Razorpay Test Credentials for easy testing (Card numbers & Bank codes for test simulator)
export const RAZORPAY_TEST_CREDENTIALS = {
  cards: [
    { label: 'Success Card (Visa)', number: '4111 1111 1111 1111', exp: '12/28', cvv: '123', status: 'success' },
    { label: 'Success Card (Mastercard)', number: '5123 4567 8901 2345', exp: '10/27', cvv: '456', status: 'success' },
    { label: 'Otp / 3DS Simulator', number: '4000 0000 0000 0002', exp: '05/29', cvv: '789', status: 'requires_otp' },
    { label: 'Failing / Declined Card', number: '4000 0000 0000 0005', exp: '01/26', cvv: '000', status: 'declined' },
  ],
  upi: [
    { label: 'Success UPI ID', handle: 'success@razorpay', status: 'success' },
    { label: 'Failure UPI ID', handle: 'failure@razorpay', status: 'declined' },
  ],
  banks: [
    { name: 'HDFC Bank', code: 'HDFC', status: 'success' },
    { name: 'ICICI Bank', code: 'ICIC', status: 'success' },
    { name: 'State Bank of India', code: 'SBIN', status: 'success' },
    { name: 'Axis Bank', code: 'UTIB', status: 'success' },
  ]
};

// Mask API key for security protection (e.g. rzp_test_••••••••14)
export const maskRazorpayKey = (key: string): string => {
  if (!key) return '••••••••••••••••••••';
  if (key.length <= 12) return '••••••••••••';
  const prefix = key.slice(0, 9);
  const suffix = key.slice(-4);
  return `${prefix}••••••••${suffix}`;
};

// Get current Razorpay Key from environment variable
export const getRazorpayKey = (): string => {
  return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_masked_key_env';
};

// Check if Test Mode is active
export const isRazorpayTestMode = (): boolean => {
  const key = getRazorpayKey();
  const envMode = import.meta.env.VITE_RAZORPAY_ENV;
  return envMode === 'test' || key.startsWith('rzp_test_');
};

// Helper to dynamically load standard Razorpay checkout script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
