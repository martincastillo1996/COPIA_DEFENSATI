'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'flexible' | 'compact';
          callback?: (token: string) => void;
          'error-callback'?: (errorCode: string) => void;
          'expired-callback'?: () => void;
          action?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export interface TurnstileWidgetRef {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (err?: string) => void;
  onExpire?: () => void;
  action?: string;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onVerify, onError, onExpire, action, theme = 'dark', className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    // Callbacks en refs: evita re-renderizar el widget (y perder el token) en cada render del padre
    const cbRef = useRef({ onVerify, onError, onExpire });
    cbRef.current = { onVerify, onError, onExpire };

    const siteKey =
      process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
      // En desarrollo local, el sitekey de prueba de Cloudflare (siempre aprueba) evita el error de dominio no autorizado
      (process.env.NODE_ENV !== 'production' ? '1x00000000000000000000AA' : '0x4AAAAAAF8DbY8yRfaTRdQP');

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            console.error('Error reseteando Turnstile:', e);
          }
        }
      },
    }));

    useEffect(() => {
      // 1. Inyectar el script de Turnstile si no existe
      const SCRIPT_ID = 'cf-turnstile-script';
      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const checkTurnstileLoaded = () => {
        if (window.turnstile) {
          setIsLoaded(true);
        } else {
          setTimeout(checkTurnstileLoaded, 50);
        }
      };

      checkTurnstileLoaded();
    }, []);

    useEffect(() => {
      if (!isLoaded || !containerRef.current || !window.turnstile) return;

      // Si ya existía un widget, limpiarlo antes de re-renderizar
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // Ignorar si ya fue removido
        }
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          action,
          callback: (token: string) => {
            cbRef.current.onVerify(token);
          },
          'error-callback': (errorCode: string) => {
            cbRef.current.onError?.(errorCode);
          },
          'expired-callback': () => {
            cbRef.current.onExpire?.();
          },
        });

        widgetIdRef.current = id;
      } catch (err) {
        console.error('Error renderizando Cloudflare Turnstile:', err);
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch {
            // Ignorar en unmount
          }
        }
      };
    }, [isLoaded, siteKey, theme, action]);

    return (
      <div className={`flex justify-center my-3 transition-opacity duration-300 ${className}`}>
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
