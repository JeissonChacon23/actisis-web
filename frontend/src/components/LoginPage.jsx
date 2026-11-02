import { useState } from "react";
import { loginUser, sendResetPassword } from "../services/authService";
import { addToast } from "./Toast";
import * as Icons from "../helpers/Icons";

export function LoginPage({ onLoginSuccess, onGoPublic }) {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
            {/* Campo: Correo, Código o Documento */}
            <div className="form-group">
              <label>Correo Institucional, Código o Documento</label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Icons.User size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ej. nombre@ufps.edu.co o 1152200"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Campo: Contraseña con Toggle Ver/Ocultar */}
            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Icons.Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  tabIndex={-1}
                >
                  {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botón de Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                height: 44,
                fontSize: 14,
                fontWeight: 700,
                marginTop: 8,
                justifyContent: "center",
              }}
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

            {/* Enlaces de pie de login */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setShowForgot(true);
                  setError("");
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
              <button
                type="button"
                className="btn-link"
                onClick={onGoPublic}
                style={{ color: "var(--ufps-red)" }}
              >
                Ver actividades públicas ↗
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgot}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
              Ingresa tu correo institucional registrado para enviarte un enlace oficial de restablecimiento de contraseña.
            </p>
            {forgotMsg && (
              <div
                style={{
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent)",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              >
                {forgotMsg}
              </div>
            )}

            <div className="form-group">
              <label>Correo Electrónico Institucional</label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Icons.Mail size={18} />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ejemplo@ufps.edu.co"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                height: 44,
                fontSize: 14,
                fontWeight: 700,
                marginTop: 8,
                justifyContent: "center",
              }}
            >
              Enviar Enlace de Recuperación
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: "100%",
                height: 40,
                marginTop: 10,
                justifyContent: "center",
              }}
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
