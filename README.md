# Coordinator Manager

Panel web para administradores académicos. Consume la API de `student_registration` para visualizar métricas, carreras, cursos, estudiantes y profesores, e incluye un Studio IA que ejecuta el flujo del agente académico en streaming.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Zustand
- Recharts
- React Markdown
- Lucide React

## Requisitos

- Node.js 20 o superior recomendado
- npm
- Backend `student_registration` levantado en `http://127.0.0.1:8000`

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea el archivo de entorno desde el ejemplo:

```bash
cp .env.example .env
```

3. Ajusta la URL de la API si el backend corre en otro host o puerto:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/academic
```

El frontend deriva la URL del agente a partir de esa variable, reemplazando `/api/academic` por `/api/agent`.

## Ejecución local

```bash
npm run dev
```

Vite normalmente publica la app en:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compila TypeScript y genera dist/
npm run preview  # Sirve el build de producción localmente
```

## Rutas principales

- `/` redirige a `/admin/resumen`
- `/auth/sign-in` muestra el acceso local del panel
- `/admin/resumen` muestra métricas y gráficos académicos
- `/admin/profesores` lista docentes
- `/admin/estudiantes` lista estudiantes
- `/admin/carreras` muestra carreras y estadísticas
- `/admin/cursos` lista cursos
- `/admin/studio` ejecuta el flujo IA del agente académico

## Integración con la API

El cliente HTTP está en `src/data.ts`.

Endpoints académicos usados:

- `GET /api/academic/summary/`
- `GET /api/academic/career-stats/`
- `GET /api/academic/careers/?all=true`
- `GET /api/academic/teachers/?all=true`
- `GET /api/academic/students/?all=true`
- `GET /api/academic/courses/?all=true`
- `GET /api/academic/curriculum/?all=true`

Endpoint IA usado por Studio:

- `POST /api/agent/flow/stream/`

Ese endpoint responde con Server-Sent Events. El frontend interpreta eventos `progress`, `result` y `error` para construir la línea de tiempo del flujo.

## Estructura del proyecto

```text
src/
  App.tsx
  data.ts                         # Tipos y cliente de API
  drute/router.tsx                # Rutas de la aplicación
  modules/
    admin/
      content/                    # Páginas del panel
      layout/                     # Navbar, sidebar y layout base
      shared/                     # Tabla, estilos y helpers comunes
    auth/sign-in/                 # Pantalla de acceso
  store/use-admin-store.ts        # Estado global del panel
  style.css                       # Estilos globales y Tailwind
```

## Flujo recomendado de desarrollo

1. Levanta primero el backend:

```bash
cd ../student_registration
source .venv/bin/activate
python manage.py runserver
```

2. En otra terminal, levanta el frontend:

```bash
cd ../coordinator_manager
npm run dev
```

3. Abre `http://localhost:5173`.

## Verificación

Para validar que el frontend compila:

```bash
npm run build
```

Nota: el build puede mostrar una advertencia de chunk grande por dependencias visuales como Recharts y React Markdown. No impide generar `dist/`.

## Solución de problemas

- Si ves errores de CORS, confirma que el backend permita el origen de Vite en `CORS_ALLOWED_ORIGINS`.
- Si las tablas aparecen vacías, revisa que el backend tenga migraciones aplicadas y datos cargados.
- Si Studio no responde, revisa `GOOGLE_API_KEY` en el backend y prueba primero `POST /api/agent/flow/`.
- Si cambias `VITE_API_BASE_URL`, reinicia `npm run dev` para que Vite lea el nuevo `.env`.
