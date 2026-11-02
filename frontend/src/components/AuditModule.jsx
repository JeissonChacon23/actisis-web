import { useState, useEffect } from "react";
import * as Icons from "../helpers/Icons";
import { getAuditLogs } from "../services/auditService";
import { Loading } from "./Loading";

export function AuditModule() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = () => {
    setLoading(true);
    getAuditLogs(150)
      .then((data) => setLogs(data))
      .catch((err) => console.error("Error al consultar bitácora:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (l.accion || "").toLowerCase().includes(q) ||
      (l.entidad || "").toLowerCase().includes(q) ||
      (l.usuarioNombre || "").toLowerCase().includes(q) ||
      (l.detalles || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fade-in">
      <div className="filters-bar" style={{ justifyContent: "space-between" }}>
        <div style={{ position: "relative", minWidth: 280, flex: 1, maxWidth: 440 }}>
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
            placeholder="Filtrar por acción, entidad, usuario o detalle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-secondary" onClick={fetchLogs}>
          Actualizar Bitácora
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Bitácora Inmutable de Trazabilidad CNA (RNF006 / HU-13)</h3>
          <span className="badge badge-blue">{filtered.length} eventos registrados</span>
        </div>

        {loading ? (
          <Loading text="Consultando registros de auditoría..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Icons.FileText size={48} />
            <p>No se encontraron eventos en la bitácora de auditoría.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha / Hora (ISO)</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Detalles de la Operación</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, whiteSpace: "nowrap", color: "var(--text-muted)" }}>
                      {log.fechaISO ? new Date(log.fechaISO).toLocaleString("es-CO") : "—"}
                    </td>
                    <td>
                      <span className="badge badge-red">{log.accion}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.entidad}</td>
                    <td>{log.usuarioNombre || log.usuarioCorreo || "Sistema"}</td>
                    <td>
                      <span className="badge badge-blue">{(log.rol || "usuario").toUpperCase()}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>{log.detalles}</td>
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
