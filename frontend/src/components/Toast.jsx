import { useState, useEffect } from "react";
import * as Icons from "../helpers/Icons";

let toastListeners = [];

export const addToast = (msg, type = "success") => {
  toastListeners.forEach((fn) =>
    fn({ id: Math.random().toString(36).slice(2, 8), msg, type })
  );
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fn = (t) => {
      setToasts((p) => [...p, t]);
      setTimeout(() => setToasts((p) => p.filter((x) => x.id !== t.id)), 3500);
    };
    toastListeners.push(fn);
    return () => {
      toastListeners = toastListeners.filter((x) => x !== fn);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} slide-up`}>
          {t.type === "success" ? <Icons.Check size={16} /> : <Icons.X size={16} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
