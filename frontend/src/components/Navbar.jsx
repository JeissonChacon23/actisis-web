import * as Icons from "../helpers/Icons";

export function Navbar({
  title,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
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
        <h1 className="header-title">{title}</h1>
      </div>

      {onSearchChange && (
        <div style={{ display: "flex", alignItems: "center" }}>
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
              placeholder="Buscar actividad..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
