'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Stethoscope,
  CalendarDays,
  Clock,
  Plus,
  ArrowRight,
  AlertTriangle,
  CalendarCheck2,
  CalendarClock,
} from 'lucide-react';

export default function InicioPage() {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalMedicos: 0,
    citasHoy: 0,
    citasProgramadas: 0,
    mode: 'sql',
    modeLabel: 'PostgreSQL · Relacional',
  });
  const [proximasCitas, setProximasCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionNotice, setConnectionNotice] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [statsRes, citasRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/citas'),
        ]);

        const statsData = await statsRes.json();
        const citasData = await citasRes.json();

        if (statsData) {
          setStats((prev) => ({
            ...prev,
            ...statsData,
          }));
          if (statsData.error) {
            setConnectionNotice(statsData.error);
          }
        }

        if (Array.isArray(citasData)) {
          // Filtrar citas programadas y tomar las 5 primeras
          const programadas = citasData.filter((c) => c.estado === 'programada');
          setStats((prev) => ({
            ...prev,
            citasProgramadas: programadas.length,
          }));
          setProximasCitas(citasData.slice(0, 5));
        }
      } catch (err) {
        setConnectionNotice('Aviso: Base de datos no conectada todavía o servidor en espera de credenciales.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Saludo y Botones de Acción */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bienvenido al panel de citas
          </h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Monitoreo en tiempo real del flujo de atención hospitalaria y agenda de consultas.
          </p>
        </div>

        {/* Botones de Acceso Rápido */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/citas"
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-xs transition duration-200"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Agendar cita</span>
          </Link>
          <Link
            href="/pacientes"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 shadow-2xs transition"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Nuevo paciente</span>
          </Link>
          <Link
            href="/medicos"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2.5 rounded-xl text-sm border border-slate-300 shadow-2xs transition"
          >
            <Stethoscope className="w-4 h-4 text-slate-500" />
            <span>Nuevo médico</span>
          </Link>
        </div>
      </div>

      {/* Alerta elegante de conexión si aplica */}
      {connectionNotice && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold block">Información de Conexión</span>
            <span className="text-amber-800/90 leading-relaxed text-xs sm:text-sm">
              {connectionNotice}. El sistema está listo para operar tan pronto configures las variables en <code className="font-mono bg-amber-100/70 px-1.5 py-0.5 rounded text-amber-950 font-semibold">.env.local</code>.
            </span>
          </div>
        </div>
      )}

      {/* 4 Tarjetas de Estadísticas en Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pacientes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pacientes
            </span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalPacientes}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Registrados en la plataforma</p>
          </div>
        </div>

        {/* Médicos */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Médicos
            </span>
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalMedicos}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Especialistas disponibles</p>
          </div>
        </div>

        {/* Citas de hoy */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Citas de Hoy
            </span>
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.citasHoy}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Atenciones agendadas hoy</p>
          </div>
        </div>

        {/* Citas programadas */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Citas Programadas
            </span>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.citasProgramadas}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Pendientes por atender</p>
          </div>
        </div>
      </div>

      {/* Sección: Próximas Citas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-base">Próximas Citas</h3>
          </div>
          <Link
            href="/citas"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition"
          >
            <span>Ver toda la agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : proximasCitas.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No hay citas registradas en la agenda</p>
            <p className="text-xs text-slate-400 mt-1">
              Las citas agendadas aparecerán organizadas en este listado.
            </p>
            <div className="mt-4">
              <Link
                href="/citas"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Agendar primera cita
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {proximasCitas.map((cita) => {
              const isProgramada = cita.estado === 'programada';
              const isAtendida = cita.estado === 'atendida';

              let formattedDate = '—';
              if (cita.fecha_hora) {
                try {
                  formattedDate = new Date(cita.fecha_hora).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });
                } catch {
                  formattedDate = cita.fecha_hora;
                }
              }

              return (
                <div
                  key={cita.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {cita.paciente_nombre || cita.pacienteNombre || 'Paciente'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500">
                          Dr(a). {cita.medico_nombre || cita.medicoNombre || 'Médico'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>Consultorio {cita.consultorio_numero || cita.consultorioNumero || cita.consultorio_id}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isProgramada
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          : isAtendida
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/80 line-through'
                      }`}
                    >
                      {isProgramada ? 'Programada' : isAtendida ? 'Atendida' : 'Cancelada'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
