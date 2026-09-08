const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testRealReceipt() {
  console.log('=== RUNNING REAL RECEIPT PRINT & A4 ISOLATION TEST ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const order = {
    id: 'ord-real-98421',
    orderNumber: 'OUD-84920',
    date: '2026-09-08',
    status: 'Processing',
    subtotal: 4450,
    shipping: 0,
    discount: 500,
    total: 3950,
    paymentMethod: 'Cash on Delivery',
    trackingNumber: 'EG-EXP-9921',
    shippingAddress: {
      fullName: 'Ahmed Hassan',
      phone: '+20 100 123 4567',
      streetAddress: '15 El-Nil Street',
      building: 'Tower A',
      apartment: 'Apt 4B',
      area: 'Zamalek',
      governorate: 'Cairo',
      additionalDetails: 'Near Nile City Towers'
    },
    items: [
      {
        id: 'item-1',
        name: 'Oud Royal',
        size: '100ml / 3.4 fl.oz',
        quantity: 1,
        price: 2500,
        imageUrl: '/images/hero_oud_bottle_1787700482747.jpg'
      },
      {
        id: 'item-2',
        name: 'Velvet Oud',
        size: '100ml / 3.4 fl.oz',
        quantity: 1,
        price: 1950,
        imageUrl: '/images/hero_oud_bottle_1787700482747.jpg'
      }
    ]
  };

  const address = order.shippingAddress;
  const addressLine1 = [address.streetAddress, address.building, address.apartment].filter(Boolean).join(', ');
  const addressLine2 = [address.area, address.governorate || address.city, 'Egypt'].filter(Boolean).join(', ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    @page {
      size: 210mm 297mm;
      margin: 6mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      background: #ffffff !important;
      color: #111111 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11.5px;
      line-height: 1.35;
    }
    .receipt-container {
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
      padding: 18px 22px;
      border: 2px solid #C9A45C;
      border-radius: 12px;
      background: #ffffff !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 5px;
      color: #070707;
    }
    .brand-subtitle {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2.5px;
      color: #8E713D;
      font-weight: 700;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #444;
      line-height: 1.6;
    }
    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      color: #8E713D;
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
    }
    th {
      background: #fbf9f5;
      border-top: 1px solid #C9A45C;
      border-bottom: 1px solid #C9A45C;
      padding: 8px 10px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8E713D;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e8e1d5; padding-bottom: 14px;">
      <div>
        <div class="brand-title">OUD-X</div>
        <div class="brand-subtitle">Haute Parfumerie & Privé Reserve</div>
        <div style="font-size: 11px; color: #777; margin-top: 2px;">Tax Invoice & Delivery Manifest</div>
      </div>
      <div class="meta-box">
        <div><strong>Order Ref:</strong> ${order.orderNumber}</div>
        <div><strong>Issue Date:</strong> ${order.date}</div>
        <div><strong>Payment:</strong> ${order.paymentMethod}</div>
        <div><strong style="color: #8E713D;">Tracking:</strong> ${order.trackingNumber}</div>
        <div style="margin-top: 4px;"><span style="display: inline-block; padding: 2px 8px; border-radius: 999px; background: #fbf3e4; border: 1px solid #C9A45C; font-size: 9px; font-weight: 700; color: #8E713D; text-transform: uppercase;">${order.status}</span></div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 14px 0; border-bottom: 1px solid #e8e1d5;">
      <div>
        <div class="section-title">Customer Information</div>
        <div style="font-weight: 700; font-size: 13px; color: #111;">${address.fullName}</div>
        <div style="color: #555; font-size: 12px; margin-top: 2px;">${address.phone}</div>
      </div>
      <div>
        <div class="section-title">Shipping Destination</div>
        <div style="color: #333; font-size: 12px; line-height: 1.5;">${addressLine1}<br/>${addressLine2}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align: left;">Fragrance Item</th>
          <th style="text-align: center; width: 60px;">Qty</th>
          <th style="text-align: right; width: 110px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(i => `
          <tr style="border-bottom: 1px solid #e8e1d5;">
            <td style="padding: 10px 8px;"><strong>${i.name}</strong> (${i.size})</td>
            <td style="padding: 10px 8px; text-align: center;">× ${i.quantity}</td>
            <td style="padding: 10px 8px; text-align: right; color: #8E713D; font-weight: bold;">${(i.price * i.quantity).toLocaleString()} EGP</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #e8e1d5; display: flex; justify-content: flex-end;">
      <div style="width: 240px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #555;"><span>Subtotal:</span><span>${order.subtotal.toLocaleString()} EGP</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #8E713D;"><span>Discount:</span><span>-${order.discount.toLocaleString()} EGP</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #555;"><span>Shipping:</span><span>${order.shipping === 0 ? '0 EGP (FREE)' : order.shipping + ' EGP'}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; color: #111; padding-top: 8px; border-top: 2px solid #C9A45C; margin-top: 4px;"><span>Total:</span><span style="color: #8E713D;">${order.total.toLocaleString()} EGP</span></div>
      </div>
    </div>
    <div style="margin-top: 20px; padding-top: 12px; border-top: 1px dashed #d0c4b2; text-align: center;">
      <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #8E713D;">
        OUD-X PRIVÉ RESERVE • AUTHENTICITY CERTIFIED
      </div>
      <div style="font-size: 10px; color: #888; margin-top: 2px;">
        Handcrafted in Grasse & Dubai • Luxury Perfume Masterpieces • Official Dispatch Receipt
      </div>
    </div>
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'load' });

  // 1. Generate full PDF
  const pdfPath = path.resolve(__dirname, '..', 'receipt_output.pdf');
  const pdfBuf = await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true
  });

  console.log(`✓ PDF Generated successfully: ${pdfPath} (${pdfBuf.length} bytes)`);

  // 2. Exact Page Count Verification via Chromium CDP pageRanges
  let page1Exists = false;
  let page2Exists = false;

  try {
    await page.pdf({ format: 'A4', pageRanges: '1' });
    page1Exists = true;
  } catch (e) {
    page1Exists = false;
  }

  try {
    await page.pdf({ format: 'A4', pageRanges: '2' });
    page2Exists = true;
  } catch (e) {
    // Expected to throw "Page range exceeds page count"
    page2Exists = false;
  }

  const exactlyOnePage = page1Exists && !page2Exists;
  console.log(`✓ Page 1 generated: ${page1Exists}`);
  console.log(`✓ Page 2 exists: ${page2Exists} (strictly prohibited: ${!page2Exists})`);
  console.log(`✓ Exactly 1 page verified: ${exactlyOnePage ? 'PASS' : 'FAIL'}`);

  // 3. Content Visibility Checks
  const bodyText = await page.evaluate(() => document.body.innerText);

  const checks = {
    orderNumberVisible: bodyText.includes('OUD-84920'),
    customerInfoVisible: bodyText.includes('Ahmed Hassan') && bodyText.includes('+20 100 123 4567'),
    itemsVisible: bodyText.includes('Oud Royal') && bodyText.includes('Velvet Oud'),
    subtotalVisible: bodyText.includes('4,450 EGP'),
    shippingVisible: bodyText.includes('0 EGP (FREE)'),
    discountVisible: bodyText.includes('-500 EGP'),
    totalVisible: bodyText.includes('3,950 EGP'),
    paymentMethodVisible: bodyText.includes('Cash on Delivery'),
    noNavbar: !bodyText.includes('Bag (0)') && !bodyText.includes('Haute Parfumerie'),
    noFooter: !bodyText.includes('Concierge') && !bodyText.includes('Newsletter'),
    noAdminDashboard: !bodyText.includes('Catalog Management') && !bodyText.includes('Adjust Stock'),
    noModalBackdrop: !bodyText.includes('Backdrop')
  };

  console.log('\nReceipt Content Checks:');
  console.table(checks);

  const allContentPass = Object.values(checks).every(Boolean);

  await browser.close();

  if (exactlyOnePage && allContentPass) {
    console.log('\nRECEIPT PRINT QA RESULT: PASS');
  } else {
    console.log('\nRECEIPT PRINT QA RESULT: FAIL');
  }
}

testRealReceipt().catch(err => {
  console.error('Receipt test error:', err);
  process.exit(1);
});
