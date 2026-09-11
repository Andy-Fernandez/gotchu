# Reglas de negocio operativas

**Alcance:** MVP cerrado para una barbería y una ubicación  
**Estado:** base implementable para el piloto  
**Fuente:** *Barbershop Local Operating System — Strategic Lean MVP Guide v0.4*  
**Última actualización:** 2026-09-11

Este documento es la fuente de verdad para los casos operativos que suelen quedar ambiguos entre producto, diseño y backend. Complementa `core-workflows.md` y `domain-model.md`.

## Cómo interpretar las reglas

- **Regla firme:** deriva directamente de los principios y restricciones del documento estratégico.
- **Default de piloto:** cierra un valor que el documento original dejó abierto. Se implementa como configuración y se valida con la barbería antes o durante el piloto.
- Una interfaz nunca puede prometer un estado que el backend todavía no confirmó.
- Las excepciones financieras o de agenda requieren actor, motivo y auditoría.

## Defaults que deben validarse con la barbería

| Configuración | Default inicial | Estado |
|---|---:|---|
| Duración del hold | 10 minutos | Regla firme |
| Anticipación mínima para reserva online | 2 horas antes del inicio | Decisión de producto para el MVP |
| Horizonte máximo de reserva online | 1 mes desde la fecha actual | Decisión de producto para el MVP |
| Separación entre inicios de slots | 15 minutos | Decisión de producto para el MVP |
| Objetivo de revisión del anticipo | 2 horas acumuladas dentro del horario abierto de la barbería | Decisión de producto para el MVP |
| Anticipación mínima para cancelar sin penalización | 24 horas | Decisión de producto para el MVP; configurable |
| Anticipación mínima para reprogramar sin penalización | 8 horas | Decisión de producto para el MVP; configurable |
| Reprogramaciones con transferencia de anticipo | 1 por reserva | Decisión de producto para el MVP |
| Anticipo predeterminado | 20% del total | Decisión de producto para el MVP; configurable |
| Modalidad del anticipo | Porcentaje o monto fijo en BOB, con override por servicio | Decisión de producto para el MVP |
| Margen de tolerancia para no-show | 10 minutos | Decisión de producto para el MVP; configurable |
| Buffer final de una reserva combinada | 10 minutos | Decisión de producto para el MVP; configurable |
| Plazo máximo para devolución manual | 24 horas desde la solicitud | Decisión de producto para el MVP; validar operación y normativa |
| Ventana de reemplazo del comprobante | 1 hora, con tope 30 minutos antes de la cita | Decisión de producto para el MVP |
| Retención del archivo del comprobante | 180 días después del cierre financiero | Default de piloto; validar normativa contable y privacidad |
| Tamaño máximo del comprobante | 10 MB | Default técnico de piloto |

## 1. Hold, upload y revisión del anticipo

### 1.1 Creación y expiración del hold

- El backend recalcula disponibilidad, asigna un profesional exacto y crea el hold de forma atómica.
- El hold dura 10 minutos desde el timestamp confirmado por el servidor. El reloj del dispositivo es solo informativo.
- Mientras está activo, el intervalo ocupa capacidad y no puede ser tomado por otra reserva, cita manual o walk-in asignado.
- Si no existe un comprobante aceptado por el servidor antes del vencimiento, el hold expira y el intervalo vuelve a estar disponible.
- La limpieza del hold puede ejecutarse en segundo plano, pero cualquier lectura o escritura debe tratar un hold vencido como inactivo aunque el job todavía no lo haya eliminado.
- Un hold vencido no puede revivirse. El cliente debe consultar disponibilidad y crear uno nuevo.

### 1.2 Upload del comprobante

- Seleccionar un archivo en el teléfono no cuenta como upload exitoso. Solo cuenta la respuesta confirmada del servidor.
- El servidor acepta el comprobante únicamente si el hold seguía vigente al recibir y confirmar la operación.
- Cuando el servidor acepta el comprobante, la transición es atómica:

```text
Booking: reserved_pending_review
Payment: pending_review
Interval: occupied
```

