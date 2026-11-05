import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";

export interface ReportExportMetadata {
  patientId?: string;
  patientName?: string;
  accessionNumber?: string;
  examDate?: string;
  radiologistName?: string;
  institutionName?: string;
}

/**
 * Creates and downloads a formatted Microsoft Word (.docx) document
 * from the radiology report text.
 */
export async function downloadReportAsDocx(
  reportText: string,
  metadata: ReportExportMetadata = {}
): Promise<void> {
  const institution = metadata.institutionName || "DEPARTMENT OF RADIOLOGY & IMAGING SERVICES";
  const patientName = metadata.patientName || "DOE, JANE";
  const patientId = metadata.patientId || "MRN-8492041";
  const accession = metadata.accessionNumber || "ACC-2026-99318";
  const examDate = metadata.examDate || new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const radiologist = metadata.radiologistName || "Staff Radiologist, MD, DABR";

  const paragraphs: Paragraph[] = [];

  // Institution Header
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: institution,
          bold: true,
          size: 26, // 13pt
          color: "0A1930",
          font: "Arial",
        }),
      ],
    })
  );

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      border: {
        bottom: {
          color: "0A1930",
          space: 4,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: [
        new TextRun({
          text: "CLINICAL RADIOLOGY REPORT  |  RADSCRIBE AI VERIFIED",
          bold: true,
          size: 18,
          color: "4B5563",
          font: "Arial",
        }),
      ],
    })
  );

  // Patient & Exam Demographics Block
  paragraphs.push(
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({ text: "Patient Name: ", bold: true, size: 20 }),
        new TextRun({ text: `${patientName}    `, size: 20 }),
        new TextRun({ text: "MRN: ", bold: true, size: 20 }),
        new TextRun({ text: `${patientId}    `, size: 20 }),
        new TextRun({ text: "Accession: ", bold: true, size: 20 }),
        new TextRun({ text: `${accession}    `, size: 20 }),
        new TextRun({ text: "Date: ", bold: true, size: 20 }),
        new TextRun({ text: examDate, size: 20 }),
      ],
    })
  );

  // Body content: parse lines and format standard section titles
  const lines = reportText.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 80 } }));
      continue;
    }

    // Check for Section Titles (EXAMINATION, CLINICAL INDICATION, TECHNIQUE, FINDINGS, IMPRESSION, etc.)
    const sectionMatch = trimmed.match(/^([A-Z\s/-]+):(.*)$/);
    if (sectionMatch && sectionMatch[1].length < 35) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: sectionMatch[1] + ":",
              bold: true,
              size: 22,
              color: "0A1930",
              font: "Arial",
            }),
            new TextRun({
              text: sectionMatch[2] ? " " + sectionMatch[2] : "",
              size: 20,
              font: "Arial",
            }),
          ],
        })
      );
    } else if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.") || trimmed.startsWith("4.") || trimmed.startsWith("5.")) {
      // Numbered Impression line
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 21,
              font: "Arial",
            }),
          ],
        })
      );
    } else if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) {
      // Bullet item
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: 360 },
          children: [
            new TextRun({
              text: "• " + trimmed.replace(/^[-•*]\s*/, ""),
              size: 20,
              font: "Arial",
            }),
          ],
        })
      );
    } else {
      // Regular paragraph
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: trimmed,
              size: 20,
              font: "Arial",
            }),
          ],
        })
      );
    }
  }

  // Radiologist Electronic Attestation & Signature
  paragraphs.push(
    new Paragraph({
      spacing: { before: 360, after: 80 },
      border: {
        top: {
          color: "D1D5DB",
          space: 4,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: "Electronically Signed by: ",
          bold: true,
          size: 19,
          font: "Arial",
        }),
        new TextRun({
          text: `${radiologist}  |  RadScribe AI Verified  |  ${new Date().toISOString()}`,
          size: 19,
          color: "4B5563",
          font: "Arial",
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = `RadReport_${accession}_${new Date().toISOString().slice(0, 10)}.docx`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
