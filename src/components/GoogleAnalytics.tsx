import Script from 'next/script';

/**
 * Google Analytics 4 para todo el sitio.
 * Solo se inyecta si NEXT_PUBLIC_GA_ID está definido con un identificador válido (G-XXXXXXXXXX).
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId || !/^G-[A-Z0-9]{4,20}$/.test(gaId)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
