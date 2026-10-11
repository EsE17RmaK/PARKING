-- backend/database/schema.sql
-- 1. Limpieza en cascada
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS zonas_estacionamiento CASCADE;
DROP TABLE IF EXISTS espacios_estacionamiento CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 2. Tabla USUARIOS (Autenticación y Roles)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    correo_institucional VARCHAR(100) UNIQUE NOT NULL CHECK (correo_institucional LIKE '%@utp.edu.pe'),
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    dni VARCHAR(15),
    celular VARCHAR(15),
    rol VARCHAR(20) DEFAULT 'ESTUDIANTE' CHECK (rol IN ('ESTUDIANTE', 'ADMIN', 'GARITA')),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla ESTUDIANTES (Métricas de los 150 alumnos)
CREATE TABLE estudiantes (
    id_estudiante SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(20) UNIQUE NOT NULL,
    promedio_academico NUMERIC(4,2) NOT NULL,
    porcentaje_asistencia NUMERIC(5,2) NOT NULL,
    condicion_pensiones VARCHAR(20) NOT NULL, -- 'AL DIA' o 'CON DEUDA'
    pertenece_merito VARCHAR(50),             -- 'Tercio superior', 'Quinto superior', '-'
    penalidades INT DEFAULT 0,
    puntaje_prioridad NUMERIC(5,2) DEFAULT 0,
    nivel_prioridad VARCHAR(30) DEFAULT 'Prioridad Baja',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla ZONAS DE ESTACIONAMIENTO (Diseño en 'D': Arriba, Lado y Abajo)
CREATE TABLE zonas_estacionamiento (
    id_zona SERIAL PRIMARY KEY,
    codigo_zona VARCHAR(20) UNIQUE NOT NULL,    -- 'ZONA_NORTE', 'ZONA_LATERAL', 'ZONA_SUR'
    nombre_zona VARCHAR(100) NOT NULL,          -- 'Zona Norte (Arriba)'
    descripcion VARCHAR(200),
    capacidad_total INT NOT NULL CHECK (capacidad_total > 0),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'MANTENIMIENTO'))
);

-- 5. Tabla RESERVAS (Reserva asociada a la ZONA elegida)
CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_estudiante INT REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    id_zona INT REFERENCES zonas_estacionamiento(id_zona) ON DELETE RESTRICT,
    fecha_reserva DATE NOT NULL,
    horario VARCHAR(30) NOT NULL,               -- '08:00 – 12:00', '13:00 – 17:00', '18:00 – 22:00'
    placa_vehiculo VARCHAR(10) NOT NULL,
    codigo_qr VARCHAR(100),
    estado_reserva VARCHAR(20) DEFAULT 'CONFIRMADA' CHECK (estado_reserva IN ('CONFIRMADA', 'UTILIZADA', 'CANCELADA', 'PENALIZADO')),
    fecha_ingreso TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Configuración de las Zonas en forma de 'D'
INSERT INTO zonas_estacionamiento (codigo_zona, nombre_zona, descripcion, capacidad_total) VALUES
('ZONA_NORTE',   'Zona Norte (Superior)',   'Sector arriba · 7 plazas disponibles', 7),
('ZONA_LATERAL', 'Zona Lateral (Principal)', 'Sector lateral · 20 plazas disponibles', 20),
('ZONA_SUR',     'Zona Sur (Inferior)',    'Sector abajo · 8 plazas disponibles', 8);