-- ============================================================
-- SCHEMA PostgreSQL — Sistema de Citas Hospital
-- ============================================================

-- 1. Tabla de Especialidades Médicas
CREATE TABLE IF NOT EXISTS especialidades (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Tabla de Médicos
CREATE TABLE IF NOT EXISTS medicos (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(150) NOT NULL,
  documento       VARCHAR(20)  NOT NULL UNIQUE,
  especialidad_id INTEGER      NOT NULL REFERENCES especialidades(id) ON DELETE RESTRICT
);

-- 3. Tabla de Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id               SERIAL PRIMARY KEY,
  nombre           VARCHAR(150) NOT NULL,
  documento        VARCHAR(20)  NOT NULL UNIQUE,
  telefono         VARCHAR(20),
  email            VARCHAR(100),
  fecha_nacimiento DATE
);

-- 4. Tabla de Consultorios
CREATE TABLE IF NOT EXISTS consultorios (
  id     SERIAL PRIMARY KEY,
  numero VARCHAR(10) NOT NULL UNIQUE,
  piso   INTEGER     NOT NULL
);

-- 5. Tabla de Citas
CREATE TABLE IF NOT EXISTS citas (
  id             SERIAL PRIMARY KEY,
  paciente_id    INTEGER      NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_id      INTEGER      NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  consultorio_id INTEGER      NOT NULL REFERENCES consultorios(id) ON DELETE RESTRICT,
  fecha_hora     TIMESTAMP    NOT NULL,
  motivo         TEXT,
  estado         VARCHAR(20)  NOT NULL DEFAULT 'programada'
                              CHECK (estado IN ('programada', 'atendida', 'cancelada')),
  creada_en      TIMESTAMP    NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_medico_fecha_hora UNIQUE (medico_id, fecha_hora)
);

-- ============================================================
-- Inserciones de datos de ejemplo (5 especialidades y 4 consultorios)
-- ============================================================

INSERT INTO especialidades (nombre) VALUES
  ('Medicina General'),
  ('Cardiología'),
  ('Pediatría'),
  ('Dermatología'),
  ('Neurología')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO consultorios (numero, piso) VALUES
  ('101', 1),
  ('202', 2),
  ('303', 3),
  ('404', 4)
ON CONFLICT (numero) DO NOTHING;