- La reserva pendiente de revisión deja de depender del vencimiento original del hold.
- Si el upload falla y el hold sigue vigente, el cliente puede reintentar usando la misma clave de idempotencia.
- Si la respuesta se pierde, el cliente consulta el estado privado antes de volver a enviar. Si el servidor ya lo recibió, muestra `pending_review` y no crea otro registro.
- Si el hold vence antes de que el servidor acepte el archivo, el upload se rechaza, se actualiza la disponibilidad y se solicita elegir otro horario.
- Si el cliente ya realizó el pago QR pero el comprobante no pudo registrarse antes del vencimiento, el sistema no promete la reserva. Debe mostrar un camino de ayuda para que personal autorizado verifique el pago y, si el espacio continúa disponible, cree una cita manual; en caso contrario se transfiere o devuelve el monto según resolución auditada.
- El MVP usa un QR fijo de la barbería. Cada solicitud de anticipo debe comunicar monto exacto, nombre del cliente, horario y código de reserva para que el comprobante pueda vincularse sin depender únicamente de la imagen QR.
- El comprobante puede recibirse por WhatsApp o cargarse desde la aplicación, pero en ambos casos el personal debe registrarlo y vincularlo en Gotchu antes de considerarlo dentro del flujo de revisión.

### 1.3 Revisión humana

- Un comprobante es una declaración de pago, no prueba definitiva.
- Owner puede aprobar, aprobar con diferencia, solicitar otro comprobante o rechazar un comprobante. Manager puede hacerlo solo con permiso financiero explícito; un barber puede hacerlo únicamente si recibe un permiso explícito de revisión financiera. La autorización para devolver dinero es independiente y queda limitada a owner o manager con permiso explícito de devoluciones.
- El revisor verifica destino, monto, existencia de la transacción, fecha/hora, referencia duplicada y legibilidad.
- AI u OCR pueden extraer datos, pero no pueden aprobar dinero.
- Un comprobante ilegible se marca como `needs_replacement`; no se afirma que el pago sea inexistente. Un comprobante cuya transacción no existe se marca `rejected` con motivo `transaction_not_found`. Destino incorrecto, referencia duplicada, monto diferente y otros rechazos conservan su motivo específico.
- El cliente puede cargar otro comprobante desde su pantalla privada. El comprobante anterior y su revisión se conservan; el reemplazo crea una nueva declaración vinculada y vuelve a revisión, sin sobrescribir historia.
- Mientras la reserva permita un comprobante de reemplazo, continúa `reserved_pending_review` y su intervalo permanece protegido. La ventana para reemplazarlo es de 1 hora desde la solicitud, con un tope absoluto de 30 minutos antes de la cita, lo que ocurra primero. Al vencer la ventana sin un reemplazo, una transición autoritativa puede cerrar la reserva y liberar el espacio; no se confirma automáticamente.
- El objetivo inicial es revisar dentro de 2 horas acumuladas dentro del horario abierto configurado de la barbería.
- El reloj del objetivo corre únicamente mientras la barbería está abierta. Si el comprobante llega fuera de horario, comienza en la siguiente apertura; si llega cerca del cierre, se pausa al cerrar y continúa en la siguiente apertura.
- La pantalla del cliente debe mostrar una expectativa realista: “Revisaremos tu comprobante en un plazo de hasta 2 horas durante nuestro horario de atención”, junto con el próximo horario de apertura cuando corresponda.
- Al superar el objetivo, la interfaz muestra un indicador derivado `reviewOverdue = true`; `Booking` continúa en `reserved_pending_review` y `Payment` en `pending_review`. El sistema alerta al manager y owner.
- Una reserva con comprobante enviado **no se confirma, rechaza ni libera automáticamente** por falta de revisión. Permanece protegida hasta una resolución humana para evitar vender dos veces un espacio posiblemente pagado.
- Si llega la hora del servicio sin revisión, el caso aparece como urgente en el tablero. Cuando owner o manager esté disponible, debe verificarlo antes de atender, rechazar o reasignar.
- Si al llegar la hora no hay owner o manager disponible, el barber asignado puede iniciar el servicio después de aceptar una advertencia explícita de “anticipo pendiente de revisión”. Esto no aprueba el anticipo ni cambia el estado del pago; la excepción registra actor y timestamp y el caso continúa pendiente de resolución financiera.
- Cada decisión registra actor, hora, resultado, referencia revisada y motivo cuando existe rechazo o diferencia.

