import { useState } from "react";
import * as Icons from "../helpers/Icons";
import { ACTIVITY_TYPES, SEMESTERS } from "../helpers/constants";
import { typeBadge, formatDate, toInputDate } from "../helpers/formatters";
import {
  approveActivity,
  rejectActivity,
  deleteActivity,
  removeActivityEvidence,
} from "../services/activityService";
import { addToast } from "./Toast";
import { Modal } from "./Modal";

export function ActivitiesModule({
  activities = [],
  user,
  onRefresh,
  onEditActivity,
  onNewActivity,
  searchQuery,
  onClearSearch,
}) {
  const [filterType, setFilterType] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [viewing, setViewing] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const isAdmin = user?.rol === "admin";

  const handleApprove = async (id) => {
    try {
      await approveActivity(id, user);
      addToast("Actividad aprobada correctamente.");
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    try {
      await rejectActivity(rejectingId, motivoRechazo, user);
      addToast("Actividad rechazada.");
      setRejectingId(null);
      setMotivoRechazo("");
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar la actividad "${nombre}"?`)) return;
    try {
      await deleteActivity(id, user);
      addToast("Actividad eliminada.");
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleRemoveEvidence = async (id) => {
    if (!window.confirm("¿Deseas eliminar el enlace y descripción de evidencia de esta actividad?")) return;
    try {
      await removeActivityEvidence(id, user);
      addToast("Evidencia eliminada de la actividad.");
      setViewing((prev) => (prev ? { ...prev, driveFolderLink: "", descripcionEvidencia: "" } : null));
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const filtered = activities.filter((a) => {
    const q = (searchQuery || "").toLowerCase();
    const matchSearch =
      (a.nombre || "").toLowerCase().includes(q) ||
      (a.tematica || "").toLowerCase().includes(q) ||
      (a.descripcion || "").toLowerCase().includes(q) ||
      (a.docenteNombre || "").toLowerCase().includes(q);

    const matchType = !filterType || a.tipo === filterType;
    const matchSemester = !filterSemester || a.semestre === filterSemester;
    const matchStatus = !filterStatus || a.estado === filterStatus;

    const fi = toInputDate(a.fechaInicio);
    const matchDesde = !fechaDesde || fi >= fechaDesde;
    const matchHasta = !fechaHasta || fi <= fechaHasta;

    return matchSearch && matchType && matchSemester && matchStatus && matchDesde && matchHasta;
  });

  return (
    <div className="fade-in">
      {/* Filtros por Semestre, Tipo, Estado y Rango de Fechas (RF003.8 - RF003.11) */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select
          className="form-control"
          style={{ width: 155, height: 38, padding: "6px 12px" }}
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
        >
          <option value="">Semestre: Todos</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 165, height: 38, padding: "6px 12px" }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Tipo: Todos</option>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 155, height: 38, padding: "6px 12px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Estado: Todos</option>
          <option value="aprobada">Aprobadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="rechazada">Rechazadas</option>
        </select>

        <input
          type="date"
          className="form-control"
          style={{ width: 145, height: 38, padding: "6px 10px" }}
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          title="Fecha desde"
        />

        <input
          type="date"
          className="form-control"
          style={{ width: 145, height: 38, padding: "6px 10px" }}
          value={fechaHasta}
          min={fechaDesde}
          onChange={(e) => setFechaHasta(e.target.value)}
          title="Fecha hasta"
        />

        {(filterSemester || filterType || filterStatus || fechaDesde || fechaHasta) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setFilterSemester("");
              setFilterType("");
              setFilterStatus("");
              setFechaDesde("");
              setFechaHasta("");
            }}
          >
            Limpiar
          </button>
        )}

        <div style={{ marginLeft: "auto" }}>
          <button className="btn btn-primary" onClick={onNewActivity}>
            <Icons.Plus size={16} /> Nueva Actividad
          </button>
        </div>
      </div>

      {/* Tabla de Actividades */}
      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Icons.Activity size={48} />
            <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              No se encontraron actividades con los criterios actuales.
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
              Prueba con otro término de búsqueda o restablece los filtros activos (USW26).
            </p>
            {(filterSemester || filterType || filterStatus || fechaDesde || fechaHasta || searchQuery) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFilterSemester("");
                  setFilterType("");
                  setFilterStatus("");
                  setFechaDesde("");
                  setFechaHasta("");
                  if (onClearSearch) onClearSearch();
                }}
              >
                Limpiar búsqueda y ver todas las actividades
              </button>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Tipo</th>
                  <th>Semestre</th>
                  <th>Fecha</th>
                  <th>Docente</th>
                  <th>Estado</th>
                  <th>Evidencias (Drive)</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const isOwner = a.docenteId === user?.uid;
                  const canEdit = isAdmin || isOwner;
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)", maxWidth: 220 }}>
                        {a.nombre}
                      </td>
                      <td>
                        <span className={`badge ${typeBadge(a.tipo)}`}>{a.tipo}</span>
                      </td>
                      <td>{a.semestre}</td>
                      <td style={{ fontSize: 13 }}>{formatDate(a.fechaInicio)}</td>
                      <td style={{ fontSize: 13 }}>{a.docenteNombre}</td>
                      <td>
                        <span
                          className={`badge ${
                            a.estado === "aprobada"
                              ? "badge-green"
                              : a.estado === "pendiente"
                              ? "badge-yellow"
                              : "badge-red"
                          }`}
                        >
                          {a.estado?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {a.driveFolderLink ? (
                          <a
                            href={a.driveFolderLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-secondary"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                            title={a.descripcionEvidencia || "Abrir en Google Drive"}
                          >
                            <span>Drive</span> ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          {/* Botón Ver Detalle Individual (RF003.6) */}
                          <button
                            className="btn btn-sm btn-icon btn-secondary"
                            title="Ver Detalle Completo"
                            onClick={() => setViewing(a)}
                          >
                            <Icons.Eye size={16} />
                          </button>

                          {/* Botones de Aprobación para Admin */}
                          {isAdmin && a.estado === "pendiente" && (
                            <>
                              <button
                                className="btn btn-sm btn-icon"
                                style={{ background: "var(--success-soft)", color: "var(--success)" }}
                                title="Aprobar Actividad"
                                onClick={() => handleApprove(a.id)}
                              >
                                <Icons.Check size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-icon"
                                style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
                                title="Rechazar Actividad"
                                onClick={() => setRejectingId(a.id)}
                              >
                                <Icons.X size={16} />
                              </button>
                            </>
                          )}

                          {/* Botón Editar */}
                          {canEdit && (
                            <button
                              className="btn btn-sm btn-icon btn-secondary"
                              title="Editar Actividad"
                              onClick={() => onEditActivity(a)}
                            >
                              <Icons.Edit size={16} />
                            </button>
                          )}

                          {/* Botón Eliminar (Solo Admin) */}
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-icon"
                              style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
                              title="Eliminar Actividad"
                              onClick={() => handleDelete(a.id, a.nombre)}
                            >
                              <Icons.Trash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle Individual de Actividad (RF003.6 / RF003.17 / RF003.18) */}
      <Modal
        show={!!viewing}
        onClose={() => setViewing(null)}
        title="Ficha Detallada de la Actividad"
        maxWidth="640px"
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <div>
              {isAdmin && viewing?.driveFolderLink && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveEvidence(viewing.id)}
                  title="Eliminar enlace de evidencia (RF003.18)"
                >
                  <Icons.Trash size={14} /> Eliminar Evidencia
                </button>
              )}
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => setViewing(null)}>
              Cerrar
            </button>
          </div>
        }
      >
        {viewing && (
          <div>
            {viewing.estado === "rechazada" && viewing.motivoRechazo && (
              <div className="login-error" style={{ marginBottom: 14, textAlign: "left" }}>
                <strong>Motivo de Rechazo:</strong> {viewing.motivoRechazo}
              </div>
            )}
            {[
              ["Nombre", viewing.nombre],
              ["Fechas", `${formatDate(viewing.fechaInicio)} – ${formatDate(viewing.fechaFin)}`],
              ["Horario", viewing.horario || "—"],
              ["Tipo", <span className={`badge ${typeBadge(viewing.tipo)}`}>{viewing.tipo}</span>],
              [
                "Estado",
                <span
                  className={`badge ${
                    viewing.estado === "aprobada"
                      ? "badge-green"
                      : viewing.estado === "pendiente"
                      ? "badge-yellow"
                      : "badge-red"
                  }`}
                >
                  {(viewing.estado || "aprobada").toUpperCase()}
                </span>,
              ],
              ["Semestre", viewing.semestre],
              ["Temática", viewing.tematica || "—"],
              ["Descripción", viewing.descripcion || "—"],
              ["Lugar", viewing.lugar || "—"],
              ["Movilidad", viewing.movilidad || "N/A"],
              ["Conferencista", viewing.conferencistaNombre || "—"],
              ["Convenio Vinculado", viewing.convenioNumero || "—"],
              ["Docente Responsable", viewing.docenteNombre || "—"],
              ["Descripción Evidencia", viewing.descripcionEvidencia || "—"],
              [
                "Enlace Evidencia",
                viewing.driveFolderLink ? (
                  <a
                    href={viewing.driveFolderLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--ufps-red)", fontWeight: 600, textDecoration: "underline" }}
                  >
                    Abrir Carpeta en Google Drive ↗
                  </a>
                ) : (
                  "Sin evidencia adjunta"
                ),
              ],
            ].map(([label, val]) => (
              <div key={label} className="detail-row">
                <div className="detail-label">{label}</div>
                <div className="detail-value">{val}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal de Rechazo de Actividad */}
      <Modal
        show={!!rejectingId}
        onClose={() => setRejectingId(null)}
        title="Rechazar Actividad"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setRejectingId(null)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleConfirmReject}>
              Confirmar Rechazo
            </button>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
          Indica el motivo por el cual se rechaza esta actividad para notificar al docente responsable:
        </p>
        <textarea
          className="form-textarea"
          rows="3"
          placeholder="Ej. Faltan soportes en el enlace de Drive, fecha fuera del periodo académico..."
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
        />
      </Modal>
    </div>
  );
}
