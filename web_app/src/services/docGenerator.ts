import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
  BorderStyle,
  HeightRule,
  LineRuleType,
  Packer,
  ImageRun,
  type IBorderOptions,
  type ITableBordersOptions,
} from "docx";
import { format, parseISO } from "date-fns";
import type { ReportData } from "./pdfGenerator";
import { compressImage } from "./imageUtils";

const saveBlobAsFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const generateNSSDoc = async (
  data: ReportData,
  images: File[],
  share: boolean = false
) => {
  const formattedDate = data.date ? format(parseISO(data.date), "dd-MM-yy") : "";
  const formalCategories = ["Community", "Campus", "Orientation"];
  const fontName = "Times New Roman";

  // Standard 1pt solid black border (8 eighths of a pt = 1pt)
  const solidBlackBorder: IBorderOptions = {
    style: BorderStyle.SINGLE,
    size: 8,
    color: "000000",
  };

  const allBorders: ITableBordersOptions = {
    top: solidBlackBorder,
    bottom: solidBlackBorder,
    left: solidBlackBorder,
    right: solidBlackBorder,
    insideHorizontal: solidBlackBorder,
    insideVertical: solidBlackBorder,
  };

  const noBorders: ITableBordersOptions = {
    top: { style: BorderStyle.NIL },
    bottom: { style: BorderStyle.NIL },
    left: { style: BorderStyle.NIL },
    right: { style: BorderStyle.NIL },
    insideHorizontal: { style: BorderStyle.NIL },
    insideVertical: { style: BorderStyle.NIL },
  };

  let documentChildren: (Paragraph | Table)[] = [];

  if (formalCategories.includes(data.category)) {
    // 1. Report title matching PDF template
    let reportTitle = "NSS ACTIVITY REPORT";
    if (data.category === "Community") {
      reportTitle = "REPORTS OF COMMUNITY ACTIVITIES";
    } else if (data.category === "Campus") {
      reportTitle = "REPORTS OF CAMPUS ACTIVITIES";
    } else if (data.category === "Orientation") {
      reportTitle = "REPORT OF ORIENTATION PROGRAM";
    }

    // Title Paragraph: 18pt bold, centered, Times New Roman, exactly 20pt spacing after (400 twips)
    const titleParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 0,
        after: 400,
        line: 360,
        lineRule: LineRuleType.EXACT,
      },
      children: [
        new TextRun({
          text: reportTitle,
          font: fontName,
          bold: true,
          size: "18pt",
          color: "000000",
        }),
      ],
    });

    // Content dimensions:
    // A4 width: 11906 dxa, margin: 640 dxa (32pt) each side => contentWidth: 10626 dxa
    // Column widths replicating PDF flex 8.2 (1.2, 2.0, 1.0, 1.0, 2.0, 1.0)
    const colWidths = [1555, 2592, 1296, 1296, 2592, 1295];
    const totalContentWidth = 10626;

    // Cell padding: 5pt (100 twips) horizontal, vertical adjusted for 24pt height
    const headerCellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

    // Row 1: Date | [date] | Duration | [duration] Hours | No of volunteers: | [count]
    // Fixed 24pt height (480 twips), exactly matching PDF
    const row1 = new TableRow({
      height: { value: 480, rule: HeightRule.EXACT },
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.DXA },
          margins: headerCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.EXACT },
              children: [
                new TextRun({
                  text: "Date",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[1], type: WidthType.DXA },
          margins: headerCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.EXACT },
              children: [
                new TextRun({
                  text: formattedDate,
                  font: fontName,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[2], type: WidthType.DXA },
          margins: headerCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.EXACT },
              children: [
                new TextRun({
                  text: "Duration",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[3], type: WidthType.DXA },
          margins: headerCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.EXACT },
              children: [
                new TextRun({
                  text: `${data.duration} Hours`,
                  font: fontName,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[4], type: WidthType.DXA },
          margins: headerCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.EXACT },
              children: [
                new TextRun({
                  text: "No of volunteers:",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[5], type: WidthType.DXA },
          margins: headerCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.EXACT },
              children: [
                new TextRun({
                  text: data.volunteerCount,
                  font: fontName,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // Row 2: Program | [program name]
    // Fixed 24pt height (480 twips), exactly matching PDF
    const row2 = new TableRow({
      height: { value: 480, rule: HeightRule.EXACT },
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.DXA },
          margins: headerCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.EXACT },
              children: [
                new TextRun({
                  text: "Program",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          columnSpan: 5,
          width: { size: totalContentWidth - colWidths[0], type: WidthType.DXA },
          margins: headerCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.EXACT },
              children: [
                new TextRun({
                  text: data.name,
                  font: fontName,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // Row 3: Highlights of program
    // Replicates the exact remaining box height (~320pt = 6400 twips) from PDF
    // ensuring the document layout is strictly 1 page without extra gaps or page jumps
    const highlightsCellMargins = { top: 100, bottom: 100, left: 100, right: 100 };
    const highlightsLines = data.highlights ? data.highlights.split("\n") : [""];
    const highlightParagraphs = highlightsLines.map((line, idx) =>
      new Paragraph({
        spacing: {
          before: 0,
          after: idx === highlightsLines.length - 1 ? 0 : 80,
          line: 280,
          lineRule: LineRuleType.AUTO,
        },
        children: [
          new TextRun({
            text: line,
            font: fontName,
            size: "14pt",
            color: "000000",
          }),
        ],
      })
    );

    const row3 = new TableRow({
      height: { value: 6350, rule: HeightRule.EXACT },
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.DXA },
          margins: highlightsCellMargins,
          verticalAlign: VerticalAlign.TOP,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 260, lineRule: LineRuleType.AUTO },
              children: [
                new TextRun({
                  text: "Highlights of program",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          columnSpan: 5,
          width: { size: totalContentWidth - colWidths[0], type: WidthType.DXA },
          margins: highlightsCellMargins,
          verticalAlign: VerticalAlign.TOP,
          children: highlightParagraphs,
        }),
      ],
    });

    const infoTable = new Table({
      width: { size: totalContentWidth, type: WidthType.DXA },
      borders: allBorders,
      rows: [row1, row2, row3],
    });

    // Exact 10pt gap between Highlights section and Photo Grid (matching photoGridSpacing = 10)
    const photoGridSpacingParagraph = new Paragraph({
      spacing: {
        before: 0,
        after: 0,
        line: 200, // 200 twips = exactly 10pt line height
        lineRule: LineRuleType.EXACT,
      },
      children: [
        new TextRun({
          text: "",
          font: fontName,
          size: 1,
        }),
      ],
    });

    // Photo grid: Strictly 2x2 grid (4 cells) with 180pt height each
    const photoCellWidth = Math.floor(totalContentWidth / 2); // 5313 dxa
    const photoCellMargins = { top: 100, bottom: 100, left: 100, right: 100 };

    const photoCells: TableCell[] = [];

    for (let i = 0; i < 4; i++) {
      let cellContent: Paragraph;
      if (i < images.length) {
        try {
          const dataUrl = await compressImage(images[i]);
          // In PDF: cellWidth 265.6pt - 10pt padding = 255.6pt => 340px at 96 DPI
          // cellHeight 180pt - 10pt padding = 170pt => 226px at 96 DPI
          cellContent = new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0, line: 3390, lineRule: LineRuleType.EXACT },
            children: [
              new ImageRun({
                data: dataUrl,
                transformation: { width: 340, height: 226 },
                type: "jpg",
              }),
            ],
          });
        } catch (e) {
          console.error("Failed to add image to docx", e);
          cellContent = new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [
              new TextRun({
                text: "No Image",
                font: fontName,
                size: "14pt",
                color: "000000",
              }),
            ],
          });
        }
      } else {
        cellContent = new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: "No Image",
              font: fontName,
              size: "14pt",
              color: "000000",
            }),
          ],
        });
      }

      photoCells.push(
        new TableCell({
          width: { size: photoCellWidth, type: WidthType.DXA },
          margins: photoCellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [cellContent],
        })
      );
    }

    const photoRow1 = new TableRow({
      height: { value: 3600, rule: HeightRule.EXACT }, // 180pt = 3600 dxa
      cantSplit: true,
      children: [photoCells[0], photoCells[1]],
    });

    const photoRow2 = new TableRow({
      height: { value: 3600, rule: HeightRule.EXACT },
      cantSplit: true,
      children: [photoCells[2], photoCells[3]],
    });

    const photoGridTable = new Table({
      width: { size: totalContentWidth, type: WidthType.DXA },
      borders: allBorders,
      rows: [photoRow1, photoRow2],
    });

    documentChildren = [
      titleParagraph,
      infoTable,
      photoGridSpacingParagraph,
      photoGridTable,
    ];
  } else {
    // Non-Formal template fallback (General/Other)
    const headerTitle = new Paragraph({
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: "NSS Activity Report",
          font: fontName,
          bold: true,
          size: "24pt",
          color: "000000",
        }),
      ],
    });

    const namePara = new Paragraph({
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: `Program Name: ${data.name}`,
          font: fontName,
          size: "18pt",
          color: "000000",
        }),
      ],
    });

    const catPara = new Paragraph({
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: `Category: ${data.category}`,
          font: fontName,
          size: "14pt",
          color: "000000",
        }),
      ],
    });

    const datePara = new Paragraph({
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: `Date: ${formattedDate}`,
          font: fontName,
          size: "14pt",
          color: "000000",
        }),
      ],
    });

    const locPara = new Paragraph({
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: "Location: (Not Specified)",
          font: fontName,
          size: "14pt",
          color: "000000",
        }),
      ],
    });

    const dividerLine = new Paragraph({
      border: {
        bottom: solidBlackBorder,
      },
      spacing: { before: 0, after: 240 },
    });

    documentChildren.push(headerTitle, namePara, catPara, datePara, locPara, dividerLine);

    if (images.length > 0) {
      const gridRows: TableRow[] = [];
      const halfWidth = 5313;

      for (let i = 0; i < images.length; i += 2) {
        const rowCells: TableCell[] = [];

        for (let j = 0; j < 2; j++) {
          const imgIdx = i + j;
          if (imgIdx < images.length) {
            try {
              const dataUrl = await compressImage(images[imgIdx]);
              rowCells.push(
                new TableCell({
                  width: { size: halfWidth, type: WidthType.DXA },
                  margins: { top: 100, bottom: 100, left: 100, right: 100 },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 0, after: 0 },
                      children: [
                        new ImageRun({
                          data: dataUrl,
                          transformation: { width: 330, height: 240 },
                          type: "jpg",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 80, after: 120 },
                      children: [
                        new TextRun({
                          text: "Uploaded File Snippet",
                          font: fontName,
                          size: "10pt",
                          color: "969696",
                        }),
                      ],
                    }),
                  ],
                })
              );
            } catch (e) {
              console.error("Failed to add image", e);
              rowCells.push(
                new TableCell({
                  width: { size: halfWidth, type: WidthType.DXA },
                  children: [new Paragraph({ children: [] })],
                })
              );
            }
          } else {
            rowCells.push(
              new TableCell({
                width: { size: halfWidth, type: WidthType.DXA },
                children: [new Paragraph({ children: [] })],
              })
            );
          }
        }

        gridRows.push(
          new TableRow({
            cantSplit: true,
            children: rowCells,
          })
        );
      }

      const nonFormalPhotoTable = new Table({
        width: { size: 10626, type: WidthType.DXA },
        borders: noBorders,
        rows: gridRows,
      });

      documentChildren.push(nonFormalPhotoTable);
    }

    const dividerLine2 = new Paragraph({
      border: {
        bottom: solidBlackBorder,
      },
      spacing: { before: 200, after: 200 },
    });

    const footerTable = new Table({
      width: { size: 10626, type: WidthType.DXA },
      borders: noBorders,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: 5313, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: `Total Photos: ${images.length}`,
                      font: fontName,
                      size: "12pt",
                      color: "000000",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 5313, type: WidthType.DXA },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: "Generated by NSS Docs App",
                      font: fontName,
                      size: "12pt",
                      color: "000000",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    documentChildren.push(dividerLine2, footerTable);
  }

  // Create document with global Times New Roman defaults
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: fontName,
            color: "000000",
          },
          paragraph: {
            spacing: {
              before: 0,
              after: 0,
              line: 240,
              lineRule: LineRuleType.AUTO,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width (210mm) in dxa
              height: 16838, // A4 height (297mm) in dxa
            },
            margin: {
              top: 640, // 32pt = 640 dxa
              right: 640,
              bottom: 640,
              left: 640,
            },
          },
        },
        children: documentChildren,
      },
    ],
  });

  const fileName = `NSS_Report_${data.name.replace(/ /g, "_")}.docx`;
  const docxBlob = await Packer.toBlob(doc);

  if (share && navigator.share) {
    try {
      const file = new File([docxBlob], fileName, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      await navigator.share({ title: fileName, files: [file] });
    } catch (e) {
      saveBlobAsFile(docxBlob, fileName);
    }
  } else {
    saveBlobAsFile(docxBlob, fileName);
  }
};
