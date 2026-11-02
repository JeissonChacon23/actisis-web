import * as Icons from "../helpers/Icons";

export function Navbar({
  title,
  currentPage,
  onNavigate,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onOpenHelp,
}) {
  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          className="mobile-toggle"
          onClick={onToggleSidebar}
          title="Menú"
        >
          <Icons.Menu size={22} />
        </button>

        {/* Breadcrumb de orientación + Título de sección (USW09) */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11.5,
              color: "var(--text-muted)",
              marginBottom: 2,
            }}
          >
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("dashboard")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--ufps-red)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 11.5,
                fontFamily: "var(--font-body)",
              }}
            >
              Inicio
            </button>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              {title}
            </span>
          </div>
          <h1 className="header-title" style={{ fontSize: 19, lineHeight: 1.15 }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Buscador Global accesible desde todas las páginas (USW21 / USW24) + Botón de Ayuda / FAQs (USW27) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onSearchChange && (
          <div
            className="input-with-icon"
            style={{ width: 260, position: "relative" }}
          >
            <span
              className="input-icon-left"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              <Icons.Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              style={{
                paddingLeft: 38,
                paddingRight: 12,
                height: 38,
                fontSize: 13,
                borderRadius: 8,
                margin: 0,
              }}
              placeholder="Buscar actividad en todo el sitio..."
              value={searchQuery || ""}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentPage !== "activities" && onNavigate && e.target.value.trim() !== "") {
                  onNavigate("activities");
                }
              }}
            />
          </div>
        )}

        {onOpenHelp && (
          <button
            type="button"
            className={`btn btn-sm ${currentPage === "help" ? "btn-primary" : "btn-secondary"}`}
            style={{ height: 38, padding: "0 12px" }}
            onClick={onOpenHelp}
            title="Centro de Ayuda y Preguntas Frecuentes (USW27)"
          >
            <span>? Ayuda / FAQs</span>
          </button>
        )}
      </div>
    </header>
  );
}
