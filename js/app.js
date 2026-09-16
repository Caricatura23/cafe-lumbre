(function () {
  'use strict';

  const WA = '52155XXXXXXXX';
  const SHEET_URL = '';
  const CSV_URL = '';
  const REFRESH_MS = 30000;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const money = (n) => (n == null || n === 0) ? '' : '$' + n.toLocaleString('es-MX');

  let DATA = null;

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

  const showPrices = () => !DATA || DATA.showPrices !== false;

  function renderCart() {
    const n = cart.length;
    cartBar.hidden = n === 0;
    cartChip.textContent = n;
    const total = cart.reduce((a, b) => a + b.price, 0);
    cartTotal.textContent = n ? money(total) || (n + ' items') : '';
  }
  function addToCart(name, price) {
    cart.push({ name, price });
    renderCart();
    if (cartBar.animate) cartBar.animate([{ transform: 'translateX(-50%) scale(1.1)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 220 });
  }
  cartBar.addEventListener('click', () => {
    if (!cart.length) return;
    const withPrices = showPrices();
    const lines = cart.map((c) => '- ' + c.name + (withPrices && c.price ? ' (' + money(c.price) + ')' : '')).join('\n');
    let msg = 'Hola, quiero mi pedido en ' + (DATA && DATA.nombre ? DATA.nombre : 'su negocio') + ':\n' + lines;
    if (withPrices) msg += '\nTotal: ' + money(cart.reduce((a, b) => a + b.price, 0));
    msg += '\n¿Confirmas y me indicas cómo pago?';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* ---------------- avisos ---------------- */
  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.hidden = false;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.classList.remove('show'); setTimeout(() => { toastEl.hidden = true; }, 300); }, 3200);
  }

  const banner = $('#stateBanner');
  function stateBanner() {
    if (!DATA) { banner.hidden = true; return; }
    if (DATA.open === false) {
      banner.hidden = false;
      banner.textContent = 'Cerrado ahorita' + (DATA.horario ? ' · abrimos de ' + DATA.horario : '') + (DATA.nota ? '. ' + DATA.nota : '');
    } else {
      banner.hidden = true;
    }
  }

  function itemByName(name) {
    if (!DATA) return null;
    for (let i = 0; i < DATA.items.length; i++) {
      if (DATA.items[i].name === name) return DATA.items[i];
    }
    return null;
  }
  function addBlocked(log) {
    if (DATA && DATA.open === false) {
      toast((DATA.horario ? 'Abrimos de ' + DATA.horario : 'Estamos cerrados') + (DATA.nota ? '. ' + DATA.nota : ''));
      return true;
    }
    if (log && log.available === false) {
      toast(log.name + ' se acabó por hoy. ¡Vuelve mañana!');
      return true;
    }
    return false;
  }

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
        const item = b.dataset.add;
        const log = itemByName(item);
        if (addBlocked(log)) return;
        addToCart(item, log ? log.price : parseInt(b.dataset.price, 10) || 0);
        const dot = $('span', b); if (dot) dot.textContent = '✓';
        setTimeout(() => { if (dot && b.dataset.add) dot.textContent = '◉'; }, 900);
      } else if (b.dataset.book) {
        if (DATA && DATA.open === false) { addBlocked(null); return; }
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

  /* ---------------- carta digital (se re-renderiza al refrescar datos) ---------------- */
  const menuEl = $('#menu');
  function renderMenu() {
    const items = DATA.items;
    menuEl.innerHTML = '';
    items.forEach((m) => {
      const off = m.available === false;
      const it = document.createElement('article');
      it.className = 'menu-item' + (off ? ' off' : '');
      const priceHtml = showPrices() && m.price ? '<span class="mi-price">' + money(m.price) + '</span>' : '<span class="mi-price na">Pregunta por el precio</span>';
      const btnHtml = off ? '<span class="add-btn sold" style="cursor:default">Agotado por hoy</span>' : '<button class="add-btn" type="button">Agregar</button>';
      it.innerHTML = '<img src="' + m.img + '" alt="' + m.name + '" loading="lazy" /><div class="mi-body"><span class="mi-tag">' + m.tag + '</span><b class="mi-name">' + m.name + '</b><p class="mi-desc">' + m.desc + '</p><div class="mi-foot">' + priceHtml + btnHtml + '</div></div>';
      const btn = $('.add-btn', it);
      if (btn) {
        btn.addEventListener('click', () => {
          if (addBlocked(m)) return;
          addToCart(m.name, m.price || 0);
          btn.textContent = '✓ Agregado';
          btn.classList.add('added');
          setTimeout(() => { btn.textContent = 'Agregar'; btn.classList.remove('added'); }, 1000);
        });
      }
      menuEl.appendChild(it);
    });
  }

  /* ---------------- datos: Sheets (JSON o CSV) y negocio.json de respaldo ---------------- */
  function parseCSV(text) {
    const rows = [];
    let cur = '', row = [], q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += ch;
      } else if (ch === '"') { q = true; }
      else if (ch === ',') { row.push(cur.trim()); cur = ''; }
      else if (ch === '\n' || ch === '\r') { row.push(cur.trim()); cur = ''; if (row.length) rows.push(row); row = []; }
      else cur += ch;
    }
    if (cur !== '' || row.length) { row.push(cur.trim()); rows.push(row); }
    return rows;
  }
  function itemsFromSheet(rows) {
    const items = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;
      const price = Number((r[3] || '').replace(/[^0-9.]/g, ''));
      const av = String(r[5] || 'si').trim().toLowerCase();
      items.push({
        name: r[0], tag: r[1] || '', desc: r[2] || '',
        price: price > 0 ? price : null,
        img: r[4] || '',
        available: !(av === 'no' || av === 'n' || av === 'false' || av === '0' || av === 'agotado'),
      });
    }
    return items;
  }

  async function fetchData() {
    let src = null;
    if (SHEET_URL) {
      try { const r = await fetch(SHEET_URL, { cache: 'no-store' }); if (r.ok) src = { items: (await r.json()).items }; } catch (e) { src = null; }
    }
    if (!src && CSV_URL) {
      try {
        const r = await fetch(CSV_URL, { cache: 'no-store' });
        if (r.ok) src = { items: itemsFromSheet(parseCSV(await r.text())) };
      } catch (e) { src = null; }
    }
    if (!src || !src.items || !src.items.length) {
      try {
        const r = await fetch('negocio.json?t=' + Date.now(), { cache: 'no-store' });
        if (r.ok) src = await r.json();
      } catch (e) { src = null; }
    }
    if (!src || !src.items || !src.items.length) return;
    src.items = src.items.filter((i) => i && i.name);
    DATA = src;
    renderMenu();
    stateBanner();
  }

  fetchData();
  setInterval(fetchData, REFRESH_MS);

  /* ---------------- reserva ---------------- */
  const today = new Date();
  today.setDate(today.getDate() + 1);
  $('#rDay').min = today.toISOString().split('T')[0];
  $('#rSend').addEventListener('click', () => {
    if (DATA && DATA.open === false) { addBlocked(null); return; }
    const msg = 'Hola, quiero reservar en ' + (DATA && DATA.nombre ? DATA.nombre : 'su negocio') + ':\nZona: ' + $('#rZona').value + '\nDía: ' + $('#rDay').value + '\nHora: ' + $('#rHour').value + '\nPersonas: ' + $('#rPeople').value + '\n¿Confirman?';
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
      const withPrices = showPrices();
      let resumen = cart.map((c) => c.name).join(', ');
      if (withPrices) resumen += ' · ' + money(cart.reduce((a, b) => a + b.price, 0));
      bot('Llevas ' + cart.length + ' producto(s): ' + resumen + '. ¿Confirmamos tu pedido?');
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
          { label: '¿Horario?', run: () => bot('Abierto de ' + (DATA && DATA.horario ? DATA.horario : '8:00 a 22:00') + ' ☀️') },
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
    if (t.includes('horario')) reply = 'Abierto de ' + (DATA && DATA.horario ? DATA.horario : '8:00 a 22:00') + ', todos los días.';
    else if (t.includes('envio') || t.includes('domicilio')) reply = 'Sí, envíos en un radio de 4 km en ~30 min. Pide desde la carta.';
    else if (t.includes('hola') || t.includes('buenas')) reply = '¡Hola! ¿Qué te damos hoy? Toca una opción o escríbeme.';
    bot(reply);
    setTimeout(() => {
      chips([
        { label: 'Quiero pedir', run: askCart },
        { label: 'Reservar mesa', run: () => { bot('Te llevo a la reserva:'); setTimeout(() => go('#reserva'), 350); } },
        { label: '¿Horario?', run: () => bot('Abierto de ' + (DATA && DATA.horario ? DATA.horario : '8:00 a 22:00') + ', todos los días.') },
      ]);
    }, 150);
  });

  window.__cafeReady = true;
})();