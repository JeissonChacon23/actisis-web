import * as Icons from "../helpers/Icons";
import { ACTIVITY_TYPES } from "../helpers/constants";
import { typeBadge, typeColor, formatDate } from "../helpers/formatters";

export function Dashboard({ activities = [], userCount = 0, agreementCount = 0, speakerCount = 0, user, onNavigate }) {
  const typeCount = {};
  ACTIVITY_TYPES.forEach((t) => {
    typeCount[t] = 0;
  });
  activities.forEach((a) => {
    if (typeCount[a.tipo] !== undefined) {
      typeCount[a.tipo] += 1;
    }
  });

  const upcoming = [...activities]
    .filter((a) => new Date(a.fechaInicio) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
    .slice(0, 5);

  const pendingApprovals = activities.filter((a) => a.estado === "pendiente");

  return (
    <div className="fade-in">
      {/* Alerta de Actividades Pendientes para el Admin */}
      {user?.rol === "admin" && pendingApprovals.length > 0 && (
        <div
          style={{
            background: "var(--warning-soft)",
            border: "1px solid var(--warning)",
            padding: "12px 18px",
            borderRadius: "var(--radius)",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--warning)" }}>
              Hay {pendingApprovals.length} actividad(es) pendiente(s) de revisión y aprobación.
            </span>
          </div>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onNavigate("activities")}
          >
            Revisar Actividades
          </button>
        </div>
      )}

      {/* Tarjetas de Estadísticas Principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--accent-soft)" }}>
            <Icons.Activity size={20} color="var(--accent)" />
          </div>
          <div className="value">{activities.length}</div>
          <div className="label">Total Actividades</div>
        </div>

        {user?.rol === "admin" && (
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--purple-soft)" }}>
              <Icons.Users size={20} color="var(--purple)" />
            </div>
            <div className="value">{userCount}</div>
            <div className="label">Docentes Registrados</div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--teal-soft)" }}>
            <Icons.Handshake size={20} color="var(--teal)" />
          </div>
          <div className="value">{agreementCount}</div>
          <div className="label">Convenios Institucionales</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--success-soft)" }}>
            <Icons.Mic size={20} color="var(--success)" />
          </div>
          <div className="value">{speakerCount}</div>
          <div className="label">Conferencistas Externos</div>
        </div>
      </div>

      {/* Gráficas y Próximas Actividades */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="chart-container">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Distribución de Actividades por Tipo
          </h3>
          <div className="chart-bar-group">
            {ACTIVITY_TYPES.map((t) => {
              const count = typeCount[t] || 0;
              const max = Math.max(...Object.values(typeCount), 1);
              return (
                <div key={t} className="chart-bar-wrapper">
                  <div className="chart-bar-value">{count}</div>
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(count / max) * 150}px`,
                      background: typeColor(t),
                    }}
                  />
                  <div className="chart-bar-label">{t.slice(0, 4)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="table-container" style={{ maxHeight: 320, display: "flex", flexDirection: "column" }}>
          <div className="table-header" style={{ flexShrink: 0 }}>
            <h3>Próximos Eventos</h3>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <p>No hay eventos próximos en el calendario.</p>
            </div>
          ) : (
            <div className="table-scroll" style={{ flex: 1, overflow: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.nombre}
                      </td>
                      <td style={{ fontSize: 12 }}>{formatDate(a.fechaInicio)}</td>
                      <td>
                        <span className={`badge ${typeBadge(a.tipo)}`}>{a.tipo}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
