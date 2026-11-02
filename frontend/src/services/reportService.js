import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatDate } from "../helpers/formatters";

/**
 * Genera y descarga un informe oficial de actividades en PDF (RF007.1 - RF007.7)
 */
export function generateActivitiesPDF({ activities, filters, generatedBy }) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Colores institucionales UFPS
  const primaryRed = [200, 16, 46];
  const darkGray = [40, 40, 40];

  // Encabezado institucional
  doc.setFillColor(...primaryRed);
  doc.rect(0, 0, 297, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("UNIVERSIDAD FRANCISCO DE PAULA SANTANDER", 14, 10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Programa de Ingeniería de Sistemas · Plataforma ACTISIS", 14, 16);

  // Subtítulo y Metadatos del Informe
  doc.setTextColor(...darkGray);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("INFORME EJECUTIVO DE ACTIVIDADES Y CUMPLIMIENTO (CNA)", 14, 30);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const fechaGeneracion = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Fecha de emisión: ${fechaGeneracion}   |   Generado por: ${generatedBy || "Dirección de Programa"}`, 14, 36);

  let filtroTexto = "Filtros aplicados: ";
  filtroTexto += `Semestre: ${filters?.semestre || "Todos"} | `;
  filtroTexto += `Tipo: ${filters?.tipo || "Todos"} | `;
  filtroTexto += `Estado: ${filters?.estado || "Todos"}`;
  if (filters?.fechaDesde || filters?.fechaHasta) {
    filtroTexto += ` | Rango: ${filters?.fechaDesde || "Inicio"} a ${filters?.fechaHasta || "Fin"}`;
  }
  doc.text(filtroTexto, 14, 41);

  // Resumen de Cumplimiento (RF007.7)
  const total = activities.length;
  const aprobadas = activities.filter((a) => a.estado === "aprobada").length;
  const conEvidencia = activities.filter((a) => Boolean(a.driveFolderLink)).length;
  const pctAprobacion = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
  const pctEvidencia = total > 0 ? Math.round((conEvidencia / total) * 100) : 0;

  doc.setFont("helvetica", "bold");
  doc.text(
    `Indicadores de Cumplimiento (RF007.7): Total: ${total} | Aprobadas: ${aprobadas} (${pctAprobacion}%) | Con Evidencia Documental en Drive: ${conEvidencia} (${pctEvidencia}%)`,
    14,
    47
  );

  // Tabla estructurada con autotable
  const tableData = activities.map((a, idx) => [
    idx + 1,
    a.nombre || "—",
    a.tipo || "—",
    a.semestre || "—",
    formatDate(a.fechaInicio),
    a.docenteNombre || "—",
    (a.estado || "pendiente").toUpperCase(),
    a.driveFolderLink ? "Con Evidencia (Drive)" : "Pendiente soporte",
  ]);

  doc.autoTable({
    startY: 52,
    head: [["#", "Actividad", "Tipo", "Sem.", "Fecha", "Docente Resp.", "Estado", "Cumplimiento Evidencia"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryRed,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 250],
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 65 },
      2: { cellWidth: 32 },
      3: { cellWidth: 18 },
      4: { cellWidth: 26 },
      5: { cellWidth: 50 },
      6: { cellWidth: 26 },
      7: { cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount} — Soporte para Acreditación Institucional CNA (Acuerdo 02-2020)`,
        14,
        205
      );
    },
  });

  const semStr = filters?.semestre ? `_${filters.semestre}` : "";
  doc.save(`ACTISIS_Informe_Actividades${semStr}.pdf`);
}
