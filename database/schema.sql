CREATE TABLE USUARIOS (
    id_usuario SERIAL PRIMARY KEY,
    correo_institucional VARCHAR(120) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('ESTUDIANTE', 'ADMIN', 'GARITA')) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ESTUDIANTES (
    id_estudiante SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(15) UNIQUE NOT NULL,
    promedio_academico DECIMAL(4,2) NOT NULL,
    porcentaje_asistencia DECIMAL(5,2) NOT NULL,
    condicion_pensiones VARCHAR(20) CHECK (condicion_pensiones IN ('AL DIA', 'MOROSO')) NOT NULL,
    puntaje_prioridad DECIMAL(5,2) DEFAULT 0.00,
    nivel_prioridad VARCHAR(20) DEFAULT 'ESTÁNDAR'
);

CREATE TABLE SECCIONES (
    id_seccion SERIAL PRIMARY KEY,
    codigo_seccion VARCHAR(15) UNIQUE NOT NULL,
    nombre_curso VARCHAR(100) NOT NULL,
    campus_sede VARCHAR(50) NOT NULL,
    modalidad VARCHAR(30) NOT NULL
);

CREATE TABLE HORARIOS_CLASES (
    id_horario SERIAL PRIMARY KEY,
    id_seccion INT REFERENCES SECCIONES(id_seccion) ON DELETE CASCADE,
    dia_semana VARCHAR(15) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula VARCHAR(20) NOT NULL
);

CREATE TABLE RESERVAS (
    id_reserva SERIAL PRIMARY KEY,
    id_estudiante INT REFERENCES ESTUDIANTES(id_estudiante),
    id_seccion INT REFERENCES SECCIONES(id_seccion),
    fecha_reserva DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('CONFIRMADA', 'CANCELADA', 'COMPLETADA')) DEFAULT 'CONFIRMADA',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);