### 1.4 Evolución a confirmación bancaria automática

- El MVP usa carga de comprobante y revisión humana. No selecciona ni integra todavía un proveedor de confirmación bancaria.
- La arquitectura debe mantener la verificación de pagos detrás de una operación controlada e intercambiable para incorporar posteriormente proveedores como Libélula u otros servicios compatibles, sin cambiar el dominio de reservas ni crear un flujo de pago paralelo.
- Una integración futura debe ingresar por endpoints o webhooks autenticados, validar firma, destinatario, moneda, monto, referencia y unicidad, y procesar reintentos de forma idempotente antes de cambiar el estado del pago.
- La confirmación automática y la revisión humana deben producir transiciones mediante el mismo servicio de dominio y registrar el origen de la verificación, proveedor, referencia y timestamps para conciliación y auditoría.
- Si el proveedor no responde, entrega datos incompletos o existe una diferencia, la reserva permanece `reserved_pending_review` y el pago `pending_review` hasta resolución humana. La indisponibilidad del proveedor nunca libera ni confirma automáticamente el intervalo.
- Antes de integrar un proveedor se requiere un ADR que evalúe cobertura en Bolivia, contrato y regulación, seguridad de webhooks, costos, tiempos de confirmación, conciliación, reversos, disponibilidad y estrategia de fallback.
- La confirmación automática de anticipos no implica devoluciones automáticas; estas permanecen fuera del MVP hasta una decisión independiente.
- Una fase futura podrá usar un QR o enlace único por reserva y confirmación autenticada del proveedor, pero no forma parte del MVP ni se ha seleccionado proveedor.

## 2. Confirmación y comunicación con el cliente

- La fuente autoritativa del estado es la pantalla privada de reserva, accesible mediante un token no adivinable.
- Inmediatamente después del upload, la pantalla muestra “anticipo pendiente de revisión”; nunca “confirmado”.
- Al aprobarse el anticipo, la pantalla privada cambia a `confirmed` y muestra barbería, servicio, profesional, fecha/hora, monto total, anticipo, saldo y política aplicable.
- Para el primer MVP, la combinación recomendada es:

  1. Pantalla privada automática y autoritativa.
  2. WhatsApp manual con plantilla enviada por manager u owner después de revisar.

- Un mensaje automático de WhatsApp queda fuera del MVP hasta seleccionar proveedor, obtener consentimiento apropiado y definir manejo de fallos y costos.
- El WhatsApp manual es una notificación complementaria. Si contradice la pantalla privada, el personal debe corregir el estado en Gotchu; no se mantiene una confirmación paralela solo en el chat.
- Toda pantalla y plantilla debe distinguir claramente `held`, `pending_review`, `confirmed`, `rejected`, `cancelled`, `rescheduled` y `no_show`.

## 3. Cancelación, reprogramación, no-show y devolución

### 3.1 Reprogramación

- Default inicial: una sola reprogramación gratuita cuando faltan al menos 8 horas para el inicio. El umbral se configura por barbería y es independiente del umbral de cancelación.
- El anticipo se transfiere completo a la reserva reemplazante. Una nueva reserva se crea solo después de revalidar disponibilidad, duración, profesional exacto y buffer.
- No se sobrescribe la reserva original:

```text
Original: rescheduled
Replacement: confirmed
Payment: transferred
```

- El nuevo horario debe caber completo, incluyendo buffer, y la reserva original conserva su historial y vínculo con la reemplazante.
- Una segunda transferencia automática no está permitida. Una solicitud con menos de 8 horas se trata como cambio tardío: se retiene el anticipo y una nueva reserva requiere un anticipo nuevo. No se crea un sistema general de excepciones automáticas.

