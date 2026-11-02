import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { sanitizeInput } from "../helpers/validators";
import { addToast } from "./Toast";
import * as Icons from "../helpers/Icons";

export function ProfileModule({ currentUser, onUserUpdate }) {
  const [nombre, setNombre] = useState(currentUser?.nombre || "");
  const [apellido, setApellido] = useState(currentUser?.apellido || "");
  const [tipo, setTipo] = useState(currentUser?.tipo || "Planta");
  const [telefono, setTelefono] = useState(currentUser?.telefono || "");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updates = {
        nombre: sanitizeInput(nombre),
        apellido: sanitizeInput(apellido),
        tipo: sanitizeInput(tipo),
        telefono: sanitizeInput(telefono),
      };
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, updates);
      onUserUpdate({ ...currentUser, ...updates });
      addToast("Información personal, académica y de contacto actualizada (RF006.2 / RF006.3).");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    if (newPass.length < 6) {
      setPassError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSavingPass(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      addToast("Contraseña actualizada exitosamente.");
      setCurrentPass("");
      setNewPass("");
    } catch (err) {
      setPassError("La contraseña actual es incorrecta o hubo un error de autenticación.");
    } finally {
      setSavingPass(false);
    }
  };

  const initials = `${nombre?.[0] || currentUser?.nombre?.[0] || "U"}${apellido?.[0] || currentUser?.apellido?.[0] || ""}`.toUpperCase();

  return (
    <div className="fade-in" style={{ width: "100%" }}>
      {/* Tarjeta de Perfil Completa (Full Width) */}
      <div className="profile-card" style={{ width: "100%", boxShadow: "var(--shadow)" }}>
        {/* Banner Institucional con Avatar */}
        <div className="profile-banner">
          <div className="profile-avatar-lg">
            {initials}
          </div>
        </div>

        {/* Contenido del Perfil */}
        <div className="profile-content">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "var(--text-primary)" }}>
              {currentUser?.nombre} {currentUser?.apellido}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
              {currentUser?.rol === "admin" ? "Director de Programa / Administrador" : `Docente de ${currentUser?.tipo || "Planta"}`} · Código: {currentUser?.codigo || "—"}
            </p>
          </div>

          {/* Grid de Dos Columnas que ocupa todo el ancho disponible */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* Columna Izquierda: Información Institucional, Académica y Contacto (RF006.1 - RF006.3) */}
            <div
              style={{
                background: "var(--bg-input)",
                padding: 24,
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "var(--text-primary)" }}>
                Información Institucional (RF006.1)
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                <div className="detail-row">
                  <div className="detail-label">Documento</div>
                  <div className="detail-value">{currentUser?.documento || "—"}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Código UFPS</div>
                  <div className="detail-value">{currentUser?.codigo || "—"}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Correo</div>
                  <div className="detail-value">{currentUser?.correo || currentUser?.email}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Rol</div>
                  <div className="detail-value">
                    <span className="badge badge-blue">
                      {currentUser?.rol === "admin" ? "ADMINISTRADOR" : "DOCENTE"}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Estado</div>
                  <div className="detail-value">
                    <span className={`badge ${currentUser?.estado === "inactivo" ? "badge-red" : "badge-green"}`}>
                      {(currentUser?.estado || "activo").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulario de actualización personal, académica y de contacto (RF006.2 y RF006.3) */}
              <form onSubmit={handleUpdateProfile} style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "var(--text-primary)" }}>
                  Actualizar Datos Personales, Académicos y Contacto (RF006.2 / RF006.3)
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Nombres *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Apellidos *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label>Vinculación Académica</label>
                    <select
                      className="form-control"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="Planta">Planta</option>
                      <option value="Cátedra">Cátedra</option>
                      <option value="Ocasional">Ocasional</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label>Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      className="form-control"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej. 3001234567"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ height: 42, padding: "0 20px" }}
                  disabled={savingProfile}
                >
                  {savingProfile ? "Guardando..." : "Guardar Información de Perfil"}
                </button>
              </form>
            </div>

            {/* Columna Derecha: Seguridad y Cambio de Contraseña */}
            <div
              style={{
                background: "var(--bg-input)",
                padding: 24,
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "var(--text-primary)" }}>
                Seguridad de la Cuenta
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}>
                Para cambiar tu clave institucional, escribe tu contraseña actual y define una nueva que tenga al menos 6 caracteres.
              </p>

              {passError && (
                <div className="login-error" style={{ marginBottom: 16 }}>
                  {passError}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Contraseña Actual</label>
                  <div className="input-with-icon">
                    <span className="input-icon-left">
                      <Icons.Lock size={18} />
                    </span>
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      className="form-control"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Contraseña actual"
                    />
                    <button
                      type="button"
                      className="btn-toggle-pass"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      tabIndex={-1}
                      title={showCurrentPass ? "Ocultar" : "Mostrar"}
                    >
                      {showCurrentPass ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Nueva Contraseña (mínimo 6 caracteres)</label>
                  <div className="input-with-icon">
                    <span className="input-icon-left">
                      <Icons.Lock size={18} />
                    </span>
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="form-control"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Nueva contraseña"
                    />
                    <button
                      type="button"
                      className="btn-toggle-pass"
                      onClick={() => setShowNewPass(!showNewPass)}
                      tabIndex={-1}
                      title={showNewPass ? "Ocultar" : "Mostrar"}
                    >
                      {showNewPass ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ height: 42, padding: "0 22px", marginTop: 4 }}
                  disabled={savingPass}
                >
                  {savingPass ? "Actualizando..." : "Cambiar Contraseña"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
