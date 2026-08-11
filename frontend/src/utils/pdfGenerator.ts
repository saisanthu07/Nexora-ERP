import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Challan } from '../types';

export function generateChallanPDF(challan: Challan) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Header / Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(36, 45, 54);
  doc.text('NEXORA ERP', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('SALES CHALLAN / INVOICE', 14, 24);

  // Status & Challan Number
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(challan.challanNumber, 196, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${challan.status}`, 196, 24, { align: 'right' });
  doc.text(`Date: ${new Date(challan.createdAt).toLocaleDateString()}`, 196, 29, { align: 'right' });

  // Line separator
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 33, 196, 33);

  // Customer Information Box
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(36, 45, 54);
  doc.text('Billed To / Customer Details:', 14, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const customerName = challan.customer?.name || 'Valued Customer';
  const business = challan.customer?.businessName ? ` (${challan.customer.businessName})` : '';
  doc.text(`${customerName}${business}`, 14, 46);

  if (challan.customer?.phone) doc.text(`Phone: ${challan.customer.phone}`, 14, 51);
  if (challan.customer?.address) doc.text(`Address: ${challan.customer.address}`, 14, 56);

  // Items Table
  const tableData = challan.items.map((item) => [
    item.productNameSnapshot,
    item.skuSnapshot,
    item.quantity.toString(),
    `INR ${Number(item.priceSnapshot).toLocaleString('en-IN')}`,
    `INR ${Number(item.lineTotal).toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: 64,
    head: [['Product Name', 'SKU', 'Qty', 'Unit Price', 'Line Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [36, 51, 60], textColor: [250, 246, 236], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35 },
      2: { halign: 'right', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 27 },
    },
  });

  // Totals Summary Box
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Quantity: ${challan.totalQuantity ?? challan.items.reduce((a, i) => a + i.quantity, 0)} pcs`, 130, finalY);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Amount: INR ${Number(challan.totalAmount).toLocaleString('en-IN')}`, 130, finalY + 6);

  // Footer Note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(130, 130, 130);
  doc.text('This is a computer-generated document issued by Nexora ERP. No signature required.', 14, 285);

  doc.save(`Invoice_${challan.challanNumber}.pdf`);
}
