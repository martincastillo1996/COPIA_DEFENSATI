/**
 * Validador de Seguridad Cloudflare Turnstile (DEFENSA TI Anti-Bot Engine)
 * 
 * Verifica tokens de desafío mediante la API oficial siteverify de Cloudflare.
 * Endpoint: https://challenges.cloudflare.com/turnstile/v0/siteverify
 */

export interface TurnstileVerifyResult {
  success: boolean;
  hostname?: string;
  challengeTs?: string;
  errorCodes?: string[];
  message?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey =
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
    '0x4AAAAAAF8DbSUESFepvMcACRDOR__8hys';

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return {
      success: false,
      message: 'Token de verificación de Cloudflare Turnstile ausente o inválido.',
      errorCodes: ['missing-input-response'],
    };
  }

  // Token de prueba oficial de Cloudflare para entornos locales / CI
  if (token === 'XXXX.DUMMY.TOKEN.XXXX') {
    return { success: true, hostname: 'localhost' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp && remoteIp !== '127.0.0.1' && remoteIp !== '::1') {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Error de comunicación con Cloudflare Turnstile (HTTP ${res.status}).`,
        errorCodes: ['http-error'],
      };
    }

    const data = await res.json();

    return {
      success: Boolean(data.success),
      hostname: data.hostname,
      challengeTs: data.challenge_ts,
      errorCodes: data['error-codes'],
      message: data.success
        ? 'Verificación humana confirmada por Cloudflare Turnstile'
        : 'Desafío no superado o token expirado/reutilizado.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Error al verificar Cloudflare Turnstile:', errorMsg);
    // En caso de caída de la API de Cloudflare, fail-open controlado solo si hay fallback
    return {
      success: false,
      message: 'Fallo al conectar con el servicio de verificación de Cloudflare.',
      errorCodes: ['network-error'],
    };
  }
}
