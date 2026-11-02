import { useState } from "react";
import * as Icons from "../helpers/Icons";
import {
  createAgreement,
  updateAgreement,
  deleteAgreement,
} from "../services/agreementService";
import { addToast } from "./Toast";
import { Modal } from "./Modal";
import { formatDate, toInputDate } from "../helpers/formatters";

export function AgreementsModule({ agreements = [], currentUser, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    numero: "",
    empresa: "",
    razon: "",
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
    driveLink: "",
  });

  const isAdmin = currentUser?.rol === "admin";

  const openNew = () => {
    setEditing(null);
    setFormData({
      numero: "",
      empresa: "",
      razon: "",
      fecha: new Date().toISOString().split("T")[0],
      descripcion: "",
      driveLink: "",
    });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setFormData({
      numero: a.numero || "",
      empresa: a.empresa || "",
      razon: a.razon || "",
      fecha: toInputDate(a.fecha),
      descripcion: a.descripcion || "",
      driveLink: a.driveLink || a.evidencia || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateAgreement(editing.id, formData, currentUser);
        addToast("Convenio institucional actualizado.");
      } else {
        await createAgreement(formData, currentUser);
        addToast("Convenio institucional registrado con éxito.");
      }
      setShowModal(false);
      setEditing(null);
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleDelete = async (id, numero) => {
    if (!window.confirm(`¿Deseas eliminar el convenio "${numero}"?`)) return;
    try {
      await deleteAgreement(id, currentUser);
      addToast("Convenio eliminado.");
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="fade-in">
      {isAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={openNew}>
            <Icons.Plus size={16} /> Nuevo Convenio
          </button>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h3>Catálogo de Convenios Institucionales ({agreements.length})</h3>
        </div>
        {agreements.length === 0 ? (
          <div className="empty-state">
            <Icons.Handshake size={48} />
            <p>No hay convenios registrados.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>N° Convenio</th>
                  <th>Empresa / Institución</th>
                  <th>Razón</th>
                  <th>Fecha Suscripción</th>
                  <th>Descripción</th>
                  <th>Evidencia (Drive)</th>
                  {isAdmin && <th style={{ textAlign: "right" }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {agreements.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.numero}</td>
                    <td>{a.empresa}</td>
                    <td style={{ fontSize: 13 }}>{a.razon || "—"}</td>
                    <td>{formatDate(a.fecha)}</td>
                    <td style={{ fontSize: 13 }}>{a.descripcion || "—"}</td>
                    <td>
                      {a.driveLink || a.evidencia ? (
                        <a
                          href={a.driveLink || a.evidencia}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          Drive ↗
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            className="btn btn-sm btn-icon btn-secondary"
                            title="Editar Convenio (RF004.2)"
                            onClick={() => openEdit(a)}
                          >
                            <Icons.Edit size={15} />
                          </button>
                          <button
                            className="btn btn-sm btn-icon"
                            style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
                            title="Eliminar Convenio"
                            onClick={() => handleDelete(a.id, a.numero)}
                          >
                            <Icons.Trash size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Editar Convenio Institucional" : "Registrar Convenio Institucional"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Número de Convenio *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ej. CONV-2026-001"
              />
            </div>
            <div className="form-group">
              <label>Fecha de Suscripción *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Empresa o Institución Vinculada *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              placeholder="Ej. Gobernación de Norte de Santander / Google"
            />
          </div>

          <div className="form-group">
            <label>Razón / Objeto Principal (RF004)</label>
            <input
              type="text"
              className="form-control"
              value={formData.razon}
              onChange={(e) => setFormData({ ...formData, razon: e.target.value })}
              placeholder="Ej. Cooperación interinstitucional e investigación aplicada"
            />
          </div>

          <div className="form-group">
            <label>Enlace de Evidencia en Google Drive (RF004.4)</label>
            <input
              type="url"
              className="form-control"
              value={formData.driveLink}
              onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="form-group">
            <label>Descripción / Alcance</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? "Guardar Cambios" : "Guardar Convenio"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
