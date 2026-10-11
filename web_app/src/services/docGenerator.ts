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
    // 1. Title mapping matching PDF template
    let reportTitle = "NSS ACTIVITY REPORT";
    if (data.category === "Community") {
      reportTitle = "REPORTS OF COMMUNITY ACTIVITIES";
    } else if (data.category === "Campus") {
      reportTitle = "REPORTS OF CAMPUS ACTIVITIES";
    } else if (data.category === "Orientation") {
      reportTitle = "REPORT OF ORIENTATION PROGRAM";
    }

    // Title Paragraph: 18pt bold (size: 36 half-points), centered, Times New Roman, 14pt spacing after (280 twips)
    const titleParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 0,
        after: 280,
        line: 360,
        lineRule: LineRuleType.EXACT,
      },
      children: [
        new TextRun({
          text: reportTitle,
          font: fontName,
          bold: true,
          size: 36, // Exact 18pt in half-points
          color: "000000",
        }),
      ],
    });

    // Content dimensions with 60pt left margin for document binding:
    // A4 width: 11906 dxa, left margin: 1200 dxa (60pt), right margin: 640 dxa (32pt) => contentWidth: 10066 dxa
    // Column widths replicating PDF flex 8.2 (1.2, 2.0, 1.0, 1.0, 2.0, 1.0)
    const colWidths = [1473, 2455, 1228, 1228, 2455, 1227];
    const totalContentWidth = 10066;

    // Cell padding: 5pt (100 twips) horizontal, vertical adjusted for 24pt height
    const headerCellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

    // Row 1: Date | [date] | Duration | [duration] Hours | No of volunteers: | [count]
    // Fixed 24pt height (480 twips), exactly matching PDF
    // Font: 13pt (size: 26 half-points)
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
                  size: 26, // Exact 13pt
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
                  size: 26, // Exact 13pt
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
                  size: 26, // Exact 13pt
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
                  size: 26, // Exact 13pt
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
                  size: 26, // Exact 13pt
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
                  size: 26, // Exact 13pt
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
    // Font: 13pt (size: 26 half-points)
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
                  size: 26, // Exact 13pt
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
                  size: 26, // Exact 13pt
                  color: "000000",
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // Row 3: Highlights of program
    // Large rectangular box height from PDF
    // Left label: 12pt bold (size: 24)
    // Right content: 12pt regular (size: 24) matching PDF visual size
    const highlightsCellMargins = { top: 100, bottom: 100, left: 100, right: 100 };
    const highlightsLines = data.highlights ? data.highlights.split("\n") : [""];
    const highlightParagraphs = highlightsLines.map((line, idx) =>
      new Paragraph({
        spacing: {
          before: 0,
          after: idx === highlightsLines.length - 1 ? 0 : 30,
          line: 240,
          lineRule: LineRuleType.AUTO,
        },
        children: [
          new TextRun({
            text: line,
            font: fontName,
            size: 24, // Exact 12pt (matching PDF visual size)
            color: "000000",
          }),
        ],
      })
    );

    // Fixed height of 5000 twips (250pt) guarantees the document fits strictly on ONE page
    const row3 = new TableRow({
      height: { value: 5000, rule: HeightRule.EXACT },
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.DXA },
          margins: highlightsCellMargins,
          verticalAlign: VerticalAlign.TOP,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
              children: [
                new TextRun({
                  text: "Highlights of program",
                  font: fontName,
                  bold: true,
                  size: 24, // Exact 12pt
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

    // Exact 10pt gap between Highlights section and Photo Grid (matching photoGridSpacing = 10 in PDF)
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
          size: 2, // 1pt
        }),
      ],
    });

    // Photo grid: Strictly 2x2 grid (4 cells) with 180pt height each
    const photoCellWidth = Math.floor(totalContentWidth / 2); // 5313 dxa
    const photoCellMargins = { top: 0, bottom: 0, left: 0, right: 0 };

    const photoCells: TableCell[] = [];

    for (let i = 0; i < 4; i++) {
      let cellContent: Paragraph;
      if (i < images.length) {
        try {
          const dataUrl = await compressImage(images[i]);
          // In PDF: cellWidth 251.65pt, cellHeight 180pt, padding 5pt on all 4 sides
          // Width: 322px = 241.5pt (4830 twips) => gap = (5033 - 4830)/2 = 101.5 twips = 5.08pt
          // Height: 226px = 169.5pt (3390 twips) => gap = (3600 - 3390)/2 = 105 twips = 5.25pt
          // run: { size: 2 } (1pt) removes font descent, and verticalAlign CENTER produces exact 5pt gap on all 4 sides
          cellContent = new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [
              new ImageRun({
                data: dataUrl,
                transformation: { width: 322, height: 226 },
                type: "jpg",
                run: { size: 2 }, // 1pt font: eliminates font descent below image
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
                size: 24, // 12pt
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
              size: 24, // 12pt
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

    // Explicit 1pt trailing paragraph prevents Microsoft Word from inserting its default 24pt trailing paragraph that causes page 2 overflow
    const trailingParagraph = new Paragraph({
      spacing: {
        before: 0,
        after: 0,
        line: 20, // 1pt exact line height (20 twips)
        lineRule: LineRuleType.EXACT,
      },
      children: [
        new TextRun({
          text: "",
          font: fontName,
          size: 2, // 1pt
        }),
      ],
    });

    documentChildren = [
      titleParagraph,
      infoTable,
      photoGridSpacingParagraph,
      photoGridTable,
      trailingParagraph,
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
          size: 48, // Exact 24pt
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
          size: 36, // Exact 18pt
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
          size: 28, // Exact 14pt
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
          size: 28, // Exact 14pt
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
          size: 28, // Exact 14pt
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
      const halfWidth = 5033;

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
                          transformation: { width: 322, height: 240 },
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
                          size: 20, // Exact 10pt
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
        width: { size: 10066, type: WidthType.DXA },
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
      width: { size: 10066, type: WidthType.DXA },
      borders: noBorders,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: 5033, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: `Total Photos: ${images.length}`,
                      font: fontName,
                      size: 24, // Exact 12pt
                      color: "000000",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 5033, type: WidthType.DXA },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: "Generated by NSS Docs App",
                      font: fontName,
                      size: 24, // Exact 12pt
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
              width: 11906, // A4 width (210mm) in twips
              height: 16838, // A4 height (297mm) in twips
            },
            margin: {
              top: 640, // 32pt in twips
              right: 640, // 32pt in twips
              bottom: 640, // 32pt in twips
              left: 1200, // 60pt in twips (60pt binding margin)
              header: 0, // Ensure header does not encroach on printable area
              footer: 0, // Ensure footer does not encroach on printable area
              gutter: 0,
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
