import { citasRepo } from '@/lib/repositories';
import { NextResponse } from 'next/server';

export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { estado } = body;

    if (!estado || !['programada', 'atendida', 'cancelada'].includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido. Valores permitidos: programada, atendida, cancelada.' },
        { status: 400 }
      );
    }

    const updated = await citasRepo.updateEstado(id, estado);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Error al actualizar estado de la cita' },
      { status: 400 }
    );
  }
}
