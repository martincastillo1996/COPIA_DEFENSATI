'use client';

import { useEffect, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF';

/** Texto que se "desencripta" letra a letra. Respeta prefers-reduced-motion. */
export default function ScrambleText({ text, delay = 0, speed = 28, className = '' }: { text: string; delay?: number; speed?: number; className?: string }) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let iv: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        frame += 1;
        const fixed = Math.floor(frame / 2);
        setOut(
          text
            .split('')
            .map((ch, i) => (ch === ' ' || i < fixed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(''),
        );
        if (fixed >= text.length) clearInterval(iv);
      }, speed);
    }, delay);
    return () => { clearTimeout(start); if (iv) clearInterval(iv); };
  }, [text, delay, speed]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}
