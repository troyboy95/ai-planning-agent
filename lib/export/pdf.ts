import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Report, ProblemBreakdown, Stakeholder, SolutionApproach, ActionPlanItem } from '@/types/report';

export async function generatePdf(report: Report): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  });

  const primaryColor: [number, number, number] = [30, 30, 63]; // #1E1E3F

  // Header band on first page
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 8.5, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  const docTitle = report.problemStatement.length > 50
    ? report.problemStatement.substring(0, 47) + '...'
    : report.problemStatement;
  doc.text(docTitle, 0.5, 0.6);

  let y = 1.5;
  doc.setTextColor(0, 0, 0);

  // Table of Contents
  doc.setFontSize(18);
  doc.text("Table of Contents", 0.5, y);
  y += 0.3;
  doc.setFontSize(12);
  report.sections.forEach(s => {
    doc.text(`• ${s.title}`, 0.7, y);
    y += 0.2;
  });

  doc.addPage();
  y = 0.8;

  const checkPageBreak = (needed: number) => {
    if (y + needed > 10.5) {
      doc.addPage();
      y = 0.8;
    }
  };

  const addDividerAndTitle = (title: string) => {
    checkPageBreak(0.5);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.02);
    doc.line(0.5, y, 8.0, y);
    y += 0.3;
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.text(title, 0.5, y);
    y += 0.3;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
  };

  for (const s of report.sections) {
    addDividerAndTitle(s.title);

    if (s.id === 'problem-breakdown') {
      const data = s.content as ProblemBreakdown;

      const lines = doc.splitTextToSize(data.summary, 7.5);
      checkPageBreak(lines.length * 0.2);
      doc.text(lines, 0.5, y);
      y += lines.length * 0.2 + 0.2;

      checkPageBreak(0.3);
      doc.setFontSize(14);
      doc.text("Components", 0.5, y);
      y += 0.2;
      doc.setFontSize(12);

      data.components.forEach(c => {
        const tLines = doc.splitTextToSize(`${c.title}: ${c.description}`, 7.3);
        checkPageBreak(tLines.length * 0.2);
        doc.text(tLines, 0.6, y);
        y += tLines.length * 0.2 + 0.1;
      });

      y += 0.1;
      checkPageBreak(0.3);
      doc.setFontSize(14);
      doc.text("Constraints", 0.5, y);
      y += 0.2;
      doc.setFontSize(12);
      data.constraints.forEach(c => {
        const cLines = doc.splitTextToSize(`• ${c}`, 7.3);
        checkPageBreak(cLines.length * 0.2);
        doc.text(cLines, 0.6, y);
        y += cLines.length * 0.2 + 0.05;
      });
    }

    else if (s.id === 'stakeholders') {
      const data = s.content as Stakeholder[];
      autoTable(doc, {
        startY: y,
        head: [['Name', 'Role', 'Concern', 'Influence']],
        body: data.map(st => [st.name, st.role, st.concern, st.influence]),
        headStyles: { fillColor: primaryColor },
        margin: { left: 0.5, right: 0.5 }
      });
      y = (doc as any).lastAutoTable.finalY + 0.3;
    }

    else if (s.id === 'solution-approach') {
      const data = s.content as SolutionApproach;
      const lines = doc.splitTextToSize(data.overview, 7.5);
      checkPageBreak(lines.length * 0.2);
      doc.text(lines, 0.5, y);
      y += lines.length * 0.2 + 0.2;

      checkPageBreak(0.3);
      doc.setFontSize(14);
      doc.text("Strategies", 0.5, y);
      y += 0.2;
      doc.setFontSize(12);

      data.strategies.forEach((st, idx) => {
        checkPageBreak(0.6);
        doc.setFont("", 'bold');
        doc.text(`${idx + 1}. ${st.title}`, 0.6, y);
        y += 0.2;
        doc.setFont("", 'normal');
        const dLines = doc.splitTextToSize(st.description, 7.3);
        doc.text(dLines, 0.7, y);
        y += dLines.length * 0.2 + 0.05;

        doc.setFont("", 'italic');
        const rLines = doc.splitTextToSize(`Rationale: ${st.rationale}`, 7.3);
        doc.text(rLines, 0.7, y);
        y += rLines.length * 0.2 + 0.2;
        doc.setFont("", 'normal');
      });

      checkPageBreak(0.3);
      doc.setFontSize(14);
      doc.text("Tradeoffs", 0.5, y);
      y += 0.2;
      doc.setFontSize(12);
      data.tradeoffs.forEach(t => {
        const tLines = doc.splitTextToSize(`• ${t}`, 7.3);
        checkPageBreak(tLines.length * 0.2);
        doc.text(tLines, 0.6, y);
        y += tLines.length * 0.2 + 0.05;
      });
    }

    else if (s.id === 'action-plan') {
      const data = s.content as ActionPlanItem[];
      data.forEach(phase => {
        checkPageBreak(0.6);
        doc.setFontSize(14);
        doc.text(phase.phase, 0.5, y);
        y += 0.2;
        doc.setFontSize(10);
        doc.setFont("", 'italic');
        doc.text(`Timeline: ${phase.timeline} | Owner: ${phase.owner} | Metric: ${phase.successMetric}`, 0.6, y);
        y += 0.15;
        doc.setFontSize(12);
        doc.setFont("", 'normal');

        phase.actions.forEach(a => {
          const aLines = doc.splitTextToSize(`• ${a}`, 7.3);
          checkPageBreak(aLines.length * 0.2);
          doc.text(aLines, 0.6, y);
          y += aLines.length * 0.2 + 0.05;
        });
        y += 0.2;
      });
    }

    y += 0.4;
  }

  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, 4.25, 10.5, { align: 'center' });
  }

  // To send Buffer in Node.js
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
