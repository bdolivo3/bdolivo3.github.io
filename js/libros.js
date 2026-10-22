 
(() => {
  const D = window.LIBROS;
  const $ = id => document.getElementById(id);
  const el = (tag, clase, html) => { const e = document.createElement(tag); if (clase) e.className = clase; if (html != null) e.innerHTML = html; return e; };
  const plano = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const REGIONES = [...new Set(D.libros.map(l => l.region))];
  const AMAZON = window.AMAZON || {};   
  const comprar = clave => AMAZON[clave]
    ? `<a class="boton libro-ficha__comprar" href="${AMAZON[clave]}" target="_blank" rel="noopener">Juega conmigo <small>en Amazon</small></a>`
    : `<p class="libro-ficha__pronto">Próximamente en Amazon</p>`;
  const estante = $('estante');
  const fichas = D.libros.map(l => {
    const art = el('article', 'libro-ficha');
    art.id = l.clave;
    art.innerHTML =
      `<img class="libro-ficha__portada" src="img/portadas/${l.clave}.webp" width="800" height="1130" alt="Portada de ${l.libro}" loading="lazy">` +
      `<div class="libro-ficha__txt">` +
        `<p class="libro-ficha__serie">${l.serie}</p>` +
        `<h2 class="libro-ficha__titulo">${l.libro}</h2>` +
        `<p class="libro-ficha__lema">${l.lema} <span class="libro-ficha__num">N.º ${l.desde} a ${l.hasta}</span></p>` +
        `<ul class="libro-ficha__animales">${l.animales.map(a => `<li>${a}</li>`).join('')}</ul>` +
        comprar(l.clave) +
      `</div>`;
    estante.appendChild(art);
    return { l, art, items: [...art.querySelectorAll('li')] };
  });
  const vienen = $('vienen-lista');
  const proximos = D.proximos.map(l => {
    const art = el('article', 'viene');
    art.innerHTML =
      `<img class="viene__portada" src="img/proximamente/${l.clave}.webp" width="800" height="1130" alt="Portada de ${l.libro}" loading="lazy">` +
      `<p class="libro-ficha__serie">${l.serie}</p>` +
      `<h3 class="viene__titulo">${l.libro}</h3>` +
      `<p class="viene__txt">${l.texto}</p>`;
    vienen.appendChild(art);
    return { l, art };
  });
  const filtros = $('filtros'), regiones = $('regiones'), buscar = $('buscar'), cuenta = $('cuenta');
  filtros.hidden = false;
  let region = null;
  const botones = [null, ...REGIONES].map(r => {
    const b = el('button', 'filtro', r || 'Todas');
    b.type = 'button';
    b.setAttribute('aria-pressed', String(r === region));
    b.addEventListener('click', () => { region = r; aplicar(); });
    regiones.appendChild(b);
    return [r, b];
  });
  function aplicar() {
    botones.forEach(([r, b]) => b.setAttribute('aria-pressed', String(r === region)));
    const q = plano(buscar.value.trim());
    let vistos = 0;
    for (const { l, art, items } of fichas) {
      let ok = !region || l.region === region;
      let encontrados = 0;
      items.forEach((li, i) => {
        const hay = q.length > 1 && ` ${plano(l.animales[i])}`.includes(` ${q}`);   
        li.classList.toggle('encontrado', hay);
        encontrados += hay;
      });
      if (q.length > 1) ok = ok && encontrados > 0;
      art.hidden = !ok;
      vistos += ok;
    }
    let vienenVistos = 0;
    for (const { l, art } of proximos) {
      const ok = q.length < 2 && (!region || l.region === region);
      art.hidden = !ok;
      vienenVistos += ok;
    }
    $('vienen').hidden = vienenVistos === 0;
    const que = buscar.value.trim();
    cuenta.textContent = q.length > 1
      ? (vistos ? `${vistos === 1 ? 'Un libro lleva' : `${vistos} libros llevan`} «${que}».` : `Ningún libro ${region ? `de ${region}` : 'de la colección'} lleva «${que}». Prueba con otro animal.`)
      : '';
  }
  buscar.addEventListener('input', aplicar);
  aplicar();
  const pedido = location.hash.length > 1 && $(decodeURIComponent(location.hash.slice(1)));
  if (pedido && pedido.classList.contains('libro-ficha')) {
    pedido.classList.add('libro-ficha--pedido');
    requestAnimationFrame(() => pedido.scrollIntoView({ block: 'center' }));
  }
})();
