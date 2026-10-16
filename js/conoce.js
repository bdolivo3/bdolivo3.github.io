 
(() => {
  const $ = id => document.getElementById(id);
  const carta = $('carta-ficha'), marcas = $('marcas'), leyenda = $('leyenda'), elige = $('conoce-elige');
  if (!carta) return;
  const ANIMALES = window.SABANA.conocelos;
  const cara = carta.querySelector('.cromo__cara'), dorso = carta.querySelector('.carta-ficha__dorso img');
  const rival = $('carta-rival');
  const NUM = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco'];
  const el = n => n[0].toLowerCase() + n.slice(1);   
  const PARTES = [
    { x: a => a.x_nombre + 0.055, y: 0.1, t: 'Número y nombre',
      d: a => `Su sitio en la colección y su nombre; debajo, el científico. El ${el(a.nombre)} es el ${a.cod}.` },
    { x: 0.225, y: 0.211, t: 'Rareza',
      d: a => `Las estrellas de la esquina: de una, común, a cinco, mítico. El ${el(a.nombre)} tiene ${NUM[a.estrellas]}: ${a.rareza.toLowerCase()}.` },
    { x: 0.452, y: 0.224, t: 'Tipo',
      d: a => `A qué mundos pertenece: agua, fuego, arena, hielo… Casi todos tienen dos. El ${el(a.nombre)}, ${a.tipos.map(t => t.toLowerCase()).join(' y ')}.` },
    { x: a => (a.tres_cajas ? 0.875 : 0.627), y: 0.222, t: 'Cuánto mide', d: a => a.medidas },
    { x: 0.03, y: 0.27, t: 'Cuaderno de campo',
      d: () => 'Dónde vive, qué come, qué clase de animal es, cuánto pesa, cómo es y quiénes son sus parientes.' },
    { x: 0.97, y: 0.27, t: 'Los cuatro números',
      d: a => `Ataque, de 25 a 50; defensa, de 0 a 15; velocidad, de 1 a 10, y vida, de 75 a 150. Son los que deciden quién gana; la barra va del mínimo al máximo de los doce animales del libro. El ${el(a.nombre)}: ${a.atq}, ${a.df}, ${a.vel} y ${a.vida}.` },
    { x: 0.196, y: 0.598, t: 'En el juego',
      d: a => `Dos habilidades: una de ataque, que suma a tu golpe, y una de defensa, que resta al golpe que recibes. Solo puedes usar una en cada turno. El ${el(a.nombre)}: ${a.ataque[0]} +${a.ataque[1]} y ${a.defensa[0]} −${a.defensa[1]}.` },
    { x: 0.188, y: 0.702, t: 'Curiosidades', d: () => 'Tres curiosidades y un «¿Sabías que…?»: lo que hace único a este animal.' },
    { x: 0.03, y: 0.891, t: 'Conservación',
      d: a => `Cuánto peligro corre su especie de desaparecer, según la UICN. El ${el(a.nombre)}: «${a.conservacion[0]}». ${a.conservacion[2]}` },
  ];
  const valor = (v, a) => (typeof v === 'function' ? v(a) : v);
  const items = PARTES.map((m, i) => {
    const s = document.createElement('span');
    s.className = 'marca-ficha';
    s.textContent = i + 1;
    s.style.setProperty('--i', i);
    marcas.appendChild(s);
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" class="leyenda__parte"><span class="leyenda__num">${i + 1}</span><span><b>${m.t}.</b> <span class="leyenda__txt"></span></span></button>`;
    leyenda.appendChild(li);
    return { s, b: li.firstChild, txt: li.querySelector('.leyenda__txt') };
  });
  function poner(a) {
    PARTES.forEach((m, i) => {
      items[i].s.style.left = `${valor(m.x, a) * 100}%`;
      items[i].s.style.top = `${valor(m.y, a) * 100}%`;
      items[i].txt.textContent = m.d(a);
    });
    cara.src = `img/animales/${a.clave}.webp`;
    cara.alt = `El retrato del ${el(a.nombre)} (${a.libro})`;
    dorso.src = `img/fichas/${a.clave}.webp`;
    dorso.alt = `La ficha del ${el(a.nombre)}`;
    carta.setAttribute('aria-label', `Dar la vuelta a la carta del ${el(a.nombre)}: retrato o ficha`);
    $('conoce-ante').textContent = `${a.nombre} · Ficha ${a.cod}`;
    if (rival) {   
      const S = window.SABANA, suyo = a.clave === S.clave;
      const otro = a.clave === 'oriente' ? 'sabana' : 'oriente';
      rival.querySelector('.cromo__cara').src = suyo ? S.rival.retrato : `img/animales/${otro}.webp`;
      rival.querySelector('.cromo__dorso img').src = suyo ? S.rival.ficha : `img/fichas/${otro}.webp`;
    }
  }
  const primero = Math.max(0, ANIMALES.findIndex(a => a.clave === window.ELEGIDO));
  const botones = ANIMALES.map((a, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'filtro conoce__animal';
    b.textContent = a.nombre;
    b.title = a.libro;
    b.setAttribute('aria-pressed', String(i === primero));
    b.addEventListener('click', async () => {
      if (b.getAttribute('aria-pressed') === 'true') return;
      botones.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      elige.scrollTo({ left: b.offsetLeft - (elige.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });   
      carta.classList.add('carta-ficha--cambia');
      const nuevas = [`img/animales/${a.clave}.webp`, `img/fichas/${a.clave}.webp`].map(src => { const im = new Image(); im.src = src; return im.decode().catch(() => {}); });
      await Promise.all([...nuevas, new Promise(r => setTimeout(r, 220))]);
      poner(a);
      activa(-1);
      carta.classList.remove('carta-ficha--cambia');
    });
    elige.appendChild(b);
    return b;
  });
  poner(ANIMALES[primero]);
  const girar = vuelta => {
    carta.classList.toggle('carta-ficha--ficha', vuelta);
    carta.setAttribute('aria-pressed', String(vuelta));
  };
  carta.addEventListener('click', () => girar(!carta.classList.contains('carta-ficha--ficha')));
  function activa(i) { items.forEach((x, j) => { x.s.classList.toggle('marca-ficha--activa', j === i); x.b.classList.toggle('activa', j === i); }); }
  items.forEach(({ b }, i) => {
    b.addEventListener('click', () => { girar(true); activa(i); });
    b.addEventListener('pointerenter', () => activa(i));
    b.addEventListener('focus', () => activa(i));
  });
  leyenda.addEventListener('pointerleave', () => activa(-1));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { girar(true); return; }
  const ojo = new IntersectionObserver(entradas => {
    if (!entradas.some(e => e.isIntersecting)) return;
    ojo.disconnect();
    setTimeout(() => { if (!carta.classList.contains('carta-ficha--tocada')) girar(true); }, 1100);
  }, { threshold: 0.6 });
  carta.addEventListener('click', () => carta.classList.add('carta-ficha--tocada'), { once: true });
  ojo.observe(carta);
})();
