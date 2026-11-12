import { db } from '../firebase.js';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';

const ESPECIALIDADES_DEFAULT = [
  { nombre: 'Medicina General' },
  { nombre: 'Cardiología' },
  { nombre: 'Pediatría' },
  { nombre: 'Dermatología' },
  { nombre: 'Neurología' },
];

const CONSULTORIOS_DEFAULT = [
  { numero: '101', piso: 1 },
  { numero: '202', piso: 2 },
  { numero: '303', piso: 3 },
  { numero: '404', piso: 4 },
];

async function seedIfEmpty(collectionName, defaultData) {
  const colRef = collection(db, collectionName);
  const snap = await getDocs(colRef);
  if (snap.empty) {
    for (const item of defaultData) {
      await addDoc(colRef, item);
    }
  }
}

export const especialidadesRepo = {
  async getAll() {
    await seedIfEmpty('especialidades', ESPECIALIDADES_DEFAULT);
    const snap = await getDocs(collection(db, 'especialidades'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  },
};

export const consultoriosRepo = {
  async getAll() {
    await seedIfEmpty('consultorios', CONSULTORIOS_DEFAULT);
    const snap = await getDocs(collection(db, 'consultorios'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
  },
};

export const pacientesRepo = {
  async getAll() {
    const snap = await getDocs(collection(db, 'pacientes'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  },

  async create(data) {
    const { nombre, documento, telefono, email, fecha_nacimiento } = data;
    // Verificar documento único
    const q = query(collection(db, 'pacientes'), where('documento', '==', documento));
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error('Ya existe un paciente con ese documento de identidad.');
    }

    const payload = {
      nombre,
      documento,
      telefono: telefono || '',
      email: email || '',
      fecha_nacimiento: fecha_nacimiento || '',
      creado_en: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'pacientes'), payload);
    return { id: docRef.id, ...payload };
  },
};

export const medicosRepo = {
  async getAll() {
    const snap = await getDocs(collection(db, 'medicos'));
    return snap.docs
      .map((d) => {
        const item = d.data();
        return {
          id: d.id,
          ...item,
          especialidad_nombre: item.especialidad?.nombre || '',
        };
      })
      .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  },

  async create(data) {
    const { nombre, documento, especialidad } = data;
    // Especialidad embebida como objeto { nombre }
    const q = query(collection(db, 'medicos'), where('documento', '==', documento));
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error('Ya existe un médico con ese documento de identidad.');
    }

    const payload = {
      nombre,
      documento,
      especialidad: {
        nombre: typeof especialidad === 'string' ? especialidad : especialidad?.nombre || '',
      },
      creado_en: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'medicos'), payload);
    return {
      id: docRef.id,
      ...payload,
      especialidad_nombre: payload.especialidad.nombre,
    };
  },
};

export const citasRepo = {
  async getAll({ medico_id, fecha } = {}) {
    const snap = await getDocs(collection(db, 'citas'));
    let citas = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        // Compatibilidad con vistas que esperan snake_case
        paciente_nombre: data.pacienteNombre || data.paciente_nombre || '',
        medico_nombre: data.medicoNombre || data.medico_nombre || '',
        consultorio_numero: data.consultorioNumero || data.consultorio_numero || '',
        especialidad: data.especialidad || '',
      };
    });

    if (medico_id) {
      citas = citas.filter((c) => String(c.medico_id) === String(medico_id));
    }

    if (fecha) {
      citas = citas.filter((c) => {
        if (!c.fecha_hora) return false;
        return c.fecha_hora.startsWith(fecha);
      });
    }

    // Ordenar descendente por fecha_hora
    return citas.sort((a, b) => (b.fecha_hora || '').localeCompare(a.fecha_hora || ''));
  },

  async create(data) {
    const {
      paciente_id,
      medico_id,
      consultorio_id,
      fecha_hora,
      motivo,
      pacienteNombre,
      medicoNombre,
      especialidad,
      consultorioNumero,
    } = data;

    // ID compuesto: ${medicoId}_${fechaHora}
    const safeFechaHora = String(fecha_hora).replace(/[:.\s]/g, '-');
    const docId = `${medico_id}_${safeFechaHora}`;
    const citaDocRef = doc(db, 'citas', docId);

    await runTransaction(db, async (transaction) => {
      const existingDoc = await transaction.get(citaDocRef);
      if (existingDoc.exists()) {
        throw new Error('El médico ya tiene una cita a esa hora.');
      }

      const citaData = {
        paciente_id,
        medico_id,
        consultorio_id,
        fecha_hora,
        motivo: motivo || '',
        estado: 'programada',
        pacienteNombre: pacienteNombre || '',
        medicoNombre: medicoNombre || '',
        especialidad: especialidad || '',
        consultorioNumero: consultorioNumero || '',
        creada_en: new Date().toISOString(),
      };

      transaction.set(citaDocRef, citaData);
    });

    return {
      id: docId,
      ...data,
      estado: 'programada',
      paciente_nombre: pacienteNombre,
      medico_nombre: medicoNombre,
      consultorio_numero: consultorioNumero,
    };
  },

  async updateEstado(id, estado) {
    const valid = ['programada', 'atendida', 'cancelada'];
    if (!valid.includes(estado)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${valid.join(', ')}`);
    }

    const citaDocRef = doc(db, 'citas', id);
    const snap = await getDoc(citaDocRef);
    if (!snap.exists()) {
      throw new Error('Cita no encontrada.');
    }

    await updateDoc(citaDocRef, { estado });
    return { id, ...snap.data(), estado };
  },

  async stats() {
    const today = new Date().toISOString().slice(0, 10);
    const [pacientesSnap, medicosSnap, citasSnap] = await Promise.all([
      getDocs(collection(db, 'pacientes')),
      getDocs(collection(db, 'medicos')),
      getDocs(collection(db, 'citas')),
    ]);

    const citasHoy = citasSnap.docs.filter((d) => {
      const data = d.data();
      return (
        data.estado === 'programada' &&
        data.fecha_hora &&
        data.fecha_hora.startsWith(today)
      );
    }).length;

    return {
      totalPacientes: pacientesSnap.size,
      totalMedicos: medicosSnap.size,
      citasHoy,
    };
  },
};
