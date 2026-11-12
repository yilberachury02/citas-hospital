'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  UserPlus,
  Search,
  Award,
  IdCard,
  UserCheck,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function MedicosPage() {
  const { showToast } = useToast();
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    documento: '',
    especialidad_id: '',
    especialidad_nombre: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medRes, espRes] = await Promise.all([
        fetch('/api/medicos'),
        fetch('/api/especialidades'),
      ]);

      const medData = await medRes.json();
      const espData = await espRes.json();

      if (medRes.ok) {
        setMedicos(Array.isArray(medData) ? medData : []);
      } else {
        showToast(medData.error || 'Error al cargar médicos', 'error');
      }

      if (espRes.ok) {
        setEspecialidades(Array.isArray(espData) ? espData : []);
      }
    } catch {
      showToast('No se pudo conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'especialidad_id') {
      const selectedEsp = especialidades.find((esp) => String(esp.id) === String(value));
      setForm((prev) => ({
        ...prev,
        especialidad_id: value,
        especialidad_nombre: selectedEsp ? selectedEsp.nombre : '',
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.documento.trim() || !form.especialidad_id) {
      showToast('Todos los campos son obligatorios', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/medicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Médico "${form.nombre}" registrado exitosamente.`);
        setForm({
          nombre: '',
          documento: '',
          especialidad_id: '',
          especialidad_nombre: '',
        });
        fetchData();
      } else {
        showToast(data.error || 'Error al guardar el médico', 'error');
      }
    } catch {
      showToast('Error de comunicación con el servidor', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtrado de médicos
  const filteredMedicos = useMemo(() => {
    if (!searchQuery.trim()) return medicos;
    const q = searchQuery.toLowerCase();
    return medicos.filter(
      (m) =>
        (m.nombre && m.nombre.toLowerCase().includes(q)) ||
        (m.documento && m.documento.toLowerCase().includes(q)) ||
        (m.especialidad_nombre && m.especialidad_nombre.toLowerCase().includes(q)) ||
        (m.especialidad?.nombre && m.especialidad.nombre.toLowerCase().includes(q))
    );
  }, [medicos, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Cuerpo Médico
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Registro de profesionales de la salud y asignación de especialidades hospitalarias.
        </p>
      </div>

      {/* Grid en 2 columnas (1/3 formulario, 2/3 tabla) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Formulario (1/3) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Registrar Médico</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombre Completo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Dra. Laura Sánchez"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              />
            </div>

            {/* Documento */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Documento de Identidad <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="Ej. 79800111"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              />
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Especialidad Médica <span className="text-rose-500">*</span>
              </label>
              <select
                name="especialidad_id"
                value={form.especialidad_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              >
                <option value="">Seleccione especialidad</option>
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
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
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Guardar Médico</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla con Buscador (2/3) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 overflow-hidden flex flex-col">
          {/* Buscador */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por médico, documento o especialidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/50"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500 self-end sm:self-center">
              Total: {filteredMedicos.length}
            </div>
          </div>

          {/* Listado */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredMedicos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-slate-700">Aún no hay médicos registrados</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? 'No se encontraron resultados con ese criterio de búsqueda.'
                  : 'Utiliza el formulario de la izquierda para registrar al primer especialista.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Médico</th>
                    <th className="py-3 px-5">Documento</th>
                    <th className="py-3 px-5">Especialidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredMedicos.map((m) => {
                    const espNombre = m.especialidad_nombre || m.especialidad?.nombre || 'General';
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              Dr
                            </div>
                            <span>{m.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                          {m.documento}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/70">
                            <Award className="w-3 h-3 text-teal-600" />
                            {espNombre}
                          </span>
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
