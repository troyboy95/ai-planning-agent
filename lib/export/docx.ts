import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { Report, ProblemBreakdown, Stakeholder, SolutionApproach, ActionPlanItem } from '@/types/report';

export async function generateDocx(report: Report): Promise<Buffer> {
  const docTitle = report.problemStatement.length > 60
    ? report.problemStatement.substring(0, 57) + '...'
    : report.problemStatement;

  const sections = [];

  // Title Page
  sections.push({
    properties: {},
    children: [
      new Paragraph({
        text: docTitle,
        heading: HeadingLevel.TITLE,
        spacing: { after: 400, before: 400 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Generated: ${new Date(report.createdAt).toLocaleDateString()}`, size: 24 }),
        ],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Powered by AI Planning Agent", italics: true, size: 24, color: "666666" })
        ],
        spacing: { after: 1000 }
      }),
      // Simple Table of Contents manually built
      new Paragraph({ text: "Table of Contents", heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
      ...report.sections.map(s =>
        new Paragraph({ text: `• ${s.title}`, spacing: { after: 100 } })
      )
    ]
  });

  // Body Sections
  for (const s of report.sections) {
    const children: any[] = [
      new Paragraph({
        text: s.title,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        spacing: { after: 400 }
      })
    ];

    if (s.id === 'problem-breakdown') {
      const data = s.content as ProblemBreakdown;
      children.push(new Paragraph({ text: data.summary, spacing: { after: 200 } }));

      children.push(new Paragraph({ text: "Components", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
      data.components.forEach(c => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${c.title}: `, bold: true }),
            new TextRun({ text: c.description })
          ],
          spacing: { after: 100 }
        }));
      });

      children.push(new Paragraph({ text: "Constraints", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
      data.constraints.forEach(c => {
        children.push(new Paragraph({ text: `• ${c}`, spacing: { after: 100 } }));
      });
    }

    else if (s.id === 'stakeholders') {
      const data = s.content as Stakeholder[];
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Role", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Concern", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Influence", bold: true })] })] })
          ]
        }),
        ...data.map(st => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(st.name)] }),
            new TableCell({ children: [new Paragraph(st.role)] }),
            new TableCell({ children: [new Paragraph(st.concern)] }),
            new TableCell({ children: [new Paragraph(st.influence)] })
          ]
        }))
      ];
      children.push(new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }));
    }

    else if (s.id === 'solution-approach') {
      const data = s.content as SolutionApproach;
      children.push(new Paragraph({ text: data.overview, spacing: { after: 200 } }));

      children.push(new Paragraph({ text: "Strategies", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
      data.strategies.forEach((st, idx) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${idx + 1}. ${st.title}`, bold: true })
          ],
          spacing: { after: 100 }
        }));
        children.push(new Paragraph({ text: st.description, spacing: { after: 100 } }));
        children.push(new Paragraph({ children: [new TextRun({ text: `Rationale: ${st.rationale}`, italics: true })], spacing: { after: 200 } }));
      });

      children.push(new Paragraph({ text: "Tradeoffs", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
      data.tradeoffs.forEach(t => {
        children.push(new Paragraph({ text: `• ${t}`, spacing: { after: 100 } }));
      });
    }

    else if (s.id === 'action-plan') {
      const data = s.content as ActionPlanItem[];
      data.forEach(phase => {
        children.push(new Paragraph({ text: phase.phase, heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
        children.push(new Paragraph({ children: [new TextRun({ text: `Timeline: ${phase.timeline} | Owner: ${phase.owner}`, italics: true })], spacing: { after: 100 } }));
        children.push(new Paragraph({ text: `Success Metric: ${phase.successMetric}`, spacing: { after: 200 } }));

        phase.actions.forEach(a => {
          children.push(new Paragraph({ text: `• ${a}`, spacing: { after: 100 } }));
        });
      });
    }

    sections.push({
      properties: {},
      children
    });
  }

  const doc = new Document({
    sections,
    features: {
      updateFields: true,
    }
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
