export const typeBadge = (t) => {
  const map = {
    "Académica": "badge-blue",
    "Autoevaluación": "badge-yellow",
    "Investigación": "badge-purple",
    "Extensión": "badge-teal",
    "Capacitación": "badge-green"
  };
  return map[t] || "badge-blue";
};

export const typeColor = (t) => {
  const map = {
    "Académica": "var(--accent)",
    "Autoevaluación": "var(--warning)",
    "Investigación": "var(--purple)",
    "Extensión": "var(--teal)",
    "Capacitación": "var(--success)"
  };
  return map[t] || "var(--accent)";
};

export const typeColorBg = (t) => {
  const map = {
    "Académica": "var(--accent-soft)",
    "Autoevaluación": "var(--warning-soft)",
    "Investigación": "var(--purple-soft)",
    "Extensión": "var(--teal-soft)",
    "Capacitación": "var(--success-soft)"
  };
  return map[t] || "var(--accent-soft)";
};

export const formatDate = (d) => {
  if (!d) return "—";
  const dateObj = d?.toDate ? d.toDate() : new Date(d);
  return dateObj.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export const toInputDate = (d) => {
  if (!d) return "";
  const dateObj = d?.toDate ? d.toDate() : new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toISOString().split("T")[0];
};
