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

  // Semestre 1: Enero a Junio / Julio (meses 1 a 7)
  // Semestre 2: Julio a Diciembre / Enero siguiente (meses 7 a 12)
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
 * Sanitizador de texto básico para prevenir XSS (SEC6/SEC7)
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeInput(str) {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "");
}
