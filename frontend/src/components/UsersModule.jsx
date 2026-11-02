import * as Icons from "../helpers/Icons";
import { toggleUserStatus } from "../services/userService";
import { addToast } from "./Toast";

export function UsersModule({ docentes = [], currentUser, onRefresh }) {
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

  return (
    <div className="fade-in">
      <div className="table-container">
        <div className="table-header">
          <h3>Directorio de Docentes del Programa</h3>
        </div>
        {docentes.length === 0 ? (
          <div className="empty-state">
            <Icons.Users size={48} />
            <p>No hay docentes registrados en el sistema.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Código</th>
                  <th>Correo Institucional</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {docentes.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.nombre} {d.apellido}</td>
                    <td>{d.codigo || "—"}</td>
                    <td>{d.correo || d.email}</td>
                    <td><span className="badge badge-blue">{d.rol?.toUpperCase()}</span></td>
                    <td>
                      <span className={`badge ${d.estado === "inactivo" ? "badge-red" : "badge-green"}`}>
                        {d.estado || "activo"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {d.id !== currentUser?.uid && (
                        <button
                          className={`btn btn-sm ${d.estado === "inactivo" ? "btn-primary" : "btn-secondary"}`}
                          onClick={() => handleToggle(d.id, d.estado || "activo")}
                        >
                          {d.estado === "inactivo" ? "Activar" : "Suspender"}
                        </button>
                      )}
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
