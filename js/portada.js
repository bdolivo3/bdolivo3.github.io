 
(() => {
  const L = Object.fromEntries(window.LIBROS.libros.map(l => [l.clave, l]));
  const S = window.SABANAS, AMAZON = window.AMAZON || {};
  const ORDEN = Object.keys(L).filter(k => S[k]);
  const $ = id => document.getElementById(id);
  const RATON = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const QUIETO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ID = k => (k === 'sabana' ? 'sabana-002' : k);
  const EL = { sabana: 'el elefante', amazonas: 'el jaguar', norte: 'el oso pardo', oriente: 'el tigre de Bengala',
    bosques: 'el lobo ibérico', australia: 'el canguro rojo', pinguino: 'el pingüino emperador', artico: 'el oso polar' };
  const RANGOS = { atq: ['Ataque', 25, 50], df: ['Defensa', 0, 15], vel: ['Velocidad', 1, 10], vida: ['Vida', 75, 150] };
  const UICN = ['Preocupación menor', 'Casi amenazada', 'Vulnerable', 'En peligro', 'En peligro crítico', 'Extinta en estado silvestre', 'Extinta'];
  const ESTADO = { 'Preocupación menor': 'no corre peligro, por ahora', 'Casi amenazada': 'está casi amenazado', 'Vulnerable': 'es vulnerable',
    'En peligro': 'está en peligro', 'En peligro crítico': 'está en peligro crítico', 'No evaluada': 'todavía no está evaluado' };
  const TODAS = Object.values(S).flatMap(b => b.fichas);
  const may = s => s[0].toUpperCase() + s.slice(1);
  const de = el => el.replace(/^el /, 'del ').replace(/^la /, 'de la ');
  const a_ = el => el.replace(/^el /, 'al ').replace(/^la /, 'a la ');
  function mundo(k) {
    const l = L[k], b = S[k], cod = k === 'sabana' ? '002' : l.desde;
    return { k, id: ID(k), el: EL[k], libro: l.libro, region: l.region, desde: l.desde, hasta: l.hasta,
      de: l.lema.replace(/^Doce animales /, '').replace(/\.$/, ''), amazon: AMAZON[k] || '',
      animal: b.fichas.find(f => f.cod === cod), rival: { el: b.rival.el, retrato: b.rival.retrato, ...TODAS.find(f => f.nombre === b.rival.nombre) },
      cuidar: b.cuidar, puedes: b.puedes };
  }
  let w;
  const portada = $('portada'), lamina = $('lamina'), base = $('base'), lienzo = $('lienzo'), texto = $('texto');
  const ctx = lienzo.getContext('2d');
  const MW = 600, MH = 853, R = 34, ANGULO = -0.62;   
  const mascara = document.createElement('canvas'); mascara.width = MW; mascara.height = MH;
  const m = mascara.getContext('2d'); m.lineCap = 'round'; m.strokeStyle = '#000';
  const muestra = document.createElement('canvas'); muestra.width = 40; muestra.height = 57;
  const mu = muestra.getContext('2d', { willReadFrequently: true });
  let color = new Image(), listo = false, hecho = false, sucio = false, ultimo = null, apretado = false;
  function escribe([t, q, a], fundido) {
    const pon = () => { $('titulo').textContent = t; $('quien').innerHTML = q; $('acciones').innerHTML = a; texto.classList.remove('cambia'); };
    if (!fundido || QUIETO) return pon();
    texto.classList.add('cambia'); setTimeout(pon, 260);
  }
  const comprar = clase => `<a class="btn${clase || ''}" data-comprar href="${w.amazon || '#tienda'}"${w.amazon ? ' target="_blank" rel="noopener"' : ''}>Comprar en Amazon</a>`;
  const inicial = () => [`Píntame con ${RATON ? 'el ratón' : 'el dedo'}.`,
    `${may(w.el)}, de ${w.libro}.`,   
    `${comprar(' btn--tinta')} <button class="enlace" type="button" data-accion="ver">Ver cómo queda</button>`];
  const final = () => ['Primero lo pintas. Después, juegas con él.',
    `Doce animales ${w.de}, para pintar y jugar.`,
    `${comprar()} <button class="enlace" type="button" data-accion="otro">Pinta otro mundo</button>`];
  texto.addEventListener('click', e => {
    const b = e.target.closest('[data-accion]'); if (!b) return;
    if (b.dataset.accion === 'ver') acabar(true);
    else poner(ORDEN[(ORDEN.indexOf(w.k) + 1) % ORDEN.length], true);
  });
  function medir() {
    const r = lamina.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    lienzo.width = Math.round(r.width * dpr); lienzo.height = Math.round(r.height * dpr); sucio = true;
  }
  function pintar() {
    if (sucio && listo) {
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      ctx.drawImage(color, 0, 0, lienzo.width, lienzo.height);
      ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(mascara, 0, 0, lienzo.width, lienzo.height);
      ctx.globalCompositeOperation = 'source-over'; sucio = false;
    }
    requestAnimationFrame(pintar);
  }
  function rayas(cx, cy, n, radio) {
    for (let k = 0; k < n; k++) {
      const ox = (Math.random() - .5) * radio * 1.7, oy = (Math.random() - .5) * radio * 1.7;
      const largo = radio * (.7 + Math.random() * .7), a = ANGULO + (Math.random() - .5) * .3;
      m.lineWidth = radio * (.16 + Math.random() * .14); m.globalAlpha = .38 + Math.random() * .32;
      m.beginPath(); m.moveTo(cx + ox - Math.cos(a) * largo / 2, cy + oy - Math.sin(a) * largo / 2);
      m.lineTo(cx + ox + Math.cos(a) * largo / 2, cy + oy + Math.sin(a) * largo / 2); m.stroke();
    }
    m.globalAlpha = 1; sucio = true;
  }
  function recorrer(e) {
    const r = lamina.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * MW, y = (e.clientY - r.top) / r.height * MH;
    const [px, py] = ultimo || [x, y], pasos = Math.max(1, Math.hypot(x - px, y - py) / 5);
    for (let i = 0; i <= pasos; i++) rayas(px + (x - px) * i / pasos, py + (y - py) * i / pasos, 3, R);
    ultimo = [x, y];
  }
  lamina.addEventListener('pointerdown', e => { sabe = true; pista.classList.add('fuera'); if (hecho || !listo) return; apretado = true; ultimo = null; recorrer(e); });
  lamina.addEventListener('pointermove', e => { if (!hecho && listo && (apretado || e.pointerType === 'mouse')) recorrer(e); });
  const soltar = () => { apretado = false; ultimo = null; };
  lamina.addEventListener('pointerup', soltar); lamina.addEventListener('pointercancel', soltar);
  lamina.addEventListener('pointerleave', soltar);
  setInterval(() => {   
    if (hecho || !listo) return;
    mu.clearRect(0, 0, 40, 57); mu.drawImage(mascara, 0, 0, 40, 57);
    const d = mu.getImageData(0, 0, 40, 57).data; let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 90) n++;
    if (n / (40 * 57) > .38) acabar(false);
  }, 350);
  function acabar(deGolpe) {   
    if (hecho) return;
    if (!listo) { color.addEventListener('load', () => acabar(deGolpe), { once: true }); return; }
    hecho = true; apretado = false; lamina.classList.add('hecha'); pista.classList.add('fuera');
    const fin = () => { m.globalAlpha = 1; m.fillRect(0, 0, MW, MH); sucio = true; portada.classList.add('pintada'); escribe(final(), true); };
    if (QUIETO) return fin();
    const t0 = performance.now(), DUR = deGolpe ? 1500 : 1000;
    (function barrido(t) {
      const p = Math.min(1, (t - t0) / DUR), y = MH * (1 - p);
      for (let k = 0; k < 70; k++) rayas(Math.random() * MW, y + (Math.random() - .3) * 120, 1, R * 1.25);
      if (p < 1) requestAnimationFrame(barrido); else fin();
    })(t0);
  }
  function nuevaLamina(fundido) {
    hecho = false; listo = false; ultimo = null; m.clearRect(0, 0, MW, MH); sucio = true;
    portada.classList.remove('pintada'); lamina.classList.remove('hecha');
    base.src = `img/anuncio/pinta/${w.id}.webp`; base.alt = `Lámina para pintar ${de(w.el)}, de ${w.libro}`;
    color = new Image(); color.onload = () => { listo = true; sucio = true; muestraPista(); }; color.src = `img/anuncio/pinta/${w.id}_color.webp`;
    escribe(inicial(), fundido);
  }
  const pista = $('pista');
  const CENTRO = { sabana: [.58, .77], amazonas: [.6, .34], norte: [.48, .69], oriente: [.68, .54], bosques: [.68, .34],
    australia: [.65, .59], pinguino: [.5, .35], artico: [.62, .31] };
  const IDA = [[-.15, .02], [.13, -.03], [-.11, .06], [.15, .02]];
  const dentro = v => Math.min(.92, Math.max(.08, v));
  let TRAZO = IDA, sabe = false, pistaT = 0;
  const ponMano = (x, y) => { pista.style.setProperty('--x', `${x * 100}%`); pista.style.setProperty('--y', `${y * 100}%`); };
  function muestraPista() {
    clearTimeout(pistaT);
    if (sabe || hecho) return pista.classList.add('fuera');
    const [cx, cy] = CENTRO[w.k] || [.5, .5];
    TRAZO = IDA.map(([dx, dy]) => [dentro(cx + dx), dentro(cy + dy)]);
    pista.classList.remove('fuera', 'espera'); ponMano(...TRAZO[0]);
    if (QUIETO) return pista.classList.add('espera');
    pistaT = setTimeout(() => {
      const t0 = performance.now(), DUR = 1700, N = TRAZO.length - 1; let antes = null;
      (function paso(t) {
        if (sabe || hecho) return;
        const q = Math.min(1, (t - t0) / DUR) * N, i = Math.min(N - 1, Math.floor(q)), f = q - i;
        const x = TRAZO[i][0] + (TRAZO[i + 1][0] - TRAZO[i][0]) * f, y = TRAZO[i][1] + (TRAZO[i + 1][1] - TRAZO[i][1]) * f;
        ponMano(x, y);
        const mx = x * MW, my = y * MH;
        if (antes) {
          const n = Math.max(1, Math.hypot(mx - antes[0], my - antes[1]) / 5);
          for (let k = 1; k <= n; k++) rayas(antes[0] + (mx - antes[0]) * k / n, antes[1] + (my - antes[1]) * k / n, 5, R * 1.15);
        }
        antes = [mx, my];
        if (q < N) requestAnimationFrame(paso); else pista.classList.add('espera');
      })(t0);
    }, 700);
  }
  const tienda = $('tienda');
  $('tienda-lista').innerHTML = ORDEN.filter(k => AMAZON[k]).map(k => `<li><a href="${AMAZON[k]}" target="_blank" rel="noopener">
    <img src="img/portadas/${k}.webp" alt="" width="800" height="1130" loading="lazy"><span>${L[k].libro}</span></a></li>`).join('');
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-comprar]');
    if (a && !w.amazon) {
      e.preventDefault();
      $('t-tienda').innerHTML = `<i>${w.libro}</i> llega muy pronto. Ya en Amazon:`;
      if (tienda.showModal) tienda.showModal(); else location.href = 'libros.html';
    }
    if (e.target.closest('[data-cerrar]') || e.target === tienda) tienda.close();
  });
  function cifras(a, abajo) {
    $('cifras').innerHTML = Object.entries(RANGOS).map(([k, [nombre]]) =>
      `<div class="cifra"><p class="valor" data-v="${a[k]}">${abajo ? 0 : a[k]}</p><p class="etq">${nombre}</p></div>`).join('');
  }
  const cuenta = (el, desde, hasta, ms) => {
    if (QUIETO) { el.textContent = hasta; return; }
    const t0 = performance.now();
    const paso = t => { const p = Math.min(1, (t - t0) / ms);
      el.textContent = Math.round(desde + (hasta - desde) * (1 - (1 - p) ** 3)); if (p < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  };
  let vigias = [];
  const al_llegar = (caja, hacer) => {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); hacer(); } },
      { rootMargin: '0px 0px -20% 0px' });
    io.observe(caja); vigias.push(io);
  };
  const debajo = el => el.getBoundingClientRect().top > innerHeight * .8;
  function vida(a) {
    vigias.forEach(io => io.disconnect()); vigias = [];
    const carta = $('carta-viva'), frente = $('frente'), r = w.rival, golpe = Math.max(10, a.atq) - r.df;
    const espera = !QUIETO && debajo(carta);
    cifras(a, espera);
    carta.classList.toggle('espera', espera); carta.classList.remove('viva');
    al_llegar(carta, () => {
      carta.classList.remove('espera'); carta.classList.add('viva');
      document.querySelectorAll('#cifras .valor').forEach(v => cuenta(v, Number(v.textContent), Number(v.dataset.v), 900));
    });
    frente.classList.remove('viva'); $('d-b-vida').textContent = r.vida; $('d-golpe').textContent = `−${golpe}`;
    al_llegar(frente, () => {
      frente.classList.add('viva');
      setTimeout(() => cuenta($('d-b-vida'), r.vida, r.vida - golpe, 700), QUIETO ? 0 : 950);
    });
  }
  function mundos() {
    $('lista-mundos').innerHTML = ORDEN.map(k => {
      const l = L[k];
      return `<li><button type="button" data-mundo="${k}" style="--c: var(--m-${k})" aria-current="${k === w.k}">
        <img src="img/portadas/${k}.webp" alt="" width="800" height="1130" loading="lazy">
        <span class="t">${l.libro}</span><span class="r">${l.region}</span></button></li>`;
    }).join('');
  }
  $('lista-mundos').addEventListener('click', e => {
    const b = e.target.closest('[data-mundo]'); if (!b || b.dataset.mundo === w.k) return;
    poner(b.dataset.mundo, true);
    portada.scrollIntoView({ behavior: QUIETO ? 'auto' : 'smooth' });
  });
  function poner(k, fundido) {
    w = mundo(k); const a = w.animal;
    document.documentElement.dataset.elegido = k; window.ELEGIDO = k;
    try { sessionStorage.setItem('selvativo-libro', k); } catch (e) {}
    $('estas-libro').textContent = w.libro;
    nuevaLamina(fundido);
    $('p-ficha').src = `img/fichas/${w.id}.webp`; $('p-ficha').alt = `La ficha ${de(w.el)}`;
    $('p-retrato').src = `img/animales/${w.id}.webp`; $('p-retrato').alt = `El retrato ${de(w.el)}`;
    $('p-lamina').src = `img/anuncio/pinta/${w.id}.webp`; $('p-lamina').alt = `La lámina ${de(w.el)}, para pintar`;
    $('f-nombre').textContent = a.nombre; $('f-cod').textContent = `N.º ${a.cod}`;
    $('f-rareza').textContent = a.rareza.toLowerCase();
    $('f-estrellas').textContent = '★'.repeat(a.estrellas) + '☆'.repeat(5 - a.estrellas);
    $('c-ficha').src = `img/fichas/${w.id}.webp`; $('c-ficha').alt = `La ficha ${de(w.el)}, del libro`;
    $('d-a-img').src = `img/animales/${w.id}.webp`; $('d-a-img').alt = `${may(w.el)}, con su cría`;
    $('d-b-img').src = w.rival.retrato; $('d-b-img').alt = `${may(w.rival.el)}, con su cría`;
    $('d-a-nombre').textContent = a.nombre; $('d-a-vida').textContent = a.vida; $('d-b-nombre').textContent = w.rival.nombre;
    vida(a);
    $('e-quien').textContent = `Un golpe ${de(w.el)} ${a_(w.rival.el)}:`;
    $('e-cuenta').textContent = `${a.atq} − ${w.rival.df} = ${Math.max(10, a.atq) - w.rival.df}`;
    $('mitad-portada').src = `img/portadas/${k}.webp`; $('mitad-libro').textContent = w.libro;
    mundos();
    $('t-cuidar').textContent = may(w.cuidar.titulo.toLowerCase()) + '.';
    const i = UICN.indexOf(a.conservacion);
    $('c-dice').textContent = `${may(w.el)} ${ESTADO[a.conservacion] || 'está ' + a.conservacion.toLowerCase()}.`;
    [...$('c-escala').children].forEach((li, j) => li.classList.toggle('es', j === i));
    $('p-lista').innerHTML = w.puedes.bloques.slice(0, 3).map(([t]) => `<li><h3>${t}</h3></li>`).join('');
    $('fin-portada').src = `img/portadas/${k}.webp`; $('fin-portada').alt = `Portada de ${w.libro}`;
    $('t-final').textContent = w.libro;
    $('fin-sub').textContent = `Doce animales ${w.de}, para pintar y jugar.`;
    $('fin-acciones').innerHTML = comprar();
    document.querySelectorAll('a[data-comprar]').forEach(b => {
      b.href = w.amazon || '#tienda';
      if (w.amazon) { b.target = '_blank'; b.rel = 'noopener'; } else b.removeAttribute('target');
    });
  }
  addEventListener('resize', medir);
  medir(); poner(ORDEN.includes(window.ELEGIDO) ? window.ELEGIDO : ORDEN[0], false); requestAnimationFrame(pintar);
})();