### 3.2 Cancelación por el cliente

- La política completa debe mostrarse antes del pago.
- Desde el enlace privado, el cliente puede cancelar inmediatamente después de confirmar una advertencia que explica la liberación del horario y el posible tratamiento del anticipo.
- La cancelación y liberación del intervalo se ejecutan de forma atómica en el servidor. La interfaz solo comunica éxito después del commit autoritativo.
- Cancelar la reserva no elimina ni resuelve automáticamente un comprobante o pago. Si existe un anticipo pendiente o aprobado, su revisión, transferencia, retención o devolución sigue la política financiera y conserva su historial.
- Con 24 horas o más, el cliente no recibe penalización y puede elegir entre transferir el anticipo a otra cita o solicitar una devolución completa mediante un proceso manual por WhatsApp.
- La devolución solicitada por el cliente no es automática: owner o manager con permiso explícito de devoluciones la registra, la ejecuta por el canal operativo disponible y la completa en un máximo de 24 horas desde la solicitud. Se conservan monto, método, referencia, actor y timestamps.
- Con menos de 24 horas, se retiene el 100% del anticipo como penalización. La cancelación libera el intervalo después de confirmar la transición autoritativa, sin afectar otras reservas.

### 3.3 No-show

- Solo se marca no-show después de la hora programada y del margen de tolerancia configurado por la barbería.
- Default inicial para el margen: 10 minutos, configurable por barbería.
- El anticipo se retiene por defecto como penalización.
- Barber puede marcar no-show únicamente sobre una cita asignada a su agenda; manager y owner pueden hacerlo para cualquier cita de la barbería.
- Revertir un no-show requiere manager u owner, motivo y auditoría.
- Tras marcar no-show, el intervalo restante puede reutilizarse para un walk-in u otra asignación solo si el servicio completo más su buffer cabe antes de la siguiente cita protegida. Las citas confirmadas nunca se desplazan.
- Si el cliente original llega después de marcar no-show, no desplaza la asignación nueva; espera otro hueco disponible.
- Si llega dentro de la tolerancia, el barbero puede acortar el servicio para proteger la siguiente cita, pero el cliente paga el precio completo.

### 3.4 Cancelación por la barbería

- El cliente elige entre transferencia completa a otra reserva o devolución completa del anticipo.
- La barbería no puede retener el anticipo cuando ella cancela.
- La cancelación registra actor y motivo, y libera la capacidad solo después de confirmar la transición.
- Esta regla aplica aunque la cancelación ocurra el mismo día. El MVP no aplica penalizaciones a la barbería ni promete descuentos o compensaciones adicionales.

### 3.5 Devoluciones

- No existen devoluciones automáticas en el MVP.
- Owner autoriza la devolución; manager puede prepararla o marcarla completada solo si recibió permiso financiero específico.
- El estado pasa por `refund_pending` y luego `refunded`. Nunca se elimina ni reescribe el pago original.
- Default inicial: completar la devolución manual dentro de 24 horas desde la solicitud y registrar método, referencia, monto, actor y timestamp.
- Las políticas de retención, devolución y pérdida del anticipo deben validarse legalmente antes de uso comercial amplio.

## 4. Autenticación y permisos del personal

### 4.1 Reglas comunes

- Todo acceso de staff requiere autenticación; no se permiten cuentas compartidas.
- El proveedor de autenticación aún no está decidido, pero la autorización siempre se aplica en el backend.
- Cada acción verifica membresía en la barbería, rol, alcance del profesional, permiso financiero y propiedad del recurso.
- La interfaz oculta acciones no permitidas, pero ocultarlas no sustituye la autorización del servidor.
- Owner asigna o revoca roles. Los cambios de rol invalidan sesiones cuando reducen permisos y siempre se auditan.
- Cliente no necesita cuenta para la primera reserva; accede a su reserva mediante token privado.
- El MVP no usa OTP para verificar el número de WhatsApp del cliente. La interfaz normaliza el formato, muestra el número en el resumen y exige confirmación visual antes de enviar.
- Un número sin OTP se considera dato de contacto declarado, no identidad verificada. La autorización para consultar o gestionar la reserva depende del token privado, no del número de WhatsApp.

