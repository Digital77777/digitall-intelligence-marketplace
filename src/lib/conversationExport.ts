import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const exportToMarkdown = (title: string, messages: Message[]) => {
  let markdown = `# ${title}\n\n`;
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

  messages.forEach((msg, idx) => {
    const role = msg.role === 'user' ? '👤 **You**' : '🤖 **AI Tutor**';
    markdown += `## ${role}\n\n`;
    markdown += `${msg.content}\n\n`;
    if (idx < messages.length - 1) {
      markdown += `---\n\n`;
    }
  });

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  saveAs(blob, fileName);
};

export const exportToPDF = (title: string, messages: Message[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  let y = margin;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  y += 10;

  // Export date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Exported on ${new Date().toLocaleString()}`, margin, y);
  y += 10;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Messages
  messages.forEach((msg, idx) => {
    // Check if we need a new page
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }

    // Role header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    if (msg.role === 'user') {
      doc.setTextColor(0, 100, 200);
      doc.text('You:', margin, y);
    } else {
      doc.setTextColor(100, 50, 150);
      doc.text('AI Tutor:', margin, y);
    }
    y += 8;

    // Message content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Clean up markdown formatting for PDF
    let cleanContent = msg.content
      .replace(/```[\s\S]*?```/g, '[Code Block]')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const lines = doc.splitTextToSize(cleanContent, maxWidth);
    
    lines.forEach((line: string) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 6;
    });

    // Add spacing between messages
    y += 5;

    // Separator line between messages (except for the last one)
    if (idx < messages.length - 1) {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    }
  });

  const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(fileName);
};
