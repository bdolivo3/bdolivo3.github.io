 
(() => {
  const S = window.SABANA;
  const GANA = Object.fromEntries(S.rueda.map((t, i) => [t, S.rueda[(i + 1) % S.rueda.length]]));
  const ficha = nombre => S.fichas.find(f => f.nombre === nombre);
  const ganaEnRueda = (a, b) => a.tipos.some(t => b.tipos.includes(GANA[t]));
  const puede = (historial, h) => !(historial.length >= 2 && historial.at(-1) === h && historial.at(-2) === h);
  const luchador = f => ({ f, vida: f.vida, historial: [], defiende: false, rueda: false, recibidos: 0 });
  function golpe(at, de, h) {
    const cuentas = [];
    let g = at.f.atq - de.f.df;
    cuentas.push({ txt: `${at.f.atq} − ${de.f.df} = ${g}`, que: 'Ataque menos defensa' });
    if (h === 'ataque') { g += at.f.ataque[1]; cuentas.push({ txt: `+ ${at.f.ataque[1]} = ${g}`, que: at.f.ataque[0] }); }
    const rueda = !at.rueda && ganaEnRueda(at.f, de.f);
    if (rueda) { g += 10; cuentas.push({ txt: `+ 10 = ${g}`, que: 'La rueda' }); }
    if (g < 10) { g = 10; cuentas.push({ txt: 'cuenta 10', que: 'Menos de 10' }); }
    if (de.defiende) { g -= de.f.defensa[1]; cuentas.push({ txt: `− ${de.f.defensa[1]} = ${g}`, que: de.f.defensa[0] }); }
    const esquiva = de.f.vel > at.f.vel && de.recibidos === 0;
    if (esquiva) { const m = Math.ceil(g / 2); cuentas.push({ txt: `${g} ÷ 2 = ${m}`, que: 'Esquiva' }); g = m; }
    g = Math.max(1, g);
    return { g, cuentas, rueda, esquiva };
  }
  function aplicar(at, de, h, r) {
    at.historial.push(h);
    if (r.rueda) at.rueda = true;
    de.recibidos += 1;
    de.defiende = false;
    de.vida = Math.max(0, de.vida - r.g);
    at.defiende = h === 'defensa';
  }
  const primero = (a, b) => (b.f.vel > a.f.vel ? [b, a] : [a, b]);
  function combate(fa, fb) {
    const a = luchador(fa), b = luchador(fb);
    const orden = primero(a, b), golpes = [];
    for (let t = 0; t < 80; t++) {
      const at = orden[t % 2], de = orden[(t + 1) % 2];
      const h = puede(at.historial, 'ataque') ? 'ataque' : 'defensa';
      const r = golpe(at, de, h);
      aplicar(at, de, h, r);
      golpes.push({ de: at.f.nombre, a: de.f.nombre, h, ...r, queda: de.vida });
      if (de.vida <= 0) return { gana: at.f, pierde: de.f, queda: at.vida, golpes };
    }
  }
  function batalla(izq, der) {
    const vivos = [izq.map(ficha), der.map(ficha)];
    let en = [vivos[0][0], vivos[1][0]];
    const combates = [];
    while (vivos[0].length && vivos[1].length) {
      const c = combate(en[0], en[1]);
      const lado = c.pierde === en[0] ? 0 : 1;
      combates.push({ izq: en[0].nombre, der: en[1].nombre, gana: c.gana.nombre, cae: c.pierde.nombre, lado, queda: c.queda });
      vivos[lado] = vivos[lado].filter(f => f !== c.pierde);
      if (!vivos[lado].length) break;
      const rival = c.gana;
      const leGana = vivos[lado].find(f => (lado === 0 ? combate(f, rival).gana === f : combate(rival, f).gana === f));
      en[lado] = leGana || vivos[lado][0];
    }
    return { combates, gana: vivos[0].length ? 0 : 1 };
  }
  window.SelvaJuego = { ficha, puede, luchador, golpe, aplicar, primero, combate, batalla, ganaEnRueda };
})();
