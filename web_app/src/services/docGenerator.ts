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

  // Standard 1pt solid black border
  const solidBlackBorder: IBorderOptions = {
    style: BorderStyle.SINGLE,
    size: 8, // 1pt = 8 eighths of a point
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
    // Determine report title matching PDF template
    let reportTitle = "NSS ACTIVITY REPORT";
    if (data.category === "Community") {
      reportTitle = "REPORTS OF COMMUNITY ACTIVITIES";
    } else if (data.category === "Campus") {
      reportTitle = "REPORTS OF CAMPUS ACTIVITIES";
    } else if (data.category === "Orientation") {
      reportTitle = "REPORT OF ORIENTATION PROGRAM";
    }

    // Title Paragraph (18pt, bold, centered)
    const titleParagraph = new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: reportTitle,
          font: fontName,
          bold: true,
          size: "18pt",
        }),
      ],
      spacing: { before: 0, after: 280 }, // Spacing after title (~14pt)
    });

    // Content width: 10626 dxa (A4 width 11906 - 2 * 640 margin)
    // Row 1 Column widths: total 8.2 flex
    const colWidths = [1555, 2592, 1296, 1296, 2592, 1295];
    const totalContentWidth = 10626;

    const cellMargins = { top: 120, bottom: 120, left: 140, right: 140 };

    // Row 1: Date, Duration, Volunteers
    const row1 = new TableRow({
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Date",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[1], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formattedDate,
                  font: fontName,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[2], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Duration",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[3], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.duration} Hours`,
                  font: fontName,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[4], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "No of volunteers:",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: colWidths[5], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: data.volunteerCount,
                  font: fontName,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // Row 2: Program
    const row2 = new TableRow({
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Program",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          columnSpan: 5,
          width: { size: totalContentWidth - colWidths[0], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: data.name,
                  font: fontName,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // Row 3: Highlights of program
    const highlightsLines = data.highlights ? data.highlights.split("\n") : [""];
    const highlightParagraphs = highlightsLines.map((line, idx) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: fontName,
            size: "14pt",
          }),
        ],
        spacing: {
          before: idx === 0 ? 0 : 60,
          after: idx === highlightsLines.length - 1 ? 0 : 60,
        },
      })
    );

    const row3 = new TableRow({
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.DXA },
          margins: cellMargins,
          verticalAlign: VerticalAlign.TOP,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Highlights of program",
                  font: fontName,
                  bold: true,
                  size: "13pt",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          columnSpan: 5,
          width: { size: totalContentWidth - colWidths[0], type: WidthType.DXA },
          margins: cellMargins,
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

    // Spacer paragraph between table and photo grid (10pt = 200 dxa)
    const spacerParagraph = new Paragraph({
      spacing: { before: 160, after: 160 },
      children: [],
    });

    // Photo grid: Strictly 2x2 grid (4 cells) with 180pt height each
    const photoCellWidth = Math.floor(totalContentWidth / 2); // 5313 dxa
    const photoCellMargins = { top: 80, bottom: 80, left: 80, right: 80 };

    const photoCells: TableCell[] = [];

    for (let i = 0; i < 4; i++) {
      let cellContent: Paragraph;
      if (i < images.length) {
        try {
          const dataUrl = await compressImage(images[i]);
          cellContent = new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: dataUrl,
                transformation: { width: 335, height: 225 },
                type: "jpg",
              }),
            ],
          });
        } catch (e) {
          console.error("Failed to add image to docx", e);
          cellContent = new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "No Image",
                font: fontName,
                size: "14pt",
                color: "666666",
              }),
            ],
          });
        }
      } else {
        cellContent = new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "No Image",
              font: fontName,
              size: "14pt",
              color: "666666",
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
      height: { value: 3600, rule: HeightRule.ATLEAST }, // 180pt = 3600 dxa
      children: [photoCells[0], photoCells[1]],
    });

    const photoRow2 = new TableRow({
      height: { value: 3600, rule: HeightRule.ATLEAST },
      children: [photoCells[2], photoCells[3]],
    });

    const photoGridTable = new Table({
      width: { size: totalContentWidth, type: WidthType.DXA },
      borders: allBorders,
      rows: [photoRow1, photoRow2],
    });

    documentChildren = [titleParagraph, infoTable, spacerParagraph, photoGridTable];
  } else {
    // Non-Formal template fallback (General/Other)
    const headerTitle = new Paragraph({
      children: [
        new TextRun({
          text: "NSS Activity Report",
          font: fontName,
          bold: true,
          size: "24pt",
        }),
      ],
      spacing: { after: 160 },
    });

    const namePara = new Paragraph({
      children: [
        new TextRun({
          text: `Program Name: ${data.name}`,
          font: fontName,
          size: "18pt",
        }),
      ],
      spacing: { after: 120 },
    });

    const catPara = new Paragraph({
      children: [
        new TextRun({
          text: `Category: ${data.category}`,
          font: fontName,
          size: "14pt",
        }),
      ],
      spacing: { after: 120 },
    });

    const datePara = new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${formattedDate}`,
          font: fontName,
          size: "14pt",
        }),
      ],
      spacing: { after: 120 },
    });

    const locPara = new Paragraph({
      children: [
        new TextRun({
          text: "Location: (Not Specified)",
          font: fontName,
          size: "14pt",
        }),
      ],
      spacing: { after: 160 },
    });

    const dividerLine = new Paragraph({
      border: {
        bottom: solidBlackBorder,
      },
      spacing: { after: 240 },
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
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new ImageRun({
                          data: dataUrl,
                          transformation: { width: 320, height: 240 },
                          type: "jpg",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Uploaded File Snippet",
                          font: fontName,
                          size: "10pt",
                          color: "969696",
                        }),
                      ],
                      spacing: { before: 80, after: 120 },
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
            // Empty placeholder cell for odd number of images
            rowCells.push(
              new TableCell({
                width: { size: halfWidth, type: WidthType.DXA },
                children: [new Paragraph({ children: [] })],
              })
            );
          }
        }

        gridRows.push(new TableRow({ children: rowCells }));
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
          children: [
            new TableCell({
              width: { size: 5313, type: WidthType.DXA },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Total Photos: ${images.length}`,
                      font: fontName,
                      size: "12pt",
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
                  children: [
                    new TextRun({
                      text: "Generated by NSS Docs App",
                      font: fontName,
                      size: "12pt",
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

  // Create the docx Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width in dxa (twips)
              height: 16838, // A4 height in dxa
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
      // User cancelled or share failed, fallback to save
      saveBlobAsFile(docxBlob, fileName);
    }
  } else {
    saveBlobAsFile(docxBlob, fileName);
  }
};
