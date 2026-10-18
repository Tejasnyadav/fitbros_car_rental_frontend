import { Booking } from '../types';

export const getBookingInvoiceAmounts = (booking: Booking) => {
  const calculatedDays = Math.max(1, Math.ceil((new Date(booking.toDate).getTime() - new Date(booking.fromDate).getTime()) / (1000 * 60 * 60 * 24)));
  const days = booking.invoice?.rentalDays || calculatedDays;
  const rate = booking.invoice?.dailyRate || booking.car.pricePerDay;
  const subtotal = booking.invoice?.subtotal || rate * days;
  const discount = booking.invoice?.totalAmount
    ? booking.invoice.discountAmount || 0
    : booking.discountAmount || 0;
  const tax = booking.invoice?.totalAmount
    ? booking.invoice.taxAmount || 0
    : Math.round((subtotal - discount) * 0.05);
  const total = booking.invoice?.totalAmount || booking.payment?.amount || subtotal - discount + tax;
  return { days, rate, subtotal, discount, tax, total };
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char] || char);

export const printBookingInvoice = (booking: Booking) => {
  const invoice = booking.invoice;
  if (!invoice) return false;

  const amounts = getBookingInvoiceAmounts(booking);
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) return false;

  const pickup = new Date(booking.fromDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  const dropoff = new Date(booking.toDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(invoice.invoiceNumber)}</title><style>
    body{font:14px Arial,sans-serif;color:#1f2937;margin:0;padding:40px;background:#f3f4f6}
    .invoice{max-width:760px;margin:auto;padding:48px;background:#fff;border:1px solid #e5e7eb}
    header{display:flex;justify-content:space-between;border-bottom:3px solid #eab308;padding-bottom:24px}
    h1{font-size:26px;margin:0 0 8px;color:#111827}h2{font-size:18px;margin:0;color:#111827}
    .muted{color:#6b7280;font-size:12px;line-height:1.7}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin:28px 0}
    table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:14px 10px;border-bottom:1px solid #e5e7eb}
    th{background:#f9fafb;font-size:11px;text-transform:uppercase;color:#6b7280}
    .totals{width:300px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:8px 0}
    .grand{font-size:18px;font-weight:bold;border-top:2px solid #111827;margin-top:8px;padding-top:14px!important}
    footer{border-top:1px solid #e5e7eb;margin-top:36px;padding-top:16px;text-align:center;color:#6b7280;font-size:11px}
    @media print{body{padding:0;background:#fff}.invoice{border:0}}
  </style></head><body><main class="invoice">
    <header><div><h1>FITBROS</h1><div class="muted">Car Rental Invoice</div></div>
    <div style="text-align:right"><h2>INVOICE</h2><div class="muted">${escapeHtml(invoice.invoiceNumber)}<br>Issued ${escapeHtml(new Date(invoice.issuedAt || booking.payment?.createdAt || booking.createdAt).toLocaleDateString())}</div></div></header>
    <section class="grid"><div><strong>Bill to</strong><div class="muted">${escapeHtml(booking.user?.name || 'Customer')}<br>${escapeHtml(booking.user?.email || '')}<br>${escapeHtml(booking.user?.phone || '')}</div></div>
    <div><strong>Rental details</strong><div class="muted">${escapeHtml(booking.car.name)}<br>${escapeHtml(pickup)}<br>to ${escapeHtml(dropoff)}<br>${amounts.days} rental day(s)</div></div></section>
    <table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount (INR)</th></tr></thead>
    <tbody><tr><td>Vehicle rental - ${escapeHtml(booking.car.name)}</td><td>${amounts.days}</td><td>₹${amounts.rate.toFixed(2)}</td><td>₹${amounts.subtotal.toFixed(2)}</td></tr></tbody></table>
    <section class="totals"><div><span>Subtotal</span><span>₹${amounts.subtotal.toFixed(2)}</span></div>
    <div><span>Discount</span><span>-₹${amounts.discount.toFixed(2)}</span></div><div><span>Tax (5%)</span><span>₹${amounts.tax.toFixed(2)}</span></div>
    <div class="grand"><span>Total paid</span><span>₹${amounts.total.toFixed(2)}</span></div></section>
    <div class="muted">Payment method: ${escapeHtml(booking.payment?.method || 'N/A')} · Status: ${escapeHtml(booking.payment?.status || 'N/A')}</div>
    <footer>Thank you for choosing FitBros Car Rental.</footer></main><script>window.onload=()=>window.print()</script></body></html>`);
  printWindow.document.close();
  return true;
};
