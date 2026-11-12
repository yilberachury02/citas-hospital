import pool from '../db.js';

export const pacientesRepo = {
  async getAll() {
    const { rows } = await pool.query(
      'SELECT id, nombre, documento, telefono, email, fecha_nacimiento FROM pacientes ORDER BY nombre ASC'
    );
    return rows;
  },

  async create({ nombre, documento, telefono, email, fecha_nacimiento }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO pacientes (nombre, documento, telefono, email, fecha_nacimiento)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nombre, documento, telefono, email, fecha_nacimiento`,
        [nombre, documento, telefono || null, email || null, fecha_nacimiento || null]
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('Ya existe un paciente con ese documento de identidad.');
      }
      throw err;
    }
  },
};

export const medicosRepo = {
  async getAll() {
    const { rows } = await pool.query(
      `SELECT m.id, m.nombre, m.documento, m.especialidad_id,
              e.nombre AS especialidad_nombre
         FROM medicos m
         JOIN especialidades e ON e.id = m.especialidad_id
        ORDER BY m.nombre ASC`
    );
    return rows;
  },

  async create({ nombre, documento, especialidad_id }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO medicos (nombre, documento, especialidad_id)
         VALUES ($1, $2, $3)
         RETURNING id, nombre, documento, especialidad_id`,
        [nombre, documento, parseInt(especialidad_id, 10)]
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('Ya existe un médico con ese documento de identidad.');
      }
      throw err;
    }
  },
};

export const especialidadesRepo = {
  async getAll() {
    const { rows } = await pool.query(
      'SELECT id, nombre FROM especialidades ORDER BY nombre ASC'
    );
    return rows;
  },
};

export const consultoriosRepo = {
  async getAll() {
    const { rows } = await pool.query(
      'SELECT id, numero, piso FROM consultorios ORDER BY numero ASC'
    );
    return rows;
  },
};

export const citasRepo = {
  async getAll({ medico_id, fecha } = {}) {
    let query = `
      SELECT c.id,
             c.paciente_id,
             c.medico_id,
             c.consultorio_id,
             c.fecha_hora,
             c.motivo,
             c.estado,
             c.creada_en,
             p.nombre AS paciente_nombre,
             m.nombre AS medico_nombre,
             e.nombre AS especialidad,
             co.numero AS consultorio_numero
        FROM citas c
        JOIN pacientes p ON p.id = c.paciente_id
        JOIN medicos m ON m.id = c.medico_id
        JOIN especialidades e ON e.id = m.especialidad_id
        JOIN consultorios co ON co.id = c.consultorio_id
       WHERE 1=1
    `;
    const params = [];

    if (medico_id) {
      params.push(parseInt(medico_id, 10));
      query += ` AND c.medico_id = $${params.length}`;
    }

    if (fecha) {
      params.push(fecha);
      query += ` AND c.fecha_hora::date = $${params.length}::date`;
    }

    query += ' ORDER BY c.fecha_hora DESC';

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async create({ paciente_id, medico_id, consultorio_id, fecha_hora, motivo }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO citas (paciente_id, medico_id, consultorio_id, fecha_hora, motivo, estado)
         VALUES ($1, $2, $3, $4, $5, 'programada')
         RETURNING *`,
        [
          parseInt(paciente_id, 10),
          parseInt(medico_id, 10),
          parseInt(consultorio_id, 10),
          fecha_hora,
          motivo || null,
        ]
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('El médico ya tiene una cita a esa hora.');
      }
      throw err;
    }
  },

  async updateEstado(id, estado) {
    const valid = ['programada', 'atendida', 'cancelada'];
    if (!valid.includes(estado)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${valid.join(', ')}`);
    }

    const { rows } = await pool.query(
      `UPDATE citas
          SET estado = $1
        WHERE id = $2
        RETURNING *`,
      [estado, parseInt(id, 10)]
    );

    if (rows.length === 0) {
      throw new Error('Cita no encontrada.');
    }
    return rows[0];
  },

  async stats() {
    const [pacientesRes, medicosRes, citasHoyRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM pacientes'),
      pool.query('SELECT COUNT(*)::int AS total FROM medicos'),
      pool.query(`
        SELECT COUNT(*)::int AS total
          FROM citas
         WHERE fecha_hora::date = CURRENT_DATE
           AND estado = 'programada'
      `),
    ]);

    return {
      totalPacientes: pacientesRes.rows[0]?.total || 0,
      totalMedicos: medicosRes.rows[0]?.total || 0,
      citasHoy: citasHoyRes.rows[0]?.total || 0,
    };
  },
};
