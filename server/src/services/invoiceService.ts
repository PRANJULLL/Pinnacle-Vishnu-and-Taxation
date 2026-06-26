import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import Invoice from "../models/Invoice";
import { BANK_DETAILS } from "../utils/constants";

const INVOICES_DIR = path.join(__dirname, "../../invoices");

if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

export const generateInvoiceNumber = async (): Promise<string> => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
};

interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  amount: number;
  plan: string;
  date: Date;
  orderId: string;
  pan: string;
  phone: string;
  email: string;
  client: string;
}

export const generateInvoicePDF = async (data: InvoiceData): Promise<string> => {
  const fileName = `${data.invoiceNumber}.pdf`;
  const filePath = path.join(INVOICES_DIR, fileName);

  const upiUrl = `upi://pay?pa=${BANK_DETAILS.upiId}&pn=${encodeURIComponent(BANK_DETAILS.payeeName)}&am=${data.amount}&cu=INR&tn=${encodeURIComponent(`Invoice ${data.invoiceNumber}`)}`;
  const qrBuffer = await QRCode.toBuffer(upiUrl, { margin: 1, width: 90 });

  return new Promise((resolve, reject) => {
    // 50pt margins: top 50, bottom 50, left 50, right 50
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Color Palette
    const primaryNavy = "#0f4c81";
    const headerBlue = "#104c97";
    const lightGrey = "#f8fafc";
    const borderGrey = "#c5c9cd";

    // 1. Header Section
    // Brand Logo
    const logoPath = path.join(__dirname, "../../../client/public/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 57, 57, { width: 76, height: 76 });
    } else {
      doc.circle(95, 95, 38).lineWidth(5).stroke(primaryNavy);
      doc.circle(95, 95, 30).lineWidth(1.5).stroke(headerBlue);
      doc.polygon([95, 75], [112, 105], [78, 105]).lineWidth(1.5).stroke(headerBlue);
      doc.lineJoin("miter");
      doc.fontSize(8).fillColor(primaryNavy).text("PINNACLE", 75, 92, { align: "center", width: 40 });
    }

    // Brand Name Text on the Right
    doc.font("Helvetica-Bold").fontSize(28).fillColor(headerBlue);
    doc.text("Pinnacle", 230, 60, { align: "left" });
    doc.text("Accounting & Taxation", 152, 92, { align: "left" });

    // Contact info line under Header
    doc.font("Helvetica").fontSize(10).fillColor("#000");
    const contactText = "+91 94673-62705 | FileYourITR007@gmail.com";
    doc.text(contactText, 50, 137, { align: "center", width: 495 });

    // Horizontal Divider Line below header
    doc.moveTo(50, 153).lineTo(545, 153).lineWidth(1).stroke(borderGrey);

    // 2. Invoice Meta Row (Invoice No & Date)
    doc.moveDown(1.5);
    const metaY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000");
    doc.text("INVOICE NO. - ", 50, metaY, { continued: true });
    doc.font("Helvetica").text(data.invoiceNumber);

    const formattedDate = data.date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    doc.font("Helvetica-Bold").text("DATE : ", 430, metaY, { continued: true });
    doc.font("Helvetica").text(formattedDate);

    // 3. Invoice Main Title
    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(22).fillColor(headerBlue).text("INVOICE", { align: "center" });
    doc.moveDown(0.5);

    // 4. Bill To Box
    const billToY = doc.y;
    doc.rect(50, billToY, 495, 60).fill(lightGrey);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000").text("BILL TO -", 60, billToY + 12);
    
    // Capitalize Customer Name
    const customerUpper = data.customerName.toUpperCase();
    doc.fontSize(12).font("Helvetica-Bold").text(customerUpper, 60, billToY + 32, { underline: true });

    // 5. Main Charges Table
    doc.moveDown(3);
    const tableTop = doc.y;
    const col1Width = 40;  // SR.
    const col2Width = 330; // Description
    const col3Width = 125; // Amount

    // Table Header Background Row
    doc.rect(50, tableTop, 495, 24).fill(lightGrey);
    doc.rect(50, tableTop, 495, 24).lineWidth(1).stroke(borderGrey);
    
    // Table Header Labels
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000");
    doc.text("SR.", 62, tableTop + 6, { width: col1Width, align: "left" });
    doc.text("Description", 50 + col1Width + 10, tableTop + 6, { width: col2Width - 10, align: "center" });
    doc.text("Amount", 50 + col1Width + col2Width, tableTop + 6, { width: col3Width, align: "center" });

    // Table Content Row
    const rowHeight = 180;
    const contentY = tableTop + 24;
    
    // Draw cells outer border
    doc.rect(50, contentY, 495, rowHeight).lineWidth(1).stroke(borderGrey);
    // Draw vertical cell dividers
    doc.moveTo(50 + col1Width, contentY).lineTo(50 + col1Width, contentY + rowHeight).stroke(borderGrey);
    doc.moveTo(50 + col1Width + col2Width, contentY).lineTo(50 + col1Width + col2Width, contentY + rowHeight).stroke(borderGrey);

    // Populate Row Cells
    doc.font("Helvetica-Bold").fontSize(12);
    // SR Number
    doc.text("1.", 65, contentY + 25);
    
    // Description text details
    const textStartX = 50 + col1Width + 15;
    doc.text("Towards The Profession Charges for -", textStartX, contentY + 25);
    
    doc.moveDown(1.5);
    const indentX = textStartX;
    doc.text(`${data.plan}`, indentX, doc.y);
    doc.text(`PAN no. ${data.pan || "NA"}`, indentX, doc.y + 4);
    doc.text(`phone no. ${data.phone || "NA"}`, indentX, doc.y + 8);
    doc.text(`e mail id. ${data.email || "NA"}`, indentX, doc.y + 12);

    // Amount value
    doc.text(`${data.amount}/-`, 50 + col1Width + col2Width, contentY + 65, { width: col3Width, align: "center" });

    // Table Total Footer Row
    const totalY = contentY + rowHeight;
    doc.rect(50, totalY, 495, 24).fill(lightGrey);
    doc.rect(50, totalY, 495, 24).lineWidth(1).stroke(borderGrey);
    // Draw vertical divider for total amount cell
    doc.moveTo(50 + col1Width + col2Width, totalY).lineTo(50 + col1Width + col2Width, totalY + 24).stroke(borderGrey);

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000");
    doc.text("Total", 60, totalY + 6);
    doc.text(`${data.amount}/-`, 50 + col1Width + col2Width, totalY + 6, { width: col3Width, align: "center" });

    // 6. Bank Details & QR footer layout
    doc.moveDown(2);
    const footerTop = doc.y;
    const boxWidth = 495;
    const boxHeight = 110;

    // Outer boundary box for Bank Details and QR code
    doc.rect(50, footerTop, boxWidth, boxHeight).lineWidth(1).stroke(borderGrey);

    // Header labels row (BANK DETAILS | Payment QR)
    doc.rect(50, footerTop, boxWidth, 22).fill(lightGrey);
    doc.rect(50, footerTop, boxWidth, 22).lineWidth(1).stroke(borderGrey);

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000");
    doc.text("BANK DETAILS", 50, footerTop + 5, { width: 330, align: "center" });
    
    // Draw vertical divider between Bank details and QR
    doc.moveTo(50 + 330, footerTop).lineTo(50 + 330, footerTop + boxHeight).stroke(borderGrey);
    doc.text("Payment QR", 50 + 330, footerTop + 5, { width: 165, align: "center" });

    // Bank credentials text
    const bankTextY = footerTop + 30;
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("BANK : ", 60, bankTextY, { continued: true });
    doc.font("Helvetica").text(`${BANK_DETAILS.bankName.toUpperCase()}`);

    doc.font("Helvetica-Bold").text("ACCOUNT NAME : ", 60, bankTextY + 12, { continued: true });
    doc.font("Helvetica").text(`${BANK_DETAILS.accountName.toUpperCase()}`);

    doc.font("Helvetica-Bold").text("ACCOUNT TYPE : ", 60, bankTextY + 24, { continued: true });
    doc.font("Helvetica-Oblique").text(`${BANK_DETAILS.accountType.toUpperCase()}`);

    doc.font("Helvetica-Bold").text("ACCOUNT NO : ", 60, bankTextY + 36, { continued: true });
    doc.font("Helvetica").text(`${BANK_DETAILS.accountNumber}`);

    doc.font("Helvetica-Bold").text("IFSC CODE : ", 60, bankTextY + 48, { continued: true });
    doc.font("Helvetica").text(`${BANK_DETAILS.ifsc}`);

    // Embed Payment QR code image
    doc.image(qrBuffer, 50 + 330 + 37, footerTop + 26, { width: 78, height: 78 });

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

export const getInvoiceFilePath = (invoiceNumber: string): string => {
  return path.join(INVOICES_DIR, `${invoiceNumber}.pdf`);
};
