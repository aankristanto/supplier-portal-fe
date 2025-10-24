import moment from "moment";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from "jsbarcode";

export const defaultColDef = {
  sortable: true,
  filter: true,
  floatingFilter: true,
  resizable: true,
  enableCellTextSelection: true,
  flex: 0,
}

export const colorListSummary = [
  "#4CAF60", "#FFC107", "#2196F9", "#FF5730", "#9C27B9",
  "#3F51B5", "#009690", "#FF9800", "#E91E63", "#795580",
  "#607D8B", "#8BC34D", "#FFEB3A", "#2196F8", "#3F51B9",
  "#E91E63", "#9C27B0", "#795548", "#009688", "#FF5722",
  "#FF9800", "#8BC34A", "#4CAF50", "#CDDC39", "#FFEB3B",
  "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
  "#2196F3", "#03A9F4"
]


export function numberToWords(num) {
  if (num === 0) return "Zero";

  const belowTwenty = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const thousands = ["", "Thousand", "Million", "Billion", "Trillion"];

  function helper(n) {
    if (n === 0) return "";
    else if (n < 20) return belowTwenty[n] + " ";
    else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
    else return belowTwenty[Math.floor(n / 100)] + " Hundred " + helper(n % 100);
  }


  let [intPart, decPart] = num.toString().split(".");
  intPart = parseInt(intPart, 10);

  let result = "";
  let i = 0;

  while (intPart > 0) {
    if (intPart % 1000 !== 0) {
      result = helper(intPart % 1000) + thousands[i] + " " + result;
    }
    intPart = Math.floor(intPart / 1000);
    i++;
  }

  if (!result) result = "Zero";


  if (decPart) {
    let decimalWords = decPart
      .split("")
      .map(d => belowTwenty[parseInt(d)])
      .join(" ");
    result = result.trim() + " point " + decimalWords;
  }

  return result.trim().replace(/\s+/g, " ");
}