### 4.2 Matriz inicial

| Acción | Barber | Manager | Owner |
|---|:---:|:---:|:---:|
| Ver agenda propia | Sí | Sí | Sí |
| Ver toda la agenda de la barbería | No | Sí | Sí |
| Registrar walk-in propio | Sí | Sí | Sí |
| Asignar o reasignar walk-ins | Solo hacia sí mismo | Sí | Sí |
| Crear cita manual | No | Sí | Sí |
| Iniciar/completar servicio asignado a sí mismo | Sí | Solo si también es el profesional asignado | Solo si también es el profesional asignado |
| Corregir estado de servicio de otro profesional | No | Sí, como excepción y con motivo | Sí, como excepción y con motivo |
| Registrar saldo final pagado | Sí, en servicio propio | Sí | Sí |
| Editar un pago ya registrado | No | Solo con permiso financiero y motivo | Sí, con motivo |
| Marcar no-show | Agenda propia | Toda la barbería | Toda la barbería |
| Aprobar/rechazar anticipo | Solo con permiso de revisión financiera explícito | Solo con permiso financiero | Sí |
| Aprobar con diferencia | Solo con permiso de revisión financiera explícito y nota | Solo con permiso financiero y nota | Sí, con nota |
| Omitir anticipo | No | Solo con permiso financiero y motivo | Sí, con motivo |
| Autorizar devolución | No | Solo con permiso explícito de devoluciones | Sí |
| Configurar servicios, depósitos y política | No | No por defecto | Sí |
| Crear bloqueo operativo del día | No | Sí | Sí |
| Editar horarios recurrentes y feriados | No | No por defecto | Sí |
| Gestionar personal y roles | No | No | Sí |
| Ver métricas operativas | Propias | Barbería | Barbería |
| Exportar datos y ver auditoría sensible | No | No por defecto | Sí |

- Los permisos opcionales de manager son flags explícitos, no una ampliación implícita del rol.
- Platform operator no aparece en la matriz del negocio: solo accede bajo una sesión de soporte autorizada, temporal y auditada; nunca altera silenciosamente registros financieros.

## 5. Servicios, duración, buffer y profesionales habilitados

- Cada servicio activo define nombre, descripción, precio total, duración, buffer predeterminado, modalidad/valor de anticipo opcional y profesionales habilitados.
- Owner crea o modifica servicios. Manager solo puede hacerlo si en el futuro recibe un permiso explícito de configuración.
- Duración debe ser mayor que cero; buffer puede ser cero o mayor. Ambos se expresan en minutos enteros.
- El intervalo ocupado es:

```text
scheduledEnd = start + duration + buffer
```

- Un slot es válido únicamente si el intervalo completo cabe dentro del horario y no se superpone con capacidad protegida.
- “Cualquier profesional” siempre se resuelve a un profesional exacto y habilitado antes de crear el hold.
- Un profesional no puede ofrecer un servicio si su relación de elegibilidad está inactiva, aunque tenga espacio libre.
- Precio, duración, buffer, anticipo y profesional se guardan como snapshot en la reserva. Cambios posteriores al catálogo no modifican reservas existentes.
- Una reserva combinada suma las duraciones de sus servicios, se asigna completa a un solo barbero y usa un bloque continuo con un único buffer final inicial de 10 minutos, configurable. No se suman buffers entre servicios combinados.
- El anticipo de una reserva combinada se calcula sobre el total y se guarda con su modalidad, valor y monto aplicado.
- Cambiar duración o buffer no mueve silenciosamente citas confirmadas. Los conflictos resultantes requieren resolución manual y auditada.
- Un add-on solo se agrega si el intervalo extendido continúa cabiendo antes del siguiente compromiso protegido.

## 6. Horarios, descansos, feriados y bloqueos

- La disponibilidad se calcula usando zona horaria `America/La_Paz` para la barbería inicial.
- La precedencia de capacidad, de mayor a menor, es:

  1. Cierre excepcional o feriado.
  2. Bloqueo manual del profesional o de toda la barbería.
  3. Descanso del profesional.
  4. Horario laboral del profesional.
  5. Horario abierto de la barbería.

