 
(() => {
  const S = window.SABANA;
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, clase, html) => { const e = document.createElement(tag); if (clase) e.className = clase; if (html != null) e.innerHTML = html; return e; };
  const silueta = nombre => `img/anuncio/siluetas/${nombre}.webp`;
  const sinTildes = s => s.normalize('NFD').replace(/(?!̃)[̀-ͯ]/g, '').normalize('NFC');   
  const libro = l => `<span class="libro-de">${l}</span>`;
  const preguntas = $('preguntas');
  if (preguntas) S.preguntas.forEach((q, i) => {   
    const b = el('button', 'carta');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="carta__cara"><span class="carta__num">${i + 1}</span>${libro(q.libro)}<span class="carta__txt">${q.p}</span><span class="carta__pie">Toca para ver la respuesta</span></span>` +
      `<span class="carta__dorso"><span class="carta__num">${i + 1}</span><span class="carta__txt">${q.r}</span></span>`;
    b.addEventListener('click', () => { const v = b.classList.toggle('carta--vuelta'); b.setAttribute('aria-pressed', String(v)); });
    preguntas.appendChild(b);
  });
  const intruso = $('intruso');
  if (intruso) S.intruso.forEach(fila => {
    const caja = el('div', 'intruso__fila');
    caja.appendChild(el('p', 'intruso__pregunta', `${libro(fila.libro)}${fila.criterio}`));
    const nombres = el('div', 'intruso__nombres');
    const sol = el('p', 'intruso__sol');
    sol.setAttribute('aria-live', 'polite');
    const bueno = fila.solucion.split(':')[0].replace(/^(El|La)\s+/i, '').trim().toLowerCase();
    fila.nombres.forEach(n => {
      const b = el('button', 'chip', n);
      b.type = 'button';
      b.addEventListener('click', () => {
        if (n.toLowerCase() === bueno) {
          nombres.querySelectorAll('button').forEach(x => { x.disabled = true; });
          b.classList.add('chip--bien');
          sol.textContent = fila.solucion;
        } else {
          b.classList.remove('chip--mal'); void b.offsetWidth; b.classList.add('chip--mal');
          sol.textContent = 'Ese no. Prueba otra vez.';
        }
      });
      nombres.appendChild(b);
    });
    caja.append(nombres, sol);
    intruso.appendChild(caja);
  });
  const adivinanzas = $('adivinanzas');
  if (adivinanzas) S.adivinanzas.forEach(a => {
    const b = el('button', 'carta carta--adivina');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    const img = `<img src="${silueta(a.silueta)}" alt="">`;
    b.innerHTML = `<span class="carta__cara">${libro(a.libro)}<span class="carta__txt carta__txt--cita">${a.t}</span><span class="carta__pie">¿Quién soy?</span></span>` +
      `<span class="carta__dorso">${img}<span class="carta__txt">${a.r}</span></span>`;
    b.addEventListener('click', () => { const v = b.classList.toggle('carta--vuelta'); b.setAttribute('aria-pressed', String(v)); });
    adivinanzas.appendChild(b);
  });
  (() => {
    if (!$('laberinto')) return;
    const L = S.laberinto, F = L.filas, C = L.cols;
    const abierto = new Set(L.abiertas.map(([a, b]) => [a.join(','), b.join(',')].sort().join('|')));
    const paso = (a, b) => abierto.has([a.join(','), b.join(',')].sort().join('|'));
    const peligros = L.callejones.slice(0, 2);   
    const caja = $('laberinto'), aviso = $('laberinto-aviso');
    $('laberinto-texto').innerHTML = `${libro(L.libro)}${L.texto}`;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `-0.6 -0.9 ${C + 1.2} ${F + 2.1}`);
    svg.setAttribute('class', 'laberinto__svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Laberinto: ${L.texto}`);
    let muros = `M1 0H${C}V${F}M${C - 1} ${F}H0V0`;   
    for (let f = 0; f < F; f++) for (let c = 0; c < C; c++) {
      if (c + 1 < C && !paso([f, c], [f, c + 1])) muros += `M${c + 1} ${f}v1`;
      if (f + 1 < F && !paso([f, c], [f + 1, c])) muros += `M${c} ${f + 1}h1`;
    }
    svg.innerHTML = `<rect x="0" y="0" width="${C}" height="${F}" class="laberinto__fondo"/>` +
      `<polyline class="laberinto__rastro" points=""/>` +
      `<path class="laberinto__muros" d="${muros}"/>` +
      peligros.map(([f, c], i) => `<image href="${silueta(L.peligros[i])}" x="${c + 0.07}" y="${f + 0.12}" width=".86" height=".76"/>`).join('') +
      `<ellipse class="laberinto__agua" cx="${C - 0.5}" cy="${F + 0.62}" rx=".72" ry=".3"/>` +
      `<image class="laberinto__suricata" href="${silueta(L.jugador)}" width=".8" height=".8"/>`;
    caja.appendChild(svg);
    const rastro = svg.querySelector('.laberinto__rastro'), suricata = svg.querySelector('.laberinto__suricata');
    let camino, fin;
    const dibuja = () => {
      const [f, c] = camino.at(-1);
      rastro.setAttribute('points', [[-0.6, 0], ...camino].map(([y, x], i) => (i ? `${x + 0.5},${y + 0.5}` : `0.5,${y}`)).join(' '));
      suricata.setAttribute('x', c + 0.1); suricata.setAttribute('y', f + 0.1);
    };
    const reinicio = () => { camino = [[0, 0]]; fin = false; dibuja(); };
    function mover(f, c) {
      if (fin) return;
      const [f0, c0] = camino.at(-1);
      if (Math.abs(f - f0) + Math.abs(c - c0) !== 1 || !paso([f0, c0], [f, c])) return;
      const prev = camino.at(-2);
      if (prev && prev[0] === f && prev[1] === c) camino.pop(); else camino.push([f, c]);
      dibuja();
      const peligro = peligros.findIndex(p => p[0] === f && p[1] === c);
      if (peligro >= 0) { fin = true; aviso.textContent = `¡Cuidado, que ahí está ${L.peligros_nombres[peligro]}! Vuelve a empezar.`; setTimeout(() => { reinicio(); aviso.textContent = ''; }, 1600); }
      else if (f === F - 1 && c === C - 1) { fin = true; aviso.textContent = `¡${L.quien} ha llegado ${L.meta}!`; }
    }
    function celda(e) {
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(svg.getScreenCTM().inverse());
      return [Math.floor(q.y), Math.floor(q.x)];
    }
    let arrastra = false;
    svg.addEventListener('pointerdown', e => { arrastra = true; svg.setPointerCapture(e.pointerId); mover(...celda(e)); });
    svg.addEventListener('pointermove', e => { if (arrastra) mover(...celda(e)); });
    svg.addEventListener('pointerup', () => { arrastra = false; });
    svg.tabIndex = 0;
    svg.addEventListener('keydown', e => {
      const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (!d) return;
      e.preventDefault();
      const [f, c] = camino.at(-1);
      mover(f + d[0], c + d[1]);
    });
    $('laberinto-otra').addEventListener('click', () => { reinicio(); aviso.textContent = ''; });
    reinicio();
  })();
  (() => {
    if (!$('sopa')) return;
    const R = S.sopa.rejilla, N = R.length, P = S.sopa.posiciones;
    const caja = $('sopa'), lista = $('sopa-lista'), aviso = $('sopa-aviso');
    const rej = el('div', 'sopa__rejilla');
    rej.style.setProperty('--n', N);
    R.forEach((fila, f) => fila.forEach((l, c) => { const s = el('span', 'sopa__letra', l); s.dataset.f = f; s.dataset.c = c; rej.appendChild(s); }));
    const capa = document.createElementNS(NS, 'svg');
    capa.setAttribute('viewBox', `0 0 ${N} ${N}`);
    capa.setAttribute('class', 'sopa__capa');
    capa.setAttribute('aria-hidden', 'true');
    capa.innerHTML = '<line class="sopa__sel" x1="0" y1="0" x2="0" y2="0"/>';
    rej.appendChild(capa);
    caja.appendChild(rej);
    const nombres = {};
    S.sopa.nombres.forEach((n, i) => { const li = el('li', '', n); li.title = S.sopa.libros[i]; lista.appendChild(li); nombres[sinTildes(n).replace(/ /g, '')] = li; });
    const sel = capa.querySelector('.sopa__sel');
    let ini = null, encontradas = 0;
    const celda = e => {
      const r = rej.getBoundingClientRect();
      return [Math.floor((e.clientY - r.top) / r.height * N), Math.floor((e.clientX - r.left) / r.width * N)].map(v => Math.max(0, Math.min(N - 1, v)));
    };
    const linea = (l, a, b) => { l.setAttribute('x1', a[1] + 0.5); l.setAttribute('y1', a[0] + 0.5); l.setAttribute('x2', b[1] + 0.5); l.setAttribute('y2', b[0] + 0.5); };
    function comprobar(a, b) {
      const df = Math.sign(b[0] - a[0]), dc = Math.sign(b[1] - a[1]);
      const largo = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) + 1;
      if (!(a[0] === b[0] || a[1] === b[1] || Math.abs(b[0] - a[0]) === Math.abs(b[1] - a[1]))) return;
      let w = '';
      for (let i = 0; i < largo; i++) w += R[a[0] + df * i][a[1] + dc * i];
      for (const cand of [w, [...w].reverse().join('')]) {
        const li = nombres[cand];
        if (li && !li.classList.contains('hecha') && P[cand]) {
          li.classList.add('hecha');
          const l = document.createElementNS(NS, 'line');
          l.setAttribute('class', 'sopa__hecha');
          linea(l, a, b);
          capa.insertBefore(l, sel);
          encontradas += 1;
          const total = Object.keys(P).length;
          aviso.textContent = encontradas === total ? '¡Los doce! Ya no se te escapa ninguno.' : `${li.textContent}: ${encontradas} de ${total}.`;
          return;
        }
      }
    }
    rej.addEventListener('pointerdown', e => { e.preventDefault(); rej.setPointerCapture(e.pointerId); ini = celda(e); linea(sel, ini, ini); sel.classList.add('sopa__sel--on'); });
    rej.addEventListener('pointermove', e => { if (ini) linea(sel, ini, celda(e)); });
    rej.addEventListener('pointerup', e => { if (!ini) return; comprobar(ini, celda(e)); ini = null; sel.classList.remove('sopa__sel--on'); });
  })();
  (() => {
    if (!$('crucigrama')) return;
    const K = S.crucigrama, letras = K.letras;
    const celdas = Object.keys(letras).map(k => k.split(',').map(Number));
    const filas = Math.max(...celdas.map(c => c[0])) + 1, cols = Math.max(...celdas.map(c => c[1])) + 1;
    const palabras = K.orden.map((w, i) => {
      const [f, c, d] = K.colocadas[w];
      return { w, n: i + 1, d, celdas: [...w].map((_, j) => (d === 'H' ? [f, c + j] : [f + j, c])) };
    });
    const caja = $('crucigrama'), pistas = $('crucigrama-pistas'), aviso = $('crucigrama-aviso');
    const rej = el('div', 'cruci__rejilla');
    rej.style.setProperty('--f', filas); rej.style.setProperty('--c', cols);
    const inputs = {};
    for (const [f, c] of celdas) {
      const d = el('label', 'cruci__celda');
      d.style.gridArea = `${f + 1} / ${c + 1}`;
      const n = palabras.filter(p => p.celdas[0][0] === f && p.celdas[0][1] === c).map(p => p.n);
      if (n.length) d.appendChild(el('span', 'cruci__num', n.join('·')));
      const i = el('input');
      i.autocomplete = 'off'; i.spellcheck = false; i.setAttribute('autocapitalize', 'characters');
      i.setAttribute('aria-label', `Fila ${f + 1}, columna ${c + 1}`);
      d.appendChild(i);
      rej.appendChild(d);
      inputs[`${f},${c}`] = i;
    }
    caja.appendChild(rej);
    const items = palabras.map(p => {
      const li = el('li', '', `<b>${p.n}</b> ${S.crucigrama.pistas[p.n - 1]} <small class="libro-de libro-de--pista">${S.crucigrama.libros[p.n - 1]}</small>`);
      li.addEventListener('click', () => { activa = p; inputs[p.celdas[0].join(',')].focus(); marcar(); });
      pistas.appendChild(li);
      return li;
    });
    let activa = palabras[0];
    const de = k => palabras.filter(p => p.celdas.some(c => c.join(',') === k));
    function marcar() {
      Object.values(inputs).forEach(i => i.parentNode.classList.remove('cruci__celda--activa'));
      activa.celdas.forEach(c => inputs[c.join(',')].parentNode.classList.add('cruci__celda--activa'));
      items.forEach((li, j) => li.classList.toggle('activa', palabras[j] === activa));
    }
    function revisar() {
      let hechas = 0;
      palabras.forEach((p, j) => {
        const bien = p.celdas.every(c => inputs[c.join(',')].value === letras[c.join(',')]);
        items[j].classList.toggle('hecha', bien);
        p.celdas.forEach(c => { if (bien) inputs[c.join(',')].parentNode.classList.add('cruci__celda--bien'); });
        hechas += bien;
      });
      Object.entries(inputs).forEach(([k, i]) => { if (!de(k).some(p => items[palabras.indexOf(p)].classList.contains('hecha'))) i.parentNode.classList.remove('cruci__celda--bien'); });
      aviso.textContent = hechas === palabras.length ? '¡Crucigrama completo!' : hechas ? `${hechas} de ${palabras.length}.` : '';
    }
    Object.entries(inputs).forEach(([k, i]) => {
      i.addEventListener('focus', () => { i.select(); const ps = de(k); if (!ps.includes(activa)) activa = ps[0]; marcar(); });   
      i.addEventListener('click', () => { const ps = de(k); if (ps.length > 1 && document.activeElement === i) { activa = ps[(ps.indexOf(activa) + 1) % ps.length]; marcar(); } });
      i.addEventListener('beforeinput', e => { if (e.inputType === 'insertText') i.value = ''; });   
      i.addEventListener('input', () => {
        i.value = sinTildes(i.value.toUpperCase()).slice(-1);
        revisar();
        if (!i.value) return;
        const j = activa.celdas.findIndex(c => c.join(',') === k);
        const sig = activa.celdas[j + 1];
        if (sig) inputs[sig.join(',')].focus();
      });
      i.addEventListener('keydown', e => {
        if (e.key !== 'Backspace' || i.value) return;
        const j = activa.celdas.findIndex(c => c.join(',') === k);
        const ant = activa.celdas[j - 1];
        if (ant) { e.preventDefault(); const a = inputs[ant.join(',')]; a.value = ''; a.focus(); revisar(); }
      });
    });
    marcar();
  })();
  (() => {
    const caja = $('hoja77-escrito');
    if (!caja) return;
    const J = window.SelvaJuego;
    const EQUIPOS = ['Lucía', 'Mateo'];
    const RONDAS = S.batalla;
    const FILAS = [[0.3292, 0.3978], [0.5073, 0.5764], [0.686, 0.7545]], ALTO = 0.034;
    const GANA_Y = [0.2771, 0.4552, 0.6339];
    const LADO = [
      { nombre: 0.1254, estrella: 0.1044, vida: 0.3467, cae: 0.4408, gana: 0.0925, equipo: 0.16, corona: 0.1165 },
      { nombre: 0.5558, estrella: 0.5348, vida: 0.7775, cae: 0.8717, gana: 0.8842, equipo: 0.545, corona: 0.883 },
    ];
    const trazos = [];
    const pon = (nodo, x, y, w, h, t0, t1) => {
      Object.assign(nodo.style, { left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` });
      Object.assign(nodo.dataset, { t0: t0.toFixed(4), t1: t1.toFixed(4), fx: (x + w / 2).toFixed(4), fy: (y + h / 2).toFixed(4) });
      caja.appendChild(nodo);
      trazos.push(nodo);
      return nodo;
    };
    const texto = (txt, clase, ...r) => pon(el('span', `lapiz-escrito ${clase}`, null), ...r).appendChild(document.createTextNode(txt));
    const dibujo = (d, clase, ...r) => {
      const s = document.createElementNS(NS, 'svg');
      s.setAttribute('viewBox', '0 0 10 10');
      s.setAttribute('class', `lapiz-marca ${clase}`);
      s.innerHTML = clase.includes('estrella') ? `<path d="${d}"/>` : `<path pathLength="1" d="${d}"/>`;
      return pon(s, ...r);
    };
    const CRUZ = 'M1.6 1.8 8.4 8.3M8.2 1.5 1.9 8.5', VISTO = 'M1.5 5.6 4 8.3 8.8 1.4';
    const ESTRELLA = 'M5 .6 6.3 3.7 9.6 3.9 7.1 6.1 7.9 9.4 5 7.6 2.1 9.4 2.9 6.1.4 3.9 3.7 3.7Z';
    const CIRCULO = 'M5 .8C8.6.6 9.6 3.4 9.4 5.3 9.1 8 6.6 9.4 4.6 9.3 1.7 9.1.4 7 .7 4.6 1 2.4 3 .9 5.6 1.2';
    let t = 0.13;
    EQUIPOS.forEach((n, i) => { texto(n, 'lapiz-escrito--equipo', LADO[i].equipo, 0.198, 0.29, 0.032, t, t + 0.028); t += 0.03; });
    t = 0.2;
    const fila = [[0, 0], [0, 0], [0, 0]];   
    RONDAS.forEach((r, k) => {
      dibujo(VISTO, 'lapiz-marca--visto', LADO[r.gana].gana, GANA_Y[k] - 0.002, 0.0233, 0.0164, t, t + 0.01);
      t += 0.012;
      r.eligen.forEach(([lado, nombre]) => {
        const f = J.ficha(nombre), y = FILAS[k][fila[k][lado]++], L = LADO[lado];
        texto(nombre, 'lapiz-escrito--animal', L.nombre, y - 0.003, 0.208, ALTO, t, t + 0.018);
        texto(f.vida, '', L.vida, y, 0.0825, ALTO, t + 0.018, t + 0.026);
        if (f.estrellas >= 4) dibujo(ESTRELLA, 'lapiz-marca--estrella', L.estrella - 0.011, y + 0.017 - 0.008, 0.022, 0.016, t + 0.026, t + 0.03);
        t += 0.03;
      });
    });
    const sitio = {};
    RONDAS.forEach((r, k) => { const c = [0, 0]; r.eligen.forEach(([lado, nombre]) => { sitio[nombre] = [lado, FILAS[k][c[lado]++]]; }); });
    const izq = [], der = [];
    RONDAS.forEach(r => r.eligen.forEach(([lado, nombre]) => (lado ? der : izq).push(nombre)));
    const b = J.batalla(izq, der);
    const T0 = 0.62, T1 = 0.9, paso = (T1 - T0) / b.combates.length;
    b.combates.forEach((c, i) => {
      const [lado, y] = sitio[c.cae];
      const x = dibujo(CRUZ, 'lapiz-marca--cruz', LADO[lado].cae, y + 0.0041, 0.0367, 0.0252, T0 + (i + 0.7) * paso, T0 + (i + 1) * paso);
      Object.assign(x.dataset, { combate: i, desde: (T0 + i * paso).toFixed(4) });
    });
    dibujo(CIRCULO, 'lapiz-marca--corona', LADO[b.gana].corona - 0.034, 0.178, 0.068, 0.048, 0.905, 0.94);
    window.SelvaBatalla = { trazos, combates: b.combates, equipos: EQUIPOS, gana: b.gana, T0, T1 };
  })();
  (() => {
    const lienzo = $('campo-lienzo');
    if (!lienzo || S.clave !== 'sabana') return;
    const ctx = lienzo.getContext('2d');
    const AN = 105, AL = 68, M = 5, U = (lienzo.width - 2 * M) / AN;
    const TOTAL = 6600, FRENTE = 2 * AL;
    function dibuja(f) {
      const n = f * (TOTAL + FRENTE);
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      const x0 = M, y0 = M, w = AN * U, h = AL * U;
      ctx.fillStyle = 'rgba(28, 22, 8, .34)'; ctx.fillRect(x0, y0, w, h);
      ctx.strokeStyle = 'rgba(244, 239, 230, .55)'; ctx.lineWidth = 2;
      ctx.strokeRect(x0, y0, w, h);
      ctx.beginPath(); ctx.moveTo(x0 + w / 2, y0); ctx.lineTo(x0 + w / 2, y0 + h); ctx.stroke();
      ctx.beginPath(); ctx.arc(x0 + w / 2, y0 + h / 2, 9.15 * U, 0, 2 * Math.PI); ctx.stroke();
      for (const lado of [0, 1]) {   
        const xa = lado ? x0 + w - 16.5 * U : x0, xb = lado ? x0 + w - 5.5 * U : x0;
        ctx.strokeRect(xa, y0 + (AL - 40.3) / 2 * U, 16.5 * U, 40.3 * U);
        ctx.strokeRect(xb, y0 + (AL - 18.3) / 2 * U, 5.5 * U, 18.3 * U);
      }
      ctx.fillStyle = '#e9c27a';
      for (let i = 0; i < Math.min(TOTAL, Math.ceil(n)); i++) {
        const c = Math.floor(i / AL), fila = i % AL;
        ctx.globalAlpha = Math.min(1, (n - i) / FRENTE);
        ctx.fillRect(x0 + (c + 0.16) * U, y0 + (fila + 0.16) * U, U * 0.68, U * 0.68);   
      }
      ctx.globalAlpha = 1;
      return Math.min(TOTAL, Math.round(n - FRENTE / 2 > 0 ? n - FRENTE / 2 : 0));
    }
    const rinos = $('rinos-rejilla');
    for (let i = 0; i < 100; i++) rinos.appendChild(el('img', 'rinos__uno')).src = silueta('rinoceronte');
    window.SelvaCampo = { dibuja, total: TOTAL };
    dibuja(1);
  })();
})();