export const printMpoToPdf = (po, lineItems) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const printDate = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;


  function drawWatermark(doc) {

  }


  function convertToOrderRows(items) {
    const seen = new Set();
    const result = [];

    for (const item of items) {
      const customerName = item.CUSTOMER_NAME || '';
      const orderCode = item.ORDER_CODE || '';
      const key = `${customerName}|${orderCode}`;

      if (!seen.has(key)) {
        seen.add(key);
        result.push([
          customerName,
          item.CUSTOMER_SEASON || '',
          orderCode,
          item.ORDER_REF_PO_NO || '',
          item.ORDER_DESCRIPTION || '',
          item.ORDER_GARMENT_DELIVERY || ''
        ]);
      }
    }

    return result;
  }


  function convertToMaterialRows(items) {
    return items.map((item, index) => [
      index + 1,
      `${item.MATERIAL_ITEM_ID}/${item.MATERIAL_ITEM_DIM_ID}/${item.ITEM_TYPE_CODE}/${item.ITEM_CATEGORY_DESC}` ?? '',
      item.ITEM_CODE_DESCRIPTION ?? '',
      item.MATERIAL_ITEM_COLOR ?? '',
      item.MATERIAL_ITEM_SIZE ?? '',
      item.MATERIAL_ITEM_SERIAL_NO ?? '',
      item.PURCHASE_UOM ?? '',
      item.PURCHASE_ORDER_QTY ?? '',
      parseFloat(item.TOTAL_UNIT_COST).toFixed(2) ?? '',
      parseFloat(item.TOTAL_PURCHASE_COST).toFixed(2) ?? ''
    ]);
  }


  function drawHeaderCompact(doc) {
    drawWatermark(doc);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PUR - 06', 191, 9);
    doc.text('REV - 02', 191, 14);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(189, 5, 15, 11);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', 120, 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('NO', 120, 15);
    doc.text(`: ${po.ID || 'MPO0000001'}/${po.REV_ID || 0}/SBR`, 135, 15);
    doc.text('DATE', 120, 20);
    doc.text(`: ${po.MPO_DATE ? moment(po.MPO_DATE).format('DD MMMM YYYY') : moment().format('DD MMMM YYYY')}`, 135, 20);
    doc.text('STATUS', 120, 25);
    doc.text(`: ${po.MPO_STATUS || 'Open'}`, 135, 25);
  }


  function drawHeaderFull(doc) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PT. SUMBER BINTANG REJEKI', 5, 10);
  }


  function drawFooter(doc, pageNumber) {
    const footerY = 285;
    doc.setFontSize(8);
    doc.text(`Print date: ${printDate}`, 5, footerY);
    doc.setLineWidth(0.2);
    doc.line(5, footerY + 1, 205, footerY + 1);

    doc.setFontSize(15);
    doc.setTextColor(0, 0, 255);
    doc.text('SUMMIT', 5, footerY + 7);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(7);
    doc.text(`Copyright©${new Date().getFullYear()} PT Sumber Bintang Rejeki. All rights reserved.`, 5, footerY + 10);
    doc.text(`Page ${pageNumber}`, 190, footerY + 10);
  }


  function drawTotals(doc, y, total) {
    const surcharge = parseFloat(po.SURCHARGE_AMOUNT) || 0;
    const taxPercent = parseFloat(po.TAX_PERCENTAGE) || 0;

    const amountAfterSurcharge = total + surcharge;
    const taxAmount = amountAfterSurcharge * (taxPercent / 100);
    const grandTotal = amountAfterSurcharge + taxAmount;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount In Words: ', 5, y + 5, { maxWidth: 40 });
    doc.setFont('helvetica', 'normal');
    doc.text(`${numberToWords(parseFloat(grandTotal).toFixed(2))} ${po.CURRENCY_CODE}`, 43, y + 5, { maxWidth: 90 });

    doc.setFontSize(9);
    doc.text('TOTAL AMOUNT', 135, y + 5);
    doc.text(parseFloat(total).toFixed(2), 175, y + 5);

    doc.text('SURCHARGE AMOUNT :', 135, y + 10);
    doc.text(parseFloat(surcharge).toFixed(2), 175, y + 10);

    doc.text('TAX AMOUNT :', 135, y + 15);
    doc.text(`${parseFloat(taxPercent).toFixed(2)} %`, 175, y + 15);

    doc.setLineWidth(0.3);
    doc.line(5, y + 18, 205, y + 18);

    doc.setFontSize(10);
    doc.text('GRAND TOTAL :', 135, y + 22);
    doc.text(`(${po.CURRENCY_CODE}) ${parseFloat(grandTotal).toFixed(2)}`, 175, y + 22);
  }


  function drawSignaturePage(doc) {
    doc.addPage();
    drawHeaderCompact(doc);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PT. Sumber Bintang Rejeki Does Not Accept Over and Short Shipment.', 5, 40);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Note: ${po.NOTE || ''}`, 5, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Confirmed by Supplier', 5, 60);
    doc.text('Approved by', 100, 60);
    doc.text('Prepared by', 170, 60);

    doc.setLineWidth(0.2);
    doc.line(5, 80, 50, 80);
    doc.line(100, 80, 145, 80);
    doc.line(170, 80, 205, 80);

    doc.setFont('helvetica', 'normal');
    doc.text(String(po?.APPROVE_BY), 170, 85);


    drawFooter(doc, doc.internal.getCurrentPageInfo().pageNumber);
  }


  drawHeaderFull(doc);
  drawHeaderCompact(doc);


  doc.setFont('helvetica', 'bold');
  doc.setFillColor(50, 50, 50);
  doc.rect(5, 30, 70, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('Vendor', 8, 35);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Name', 8, 43); doc.text(': ', 20, 43); doc.text(po.VENDOR_DETAIL?.VENDOR_NAME || '', 22, 43);
  doc.text('Address', 8, 48); doc.text(': ', 20, 48);
  doc.text(`${po.VENDOR_DETAIL?.VENDOR_ADDRESS_1 || ''}, ${po.VENDOR_DETAIL?.VENDOR_ADDRESS_2 || ''}`, 22, 48, { maxWidth: 50 });
  doc.text('Attn', 8, 63); doc.text(': ', 20, 63);
  doc.text(`${po.VENDOR_DETAIL?.VENDOR_CONTACT_NAME || ''} / ${po.VENDOR_DETAIL?.VENDOR_CONTACT_POSITION || ''}`, 22, 63, { maxWidth: 50 });
  doc.text('Tel', 8, 71); doc.text(': ', 20, 71); doc.text(po.VENDOR_DETAIL?.VENDOR_CONTACT_PHONE_1 || '', 22, 71, { maxWidth: 50 });
  doc.text('Email', 8, 75); doc.text(': ', 20, 75); doc.text(po.VENDOR_DETAIL?.VENDOR_CONTACT_EMAIL || '', 22, 75, { maxWidth: 50 });

  doc.setFillColor(50, 50, 50);
  doc.rect(73, 30, 0.5, 50, 'F');


  doc.setFont('helvetica', 'bold');
  doc.setFillColor(50, 50, 50);
  doc.rect(75, 30, 70, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('Billing To', 78, 35);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Name', 78, 43); doc.text(': ', 90, 43); doc.text(po.INVOICE_DETAIL?.INVOICE_COMPANY_NAME || '', 92, 43);
  doc.text('Address', 78, 48); doc.text(': ', 90, 48);
  doc.text(`${po.INVOICE_DETAIL?.INVOICE_ADDRESS || ''}, ${po.INVOICE_DETAIL?.INVOICE_ADDRESS_2 || ''}`, 92, 48, { maxWidth: 50 });
  doc.text('Tel', 78, 71); doc.text(': ', 90, 71); doc.text(po.INVOICE_DETAIL?.INVOICE_PHONE || '', 92, 71, { maxWidth: 50 });
  doc.text('Email', 78, 75); doc.text(': ', 90, 75); doc.text(po.INVOICE_DETAIL?.INVOICE_EMAIL || '', 92, 75, { maxWidth: 50 });

  doc.setFillColor(50, 50, 50);
  doc.rect(145, 30, 60, 0.5, 'F');


  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Delivery Date', 148, 35);
  doc.text('Delivery Mode', 148, 40);
  doc.text('Port of Discharge', 148, 45);
  doc.text(': ', 172, 35); doc.text(': ', 172, 40); doc.text(': ', 172, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(po.MPO_ETD || '', 173, 35);
  doc.text(po.DELIVERY_MODE_CODE || '', 173, 40);
  doc.text(po.PORT_DISCHARGE || '', 173, 45);

  doc.setFillColor(50, 50, 50);
  doc.rect(145, 30, 0.5, 50, 'F');
  doc.rect(145, 48, 60, 0.5, 'F');

  doc.rect(5, 30, 0.5, 50, 'F');
  doc.rect(5, 80, 200, 0.5, 'F');
  doc.rect(205, 30, 0.5, 50, 'F');

  doc.text('Delivery Location :', 148, 53);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(po.INVOICE_DETAIL?.INVOICE_COMPANY_NAME || '', 148, 58);
  doc.setFontSize(8);
  doc.text(po.INVOICE_DETAIL?.INVOICE_ADDRESS || '', 148, 62, { maxWidth: 50 });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Port of Loading :', 5, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(po.COUNTRY_NAME || '', 35, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Terms of Delivery :', 78, 85);
  doc.text(po.DELIVERY_TERM || '', 110, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Terms of Payment :', 138, 85);
  doc.text(po.PAYMENT_TERM_NAME || '', 173, 85);


  const orderColumns = ['Customer', 'Season', 'Order Code', 'Order PO Ref. No', 'Order PO Style Ref.', 'Garment Delivery'];
  autoTable(doc, {
    startY: 90,
    margin: { left: 5, right: 5 },
    head: [orderColumns],
    body: convertToOrderRows(lineItems),
    theme: 'grid',
    headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontSize: 8, cellPadding: 2 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 40 },
      4: { cellWidth: 65 },
      5: { cellWidth: 30 }
    },
    styles: { font: 'helvetica' }
  });


  const materialColumns = ['#', 'Item', 'Description', 'Color', 'Size', 'Serial No', 'UOM', 'PO Qty', 'Unit Cost', 'Amount'];
  const materialRows = convertToMaterialRows(lineItems);
  let totalAmount = materialRows.reduce((sum, row) => sum + parseFloat(row[9] || 0), 0);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    margin: { left: 5, right: 5 },
    head: [materialColumns],
    body: materialRows,
    theme: 'grid',
    headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontSize: 8, cellPadding: 2 },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 13 },
      4: { cellWidth: 13 },
      5: { cellWidth: 15 },
      6: { cellWidth: 15 },
      7: { cellWidth: 19 },
      8: { cellWidth: 20 },
      9: { cellWidth: 25 }
    },
    styles: { overflow: 'linebreak', font: 'helvetica' },
    didDrawPage: (data) => {
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      if (currentPage > 1) drawHeaderCompact(doc);
      drawFooter(doc, currentPage);
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  if (finalY > 270) {
    doc.addPage();
    drawHeaderCompact(doc);
    drawTotals(doc, 20, totalAmount);
  } else {
    drawTotals(doc, finalY, totalAmount);
  }

  drawSignaturePage(doc);
  const fileName = `purchase-order_${po.ID || 'MPO'}.pdf`;
  doc.save(fileName);
};

