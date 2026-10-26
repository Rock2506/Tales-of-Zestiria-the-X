export type BillStatus = 'draft' | 'pending' | 'paid' | 'partially_paid' | 'overdue';

export type PaymentMethod = 
  | 'cash' 
  | 'credit_card' 
  | 'bank_transfer' 
  | 'upi_qr' 
  | 'paypal' 
  | 'cheque';

export type TemplateStyle = 'modern' | 'minimalist' | 'classic' | 'thermal';

export interface BillItem {
  id: string;
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number; // 0-100
  taxPercent?: number;     // 0-100 (if per-item tax)
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingCode: string; // SWIFT / Routing / IFSC / Sort Code
  upiId?: string;
}

export interface BusinessProfile {
  name: string; // Shop or Business Name
  ownerName?: string; // Owner / Your Personal Name
  tagline?: string; // e.g. "Electronics, Hardware & Repair Store"
  email: string;
  phone: string;
  address: string;
  taxId: string; // VAT / GSTIN / EIN
  website?: string;
  bankDetails?: BankDetails;
}

export interface ClientProfile {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  createdAt: string; // ISO
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  currency: string;
  currencySymbol: string;
  status: BillStatus;
  
  business: BusinessProfile;
  client: ClientProfile;
  
  items: BillItem[];
  
  // Financial modifiers
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  taxRate: number;      // e.g. 10%
  taxLabel: string;     // e.g. "Sales Tax", "VAT", "GST"
  shippingFee: number;
  serviceFeeOrTip: number;
  tipType: 'percentage' | 'fixed';
  
  // Payment settlement
  amountPaid: number;
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  
  // Notes & terms
  notes: string;
  terms: string;
  templateStyle: TemplateStyle;
}

export interface CalculatedBillTotals {
  itemsCount: number;
  itemsSubtotal: number;
  itemDiscountsTotal: number;
  itemsNetTotal: number;
  globalDiscountAmount: number;
  totalDiscount: number;
  taxableSubtotal: number;
  taxAmount: number;
  shippingAmount: number;
  tipAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  changeDue: number;
}
