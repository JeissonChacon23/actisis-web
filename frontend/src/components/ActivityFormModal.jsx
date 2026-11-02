import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { ACTIVITY_TYPES, SEMESTERS, MOBILITY_TYPES } from "../helpers/constants";
import { toInputDate } from "../helpers/formatters";
import { validateDateInSemester, isValidDriveUrl } from "../helpers/validators";

export function ActivityFormModal({
  show,
  onClose,
  onSave,
  activity = null,
  user,
  docentes = [],
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
    horario: "",
    tipo: ACTIVITY_TYPES[0],
    semestre: SEMESTERS[SEMESTERS.length - 2] || "2026-1",
    tematica: "",
    descripcion: "",
    lugar: "",
    movilidad: "N/A",
    driveFolderLink: "",
    docenteId: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.rol === "admin";
  const isEditing = !!activity;

  useEffect(() => {
    if (activity) {
      setFormData({
        nombre: activity.nombre || "",
        fechaInicio: toInputDate(activity.fechaInicio),
        fechaFin: toInputDate(activity.fechaFin || activity.fechaInicio),
        horario: activity.horario || "",
        tipo: activity.tipo || ACTIVITY_TYPES[0],
        semestre: activity.semestre || "2026-1",
        tematica: activity.tematica || "",
        descripcion: activity.descripcion || "",
        lugar: activity.lugar || "",
        movilidad: activity.movilidad || "N/A",
        driveFolderLink: activity.driveFolderLink || "",
        docenteId: activity.docenteId || "",
      });
    } else {
      setFormData({
        nombre: "",
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaFin: new Date().toISOString().split("T")[0],
        horario: "",
        tipo: ACTIVITY_TYPES[0],
        semestre: "2026-1",
        tematica: "",
        descripcion: "",
        lugar: "",
        movilidad: "N/A",
        driveFolderLink: "",
        docenteId: isAdmin ? "" : user?.uid,
      });
    }
    setError("");
  }, [activity, show, isAdmin, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación obligatorios
    if (!formData.nombre.trim()) {
      setError("El nombre de la actividad es obligatorio.");
      return;
    }

    // Validación N18 (Fechas vs Semestre)
    const semCheck = validateDateInSemester(formData.fechaInicio, formData.semestre);
    if (!semCheck.valid) {
      setError(semCheck.error);
      return;
    }

    // Validación AD-CCA-07_03 (Google Drive URL)
    if (formData.driveFolderLink && !isValidDriveUrl(formData.driveFolderLink)) {
      setError("El enlace de evidencias debe ser una URL válida de Google Drive (drive.google.com).");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };
      if (isAdmin && formData.docenteId) {
        const docObj = docentes.find((d) => d.id === formData.docenteId);
        if (docObj) {
          payload.docenteNombre = `${docObj.nombre || ""} ${docObj.apellido || ""}`.trim();
          payload.docenteCodigo = docObj.codigo || "";
        }
      }
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Error al guardar la actividad.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={isEditing ? "Editar Actividad" : "Registrar Nueva Actividad"}
      maxWidth="700px"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="login-error" style={{ marginBottom: 14 }}>{error}</div>}

        {/* Alerta de Regla AC08 para docentes */}
        {!isAdmin && isEditing && activity?.estado === "aprobada" && (
          <div style={{ background: "var(--warning-soft)", borderLeft: "4px solid var(--warning)", padding: 10, borderRadius: 6, marginBottom: 14, fontSize: 13, color: "var(--warning)" }}>
            ⚠️ <strong>Aviso de Re-evaluación (Regla AC08):</strong> Esta actividad se encuentra aprobada. Al editarla, retornará automáticamente al estado <em>"Pendiente de Aprobación"</em> para ser revisada por el director del programa.
          </div>
        )}

        <div className="form-group">
          <label>Nombre de la Actividad *</label>
          <input
            type="text"
            name="nombre"
            className="form-control"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej. Conferencia Internacional de Inteligencia Artificial"
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Tipo de Actividad *</label>
            <select name="tipo" className="form-control" value={formData.tipo} onChange={handleChange}>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Semestre Académico * (Validación N18)</label>
            <select name="semestre" className="form-control" value={formData.semestre} onChange={handleChange}>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Fecha Inicio *</label>
            <input
              type="date"
              name="fechaInicio"
              className="form-control"
              value={formData.fechaInicio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              name="fechaFin"
              className="form-control"
              value={formData.fechaFin}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Horario</label>
            <input
              type="text"
              name="horario"
              className="form-control"
              value={formData.horario}
              onChange={handleChange}
              placeholder="Ej. 08:00 - 12:00"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Temática</label>
            <input
              type="text"
              name="tematica"
              className="form-control"
              value={formData.tematica}
              onChange={handleChange}
              placeholder="Ej. Machine Learning, Autoevaluación CNA"
            />
          </div>

          <div className="form-group">
            <label>Lugar / Espacio</label>
            <input
              type="text"
              name="lugar"
              className="form-control"
              value={formData.lugar}
              onChange={handleChange}
              placeholder="Ej. Auditorio Manuel José Hurtado / Sala 201"
            />
          </div>
        </div>

        {/* Soporte de Google Drive (AD-CCA-07_03) */}
        <div className="form-group">
          <label>
            📁 Enlace a Carpeta o Archivo de Google Drive (Evidencias Acreditación CNA)
          </label>
          <input
            type="url"
            name="driveFolderLink"
            className="form-control"
            value={formData.driveFolderLink}
            onChange={handleChange}
            placeholder="https://drive.google.com/drive/folders/..."
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
            Pega aquí el enlace público o institucional de Google Drive donde reposan las evidencias fotográficas, actas o listados.
          </span>
        </div>

        {isAdmin && (
          <div className="form-group">
            <label>Docente Responsable Asignado</label>
            <select name="docenteId" className="form-control" value={formData.docenteId} onChange={handleChange}>
              <option value="">-- Asignar a mí mismo ({user?.nombre}) --</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} {d.apellido} (Cód. {d.codigo})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Descripción detallada</label>
          <textarea
            name="descripcion"
            className="form-control"
            rows="3"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Breve resumen de los objetivos y alcance de la actividad..."
          />
        </div>
      </form>
    </Modal>
  );
}
