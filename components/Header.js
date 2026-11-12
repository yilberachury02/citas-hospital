'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Database, Calendar } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Panel de Control',
  '/pacientes': 'Gestión de Pacientes',
  '/medicos': 'Cuerpo Médico',
  '/citas': 'Agenda de Citas',
};

export default function Header({ onMenuClick }) {
  const pathname = usePathname();
  const [dbInfo, setDbInfo] = useState({
    mode: 'sql',
    modeLabel: 'PostgreSQL · Relacional',
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.mode) {
          const isFs = d.mode === 'firestore';
          setDbInfo({
            mode: d.mode,
            modeLabel: isFs ? 'Firestore · No relacional' : 'PostgreSQL · Relacional',
          });
        }
      })
      .catch(() => {});
  }, []);

  const pageTitle = PAGE_TITLES[pathname] || 'Hospital Central';
  const isFirestore = dbInfo.mode === 'firestore';

  // Fecha actual formateada en español
  const todayDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Lado izquierdo: Botón hamburguesa y título */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 capitalize hidden sm:flex">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayDate}</span>
          </div>
        </div>
      </div>

      {/* Lado derecho: Badge de Base de Datos Activa */}
      <div className="flex items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-2xs transition-all ${
            isFirestore
              ? 'bg-amber-50 text-amber-800 border-amber-200/90'
              : 'bg-blue-50 text-blue-800 border-blue-200/90'
          }`}
        >
          <Database
            className={`w-3.5 h-3.5 ${
              isFirestore ? 'text-amber-600' : 'text-blue-600'
            }`}
          />
          <span className="font-medium hidden xs:inline">Base de datos:</span>
          <span className="font-bold">{dbInfo.modeLabel}</span>
        </div>
      </div>
    </header>
  );
}
