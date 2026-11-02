import { useState } from "react";
import * as Icons from "../helpers/Icons";
import { ACTIVITY_TYPES, SEMESTERS, MOBILITY_TYPES } from "../helpers/constants";
import { generateActivitiesPDF } from "../services/reportService";
import { addToast } from "./Toast";
import { formatDate, typeBadge } from "../helpers/formatters";

export function ReportsModule({ activities = [], user }) {
  const [filterSemester, setFilterSemester] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Filtrado por Semestre (RF007.1), Tipo (RF007.2), Rango de Fechas (RF007.3) y Estado
  const filtered = activities.filter((a) => {
    const matchSem = !filterSemester || a.semestre === filterSemester;
    const matchType = !filterType || a.tipo === filterType;
    const matchStatus = !filterStatus || a.estado === filterStatus;
    const actDate = (a.fechaInicio || "").slice(0, 10);
    const matchDesde = !fechaDesde || (actDate && actDate >= fechaDesde);
    const matchHasta = !fechaHasta || (actDate && actDate <= fechaHasta);
    return matchSem && matchType && matchStatus && matchDesde && matchHasta;
  });

  // Métricas de Cumplimiento (RF007.7)
  const totalCount = filtered.length;
  const approvedCount = filtered.filter((a) => a.estado === "aprobada").length;
  const pendingCount = filtered.filter((a) => a.estado === "pendiente").length;
  const withEvidenceCount = filtered.filter((a) => Boolean(a.driveFolderLink)).length;
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const evidenceRate = totalCount > 0 ? Math.round((withEvidenceCount / totalCount) * 100) : 0;

  // Datos para Gráficos Estadísticos (RF007.6)
  const byType = ACTIVITY_TYPES.map((t) => ({
    label: t,
    count: filtered.filter((a) => a.tipo === t).length,
  })).filter((x) => x.count > 0);
  const maxType = Math.max(...byType.map((x) => x.count), 1);

  const byMobility = MOBILITY_TYPES.map((m) => ({
    label: m,
    count: filtered.filter((a) => (a.movilidad || "No aplica") === m).length,
  })).filter((x) => x.count > 0);
  const maxMobility = Math.max(...byMobility.map((x) => x.count), 1);

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
          fechaDesde,
          fechaHasta,
        },
        generatedBy: `${user?.nombre || "Director"} ${user?.apellido || ""}`.trim(),
      });
      addToast("Informe PDF generado y descargado exitosamente (RF007.5).");
    } catch (err) {
      addToast("Error al generar el PDF: " + err.message, "error");
    }
  };

  return (
    <div className="fade-in">
      {/* Panel de Filtros y Exportación PDF (RF007.1 - RF007.5) */}
      <div style={{ background: "var(--bg-card)", padding: 24, borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 6, color: "var(--text-primary)" }}>
          Generador de Informes Ejecutivos y Estadísticas CNA (RF007)
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
          Filtra por semestre, tipo o rango de fechas, visualiza gráficos e indicadores de cumplimiento y descarga el reporte oficial en PDF.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 145 }}>
            <label>Semestre (RF007.1)</label>
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

          <div className="form-group" style={{ marginBottom: 0, minWidth: 155 }}>
            <label>Tipo de Actividad (RF007.2)</label>
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

          <div className="form-group" style={{ marginBottom: 0, minWidth: 145 }}>
            <label>Estado</label>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="aprobada">Solo Aprobadas</option>
              <option value="pendiente">Solo Pendientes</option>
              <option value="rechazada">Solo Rechazadas</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Desde (RF007.3)</label>
            <input
              type="date"
              className="form-control"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Hasta (RF007.3)</label>
            <input
              type="date"
              className="form-control"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ height: 42, display: "flex", alignItems: "center", gap: 8 }}
            onClick={handleDownloadPDF}
          >
            <Icons.Download size={18} />
            <span>Exportar PDF ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Informe de Cumplimiento de Actividades (RF007.7) */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card red">
          <div className="stat-label">Total Filtradas</div>
          <div className="stat-value">{totalCount}</div>
          <div className="stat-sub">{pendingCount} en revisión</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Cumplimiento de Aprobación</div>
          <div className="stat-value">{approvalRate}%</div>
          <div className="stat-sub">{approvedCount} de {totalCount} aprobadas</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Cumplimiento de Evidencias</div>
          <div className="stat-value">{evidenceRate}%</div>
          <div className="stat-sub">{withEvidenceCount} con carpeta en Google Drive</div>
        </div>
      </div>

      {/* Gráficos Estadísticos de Actividades (RF007.6) */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <h3>Distribución por Tipo de Actividad (RF007.6)</h3>
          <div className="bar-chart">
            {byType.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Sin datos para graficar</p>
            ) : (
              byType.map((item) => (
                <div className="bar-row" key={item.label}>
                  <span className="bar-label">{item.label}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(item.count / maxType) * 100}%`,
                        background: "linear-gradient(90deg, var(--accent), var(--accent-light))",
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>Distribución por Tipo de Movilidad (RF007.6)</h3>
          <div className="bar-chart">
            {byMobility.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Sin datos para graficar</p>
            ) : (
              byMobility.map((item) => (
                <div className="bar-row" key={item.label}>
                  <span className="bar-label">{item.label}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(item.count / maxMobility) * 100}%`,
                        background: "linear-gradient(90deg, var(--blue), #60a5fa)",
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Previsualización del Informe en Pantalla (RF007.4) */}
      <div className="table-container">
        <div className="table-header">
          <h3>Previsualización del Informe en Pantalla ({filtered.length} registros)</h3>
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
                  <th>Evidencia Drive</th>
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
                      {a.driveFolderLink ? (
                        <span className="badge badge-green">Con Soporte</span>
                      ) : (
                        <span className="badge badge-yellow">Sin Soporte</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${a.estado === "aprobada" ? "badge-green" : a.estado === "rechazada" ? "badge-red" : "badge-yellow"}`}>
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
