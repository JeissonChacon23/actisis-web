import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { addToast } from "./Toast";

export function ProfileModule({ currentUser, onUserUpdate }) {
  const [telefono, setTelefono] = useState(currentUser?.telefono || "");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passError, setPassError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { telefono });
      onUserUpdate({ ...currentUser, telefono });
      addToast("Información de contacto actualizada.");
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
      setPassError("Contraseña actual incorrecta o error de autenticación.");
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      <div style={{ background: "var(--bg-card)", padding: 24, borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Información Institucional</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="detail-row"><div className="detail-label">Nombre Completo</div><div className="detail-value">{currentUser?.nombre} {currentUser?.apellido}</div></div>
          <div className="detail-row"><div className="detail-label">Correo Institucional</div><div className="detail-value">{currentUser?.correo || currentUser?.email}</div></div>
          <div className="detail-row"><div className="detail-label">Código Docente</div><div className="detail-value">{currentUser?.codigo || "—"}</div></div>
          <div className="detail-row"><div className="detail-label">Rol del Sistema</div><div className="detail-value"><span className="badge badge-blue">{currentUser?.rol?.toUpperCase()}</span></div></div>
        </div>

        <form onSubmit={handleUpdateProfile} style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div className="form-group" style={{ maxWidth: 300 }}>
            <label>Número de Teléfono / WhatsApp</label>
            <input
              type="text"
              className="form-control"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="3001234567"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile}>
            {savingProfile ? "Guardando..." : "Actualizar Teléfono"}
          </button>
        </form>
      </div>

      <div style={{ background: "var(--bg-card)", padding: 24, borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Seguridad de la Cuenta - Cambio de Contraseña</h3>
        {passError && <div className="login-error" style={{ marginBottom: 12 }}>{passError}</div>}
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Contraseña Actual</label>
            <input
              type="password"
              className="form-control"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Nueva Contraseña (mínimo 6 caracteres)</label>
            <input
              type="password"
              className="form-control"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={savingPass}>
            {savingPass ? "Actualizando..." : "Cambiar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
