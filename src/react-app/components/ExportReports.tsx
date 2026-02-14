import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Activity } from "@/shared/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportReportsProps {
  activities: Activity[];
  selectedDate: string;
  totalMinutes: number;
}

export default function ExportReports({ activities, selectedDate, totalMinutes }: ExportReportsProps) {
  const exportToCSV = () => {
    if (activities.length === 0) {
      alert("No data to export");
      return;
    }

    // Create CSV content
    const headers = ["Date", "Activity Name", "Category", "Duration (min)", "Duration (hours)", "Created At"];
    const rows = activities.map((activity) => [
      activity.activity_date,
      activity.name,
      activity.category,
      activity.duration.toString(),
      (activity.duration / 60).toFixed(2),
      new Date(activity.created_at).toLocaleString(),
    ]);

    // Add summary row
    rows.push([]);
    rows.push(["Total", "", "", totalMinutes.toString(), (totalMinutes / 60).toFixed(2), ""]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `time-tracker-${selectedDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (activities.length === 0) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Time Tracker Report", 14, 22);

    // Date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(selectedDate).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })}`, 14, 32);

    // Summary
    doc.setFontSize(14);
    doc.text("Summary", 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Activities: ${activities.length}`, 14, 52);
    doc.text(`Total Time: ${totalMinutes} minutes (${(totalMinutes / 60).toFixed(1)} hours)`, 14, 58);

    // Category breakdown
    const categoryData = activities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = 0;
      }
      acc[activity.category] += activity.duration;
      return acc;
    }, {} as Record<string, number>);

    let yPos = 68;
    doc.text("Time by Category:", 14, yPos);
    yPos += 6;
    Object.entries(categoryData).forEach(([category, minutes]) => {
      doc.text(`  • ${category}: ${minutes} min (${(minutes / 60).toFixed(1)}h)`, 14, yPos);
      yPos += 5;
    });

    // Activities table
    const tableData = activities.map((activity) => [
      activity.name,
      activity.category,
      `${activity.duration} min`,
      `${(activity.duration / 60).toFixed(1)}h`,
      new Date(activity.created_at).toLocaleTimeString(),
    ]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Activity", "Category", "Duration", "Hours", "Time"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });

    // Save PDF
    doc.save(`time-tracker-${selectedDate}.pdf`);
  };

  return (
    <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 backdrop-blur-xl">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg shadow-lg">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Reports</h3>
          <p className="text-gray-700 font-medium mb-4">
            Download your activity data as CSV or PDF for record keeping and analysis
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportToCSV}
          disabled={activities.length === 0}
          className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 transition-all duration-300 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export as CSV
        </button>

        <button
          onClick={exportToPDF}
          disabled={activities.length === 0}
          className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 transition-all duration-300 disabled:cursor-not-allowed"
        >
          <FileText className="w-5 h-5" />
          Export as PDF
        </button>
      </div>
    </div>
  );
}
