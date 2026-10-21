 
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; 
  const raiz = document.documentElement;
  raiz.classList.add('cine');
  const $ = id => document.getElementById(id);
  const FIJO = /[?&]fijo/.test(location.search);
  const TACTIL = !matchMedia('(hover: hover) and (pointer: fine)').matches;
  const RITMO = TACTIL && !/[?&]sinritmo/.test(location.search) ? window.RITMO_TACTIL || {} : {};
  const DERIVA = Object.keys(RITMO).length ? 0.06 : 0;
  const lim = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const tramo = (p, a, b) => lim((p - a) / (b - a));
  const suave = t => t * t * (3 - 2 * t);
  const entra = (p, a, b) => suave(tramo(p, a, b));
  const lerp = (a, b, t) => a + (b - a) * t;
  const tramos = (...pares) => p => {
    for (let i = 1; i < pares.length; i++) {
      const [a0, b0] = pares[i - 1], [a1, b1] = pares[i];
      if (p <= a1) return lerp(b0, b1, (p - a0) / (a1 - a0));
    }
    return 1;
  };
  function rotulo(el, p, a, b, c = 9, d = 9) {
    const dentro = entra(p, a, b), fuera = entra(p, c, d);
    const t = dentro * (1 - fuera);
    el.style.opacity = t.toFixed(3);
    el.style.visibility = t > 0.001 ? 'visible' : 'hidden';
    const deriva = DERIVA * innerHeight * (0.5 - tramo(p, b, c));
    el.style.transform = `translateY(${((1 - dentro) * 28 - fuera * 28 + deriva).toFixed(1)}px)`;
  }
  const FOTO_A = { w: 2752, h: 1536 };
  const HORIZONTAL = { w: 2752, h: 1536, libro: [0.5015, 0.5042], ancho: 0.19 };
  const VERTICAL = { w: 1536, h: 2752, libro: [0.5042, 0.5031], ancho: 0.55 };
  const TAPA_SOLO = [[1277, 836], [1545, 838], [1546, 938], [1227, 935]];   
  const alta = matchMedia('(max-aspect-ratio: 3/4)');
  let FB = HORIZONTAL;
  const fotoB = $('foto-final');
  const libro = $('libro'), tapa = $('tapa'), brillo = $('brillo'), mundo = $('mundo');
  const pagina = $('pagina'), pliegue = libro.querySelector('.libro__pliegue');
  const caraTapa = tapa.querySelector('.libro__cara img');
  const escenarioLibro = $('e-libro').querySelector('.escenario');
  const fotos = $('e-libro').querySelector('.fotos');
  const D = 60;                    
  const LIBRO_Y = -0.9;            
  let cm = 10, P = 600;            
  let F = 0.5, kA0 = 0.5, lw = 300, alto = 1.414;
  let A0 = [0, 0];                 
  let k0Libro = 1, bajaLibro = 0, cubreF = 1;     
  function homografia(src, dst) {
    const A = [], b = [];
    src.forEach(([x, y], i) => {
      const [X, Y] = dst[i];
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X);
      A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y);
    });
    for (let c = 0; c < 8; c++) {   
      let m = c;
      for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
      [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]];
      for (let r = 0; r < 8; r++) {
        if (r === c) continue;
        const f = A[r][c] / A[c][c];
        for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    const h = b.map((v, i) => v / A[i][i]);
    return `matrix3d(${h[0]}, ${h[3]}, 0, ${h[6]}, ${h[1]}, ${h[4]}, 0, ${h[7]}, 0, 0, 1, 0, ${h[2]}, ${h[5]}, 0, 1)`;
  }
  const N = 10, hojas = [];
  for (let i = 0, padre = tapa; i < N; i++) {
    const h = document.createElement('div');
    h.className = 'hoja';
    h.style.setProperty('--i', i);
    h.innerHTML = '<i class="hoja__cara"></i><i class="hoja__dorso"></i>';
    padre.appendChild(h); hojas.push(h); padre = h;
  }
  const LEVANTA = [15, 8, 4, 1, -2, -4, -5, -5, -5, -5];
  let doblada = null;
  function doblaTapa(t) {
    if (doblada === t) return;
    doblada = t;
    const a = hojas.map((h, i) => Math.max(-179.5, -179 * t - 55 * Math.sin(Math.PI * t) * (i / (N - 1)) ** 1.4 + LEVANTA[i] * t * t));
    const sombra = a.map(x => 0.42 * (1 - Math.abs(Math.cos(x * Math.PI / 180))));
    hojas.forEach((h, i) => {
      h.style.transform = `rotateY(${(a[i] - (a[i - 1] || 0)).toFixed(2)}deg)`;
      h.style.setProperty('--s0', ((sombra[Math.max(0, i - 1)] + sombra[i]) / 2).toFixed(3));
      h.style.setProperty('--s1', ((sombra[i] + sombra[Math.min(N - 1, i + 1)]) / 2).toFixed(3));
    });
  }
  const PAPEL = { sabana: '#f3ecdc', amazonas: '#e8f0e3', norte: '#f5eae4', oriente: '#edede1', bosques: '#e5f0ec',
    australia: '#f5eae8', pinguino: '#e4eef0', artico: '#e8edf3' };   
  const LIBRO_DE = {};
  for (const a of window.SABANA.conocelos) {
    LIBRO_DE[a.clave] = a.libro;
    window.ELECCION[a.clave].animales[0].nombre = a.nombre;
  }
  const trioImgs = [...$('trio').querySelectorAll('img')], doceLis = [...$('doce').children];
  let animal = null, alCambiarAnimal = () => {};   
  function poner(clave) {
    const datos = window.ELECCION[clave], titulo = LIBRO_DE[clave];
    const a = datos.animales[Math.floor(Math.random() * datos.animales.length)];
    const url = ruta => `url("${new URL(ruta, document.baseURI).href}")`;
    libro.style.setProperty('--portada', url(`img/portadas/${clave}.webp`));
    libro.style.setProperty('--lomo', url(`img/lomos/${clave}.webp`));
    libro.style.setProperty('--papel-libro', PAPEL[clave]);
    pagina.src = datos.p11;
    pagina.alt = `La página 11 de ${titulo}`;
    const ej = $('ejemplo');
    ej.querySelector('span').textContent = a.ejemplo;
    ej.querySelector('i').textContent = titulo;
    [[a.ficha, 'La ficha'], [a.retrato, 'El retrato'], [a.lamina, 'La lámina para colorear']].forEach(([src, que], i) => {
      trioImgs[i].src = src;
      trioImgs[i].alt = `${que}: ${a.nombre}`;
    });
    $('doce').setAttribute('aria-label', `Los doce animales de ${titulo}`);
    datos.doce.forEach(([nombre, src], i) => {
      doceLis[i].querySelector('img').src = src;
      doceLis[i].querySelector('span').textContent = nombre;
    });
    raiz.dataset.elegido = clave;
    animal = a;
    alCambiarAnimal();
  }
  poner(window.ELEGIDO);
  function medirFotos() {
    FB = alta.matches ? VERTICAL : HORIZONTAL;
    fotos.style.setProperty('--sala', `url("${new URL(alta.matches ? 'img/anuncio/mesa_arriba_v.webp' : 'img/anuncio/mesa_arriba.webp', document.baseURI).href}")`);
    const vw = innerWidth, vh = innerHeight, [bx, by] = FB.libro;
    const cubre = Math.max(vw / 2 / (Math.min(bx, 1 - bx) * FB.w), vh / 2 / (Math.min(by, 1 - by) * FB.h));
    const ancho = FB.ancho * FB.w * 1.01;   
    const cabe = Math.min(0.85 * vw / ancho, 0.9 * vh * 0.707 / ancho);
    F = cabe;
    cubreF = cubre;
    fotoB.classList.toggle('foto--corta', F < cubre - 1e-6);
    libro.style.setProperty('--lw', `${(ancho * F).toFixed(1)}px`);
    kA0 = Math.max(vw / FOTO_A.w, vh / FOTO_A.h);
    A0 = [(vw - FOTO_A.w * kA0) / 2, (vh - FOTO_A.h * kA0) / 2];
  }
  function medirSala() {
    medirFotos();
    lw = libro.offsetWidth;
    cm = lw / 21;
    alto = libro.offsetHeight / lw;
    P = D * cm;
    mundo.style.setProperty('--s', `${cm}px`);
    escenarioLibro.style.perspective = `${P.toFixed(1)}px`;
    doblada = null;
    k0Libro = Math.min(1, cubreF / F);
    bajaLibro = 0;
  }
  const sitio = (foto, fx, fy, k, sx, sy) => [sx - fx * foto.w * k, sy - fy * foto.h * k, k];
  const pon = (img, [x, y, k]) => { img.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${k.toFixed(5)})`; };
  const deP0 = tramos([0, 0.68], [0.14, 0.68], [0.24, 0.7], [0.44, 0.8], [0.46, 0.81], [0.94, 0.97], [1, 1]);
  const LLEGA = 0.22;
  function escenaLibro(r) {
    const p0 = lerp(0.06, 1, tramo(r, LLEGA, 1)), p = deP0(p0);
    const llega = entra(r, 0.1, LLEGA - 0.02);
    const vw = innerWidth, vh = innerHeight, cx0 = vw / 2, cy0 = vh / 2;
    const bajaT = entra(p0, 0.06, 0.17);
    const k = lerp(k0Libro, 1, bajaT) * D / lerp(D, 2.5, tramo(p, 0.81, 0.97) ** 2.2);
    const centro = [cx0, cy0 + bajaLibro * (1 - bajaT)];
    const fuera = (vw / 2 + libro.offsetWidth * k0Libro * 0.95) * (1 - llega);
    const q = [centro[0] + fuera, centro[1]], gira = 14 * (1 - llega) ** 1.5;
    fotos.classList.toggle('fotos--sala', F * k < cubreF * 0.995);   
    const abre = entra(p, 0.7, 0.8);
    const cz = 0.16 * 29.7 * entra(p, 0.81, 0.9);
    const dist = D / k;
    pon(fotoB, sitio(FB, FB.libro[0], FB.libro[1], F * k, centro[0], centro[1] - cz * cm * k));
    mundo.style.left = `${q[0].toFixed(1)}px`; mundo.style.top = `${q[1].toFixed(1)}px`;
    escenarioLibro.style.perspectiveOrigin = `${centro[0].toFixed(1)}px ${centro[1].toFixed(1)}px`;
    mundo.style.visibility = llega > 0 ? '' : 'hidden';
    mundo.style.transform = `translateZ(${P.toFixed(1)}px) rotateX(-90deg) rotateY(${gira.toFixed(2)}deg) ` +
      `translate3d(0, ${(-(LIBRO_Y - dist) * cm).toFixed(1)}px, ${(-cz * cm).toFixed(1)}px)`;
    libro.style.transform = `translate3d(0, ${(LIBRO_Y * cm).toFixed(2)}px, 0) rotateX(90deg)`;
    tapa.style.transform = 'translateZ(1px)';
    tapa.style.visibility = k > 3 ? 'hidden' : '';
    brillo.style.visibility = abre < 1 ? '' : 'hidden';
    doblaTapa(+abre.toFixed(3));
    pliegue.style.opacity = abre.toFixed(3);
    brillo.style.opacity = (1 - abre).toFixed(3);
    brillo.style.backgroundPosition = `${lerp(130, -30, entra(p0, 0.12, 0.24)).toFixed(1)}% 0`;
    $('velo-sala').style.opacity = Math.max(0.66 * (1 - entra(r, 0.06, 0.12)),
      0.42 * entra(p0, 0.14, 0.2) * (1 - entra(p0, 0.36, 0.42)), 0.28 * entra(p0, 0.47, 0.53) * (1 - entra(p0, 0.82, 0.88))).toFixed(3);
    caraTapa.style.filter = '';
    rotulo($('r-libro'), r, -1, -0.5, 0.06, 0.1);
    rotulo($('r-pista'), r, -1, -0.5, 0.01, 0.04);
    rotulo($('r-abre'), p0, 0.15, 0.2, 0.36, 0.41);
    rotulo($('r-entra'), p0, 0.48, 0.53, 0.82, 0.87);
    $('velo-papel').style.opacity = entra(p, 0.93, 0.99).toFixed(3);
  }
  const trio = [...$('trio').children], doce = [...$('doce').children];
  function escenaFunciona(p) {
    const seVan = entra(p, 0.56, 0.66);
    trio.forEach((li, i) => {
      const t = entra(p, 0.06 + i * 0.12, 0.2 + i * 0.12);
      const giro = (i - 1) * lerp(14, 4, t);
      li.style.opacity = (t * (1 - seVan)).toFixed(3);
      li.style.transform = `translateY(${((1 - t) * 120 - seVan * 60).toFixed(1)}px) rotateY(${(-giro).toFixed(2)}deg) rotateZ(${(giro * 0.4).toFixed(2)}deg) scale(${lerp(0.9, 1, t).toFixed(3)})`;
    });
    doce.forEach((li, i) => {
      const t = entra(p, 0.65 + i * 0.017, 0.75 + i * 0.017);
      li.style.opacity = t.toFixed(3);
      li.style.transform = `translateY(${((1 - t) * 30).toFixed(1)}px) scale(${lerp(0.86, 1, t).toFixed(3)})`;
    });
    rotulo($('r-funciona'), p, -1, -0.5, 0.54, 0.6);
    rotulo($('r-doce'), p, 0.62, 0.68);
  }
  const PASADAS = [
    { color: '#97bede' },   
    { color: '#c2b35e' },   
    { color: '#d8a65c' },   
    { color: '#a39a8c' },   
  ];
  const ALTO_PAG = 1 / 0.703, PASO = 0.02;   
  const FRANJA = ALTO_PAG / PASADAS.length, SOLAPE = 0.03;
  const NS = 'http://www.w3.org/2000/svg';
  const lienzo = $('lienzo'), lapiz = $('lapiz');
  const pasadas = [];
  let pinta = null;   
  const color = new Image(), base = lienzo.querySelector('.lienzo__base');
  const LEON = { base: base.getAttribute('src'), color: 'img/anuncio/lamina_color.webp', colores: PASADAS.map(z => z.color), alt: base.alt };
  color.onload = () => {
    if (pinta) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 1 ${ALTO_PAG}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs><mask id="pasadas" maskUnits="userSpaceOnUse" x="0" y="0" width="1" height="${ALTO_PAG}"></mask></defs>` +
      `<image href="${color.src}" width="1" height="${ALTO_PAG}" preserveAspectRatio="none" mask="url(#pasadas)"/>`;
    lienzo.insertBefore(svg, lienzo.firstChild);
    const mascara = svg.querySelector('mask');
    let total = 0;
    PASADAS.forEach((z, i) => {
      const ya = Math.max(0, i * FRANJA - SOLAPE), yb = Math.min(ALTO_PAG, (i + 1) * FRANJA + SOLAPE), ida = i % 2 === 0;
      let d = '';
      for (let k = 0; k <= Math.round(1.04 / PASO); k++) {
        const x = -0.02 + k * PASO;
        d += `${d ? 'L' : 'M'}${(ida ? x : 1 - x).toFixed(3)} ${(k % 2 ? yb : ya).toFixed(3)} `;
      }
      const t = document.createElementNS(NS, 'path');
      t.setAttribute('d', d);
      t.setAttribute('fill', 'none');
      t.setAttribute('stroke', '#fff');
      t.setAttribute('stroke-width', (PASO * 2.2).toFixed(3));
      t.setAttribute('stroke-linecap', 'round');
      t.setAttribute('stroke-linejoin', 'round');
      mascara.appendChild(t);
      const largo = t.getTotalLength();
      t.style.strokeDasharray = `${largo} ${largo}`;
      t.style.strokeDashoffset = largo;
      pasadas.push({ t, largo, desde: total, color: z.color, ya, yb, ida });
      total += largo;
    });
    pinta = { total, imagen: svg.querySelector('image') };
    lienzo.classList.add('lienzo--color');
    for (const e of escenas) e.ultimo = null;
  };
  alCambiarAnimal = () => {
    const nombre = animal.ficha.split('/').pop().replace('.webp', ''), l = window.PINTADAS?.[nombre];
    const p = l ? { ...l, alt: `La lámina para colorear: ${animal.nombre}` } : LEON;
    base.src = p.base;
    base.alt = p.alt;
    p.colores.forEach((c, i) => { PASADAS[i].color = c; if (pasadas[i]) pasadas[i].color = c; });
    if (!pinta) { color.src = p.color; return; }
    pinta.imagen.setAttribute('href', p.color);
    for (const e of escenas) e.ultimo = null;   
  };
  alCambiarAnimal();
  const SUAVE_CAMARA = 320;
  let foco = null, enfocando = false;
  function escenaPinta(p) {
    const f = tramo(p, 0.08, 0.8);   
    const lw = lienzo.offsetWidth, lh = lienzo.offsetHeight, u = lw;   
    let punta = { x: 0.5, y: 0.5 * ALTO_PAG }, tono = '#1a1a1a', centro = punta;
    if (pinta) {
      const L = f * pinta.total;
      for (const s of pasadas) {
        const dentro = lim(L - s.desde, 0, s.largo);
        s.t.style.strokeDashoffset = (s.largo - dentro).toFixed(4);
        if (L >= s.desde && (L < s.desde + s.largo || s === pasadas[pasadas.length - 1])) {
          const a = dentro / s.largo, x = lerp(-0.02, 1.02, a), yc = (s.ya + s.yb) / 2;
          punta = { x: s.ida ? x : 1 - x, y: yc + (s.yb - s.ya) * 0.3 * Math.sin(a * Math.PI * 14) };
          tono = s.color;
          centro = { x: punta.x, y: yc };
        }
      }
    }
    lapiz.style.setProperty('--color', tono);
    const aleja = entra(p, 0.74, 0.88);
    const k = pinta ? lerp(1.55, 1, aleja) : 1;
    const mira = { x: lerp(0.5, centro.x, 0.6), y: lerp(centro.y, punta.y, 0.15) };   
    const objetivo = [lerp(mira.x * u, lw / 2, aleja), lerp(mira.y * u, lh / 2, aleja)];
    const vx = innerWidth / 2 / k, arriba = innerHeight * 0.55 / k, abajo = innerHeight * 0.45 / k;
    objetivo[0] = 2 * vx < lw ? lim(objetivo[0], vx, lw - vx) : lw / 2;
    objetivo[1] = arriba + abajo < lh ? lim(objetivo[1], arriba, lh - abajo) : (arriba + lh - abajo) / 2;
    const ahora = performance.now();
    if (!foco || FIJO) foco = [...objetivo, ahora];
    else {
      const a = 1 - Math.exp(-Math.min(100, ahora - foco[2]) / SUAVE_CAMARA);
      foco = [lerp(foco[0], objetivo[0], a), lerp(foco[1], objetivo[1], a), ahora];
    }
    enfocando = Math.abs(foco[0] - objetivo[0]) + Math.abs(foco[1] - objetivo[1]) > 0.5;
    const L0 = [innerWidth / 2 - lw / 2, innerHeight * 0.55 - lh / 2];   
    const S = [innerWidth / 2, innerHeight * 0.55];
    const T = [S[0] - L0[0] - k * foco[0], S[1] - L0[1] - k * foco[1]];
    const rp = $('r-pinta'), bajoTitulo = rp.offsetTop + rp.offsetHeight + 18;
    T[1] += Math.max(0, bajoTitulo - (L0[1] + T[1])) * (1 - entra(p, 0.15, 0.24));
    lienzo.style.transform = `translate(${T[0].toFixed(1)}px, ${T[1].toFixed(1)}px) scale(${k.toFixed(4)})`;
    const px = L0[0] + T[0] + k * punta.x * u, py = L0[1] + T[1] + k * punta.y * u;
    const vis = entra(p, 0.04, 0.09) * (1 - entra(p, 0.8, 0.86)) * (pinta ? 1 : 0);
    const sale = entra(p, 0.8, 0.88);
    const ancho = Math.min(innerHeight * 0.34, 260) / 8;  
    lapiz.style.opacity = vis.toFixed(3);
    lapiz.style.transform = `translate(${(px - ancho / 2 + sale * 160).toFixed(1)}px, ${(py - sale * 220).toFixed(1)}px) rotate(${(-150 + 2 * Math.sin(f * 40)).toFixed(2)}deg)`;
    rotulo($('r-pinta'), p, -1, -0.5, 0.12, 0.18);
    rotulo($('r-pinta-sub'), p, 0.84, 0.9);
    return enfocando;
  }
  const conoce = $('conocelos'), escConoce = $('conoce-escenario'), carta = $('carta-ficha'), rival = $('carta-rival');
  const choque = $('choque'), juega = $('conoce-juega'), leyendaConoce = conoce.querySelector('.conoce__leyenda');
  const brillos = [carta, rival].map(c => c.querySelector('.cromo__brillo'));
  const golpe = (p, c) => { const d = p - c; return Math.exp(-((d / (d < 0 ? 0.03 : 0.05)) ** 2)); };
  let enDuelo = false, giro0 = 0;
  function escenaDuelo(p0) {
    const p = tramo(p0, 0.25, 1);
    if (p <= 0) {   
      if (enDuelo) {
        enDuelo = false;
        conoce.classList.remove('conoce--duelo');
        carta.style.transform = rival.style.transform = '';
        rival.style.visibility = 'hidden';
        leyendaConoce.style.opacity = '';
        choque.style.opacity = '0';
        brillos.forEach(b => b.style.removeProperty('--brillo'));
        rotulo($('r-batalla'), 0, 0.3, 0.42);
      }
      return;
    }
    if (!enDuelo) {
      enDuelo = true;
      giro0 = carta.classList.contains('carta-ficha--ficha') ? 180 : 0;
      conoce.classList.add('conoce--duelo');
    }
    const er = escConoce.getBoundingClientRect(), ancho = document.documentElement.clientWidth;
    const W = carta.offsetWidth, H = carta.offsetHeight;
    const X = ancho / 2, Y = innerHeight * 0.62;
    const dx = X - (er.left + carta.offsetLeft + W / 2), dy = Y - (carta.offsetTop + H / 2);
    const k = Math.min(0.64, (ancho - 32) / (2.3 * W), innerHeight * 0.46 / H), kw = k * W;
    const vuelta = entra(p, 0.02, 0.3), atras = entra(p, 0.04, 0.32), baja = entra(p, 0.08, 0.34), llega = entra(p, 0.22, 0.44);
    const g = golpe(p, 0.5) + golpe(p, 0.63), gira = entra(p, 0.72, 0.88), cerca = lerp(1, 1.08, entra(p, 0.76, 0.97));
    const fin = giro0 + (giro0 ? 556 : 376);
    const ryA = lerp(giro0, fin, vuelta) + 180 * gira, ryB = lerp(-50, -16, llega) - 180 * gira;
    const xa = lerp(0, dx - 0.62 * kw, atras) + g * 0.12 * kw;
    const xb = dx + lerp(ancho / 2 + kw, 0.62 * kw, llega) - g * 0.12 * kw;
    const rzA = lerp(0, 3, atras) - g * 2.5, rzB = lerp(14, 3, llega) - g * 2.5;
    carta.style.transform = `perspective(1600px) translate(${xa.toFixed(1)}px, ${(dy * baja).toFixed(1)}px) rotateY(${ryA.toFixed(2)}deg) rotateZ(${(-rzA).toFixed(2)}deg) scale(${(lerp(1, k, atras) * cerca).toFixed(4)})`;
    rival.style.transform = `perspective(1600px) translate(${xb.toFixed(1)}px, ${dy.toFixed(1)}px) rotateY(${ryB.toFixed(2)}deg) rotateZ(${rzB.toFixed(2)}deg) scale(${(k * cerca).toFixed(4)})`;
    rival.style.visibility = llega > 0 ? 'visible' : 'hidden';
    leyendaConoce.style.opacity = (1 - entra(p, 0.02, 0.2)).toFixed(3);   
    choque.style.left = `${(X - er.left).toFixed(1)}px`;
    choque.style.top = `${Y.toFixed(1)}px`;
    choque.style.opacity = Math.min(1, g).toFixed(3);
    const luz = `${lerp(130, -40, entra(p, 0.8, 0.96)).toFixed(1)}%`;
    brillos.forEach(b => b.style.setProperty('--brillo', luz));
    juega.style.left = `${(-er.left).toFixed(1)}px`;
    juega.style.width = `${ancho}px`;
    rotulo($('r-batalla'), p, 0.3, 0.42);
  }
  function medirDuelo(e) {
    e.top = e.el.getBoundingClientRect().top + scrollY - innerHeight;
    e.alto = Math.max(1, e.el.offsetHeight + innerHeight - escConoce.offsetHeight - (parseFloat(getComputedStyle(escConoce).top) || 0));
  }
  const hoja77 = $('hoja77'), B = window.SelvaBatalla;
  const ART = { Jirafa: 'la', Cebra: 'la', Suricata: 'la' };
  const conArt = n => `${ART[n] || 'el'} ${n.toLowerCase()}`;
  const textoCombate = $('gb-combate');
  let focoGB = null, combateVisto = -1;
  if (B) $('r-gb-final').firstElementChild.textContent = `Gana quien deje al otro sin animales: gana el equipo de ${B.equipos[B.gana]}.`;
  const GLOBO_LADO = 250;   
  function escenaGranBatalla(p) {
    if (!B) return;
    const hw = hoja77.offsetWidth, hh = hoja77.offsetHeight;
    let activo = null;
    for (const n of B.trazos) {
      n.style.setProperty('--t', tramo(p, +n.dataset.t0, +n.dataset.t1).toFixed(3));
      if (p >= +(n.dataset.desde || n.dataset.t0) - 0.012) activo = n;
    }
    const z = entra(p, 0.1, 0.16) * (1 - entra(p, 0.9, 0.95));   
    const k = lerp(1, innerWidth < 700 ? 1.2 : Math.max(1.15, Math.min(lim(700 / hw, 1.25, 2.4), (innerWidth - 2 * (GLOBO_LADO + 40)) / hw)), z);
    const centro = [hw / 2, hh / 2];
    const sobre = activo ? [+activo.dataset.fx * hw, +activo.dataset.fy * hh] : centro;
    const objetivo = [lerp(centro[0], sobre[0], z), lerp(centro[1], sobre[1], z)];
    const vx = innerWidth / 2 / k, vy = innerHeight / 2 / k, vyArriba = (innerHeight / 2 - 70) / k;
    objetivo[0] = 2 * vx < hw ? lim(objetivo[0], vx, hw - vx) : hw / 2;
    objetivo[1] = vyArriba + vy < hh ? lim(objetivo[1], vyArriba, hh - vy) : hh / 2;
    const ahora = performance.now();
    if (!focoGB || FIJO) focoGB = [...objetivo, ahora];
    else {
      const a = 1 - Math.exp(-Math.min(100, ahora - focoGB[2]) / SUAVE_CAMARA);
      focoGB = [lerp(focoGB[0], objetivo[0], a), lerp(focoGB[1], objetivo[1], a), ahora];
    }
    const L0 = [innerWidth / 2 - hw / 2, innerHeight * 0.54 - hh / 2];   
    const T = [innerWidth / 2 - L0[0] - k * focoGB[0], innerHeight / 2 - L0[1] - k * focoGB[1]];
    const movil = innerWidth < 700;
    if (movil) T[1] = lerp(T[1], 74 - L0[1], z);
    const rt = $('r-granbatalla'), bajoTitulo = rt.offsetTop + rt.offsetHeight + 24;
    const espera = Math.max(innerHeight * 0.34, bajoTitulo - (L0[1] + T[1]));
    T[1] += (1 - entra(p, 0.13, 0.19)) * espera;   
    hoja77.style.transform = `translate(${T[0].toFixed(1)}px, ${T[1].toFixed(1)}px) scale(${k.toFixed(4)})`;
    const n = B.combates.length, paso = (B.T1 - B.T0) / n;
    const i = Math.floor(lim((p - B.T0) / paso, 0, n - 1));
    if (i !== combateVisto) {
      const c = B.combates[i];
      textoCombate.textContent = `Combate ${i + 1} de ${n}. ${c.izq} (${B.equipos[0]}) contra ${c.der} (${B.equipos[1]}): cae ${conArt(c.cae)}.`;
      combateVisto = i;
    }
    const px = L0[0] + T[0] + k * sobre[0], py = L0[1] + T[1] + k * sobre[1];
    const hx0 = L0[0] + T[0], hx1 = hx0 + k * hw, hy1 = L0[1] + T[1] + k * hh;
    for (const id of ['r-gb-reparto', 'r-gb-combate', 'r-gb-final']) {
      const g = $(id), lado = Math.max(innerWidth - hx1, hx0) - 16 >= GLOBO_LADO + 22;
      g.style.width = lado ? `${GLOBO_LADO}px` : '';
      const gw = g.offsetWidth, gh = g.offsetHeight;
      let x, y, sitioG;
      if (innerWidth - hx1 - 16 >= gw + 22) { sitioG = 'dcha'; x = hx1 + 22; }
      else if (hx0 - 16 >= gw + 22) { sitioG = 'izda'; x = hx0 - 22 - gw; }
      if (sitioG) y = lim(py - gh / 2, 80, innerHeight - gh - 16);
      else if (innerHeight - hy1 - 12 >= gh + 10) { sitioG = 'debajo'; x = (innerWidth - gw) / 2; y = Math.min(hy1 + 12, innerHeight - gh - 12); }
      else { sitioG = py + 30 + gh > innerHeight - 16 ? 'arriba' : 'abajo'; x = lim(px - 34, 12, innerWidth - gw - 48); y = sitioG === 'arriba' ? py - 30 - gh : py + 30; }
      g.style.left = `${x.toFixed(1)}px`;
      g.style.top = `${y.toFixed(1)}px`;
      for (const c of ['arriba', 'dcha', 'izda', 'debajo']) g.classList.toggle(`globo-hoja--${c}`, sitioG === c);
    }
    rotulo($('r-granbatalla'), p, 0.01, 0.06, 0.11, 0.15);
    rotulo($('r-gb-reparto'), p, 0.17, 0.2, 0.57, 0.6);
    rotulo($('r-gb-combate'), p, 0.6, 0.63, 0.895, 0.91);
    rotulo($('r-gb-final'), p, 0.905, 0.925);
    $('velo-gb').style.opacity = entra(p, 0.94, 1).toFixed(3);   
    return Math.abs(focoGB[0] - objetivo[0]) + Math.abs(focoGB[1] - objetivo[1]) > 0.5;
  }
  const necesitan = [...$('necesitan').children], rinosUno = [...($('rinos-rejilla')?.children || [])];   
  const partesPeor = [...$('peor').querySelectorAll('.peor__fila, .peor__resto')];
  const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let licaonesVistos = -1, rinosVistos = -1;
  function escenaCuidar(p0) {
    const p = p0 / 0.84;
    rotulo($('vuelven'), p0, 0.775, 0.805, 0.915, 0.94);
    $('vuelven').style.setProperty('--t', entra(p0, 0.8, 0.86).toFixed(3));
    rotulo($('r-cuidar'), p, -1, -0.5, 0.07, 0.1);
    necesitan.forEach((li, i) => rotulo(li, p, 0.09 + i * 0.15, 0.12 + i * 0.15, 0.22 + i * 0.15, 0.25 + i * 0.15));
    rotulo($('peor'), p, 0.39, 0.42, 0.6, 0.63);
    partesPeor.forEach((x, i) => rotulo(x, p, 0.42 + i * 0.04, 0.45 + i * 0.04));
    rotulo($('campo'), p, 0.62, 0.65, 0.76, 0.79);
    const llenos = entra(p, 0.64, 0.74);
    if (window.SelvaCampo && llenos !== licaonesVistos) { $('campo-cuenta').textContent = miles(window.SelvaCampo.dibuja(llenos)); licaonesVistos = llenos; }
    rotulo($('rinos'), p, 0.78, 0.81, 0.9, 0.92);
    const m = Math.max(1, Math.round(100 * entra(p, 0.8, 0.88)));
    if (rinosUno.length && m !== rinosVistos) {
      rinosUno.forEach((r, i) => { r.style.opacity = i < m ? '1' : '0.07'; });
      $('rinos-cuenta').textContent = m === 1 ? 'menos de 100' : m === 100 ? 'más de 10.000' : miles(m * 100);
      rinosVistos = m;
    }
    if (window.SelvaInfo) { window.SelvaInfo.a(entra(p, 0.64, 0.74)); window.SelvaInfo.b(entra(p, 0.8, 0.88)); }   
    rotulo($('r-cuidar-banda'), p0, 0.94, 0.97);
  }
  const carrusel = $('carrusel');
  const portadas = [...carrusel.children];
  function escenaMundos(p) {
    const cw = carrusel.offsetWidth, R = cw * 1.7;
    const t = 7 * entra(p, 0.08, 0.94), paso = Math.min(6, Math.floor(t));
    const giro = -45 * (paso + suave(lim((t - paso - 0.35) / 0.65)));
    carrusel.style.transform = `translateY(${lerp(60, 0, entra(p, 0, 0.2)).toFixed(1)}px) translateZ(${(-R).toFixed(1)}px) rotateX(-5deg)`;
    portadas.forEach((l, i) => {
      const a = i * 45 + giro, c = Math.cos(a * Math.PI / 180);
      l.style.transform = `rotateY(${a.toFixed(2)}deg) translateZ(${R.toFixed(1)}px)`;
      l.style.opacity = ((0.2 + 0.8 * Math.max(0, c) ** 1.5) * entra(p, 0, 0.15)).toFixed(3);
    });
    rotulo($('r-mundos'), p, 0.02, 0.12, 0.92, 0.99);
  }
  const proximos = [...$('proximos').children];
  function escenaProximo(p) {
    proximos.forEach((li, i) => {
      const t = entra(p, 0.12 + i * 0.06, 0.3 + i * 0.06);
      li.style.opacity = t.toFixed(3);
      li.style.transform = `translateY(${((1 - t) * 30).toFixed(1)}px)`;
    });
    rotulo($('r-proximo'), p, 0.02, 0.12);
  }
  const PINTADO = matchMedia('(hover: hover) and (pointer: fine)').matches ? 2.4 : 3.6, TOTAL_PINTA = 0.5 + PINTADO;
  const ritmoPinta = tramos([0, 0], [0.2 / TOTAL_PINTA, 0.08], [(0.2 + PINTADO) / TOTAL_PINTA, 0.8], [1, 1]);
  const pintaConRitmo = p => escenaPinta(ritmoPinta(p));
  const escenas = [
    ['e-libro', escenaLibro], ['e-funciona', escenaFunciona, () => true],
    ['e-pinta', pintaConRitmo, () => true], ['conoce-pista', escenaDuelo, null, medirDuelo],
    ['e-granbatalla', escenaGranBatalla, p => p < 0.96], ['e-cuidar', escenaCuidar],
    ['e-mundos', escenaMundos], ['e-proximo', escenaProximo],
  ].map(([id, fn, claro, medida]) => ({ el: $(id), fn, claro, medida, top: 0, alto: 1, ultimo: null, pv: null, sigue: false }));
  for (const e of escenas) {   
    const r = RITMO[e.el.id];
    if (!r) continue;
    const ida = tramos(...r.puntos), fn = e.fn, claro = e.claro;
    e.fn = p => fn(ida(p));
    if (claro) e.claro = p => claro(ida(p));
    e.vuelta = tramos(...r.puntos.map(([a, b]) => [b, a]));
    e.el.style.setProperty('--alto', r.alto);
  }
  const marca = document.querySelector('.barra__marca img');
  function medir() {
    medirSala();
    for (const e of escenas) {
      if (e.medida) e.medida(e); else { e.top = e.el.offsetTop; e.alto = Math.max(1, e.el.offsetHeight - innerHeight); }
      e.ultimo = null;
    }
  }
  const SUAVE = 120, PELICULA = TACTIL ? 200 : 320, ALCANZA = 60, COLA = 0.95;
  let s = scrollY, antes = performance.now();
  function actualizar() {
    const ahora = performance.now(), dt = Math.min(100, ahora - antes);
    antes = ahora;
    s = FIJO ? scrollY : s + (scrollY - s) * (1 - Math.exp(-dt / SUAVE));
    if (Math.abs(scrollY - s) < 0.3) s = scrollY;
    for (const e of escenas) {
      const real = lim((s - e.top) / e.alto, -0.001, 1.001);
      const tau = real > 0 && real < 1 ? PELICULA : ALCANZA;
      e.pv = e.pv === null || FIJO ? real : e.pv + (real - e.pv) * (1 - Math.exp(-dt / tau));
      if (Math.abs(real - e.pv) * e.alto < 0.3) e.pv = real;
      const p = e.pv;
      const cerca = e.medida || (s > e.top - innerHeight && s < e.top + e.alto + innerHeight);
      if (cerca && (p !== e.ultimo || e.sigue)) { e.sigue = e.fn(lim(p / COLA)) === true; e.ultimo = p; }
    }
    let claro = false;
    for (const e of escenas) if (e.claro && s + 40 >= e.top && s + 40 < e.top + e.alto + innerHeight) claro = e.claro(lim(e.pv / COLA));
    if (claro !== raiz.classList.contains('claro')) {
      raiz.classList.toggle('claro', claro);
      marca.src = claro ? 'logo/Selvativo_marca_pequena_negro.svg' : 'logo/Selvativo_marca_pequena_marfil.svg';
    }
  }
  function marco() {
    actualizar();
    requestAnimationFrame(marco);
  }
  if (FIJO) addEventListener('scroll', actualizar);
  const ENTRADA = { 'e-granbatalla': 0.06, 'e-mundos': 0.12 };
  function saltar(id) {
    const destino = id ? $(id) : null;
    const e = escenas.find(x => x.el === destino);
    const p = ENTRADA[id] && e && e.vuelta ? e.vuelta(ENTRADA[id] / COLA) * COLA : ENTRADA[id] || 0;
    const dentro = destino ? p * (destino.offsetHeight - innerHeight) : 0;
    scrollTo(0, destino ? destino.getBoundingClientRect().top + scrollY + dentro : 0);
    s = scrollY;
    for (const e of escenas) e.pv = null;
    if (destino) { destino.tabIndex = -1; destino.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    const id = a ? decodeURIComponent(a.getAttribute('href').slice(1)) : null;
    if (!a || (id && !$(id))) return;
    e.preventDefault();
    saltar(id);
    history.replaceState(null, '', id ? `#${id}` : location.pathname + location.search);
  });
  addEventListener('resize', medir);
  addEventListener('load', medir);
  addEventListener('load', () => document.querySelectorAll('.escena img, .carta-rival img').forEach(i => i.decode?.().catch(() => {})));
  medir();
  if (location.hash.length > 1 && $(decodeURIComponent(location.hash.slice(1)))) saltar(decodeURIComponent(location.hash.slice(1)));
  for (const e of escenas) { e.pv = lim((s - e.top) / e.alto, -0.001, 1.001); e.fn(lim(e.pv / COLA)); }
  requestAnimationFrame(marco);
})();
