 
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
  const RANGOS = { atq: ['Ataque', 25, 50, 'Lo que quita cada golpe, antes de la defensa del rival.'],
    df: ['Defensa', 0, 15, 'Lo que le resta a cada golpe que recibe.'],
    vel: ['Velocidad', 1, 10, 'El más rápido golpea primero.'],
    vida: ['Vida', 75, 150, 'Lo que aguanta antes de caer.'] };
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
      animal: b.fichas.find(f => f.cod === cod), rival: { el: b.rival.el, ...TODAS.find(f => f.nombre === b.rival.nombre) },
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
  const comprar = () => (w.amazon
    ? `<a class="btn" href="${w.amazon}" target="_blank" rel="noopener">Juega conmigo en Amazon</a>`
    : '<span class="pronto">Muy pronto en Amazon</span>');
  const inicial = () => [`Píntalo con ${RATON ? 'el ratón' : 'el dedo'}.`,
    `Es una lámina del libro: <b>${w.el}</b>, <span class="num">n.º ${w.animal.cod}</span> de <i>${w.libro}</i>.`,
    '<button class="enlace" type="button" data-accion="ver">Ver cómo queda pintado</button>'];
  const final = () => ['Primero lo pintas. Después, juegas con él.',
    `<i>${w.libro}</i> trae doce animales ${w.de}, <span class="num">del ${w.desde} al ${w.hasta}</span>. Cada uno con su lámina para pintar, su retrato y su ficha, que es una carta de juego.`,
    `${comprar()}<button class="enlace" type="button" data-accion="otro">Pinta otro mundo</button>`];
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
  lamina.addEventListener('pointerdown', e => { if (hecho || !listo) return; apretado = true; ultimo = null; recorrer(e); });
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
    hecho = true; apretado = false; lamina.classList.add('hecha');
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
    color = new Image(); color.onload = () => { listo = true; sucio = true; }; color.src = `img/anuncio/pinta/${w.id}_color.webp`;
    escribe(inicial(), fundido);
  }
  function cifras(a) {
    $('cifras').innerHTML = Object.entries(RANGOS).map(([k, [nombre, min, max, que]]) => {
      const v = a[k], x = (v - min) / (max - min) * 100;
      return `<div class="cifra"><p class="etq">${nombre}</p><p class="valor">${v}</p>
        <div class="regla" aria-hidden="true"><i style="left:${x}%"></i><span>${min}</span><span>${max}</span></div>
        <p>${que}</p></div>`;
    }).join('');
  }
  function mundos() {
    $('lista-mundos').innerHTML = ORDEN.map(k => {
      const l = L[k];
      return `<li><button type="button" data-mundo="${k}" style="--c: var(--m-${k})" aria-current="${k === w.k}">
        <img src="img/portadas/${k}.webp" alt="" width="800" height="1130" loading="lazy">
        <span class="t">${l.libro}</span><span class="r">${l.region}, <span class="num">del ${l.desde} al ${l.hasta}</span></span></button></li>`;
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
    $('paginas-sub').textContent = `${may(w.el)} tiene su ficha, su retrato y la lámina que acabas de pintar. Como los otros once de su libro.`;
    $('p-ficha').src = `img/fichas/${w.id}.webp`; $('p-ficha').alt = `La ficha ${de(w.el)}`;
    $('p-retrato').src = `img/animales/${w.id}.webp`; $('p-retrato').alt = `El retrato ${de(w.el)}`;
    $('p-lamina').src = `img/anuncio/pinta/${w.id}.webp`; $('p-lamina').alt = `La lámina ${de(w.el)}, para pintar`;
    $('f-nombre').textContent = a.nombre; $('f-cod').textContent = `N.º ${a.cod}`;
    $('f-rareza').textContent = a.rareza.toLowerCase();
    $('f-estrellas').textContent = '★'.repeat(a.estrellas) + '☆'.repeat(5 - a.estrellas);
    $('f-tipos').textContent = `De tipo ${a.tipos.map(t => t.toLowerCase()).join(' y ')}.`;
    $('f-ataque').innerHTML = `Al atacar, <i>${a.ataque[0]}</i>: +${a.ataque[1]} a su golpe.`;
    $('f-defensa').innerHTML = `Al defenderse, <i>${a.defensa[0]}</i>: −${a.defensa[1]} al golpe que recibe.`;
    cifras(a);
    $('arena').src = `img/anuncio/arena/${k}.webp`;
    $('e-quien').textContent = `Un golpe ${de(w.el)} ${a_(w.rival.el)}:`;
    $('e-cuenta').textContent = `${a.atq} − ${w.rival.df} = ${Math.max(10, a.atq) - w.rival.df}`;
    mundos();
    $('t-cuidar').textContent = may(w.cuidar.titulo.toLowerCase()) + '.';
    $('c-entrada').textContent = w.cuidar.entrada;
    const i = UICN.indexOf(a.conservacion);
    $('c-dice').textContent = `${may(w.el)} ${ESTADO[a.conservacion] || 'está ' + a.conservacion.toLowerCase()}.`;
    [...$('c-escala').children].forEach((li, j) => li.classList.toggle('es', j === i));
    $('c-btitulo').textContent = w.cuidar.bloques[0][0].replace(/\.$/, '') + '.';
    $('c-btexto').textContent = w.cuidar.bloques[0][1];
    $('p-entrada').textContent = w.puedes.entrada;
    $('p-lista').innerHTML = w.puedes.bloques.slice(0, 3).map(([t, x]) => `<li><h3>${t}</h3><p>${x}</p></li>`).join('');
    $('fin-portada').src = `img/portadas/${k}.webp`; $('fin-portada').alt = `Portada de ${w.libro}`;
    $('t-final').textContent = w.libro;
    $('fin-sub').innerHTML = `Doce animales ${w.de}, <span class="num">del ${w.desde} al ${w.hasta}</span>, para colorear y para jugar.`;
    $('fin-acciones').innerHTML = comprar();
  }
  addEventListener('resize', medir);
  medir(); poner(ORDEN.includes(window.ELEGIDO) ? window.ELEGIDO : ORDEN[0], false); requestAnimationFrame(pintar);
})();
