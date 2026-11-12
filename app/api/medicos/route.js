import { medicosRepo, getActiveDbMode } from '@/lib/repositories';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const list = await medicosRepo.getAll();
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Error al obtener médicos' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, documento, especialidad_id, especialidad_nombre } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre del médico es obligatorio.' },
        { status: 400 }
      );
    }
    if (!documento || !documento.trim()) {
      return NextResponse.json(
        { error: 'El documento de identidad es obligatorio.' },
        { status: 400 }
      );
    }
    if (!especialidad_id && !especialidad_nombre) {
      return NextResponse.json(
        { error: 'Debe seleccionar una especialidad médica.' },
        { status: 400 }
      );
    }

    const mode = getActiveDbMode();
    let data;
    if (mode === 'firestore') {
      data = {
        nombre: nombre.trim(),
        documento: documento.trim(),
        especialidad: { nombre: especialidad_nombre || '' },
      };
    } else {
      data = {
        nombre: nombre.trim(),
        documento: documento.trim(),
        especialidad_id,
      };
    }

    const nuevo = await medicosRepo.create(data);
    return NextResponse.json(nuevo, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Error al registrar médico' },
      { status: 400 }
    );
  }
}
