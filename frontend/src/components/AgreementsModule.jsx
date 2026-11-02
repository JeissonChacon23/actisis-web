import { useState } from "react";
import * as Icons from "../helpers/Icons";
import { createAgreement } from "../services/agreementService";
import { addToast } from "./Toast";
import { Modal } from "./Modal";
import { formatDate } from "../helpers/formatters";

export function AgreementsModule({ agreements = [], currentUser, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    numero: "",
    empresa: "",
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
    driveLink: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAgreement(formData, currentUser);
      addToast("Convenio institucional registrado con éxito.");
      setShowModal(false);
      setFormData({ numero: "", empresa: "", fecha: "", descripcion: "", driveLink: "" });
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icons.Plus size={16} /> Nuevo Convenio
        </button>
      </div>

      <div className="table-container">
        <div className="table-header"><h3>Convenios Institucionales (Acreditación)</h3></div>
        {agreements.length === 0 ? (
          <div className="empty-state"><Icons.Handshake size={48} /><p>No hay convenios registrados.</p></div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>N° Convenio</th>
                  <th>Empresa / Institución</th>
                  <th>Fecha Suscripción</th>
                  <th>Descripción</th>
                  <th>Soporte (Drive)</th>
                </tr>
              </thead>
              <tbody>
                {agreements.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.numero}</td>
                    <td>{a.empresa}</td>
                    <td>{formatDate(a.fecha)}</td>
                    <td style={{ fontSize: 13 }}>{a.descripcion || "—"}</td>
                    <td>
                      {a.driveLink ? (
                        <a href={a.driveLink} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
                          Drive ↗
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Registrar Convenio Institucional">
        <form onSubmit={handleSubmit}>
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
            <label>Fecha de Suscripción *</label>
            <input
              type="date"
              className="form-control"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Enlace de Evidencia en Drive</label>
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
              className="form-control"
              rows="3"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Convenio</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