- Un profesional solo está disponible donde coinciden el horario abierto de la barbería y su horario laboral.
- Los horarios recurrentes se configuran por día de semana.
- Feriados y cierres excepcionales son overrides por fecha; por defecto cierran todo el día, pero owner puede definir horario especial.
- Descansos tienen inicio y fin y no generan slots dentro de ese intervalo.
- Manager y owner pueden crear bloqueos manuales del día. Solo owner modifica horarios recurrentes o cierres futuros por defecto.
- Crear un bloqueo que afecte una reserva confirmada no la cancela ni mueve. El sistema muestra el conflicto y exige resolución manual.
- Toda modificación de horario, feriado o bloqueo registra actor y timestamps. Los cambios que afectan reservas también requieren motivo.

### 6.1 Ventana y cadencia de reserva online

- El inicio más temprano que puede ofrecerse públicamente es 2 horas después de la hora actual confirmada por el servidor. El valor es configurable por barbería.
- Para solicitudes con menos de 2 horas no se promete confirmación online: el staff puede gestionarlas manualmente por WhatsApp si está disponible; si no, el cliente puede presentarse como walk-in sin anticipo.
- El inicio más lejano que puede ofrecerse está dentro de 1 mes desde la fecha actual de la barbería.
- Los posibles inicios se generan cada 15 minutos, pero solo se muestran cuando el servicio completo más su buffer cabe dentro del horario y no se superpone con capacidad protegida.
- La anticipación, el horizonte y la cadencia restringen qué opciones se muestran; nunca sustituyen la revalidación atómica al crear el hold.

## 7. Almacenamiento y retención de comprobantes

- Los comprobantes se almacenan en almacenamiento privado, nunca en una URL pública permanente.
- El servidor valida MIME y tamaño, genera el nombre del objeto y no confía en el nombre del dispositivo.
- Default inicial: aceptar JPEG, PNG, WebP y HEIC/HEIF hasta 10 MB. Otros formatos se rechazan con mensaje claro.
- El acceso se concede mediante URL firmada de corta duración o streaming autorizado. Solo owner y manager con permiso financiero pueden ver el archivo.
- Barber no puede ver comprobantes bancarios.
- Platform operator solo accede durante soporte autorizado y auditado.
- No se copia contenido bancario innecesario a eventos, logs, analytics ni auditoría.
- El hash del archivo puede usarse como señal secundaria de duplicado, nunca como única prueba de fraude.
- Default inicial: conservar el archivo hasta 180 días después de completar, cancelar o resolver la devolución. Luego se elimina mediante un job auditable.
- Los datos estructurados mínimos del pago y su auditoría pueden conservarse por un plazo distinto definido por requisitos legales y contables.
- Antes del piloto pagado se debe confirmar el plazo con asesoría legal/contable y reflejarlo en la política de privacidad.

## 8. Idempotencia y protección contra doble toque

- Deshabilitar el botón mientras se envía mejora UX, pero el backend debe soportar duplicados.
- Requieren clave de idempotencia: creación de hold, upload de comprobante, creación/conversión de reserva, aprobación o rechazo, inicio y finalización de servicio, registro o edición de pago y devolución.
- La misma clave con el mismo payload devuelve el resultado original sin repetir efectos.
- La misma clave con payload diferente responde conflicto y no ejecuta la segunda operación.
- Las restricciones únicas de base de datos protegen referencia de pago cuando aplique, transición única del hold, pago por concepto y ocupación del profesional.
- Dos requests concurrentes para el mismo intervalo producen como máximo un hold exitoso.
- Una operación financiera no se considera exitosa hasta que transacción, auditoría y respuesta autoritativa estén confirmadas.
- Los reintentos por timeout deben consultar primero el estado conocido cuando la operación pudo haber llegado al servidor.

## 9. Operación con mala conexión

