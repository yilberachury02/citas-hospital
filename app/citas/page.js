'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  CalendarPlus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Check,
  X,
  Building2,
  User,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function CitasPage() {
  const { showToast } = useToast();
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [consultorios, setConsultorios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Filtros
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Formulario
  const [form, setForm] = useState({
    paciente_id: '',
    medico_id: '',
    consultorio_id: '',
    fecha_hora: '',
    motivo: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filtroMedico) queryParams.append('medico_id', filtroMedico);
      if (filtroFecha) queryParams.append('fecha', filtroFecha);

      const [citasRes, pacRes, medRes, conRes] = await Promise.all([
        fetch(`/api/citas?${queryParams.toString()}`),
        fetch('/api/pacientes'),
        fetch('/api/medicos'),
        fetch('/api/consultorios'),
      ]);

      const [citasData, pacData, medData, conData] = await Promise.all([
        citasRes.json(),
        pacRes.json(),
        medRes.json(),
        conRes.json(),
      ]);

      if (citasRes.ok) setCitas(Array.isArray(citasData) ? citasData : []);
      if (pacRes.ok) setPacientes(Array.isArray(pacData) ? pacData : []);
      if (medRes.ok) setMedicos(Array.isArray(medData) ? medData : []);
      if (conRes.ok) setConsultorios(Array.isArray(conData) ? conData : []);
    } catch {
      showToast('Error de comunicación con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filtroMedico, filtroFecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgendar = async (e) => {
    e.preventDefault();

    if (!form.paciente_id || !form.medico_id || !form.consultorio_id || !form.fecha_hora) {
      showToast('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('¡Cita médica agendada correctamente!');
        setForm({
          paciente_id: '',
          medico_id: '',
          consultorio_id: '',
          fecha_hora: '',
          motivo: '',
        });
        loadData();
      } else {
        showToast(data.error || 'Error al programar la cita', 'error');
      }
    } catch {
      showToast('Error de comunicación con el servidor', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    if (nuevoEstado === 'cancelada') {
      const confirmed = window.confirm('¿Está seguro de que desea cancelar esta cita médica?');
      if (!confirmed) return;
    }

    try {
      setActionId(id);
      const res = await fetch(`/api/citas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          nuevoEstado === 'atendida'
            ? 'Cita marcada como atendida exitosamente.'
            : 'Cita cancelada correctamente.'
        );
        loadData();
      } else {
        showToast(data.error || 'Error al actualizar estado', 'error');
      }
    } catch {
      showToast('Error de comunicación con el servidor', 'error');
    } finally {
      setActionId(null);
    }
  };

  // Filtrado local adicional por estado y búsqueda de texto
  const filteredCitas = useMemo(() => {
    return citas.filter((c) => {
      if (filtroEstado && c.estado !== filtroEstado) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pac = (c.paciente_nombre || c.pacienteNombre || '').toLowerCase();
        const med = (c.medico_nombre || c.medicoNombre || '').toLowerCase();
        const esp = (c.especialidad || '').toLowerCase();
        const mot = (c.motivo || '').toLowerCase();
        return pac.includes(q) || med.includes(q) || esp.includes(q) || mot.includes(q);
      }
      return true;
    });
  }, [citas, filtroEstado, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Agenda de Citas Médicas
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Programación, control de horarios y seguimiento del estado de atención.
        </p>
      </div>

      {/* Grid en 2 columnas (1/3 formulario, 2/3 tabla) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Formulario (1/3) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Agendar Cita</h3>
          </div>

          <form onSubmit={handleAgendar} className="space-y-4">
            {/* Paciente */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Paciente <span className="text-rose-500">*</span>
              </label>
              <select
                name="paciente_id"
                value={form.paciente_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              >
                <option value="">Seleccione un paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.documento})
                  </option>
                ))}
              </select>
            </div>

            {/* Médico */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Médico Especialista <span className="text-rose-500">*</span>
              </label>
              <select
                name="medico_id"
                value={form.medico_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              >
                <option value="">Seleccione un médico</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} — {m.especialidad_nombre || m.especialidad?.nombre || 'General'}
                  </option>
                ))}
              </select>
            </div>

            {/* Consultorio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Consultorio <span className="text-rose-500">*</span>
              </label>
              <select
                name="consultorio_id"
                value={form.consultorio_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              >
                <option value="">Seleccione consultorio</option>
                {consultorios.map((c) => (
                  <option key={c.id} value={c.id}>
                    Consultorio {c.numero} (Piso {c.piso})
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fecha y Hora <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="fecha_hora"
                value={form.fecha_hora}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              />
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Motivo de Consulta
              </label>
              <textarea
                name="motivo"
                rows={2}
                value={form.motivo}
                onChange={handleChange}
                placeholder="Ej. Chequeo de rutina, control de presión..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-xs transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Agendando...</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    <span>Programar Cita</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla con Filtros Superiores (2/3) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 overflow-hidden flex flex-col">
          {/* Barra de Filtros */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-3.5 bg-slate-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar paciente, médico o motivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-white"
                />
              </div>

              <div className="text-xs font-semibold text-slate-500 self-end sm:self-center">
                Total: {filteredCitas.length}
              </div>
            </div>

            {/* Selectores de filtros */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filtrar:
              </span>

              {/* Filtro Médico */}
              <select
                value={filtroMedico}
                onChange={(e) => setFiltroMedico(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Todos los médicos</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    Dr(a). {m.nombre}
                  </option>
                ))}
              </select>

              {/* Filtro Fecha */}
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />

              {/* Filtro Estado */}
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Todos los estados</option>
                <option value="programada">Programada</option>
                <option value="atendida">Atendida</option>
                <option value="cancelada">Cancelada</option>
              </select>

              {(filtroMedico || filtroFecha || filtroEstado || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setFiltroMedico('');
                    setFiltroFecha('');
                    setFiltroEstado('');
                    setSearchQuery('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 transition ml-auto"
                >
                  Limpiar filtros ✕
                </button>
              )}
            </div>
          </div>

          {/* Listado de Citas */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredCitas.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-slate-700">Aún no hay citas registradas</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {filtroMedico || filtroFecha || filtroEstado || searchQuery
                  ? 'No se encontraron citas con los filtros seleccionados.'
                  : 'Utiliza el formulario de la izquierda para programar la primera cita médica.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Paciente</th>
                    <th className="py-3 px-4">Médico</th>
                    <th className="py-3 px-4">Consultorio</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredCitas.map((c) => {
                    const isProgramada = c.estado === 'programada';
                    const isAtendida = c.estado === 'atendida';
                    const isCancelada = c.estado === 'cancelada';
                    const isActing = actionId === c.id;

                    let formattedDate = '—';
                    if (c.fecha_hora) {
                      try {
                        formattedDate = new Date(c.fecha_hora).toLocaleString('es-ES', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        });
                      } catch {
                        formattedDate = c.fecha_hora;
                      }
                    }

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Fecha y Hora */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap text-xs sm:text-sm">
                          {formattedDate}
                        </td>

                        {/* Paciente */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {c.paciente_nombre || c.pacienteNombre || 'Paciente'}
                          </div>
                          {c.motivo && (
                            <div className="text-[11px] text-slate-400 max-w-[160px] truncate" title={c.motivo}>
                              {c.motivo}
                            </div>
                          )}
                        </td>

                        {/* Médico y Especialidad */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 text-xs sm:text-sm">
                            Dr(a). {c.medico_nombre || c.medicoNombre || 'Médico'}
                          </div>
                          <div className="text-[11px] text-teal-700 font-semibold">
                            {c.especialidad || 'General'}
                          </div>
                        </td>

                        {/* Consultorio */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                            C-{c.consultorio_numero || c.consultorioNumero || c.consultorio_id}
                          </span>
                        </td>

                        {/* Estado con Badge de Color */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isProgramada
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                                : isAtendida
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/80 line-through'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isProgramada
                                  ? 'bg-amber-500'
                                  : isAtendida
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {isProgramada ? 'Programada' : isAtendida ? 'Atendida' : 'Cancelada'}
                          </span>
                        </td>

                        {/* Botones de Acción */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isProgramada ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => handleUpdateEstado(c.id, 'atendida')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition disabled:opacity-50"
                                title="Marcar como atendida"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Atender</span>
                              </button>
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => handleUpdateEstado(c.id, 'cancelada')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 transition disabled:opacity-50"
                                title="Cancelar cita"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Cancelar</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Completada</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
