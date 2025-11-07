// helper.js
import jsPDF from 'jspdf';
import { message } from 'antd';
import { formatCountsArray } from '../../utils/Methods';

export const generateStructuredPDF = async ({ userName, userRole, departments, employees, userStates }) => {
  try {
    message.loading({ content: 'Generating PDF...', key: 'pdf', duration: 0 });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Helper: move to new page if space runs out
    const checkPageEnd = (increment = 0) => {
      if (yPosition + increment > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // Header
    pdf.setFillColor(33, 150, 243);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    pdf.text('DASHBOARD REPORT', pageWidth / 2, 15, { align: 'center' });

    // Report info
    let yPosition = 30;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    pdf.text(`By: ${userName} (${userRole})`, pageWidth - 80, yPosition);

    // Teams Table
    yPosition += 10;
    pdf.setFillColor(224, 224, 224);
    pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
    pdf.setFont(undefined, 'bold');
    pdf.text('Team Name', 20, yPosition + 5);
    pdf.text('Members', 150, yPosition + 5);

    yPosition += 10;
    departments.forEach((team, index) => {
      checkPageEnd(10);
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(15, yPosition - 2, pageWidth - 30, 8, 'F');
      }
      pdf.setFont(undefined, 'normal');
      pdf.text(team.title || 'Unnamed Team', 20, yPosition + 5);

      const members = team.members?.map(m => m?.username || 'Unknown').join(', ') || 'No members';
      const splitText = pdf.splitTextToSize(members, 120);
      pdf.text(splitText, 150, yPosition + 5);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, yPosition + 8, pageWidth - 15, yPosition + 8);

      yPosition += Math.max(8, splitText.length * 5);
    });

    // Employees Table
    yPosition += 15;
    checkPageEnd(15);
    pdf.setFillColor(224, 224, 224);
    pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
    pdf.setFont(undefined, 'bold');
    pdf.text('Employee Name', 20, yPosition + 5);
    pdf.text('Email', 100, yPosition + 5);
    pdf.text('Role', 220, yPosition + 5);

    yPosition += 10;
    employees.forEach((employee, index) => {
      checkPageEnd(10);
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(15, yPosition - 2, pageWidth - 30, 8, 'F');
      }
      pdf.setFont(undefined, 'normal');
      pdf.text(employee.username || 'Unknown', 20, yPosition + 5);
      pdf.text(employee.email || 'No email', 100, yPosition + 5);
      pdf.text(employee.role || 'Unknown', 220, yPosition + 5);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, yPosition + 8, pageWidth - 15, yPosition + 8);

      yPosition += 8;
    });

    // Tasks Table
    yPosition += 15;
    checkPageEnd(15);
    pdf.setFillColor(224, 224, 224);
    pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
    pdf.setFont(undefined, 'bold');
    pdf.text('Task Status', 20, yPosition + 5);
    pdf.text('Count', 150, yPosition + 5);
    pdf.text('Percentage', 220, yPosition + 5);

    const totalTasks = formatCountsArray(userStates).reduce((sum, task) => sum + (task.count || 0), 0);

    yPosition += 10;
    formatCountsArray(userStates).forEach((task, index) => {
      checkPageEnd(10);
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(15, yPosition - 2, pageWidth - 30, 8, 'F');
      }
      pdf.setFont(undefined, 'normal');
      pdf.text(task.status, 20, yPosition + 5);
      pdf.text(task.count.toString(), 150, yPosition + 5);

      const percentage = totalTasks > 0 ? Math.round((task.count / totalTasks) * 100) : 0;
      pdf.text(`${percentage}%`, 220, yPosition + 5);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, yPosition + 8, pageWidth - 15, yPosition + 8);

      yPosition += 8;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('© 2023 Dashboard App - Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });

    pdf.save(`Dashboard_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    message.success({ content: 'PDF generated with all details!', key: 'pdf' });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    message.error({ content: 'Failed to generate PDF', key: 'pdf' });
  }
};
