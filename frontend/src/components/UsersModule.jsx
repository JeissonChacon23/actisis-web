import { useState } from "react";
import * as Icons from "../helpers/Icons";
import {
  toggleUserStatus,
  updateUser,
  generateInvitationLink,
} from "../services/userService";
import { addToast } from "./Toast";
import { Modal } from "./Modal";

export function UsersModule({ docentes = [], currentUser, onRefresh }) {
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    codigo: "",
    correo: "",
    telefono: "",
    tipo: "Planta",
    rol: "docente",
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = async (userId, estadoActual) => {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    try {
      await toggleUserStatus(userId, nuevoEstado, currentUser);
      addToast(`Docente ${nuevoEstado === "activo" ? "activado" : "inactivado"} exitosamente.`);
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      addToast("Ingresa el correo institucional del docente.", "error");
      return;
    }
    setInviting(true);
    try {
      const res = await generateInvitationLink(
        { correo: inviteEmail, nombre: inviteName },
        currentUser
      );
      setGeneratedLink(res.link);
      setInviteEmail("");
      setInviteName("");
      addToast("Enlace único de registro generado (válido por 24 horas).");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setInviting(false);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      nombre: u.nombre || "",
      apellido: u.apellido || "",
      documento: u.documento || "",
      codigo: u.codigo || "",
      correo: u.correo || u.email || "",
      telefono: u.telefono || "",
      tipo: u.tipo || "Planta",
      rol: u.rol || "docente",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      await updateUser(editingUser.id, formData, currentUser);
      addToast("Información del docente actualizada.");
      setEditingUser(null);
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = docentes.filter((d) => {
    const q = search.toLowerCase();
    return (
      `${d.nombre || ""} ${d.apellido || ""}`.toLowerCase().includes(q) ||
      (d.codigo || "").toLowerCase().includes(q) ||
      (d.documento || "").toLowerCase().includes(q) ||
      (d.correo || d.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fade-in">
      {/* Generador de Enlace Único de Registro para Docentes (RF001.1 / RB-01) */}
      <div
        style={{
          background: "var(--bg-card)",
          padding: 20,
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
          Invitar Nuevo Docente mediante Enlace Único Temporal (RF001.1)
        </h3>
        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14 }}>
          Genera un enlace único de registro con vigencia de 24 horas y uso único para que el docente complete su vinculación.
        </p>

        <form
          onSubmit={handleGenerateInvite}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}
        >
          <input
            type="text"
            className="form-control"
            style={{ width: 220, height: 40 }}
            placeholder="Nombre sugerido (opcional)"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <input
            type="email"
            className="form-control"
            style={{ flex: 1, minWidth: 240, height: 40 }}
            placeholder="correo.docente@ufps.edu.co *"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ height: 40 }} disabled={inviting}>
            <Icons.Send size={15} /> {inviting ? "Generando..." : "Generar Enlace Único"}
          </button>
        </form>

        {generatedLink && (
          <div
            style={{
              marginTop: 14,
              padding: "12px 16px",
              background: "var(--success-soft)",
              border: "1px solid var(--success)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 13 }}>
              <strong style={{ color: "var(--success)" }}>Enlace único generado (expira en 24h):</strong>{" "}
              <code style={{ wordBreak: "break-all" }}>{generatedLink}</code>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                addToast("Enlace copiado al portapapeles.");
              }}
            >
              Copiar Enlace
            </button>
          </div>
        )}
      </div>

      {/* Tabla de Docentes con Buscador (RF001.3, RF001.4, RF001.5, RF001.6) */}
      <div className="table-container">
        <div className="table-header">
          <h3>Directorio de Docentes del Programa ({filtered.length})</h3>
          <div className="input-with-icon" style={{ width: 250 }}>
            <span className="input-icon-left" style={{ left: 12 }}>
              <Icons.Search size={15} />
            </span>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 36, height: 36, fontSize: 13 }}
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <Icons.Users size={48} />
            <p>No se encontraron docentes registrados.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Documento</th>
                  <th>Código</th>
                  <th>Correo Institucional</th>
                  <th>Vinculación</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.nombre} {d.apellido}</td>
                    <td>{d.documento || "—"}</td>
                    <td>{d.codigo || "—"}</td>
                    <td>{d.correo || d.email}</td>
                    <td>{d.tipo || "Planta"}</td>
                    <td>
                      <span className={`badge ${d.rol === "admin" ? "badge-purple" : "badge-blue"}`}>
                        {(d.rol || "docente").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${d.estado === "inactivo" ? "badge-red" : "badge-green"}`}>
                        {(d.estado || "activo").toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          className="btn btn-sm btn-icon btn-secondary"
                          title="Editar información y rol del docente (RF001.4 / RF001.6)"
                          onClick={() => openEditModal(d)}
                        >
                          <Icons.Edit size={15} />
                        </button>
                        {d.id !== currentUser?.uid && (
                          <button
                            className={`btn btn-sm ${d.estado === "inactivo" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => handleToggle(d.id, d.estado || "activo")}
                          >
                            {d.estado === "inactivo" ? "Activar" : "Inactivar"}
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

      {/* Modal de Edición de Docente (RF001.4 / RF001.6) */}
      <Modal
        show={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Editar Información de Docente"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Documento de Identidad (solo números) *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </div>
            <div className="form-group">
              <label>Código Institucional (solo números) *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Correo Institucional *</label>
              <input
                type="email"
                className="form-control"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Teléfono / Contacto (solo números)</label>
              <input
                type="text"
                className="form-control"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/[^0-9+\-\s]/g, "") })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Vinculación</label>
              <select
                className="form-control"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="Planta">Planta</option>
                <option value="Cátedra">Cátedra</option>
                <option value="Ocasional">Ocasional</option>
              </select>
            </div>
            <div className="form-group">
              <label>Rol en el Sistema (RF001.6)</label>
              <select
                className="form-control"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                <option value="docente">Docente</option>
                <option value="admin">Administrador / Director</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