export const generatePackingLabelPDF = (packingListData) => {
  const doc = new jsPDF({
    orientation: 'landscape', 
    unit: 'mm',
    format: [80, 50], 
  });

  const { COMPANY, PACKING_LIST } = packingListData;


  PACKING_LIST.forEach((box, index) => {
    if (index > 0) {
      doc.addPage([80, 50], 'landscape');
    }

    const { SEQUENCE, BARCODE_CODE, BARCODE_SYSTEM, PACKING_LIST_DETAILS } = box;

    const mpoIds = [...new Set(PACKING_LIST_DETAILS.map(detail => detail.PURCHASE_ORDER_ID))].join(', ');
    const itemIds = [...new Set(PACKING_LIST_DETAILS.map(detail => detail.ITEM_ID))].join(', ');
    const barcodeValue = BARCODE_CODE || BARCODE_SYSTEM;
    
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcodeValue, {
      format: "CODE128",
      width: 1.2, 
      height: 15, 
      displayValue: false, 
      margin: 0,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 5,
      marginRight: 5,
    });

    
    const barcodeImgData = canvas.toDataURL('image/png');
    doc.addImage(barcodeImgData, 'PNG', 5, 5, 70, 15); 
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'bold');
    doc.text(barcodeValue, 40, 23, { align: 'center', maxWidth: 70 });


    doc.setFontSize(6);
    doc.setFont('Helvetica', 'normal');
    const boxTotalQty = PACKING_LIST_DETAILS.reduce((sum, detail) => sum + (detail.QUANTITY || 0), 0);
    doc.text(`Box Sequence: ${SEQUENCE}`, 20, 27);
    doc.text(`Total QTY: ${boxTotalQty}`, 46, 27);

    doc.text(`MPOs: ${mpoIds || '-'}`, 8, 33, {maxWidth: 70});
    doc.text(`Item IDs: ${itemIds || '-'}`, 8, 38, {maxWidth: 70});

    doc.setFontSize(8);
    doc.setFont('Helvetica', 'bold');
    doc.text(COMPANY?.NAME || 'N/A', 40, 46, {align: 'center', maxWidth: 70});
  });

  doc.save(`Packing_Label_${packingListData.INVOICE_NO || 'UNKNOWN'}.pdf`);
};