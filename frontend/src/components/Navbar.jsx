import * as Icons from "../helpers/Icons";

export function Navbar({
  title,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onNewActivity,
}) {
  const currentDateStr = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
        <h1 className="header-title">{title}</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {onSearchChange && (
          <div style={{ position: "relative", minWidth: 220 }}>
            <Icons.Search
              size={16}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
              placeholder="Buscar actividad..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {onNewActivity && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onNewActivity}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Icons.Plus size={16} />
            <span>Nueva Actividad</span>
          </button>
        )}

        <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>
          {currentDateStr}
        </span>
        <img
          src="/logoUFPS.png"
          alt="UFPS"
          className="ufps-logo"
          style={{ height: 32, objectFit: "contain" }}
        />
      </div>
    </header>
  );
}
