'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Calendar,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function PacientesPage() {
  const { showToast } = useToast();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
  });

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pacientes');
      const data = await res.json();
      if (res.ok) {
        setPacientes(Array.isArray(data) ? data : []);
      } else {
        showToast(data.error || 'Error al cargar pacientes', 'error');
      }
    } catch {
      showToast('No se pudo conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.documento.trim()) {
      showToast('El nombre y documento son obligatorios', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Paciente "${form.nombre}" registrado exitosamente.`);
        setForm({
          nombre: '',
          documento: '',
          telefono: '',
          email: '',
          fecha_nacimiento: '',
        });
        fetchPacientes();
      } else {
        showToast(data.error || 'Error al guardar el paciente', 'error');
      }
    } catch {
      showToast('Error de comunicación con el servidor', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtrado de pacientes en tiempo real con buscador
  const filteredPacientes = useMemo(() => {
    if (!searchQuery.trim()) return pacientes;
    const q = searchQuery.toLowerCase();
    return pacientes.filter(
      (p) =>
        (p.nombre && p.nombre.toLowerCase().includes(q)) ||
        (p.documento && p.documento.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.telefono && p.telefono.toLowerCase().includes(q))
    );
  }, [pacientes, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Gestión de Pacientes
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Registro clínico, consulta de historias y base de pacientes del hospital.
        </p>
      </div>

      {/* Grid en 2 columnas en pantallas grandes (1/3 formulario, 2/3 tabla) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna Izquierda (1/3): Formulario */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs lg:col-span-1">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Registrar Paciente</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombre Completo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Carlos Alberto Gómez"
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
                placeholder="Ej. 1020304050"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej. +57 300 123 4567"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej. paciente@correo.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/30 focus:bg-white"
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
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Guardar Paciente</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Columna Derecha (2/3): Tabla con Buscador */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 overflow-hidden flex flex-col">
          {/* Barra superior de la tabla: Buscador */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-slate-50/50"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500 self-end sm:self-center">
              Total: {filteredPacientes.length}
            </div>
          </div>

          {/* Contenido de la Tabla */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredPacientes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-slate-700">Aún no hay pacientes registrados</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? 'No se encontraron resultados con ese criterio de búsqueda.'
                  : 'Utiliza el formulario de la izquierda para dar de alta al primer paciente.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Paciente</th>
                    <th className="py-3 px-5">Documento</th>
                    <th className="py-3 px-5">Contacto</th>
                    <th className="py-3 px-5">Fecha Nac.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredPacientes.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {p.nombre}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                        {p.documento}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        <div className="flex flex-col text-xs gap-0.5">
                          {p.telefono && (
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {p.telefono}
                            </span>
                          )}
                          {p.email && (
                            <span className="flex items-center gap-1.5 text-slate-500 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {p.email}
                            </span>
                          )}
                          {!p.telefono && !p.email && <span className="text-slate-300">—</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 whitespace-nowrap">
                        {p.fecha_nacimiento ? (
                          new Date(p.fecha_nacimiento).toLocaleDateString('es-ES', {
                            timeZone: 'UTC',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