- La PWA muestra claramente `online`, `reconectando`, `offline` y hora de última sincronización.
- No se confirma offline ninguna reserva, asignación, aprobación, devolución o pago: todas requieren validación del servidor.
- Datos previamente cargados pueden mostrarse en modo lectura con etiqueta de posible desactualización. No se cachean comprobantes ni tokens privados en almacenamiento compartido inseguro.
- Formularios no financieros pueden conservar un borrador local mínimo para evitar que el usuario vuelva a escribir, pero el usuario confirma el envío al reconectar.
- Uploads fallidos muestran progreso, preservan el hold countdown y permiten reintento idempotente mientras siga vigente.
- Si una acción tiene resultado incierto, la UI consulta estado antes de ofrecer repetirla.
- Durante una caída prolongada, la barbería usa un registro de contingencia único y visible. Al volver la conexión, manager u owner carga esos eventos en orden, marcados como `offline_backfill`, con hora real aproximada y actor.
- La contingencia no se convierte en una segunda agenda permanente. Debe reconciliarse antes de volver a publicar disponibilidad confiable.
- Nunca se comunica al cliente “confirmado” basándose solo en un borrador local o mensaje de WhatsApp.

## 10. Auditoría

- La auditoría es append-only: no se edita ni elimina desde las interfaces operativas.
- Cada evento sensible incluye barbería, entidad, acción, actor, rol, timestamp del servidor, estado anterior y posterior, motivo cuando corresponda, request/idempotency ID y origen de la acción.
- Se auditan como mínimo:

  - Aprobación, rechazo y aprobación con diferencia del anticipo.
  - Omitir anticipo o confirmar sin depósito.
  - Crear, editar o revertir pagos y devoluciones.
  - Cancelar, reprogramar, marcar o revertir no-show.
  - Cambiar precio, duración, buffer, depósito, política o elegibilidad.
  - Cambiar horarios, feriados, descansos o bloqueos que afecten capacidad.
  - Crear citas manuales y realizar backfill de contingencia.
  - Cambiar roles o permisos financieros.
  - Acceso de soporte de platform operator.

- Un motivo es obligatorio en rechazo, diferencia, excepción financiera, acción sobre trabajo de otro profesional, reversión y cambio que afecte una reserva existente.
- La auditoría guarda referencias al comprobante y pago, no una copia del archivo ni datos bancarios completos.

## 11. Métricas mínimas de adopción

La métrica principal es servicios completados y capturados por Gotchu por mes. La métrica crítica es:

```text
schedule capture ratio =
servicios completados registrados en Gotchu
÷ servicios que la barbería estima haber realizado realmente
```

Dashboard mínimo semanal:

- Servicios completados por origen: online, WhatsApp, teléfono, cita presencial y walk-in.
- Schedule capture ratio y método/fecha de la estimación del denominador.
- Staff activo semanalmente y porcentaje de profesionales que inicia/completa servicios.
- Walk-ins registrados versus estimación real.
- Holds creados, expirados y convertidos a comprobante.
- Tiempo mediano y percentil 90 de revisión de anticipos; pendientes vencidos respecto del SLA.
- Aprobaciones, rechazos, diferencias y bypasses de anticipo.
- No-show con anticipo versus citas sin anticipo.
- Cancelaciones, reprogramaciones, transferencias y devoluciones.
- Errores de estimación de cola y conflictos prevenidos.
- Número de servicios completados sin pago final registrado.
- Minutos de soporte del founder o platform operator.

Señales iniciales de adopción saludable:

- Schedule capture por encima de 80% como hipótesis de salida del anchor pilot.
- Cero double bookings prevenibles.
- Mayoría del staff activo semanalmente.
- Walk-ins de días ocupados registrados sin volver a una cola oculta.
- Uso sostenido sin corrección diaria del founder.

No se usan cuentas creadas, page views o reservas no completadas como evidencia aislada de adopción.

## 12. Accesibilidad y ergonomía móvil

