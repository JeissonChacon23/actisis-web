# ACTISIS Web - Plataforma de Gestión de Actividades

Plataforma web para el seguimiento, registro, visualización y evaluación de actividades académicas y administrativas del **Programa de Ingeniería de Sistemas** de la **Universidad Francisco de Paula Santander (UFPS)**, diseñada para soportar los procesos de autoevaluación y acreditación de alta calidad institucional conforme al Acuerdo 02-2020 del CNA.

---

## 🏛️ Identidad y Arquitectura

* **Cliente:** Programa de Ingeniería de Sistemas — UFPS (Directora: Ing. Judith del Pilar Rodríguez Tenjo).
* **Frontend:** React 18 + Vite (Tema claro institucional con acentos en rojo UFPS `#aa1916`).
* **Backend y Base de Datos:** Google Firebase (Cloud Firestore, Firebase Authentication, Firebase Hosting y Firebase Analytics).
* **Almacenamiento de Evidencias:** Integración con URLs de Google Drive (AD-CCA-07_03).
* **Reportes:** Generación de informes en PDF orientados a pares evaluadores del CNA.

---

## 🚀 Requerimientos y Correcciones Integradas

* **AD-CCA-07_01 (Vista Calendario):** Visualización interactiva mensual, semanal y diaria de eventos.
* **AD-CCA-07_02 (Identidad Visual):** Tema claro con contrastes en rojo institucional UFPS.
* **AD-CCA-07_03 (Evidencias en Drive):** Enlaces directos a carpetas y archivos en Google Drive para respaldo documental.
* **Regla AC08:** Re-evaluación automática (vuelta a estado `pendiente`) ante cualquier edición realizada por un docente sobre una actividad aprobada.
* **Regla N18:** Validación estricta entre fechas y periodo semestral seleccionado.

---

## 📁 Estructura del Repositorio

```text
actisis-web/
├── frontend/                     # Aplicación cliente React + Vite
│   ├── src/
│   │   ├── config/               # Configuración de Firebase SDK
│   │   ├── components/           # Componentes UI (Calendario, Tablas, Modales)
│   │   ├── services/             # Servicios de Firestore, Auth y Reportes
│   │   ├── helpers/              # Utilidades, formateadores y validadores
│   │   └── index.css             # Estilos UFPS
├── firestore.rules               # Reglas de seguridad de Cloud Firestore
├── firestore.indexes.json        # Índices compuestos de base de datos
├── firebase.json                 # Configuración de despliegue en Firebase Hosting
└── .firebaserc                   # Identificador del proyecto Firebase
```

---

## 🛠️ Flujo de Trabajo Git (Conventional Commits)

Este proyecto sigue el estándar de **Conventional Commits**:
* `feat:` Nueva característica funcional.
* `fix:` Corrección de errores o ajustes a reglas de negocio.
* `chore:` Configuración de herramientas, dependencias o mantenimiento.
* `refactor:` Reestructuración de código sin alterar el comportamiento externo.
* `style:` Ajustes estéticos, de formato o CSS.

La rama activa de desarrollo es `development`.
