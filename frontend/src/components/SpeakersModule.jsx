import { useState } from "react";
import * as Icons from "../helpers/Icons";
import { createSpeaker, updateSpeaker, deleteSpeaker } from "../services/speakerService";
import { addToast } from "./Toast";
import { Modal } from "./Modal";

export function SpeakersModule({ speakers = [], currentUser, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    correo: "",
    institucion: "",
    especialidad: "",
  });

  const isAdmin = currentUser?.rol === "admin";

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      nombre: "",
      identificacion: "",
      telefono: "",
      correo: "",
      institucion: "",
      especialidad: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingId(s.id);
    setFormData({
      nombre: s.nombre || "",
      identificacion: s.identificacion || "",
      telefono: s.telefono || "",
      correo: s.correo || "",
      institucion: s.institucion || "",
      especialidad: s.especialidad || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSpeaker(editingId, formData, currentUser);
        addToast("Información del participante externo actualizada.");
      } else {
        await createSpeaker(formData, currentUser);
        addToast("Participante externo registrado con éxito.");
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`¿Eliminar al conferencista "${s.nombre}"?`)) return;
    try {
      await deleteSpeaker(s.id, s.nombre, currentUser);
      addToast("Participante externo eliminado.");
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const filtered = speakers.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (s.nombre || "").toLowerCase().includes(q) ||
      (s.identificacion || "").toLowerCase().includes(q) ||
      (s.institucion || "").toLowerCase().includes(q) ||
      (s.especialidad || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fade-in">
      {/* Barra de Búsqueda y Registro (RF005.1 - RF005.3) */}
      <div className="filters-bar" style={{ justifyContent: "space-between" }}>
        <div style={{ position: "relative", minWidth: 280, flex: 1, maxWidth: 420 }}>
          <Icons.Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar por nombre, documento, institución o especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleOpenNew}>
          <Icons.Plus size={16} /> Nuevo Participante Externo
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Conferencistas y Participantes Externos ({filtered.length})</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Icons.Mic size={48} />
            <p>No hay participantes externos registrados.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Identificación</th>
                  <th>Institución / Empresa</th>
                  <th>Especialidad</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                    <td>{s.identificacion || "—"}</td>
                    <td>{s.institucion || "—"}</td>
                    <td>{s.especialidad || "—"}</td>
                    <td>{s.telefono || "—"}</td>
                    <td style={{ fontSize: 13 }}>{s.correo || "—"}</td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-sm btn-secondary"
                          title="Editar participante (RF005.2)"
                          onClick={() => handleOpenEdit(s)}
                        >
                          <Icons.Edit size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-sm btn-danger"
                            title="Eliminar participante"
                            onClick={() => handleDelete(s)}
                          >
                            <Icons.Trash size={14} />
                          </button>
                        )}
                      </div>
                    </td>
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
        title={editingId ? "Editar Participante Externo (RF005.2)" : "Registrar Participante Externo (RF005.1)"}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Dr. Alan Turing"
              />
            </div>
            <div className="form-group">
              <label>Documento de Identificación *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.identificacion}
                onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                placeholder="Ej. 1090123456 o Pasaporte"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Institución o Empresa *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.institucion}
                onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                placeholder="Ej. Google Research / Universidad"
              />
            </div>
            <div className="form-group">
              <label>Especialidad / Área de Conocimiento</label>
              <input
                type="text"
                className="form-control"
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                placeholder="Ej. Inteligencia Artificial"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Teléfono de Contacto *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej. +57 3001234567"
              />
            </div>
            <div className="form-group">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                className="form-control"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="conferencista@entidad.org"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Guardar Cambios" : "Registrar Participante"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
