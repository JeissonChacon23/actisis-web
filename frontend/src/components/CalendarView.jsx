import { useState } from "react";
import * as Icons from "../helpers/Icons";
import { MONTHS, DAYS_NAMES } from "../helpers/constants";
import { typeBadge, typeColor, typeColorBg, formatDate, toInputDate } from "../helpers/formatters";
import { Modal } from "./Modal";

export function CalendarView({ activities = [] }) {
  const [cur, setCur] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState("month"); // 'month' | 'week' | 'day'
  const [viewing, setViewing] = useState(null);

  const y = cur.getFullYear();
  const m = cur.getMonth();

  // Días para la vista mensual
  const start = new Date(y, m, 1);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(y, m + 1, 0);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days = [];
  const d = new Date(start);
  while (d <= end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  // Días para la vista semanal (RF009.3 / RF009.4)
  const weekStart = new Date(cur);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const wd = new Date(weekStart);
    wd.setDate(weekStart.getDate() + i);
    weekDays.push(wd);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const getEventsForDate = (date) => {
    const ds = date.toISOString().split("T")[0];
    return activities.filter((a) => {
      const fi = toInputDate(a.fechaInicio);
      const ff = toInputDate(a.fechaFin || a.fechaInicio);
      return ds >= fi && ds <= ff;
    });
  };

  const handlePrev = () => {
    if (calendarMode === "month") setCur(new Date(y, m - 1, 1));
    else if (calendarMode === "week") {
      const nw = new Date(cur);
      nw.setDate(nw.getDate() - 7);
      setCur(nw);
    } else {
      const nd = new Date(cur);
      nd.setDate(nd.getDate() - 1);
      setCur(nd);
    }
  };

  const handleNext = () => {
    if (calendarMode === "month") setCur(new Date(y, m + 1, 1));
    else if (calendarMode === "week") {
      const nw = new Date(cur);
      nw.setDate(nw.getDate() + 7);
      setCur(nw);
    } else {
      const nd = new Date(cur);
      nd.setDate(nd.getDate() + 1);
      setCur(nd);
    }
  };

  const getTitleLabel = () => {
    if (calendarMode === "day") {
      return `${cur.getDate()} de ${MONTHS[m]} ${y}`;
    }
    if (calendarMode === "week") {
      const first = weekDays[0];
      const last = weekDays[6];
      return `${first.getDate()} ${MONTHS[first.getMonth()].slice(0, 3)} – ${last.getDate()} ${MONTHS[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`;
    }
    return `${MONTHS[m]} ${y}`;
  };

  return (
    <div className="fade-in">
      {/* Barra de control del Calendario */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-secondary btn-icon" onClick={handlePrev} title="Anterior">
            <Icons.ChevL size={18} />
          </button>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, minWidth: 230, textAlign: "center" }}>
            {getTitleLabel()}
          </h2>
          <button className="btn btn-secondary btn-icon" onClick={handleNext} title="Siguiente">
            <Icons.ChevR size={18} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="tab-group" style={{ display: "flex", background: "var(--bg-input)", padding: 4, borderRadius: "var(--radius)", gap: 4 }}>
            <button
              className={`btn btn-sm ${calendarMode === "month" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setCalendarMode("month")}
            >
              Mensual
            </button>
            <button
              className={`btn btn-sm ${calendarMode === "week" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setCalendarMode("week")}
            >
              Semanal
            </button>
            <button
              className={`btn btn-sm ${calendarMode === "day" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setCalendarMode("day")}
            >
              Diaria
            </button>
          </div>
          <button className="btn btn-secondary" onClick={() => setCur(new Date())}>
            Hoy
          </button>
        </div>
      </div>

      {/* Vista Mensual */}
      {calendarMode === "month" && (
        <div className="calendar-grid">
          {DAYS_NAMES.map((d) => (
            <div key={d} className="cal-header-cell">
              {d}
            </div>
          ))}
          {days.map((day, i) => {
            const ds = day.toISOString().split("T")[0];
            const ev = getEventsForDate(day);
            const isOtherMonth = day.getMonth() !== m;
            return (
              <div
                key={i}
                className={`cal-cell ${isOtherMonth ? "other-month" : ""} ${ds === todayStr ? "today" : ""}`}
                onClick={() => {
                  setCur(day);
                  if (ev.length > 0) setViewing(ev[0]);
                }}
              >
                <div className="cal-day-num">{day.getDate()}</div>
                <div className="cal-events-container">
                  {ev.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="cal-event"
                      style={{ background: typeColorBg(e.tipo), color: typeColor(e.tipo) }}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setViewing(e);
                      }}
                      title={e.nombre}
                    >
                      {e.nombre}
                    </div>
                  ))}
                  {ev.length > 3 && (
                    <div className="cal-event-more">+{ev.length - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista Semanal (RF009.3 / RF009.4) */}
      {calendarMode === "week" && (
        <div className="calendar-grid">
          {weekDays.map((wd, i) => (
            <div key={i} className="cal-header-cell">
              {DAYS_NAMES[wd.getDay()]} {wd.getDate()}
            </div>
          ))}
          {weekDays.map((day, i) => {
            const ds = day.toISOString().split("T")[0];
            const ev = getEventsForDate(day);
            return (
              <div
                key={i}
                className={`cal-cell ${ds === todayStr ? "today" : ""}`}
                style={{ minHeight: 240, height: "auto" }}
                onClick={() => {
                  setCur(day);
                  if (ev.length > 0) setViewing(ev[0]);
                }}
              >
                <div className="cal-day-num">{day.getDate()}</div>
                <div className="cal-events-container">
                  {ev.length === 0 ? (
                    <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 2px", display: "block" }}>
                      Sin eventos
                    </span>
                  ) : (
                    ev.map((e) => (
                      <div
                        key={e.id}
                        className="cal-event"
                        style={{
                          background: typeColorBg(e.tipo),
                          color: typeColor(e.tipo),
                          padding: "6px 8px",
                          marginBottom: 4,
                          whiteSpace: "normal",
                        }}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setViewing(e);
                        }}
                        title={e.nombre}
                      >
                        <div style={{ fontWeight: 700 }}>{e.nombre}</div>
                        {e.horario && <div style={{ fontSize: 10, opacity: 0.85 }}>⏰ {e.horario}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista Diaria */}
      {calendarMode === "day" && (
        <div style={{ background: "var(--bg-card)", padding: 24, borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>
            Actividades programadas para el {cur.getDate()} de {MONTHS[m]} de {y}:
          </h3>
          {getEventsForDate(cur).length === 0 ? (
            <div className="empty-state">
              <Icons.Calendar size={40} />
              <p>No hay actividades registradas para esta fecha.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {getEventsForDate(cur).map((e) => (
                <div
                  key={e.id}
                  style={{
                    padding: 16,
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    borderLeft: `4px solid ${typeColor(e.tipo)}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    background: "var(--bg-secondary)",
                  }}
                  onClick={() => setViewing(e)}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{e.nombre}</h4>
                    <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: 13 }}>
                      {e.horario ? `⏰ ${e.horario} · ` : ""}📍 {e.lugar || "Por definir"} · Resp: {e.docenteNombre}
                    </p>
                  </div>
                  <span className={`badge ${typeBadge(e.tipo)}`}>{e.tipo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Detalle de Actividad (RF009.5 / RF009.6) */}
      <Modal show={!!viewing} onClose={() => setViewing(null)} title="Detalle de la Actividad">
        {viewing && (
          <div>
            {[
              ["Nombre", viewing.nombre],
              ["Fechas", `${formatDate(viewing.fechaInicio)} – ${formatDate(viewing.fechaFin)}`],
              ["Horario", viewing.horario || "No especificado"],
              ["Tipo", <span className={`badge ${typeBadge(viewing.tipo)}`}>{viewing.tipo}</span>],
              [
                "Estado",
                <span
                  className={`badge ${
                    viewing.estado === "aprobada"
                      ? "badge-green"
                      : viewing.estado === "pendiente"
                      ? "badge-yellow"
                      : "badge-red"
                  }`}
                >
                  {(viewing.estado || "aprobada").toUpperCase()}
                </span>,
              ],
              ["Semestre", viewing.semestre],
              ["Temática", viewing.tematica],
              ["Descripción", viewing.descripcion],
              ["Lugar", viewing.lugar],
              ["Movilidad", viewing.movilidad || "N/A"],
              ["Conferencista", viewing.conferencistaNombre || "—"],
              ["Convenio Vinculado", viewing.convenioNumero || "—"],
              ["Docente Responsable", viewing.docenteNombre],
              ["Descripción Evidencia", viewing.descripcionEvidencia || "—"],
              [
                "Evidencia (Drive)",
                viewing.driveFolderLink ? (
                  <a
                    href={viewing.driveFolderLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--ufps-red)", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Abrir carpeta en Google Drive ↗
                  </a>
                ) : (
                  "Sin enlace de evidencia registrado"
                ),
              ],
            ].map(([l, v]) => (
              <div key={l} className="detail-row">
                <div className="detail-label">{l}</div>
                <div className="detail-value">{v || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
