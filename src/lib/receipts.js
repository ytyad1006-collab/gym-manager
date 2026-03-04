import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatCurrency, formatDate } from "./utils";

export const generateReceipt = (payment, gymData, preferences) => {
  const doc = new jsPDF();
  const { currency, dateFormat } = preferences;

  // Header: Gym Branding
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(gymData.name.toUpperCase(), 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-400
  doc.text("OFFICIAL PAYMENT RECEIPT", 14, 30);
  doc.text(`DATE: ${formatDate(payment.created_at, dateFormat)}`, 14, 35);

  // Table Structure
  const tableData = [
    ["Member Name", payment.member_name],
    ["Plan Type", payment.plan_name],
    ["Transaction ID", payment.id.substring(0, 12).toUpperCase()],
    ["Amount Paid", formatCurrency(payment.amount, currency)],
    ["Status", "SUCCESSFUL"],
  ];

  doc.autoTable({
    startY: 50,
    head: [['Description', 'Details']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillStyle: [37, 99, 235], fontWeight: 'bold' }, // Blue-600
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.text("This is a computer-generated receipt. No signature required.", 14, finalY);
  doc.text(`Issued via ${gymData.name} Global Management System`, 14, finalY + 5);

  // Download the PDF
  doc.save(`Receipt_${payment.member_name.replace(/\s+/g, '_')}.pdf`);
};