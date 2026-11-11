'use client';

import React, { useState } from 'react';
import { Lock, RefreshCw, Download, AlertCircle } from 'lucide-react';
import NeuronalGravityBrandLogo from '@/components/NeuronalGravityBrandLogo';

interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  domain?: string;
  service: string;
  budget?: string;
  details?: string;
  createdAt: string;
}

function toCsv(leads: Lead[]): string {
  const cols: Array<keyof Lead> = ['createdAt', 'name', 'company', 'email', 'phone', 'domain', 'service', 'budget', 'details'];
  const escape = (v: unknown) => {
    let text = String(v ?? '');
    // Neutraliza fórmulas al abrir el CSV en Excel
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [cols.join(','), ...leads.map((l) => cols.map((c) => escape(l[c])).join(','))].join('\n');
}

export default function AdminLeadsPage() {
  const [token, setToken] = useState('');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLeads = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact/leads', {
        headers: { Authorization: `Bearer ${token.trim()}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        setLeads(null);
        setError(data.error || 'No se pudo cargar la lista de prospectos.');
      } else {
        setLeads(Array.isArray(data.leads) ? data.leads : []);
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!leads) return;
    const blob = new Blob(['﻿' + toCsv(leads)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <NeuronalGravityBrandLogo />
          <span className="text-xs font-mono text-neutral-400 border border-white/10 rounded-full px-3 py-1">
            Panel interno &bull; Prospectos
          </span>
        </header>

        <form
          onSubmit={loadLeads}
          className="rounded-2xl bg-[#141416] border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row gap-3"
        >
          <label className="flex-1 flex items-center gap-2 bg-black/60 border border-white/15 rounded-xl px-3.5 focus-within:border-[#38bdf8] transition-colors">
            <Lock className="w-4 h-4 text-neutral-500 shrink-0" />
            <input
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token de administración"
              aria-label="Token de administración"
              className="w-full bg-transparent py-3 text-[16px] sm:text-sm text-white placeholder-neutral-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 px-5 py-3 text-sm font-semibold text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {leads ? 'Actualizar' : 'Ver prospectos'}
          </button>
          {leads && leads.length > 0 && (
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar CSV
            </button>
          )}
        </form>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300 leading-snug">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {leads && (
          <section className="space-y-3">
            <p className="text-sm text-neutral-400">
              <strong className="text-white">{leads.length}</strong> prospecto{leads.length === 1 ? '' : 's'} registrado{leads.length === 1 ? '' : 's'}
            </p>
            {leads.length === 0 ? (
              <p className="rounded-2xl bg-[#141416] border border-white/10 p-6 text-sm text-neutral-400">
                Aún no hay prospectos registrados.
              </p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leads.map((lead) => (
                  <li key={lead.id} className="rounded-2xl bg-[#141416] border border-white/10 p-4 space-y-2 text-sm leading-snug">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <strong className="text-white whitespace-normal break-words">{lead.name}</strong>
                      <time className="text-[11px] font-mono text-neutral-500">
                        {new Date(lead.createdAt).toLocaleString('es-PE')}
                      </time>
                    </div>
                    <span className="inline-block rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#38bdf8] whitespace-normal">
                      {lead.service}
                    </span>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-neutral-300">
                      {lead.company && (<><dt className="text-neutral-500">Empresa</dt><dd className="break-words">{lead.company}</dd></>)}
                      <dt className="text-neutral-500">Correo</dt>
                      <dd className="break-all"><a className="hover:text-[#38bdf8]" href={`mailto:${lead.email}`}>{lead.email}</a></dd>
                      {lead.phone && (<><dt className="text-neutral-500">Teléfono</dt><dd className="break-all">{lead.phone}</dd></>)}
                      {lead.domain && (<><dt className="text-neutral-500">Dominio</dt><dd className="break-all">{lead.domain}</dd></>)}
                      {lead.budget && (<><dt className="text-neutral-500">Presupuesto</dt><dd>{lead.budget}</dd></>)}
                    </dl>
                    {lead.details && <p className="text-neutral-400 whitespace-pre-wrap break-words">{lead.details}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
