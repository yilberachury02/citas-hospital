import {
  citasRepo,
  pacientesRepo,
  medicosRepo,
  consultoriosRepo,
  getActiveDbMode,
} from '@/lib/repositories';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const medico_id = searchParams.get('medico_id') || undefined;
    const fecha = searchParams.get('fecha') || undefined;

    const list = await citasRepo.getAll({ medico_id, fecha });
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Error al obtener citas' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { paciente_id, medico_id, consultorio_id, fecha_hora, motivo } = body;

    if (!paciente_id) {
      return NextResponse.json({ error: 'Debe seleccionar un paciente.' }, { status: 400 });
    }
    if (!medico_id) {
      return NextResponse.json({ error: 'Debe seleccionar un médico.' }, { status: 400 });
    }
    if (!consultorio_id) {
      return NextResponse.json({ error: 'Debe seleccionar un consultorio.' }, { status: 400 });
    }
    if (!fecha_hora) {
      return NextResponse.json({ error: 'La fecha y hora de la cita son obligatorias.' }, { status: 400 });
    }

    const mode = getActiveDbMode();
    let data = {
      paciente_id,
      medico_id,
      consultorio_id,
      fecha_hora,
      motivo: motivo ? motivo.trim() : '',
    };

    if (mode === 'firestore') {
      // Desnormalizar: pacienteNombre, medicoNombre, especialidad, consultorioNumero
      const [pacientes, medicos, consultorios] = await Promise.all([
        pacientesRepo.getAll(),
        medicosRepo.getAll(),
        consultoriosRepo.getAll(),
      ]);

      const paciente = pacientes.find((p) => String(p.id) === String(paciente_id));
      const medico = medicos.find((m) => String(m.id) === String(medico_id));
      const consultorio = consultorios.find((c) => String(c.id) === String(consultorio_id));

      data.pacienteNombre = paciente ? paciente.nombre : (body.pacienteNombre || 'Paciente');
      data.medicoNombre = medico ? medico.nombre : (body.medicoNombre || 'Médico');
      data.especialidad = medico
        ? (medico.especialidad_nombre || medico.especialidad?.nombre || '')
        : (body.especialidad || '');
      data.consultorioNumero = consultorio ? String(consultorio.numero) : (body.consultorioNumero || '');
    }

    const nueva = await citasRepo.create(data);
    return NextResponse.json(nueva, { status: 201 });
  } catch (err) {
    const msg = err.message || 'Error al agendar la cita';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
