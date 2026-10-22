 
(() => {
  const S = window.SABANA;
  if (!S) return;
  const $ = id => document.getElementById(id);
  const q = (sel, raiz = document) => raiz.querySelector(sel);
  const pon = (el, txt) => { if (el) el.textContent = txt; };
  const html = (el, h) => { if (el) el.innerHTML = h; };
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const may = t => t[0].toUpperCase() + t.slice(1);
  const PROPIOS = ['África', 'Asia', 'Amazonas', 'Australia', 'Antártida', 'Ártico', 'India'];
  const frase = t => may(t.toLowerCase()).replace(new RegExp(`(?<=^|\\s)(${PROPIOS.map(p => p.toLowerCase()).join('|')})(?=$|[\\s.,])`, 'g'),
    m => PROPIOS.find(p => p.toLowerCase() === m));
  const frases = t => t.match(/[^.!?]+[.!?]+/g) || [t];
  pon(q('#ponte-a-prueba .sub'), `Sobre ${S.libro}, distintas de las del libro. Toca cada carta para ver la respuesta.`);
  const txt = [...document.querySelectorAll('#juegos .juego__txt')];
  pon(txt.find(p => p.textContent.includes('escondidos')), `Los doce animales de ${S.libro} están escondidos aquí. Rodéalos: arrastra el dedo de la primera letra a la última. En la sopa no hay tildes.`);
  pon(txt.find(p => p.textContent.includes('pista')), `Los doce animales de ${S.libro}. Las pistas son sus récords y, alguna, lo que dice su ficha.`);
  if (S.clave === 'sabana') return;
  pon(q('#duelo .sub'), `Tú llevas ${S.jugador.el}. Las reglas son las del libro, y la hoja de duelo se rellena como en el libro: debajo de las fichas tienes la guía.`);
  [['l-leon', S.jugador], ['l-tigre', S.rival]].forEach(([id, a]) => {
    const art = $(id), f = S.fichas.find(x => x.nombre === a.nombre);
    if (!art || !f) return;
    const caras = art.querySelectorAll('img');
    caras[0].src = a.retrato; caras[0].alt = may(a.el);
    caras[1].src = a.ficha;
    q('button', art).setAttribute('aria-label', `Dar la vuelta: la ficha ${a.el.replace(/^el /, 'del ').replace(/^la /, 'de la ')}`);
    pon(q('.luchador__nombre', art), f.nombre);
    pon(q('.luchador__datos', art), `Ataque ${f.atq}, defensa ${f.df}, velocidad ${f.vel}`);
    pon(q('.luchador__vida span', art), f.vida);
  });
  const arena = q('.arena__hoja img');
  if (arena) arena.src = `img/anuncio/arena/${S.clave}.webp`;
  const hoja = q('.hoja77__base');
  if (hoja) hoja.src = `img/anuncio/batalla/${S.clave}.webp`;
  const C = S.cuidar, Pu = S.puedes;
  pon($('t-cuidar'), `${frase(C.titulo)}.`);
  pon(q('#r-cuidar .sub'), frases(C.entrada).slice(0, 2).join('').trim());
  const bloques = S.clave === 'australia' ? [C.bloques[0], C.bloques[2]] : C.bloques.slice(0, 2);
  html($('necesitan'), bloques.map(([t, d]) => `<li><h3>${esc(t)}.</h3><p>${esc(d)}</p></li>`).join(''));
  const peor = $('peor');
  if (peor) {
    peor.querySelectorAll('.peor__fila, .peor__resto').forEach(x => x.remove());
    S.peor.filas.forEach(f => peor.insertAdjacentHTML('beforeend',
      `<div class="peor__fila"><p class="peor__cat"><b>${esc(f.cat)}</b>${esc(f.texto)}</p><ul class="peor__animales">` +
      f.animales.map(([n, s]) => `<li><img src="img/anuncio/siluetas/${s}.webp" alt=""><span>${esc(n)}</span></li>`).join('') + '</ul></div>'));
    if (S.peor.resto) peor.insertAdjacentHTML('beforeend', `<p class="peor__resto">${esc(S.peor.resto)}</p>`);
  }
  const INFO = {
    amazonas: [{ t: 'Si la selva fuera una tarta', tipo: 'tarta', trozos: 6, faltan: 1, de: 0, busca: 'tarta' },
      { t: 'Ya pasó una vez', tipo: 'cifras', cifras: [['0', 'jaguares en el humedal durante setenta años'], ['más de 30', 'hoy, con crías nacidas libres']], de: 'r' }],
    norte: [{ t: 'De cada cien trozos de pradera', tipo: 'rejilla', n: 100, quedan: 4, medio: true, de: 0, busca: 'cada cien' },
      { t: 'Ya pasó una vez', tipo: 'barras', barras: [['1963', 417, '417 parejas'], ['Hoy', 70000, 'más de 70.000 parejas']], de: 'r' }],
    oriente: [{ t: 'Los orangutanes de Borneo', tipo: 'rejilla', n: 10, quedan: 5, de: 0, busca: 'orangutanes' },
      { t: 'Ya pasó una vez', tipo: 'cifras', cifras: [['1.864', 'pandas libres en el último gran recuento'], ['2016', 'sale de la lista de «en peligro»']], de: 'r' }],
    bosques: [{ t: 'Erizos en el campo de Gran Bretaña', tipo: 'rejilla', n: 10, quedan: 3, quiza: 4, de: 1, busca: 'erizos' },
      { t: 'Ya pasó una vez', tipo: 'cifras', cifras: [['unos 100', 'lobos en Italia, hace cincuenta años'], ['más de 20.000', 'lobos hoy en Europa']], de: 'r' }],
    australia: [{ t: 'Demonios de Tasmania', tipo: 'rejilla', n: 3, quedan: 1, de: 2, busca: 'dos de cada tres' },
      { t: 'Ya pasó una vez', tipo: 'cifras', cifras: [['26', 'demonios soltados en 2020 en el continente'], ['2021', 'los primeros cachorros salvajes en tres mil años']], de: 'r' }],
    pinguino: [{ t: 'Pingüinos barbijo en la isla Elefante', tipo: 'barras', barras: [['1971', 122000, '122.000 parejas'], ['2020', 53000, '53.000 parejas']], de: 1, busca: 'barbijo' },
      { t: 'Ya pasó una vez', tipo: 'cifras', cifras: [['unos 3.400', 'pingüinos rey en la playa de Lusitania, en 1930'], ['unas 170.000', 'parejas criando en la isla en el año 2000']], de: 'r' }],
    artico: [{ t: 'Renos y caribúes que migran', tipo: 'barras', barras: [['Antes', 4.7, '4,7 millones'], ['Veinte años después', 2.1, '2,1 millones']], de: 2, busca: 'millones' },
      { t: 'Ya pasó una vez', tipo: 'cifras', cifras: [['menos de 3.000', 'ballenas de Groenlandia en el mundo, hace cien años'], ['unas 16.800', 'hoy, solo en los mares de Alaska']], de: 'r' }],
  }[S.clave];
  const pie = d => d.de === 'r' ? Pu.recuadro : frases(C.bloques[d.de][1]).filter(x => x.includes(d.busca)).join('').trim();
  const dibujo = d => {
    if (d.tipo === 'tarta') {   
      const r = 90, punto = a => `${(100 + r * Math.cos(a)).toFixed(1)} ${(100 + r * Math.sin(a)).toFixed(1)}`;
      const trozo = i => `M100 100 L${punto((i / d.trozos) * 2 * Math.PI - Math.PI / 2)} A${r} ${r} 0 0 1 ${punto(((i + 1) / d.trozos) * 2 * Math.PI - Math.PI / 2)}Z`;
      return `<svg class="info__tarta" viewBox="0 0 200 200" aria-hidden="true">${Array.from({ length: d.trozos }, (_, i) =>
        `<path d="${trozo(i)}" class="info__trozo${i >= d.trozos - d.faltan ? ' info__se-va' : ''}"/>`).join('')}</svg>`;
    }
    if (d.tipo === 'rejilla') {   
      const clase = i => i < d.quedan ? (d.medio && i === d.quedan - 1 ? 'info__medio' : '')
        : i < d.quedan + (d.quiza || 0) ? 'info__quiza info__se-va' : 'info__se-va';
      return `<div class="info__rejilla info__rejilla--${d.n}" aria-hidden="true">${Array.from({ length: d.n }, (_, i) => `<i class="${clase(i)}"></i>`).join('')}</div>`;
    }
    if (d.tipo === 'barras') {   
      const max = Math.max(...d.barras.map(b => b[1]));
      return `<div class="info__barras">${d.barras.map(([e, v, txt]) =>
        `<div class="info__barra"><span class="info__etq">${esc(e)}</span><span class="info__pista"><i style="--v:${(v / max).toFixed(4)}"></i></span><b>${esc(txt)}</b></div>`).join('')}</div>`;
    }
    return `<div class="info__cifras">${d.cifras.map(([c, txt]) => `<p><span class="cifra">${esc(c)}</span>${esc(txt)}</p>`).join('<span class="info__flecha" aria-hidden="true">→</span>')}</div>`;
  };
  if (INFO) {
    [['campo', INFO[0]], ['rinos', INFO[1]]].forEach(([id, d]) => {
      const fig = $(id);
      if (!fig) return;   
      fig.classList.add('info');
      html(fig, `<span class="rinos__titulo">${esc(d.t)}.</span>${dibujo(d)}<figcaption>${esc(pie(d))}</figcaption>`);
    });
    const pinta = (fig, t) => {
      fig.style.setProperty('--t', t.toFixed(3));
      const van = fig.querySelectorAll('.info__se-va');
      van.forEach((x, i) => x.classList.toggle('ido', t > (i + 1) / (van.length + 1)));
    };
    window.SelvaInfo = { a: t => pinta($('campo'), t), b: t => pinta($('rinos'), t) };
  }
  const VUELVEN = {
    amazonas: ['Cuando se cuida, vuelve', [['11.594 km²', 'de selva cortada en Brasil de 2021 a 2022'], ['6.518 km²', 'de 2023 a 2024']],
      'Cuando se vigila la selva, se corta menos: en dos años, casi la mitad.'],
    norte: ['Cuando se cuidan, vuelven', [['31', 'lobos soltados en Yellowstone en 1995 y 1996'], ['más de 200', 'en la zona a finales de 2001']],
      'En el parque de Yellowstone ya no quedaba ningún lobo. Se llevaron treinta y uno desde Canadá, y en seis años ya había más de doscientos.'],
    oriente: ['Cuando se cuidan, vuelven', [['menos de 4.000', 'tigres libres en 2016'], ['casi 5.600', 'en 2023']],
      'Hace cien años había unos cien mil tigres. Desde 2016 han vuelto a subir, y más de la mitad viven en la India.'],
    bosques: ['Cuando se cuida, vuelve', [['94', 'linces ibéricos en 2002'], ['2.663', 'en 2025']],
      'Era el felino más amenazado del mundo. Con conejos, pasos bajo las carreteras y linces criados para soltarlos, hoy vuelve a haber linces en España y Portugal.'],
    australia: ['Cuando se cuida, vuelve', [['más de 100 años', 'sin un bilby libre en Nueva Gales del Sur'], ['unos 700', 'en 2025, en tres zonas protegidas']],
      'Desde 2018 se han vuelto a soltar bilbies en zonas protegidas de Nueva Gales del Sur, y allí ya crían solos.'],
    pinguino: ['Cuando se cuidan, vuelven', [['más de 5.000', 'aves muertas en 1996 con los anzuelos de pesca'], ['casi ninguna', 'hoy']],
      'Alrededor de la isla de Georgia del Sur se cambió la forma de pescar: de noche, en invierno y con anzuelos que se hunden rápido. Y en 2016 se protegió el mar de Ross: un millón y medio de kilómetros cuadrados, como tres Españas.'],
    artico: ['Cuando se cuida, vuelve', [['0', 'bueyes almizcleros en Alaska desde el siglo XIX'], ['más de 700', 'en la isla de Nunivak en 2020']],
      'En 1935 y 1936 se llevaron treinta y uno desde Groenlandia a una isla de Alaska. De ellos salieron las manadas que hoy viven en otras partes de Alaska.'],
  }[S.clave];
  if (VUELVEN) html($('vuelven'), `<span class="rinos__titulo">${esc(VUELVEN[0])}.</span><div class="info__cifras">` +
    VUELVEN[1].map(([c, t]) => `<p><span class="cifra">${esc(c)}</span>${esc(t)}</p>`).join('<span class="info__flecha" aria-hidden="true">→</span>') +
    `</div><figcaption>${esc(VUELVEN[2])}</figcaption>`);
  const banda = frases(Pu.banda).map(x => frase(x.trim()));
  html($('r-cuidar-banda'), banda.map(esc).join('<br>'));
  const ent = frases(Pu.entrada);
  pon($('t-puedes'), ent[0].trim());
  pon(q('.puedes .sub'), ent.slice(1).join('').trim());
  html(q('.puedes__lista'), Pu.bloques.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join(''));
})();
