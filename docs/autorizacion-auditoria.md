# Autorización de auditoría de seguridad (plantilla)

> Plantilla de trabajo, no asesoría legal. Que la revise tu abogado antes de usarla con un cliente.
> Convierte el PDF firmado en la prueba que `audit:cli new` guarda y vigila con su huella SHA-256:
> si alguien modifica el archivo, la autorización se invalida sola.

## 1. Partes

- **Titular del sistema (el cliente):** razón social, RUC, representante legal y cargo.
- **Auditor:** DEFENSA TI, a cargo de [nombre], RUC [número].

El firmante declara ser titular de los sistemas descritos, o contar con facultades para autorizar su revisión
(incluidos los terceros que los alojan, si el contrato con ellos lo exige).

## 2. Alcance

| Elemento | Detalle |
|---|---|
| Dominio principal | `ejemplo.pe` |
| Subdominios y hosts incluidos | `www.ejemplo.pe`, `api.ejemplo.pe` |
| Direcciones IP incluidas | (opcional) |
| Quedan fuera | Todo lo no listado, y los servicios de terceros (pasarelas de pago, correo, CDN) |

El auditor solo probará los hosts listados. Cualquier otro será rechazado por el sistema.

## 3. Pruebas autorizadas (marca lo que corresponda)

- [ ] **Revisión externa no intrusiva:** certificados, cabeceras, DNS, puertos, versiones visibles, rastreo de solo lectura.
- [ ] **Pruebas activas (`--active`):** el auditor puede enviar entradas manipuladas (XSS, inyección SQL, redirecciones)
      que **pueden crear, alterar o borrar datos**. Solo en entorno de pruebas o con copia de seguridad verificada.
- [ ] **Pruebas con sesión (`auth`):** el cliente entrega dos cuentas de prueba sin datos reales.
- [ ] **ZAP con sesión (`--staging --active`):** únicamente en un entorno de pruebas sin datos reales.
- [ ] **Revisión interna (`--internal`):** el cliente entrega código fuente, informe de Lynis y/o autoriza consultar credenciales
      filtradas del dominio.

Quedan **excluidas**, salvo pacto expreso por escrito: denegación de servicio, ingeniería social, acceso físico, fuerza bruta
contra cuentas reales, y explotación para extraer o modificar datos de producción.

## 4. Ventana y ritmo

- **Fechas:** del `AAAA-MM-DD` al `AAAA-MM-DD` (hora de Perú). Fuera de esa ventana el sistema rechaza toda prueba.
- **Horario preferente:** [ej. 20:00 a 06:00].
- **Ritmo máximo:** [5] peticiones por segundo hacia el sitio.
- **Entorno:** [producción / staging].
- **Contacto de emergencia del cliente** (puede pedir la parada en cualquier momento): nombre, teléfono, correo.
  La parada se aplica con `audit:cli stop <id>` o `estop`.

## 5. Verificación de titularidad

El cliente publicará, antes de la primera prueba, **una** de estas dos pruebas de control:

- Registro TXT `_defensati-verify.<dominio>` con el valor que entrega el auditor.
- Archivo `https://<dominio>/.well-known/defensati-verify.txt` con ese mismo valor.

Se vuelve a comprobar en cada escaneo: si se retira, las pruebas se detienen.

## 6. Datos personales y confidencialidad

- El auditor no buscará ni conservará datos personales. Si accede a alguno por accidente, lo notificará al cliente
  y no lo copiará a sus informes.
- Los informes y la evidencia son confidenciales y se entregan solo al contacto autorizado, por el portal del cliente
  o por un canal acordado.
- **Retención:** [12 meses] desde la entrega; después se borran, salvo obligación legal.
- Tratamiento conforme a la Ley N.° 29733 y su reglamento vigente.

## 7. Resultados y alcance de la garantía

- El auditor entrega un informe con hallazgos, cómo se explotarían, impacto y plan de corrección.
- Un análisis automático **no demuestra la ausencia de fallos**: no cubre la lógica de negocio salvo que se contrate
  una revisión manual específica.
- **Re-test:** el cliente puede pedir volver a probar lo corregido durante la ventana autorizada.

## 8. Responsabilidad

- El cliente es responsable de contar con copias de seguridad y de avisar a sus proveedores de alojamiento.
- El auditor actuará con diligencia profesional dentro de lo autorizado y responderá por actos fuera del alcance.
- Tope de responsabilidad: [monto o "honorarios de este encargo"]. Seguro de responsabilidad profesional: [póliza].

## 9. Marco legal

Las partes reconocen que las pruebas descritas se realizan con autorización expresa del titular, en el marco de la
Ley N.° 30096 (delitos informáticos). Toda actuación fuera de este documento no está autorizada.

## 10. Firmas

Titular: ______________________  Fecha: ____________

Auditor: ______________________  Fecha: ____________
