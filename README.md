# Café Lumbre — plantilla "recorre, elige y compra" (demo con tu marca)

Plantilla de una sola página (100% estática, lista para Vercel) que convierte un
negocio físico en una **experiencia inmersiva de venta**:

## El concepto (lo que hace distinta a las demás)
1. **Recorrido por el local**: al hacer scroll se camina entre rincones (Mostrador →
   Salón → Terraza → Cocina). En cada rincón hay **hotspots tocables**: "Espresso $55"
   agrega al pedido; "Reservar mesa" lo lleva a la reserva pre-cargada.
2. **Vista 360**: panorama arrastrable (o girando el celular) del local, capturada con
   fotos que toma el propio dueño; sin Matterport ni modelado 3D.
3. **Carta digital con carrito**: agrega productos, barra flotante con total, y el
   pedido viaja a **WhatsApp con mensaje prellenado** (o link de pago Stripe/OXXO).
4. **Reserva de mesa** en 20 segundos → WhatsApp.
5. **Barista AI**: chat que atiende 24/7, sugiere, guía y cierra la venta (con LVMs
   opcionalmente conectable a una IA real). Todo es foto + código: **no hay modelado 3D**.

## Por qué es el demo con tu marca
El footer y textos dicen "Demo creada por Tu marca": es una muestra que tú presentas
a clientes para vender el servicio "le convierto tu negocio en un recorrido donde la
gente pide y reserva".

## Estructura
```
index.html          página (hero, recorrido, 360, carta, reserva, chat, carrito)
styles.css          sistema de diseño (editorial café: crema + espresso + terracota)
js/app.js           recorrido, hotspots, 360, carta+carrito, reserva, chat IA
favicon.svg
```

## Se adapta a otros giros (cambiar fotos + textos + WhatsApp)
- Restaurante → carta por platos, reserva por zona, "ver mesa" hotspot.
- Spá / estética / barbería → servicios + paquetes, agendado de cita con recordatorio.
- Tienda / boutique → catálogo con tallas/números y pedido por WhatsApp.
- Hotel / glamping → habitaciones tocables, disponibilidad y apartado con depósito.

## Datos y placeholders por reemplazar
- `js/app.js` → `WA` (teléfono WhatsApp), `MENU` (carta real con fotos/precios).
- `index.html` → marca, teléfono, dominio canonical (`cafe-lumbre.vercel.app`), fotos.
- Vistas 360 reales: 3–5 fotos de teléfono en modo panorámico por rincón.