import { especialidadesRepo } from '@/lib/repositories';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const list = await especialidadesRepo.getAll();
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Error al obtener especialidades' },
      { status: 500 }
    );
  }
}
