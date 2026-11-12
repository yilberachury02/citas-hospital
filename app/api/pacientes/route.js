import { pacientesRepo } from '@/lib/repositories';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const list = await pacientesRepo.getAll();
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Error al obtener pacientes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, documento, telefono, email, fecha_nacimiento } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre completo del paciente es obligatorio.' },
        { status: 400 }
      );
    }
    if (!documento || !documento.trim()) {
      return NextResponse.json(
        { error: 'El documento de identidad es obligatorio.' },
        { status: 400 }
      );
    }

    const nuevo = await pacientesRepo.create({
      nombre: nombre.trim(),
      documento: documento.trim(),
      telefono: telefono ? telefono.trim() : '',
      email: email ? email.trim() : '',
      fecha_nacimiento: fecha_nacimiento || '',
    });

    return NextResponse.json(nuevo, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Error al registrar paciente' },
      { status: 400 }
    );
  }
}
