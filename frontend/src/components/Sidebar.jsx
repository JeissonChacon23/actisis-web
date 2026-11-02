import * as Icons from "../helpers/Icons";

export function Sidebar({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  isOpen,
  onClose,
}) {
  const isAdmin = currentUser?.rol === "admin";

  const navSections = [
    {
      title: "Principal",
      items: [
        { id: "dashboard", label: "Dashboard", icon: Icons.Home },
        { id: "activities", label: "Actividades", icon: Icons.Activity },
        { id: "calendar", label: "Calendario", icon: Icons.Calendar },
      ],
    },
    {
      title: "Vinculación",
      items: [
        ...(isAdmin ? [{ id: "users", label: "Docentes", icon: Icons.Users }] : []),
        { id: "agreements", label: "Convenios", icon: Icons.Handshake },
        { id: "speakers", label: "Conferencistas", icon: Icons.Mic },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: "Acreditación CNA",
            items: [
              { id: "reports", label: "Reportes PDF", icon: Icons.BarChart },
              { id: "audit", label: "Auditoría CNA", icon: Icons.FileText },
            ],
          },
        ]
      : []),
    {
      title: "Cuenta y Soporte",
      items: [
        { id: "profile", label: "Mi Perfil", icon: Icons.User },
        { id: "help", label: "Ayuda y FAQs", icon: Icons.FileText },
      ],
    },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <img src="/logo.png" alt="ACTISIS" className="brand-logo" />
          <div className="brand-text">
            <h2>ACTISIS</h2>
            <span>Ing. Sistemas · UFPS</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {navSections.map((sec) => (
            <div key={sec.title} className="nav-section">
              <div className="nav-section-title">{sec.title}</div>
              {sec.items.map((it) => {
                const IconComponent = it.icon;
                const isActive = currentPage === it.id;
                return (
                  <button
                    key={it.id}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => {
                      onNavigate(it.id);
                      onClose();
                    }}
                  >
                    <IconComponent size={18} />
                    <span>{it.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {(currentUser?.nombre?.[0] || "U").toUpperCase()}
            {(currentUser?.apellido?.[0] || "").toUpperCase()}
          </div>
          <div className="user-info">
            <div className="name">
              {currentUser?.nombre} {currentUser?.apellido}
            </div>
            <div className="role">
              {currentUser?.rol === "admin" ? "Director / Admin" : "Docente"}
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={onLogout}
            title="Cerrar Sesión"
          >
            <Icons.LogOut size={18} />
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 99,
          }}
          onClick={onClose}
        />
      )}
    </>
  );
}
