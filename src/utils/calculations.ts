import { Bill, BillItem, CalculatedBillTotals } from '../types/bill';

export const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee (PKR - Rs.)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
];

export function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, symbol = 'Rs.', currencyCode = 'PKR'): string {
  const rounded = roundTo2(amount);
  const formatted = rounded.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

export function calculateItemTotal(item: BillItem): number {
  const base = (item.quantity || 0) * (item.unitPrice || 0);
  const discount = base * ((item.discountPercent || 0) / 100);
  const itemTax = (base - discount) * ((item.taxPercent || 0) / 100);
  return roundTo2(base - discount + itemTax);
}

export function calculateBillTotals(bill: Bill): CalculatedBillTotals {
  let itemsSubtotal = 0;
  let itemDiscountsTotal = 0;
  let itemsCount = 0;

  for (const item of bill.items) {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const itemDiscount = Number(item.discountPercent) || 0;

    const lineBase = qty * price;
    const lineDiscount = lineBase * (itemDiscount / 100);

    itemsSubtotal += lineBase;
    itemDiscountsTotal += lineDiscount;
    itemsCount += qty;
  }

  itemsSubtotal = roundTo2(itemsSubtotal);
  itemDiscountsTotal = roundTo2(itemDiscountsTotal);
  const itemsNetTotal = roundTo2(Math.max(0, itemsSubtotal - itemDiscountsTotal));

  // Global Discount
  let globalDiscountAmount = 0;
  if (bill.discountType === 'percentage') {
    globalDiscountAmount = roundTo2(itemsNetTotal * ((Number(bill.discountValue) || 0) / 100));
  } else {
    globalDiscountAmount = roundTo2(Number(bill.discountValue) || 0);
  }
  globalDiscountAmount = Math.min(itemsNetTotal, globalDiscountAmount);

  const taxableSubtotal = roundTo2(Math.max(0, itemsNetTotal - globalDiscountAmount));
  const totalDiscount = roundTo2(itemDiscountsTotal + globalDiscountAmount);

  // Tax calculation
  const taxRate = Number(bill.taxRate) || 0;
  const taxAmount = roundTo2(taxableSubtotal * (taxRate / 100));

  // Shipping
  const shippingAmount = roundTo2(Number(bill.shippingFee) || 0);

  // Tips / Service fee
  let tipAmount = 0;
  const tipVal = Number(bill.serviceFeeOrTip) || 0;
  if (bill.tipType === 'percentage') {
    tipAmount = roundTo2(taxableSubtotal * (tipVal / 100));
  } else {
    tipAmount = roundTo2(tipVal);
  }

  // Grand Total
  const grandTotal = roundTo2(taxableSubtotal + taxAmount + shippingAmount + tipAmount);
  
  // Paid & Balance
  const amountPaid = roundTo2(Number(bill.amountPaid) || 0);
  const balanceDue = roundTo2(Math.max(0, grandTotal - amountPaid));
  
  // Cash change
  let changeDue = 0;
  const cashTendered = Number(bill.cashTendered) || 0;
  if (bill.paymentMethod === 'cash' && cashTendered > grandTotal) {
    changeDue = roundTo2(cashTendered - grandTotal);
  }

  return {
    itemsCount,
    itemsSubtotal,
    itemDiscountsTotal,
    itemsNetTotal,
    globalDiscountAmount,
    totalDiscount,
    taxableSubtotal,
    taxAmount,
    shippingAmount,
    tipAmount,
    grandTotal,
    amountPaid,
    balanceDue,
    changeDue,
  };
}

export const DEFAULT_BUSINESS: Bill['business'] = {
  name: 'Memon Electronics & Repair Shop',
  ownerName: 'Ghulam Memon',
  tagline: 'Retail, Wholesale Electronics & Repair Services',
  email: 'memonghulam007@gmail.com',
  phone: '+92 300 1234567',
  address: 'Shop #14, Main Electronics Market, Saddar, Karachi',
  taxId: 'NTN: 8492019-2',
  website: '',
  bankDetails: {
    bankName: 'Meezan Bank / HBL',
    accountName: 'Ghulam Memon',
    accountNumber: '0102-3901-4491-01',
    routingCode: 'MEZN0012',
    upiId: 'JazzCash / Easypaisa: 03001234567',
  },
};

export function getUserDefaultShopProfile(): Bill['business'] {
  try {
    const saved = localStorage.getItem('billcraft_user_shop_profile_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.name === 'string') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load user shop profile:', e);
  }
  return { ...DEFAULT_BUSINESS };
}

export function saveUserDefaultShopProfile(profile: Bill['business']): void {
  try {
    localStorage.setItem('billcraft_user_shop_profile_v1', JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user shop profile:', e);
  }
}

export const SAMPLE_PRESETS: Array<{ label: string; price: number; category: string }> = [
  { label: 'Mobile Super AMOLED Screen Replacement', price: 8500, category: 'Hardware' },
  { label: 'Laptop General Servicing & Thermal Paste', price: 2500, category: 'Service' },
  { label: 'AC Chemical Servicing & Gas Refill', price: 4800, category: 'Maintenance' },
  { label: 'CCTV HD 4-Camera System Installation', price: 28000, category: 'Security' },
  { label: 'Inverter & UPS Wiring Diagnostic Check', price: 3500, category: 'Electrical' },
  { label: 'Motherboard IC Level Micro-Repairing', price: 6500, category: 'Hardware' },
  { label: 'Windows 11 OS Setup & Driver Tuning', price: 1500, category: 'Software' },
  { label: '65W Fast Charger & Braided Cable', price: 2200, category: 'Accessories' },
];

export function createNewBlankBill(billNumber?: string): Bill {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date();
  due.setDate(due.getDate() + 7);
  const dueDateStr = due.toISOString().split('T')[0];

  return {
    id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    billNumber: billNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    issueDate: today,
    dueDate: dueDateStr,
    currency: 'PKR',
    currencySymbol: 'Rs.',
    status: 'pending',
    business: getUserDefaultShopProfile(),
    client: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
    },
    items: [
      {
        id: `item_${Date.now()}_1`,
        description: 'Mobile Super AMOLED Screen Replacement',
        category: 'Hardware',
        quantity: 1,
        unitPrice: 8500,
        discountPercent: 0,
      },
    ],
    discountType: 'percentage',
    discountValue: 0,
    taxRate: 5,
    taxLabel: 'GST / Sales Tax (5%)',
    shippingFee: 0,
    serviceFeeOrTip: 0,
    tipType: 'fixed',
    amountPaid: 0,
    paymentMethod: 'cash',
    cashTendered: 0,
    notes: 'Thank you for shopping with us! Please check all items before leaving.',
    terms: 'Goods once sold can be replaced within 3 days with original bill.',
    templateStyle: 'thermal',
  };
}

export function getSampleInitialBills(): Bill[] {
  const shop = getUserDefaultShopProfile();

  return [
    {
      id: 'bill_demo_001',
      billNumber: 'BILL-1042',
      createdAt: '2026-10-20T10:15:00.000Z',
      issueDate: '2026-10-20',
      dueDate: '2026-10-27',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      status: 'paid',
      business: { ...shop },
      client: {
        name: 'Tariq Mehmood',
        company: 'Al-Madina Traders',
        email: 'tariq@almadina.pk',
        phone: '+92 321 4455667',
        address: 'Bunder Road, Plaza Market, Karachi',
      },
      items: [
        {
          id: 'item_1_1',
          description: 'CCTV 4-Camera HD System & DVR Kit',
          category: 'Security',
          quantity: 1,
          unitPrice: 32000,
          discountPercent: 5,
        },
        {
          id: 'item_1_2',
          description: 'CCTV Cable Roll (90 Meters High Quality)',
          category: 'Accessories',
          quantity: 2,
          unitPrice: 4500,
          discountPercent: 0,
        },
        {
          id: 'item_1_3',
          description: 'On-site Fitting & Channel Configuration',
          category: 'Service',
          quantity: 1,
          unitPrice: 5000,
          discountPercent: 0,
        },
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 0,
      taxLabel: 'Sales Tax (0%)',
      shippingFee: 500,
      serviceFeeOrTip: 0,
      tipType: 'fixed',
      amountPaid: 44900,
      paymentMethod: 'cash',
      cashTendered: 45000,
      notes: 'Installed and fully tested on customer smartphone.',
      terms: '1-year DVR warranty, 6 months camera warranty.',
      templateStyle: 'thermal',
    },
    {
      id: 'bill_demo_002',
      billNumber: 'BILL-1043',
      createdAt: '2026-10-23T14:30:00.000Z',
      issueDate: '2026-10-23',
      dueDate: '2026-10-30',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      status: 'pending',
      business: { ...shop },
      client: {
        name: 'Usman Farooq',
        company: 'Falcon Logistics',
        email: 'usman.farooq@falcon.pk',
        phone: '+92 333 8899112',
        address: 'I.I. Chundrigar Road, Karachi',
      },
      items: [
        {
          id: 'item_2_1',
          description: 'Dell Latitude Laptop Motherboard Repair & Chip Replacement',
          category: 'Repair',
          quantity: 2,
          unitPrice: 9500,
          discountPercent: 0,
        },
        {
          id: 'item_2_2',
          description: 'Original Laptop Charger 65W Type-C',
          category: 'Hardware',
          quantity: 2,
          unitPrice: 3200,
          discountPercent: 0,
        },
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 0,
      taxLabel: 'Tax Exempt',
      shippingFee: 0,
      serviceFeeOrTip: 0,
      tipType: 'fixed',
      amountPaid: 0,
      paymentMethod: 'bank_transfer',
      notes: 'Customer collected devices. Payment due via online transfer.',
      terms: 'Payment due within 7 days.',
      templateStyle: 'modern',
    },
    {
      id: 'bill_demo_003',
      billNumber: 'BILL-1044',
      createdAt: '2026-10-25T09:00:00.000Z',
      issueDate: '2026-10-25',
      dueDate: '2026-10-28',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      status: 'partially_paid',
      business: { ...shop },
      client: {
        name: 'Zubair Ahmed',
        company: 'Prime Graphics',
        email: 'zubair@primegraphics.pk',
        phone: '+92 301 7766554',
        address: 'Gulshan-e-Iqbal, Block 6, Karachi',
      },
      items: [
        {
          id: 'item_3_1',
          description: 'Samsung Galaxy S22 Ultra Screen Replacement',
          category: 'Hardware',
          quantity: 1,
          unitPrice: 28500,
          discountPercent: 0,
        },
        {
          id: 'item_3_2',
          description: 'UV Tempered Glass Screen Protector',
          category: 'Accessories',
          quantity: 1,
          unitPrice: 1200,
          discountPercent: 0,
        },
      ],
      discountType: 'fixed',
      discountValue: 700,
      taxRate: 0,
      taxLabel: 'Zero Tax',
      shippingFee: 0,
      serviceFeeOrTip: 0,
      tipType: 'fixed',
      amountPaid: 15000,
      paymentMethod: 'cash',
      cashTendered: 15000,
      notes: 'Advance Rs. 15,000 received. Balance Rs. 14,000 due upon screen arrival.',
      terms: 'Testing warranty 7 days.',
      templateStyle: 'thermal',
    },
    {
      id: 'bill_demo_004',
      billNumber: 'BILL-0985',
      createdAt: '2026-09-18T11:20:00.000Z',
      issueDate: '2026-09-18',
      dueDate: '2026-09-25',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      status: 'overdue',
      business: { ...shop },
      client: {
        name: 'Bilal Khan',
        company: 'Bilal Automobile Workshop',
        email: 'bilal@bilalautos.pk',
        phone: '+92 345 1122334',
        address: 'Korangi Industrial Area, Karachi',
      },
      items: [
        {
          id: 'item_4_1',
          description: 'Heavy Inverter Solar Battery Wiring & Breaker Kit',
          category: 'Electrical',
          quantity: 1,
          unitPrice: 18500,
          discountPercent: 0,
        },
        {
          id: 'item_4_2',
          description: 'DC Breakers 63A Dual Pole (Schneider)',
          category: 'Electrical',
          quantity: 2,
          unitPrice: 2800,
          discountPercent: 0,
        },
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 0,
      taxLabel: 'Exempt',
      shippingFee: 400,
      serviceFeeOrTip: 0,
      tipType: 'fixed',
      amountPaid: 0,
      paymentMethod: 'cash',
      notes: 'Payment reminder sent via WhatsApp.',
      terms: 'Bill past due date.',
      templateStyle: 'classic',
    },
    {
      id: 'bill_demo_005',
      billNumber: 'BILL-0850',
      createdAt: '2026-08-14T10:00:00.000Z',
      issueDate: '2026-08-14',
      dueDate: '2026-08-21',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      status: 'paid',
      business: { ...shop },
      client: {
        name: 'Hamza Sheikh',
        company: 'Sheikh Fabrics',
        email: 'hamza@sheikhfabrics.com',
        phone: '+92 300 9988776',
        address: 'Tariq Road, PECHS, Karachi',
      },
      items: [
        {
          id: 'item_5_1',
          description: 'Shop LED Panel Lights 48W Daylight (Pack of 6)',
          category: 'Electrical',
          quantity: 6,
          unitPrice: 2400,
          discountPercent: 5,
        },
        {
          id: 'item_5_2',
          description: 'Ceiling Concealed Wiring Fitting Work',
          category: 'Service',
          quantity: 1,
          unitPrice: 4500,
          discountPercent: 0,
        },
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 0,
      taxLabel: 'Exempt',
      shippingFee: 0,
      serviceFeeOrTip: 0,
      tipType: 'fixed',
      amountPaid: 18180,
      paymentMethod: 'bank_transfer',
      notes: 'Paid via JazzCash.',
      terms: 'Paid in full.',
      templateStyle: 'thermal',
    },
    {
      id: 'bill_demo_006',
      billNumber: 'BILL-0720',
      createdAt: '2026-07-22T08:30:00.000Z',
      issueDate: '2026-07-22',
      dueDate: '2026-07-29',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      status: 'paid',
      business: { ...shop },
      client: {
        name: 'Kamran Siddiqui',
        company: 'Siddiqui Book Depot',
        email: 'kamran@siddiquibooks.pk',
        phone: '+92 312 3344556',
        address: 'Urdu Bazar, Karachi',
      },
      items: [
        {
          id: 'item_6_1',
          description: 'Barcode Scanner Wireless Handheld',
          category: 'Hardware',
          quantity: 2,
          unitPrice: 6500,
          discountPercent: 0,
        },
        {
          id: 'item_6_2',
          description: 'Thermal POS Receipt Printer 80mm USB+LAN',
          category: 'Hardware',
          quantity: 1,
          unitPrice: 16500,
          discountPercent: 0,
        },
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 0,
      taxLabel: 'Exempt',
      shippingFee: 300,
      serviceFeeOrTip: 0,
      tipType: 'fixed',
      amountPaid: 29800,
      paymentMethod: 'cash',
      notes: 'Hardware warranty 6 months.',
      terms: 'Paid in full.',
      templateStyle: 'thermal',
    },
    {
      id: 'bill_demo_007',
      billNumber: 'BILL-0610',
      createdAt: '2026-06-18T16:00:00.000Z',
      issueDate: '2026-06-18',
      dueDate: '2026-06-25',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      status: 'paid',
      business: { ...shop },
      client: {
        name: 'Rashid Minhas',
        company: 'Minhas Law Associates',
        email: 'minhas@law.pk',
        phone: '+92 334 5566778',
        address: 'City Courts, Karachi',
      },
      items: [
        {
          id: 'item_7_1',
          description: 'Office HP LaserJet Printer Complete Overhaul & Toner Refill',
          category: 'Service',
          quantity: 1,
          unitPrice: 5800,
          discountPercent: 0,
        },
        {
          id: 'item_7_2',
          description: 'New HP 85A Compatible High Yield Toner Cartridge',
          category: 'Accessories',
          quantity: 2,
          unitPrice: 2200,
          discountPercent: 0,
        },
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 0,
      taxLabel: 'Exempt',
      shippingFee: 0,
      serviceFeeOrTip: 0,
      tipType: 'fixed',
      amountPaid: 10200,
      paymentMethod: 'cash',
      notes: 'Delivered to chamber.',
      terms: 'Paid in full.',
      templateStyle: 'modern',
    },
  ];
}

export function exportBillsToCSV(bills: Bill[]): string {
  const headers = [
    'Bill Number',
    'Customer Name',
    'Company',
    'Issue Date',
    'Due Date',
    'Status',
    'Currency',
    'Subtotal',
    'Tax',
    'Shipping',
    'Grand Total',
    'Amount Paid',
    'Balance Due',
    'Payment Method'
  ];

  const rows = bills.map(bill => {
    const totals = calculateBillTotals(bill);
    return [
      `"${bill.billNumber}"`,
      `"${bill.client.name.replace(/"/g, '""')}"`,
      `"${bill.client.company.replace(/"/g, '""')}"`,
      bill.issueDate,
      bill.dueDate,
      bill.status,
      bill.currency,
      totals.itemsSubtotal.toFixed(2),
      totals.taxAmount.toFixed(2),
      totals.shippingAmount.toFixed(2),
      totals.grandTotal.toFixed(2),
      totals.amountPaid.toFixed(2),
      totals.balanceDue.toFixed(2),
      bill.paymentMethod,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
