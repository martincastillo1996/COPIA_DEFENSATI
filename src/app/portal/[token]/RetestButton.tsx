'use client';

import { useState } from 'react';

export default function RetestButton({ token, disabled }: { token: string; disabled: boolean }) {
  const [state, setState] = useState<{ busy: boolean; message?: string; ok?: boolean }>({ busy: false });

  async function ask() {
    setState({ busy: true });
    try {
      const res = await fetch('/api/portal/retest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      setState(res.ok
        ? { busy: false, ok: true, message: 'Solicitud recibida. Verás el resultado aquí en unos minutos.' }
        : { busy: false, ok: false, message: data.error || 'No se pudo solicitar el re-test.' });
    } catch {
      setState({ busy: false, ok: false, message: 'Sin conexión. Inténtalo de nuevo.' });
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={ask}
        disabled={disabled || state.busy || state.ok}
        className="border border-white/30 px-4 py-2 text-sm font-semibold text-[#EDEDED] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state.busy ? 'Enviando…' : 'Ya corregí: volver a probar'}
      </button>
      {state.message && (
        <p role="status" className={`text-sm ${state.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}
