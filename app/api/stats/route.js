import { citasRepo, getActiveDbMode } from '@/lib/repositories';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stats = await citasRepo.stats();
    const mode = getActiveDbMode();
    return NextResponse.json({
      ...stats,
      mode,
      modeLabel: mode === 'firestore' ? 'No relacional - Firestore' : 'Relacional - PostgreSQL',
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message || 'Error al obtener estadísticas',
        mode: getActiveDbMode(),
        modeLabel: getActiveDbMode() === 'firestore' ? 'No relacional - Firestore' : 'Relacional - PostgreSQL',
        totalPacientes: 0,
        totalMedicos: 0,
        citasHoy: 0,
      },
      { status: 200 } // Retornar 200 con valores en 0 para no romper la pantalla de inicio si no hay conexión
    );
  }
}
