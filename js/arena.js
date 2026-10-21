 
(() => {
  const J = window.SelvaJuego, S = window.SABANA;
  const $ = id => document.getElementById(id);
  if (!$('guia-hoja') || !J || !S) return;
  const LEON = J.ficha(S.jugador.nombre), TIGRE = J.ficha(S.rival.nombre);
  const YO = S.jugador.el, EL = S.rival.el;
  const GUIA = [
    { x: 0.215, y: 0.063, t: 'Los nombres', d: 'Arriba, el de cada animal: uno contra otro.' },
    { x: 0.272, y: 0.205, t: 'La vida al empezar', d: `La de su ficha: ${LEON.vida} ${YO} y ${TIGRE.vida} ${EL}. Ese número va a bajar.` },
    { x: 0.075, y: 0.3, t: 'Cada golpe', d: 'En GOLPE, lo que te quitan; réstalo y apunta en VIDA la que queda. Una fila por golpe.' },
    { x: 0.1, y: 0.99, t: 'Una vez por duelo', d: 'Abajo, lo que solo vale una vez, y se marca al usarlo: la esquiva (si eres más rápido, el primer golpe que recibes te hace la mitad) y la rueda (+10 al ataque la primera vez que uno de tus tipos gana a uno de los suyos).' },
    { x: 0.875, y: 0.06, t: 'Quién gana', d: 'Gana quien deje al otro sin vida: se marca su corona.' },
  ];
  const guia = $('guia-hoja'), marcasGuia = $('arena-marcas');
  const partesGuia = GUIA.map((g, i) => {
    const m = document.createElement('span');
    m.className = 'marca-ficha';
    m.textContent = i + 1;
    Object.assign(m.style, { left: `${g.x * 100}%`, top: `${g.y * 100}%` });
    marcasGuia.appendChild(m);
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" class="leyenda__parte"><span class="leyenda__num">${i + 1}</span><span><b>${g.t}.</b> ${g.d}</span></button>`;
    guia.appendChild(li);
    return { m, b: li.firstChild };
  });
  const resalta = i => partesGuia.forEach((x, j) => { x.m.classList.toggle('marca-ficha--activa', j === i); x.b.classList.toggle('activa', j === i); });
  partesGuia.forEach(({ b }, i) => ['pointerenter', 'focus', 'click'].forEach(ev => b.addEventListener(ev, () => resalta(i))));
  guia.addEventListener('pointerleave', () => resalta(-1));
})();
