(function () {
  'use strict';

  const WA = '52155XXXXXXXX';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const money = (n) => '$' + n.toLocaleString('es-MX');

  const heroImg = $('.hero-img');
  const revealNow = () => heroImg.classList.add('on');
  if (document.documentElement.classList.contains('js')) setTimeout(revealNow, 150);
  else revealNow();

  const cyc = $('#cyc');
  if (cyc) {
    const list = ['pide.', 'reserva.', 'recorre.'];
    const swapEl = (sp, arr, k) => {
      sp.classList.remove('swap');
      void sp.offsetWidth;
      sp.textContent = arr[k % arr.length];
      sp.classList.add('swap');
      return k;
    };
    let k = 0;
    setInterval(() => { k = swapEl(cyc, list, k + 1); }, 2600);
  }

  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------------- carrito ---------------- */
  const cart = [];
  const cartBar = $('#cartBar');
  const cartChip = $('#cartChip');
  const cartTotal = $('#cartTotal');
  function renderCart() {
    const n = cart.length;
    cartBar.hidden = n === 0;
    cartChip.textContent = n;
    cartTotal.textContent = n ? money(cart.reduce((a, b) => a + b.price, 0)) : '';
  }
  function addToCart(name, price) {
    cart.push({ name, price });
    renderCart();
    if (cartBar.animate) cartBar.animate([{ transform: 'translateX(-50%) scale(1.1)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 220 });
  }
  cartBar.addEventListener('click', () => {
    if (!cart.length) return;
    const lines = cart.map((c) => '- ' + c.name + ' (' + money(c.price) + ')').join('\n');
    const total = cart.reduce((a, b) => a + b.price, 0);
    const msg = 'Hola, quiero mi pedido en Café Lumbre:\n' + lines + '\nTotal: ' + money(total) + '\n¿Confirmas y me indicas cómo pago?';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* ---------------- recorrido ---------------- */
  const walk = $('#recorre');
  const rail = $('#walkRail');
  const rooms = $$('.room');
  const track = $$('#walkTrack span');
  const spanned = () => window.innerWidth > 760 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.classList.contains('js');
  let active = 0;

  function setActive(i) {
    if (i === active) return;
    active = i;
    rooms.forEach((r, idx) => r.classList.toggle('on', idx === i));
    track.forEach((t, idx) => t.classList.toggle('on', idx === i));
  }

  function onScrollWalk() {
    if (!spanned()) return;
    const total = walk.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const p = clamp(-walk.getBoundingClientRect().top / total, 0, 1);
    const n = rooms.length - 1;
    rail.style.transform = 'translate3d(' + (-p * n * 100) + 'vw, 0, 0)';
    const i = Math.round(p * n);
    if (i !== active) setActive(i);
    rooms.forEach((r, idx) => {
      const img = $('img', r);
      if (img) img.style.transform = 'translate3d(' + ((p * n - idx) * 16) + 'px, 0, 0) scale(1.12)';
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(() => { onScrollWalk(); ticking = false; }); ticking = true; } });
  window.addEventListener('resize', () => {
    if (!spanned()) {
      rail.style.transform = '';
      rooms.forEach((r) => { const img = $('img', r); if (img) img.style.transform = ''; });
    }
    onScrollWalk();
  });

  if ('IntersectionObserver' in window) {
    const rio = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) setActive(parseInt(en.target.dataset.room, 10)); }), { threshold: 0.55 });
    rooms.forEach((r) => rio.observe(r));
  }

  track.forEach((t) => t.addEventListener('click', () => {
    const i = parseInt(t.dataset.t, 10);
    window.scrollTo({ top: walk.offsetTop + (i / (rooms.length - 1)) * (walk.offsetHeight - window.innerHeight), behavior: 'smooth' });
  }));

  /* hotspots del recorrido: agregar o reservar */
  $$('.hot', walk).forEach((b) => {
    b.addEventListener('click', () => {
      if (b.dataset.add) {
        addToCart(b.dataset.add, parseInt(b.dataset.price, 10));
        const dot = $('span', b); if (dot) dot.textContent = '✓';
        setTimeout(() => { if (dot && b.dataset.add) dot.textContent = '◉'; }, 900);
      } else if (b.dataset.book) {
        const sel = $('#rZona');
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === b.dataset.book) { sel.value = sel.options[i].value; break; }
        }
        const res = $('#reserva');
        res.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { const d = $('#rDay'); d && d.focus(); }, 650);
      }
    });
  });

  /* ---------------- vista 360 ---------------- */
  const pano = $('#panoWrap');
  const lane = $('#panoLane');
  if (pano && lane) {
    let dragging = false, sx = 0, base = 0;
    const max = lane.scrollWidth - pano.clientWidth;
    const apply = (x) => { base = clamp(x, -max, 0); lane.style.transform = 'translate3d(' + base + 'px, 0, 0)'; };
    pano.addEventListener('pointerdown', (e) => { dragging = true; sx = e.clientX; lane.classList.add('dragging'); if (pano.setPointerCapture) pano.setPointerCapture(e.pointerId); });
    pano.addEventListener('pointermove', (e) => { if (!dragging) return; apply(base + (e.clientX - sx)); });
    const stop = () => { dragging = false; lane.classList.remove('dragging'); };
    pano.addEventListener('pointerup', stop);
    pano.addEventListener('pointercancel', stop);
  }

  /* ---------------- carta digital ---------------- */
  const MENU = [
    { name: 'Espresso doble', desc: 'Café de Chiapas · taza 6 oz · crema densa', price: 55, tag: 'Espresso', img: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=900&q=80&auto=format&fit=crop' },
    { name: 'Latte de lavanda', desc: 'Doble shot · leche vaporizada · lavanda de Veracruz', price: 85, tag: 'Firma de la casa', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&q=80&auto=format&fit=crop' },
    { name: 'Cappuccino clásico', desc: 'Espresso + microespuma · arte latte en taza', price: 70, tag: 'Espresso', img: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=900&q=80&auto=format&fit=crop' },
    { name: 'Cold brew tinto', desc: '12 h de extracción en frío · nota a chocolate', price: 65, tag: 'Fríos', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop' },
    { name: 'Croissant de almendra', desc: 'Hojaldre de la casa · relleno de crema de almendra', price: 65, tag: 'Panadería', img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80&auto=format&fit=crop' },
    { name: 'Sándwich de pavo ahumado', desc: 'Panes de la casa · queso oaxaca · pesto', price: 120, tag: 'Comida', img: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=900&q=80&auto=format&fit=crop' },
  ];
  const menuEl = $('#menu');
  MENU.forEach((m) => {
    const it = document.createElement('article');
    it.className = 'menu-item';
    it.innerHTML = '<img src="' + m.img + '" alt="' + m.name + '" loading="lazy" /><div class="mi-body"><span class="mi-tag">' + m.tag + '</span><b class="mi-name">' + m.name + '</b><p class="mi-desc">' + m.desc + '</p><div class="mi-foot"><span class="mi-price">' + money(m.price) + '</span><button class="add-btn" type="button">Agregar</button></div></div>';
    const btn = $('.add-btn', it);
    btn.addEventListener('click', () => {
      addToCart(m.name, m.price);
      btn.textContent = '✓ Agregado';
      btn.classList.add('added');
      setTimeout(() => { btn.textContent = 'Agregar'; btn.classList.remove('added'); }, 1000);
    });
    menuEl.appendChild(it);
  });

  /* ---------------- reserva ---------------- */
  const today = new Date();
  today.setDate(today.getDate() + 1);
  $('#rDay').min = today.toISOString().split('T')[0];
  $('#rSend').addEventListener('click', () => {
    const msg = 'Hola, quiero reservar en Café Lumbre:\nZona: ' + $('#rZona').value + '\nDía: ' + $('#rDay').value + '\nHora: ' + $('#rHour').value + '\nPersonas: ' + $('#rPeople').value + '\n¿Confirman?';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* ---------------- chat IA (barista) ---------------- */
  const chat = $('#chat');
  const chatBody = $('#chatBody');
  const chatQs = $('#chatQs');
  const chatIn = $('#chatIn');
  const chatTxt = $('#chatTxt');
  let opened = false;

  const scrollChat = () => { chatBody.scrollTop = chatBody.scrollHeight; };
  function bot(text) { const m = document.createElement('div'); m.className = 'c-msg c-bot'; m.textContent = text; chatBody.appendChild(m); scrollChat(); }
  function me(text) { const m = document.createElement('div'); m.className = 'c-msg c-me'; m.textContent = text; chatBody.appendChild(m); scrollChat(); }
  function chips(arr) {
    chatQs.innerHTML = '';
    arr.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'q-chip';
      b.textContent = c.label;
      b.addEventListener('click', () => { me(c.label); c.run(); });
      chatQs.appendChild(b);
    });
  }
  const go = (sel) => { const el = document.querySelector(sel); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  function askCart() {
    if (cart.length) {
      bot('Llevas ' + cart.length + ' producto(s): ' + cart.map((c) => c.name).join(', ') + ' · ' + money(cart.reduce((a, b) => a + b.price, 0)) + '. ¿Confirmamos tu pedido?');
      chips([
        { label: 'Confirmar pedido ➤', run: () => { setTimeout(() => cartBar.click(), 350); } },
        { label: 'Seguir viendo la carta', run: () => go('#carta') },
      ]);
    } else {
      bot('Aún no tienes nada en tu pedido. Te dejo la carta para que elijas.');
      chips([{ label: 'Ver la carta', run: () => go('#carta') }]);
    }
  }

  $('#cbFab').addEventListener('click', () => {
    chat.hidden = !chat.hidden;
    $('#cbFab').classList.remove('busy');
    if (!chat.hidden && !opened) {
      opened = true;
      setTimeout(() => {
        bot('Hola, soy el barista virtual ☕ ¿Qué te damos hoy?');
        chips([
          { label: 'Quiero pedir', run: askCart },
          { label: 'Reservar mesa', run: () => { bot('¡Claro! Te llevo a la reserva:'); setTimeout(() => go('#reserva'), 350); } },
          { label: '¿Horario?', run: () => bot('Abierto de 8:00 a 22:00, todos los días ☀️') },
          { label: '¿Hacen envíos?', run: () => bot('Sí, entregamos en un radio de 4 km en ~30 min. Pide desde la carta y confirma en WhatsApp.') },
        ]);
        setTimeout(() => chatTxt.focus(), 300);
      }, 200);
    }
  });

  chatIn.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = chatTxt.value.trim();
    if (!v) return;
    me(v);
    chatTxt.value = '';
    const t = v.toLowerCase();
    if (t.includes('pedir')) { askCart(); return; }
    if (t.includes('reserv')) { bot('Te llevo a la reserva:'); setTimeout(() => go('#reserva'), 350); return; }
    let reply = 'No lo tengo claro 🤔 Prueba con "pedir", "reservar", "horario" o "envíos".';
    if (t.includes('horario')) reply = 'Abierto de 8:00 a 22:00, de lunes a domingo.';
    else if (t.includes('envio') || t.includes('domicilio')) reply = 'Sí, envíos en un radio de 4 km en ~30 min. Pide desde la carta.';
    else if (t.includes('hola') || t.includes('buenas')) reply = '¡Hola! ¿Qué te damos hoy? Toca una opción o escríbeme.';
    bot(reply);
    setTimeout(() => {
      chips([
        { label: 'Quiero pedir', run: askCart },
        { label: 'Reservar mesa', run: () => { bot('Te llevo a la reserva:'); setTimeout(() => go('#reserva'), 350); } },
        { label: '¿Horario?', run: () => bot('Abierto de 8:00 a 22:00, todos los días.') },
      ]);
    }, 150);
  });

  window.__cafeReady = true;
})();