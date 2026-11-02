import { useState, useEffect } from "react";
import * as Icons from "../helpers/Icons";
import { typeBadge, formatDate } from "../helpers/formatters";
import { getPublicActivities } from "../services/activityService";
import { Loading } from "./Loading";
import { Modal } from "./Modal";

export function PublicView({ onBackToLogin }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    getPublicActivities()
      .then((data) => setActivities(data))
      .catch((err) => console.error("Error al cargar actividades públicas:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activities.filter(
    (a) =>
      (a.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.tematica || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.lugar || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="fade-in">
      {/* Header Público con Identidad UFPS */}
      <div
        style={{
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/logoUFPS.png" alt="UFPS" style={{ height: 38 }} />
          <div style={{ width: 1, height: 28, background: "var(--border)" }} />
          <img src="/logo.png" alt="ACTISIS" style={{ height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
            ACTISIS Portal Público
          </span>
        </div>
        <button className="btn btn-secondary" onClick={onBackToLogin}>
          <Icons.Lock size={14} /> Iniciar Sesión Docente/Admin
        </button>
      </div>

      <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        <div className="public-hero">
          <h1>Actividades del Programa de Ingeniería de Sistemas</h1>
          <p>
            Cronograma público de seminarios, talleres, congresos y actividades académicas aprobadas de la UFPS.
          </p>
        </div>

        {/* Buscador */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ position: "relative", width: 440, maxWidth: "90vw" }}>
            <Icons.Search
              size={18}
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
              style={{ paddingLeft: 38 }}
              placeholder="Buscar por nombre, temática o lugar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Loading text="Cargando actividades..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Icons.Calendar size={48} />
            <p>No se encontraron actividades públicas disponibles en este momento.</p>
          </div>
        ) : (
          <div className="activity-cards">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="activity-card slide-up"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedActivity(a)}
              >
                <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`badge ${typeBadge(a.tipo)}`}>{a.tipo}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                    Semestre {a.semestre}
                  </span>
                </div>
                <h3>{a.nombre}</h3>
                <p className="ac-desc">{a.descripcion || "Sin descripción disponible."}</p>
                <div className="ac-meta">
                  <span>📅 {formatDate(a.fechaInicio)}</span>
                  <span>🕐 {a.horario || "Horario por definir"}</span>
                  <span>📍 {a.lugar || "Virtual"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalle Básico Público sin datos sensibles (RF008.2 y RF008.3) */}
      <Modal
        show={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        title="Información de la Actividad Académica"
      >
        {selectedActivity && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span className={`badge ${typeBadge(selectedActivity.tipo)}`}>{selectedActivity.tipo}</span>
              <span className="badge badge-blue">Semestre {selectedActivity.semestre}</span>
            </div>
            <h4 style={{ fontSize: 18, marginBottom: 14, color: "var(--text-primary)" }}>
              {selectedActivity.nombre}
            </h4>
            <div className="detail-row">
              <div className="detail-label">Temática</div>
              <div className="detail-value">{selectedActivity.tematica || "General"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Fecha</div>
              <div className="detail-value">
                {formatDate(selectedActivity.fechaInicio)}
                {selectedActivity.fechaFin ? ` al ${formatDate(selectedActivity.fechaFin)}` : ""}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Horario</div>
              <div className="detail-value">{selectedActivity.horario || "Por definir"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Lugar / Modalidad</div>
              <div className="detail-value">{selectedActivity.lugar || "Virtual"}</div>
            </div>
            {selectedActivity.conferencistaNombre && (
              <div className="detail-row">
                <div className="detail-label">Invitado Especial</div>
                <div className="detail-value">{selectedActivity.conferencistaNombre}</div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label">Descripción</div>
              <div className="detail-value">{selectedActivity.descripcion || "Sin descripción."}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
