import { useState } from "react";
import * as Icons from "../helpers/Icons";

const FAQ_ITEMS = [
  {
    category: "Docentes",
    question: "¿Cómo me registro por primera vez en la plataforma ACTISIS?",
    answer:
      "El Director de Programa (Administrador) genera un enlace único de invitación con vigencia de 24 horas desde el módulo 'Docentes'. Al abrir ese enlace (/registro/:token), completa tu nombre, apellido, documento numérico, código UFPS, vinculación académica y contraseña de mínimo 6 caracteres. Tu cuenta quedará activa de inmediato.",
  },
  {
    category: "Docentes",
    question: "¿Cómo registro una nueva actividad académica y qué pasa con su estado?",
    answer:
      "Dirígete al módulo 'Actividades' y haz clic en '+ Nueva Actividad'. Completa el nombre, tipo, semestre (la fecha debe coincidir con el periodo del semestre seleccionado), lugar, convenio o conferencista vinculado y el enlace de la carpeta de evidencias en Google Drive. Si eres Docente, la actividad se guardará en estado 'Pendiente' hasta que la Dirección del Programa la apruebe.",
  },
  {
    category: "Docentes",
    question: "¿Qué ocurre si edito una actividad que ya estaba Aprobada? (Regla AC08)",
    answer:
      "Por trazabilidad de acreditación CNA (Regla de Negocio RB-08 / AC08), si un Docente modifica cualquier dato de una actividad que ya había sido 'Aprobada', su estado regresa automáticamente a 'Pendiente' para que la Dirección del Programa valide nuevamente los cambios realizados.",
  },
  {
    category: "Docentes",
    question: "¿Cómo adjunto las evidencias (asistencia, fotos, actas) de mi actividad? (AD-CCA-07_03)",
    answer:
      "Siguiendo el lineamiento institucional de la Dirección de Programa, sube tus soportes (listas de asistencia firmadas, fotografías, presentaciones y certificados) a una carpeta en Google Drive con permisos de lectura y pega el enlace URL (https://drive.google.com/...) en el campo 'Enlace a Carpeta de Evidencias' junto con su descripción.",
  },
  {
    category: "Administradores",
    question: "¿Cómo apruebo o rechazo actividades registradas por los docentes?",
    answer:
      "En el módulo 'Actividades', filtra por estado 'Pendiente'. En la columna de acciones de cada registro verás el botón verde (✓) para Aprobar inmediatamente o el botón rojo (✕) para Rechazar indicando un motivo obligatorio que el docente podrá consultar en el detalle de su actividad.",
  },
  {
    category: "Administradores",
    question: "¿Cómo genero los informes ejecutivos en PDF y reviso las estadísticas CNA?",
    answer:
      "Ingresa a 'Reportes PDF' en el menú lateral. Puedes filtrar por semestre académico, tipo de actividad, estado y rango de fechas (Desde / Hasta). En pantalla verás los indicadores porcentuales de cumplimiento, las 3 gráficas estadísticas (por tipo, semestre y movilidad), la vista previa de la tabla y el botón 'Exportar PDF' con membrete oficial UFPS.",
  },
  {
    category: "Administradores",
    question: "¿Cómo funciona la Bitácora Inmutable de Auditoría CNA? (RNF006)",
    answer:
      "Cada creación, edición, aprobación, rechazo, cambio de estado o inicio de sesión se registra automáticamente en la colección 'auditLogs' de Cloud Firestore. Los registros son inmutables (no pueden editarse ni borrarse) y pueden consultarse en tiempo real desde el módulo 'Auditoría CNA'.",
  },
  {
    category: "General",
    question: "¿Cómo funciona la Vista Calendario (Mensual, Semanal y Diaria)? (AD-CCA-07_01)",
    answer:
      "En el módulo 'Calendario' puedes alternar entre las vistas Mensual, Semanal y Diaria usando los botones de la esquina superior derecha. Cada evento muestra su horario y nombre codificado por color según su estado; al hacer clic sobre cualquier actividad se despliega una ventana emergente con todos sus detalles.",
  },
  {
    category: "General",
    question: "¿Por qué mi cuenta puede bloquearse temporalmente al iniciar sesión? (SEC8)",
    answer:
      "Por seguridad contra ataques de fuerza bruta, si ingresas una contraseña incorrecta 5 veces consecutivas, el sistema bloqueará temporalmente los intentos de acceso durante 60 segundos. Si olvidaste tu clave, utiliza la opción '¿Olvidaste tu contraseña?' en la pantalla de login.",
  },
];

export function HelpModule({ onBack, previousPage }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchCat = categoryFilter === "Todas" || item.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="fade-in" style={{ width: "100%" }}>
      {/* Barra superior con botón de retorno sin pérdida de contexto (USW27) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Centro de Ayuda, Guía Rápida y Preguntas Frecuentes (FAQs)
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            Documentación interactiva para Docentes y Dirección del Programa de Ingeniería de Sistemas · UFPS.
          </p>
        </div>

        {onBack && (
          <button className="btn btn-secondary" onClick={onBack}>
            ← Volver a {previousPage || "la vista anterior"}
          </button>
        )}
      </div>

      {/* Tarjetas de Guía Rápida por Flujo */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card red">
          <div className="stat-label">1. Registro de Actividades</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.5 }}>
            Verifica que la fecha coincida con el semestre académico (<strong>N18</strong>) y adjunta el enlace de tu carpeta en Google Drive (<strong>AD-CCA-07_03</strong>).
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">2. Validación y Aprobación</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.5 }}>
            Las actividades de docentes inician en <em>Pendiente</em>. Si editas una actividad ya aprobada, volverá a revisión (<strong>AC08</strong>).
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">3. Soporte Institucional</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.5 }}>
            Dirección del Programa de Ingeniería de Sistemas — Edificio Aula Sur, UFPS Cúcuta.<br />
            Correo: <strong>ingsistemas@ufps.edu.co</strong>
          </div>
        </div>
      </div>

      {/* Buscador y Filtro de Categorías de FAQs (USW28 / USW29) */}
      <div className="filters-bar" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ position: "relative", minWidth: 260, flex: 1, maxWidth: 460 }}>
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
            placeholder="Buscar en las preguntas frecuentes (ej. Drive, PDF, contraseña, calendario)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Todas", "Docentes", "Administradores", "General"].map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${categoryFilter === cat ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listado Acordeón de Preguntas Frecuentes (USW28 y USW29) */}
      <div className="table-container" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>
          Preguntas Frecuentes ({filteredFaqs.length})
        </h3>

        {filteredFaqs.length === 0 ? (
          <div className="empty-state">
            <Icons.Search size={40} />
            <p>No se encontraron preguntas que coincidan con "{search}".</p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => {
                setSearch("");
                setCategoryFilter("Todas");
              }}
            >
              Limpiar búsqueda y ver todas las FAQs
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.question}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    background: isOpen ? "var(--bg-secondary)" : "var(--bg-input)",
                    overflow: "hidden",
                    transition: "all 0.2s",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span
                        className={`badge ${
                          faq.category === "Administradores"
                            ? "badge-red"
                            : faq.category === "Docentes"
                            ? "badge-blue"
                            : "badge-green"
                        }`}
                      >
                        {faq.category}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                        {faq.question}
                      </span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ufps-red)" }}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 18px 16px 18px",
                        fontSize: 13.5,
                        lineHeight: 1.6,
                        color: "var(--text-secondary)",
                        borderTop: "1px solid var(--border)",
                        paddingTop: 12,
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

