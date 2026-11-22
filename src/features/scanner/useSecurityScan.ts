'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { TurnstileWidgetRef } from '@/components/TurnstileWidget';
import type { AuditReportRecord } from '@/lib/storage/reportStore';
import { trackScanStart, trackScanComplete } from '@/lib/analytics';

/**
 * Estado y lógica del escáner perimetral de DEFENSA TI:
 * consentimiento legal, Turnstile, llamada a /api/scan y precarga por ?target= o evento set-target-url.
 */
export function useSecurityScan() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReportRecord | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [legalConsent, setLegalConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScan = useCallback(async (targetUrl?: string, overrideConsent?: boolean) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl) return;

    const hasConsent = overrideConsent ?? legalConsent;
    if (!hasConsent) {
      setError('Marca la casilla para confirmar que la web es tuya o que tienes permiso de su dueño.');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setAuditId(null);
    const startTime = Date.now();
    trackScanStart(finalUrl);

    try {
      const scanPromise = fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl,
          legalConsentAccepted: true,
          turnstileToken,
          mode: 'full',
          deep: true,
        }),
      });

      const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 3200));
      const [res] = await Promise.all([scanPromise, minDelayPromise]);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar auditoría');
      }

      const reportData = data.report || data;
      setReport(reportData);
      setAuditId(data.id || (data.report && data.report.id) || 'audit-local');
      trackScanComplete({
        domain: finalUrl,
        score: reportData.score ?? 0,
        grade: reportData.grade || 'F',
        durationMs: Date.now() - startTime,
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de conexión con el motor perimetral';
      setError(msg);
    } finally {
      setLoading(false);
      try {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      } catch {
        // Ignorar si no está montado
      }
    }
  }, [url, legalConsent, turnstileToken]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleSetTarget = (e: Event) => {
        const customEv = e as CustomEvent<string | { url?: string }>;
        const targetVal = typeof customEv.detail === 'string' ? customEv.detail : customEv.detail?.url;
        if (targetVal) {
          setUrl(targetVal);
          const inputEl = document.getElementById('url-scan-input-defensati');
          if (inputEl) {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => inputEl.focus(), 300);
          }
        }
      };

      window.addEventListener('set-target-url', handleSetTarget as EventListener);

      const params = new URLSearchParams(window.location.search);
      const target = params.get('target') || params.get('url');
      if (target) {
        const timer = setTimeout(() => {
          setUrl(target);
          const inputEl = document.getElementById('url-scan-input-defensati');
          if (inputEl) {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => inputEl.focus(), 300);
          }
        }, 150);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('set-target-url', handleSetTarget as EventListener);
        };
      }

      return () => {
        window.removeEventListener('set-target-url', handleSetTarget as EventListener);
      };
    }
  }, []);

  return {
    url, setUrl, loading, report, setReport, auditId, setAuditId, error, setError,
    legalConsent, setLegalConsent, setTurnstileToken, turnstileRef, resultsRef, handleScan,
  };
}
