import 'dart:io';
import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart'; // Added
import '../models/event.dart';
import '../models/photo.dart';

class ReportService {
  Future<String?> generateAndShareReport(Event event, List<Photo> photos) async {
    final doc = pw.Document();

    // Load images first
    List<Uint8List> imageBytes = [];
    for (var photo in photos) {
        try {
            final bytes = await File(photo.filePath).readAsBytes();
            imageBytes.add(bytes);
        } catch (e) {
            // detailed error handling or placeholder?
        }
    }

    // Use standard Times New Roman font
    final fontRegular = pw.Font.times();
    final fontBold = pw.Font.timesBold();

    if (event.category == 'Community Activity') {
      doc.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(32),
          build: (pw.Context context) {
             return _buildCommunityTemplate(event, photos, imageBytes, fontRegular, fontBold);
          },
        ),
      );
    } else {
      doc.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(32),
          build: (pw.Context context) {
             return [
                _buildHeader(event),
                pw.SizedBox(height: 20),
                _buildPhotoGrid(photos, imageBytes),
                pw.SizedBox(height: 20),
                _buildFooter(photos.length),
             ];
          },
        ),
      );
    }

    // Generate PDF bytes
    final bytes = await doc.save();
    final fileName = 'NSS_Report_${event.name.replaceAll(' ', '_')}.pdf';
    String? savedPath;

    // Attempt to download/save locally
    try {
        savedPath = await _saveToDownloads(bytes, fileName);
    } catch (e) {
        print('Error saving to downloads: $e');
    }
    
    // Also trigger share
    await Printing.sharePdf(
      bytes: bytes,
      filename: fileName,
    );
    
    return savedPath;
  }
  
  Future<String?> _saveToDownloads(Uint8List bytes, String fileName) async {
      Directory? directory;
      try {
        if (Platform.isAndroid) {
            directory = Directory('/storage/emulated/0/Download');
            // If main download folder inaccessible, try external storage
            if (!await directory.exists()) {
                 directory = await getExternalStorageDirectory();
            }
        } else {
            directory = await getApplicationDocumentsDirectory();
        }

        if (directory != null) {
            final File file = File('${directory.path}/$fileName');
            await file.writeAsBytes(bytes);
            return file.path;
        }
      } catch (e) {
          print('Failed to save file: $e');
      }
      return null;
  }

  // --- Standard Template Methods ---

  pw.Widget _buildHeader(Event event) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Header(
          level: 0,
          child: pw.Text('NSS Activity Report', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 24)),
        ),
        pw.SizedBox(height: 10),
        pw.Text('Program Name: ${event.name}', style: const pw.TextStyle(fontSize: 18)),
        pw.Text('Category: ${event.category}', style: const pw.TextStyle(fontSize: 14)),
        pw.Text('Date: ${DateFormat('dd-MM-yy').format(event.date)}', style: const pw.TextStyle(fontSize: 14)),
        pw.Text('Location: ${event.location}', style: const pw.TextStyle(fontSize: 14)),
        pw.Divider(),
      ],
    );
  }

  pw.Widget _buildPhotoGrid(List<Photo> photos, List<Uint8List> images) {
    final List<pw.Widget> gridItems = [];
    for (int i = 0; i < images.length && i < photos.length; i++) {
        gridItems.add(
            pw.Column(
              children: [
                pw.Container(
                  height: 150,
                  width: 150,
                  child: pw.Image(
                    pw.MemoryImage(images[i]),
                    fit: pw.BoxFit.cover,
                  ),
                ),
                pw.SizedBox(height: 4),
                pw.Text(
                  '${DateFormat('HH:mm').format(photos[i].timestamp)} | ${photos[i].latitude.toStringAsFixed(4)}, ${photos[i].longitude.toStringAsFixed(4)}',
                  style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey),
                ),
              ],
            )
        );
    }

    return pw.GridView(
      crossAxisCount: 2,
      childAspectRatio: 0.8,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      children: gridItems,
    );
  }

  pw.Widget _buildFooter(int count) {
    return pw.Column(
        children: [
            pw.Divider(),
            pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                    pw.Text('Total Photos: $count'),
                    pw.Text('Generated by NSS Docs App'),
                ]
            )
        ]
    );

  }

  // --- Community Template Methods ---

  pw.Widget _buildCommunityTemplate(Event event, List<Photo> photos, List<Uint8List> images, pw.Font fontRegular, pw.Font fontBold) {
    return pw.Column(
      children: [
        pw.Center(
          child: pw.Text(
            'REPORTS OF COMMUNITY ACTIVITIES',
            style: pw.TextStyle(font: fontBold, fontWeight: pw.FontWeight.bold, fontSize: 18),
          ),
        ),
        pw.SizedBox(height: 10),
        // Top tables (reduced to exclude highlights row)
        _buildCommunityInfoTables(event, fontRegular, fontBold),
        
        // Expanded Highlights Section to fill remaining space
        pw.Expanded(
            child: pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.stretch,
                children: [
                    pw.Expanded(
                        flex: 1,
                        child: pw.Container(
                            decoration: pw.BoxDecoration(border: pw.Border.all()),
                            padding: const pw.EdgeInsets.all(5),
                            child: pw.Text('Highlights of program', style: pw.TextStyle(font: fontBold, fontWeight: pw.FontWeight.bold, fontSize: 14))
                        )
                    ),
                    pw.Expanded(
                        flex: 7,
                        child: pw.Container(
                            decoration: pw.BoxDecoration(border: pw.Border(top: pw.BorderSide(), right: pw.BorderSide(), bottom: pw.BorderSide())),
                            padding: const pw.EdgeInsets.all(5),
                            child: pw.Text(
                              event.highlights, 
                              style: pw.TextStyle(font: fontRegular, fontSize: 14),
                              textAlign: pw.TextAlign.justify,
                            )
                        )
                    )
                ]
            )
        ),
        
        pw.SizedBox(height: 10),
        _buildCommunityPhotoGrid(photos, images, fontRegular, fontBold),
      ],
    );
  }

  pw.Widget _buildCommunityInfoTables(Event event, pw.Font fontRegular, pw.Font fontBold) {
      return pw.Column(
          children: [
              pw.Table(
                  border: pw.TableBorder.all(),
                  columnWidths: {
                      0: const pw.FlexColumnWidth(1),
                      1: const pw.FlexColumnWidth(2), 
                      2: const pw.FlexColumnWidth(1),
                      3: const pw.FlexColumnWidth(1),
                      4: const pw.FlexColumnWidth(2),
                      5: const pw.FlexColumnWidth(1),
                  },
                  children: [
                      pw.TableRow(
                          children: [
                              _buildTableCell('Date', fontRegular, fontBold, isHeader: true),
                              _buildTableCell(DateFormat('dd-MM-yy').format(event.date), fontRegular, fontBold),
                              _buildTableCell('Duration', fontRegular, fontBold, isHeader: true),
                              _buildTableCell('${event.duration} Hours', fontRegular, fontBold),
                              _buildTableCell('No of volunteers:', fontRegular, fontBold, isHeader: true),
                              _buildTableCell(event.volunteerCount, fontRegular, fontBold),
                          ]
                      )
                  ]
              ),
              pw.Table(
                  border: pw.TableBorder(
                      left: pw.BorderSide(), 
                      right: pw.BorderSide(), 
                      bottom: pw.BorderSide(),
                      verticalInside: pw.BorderSide(), // Added separator
                  ), 
                  columnWidths: {
                      0: const pw.FlexColumnWidth(1),
                      1: const pw.FlexColumnWidth(7),
                  },
                  children: [
                      pw.TableRow(
                          children: [
                               _buildTableCell('Program', fontRegular, fontBold, isHeader: true),
                               _buildTableCell(event.name, fontRegular, fontBold),
                          ]
                      ),
                  ]
              )
          ]
      );
  }

  pw.Widget _buildTableCell(String text, pw.Font fontRegular, pw.Font fontBold, {bool isHeader = false, double? height}) {
      return pw.Container(
          height: height,
          padding: const pw.EdgeInsets.all(5),
          alignment: pw.Alignment.topLeft,
          child: pw.Text(
              text, 
              style: pw.TextStyle(font: isHeader ? fontBold : fontRegular, fontSize: 14), // Font size updated to 14
          )
      );
  }

  pw.Widget _buildCommunityPhotoGrid(List<Photo> photos, List<Uint8List> images, pw.Font fontRegular, pw.Font fontBold) {
      // Limit to 4 images as per requirement "document should only contains the first 4 images"
      final displayImages = images.take(4).toList();
      
      // 2x2 Grid with NO labels
      return pw.Table(
          border: pw.TableBorder.all(),
          columnWidths: {
              0: const pw.FlexColumnWidth(1),
              1: const pw.FlexColumnWidth(1),
          },
          children: [
              pw.TableRow(
                  children: [
                      _buildPhotoCell(displayImages.isNotEmpty ? displayImages[0] : null),
                      _buildPhotoCell(displayImages.length > 1 ? displayImages[1] : null),
                  ]
              ),
              pw.TableRow(
                  children: [
                      _buildPhotoCell(displayImages.length > 2 ? displayImages[2] : null),
                      _buildPhotoCell(displayImages.length > 3 ? displayImages[3] : null),
                  ]
              ),
          ]
      );
  }

  pw.Widget _buildPhotoCell(Uint8List? image) {
      return pw.Container(
          height: 180, 
          padding: const pw.EdgeInsets.all(5),
          child: image != null 
                ? pw.Image(pw.MemoryImage(image), fit: pw.BoxFit.cover)
                : pw.Center(child: pw.Text('No Image'))
      );
  }
}
