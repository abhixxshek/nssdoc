import { jsPDF } from "jspdf";
import { format, parseISO } from "date-fns";

export interface ReportData {
  name: string;
  category: string;
  date: string;
  duration: string;
  volunteerCount: string;
  highlights: string;
}

import { compressImage } from "./imageUtils";

export const generateNSSReport = async (
  data: ReportData,
  images: File[],
  share: boolean = false
) => {
  // Use 'pt' to perfectly replicate Dart's 'pw' point-based layout engine
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const fontRegular = "times";
  const fontBold = "times";

  // Page margins with extra left margin for document binding
  const marginTop = 32;
  const marginBottom = 32;
  const marginLeft = 60; // 60pt left binding margin
  const marginRight = 32;

  let currentY = marginTop;
  const formattedDate = data.date ? format(parseISO(data.date), "dd-MM-yy") : "";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Group the formal tabular templates together
  const formalCategories = ["Community", "Campus", "Orientation"];

  if (formalCategories.includes(data.category)) {
    // Title mapping
    let reportTitle = "NSS ACTIVITY REPORT";
    if (data.category === "Community") reportTitle = "REPORTS OF COMMUNITY ACTIVITIES";
    else if (data.category === "Campus") reportTitle = "REPORTS OF CAMPUS ACTIVITIES";
    else if (data.category === "Orientation") reportTitle = "REPORT OF ORIENTATION PROGRAM";

    doc.setFont(fontBold, "bold");
    doc.setFontSize(18);
    currentY += 18; // move down by font height approx
    doc.text(reportTitle, marginLeft + contentWidth / 2, currentY, { align: "center" });
    currentY += 20; // Increased spacing between header and table layout

    const totalFlex = 8.2;
    const flexUnit = contentWidth / totalFlex;

    doc.setLineWidth(1);
    doc.setDrawColor(0);

    // Row 1
    const row1Heights = 24;
    const row1Widths = [flexUnit * 1.2, flexUnit * 2, flexUnit * 1, flexUnit * 1, flexUnit * 2, flexUnit * 1];
    const row1Data = [
      { text: 'Date', bold: true }, { text: formattedDate, bold: false },
      { text: 'Duration', bold: true }, { text: `${data.duration} Hours`, bold: false },
      { text: 'No of volunteers:', bold: true }, { text: data.volunteerCount, bold: false }
    ];

    let currentX = marginLeft;
    for (let i = 0; i < 6; i++) {
      // Draw pw.TableBorder cell
      doc.rect(currentX, currentY, row1Widths[i], row1Heights);
      doc.setFont(row1Data[i].bold ? fontBold : fontRegular, row1Data[i].bold ? "bold" : "normal");
      doc.setFontSize(13); // Ensuring table text stays at 13
      doc.text(row1Data[i].text, currentX + 5, currentY + 16); // padding 5 + baseline adjustment
      currentX += row1Widths[i];
    }
    currentY += row1Heights;

    // Row 2 (pw.Border(left, right, bottom, verticalInside))
    const row2Heights = 24;
    doc.rect(marginLeft, currentY, flexUnit * 1.2, row2Heights);
    doc.rect(marginLeft + flexUnit * 1.2, currentY, flexUnit * 7, row2Heights);

    doc.setFont(fontBold, "bold");
    doc.setFontSize(13);
    doc.text('Program', marginLeft + 5, currentY + 16);
    doc.setFont(fontRegular, "normal");
    doc.text(data.name, marginLeft + flexUnit * 1.2 + 5, currentY + 16);

    currentY += row2Heights;

    // Highlights Box (pw.Expanded)
    const photoGridHeight = 2 * 180; // 2 rows of 180 fixed height
    const photoGridSpacing = 10; // pw.SizedBox(height: 10)
    const paddingBottom = marginBottom;

    // Fills exactly the remaining height
    const highlightsHeight = pageHeight - paddingBottom - photoGridHeight - photoGridSpacing - currentY;

    const col1Width = flexUnit * 1.2;
    const col2Width = flexUnit * 7;

    doc.rect(marginLeft, currentY, col1Width, highlightsHeight);
    doc.rect(marginLeft + col1Width, currentY, col2Width, highlightsHeight);

    // Highlights Label
    doc.setFont(fontBold, "bold");
    doc.setFontSize(13); // Keeping label consistent with other table headers
    doc.text("Highlights of program", marginLeft + 5, currentY + 16, { maxWidth: col1Width - 10 });

    // Highlights User Content
    doc.setFont(fontRegular, "normal");
    doc.setFontSize(14); // User content font size explicitly set to 14
    const highlightsLines = doc.splitTextToSize(data.highlights, col2Width - 10);
    // Draw text with bounding limit so it doesn't overflow
    doc.text(highlightsLines, marginLeft + col1Width + 5, currentY + 16);

    currentY += highlightsHeight + photoGridSpacing;

    // Formal photo grid - strictly 2x2 grid (pw.Table with Border.All, and fixed height 180)
    const cellWidth = contentWidth / 2;
    const cellHeight = 180;

    for (let i = 0; i < 4; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const xPositions = marginLeft + (col * cellWidth);
      const yPositions = currentY + (row * cellHeight);

      doc.setLineWidth(1);
      doc.rect(xPositions, yPositions, cellWidth, cellHeight);

      if (i < images.length) {
        try {
          // Compress image before adding to PDF
          const dataUrl = await compressImage(images[i]);
          const padding = 5; // EdgeInsets.all(5)
          doc.addImage(
            dataUrl,
            'JPEG', // Forced to JPEG by our compression function
            xPositions + padding,
            yPositions + padding,
            cellWidth - 2 * padding,
            cellHeight - 2 * padding,
            undefined,
            'FAST'
          );
        } catch (e) {
          console.error("Failed to add image", e);
          doc.setFontSize(14);
          doc.text("No Image", xPositions + cellWidth / 2 - 30, yPositions + cellHeight / 2);
        }
      } else {
        doc.setFont(fontRegular, "normal");
        doc.setFontSize(14);
        doc.text("No Image", xPositions + cellWidth / 2 - 30, yPositions + cellHeight / 2);
      }
    }
  } else {
    // Non-Formal template fallback (General/Other)
    doc.setFont(fontBold, "bold");
    doc.setFontSize(24);
    currentY += 24;
    doc.text("NSS Activity Report", marginLeft, currentY);
    currentY += 10;

    doc.setFontSize(18);
    doc.setFont(fontRegular, "normal");
    currentY += 18;
    doc.text(`Program Name: ${data.name}`, marginLeft, currentY);
    currentY += 14;

    doc.setFontSize(14);
    doc.text(`Category: ${data.category}`, marginLeft, currentY);
    currentY += 14;
    doc.text(`Date: ${formattedDate}`, marginLeft, currentY);
    currentY += 14;
    doc.text(`Location: (Not Specified)`, marginLeft, currentY);
    currentY += 10;

    doc.setLineWidth(1);
    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
    currentY += 10; // Divider 
    currentY += 20; // pw.SizedBox(height:20)

    if (images.length > 0) {
      const cellWidth = (contentWidth - 10) / 2; // crossAxisSpacing: 10
      const cellHeight = cellWidth / 0.8; // childAspectRatio: 0.8

      for (let i = 0; i < images.length; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const xPositions = marginLeft + (col * (cellWidth + 10));
        const yPositions = currentY + (row * (cellHeight + 10)); // mainAxisSpacing: 10

        try {
          // Compress image before adding to PDF
          const dataUrl = await compressImage(images[i]);
          doc.addImage(dataUrl, 'JPEG', xPositions, yPositions, cellWidth, cellWidth, undefined, 'FAST');

          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(`Uploaded File Snippet`, xPositions, yPositions + cellWidth + 12);
          doc.setTextColor(0, 0, 0);
        } catch (e) {
          console.error("Failed to add image", e);
        }
      }
      currentY += Math.ceil(images.length / 2) * (cellHeight + 10);
    }

    currentY += 20; // pw.SizedBox(height:20) or just some spacing
    doc.setLineWidth(1);
    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
    currentY += 15;
    doc.setFontSize(12);
    doc.text(`Total Photos: ${images.length}`, marginLeft, currentY);
    doc.text("Generated by NSS Docs App", pageWidth - marginRight, currentY, { align: "right" });
  }

  const fileName = `NSS_Report_${data.name.replace(/ /g, '_')}.pdf`;

  if (share && navigator.share) {
    try {
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      await navigator.share({ title: fileName, files: [file] });
    } catch (e) {
      doc.save(fileName);
    }
  } else {
    doc.save(fileName);
  }
};
