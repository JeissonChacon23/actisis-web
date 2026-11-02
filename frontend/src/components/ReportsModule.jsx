import { useState } from "react";
import * as Icons from "../helpers/Icons";
import { ACTIVITY_TYPES, SEMESTERS } from "../helpers/constants";
import { generateActivitiesPDF } from "../services/reportService";
import { addToast } from "./Toast";
import { formatDate, typeBadge } from "../helpers/formatters";

export function ReportsModule({ activities = [], user }) {
  const [filterSemester, setFilterSemester] = useState(SEMESTERS[SEMESTERS.length - 2] || "2026-1");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("aprobada");

  const filtered = activities.filter((a) => {
    const matchSem = !filterSemester || a.semestre === filterSemester;
    const matchType = !filterType || a.tipo === filterType;
    const matchStatus = !filterStatus || a.estado === filterStatus;
    return matchSem && matchType && matchStatus;
  });

  const handleDownloadPDF = () => {
    if (filtered.length === 0) {
      addToast("No hay actividades para generar el informe con los filtros seleccionados.", "error");
      return;
    }
    try {
      generateActivitiesPDF({
        activities: filtered,
        filters: {
          semestre: filterSemester,
          tipo: filterType,
          estado: filterStatus,
        },
        generatedBy: `${user?.nombre || "Director"} ${user?.apellido || ""}`.trim(),
      });
      addToast("Informe PDF generado y descargado exitosamente.");
    } catch (err) {
      addToast("Error al generar el PDF: " + err.message, "error");
    }
  };

  return (
    <div className="fade-in">
      <div style={{ background: "var(--bg-card)", padding: 24, borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8, color: "var(--text-primary)" }}>
          Generador de Informes Ejecutivos en PDF (Acreditación CNA)
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
          Exporta listados oficiales con membrete institucional de la UFPS, firmas y enlaces a carpetas de Google Drive para auditorías del CNA.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label>Semestre Académico</label>
            <select
              className="form-control"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              <option value="">Todos los Semestres</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label>Tipo de Actividad</label>
            <select
              className="form-control"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Todos los Tipos</option>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label>Estado de Actividades</label>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="aprobada">Solo Aprobadas (Oficial)</option>
              <option value="pendiente">Solo Pendientes</option>
              <option value="rechazada">Solo Rechazadas</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            style={{ height: 42, display: "flex", alignItems: "center", gap: 8 }}
            onClick={handleDownloadPDF}
          >
            <Icons.Download size={18} />
            <span>Descargar Informe PDF ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Previsualización del Informe */}
      <div className="table-container">
        <div className="table-header">
          <h3>Vista Previa del Contenido del Informe ({filtered.length} registros)</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Icons.BarChart size={48} />
            <p>No se encontraron actividades que coincidan con los criterios seleccionados.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Actividad</th>
                  <th>Tipo</th>
                  <th>Semestre</th>
                  <th>Fecha</th>
                  <th>Docente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, idx) => (
                  <tr key={a.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{a.nombre}</td>
                    <td><span className={`badge ${typeBadge(a.tipo)}`}>{a.tipo}</span></td>
                    <td>{a.semestre}</td>
                    <td>{formatDate(a.fechaInicio)}</td>
                    <td>{a.docenteNombre}</td>
                    <td>
                      <span className={`badge ${a.estado === "aprobada" ? "badge-green" : "badge-yellow"}`}>
                        {a.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
