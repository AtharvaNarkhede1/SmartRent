/**
 * SmartRent Professional PDF & Print Utility
 * Generates standards-compliant A4 PDF receipts and print views without external bundler issues.
 */

export const normalizeReceiptData = (receipt = {}, settings = {}, ownerProfile = {}) => {
  const receiptNumber = receipt.receiptNumber || 'RCP-' + Date.now().toString().slice(-6);
  const tenantName = receipt.tenantName || 'Tenant';
  const tenantPhone = receipt.tenantPhone || receipt.phone || '+91 98200 12345';
  const propertyName = receipt.propertyName || receipt.property || 'SmartRent Property';
  const roomNumber = receipt.roomNumber || receipt.room || 'Room 101';
  const amount = Number(receipt.amount || receipt.rentAmount || receipt.paidAmount || 0);
  const paymentDate = receipt.paymentDate || receipt.date || new Date().toISOString().split('T')[0];
  const paymentMethod = receipt.paymentMethod || 'UPI / Online';
  const transactionId = receipt.transactionId || receipt.transactionRef || ('TXN' + Math.random().toString(36).substring(2, 9).toUpperCase());
  const period = receipt.period || receipt.invoiceMonth || 'March 2026';
  const status = (receipt.status || receipt.paymentStatus || 'Paid').toUpperCase();
  const businessName = ownerProfile?.businessName || 'SmartRent Properties';
  const ownerName = ownerProfile?.fullName || settings?.accountHolder || 'Property owner';
  const ownerPhone = ownerProfile?.phone || '+91 98230 45678';
  const currencySymbol = settings?.currencySymbol || 'Rs.';

  return {
    receiptNumber,
    tenantName,
    tenantPhone,
    propertyName,
    roomNumber,
    amount,
    paymentDate,
    paymentMethod,
    transactionId,
    period,
    status,
    businessName,
    ownerName,
    ownerPhone,
    currencySymbol
  };
};

