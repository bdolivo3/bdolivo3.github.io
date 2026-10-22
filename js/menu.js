 
(() => {
  const cabecera = document.querySelector('.cabecera');
  if (!cabecera || !('IntersectionObserver' in window)) return;
  const enlaces = [[cabecera.querySelector('a').getAttribute('href'), 'Inicio'],
    ...[...cabecera.querySelectorAll('nav a')].map(a => [a.getAttribute('href'), a.textContent])];
  const estas = cabecera.querySelector('.estas');
  if (estas) enlaces.push([estas.getAttribute('href'), 'Cambiar de mundo']);
  const pagina = p => new URL(p, location.href).pathname.replace(/(index|anuncio)\.html$/, '');
  const caja = document.createElement('div');
  caja.className = 'rayas';
  caja.innerHTML = '<button class="rayas__boton" type="button" aria-controls="menu-rayas" aria-expanded="false" aria-label="Menú">'
    + '<span></span><span></span><span></span></button><nav class="rayas__menu" id="menu-rayas" aria-label="Menú">'
    + enlaces.map(([h, t]) => `<a href="${h}"${!h.startsWith('#') && pagina(h) === pagina(location.href) ? ' aria-current="page"' : ''}>${t}</a>`).join('')
    + '</nav>';
  document.body.appendChild(caja);
  const boton = caja.querySelector('button');
  const abrir = si => {
    caja.classList.toggle('rayas--abierta', si);
    boton.setAttribute('aria-expanded', String(si));
  };
  new IntersectionObserver(([e]) => {
    caja.classList.toggle('rayas--ver', !e.isIntersecting);
    if (e.isIntersecting) abrir(false);
  }).observe(cabecera);
  boton.addEventListener('click', () => abrir(!caja.classList.contains('rayas--abierta')));
  caja.querySelector('nav').addEventListener('click', e => { if (e.target.closest('a')) abrir(false); });
  document.addEventListener('click', e => { if (!caja.contains(e.target)) abrir(false); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && caja.classList.contains('rayas--abierta')) { abrir(false); boton.focus(); }
  });
})();
