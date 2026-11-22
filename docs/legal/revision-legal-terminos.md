# Revisión legal: términos y privacidad (para el abogado)

Cambios de redacción para que el texto diga lo que el producto hace. No son asesoría legal: cada decisión final es del abogado.

| Tema | Decía | El producto hace | Cambié | Decide el abogado |
|---|---|---|---|---|
| Sondeo de puertos | Parte de la técnica no intrusiva para cualquier dominio | Solo si se demuestra titularidad (DNS TXT `_defensati-verify.<dominio>` o `/.well-known/defensati-verify.txt`); falla cerrado | Cláusula 2 y servicio 1 | Si la prueba técnica basta como autorización |
| Pruebas activas | No se mencionaban | Solo con autorización firmada (hash SHA-256), ventana de fechas y alcance por host | Cláusula 2 | Redacción del contrato de autorización |
| "Pasivo" | "Escaneo pasivo" | Consultas externas, sin puertos salvo titularidad | Servicio 1 | Si "no intrusivo" es la palabra adecuada |
| Retención | "Caché 24 h" | Resultados públicos 24 h; registro inalterable de declaraciones y autorizaciones; informes según lo pactado | Sección de retención | Plazos de conservación de esos registros (no fijé ninguno) |
| Terceros | Cloudflare, DigitalOcean, Meta, Google, Culqi | Además: crt.sh, CertSpotter, DNS públicos, geolocalización de IP, proveedor de IA | Nueva tarjeta en sección 4 | Si requieren mención como encargados y las cláusulas de transferencia |

Sin cambios: indemnidad, ARCO, plazos tributarios y de reclamaciones. No cité artículos ni plazos nuevos.
