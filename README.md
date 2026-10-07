# 🚗 PrioriParking - API Backend

> **Sistema Web de Gestión y Asignación Prioritaria de Estacionamiento Universitario**  
> *Universidad Tecnológica del Perú (UTP) - Curso: Integrador II*

---

## 📋 Descripción del Proyecto

**PrioriParking** es una solución tecnológica diseñada para optimizar y automatizar el acceso al estacionamiento vehicular del campus universitario. El sistema sustituye el modelo tradicional por un **algoritmo de priorización objetiva** que evalúa:
- **Mérito Académico:** Promedio ponderado del periodo (\\(\ge 14.0\\)).
- **Asistencia:** Porcentaje de asistencia a clases (\\(\ge 80\%\\)).
- **Condición Financiera:** Estado de pago de pensiones (Al día / Moroso).

---

## 🛠️ Tecnologías Utilizadas

- **Entorno de Ejecución:** Node.js v18+
- **Framework Web:** Express.js
- **Base de Datos:** PostgreSQL (Cloud / Local)
- **Seguridad:** JSON Web Tokens (JWT), BCrypt.js (Hashing de contraseñas)
- **Control de Insumos:** Middleware CORS, Dotenv, CSV-Parser

---

## 📁 Estructura del Repositorio

```text
prioriparking-backend/
├── database/
│   └── schema.sql                  # Script DDL de creación de tablas y restricciones
├── src/
│   ├── config/
│   │   └── db.js                   # Conexión a PostgreSQL mediante Pool
│   ├── controllers/
│   │   └── authController.js       # Lógica de autenticación e inicio de sesión
│   ├── repositories/
│   │   └── EstudianteRepository.js # Consultas parametrizadas (Patrón Repository)
│   └── routes/
│       └── authRoutes.js           # Endpoints REST de autenticación
├── .gitignore                      # Exclusión de credenciales y node_modules
├── .env.example                    # Plantilla de variables de entorno
├── server.js                       # Punto de entrada principal del servidor Express
└── package.json                    # Dependencias y scripts del proyecto

## ⚙️ Ejecución de Procesos Bach (ETL)

El backend cuenta con scripts automatizados para la ingesta masiva de datos universitarios:

### Carga Masiva de Alumnos y Cursos (ETL):
Asegúrate de tener los archivos `alumnos_matriculados_300.csv` y `secciones_horarios_300.csv` en la raíz y ejecuta:

```bash
node src/services/etlService.js

### 2. 🔌 Catálogo de Endpoints REST (Para probar en Postman / cURL)

Agrega una tabla simple con las rutas principales del servidor para que sepan a qué URLs hacer peticiones:

```markdown
## 🌐 Endpoints Principales de la API

| Método | Endpoint | Descripción | Requiere JWT |
| :--- | :--- | :--- | :---: |
| **POST** | `/api/auth/login` | Autenticación de usuario y generación de Token JWT | ❌ No |
| **GET** | `/api/estudiantes/prioritarios` | Listado de alumnos aptos ordenados por mérito académico | ✅ Sí |
| **POST** | `/api/reservas` | Solicitud y asignación de plaza de estacionamiento | ✅ Sí |
