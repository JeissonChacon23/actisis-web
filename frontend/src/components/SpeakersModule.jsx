import { useState } from "react";
import * as Icons from "../helpers/Icons";
import { createSpeaker } from "../services/speakerService";
import { addToast } from "./Toast";
import { Modal } from "./Modal";

export function SpeakersModule({ speakers = [], currentUser, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    institucion: "",
    correo: "",
    especialidad: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSpeaker(formData, currentUser);
      addToast("Conferencista registrado con éxito.");
      setShowModal(false);
      setFormData({ nombre: "", institucion: "", correo: "", especialidad: "" });
      onRefresh();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icons.Plus size={16} /> Nuevo Conferencista
        </button>
      </div>

      <div className="table-container">
        <div className="table-header"><h3>Conferencistas y Participantes Externos</h3></div>
        {speakers.length === 0 ? (
          <div className="empty-state"><Icons.Mic size={48} /><p>No hay conferencistas registrados.</p></div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Institución / Empresa</th>
                  <th>Especialidad</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {speakers.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                    <td>{s.institucion || "—"}</td>
                    <td>{s.especialidad || "—"}</td>
                    <td style={{ fontSize: 13 }}>{s.correo || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Registrar Conferencista Externo">
        <form onSubmit={handleSubmit}>
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
            <label>Institución o Empresa *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.institucion}
              onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
              placeholder="Ej. Universidad de Cambridge / Google Research"
            />
          </div>
          <div className="form-group">
            <label>Especialidad / Área de Conocimiento</label>
            <input
              type="text"
              className="form-control"
              value={formData.especialidad}
              onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
              placeholder="Ej. Inteligencia Artificial, Ciberseguridad"
            />
          </div>
          <div className="form-group">
            <label>Correo Electrónico de Contacto</label>
            <input
              type="email"
              className="form-control"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
