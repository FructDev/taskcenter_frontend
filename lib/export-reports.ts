import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportDashboardType } from "@/types";

// jspdf-autotable augments jsPDF with lastAutoTable at runtime.
// Declare the shape here so TypeScript is happy without extra casts.
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

function getDateSuffix(): string {
  return new Date().toISOString().slice(0, 10);
}

function msToHours(ms: number): string {
  return (ms / 1000 / 60 / 60).toFixed(2);
}

// ---------------------------------------------------------------------------
// Excel export
// ---------------------------------------------------------------------------
export function exportToExcel(
  data: ReportDashboardType,
  filename?: string
): void {
  const wb = XLSX.utils.book_new();

  // Sheet: KPIs
  const kpiRows = [
    ["Métrica", "Valor"],
    ["Tareas Activas", data.kpis.activeTasks],
    ["Tareas Vencidas", data.kpis.overdueTasks],
    ["Creadas este Mes", data.kpis.createdThisMonth],
    ["Completadas este Mes", data.kpis.completedThisMonth],
    [
      "Tiempo Promedio de Resolución (horas)",
      msToHours(data.kpis.avgResolutionMilliseconds),
    ],
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(kpiRows),
    "KPIs"
  );

  // Sheet: Por Estado
  const statusSheet = XLSX.utils.json_to_sheet(
    data.tasksByStatus.map((r) => ({ Estado: r.status, Cantidad: r.count }))
  );
  XLSX.utils.book_append_sheet(wb, statusSheet, "Por Estado");

  // Sheet: Por Criticidad
  const critSheet = XLSX.utils.json_to_sheet(
    data.tasksByCriticality.map((r) => ({
      Criticidad: r.criticality,
      Cantidad: r.count,
    }))
  );
  XLSX.utils.book_append_sheet(wb, critSheet, "Por Criticidad");

  // Sheet: Por Tipo
  const typeSheet = XLSX.utils.json_to_sheet(
    data.tasksByType.map((r) => ({
      "Tipo de Tarea": r.taskType,
      Cantidad: r.count,
    }))
  );
  XLSX.utils.book_append_sheet(wb, typeSheet, "Por Tipo");

  // Sheet: Top Técnicos
  const techSheet = XLSX.utils.json_to_sheet(
    data.topTechnicians.map((r) => ({
      ID: r.userId,
      Técnico: r.userName,
      "Tareas Completadas": r.count,
    }))
  );
  XLSX.utils.book_append_sheet(wb, techSheet, "Top Técnicos");

  // Sheet: Equipos con Fallas
  const equipSheet = XLSX.utils.json_to_sheet(
    data.topFailingEquipment.map((r) => ({
      ID: r.equipmentId,
      Equipo: r.equipmentName,
      Fallas: r.count,
    }))
  );
  XLSX.utils.book_append_sheet(wb, equipSheet, "Equipos con Fallas");

  // Sheet: Tendencia
  const trendSheet = XLSX.utils.json_to_sheet(
    data.tasksTrend.map((r) => ({
      Año: r.month.year,
      Mes: r.month.month,
      Creadas: r.created,
      Completadas: r.completed,
    }))
  );
  XLSX.utils.book_append_sheet(wb, trendSheet, "Tendencia");

  const name = filename ?? `reporte-tareas-${getDateSuffix()}.xlsx`;
  XLSX.writeFile(wb, name);
}

// ---------------------------------------------------------------------------
// PDF export
// ---------------------------------------------------------------------------
export function exportToPdf(
  data: ReportDashboardType,
  filename?: string
): void {
  const doc = new jsPDF({ orientation: "landscape", format: "a4" });
  const date = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Gestión de Tareas", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado el ${date}`, 14, 28);

  let y = 36;

  // KPIs section
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Indicadores Clave (KPIs)", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Valor"]],
    body: [
      ["Tareas Activas", String(data.kpis.activeTasks)],
      ["Tareas Vencidas", String(data.kpis.overdueTasks)],
      ["Creadas este Mes", String(data.kpis.createdThisMonth)],
      ["Completadas este Mes", String(data.kpis.completedThisMonth)],
      [
        "Tiempo Promedio de Resolución (horas)",
        msToHours(data.kpis.avgResolutionMilliseconds),
      ],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 60 } },
  });

  // Por Estado
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Tareas por Estado", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Estado", "Cantidad"]],
    body: data.tasksByStatus.map((r) => [r.status, String(r.count)]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Por Criticidad
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Tareas por Criticidad", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Criticidad", "Cantidad"]],
    body: data.tasksByCriticality.map((r) => [r.criticality, String(r.count)]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Por Tipo
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Tareas por Tipo", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Tipo de Tarea", "Cantidad"]],
    body: data.tasksByType.map((r) => [r.taskType, String(r.count)]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Top Técnicos (new page)
  doc.addPage();
  y = 20;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Top Técnicos", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["ID", "Técnico", "Tareas Completadas"]],
    body: data.topTechnicians.map((r) => [
      r.userId,
      r.userName,
      String(r.count),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Equipos con Fallas
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Equipos con Mayor Número de Fallas", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["ID", "Equipo", "Fallas"]],
    body: data.topFailingEquipment.map((r) => [
      r.equipmentId,
      r.equipmentName,
      String(r.count),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Tendencia
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Tendencia de Tareas", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Año", "Mes", "Creadas", "Completadas"]],
    body: data.tasksTrend.map((r) => [
      String(r.month.year),
      String(r.month.month),
      String(r.created),
      String(r.completed),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  const name = filename ?? `reporte-tareas-${getDateSuffix()}.pdf`;
  doc.save(name);
}
