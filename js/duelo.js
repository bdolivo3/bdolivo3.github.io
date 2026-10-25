 
(() => {
  const J = window.SelvaJuego;
  const $ = id => document.getElementById(id);
  const texto = $('paso'), num = $('paso-num'), opciones = $('opciones'), escrito = $('arena-escrito');
  const S = window.SABANA;
  const LEON = J.ficha(S.jugador.nombre), TIGRE = J.ficha(S.rival.nombre);
  const YO = S.jugador.el, EL = S.rival.el;   
  const may = t => t[0].toUpperCase() + t.slice(1);
  const del = t => t.replace(/^el /, 'del ').replace(/^la /, 'de la ');
  const al = t => t.replace(/^el /, 'al ').replace(/^la /, 'a la ');
  const yoEmpiezo = LEON.vel >= TIGRE.vel;
  let leon, tigre, turno, filas, perdidas = 0;
  const boton = (txt, ir, claro, extra = '') => `<button type="button" class="boton${claro ? ' boton--claro' : ''}" data-ir="${ir}" ${extra}>${txt}</button>`;
  const cuentas = c => `<span class="cuenta">${c.map(x => `<span class="cuenta__paso"><small>${x.que}</small>${x.txt}</span>`).join('')}</span>`;
  function vida(quien, l) {
    $(`vida-${quien}`).textContent = l.vida;
    $(`barra-${quien}`).style.width = `${(100 * l.vida / l.f.vida).toFixed(1)}%`;
    const c = celda(quien, 'vida');
    if (c && c.textContent !== String(l.vida)) { c.textContent = l.vida; c.classList.remove('baja'); void c.offsetWidth; c.classList.add('baja'); }
  }
  const cuadro = $('caracteristicas');
  const FILAS_CUADRO = [['atq', 'Ataque', f => f.atq], ['df', 'Defensa', f => f.df], ['vel', 'Velocidad', f => f.vel],
    ['vida', 'Vida', f => f.vida], ['hab-a', 'Habilidad de ataque', f => `${f.ataque[0]} +${f.ataque[1]}`],
    ['hab-d', 'Habilidad de defensa', f => `${f.defensa[0]} −${f.defensa[1]}`]];
  function cuadroNuevo() {
    cuadro.innerHTML = `<thead><tr><td></td><th scope="col" data-quien="leon">${LEON.nombre}</th><th scope="col" data-quien="tigre">${TIGRE.nombre}</th></tr></thead>` +
      `<tbody>${FILAS_CUADRO.map(([k, nombre, v]) => `<tr><th scope="row">${nombre}</th>` +
        `<td data-quien="leon" data-k="${k}">${v(LEON)}</td><td data-quien="tigre" data-k="${k}">${v(TIGRE)}</td></tr>`).join('')}</tbody>`;
  }
  const celda = (quien, k) => cuadro.querySelector(`td[data-quien="${quien}"][data-k="${k}"]`);
  function luce(ataca, cosas) {   
    cuadro.querySelectorAll('.luce').forEach(c => c.classList.remove('luce'));
    cuadro.querySelectorAll('thead th').forEach(th => {
      th.classList.toggle('ataca', th.dataset.quien === ataca);
      th.classList.toggle('recibe', !!ataca && th.dataset.quien !== ataca);
    });
    cosas.forEach(([q, k]) => celda(q, k)?.classList.add('luce'));
  }
  function luceGolpe(at, de, fAt, fDe, h, r) {
    const cosas = [[at, 'atq'], [de, 'df']];
    if (h === 'ataque') cosas.push([at, 'hab-a']);
    if (r.cuentas.some(c => c.que === fDe.defensa[0])) cosas.push([de, 'hab-d']);
    if (r.esquiva) cosas.push([at, 'vel'], [de, 'vel']);
    luce(at, cosas);
  }
  function golpeado(quien) {
    const el = $(`l-${quien}`);
    el.classList.remove('luchador--golpe');
    void el.offsetWidth;   
    el.classList.add('luchador--golpe');
  }
  const FILAS = [0.2937, 0.394, 0.4928, 0.5931, 0.692, 0.7923], ALTO = 0.086;
  const COL = { leon: { golpe: [0.0723, 0.14], vida: [0.2635, 0.2004], esquiva: 0.0375, nombre: [0.115, 0.34] },
                tigre: { golpe: [0.5718, 0.1391], vida: [0.763, 0.1995], esquiva: 0.5371, nombre: [0.552, 0.34] } };
  const CORONA = { leon: 0.0665, tigre: 0.934 };
  function apunta(txt, x, y, w, h, clase = '') {
    const s = document.createElement('span');
    s.className = `lapiz-escrito ${clase}`;
    s.textContent = txt;
    Object.assign(s.style, { left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` });
    escrito.appendChild(s);
    return s;
  }
  function marca(x, y, clase) {   
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', `lapiz-marca ${clase}`);
    s.setAttribute('viewBox', '0 0 10 10');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = clase === 'lapiz-marca--corona'
      ? '<path d="M5 .8C8.6.6 9.6 3.4 9.4 5.3 9.1 8 6.6 9.4 4.6 9.3 1.7 9.1.4 7 .7 4.6 1 2.4 3 .9 5.6 1.2"/>'
      : '<path d="M1.6 1.8 8.4 8.3M8.2 1.5 1.9 8.5"/>';
    Object.assign(s.style, { left: `${x * 100}%`, top: `${y * 100}%` });
    escrito.appendChild(s);
  }
  function arenaNueva() {
    escrito.textContent = '';
    filas = { leon: 0, tigre: 0 };
    apunta(LEON.nombre, COL.leon.nombre[0], 0.072, COL.leon.nombre[1], 0.08, 'lapiz-escrito--nombre');
    apunta(TIGRE.nombre, COL.tigre.nombre[0], 0.072, COL.tigre.nombre[1], 0.08, 'lapiz-escrito--nombre');
    apunta(LEON.vida, 0.2635, 0.2106, 0.1995, 0.0688);
    apunta(TIGRE.vida, 0.763, 0.2106, 0.1995, 0.0688);
  }
  function arenaGolpe(quien, l, r) {   
    const c = COL[quien], i = filas[quien]++, y = FILAS[Math.min(i, FILAS.length - 1)];
    apunta(r.g, c.golpe[0], y, c.golpe[1], ALTO);
    apunta(l.vida, c.vida[0], y, c.vida[1], ALTO);
    if (r.esquiva) marca(c.esquiva, 0.9083, 'lapiz-marca--cruz');
  }
  function empezar() {
    leon = J.luchador(LEON); tigre = J.luchador(TIGRE); turno = 1;
    cuadroNuevo();
    vida('leon', leon); vida('tigre', tigre);
    arenaNueva();
    luce(null, [['leon', 'vel'], ['tigre', 'vel']]);   
    const pista = perdidas ? `<p class="jugada__pista">Pista: ${EL} ataca siempre con todo. Tu ${LEON.defensa[0]} le quita ${LEON.defensa[1]} a su próximo golpe; úsala a tiempo.</p>` : '';
    const empieza = yoEmpiezo
      ? `Empieza el más rápido: ${YO}, con velocidad ${LEON.vel} contra ${TIGRE.vel}.` + (LEON.vel > TIGRE.vel ? ' Y como eres más rápido, el primer golpe que recibas te hará la mitad.' : '')
      : `Empieza el más rápido: ${EL}, con velocidad ${TIGRE.vel} contra ${LEON.vel}. Y como es más rápido, tu primer golpe le hará la mitad.`;
    return [`<p>Dos jugadores, un animal cada uno. Tú llevas ${YO}; ${EL} lo juega la web. Cada uno apunta la vida de su ficha en la hoja de arriba: <strong>${LEON.vida}</strong> ${YO} y <strong>${TIGRE.vida}</strong> ${EL}. Ese número va a bajar.</p>` +
      `<p>${empieza}</p>${pista}`,
      yoEmpiezo ? boton('Empezar', 'leon') : boton(`Empieza ${EL}`, 'tigre')];
  }
  function turnoLeon() {
    const base = LEON.atq - TIGRE.df;
    const [na, va] = LEON.ataque, [nd, vd] = LEON.defensa;
    const okA = J.puede(leon.historial, 'ataque'), okD = J.puede(leon.historial, 'defensa');
    const aviso = !okA ? `<p class="jugada__nota">${na} no: ya la has usado dos turnos seguidos.</p>` : !okD ? `<p class="jugada__nota">${nd} no: ya la has usado dos turnos seguidos.</p>` : '';
    const arraigo = tigre.defiende ? ` ${may(EL)} se defiende con ${TIGRE.defensa[0]}: te quitará ${TIGRE.defensa[1]}.` : '';
    luce('leon', [['leon', 'atq'], ['tigre', 'df']].concat(tigre.defiende ? [['tigre', 'hab-d']] : []));
    return [`<p><strong>Turno ${turno}. Te toca.</strong> Tu golpe es tu ataque menos su defensa: <strong>${LEON.atq} − ${TIGRE.df} = ${base}</strong>.${arraigo} Elige una habilidad:</p>${aviso}`,
      boton(`${na} +${va}: suma a tu golpe`, 'ataque', false, okA ? '' : 'disabled') +
      boton(`${nd} −${vd}: resta al golpe que recibas`, 'defensa', true, okD ? '' : 'disabled')];
  }
  function golpeLeon(h) {
    const r = J.golpe(leon, tigre, h);
    const antes = tigre.vida;
    J.aplicar(leon, tigre, h, r);
    vida('tigre', tigre); golpeado('tigre'); arenaGolpe('tigre', tigre, r);
    luceGolpe('leon', 'tigre', LEON, TIGRE, h, r);
    if (!yoEmpiezo) turno += 1;
    const que = (h === 'ataque' ? `${LEON.ataque[0]} suma ${LEON.ataque[1]} a tu golpe.` : `Tu golpe se queda como está; a cambio, ${LEON.defensa[0]} le quitará ${LEON.defensa[1]} al próximo golpe ${del(EL)}.`) +
      (r.esquiva ? ' Es el primer golpe que recibe y es más rápido: le haces la mitad. En la arena se marca «Esquiva».' : '');
    if (tigre.vida <= 0) return final(true, `<p>${que}</p>${cuentas(r.cuentas)}<p>${may(EL)} pasa de ${antes} a <strong>0</strong>.</p>`);
    return [`<p>${que}</p>${cuentas(r.cuentas)}<p>${may(EL)} pasa de ${antes} a <strong>${tigre.vida}</strong> de vida.</p>`, boton(`Turno ${del(EL)}`, 'tigre')];
  }
  function golpeTigre() {
    const h = J.puede(tigre.historial, 'ataque') ? 'ataque' : 'defensa';
    const r = J.golpe(tigre, leon, h);
    const antes = leon.vida;
    J.aplicar(tigre, leon, h, r);
    vida('leon', leon); golpeado('leon'); arenaGolpe('leon', leon, r);
    luceGolpe('tigre', 'leon', TIGRE, LEON, h, r);
    if (yoEmpiezo) turno += 1;
    const que = h === 'ataque' ? `${may(EL)} elige ${TIGRE.ataque[0]}, +${TIGRE.ataque[1]}.`
      : `${may(EL)} ya ha usado ${TIGRE.ataque[0]} dos turnos seguidos: esta vez elige ${TIGRE.defensa[0]}, que le quitará ${TIGRE.defensa[1]} a tu próximo golpe.`;
    const esq = r.esquiva ? ' Es el primer golpe que recibes y eres más rápido: te hace la mitad. En la arena se marca «Esquiva».' : '';
    if (leon.vida <= 0) return final(false, `<p>${que}${esq}</p>${cuentas(r.cuentas)}<p>${may(YO)} pasa de ${antes} a <strong>0</strong>.</p>`);
    return [`<p>${que}${esq}</p>${cuentas(r.cuentas)}<p>${may(YO)} pasa de ${antes} a <strong>${leon.vida}</strong> de vida.</p>`, boton('Tu turno', 'leon')];
  }
  function final(gana, html) {
    marca(gana ? CORONA.leon : CORONA.tigre, 0.065, 'lapiz-marca--corona');
    luce(null, [[gana ? 'leon' : 'tigre', 'vida']]);
    $('l-leon').classList.toggle('luchador--gana', gana);
    $('l-tigre').classList.toggle('luchador--gana', !gana);
    if (!gana) perdidas += 1;
    const cierre = gana
      ? `<p class="jugada__final">Gana ${YO}, con ${leon.vida} de vida.</p><p>Gana quien deje al otro sin vida. En cada libro hay doce fichas y una gran batalla, por equipos de seis.</p>`
      : `<p class="jugada__final">Gana ${EL}.</p><p>${may(al(EL))} le quedaban ${tigre.vida}. Se le puede ganar: prueba otra vez.</p>`;
    return [html + cierre, boton('Jugar otra vez', 'inicio', gana)];
  }
  const PASOS = { inicio: empezar, leon: turnoLeon, ataque: () => golpeLeon('ataque'), defensa: () => golpeLeon('defensa'), tigre: golpeTigre };
  function ir(paso) {
    if (paso === 'inicio') { $('l-leon').classList.remove('luchador--gana'); $('l-tigre').classList.remove('luchador--gana'); }
    const [html, botones] = PASOS[paso]();
    texto.innerHTML = html;
    opciones.innerHTML = botones;
    num.textContent = paso === 'inicio' ? 'Antes de empezar' : `Turno ${turno}`;
    return opciones;
  }
  opciones.addEventListener('click', e => {
    const b = e.target.closest('button[data-ir]');
    if (b && !b.disabled) ir(b.dataset.ir).querySelector('button:not([disabled])')?.focus({ preventScroll: true });
  });
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-girar]');
    if (c) c.classList.toggle('cromo--vuelta');
  });
  ir('inicio');
})();
