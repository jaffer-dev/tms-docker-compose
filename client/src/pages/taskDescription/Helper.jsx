import axios from "axios";
import { message } from "antd";
import jsPDF from "jspdf";


export const fileBlog = (file, download = false) => {
    if (!file) return;

    try {
        // Base64 to Uint8Array conversion
        const byteCharacters = atob(file.fileData);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        // Create Blob
        const blob = new Blob([byteArray], { type: file.fileType || "application/octet-stream" });
        const fileURL = URL.createObjectURL(blob);

        if (download) {
            // Download file
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = file.name || "download";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Open file in new tab
            window.open(fileURL, "_blank", "noopener,noreferrer");
        }
    } catch (error) {
        console.error("Error opening/downloading file:", error);
    }
};

// Handle Upload
export const handleUpload = (info, setUploadedFiles) => {
    const files = [...info.fileList].map((file) => file.originFileObj || file);
    setUploadedFiles(files);
    message.success(`${files.length} file(s) uploaded`);
};

// Handle Remove File
export const handleRemoveFile = (index, uploadedFiles, setUploadedFiles) => {
    const updated = [...uploadedFiles];
    updated.splice(index, 1);
    setUploadedFiles(updated);
};

// Format Date
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

// Generate PDF
export const generateTaskPDF = (taskDetails, userName, userRole) => {
    try {
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        pdf.setFillColor(33, 150, 243);
        pdf.rect(0, 0, 210, 20, "F");
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text("TASK DETAILS REPORT", 105, 15, { align: "center" });

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 30);
        pdf.text(`By: ${userName} (${userRole})`, 15, 35);

        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Task Title: ${taskDetails?.taskTitle || "N/A"}`, 15, 50);

        pdf.setFontSize(12);
        const descriptionLines = pdf.splitTextToSize(
            taskDetails?.description?.replace(/<[^>]*>/g, "") || "No description provided",
            180
        );
        pdf.text("Description:", 15, 65);
        pdf.text(descriptionLines, 20, 75);

        const detailsY = 75 + descriptionLines.length * 5 + 10;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(15, detailsY, 180, 30, "F");
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(15, detailsY, 180, 30);

        pdf.setFont(undefined, "bold");
        pdf.text("Status", 20, detailsY + 10);
        pdf.text("Priority", 20, detailsY + 20);
        pdf.text("Assigned To", 100, detailsY + 10);
        pdf.text("Deadline", 100, detailsY + 20);

        pdf.setFont(undefined, "normal");
        pdf.text(taskDetails?.status || "N/A", 50, detailsY + 10);
        pdf.text(taskDetails?.priority || "N/A", 50, detailsY + 20);

        const assignedTo = taskDetails?.actions?.find((a) => a.assignedTo)?.assignedTo?.username || "Unassigned";
        pdf.text(assignedTo, 130, detailsY + 10);

        const deadline = taskDetails?.deadline
            ? new Date(taskDetails.deadline).toLocaleDateString()
            : "No deadline";
        pdf.text(deadline, 130, detailsY + 20);

        const historyY = detailsY + 40;
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(14);
        pdf.text("Task History", 15, historyY);

        if (taskDetails?.actions?.length > 0) {
            const sortedActions = [...taskDetails.actions].sort((a, b) => new Date(a.date) - new Date(b.date));
            const creationAction = sortedActions.find((a) => a.action.includes("Task Created"));
            const assignmentActions = sortedActions.filter((a) => "assignedTo" in a);

            let yPos = historyY + 15;
            const leftMargin = 25;
            const dotRadius = 2;
            const lineWidth = 0.5;
            const dateLeftMargin = 150;

            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(lineWidth);
            pdf.line(leftMargin - dotRadius - 2, yPos - 5, leftMargin - dotRadius - 2, yPos + 100);

            if (creationAction) {
                pdf.setFillColor(82, 196, 26);
                pdf.circle(leftMargin - dotRadius - 2, yPos + 3, dotRadius, "F");
                pdf.setFontSize(10);
                pdf.setTextColor(0, 0, 0);
                pdf.text("Task Created", leftMargin + 5, yPos + 5);

                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.text(formatDate(creationAction.date), dateLeftMargin, yPos + 5);
                pdf.text(`Created by ${creationAction.user?.username || "Unknown"}`, leftMargin + 5, yPos + 10);
                yPos += 15;
            }

            assignmentActions.forEach((action, index) => {
                const isUnassignment = action.assignedTo === null;
                pdf.setFillColor(isUnassignment ? 245 : 34);
                pdf.circle(leftMargin - dotRadius - 2, yPos + 3, dotRadius, "F");
                pdf.setFontSize(10);
                pdf.setTextColor(0, 0, 0);

                let actionText = isUnassignment
                    ? "Unassigned"
                    : index === 0
                        ? `Assigned to ${action.assignedTo?.username || "Unknown"}`
                        : `Reassigned to ${action.assignedTo?.username || "Unknown"}`;
                pdf.text(actionText, leftMargin + 5, yPos + 5);

                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.text(formatDate(action.date), dateLeftMargin, yPos + 5);
                pdf.text(`By ${action.user?.username || "Unknown"}`, leftMargin + 5, yPos + 10);

                if (action.files?.length > 0) {
                    pdf.setFontSize(7);
                    pdf.setTextColor(80, 80, 80);
                    const filesText = `Files: ${action.files.map((f) => f.name || "File").join(", ")}`;
                    const filesLines = pdf.splitTextToSize(filesText, 150);
                    pdf.text(filesLines, leftMargin + 5, yPos + 15);
                    yPos += filesLines.length * 4;
                }
                yPos += 15;
            });
        } else {
            pdf.setFont(undefined, "normal");
            pdf.text("No history available", 20, historyY + 15);
        }

        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text("© 2023 Task Management System - Confidential", 105, 290, { align: "center" });

        pdf.save(`Task_Report_${taskDetails?.taskTitle || ""}_${new Date().toISOString().slice(0, 10)}.pdf`);
        message.success("Task report exported successfully!");
    } catch (error) {
        console.error("PDF generation error:", error);
        message.error("Failed to export task report");
    }
};
