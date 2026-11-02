import { useState, useEffect, useCallback } from "react";
import { subscribeToAuth, logoutUser } from "./services/authService";
import { getActivities, createActivity, updateActivity } from "./services/activityService";
import { getDocentes } from "./services/userService";
import { getAgreements } from "./services/agreementService";
import { getSpeakers } from "./services/speakerService";

// Componentes
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { ActivitiesModule } from "./components/ActivitiesModule";
import { CalendarView } from "./components/CalendarView";
import { UsersModule } from "./components/UsersModule";
import { AgreementsModule } from "./components/AgreementsModule";
import { SpeakersModule } from "./components/SpeakersModule";
import { ReportsModule } from "./components/ReportsModule";
import { AuditModule } from "./components/AuditModule";
import { HelpModule } from "./components/HelpModule";
import { ProfileModule } from "./components/ProfileModule";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { PublicView } from "./components/PublicView";
import { ActivityFormModal } from "./components/ActivityFormModal";
import { ToastContainer, addToast } from "./components/Toast";
import { Loading } from "./components/Loading";

import "./index.css";

export default function App() {
  const [view, setView] = useState("loading"); // 'loading' | 'login' | 'register' | 'public' | 'app'
  const [inviteToken, setInviteToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [prevPage, setPrevPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Datos globales
  const [activities, setActivities] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [speakers, setSpeakers] = useState([]);

  // Modal de Actividad
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const navigateTo = (targetPage) => {
    if (targetPage !== page) {
      setPrevPage(page);
      setPage(targetPage);
    }
  };

  // Detectar si la ruta actual corresponde a un enlace de invitación (/registro/:token - RF001.2)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/registro/")) {
      const tokenPart = path.replace("/registro/", "").trim();
      if (tokenPart) {
        setInviteToken(tokenPart);
        setView("register");
        return;
      }
    }

    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        setCurrentUser(user);
        setView("app");
      } else {
        setCurrentUser(null);
        setView((prev) => (prev === "public" || prev === "register" ? prev : "login"));
      }
    });
    return () => unsubscribe();
  }, []);

  // Carga de datos del sistema
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const actPromise = getActivities(currentUser);
      const docPromise = currentUser.rol === "admin" ? getDocentes() : Promise.resolve([]);
      const agrPromise = getAgreements();
      const spkPromise = getSpeakers();

      const [actData, docData, agrData, spkData] = await Promise.all([
        actPromise,
        docPromise,
        agrPromise,
        spkPromise,
      ]);

      setActivities(actData);
      setDocentes(docData);
      setAgreements(agrData);
      setSpeakers(spkData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      addToast("Error al sincronizar con Firebase: " + err.message, "error");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // Manejadores
  const handleLogout = async () => {
    await logoutUser(currentUser);
    setView("login");
    setPage("dashboard");
    addToast("Sesión finalizada correctamente.");
  };

  const handleSaveActivity = async (formData) => {
    if (editingActivity) {
      await updateActivity(editingActivity.id, formData, currentUser);
      addToast("Actividad actualizada exitosamente.");
    } else {
      await createActivity(formData, currentUser);
      addToast(
        currentUser.rol === "admin"
          ? "Actividad registrada y aprobada."
          : "Actividad registrada. Pendiente de aprobación por la Dirección."
      );
    }
    await loadData();
  };

  const handleOpenNew = () => {
    setEditingActivity(null);
    setShowActivityModal(true);
  };

  const handleOpenEdit = (act) => {
    setEditingActivity(act);
    setShowActivityModal(true);
  };

  if (view === "loading") {
    return (
      <div className="login-page">
        <div className="login-bg" />
        <Loading text="Conectando con ACTISIS & Firebase..." />
      </div>
    );
  }

  if (view === "register" && inviteToken) {
    return (
      <>
        <RegisterPage
          token={inviteToken}
          onRegisterComplete={(u) => {
            window.history.pushState({}, "", "/");
            setInviteToken(null);
            setCurrentUser(u);
            setView("app");
            setPage("dashboard");
          }}
          onBackToLogin={() => {
            window.history.pushState({}, "", "/");
            setInviteToken(null);
            setView("login");
          }}
        />
        <ToastContainer />
      </>
    );
  }

  if (view === "public") {
    return (
      <>
        <PublicView onBackToLogin={() => setView("login")} />
        <ToastContainer />
      </>
    );
  }

  if (view === "login") {
    return (
      <>
        <LoginPage
          onLoginSuccess={(u) => {
            setCurrentUser(u);
            setView("app");
            setPage("dashboard");
          }}
          onGoPublic={() => setView("public")}
        />
        <ToastContainer />
      </>
    );
  }

  const pageTitles = {
    dashboard: "Dashboard General",
    activities: "Gestión de Actividades",
    calendar: "Calendario de Actividades",
    users: "Directorio de Docentes",
    agreements: "Convenios Institucionales",
    speakers: "Conferencistas y Participantes Externos",
    reports: "Generación de Reportes y Estadísticas CNA",
    audit: "Bitácora de Auditoría CNA",
    profile: "Mi Perfil Institucional",
    help: "Centro de Ayuda y Preguntas Frecuentes (FAQs)",
  };

  return (
    <>
      <ToastContainer />
      <div className="app">
        <Sidebar
          currentPage={page}
          onNavigate={navigateTo}
          currentUser={currentUser}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main">
          <Navbar
            title={pageTitles[page] || "ACTISIS"}
            currentPage={page}
            onNavigate={navigateTo}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenHelp={() => navigateTo("help")}
          />

          <div className="content">
            {page === "dashboard" && (
              <Dashboard
                activities={activities}
                userCount={docentes.length}
                agreementCount={agreements.length}
                speakerCount={speakers.length}
                user={currentUser}
                onNavigate={navigateTo}
              />
            )}

            {page === "activities" && (
              <ActivitiesModule
                activities={activities}
                user={currentUser}
                onRefresh={loadData}
                onNewActivity={handleOpenNew}
                onEditActivity={handleOpenEdit}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery("")}
              />
            )}

            {page === "calendar" && <CalendarView activities={activities} />}

            {page === "users" && currentUser?.rol === "admin" && (
              <UsersModule
                docentes={docentes}
                currentUser={currentUser}
                onRefresh={loadData}
              />
            )}

            {page === "agreements" && (
              <AgreementsModule
                agreements={agreements}
                currentUser={currentUser}
                onRefresh={loadData}
              />
            )}

            {page === "speakers" && (
              <SpeakersModule
                speakers={speakers}
                currentUser={currentUser}
                onRefresh={loadData}
              />
            )}

            {page === "reports" && currentUser?.rol === "admin" && (
              <ReportsModule activities={activities} user={currentUser} />
            )}

            {page === "audit" && currentUser?.rol === "admin" && (
              <AuditModule />
            )}

            {page === "profile" && (
              <ProfileModule
                currentUser={currentUser}
                onUserUpdate={(u) => setCurrentUser(u)}
              />
            )}

            {page === "help" && (
              <HelpModule
                previousPage={pageTitles[prevPage] || "Dashboard General"}
                onBack={() => setPage(prevPage || "dashboard")}
              />
            )}
          </div>
        </main>
      </div>

      <ActivityFormModal
        show={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSave={handleSaveActivity}
        activity={editingActivity}
        user={currentUser}
        docentes={docentes}
        speakers={speakers}
        agreements={agreements}
      />
    </>
  );
}