- El flujo principal funciona en teléfonos de gama baja y pantallas desde 320 px sin scroll horizontal.
- Áreas táctiles interactivas tienen al menos 44 × 44 px y separación suficiente para evitar doble toque accidental.
- Inputs usan tamaño de texto mínimo de 16 px para evitar zoom involuntario en móviles.
- Texto y controles cumplen WCAG AA; estado, prioridad o error nunca dependen solo del color.
- Todo control tiene nombre accesible, foco visible y orden lógico. Los flujos críticos funcionan con teclado y lector de pantalla.
- Respeta `prefers-reduced-motion` y evita animaciones que bloqueen o retrasen acciones operativas.
- Acciones frecuentes están al alcance de una mano y no dependen de hover, drag preciso o menús ocultos.
- Registrar un walk-in requiere únicamente servicio, preferencia/asignación de profesional e identidad opcional.
- Default de usabilidad: desde el tablero, registrar un walk-in común en máximo 3 decisiones y menos de 20 segundos de mediana durante el piloto.
- Botones financieros y destructivos muestran resultado claro y protegen contra doble toque; confirmaciones adicionales se reservan para acciones irreversibles o sensibles.
- El tablero prioriza “quién sigue”, citas confirmadas en riesgo, pendientes de revisión y servicios sin completar; la densidad visual no puede ocultar estas alertas.
- Errores aparecen junto al campo o acción, preservan los datos ingresados y explican cómo recuperarse.
- El estado de conexión y la última sincronización siempre son visibles durante operación degradada.

## 13. Casos mínimos de prueba

- Dos clientes intentan el mismo slot al mismo tiempo.
- Un cliente consulta exactamente antes y después del límite de 2 horas y del horizonte de 1 mes.
- Un servicio cuya duración no es múltiplo de 15 minutos se valida correctamente contra slots iniciados cada 15 minutos.
- El hold vence sin upload.
- El servidor acepta el upload pero la respuesta no llega al cliente.
- El upload falla antes y después del vencimiento.
- Nadie revisa el anticipo dentro del SLA y llega la hora del servicio.
- Barber inicia un servicio con anticipo pendiente y la acción no aprueba el pago.
- Comprobante ilegible solicita reemplazo; transacción inexistente registra un rechazo distinto; un nuevo archivo conserva la revisión anterior.
- El reemplazo de comprobante vence a la hora o 30 minutos antes de la cita, lo que ocurra primero, y libera el espacio mediante una transición autoritativa.
- Manager sin permiso financiero intenta aprobar.
- Doble toque al crear hold, aprobar, completar servicio y registrar pago.
- Cliente reprograma una vez y luego intenta una segunda vez.
- Cliente reprograma con 8 horas o más, intenta hacerlo con menos de 8 horas y conserva el vínculo histórico.
- Cliente cancela con 24 horas o más, solicita devolución por WhatsApp, y cancela con menos de 24 horas con retención completa del anticipo.
- No-show reutiliza el intervalo solo cuando cabe el servicio completo más buffer; una llegada dentro de tolerancia acorta el servicio y cobra el precio completo.
- Cancelación por barbería ofrece transferencia o devolución sin penalización, incluso el mismo día.
- Servicios combinados quedan en un solo bloque y un solo barbero con buffer final.
- Cambio de duración, buffer, horario o bloqueo que colisiona con una cita confirmada.
- Staff trabaja con mala conexión, hace contingencia y reconcilia al volver.
- Comprobante privado no es accesible por barber ni por URL vencida.
- Flujo completo con lector de pantalla y teléfono de gama baja.

## 14. Validaciones que deben completarse antes del piloto pagado

- Validar legalmente el texto de retención del anticipo, cancelación tardía, no-show y devolución.
- Confirmar con la barbería la operación real del plazo de devolución de 24 horas y quién tendrá el permiso explícito.
- Validar formatos, tamaño y retención de comprobantes.
- Definir quién recibe permisos financieros, de revisión y de devoluciones, y cómo se recupera una cuenta.
- Definir el procedimiento físico de contingencia y reconciliación.
- Medir durante el piloto el buffer final, los tiempos de revisión, las cancelaciones tardías, los no-shows, el uso de espacios liberados y el impacto de la ventana pública de 2 horas.
