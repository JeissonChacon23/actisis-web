import { useState } from "react";
import * as Icons from "../helpers/Icons";
import { ACTIVITY_TYPES, SEMESTERS } from "../helpers/constants";
import { typeBadge, formatDate } from "../helpers/formatters";
import { approveActivity, rejectActivity, deleteActivity } from "../services/activityService";
import { addToast } from "./Toast";
import { Modal } from "./Modal";

export function ActivitiesModule({
  activities = [],
  user,
  onRefresh,
  onEditActivity,
  onNewActivity,
  searchQuery,
}) {
  const [filterType, setFilterType] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  const filtered = activities.filter((a) => {
    const q = (searchQuery || "").toLowerCase();
    const matchSearch =
      (a.nombre || "").toLowerCase().includes(q) ||
      (a.tematica || "").toLowerCase().includes(q) ||
      (a.docenteNombre || "").toLowerCase().includes(q);

    const matchType = !filterType || a.tipo === filterType;
    const matchSemester = !filterSemester || a.semestre === filterSemester;
    const matchStatus = !filterStatus || a.estado === filterStatus;

    return matchSearch && matchType && matchSemester && matchStatus;
  });

  return (
    <div className="fade-in">
      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select
          className="form-control"
          style={{ width: 170 }}
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
        >
          <option value="">Todos los Semestres</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 170 }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Todos los Tipos</option>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 170 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos los Estados</option>
          <option value="aprobada">Aprobadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="rechazada">Rechazadas</option>
        </select>

        {(filterSemester || filterType || filterStatus) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setFilterSemester("");
              setFilterType("");
              setFilterStatus("");
            }}
          >
            Limpiar Filtros
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
            <p>No se encontraron actividades con los filtros seleccionados.</p>
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
                            title="Abrir en Google Drive"
                          >
                            <span>Drive</span> ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
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
          className="form-control"
          rows="3"
          placeholder="Ej. Faltan soportes en el enlace de Drive, fecha fuera del periodo académico..."
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
        />
      </Modal>
    </div>
  );
}
