/**
 * Validador de fechas contra el semestre académico (Corrección N18)
 * @param {string|Date} dateStr - Fecha de la actividad
 * @param {string} semester - Semestre en formato 'YYYY-S' (ej. '2025-1')
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDateInSemester(dateStr, semester) {
  if (!dateStr || !semester) {
    return { valid: false, error: "Fecha y semestre son requeridos." };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Formato de fecha no válido." };
  }

  const [yearStr, periodStr] = semester.split("-");
  const year = parseInt(yearStr, 10);
  const period = parseInt(periodStr, 10);

  const activityYear = date.getUTCFullYear();
  const activityMonth = date.getUTCMonth() + 1; // 1-12

  if (activityYear !== year) {
    return {
      valid: false,
      error: `La fecha (${activityYear}) no coincide con el año del semestre ${semester}.`
    };
  }

  // Semestre 1: Enero a Julio (meses 1 a 7)
  // Semestre 2: Junio a Diciembre (meses 6 a 12)
  if (period === 1 && activityMonth > 7) {
    return {
      valid: false,
      error: `La fecha seleccionada corresponde al segundo semestre, pero se eligió el semestre ${semester}.`
    };
  }

  if (period === 2 && activityMonth < 6) {
    return {
      valid: false,
      error: `La fecha seleccionada corresponde al primer semestre, pero se eligió el semestre ${semester}.`
    };
  }

  return { valid: true };
}

/**
 * Validador de enlace a Google Drive (AD-CCA-07_03)
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidDriveUrl(url) {
  if (!url || typeof url !== "string") return true; // Opcional si está vacío
  const trimmed = url.trim();
  if (trimmed === "") return true;
  return /drive\.google\.com|docs\.google\.com/i.test(trimmed);
}

/**
 * Detecta patrones de Inyección SQL o XSS malicioso (Corrección SEC6 y SEC7)
 * @param {string} str
 * @returns {boolean}
 */
export function containsMaliciousPayload(str) {
  if (!str || typeof str !== "string") return false;
  const sqlOrXssPattern =
    /('|\b)(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+|;\s*(DROP|DELETE|UPDATE|INSERT)\b|--\s*$|UNION\s+SELECT|<script\b|javascript:|onerror\s*=|onload\s*=/i;
  return sqlOrXssPattern.test(str.trim());
}

/**
 * Valida que un campo de texto no contenga inyecciones SQL o scripts XSS (SEC6 / SEC7)
 */
export function validateSafeText(str, fieldName = "campo") {
  if (!str || typeof str !== "string") return;
  if (containsMaliciousPayload(str)) {
    throw new Error(
      `Entrada bloqueada por seguridad en ${fieldName}: no se permiten expresiones SQL ni scripts ejecutables (SEC6/SEC7).`
    );
  }
}

/**
 * Valida que un campo numérico (documento, código, teléfono) no contenga caracteres especiales (Corrección CN2)
 */
export function validateNumericOnly(str, fieldName = "campo numérico") {
  if (!str || typeof str !== "string") return;
  const trimmed = str.trim();
  if (!trimmed) return;
  if (!/^[0-9+\-\s]+$/.test(trimmed)) {
    throw new Error(
      `El campo ${fieldName} solo permite números (no se admiten letras ni caracteres especiales como !@#$%^&*()).`
    );
  }
}

/**
 * Filtra en tiempo real caracteres no numéricos para inputs de documento/código/teléfono (CN2)
 */
export function filterDigitsOnly(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[^0-9]/g, "");
}

/**
 * Sanitizador de texto básico para prevenir XSS e inyecciones (SEC6/SEC7)
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeInput(str) {
  if (!str || typeof str !== "string") return str;
  if (containsMaliciousPayload(str)) {
    throw new Error(
      "Se detectaron caracteres o comandos no permitidos por seguridad (SQL/XSS)."
    );
  }
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();
}
