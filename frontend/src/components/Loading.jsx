import * as Icons from "../helpers/Icons";

export function Loading({ text = "Cargando..." }) {
  return (
    <div className="loading-center">
      <Icons.Loader size={32} />
      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
        {text}
      </span>
    </div>
  );
}
