import * as Icons from "../helpers/Icons";

export function Modal({ show, onClose, title, children, footer, maxWidth = "600px" }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal slide-up"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose} title="Cerrar">
            <Icons.X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
