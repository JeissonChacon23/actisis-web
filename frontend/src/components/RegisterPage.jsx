import { useState, useEffect } from "react";
import {
  validateInvitationToken,
  completeInvitationRegistration,
} from "../services/userService";
import { addToast } from "./Toast";

export function RegisterPage({ token, onRegisterComplete, onGoLogin, onBackToLogin }) {
  const handleBack = onGoLogin || onBackToLogin;
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    codigo: "",
    correo: "",
    telefono: "",
    tipo: "Planta",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    validateInvitationToken(token)
      .then((inv) => {
        setFormData((prev) => ({
          ...prev,
          correo: inv.correo || "",
          nombre: inv.nombreSugerido || "",
        }));
      })
      .catch((err) => setTokenError(err.message))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const profile = await completeInvitationRegistration(token, formData);
      addToast("¡Registro completado exitosamente!");
      if (onRegisterComplete) {
        onRegisterComplete(profile);
      } else if (handleBack) {
        handleBack();
      }
    } catch (err) {
      setError(err.message || "Error al completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card slide-up" style={{ maxWidth: 540 }}>
        <div className="login-logos">
          <img src="/logoUFPS.png" alt="UFPS" />
          <div className="login-divider" />
          <img src="/logo.png" alt="ACTISIS" />
        </div>
        <h1>Registro de Docente</h1>
        <p className="subtitle">
          Completa tu vinculación oficial en la plataforma ACTISIS · UFPS
        </p>

        {validating ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
            Verificando enlace de invitación...
          </p>
        ) : tokenError ? (
          <div>
            <div className="login-error">{tokenError}</div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleBack}
            >
              Ir al Inicio de Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>N° Documento (solo números) *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value.replace(/[^0-9]/g, "") })}
                />
              </div>
              <div className="form-group">
                <label>Código Institucional (solo números) *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/[^0-9]/g, "") })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Correo Institucional</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.correo}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Vinculación</label>
                <select
                  className="form-control"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  <option value="Planta">Planta</option>
                  <option value="Cátedra">Cátedra</option>
                  <option value="Ocasional">Ocasional</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contraseña (mín. 6) *</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña *</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", height: 44, justifyContent: "center", marginTop: 8 }}
              disabled={loading}
            >
              {loading ? "Completando registro..." : "Completar Registro"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