function escapePdf(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Builds valid, standards-compliant PDF 1.4 binary content matching A4 specifications
 */
export function buildReceiptPdfString(data) {
  const streamOps = [];

  function rect(x, y, w, h, fill = true, stroke = false) {
    streamOps.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`);
    if (fill && stroke) streamOps.push('B');
    else if (fill) streamOps.push('f');
    else if (stroke) streamOps.push('S');
  }

  function fillColor(r, g, b) {
    streamOps.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg`);
  }

  function strokeColor(r, g, b) {
    streamOps.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG`);
  }

  function text(str, x, y, font = '/F1', size = 10, r = 15, g = 23, b = 42) {
    streamOps.push('BT');
    streamOps.push(`${font} ${size} Tf`);
    fillColor(r, g, b);
    streamOps.push(`${x.toFixed(2)} ${y.toFixed(2)} Td`);
    streamOps.push(`(${escapePdf(str)}) Tj`);
    streamOps.push('ET');
  }

  function line(x1, y1, x2, y2, r = 226, g = 232, b = 240, width = 0.5) {
    strokeColor(r, g, b);
    streamOps.push(`${width} w`);
    streamOps.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  // 1. Top Blue Accent Bar
  fillColor(37, 99, 235);
  rect(0, 827, 595.28, 15, true, false);

  // 2. Brand Header (Top Left)
  fillColor(37, 99, 235);
  rect(40, 755, 38, 38, true, false);
  text('SR', 51, 768, '/F2', 15, 255, 255, 255);

  text(data.businessName, 88, 778, '/F2', 16, 15, 23, 42);
  text('Official Rent Collection & E-Invoice | HRA Compliant Receipt', 88, 764, '/F1', 8.5, 100, 116, 139);

  // 3. Status Badge & Receipt Identifiers (Top Right)
  const isPaid = data.status === 'PAID' || data.status === 'SUCCESS';
  if (isPaid) {
    fillColor(236, 253, 245);
    strokeColor(167, 243, 208);
    rect(415, 766, 140, 22, true, true);
    text('PAYMENT COMPLETED', 428, 773.5, '/F2', 8.5, 5, 150, 105);
  } else {
    fillColor(254, 243, 199);
    strokeColor(253, 230, 138);
    rect(415, 766, 140, 22, true, true);
    text('STATUS: ' + data.status, 428, 773.5, '/F2', 8.5, 180, 83, 9);
  }

  text(data.receiptNumber, 555 - (data.receiptNumber.length * 6), 750, '/F2', 9.5, 51, 65, 85);
  text(`Payment Date: ${data.paymentDate}`, 430, 737, '/F1', 8.5, 100, 116, 139);

  // 4. Header Divider
  line(40, 725, 555, 725, 226, 232, 240, 0.7);

  // 5. Two Metadata Boxes (Y: 615 - 710)
  // Left Box: Resident Information
  fillColor(248, 250, 252);
  strokeColor(226, 232, 240);
  rect(40, 615, 250, 95, true, true);

  text('RESIDENT INFORMATION', 52, 693, '/F2', 8, 100, 116, 139);
  text(data.tenantName, 52, 676, '/F2', 12, 15, 23, 42);
  text(`Contact: ${data.tenantPhone}`, 52, 660, '/F1', 8.5, 71, 85, 105);
  text(`${data.propertyName} — ${data.roomNumber}`, 52, 644, '/F2', 9.5, 37, 99, 235);
  text('Tenancy Lease & Residential Premises', 52, 628, '/F1', 8, 148, 163, 184);

  // Right Box: Transaction & Settlement Details
  fillColor(248, 250, 252);
  strokeColor(226, 232, 240);
  rect(305, 615, 250, 95, true, true);

  text('TRANSACTION DETAILS', 317, 693, '/F2', 8, 100, 116, 139);
  text('Billing Period:', 317, 676, '/F1', 8.5, 71, 85, 105);
  text(data.period, 415, 676, '/F2', 8.5, 15, 23, 42);

  text('Payment Method:', 317, 660, '/F1', 8.5, 71, 85, 105);
  text(data.paymentMethod, 415, 660, '/F2', 8.5, 15, 23, 42);

  text('Transaction Ref:', 317, 644, '/F1', 8.5, 71, 85, 105);
  text(data.transactionId, 415, 644, '/F2', 8.5, 37, 99, 235);

  text('Settlement Date:', 317, 628, '/F1', 8.5, 71, 85, 105);
  text(data.paymentDate, 415, 628, '/F1', 8.5, 15, 23, 42);

  // 6. Itemized Table
  // Table Header Bar (Y: 575)
  fillColor(241, 245, 249);
  rect(40, 572, 515, 22, true, false);

  text('DESCRIPTION', 52, 579, '/F2', 8, 71, 85, 105);
  text('BILLING CYCLE', 317, 579, '/F2', 8, 71, 85, 105);
  text('AMOUNT (INR)', 475, 579, '/F2', 8, 71, 85, 105);

  // Row 1: Room Rent
  text(`Monthly Room Rent & Maintenance (${data.roomNumber})`, 52, 552, '/F2', 9, 15, 23, 42);
  text(data.period, 317, 552, '/F1', 8.5, 100, 116, 139);
  const amtStr = `Rs. ${data.amount.toLocaleString('en-IN')}.00`;
  text(amtStr, 470, 552, '/F2', 9.5, 15, 23, 42);

  line(40, 542, 555, 542, 241, 245, 249, 0.5);

  // Row 2: Maintenance & High-speed Wi-Fi
  text('Common Area Maintenance, Utilities & High-Speed Wi-Fi', 52, 526, '/F1', 8.5, 100, 116, 139);
  text('Included', 317, 526, '/F1', 8.5, 100, 116, 139);
  text('Rs. 0.00', 495, 526, '/F1', 8.5, 100, 116, 139);

  line(40, 516, 555, 516, 226, 232, 240, 0.5);

  // 7. Total Highlight Bar (Y: 468 - 502)
  fillColor(239, 246, 255);
  strokeColor(191, 219, 254);
  rect(40, 468, 515, 34, true, true);

  text('Total Amount Received:', 52, 481, '/F2', 11, 30, 58, 138);
  text(amtStr, 440, 481, '/F2', 13, 29, 78, 216);

  // 8. Official Certification & Tax Exemption Box
  fillColor(248, 250, 252);
  strokeColor(226, 232, 240);
  rect(40, 395, 515, 55, true, true);

  text('OFFICIAL PAYMENT CERTIFICATION & TAX COMPLIANCE', 52, 434, '/F2', 8, 71, 85, 105);
  text('This document certifies that the rental amount specified has been credited and settled in full.', 52, 420, '/F1', 8, 100, 116, 139);
  text('Eligible for House Rent Allowance (HRA) tax exemption under Section 10(13A) of the Income Tax Act.', 52, 408, '/F1', 8, 100, 116, 139);

  // 9. Signatory & Footer Block
  text('Platform: SmartRent Operations Cloud', 40, 335, '/F1', 8, 148, 163, 184);
  text(`Verification Code: ${data.receiptNumber}-${data.transactionId}`, 40, 323, '/F1', 7.5, 148, 163, 184);

  // Landlord Signature line
  line(380, 335, 540, 335, 148, 163, 184, 0.7);
  text(data.ownerName, 430, 321, '/F2', 9.5, 30, 41, 59);
  text('Authorized Landlord / Signatory', 415, 309, '/F1', 8, 100, 116, 139);

  // 10. Bottom Accent Strip
  fillColor(37, 99, 235);
  rect(0, 0, 595.28, 10, true, false);

  const streamContent = streamOps.join('\n');
  const streamLength = new TextEncoder().encode(streamContent).length;

  const objects = [];
  function addObj(content) {
    objects.push(content);
    return objects.length;
  }

  addObj('<< /Type /Catalog /Pages 2 0 R >>');
  addObj('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObj('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  addObj(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);

  let out = '%PDF-1.4\n';
  const xref = [0];
  for (let i = 0; i < objects.length; i++) {
    xref.push(new TextEncoder().encode(out).length);
    out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const startxref = new TextEncoder().encode(out).length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    out += `${String(xref[i]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return out;
}

/**
 * Downloads a professional, properly formatted PDF rent receipt
 */
export const downloadReceiptPDF = (receipt, settings = {}, ownerProfile = {}) => {
  if (!receipt) return;
  const data = normalizeReceiptData(receipt, settings, ownerProfile);
  const pdfString = buildReceiptPdfString(data);

  const blob = new Blob([pdfString], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.receiptNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/**
 * Opens a clean, dedicated printable view formatted specifically for A4 printing
 */
export const printReceipt = (receipt, settings = {}, ownerProfile = {}) => {
  if (!receipt) return;
  const data = normalizeReceiptData(receipt, settings, ownerProfile);

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${data.receiptNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      padding: 24px;
    }
    .receipt-container {
      max-width: 720px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      background: #ffffff;
    }
    .top-bar {
      height: 5px;
      background: #2563eb;
      margin: -32px -32px 28px -32px;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      background: #2563eb;
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
    }
    .brand-text h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-text p {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .receipt-no {
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }
    .receipt-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .detail-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 12px;
    }
    .detail-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .resident-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .text-secondary {
      color: #475569;
      margin-top: 2px;
    }
    .text-unit {
      color: #2563eb;
      font-weight: 600;
      margin-top: 4px;
    }
    .row-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .meta-val {
      font-weight: 600;
      color: #0f172a;
    }
    .table-container {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      padding: 10px 14px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      font-size: 11px;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    .text-right {
      text-align: right;
    }
    .total-bar {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .total-label {
      font-weight: 700;
      font-size: 13px;
      color: #1e3a8a;
    }
    .total-val {
      font-size: 18px;
      font-weight: 800;
      color: #1d4ed8;
    }
    .compliance-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 11px;
      color: #64748b;
      margin-bottom: 30px;
    }
    .compliance-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 4px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 10px;
    }
    .footer-left {
      font-size: 11px;
      color: #94a3b8;
    }
    .signature-block {
      text-align: center;
    }
    .sig-line {
      width: 140px;
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 6px;
    }
    .sig-name {
      font-weight: 700;
      font-size: 12px;
      color: #1e293b;
    }
    .sig-role {
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="top-bar"></div>
    <div class="header">
      <div class="brand-left">
        <div class="logo-badge">SR</div>
        <div class="brand-text">
          <h1>${data.businessName}</h1>
          <p>Official Rent Receipt & Tax Voucher | HRA Compliant</p>
        </div>
      </div>
      <div class="header-right">
        <div class="status-badge">● ${data.status}</div>
        <div class="receipt-no">${data.receiptNumber}</div>
        <div class="receipt-date">Date: ${data.paymentDate}</div>
      </div>
    </div>

    <div class="details-grid">
      <div class="detail-card">
        <div class="detail-label">Resident Information</div>
        <div class="resident-name">${data.tenantName}</div>
        <div class="text-secondary">${data.tenantPhone}</div>
        <div class="text-unit">${data.propertyName} — ${data.roomNumber}</div>
      </div>

      <div class="detail-card">
        <div class="detail-label">Payment Breakdown</div>
        <div class="row-meta">
          <span class="text-secondary">Billing Period:</span>
          <span class="meta-val">${data.period}</span>
        </div>
        <div class="row-meta">
          <span class="text-secondary">Method:</span>
          <span class="meta-val">${data.paymentMethod}</span>
        </div>
        <div class="row-meta">
          <span class="text-secondary">Txn Ref:</span>
          <span class="meta-val" style="font-family: monospace; color: #2563eb;">${data.transactionId}</span>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Billing Cycle</th>
            <th class="text-right">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Monthly Room Rent (${data.roomNumber})</strong></td>
            <td>${data.period}</td>
            <td class="text-right font-bold">₹${data.amount.toLocaleString('en-IN')}.00</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 11px;">Common Area Maintenance & High-Speed Wi-Fi</td>
            <td style="color: #64748b; font-size: 11px;">Included</td>
            <td class="text-right" style="color: #64748b; font-size: 11px;">₹0.00</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="total-bar">
      <div class="total-label">Total Amount Paid:</div>
      <div class="total-val">₹${data.amount.toLocaleString('en-IN')}.00</div>
    </div>

    <div class="compliance-box">
      <div class="compliance-title">Official Payment Certification</div>
      <p>This document certifies that the rental amount above has been credited and settled in full. Valid for Income Tax House Rent Allowance (HRA) exemption under section 10(13A).</p>
    </div>

    <div class="footer">
      <div class="footer-left">
        <div>SmartRent Cloud Operations</div>
        <div style="font-size: 10px; margin-top: 2px;">Ref: ${data.receiptNumber}-${data.transactionId}</div>
      </div>
      <div class="signature-block">
        <div class="sig-line"></div>
        <div class="sig-name">${data.ownerName}</div>
        <div class="sig-role">Authorized Landlord</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 350);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
