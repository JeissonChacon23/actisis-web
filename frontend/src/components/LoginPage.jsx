import { useState } from "react";
import { loginUser, sendResetPassword } from "../services/authService";
import { addToast } from "./Toast";

export function LoginPage({ onLoginSuccess, onGoPublic }) {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await loginUser({ identificador, password });
      addToast(`¡Bienvenido(a), ${user.nombre || user.email}!`);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg("Por favor, ingresa tu correo institucional.");
      return;
    }
    try {
      await sendResetPassword(forgotEmail.trim());
      setForgotMsg("Se ha enviado un enlace de recuperación a tu correo. Revisa tu bandeja de entrada.");
    } catch (err) {
      setForgotMsg(err.message || "Error al enviar correo de recuperación.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card slide-up">
        <div className="login-logos">
          <img src="/logoUFPS.png" alt="UFPS" />
          <div className="login-divider" />
          <img src="/logo.png" alt="ACTISIS" />
        </div>
        <h1>ACTISIS</h1>
        <p className="subtitle">
          Plataforma de Gestión de Actividades<br />
          Programa de Ingeniería de Sistemas · UFPS
        </p>

        {error && <div className="login-error">{error}</div>}

        {!showForgot ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Correo, Código o Número de Documento</label>
              <input
                type="text"
                className="form-control"
                placeholder="ej. nombre@ufps.edu.co o 1152200"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 8 }}
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button
                type="button"
                className="btn-link"
                onClick={() => setShowForgot(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
              <button
                type="button"
                className="btn-link"
                onClick={onGoPublic}
              >
                Ver actividades públicas ↗
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgot}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
              Ingresa tu correo institucional registrado para recibir el enlace de restablecimiento de contraseña.
            </p>
            {forgotMsg && (
              <div style={{ background: "var(--accent-soft)", padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                {forgotMsg}
              </div>
            )}
            <div className="form-group">
              <label>Correo Electrónico Institucional</label>
              <input
                type="email"
                className="form-control"
                placeholder="ejemplo@ufps.edu.co"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 8 }}
            >
              Enviar Enlace de Recuperación
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", marginTop: 10 }}
              onClick={() => {
                setShowForgot(false);
                setForgotMsg("");
              }}
            >
              Volver al Inicio de Sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
