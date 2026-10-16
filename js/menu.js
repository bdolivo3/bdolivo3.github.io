 
(() => {
  const barra = document.querySelector('.barra'), menu = barra && barra.querySelector('.barra__menu');
  if (!menu) return;
  menu.id = menu.id || 'menu';
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'barra__boton';
  boton.setAttribute('aria-controls', menu.id);
  boton.setAttribute('aria-expanded', 'false');
  boton.setAttribute('aria-label', 'Menú');
  boton.innerHTML = '<span></span><span></span><span></span>';
  barra.appendChild(boton);
  const abrir = si => {
    barra.classList.toggle('barra--abierta', si);
    boton.setAttribute('aria-expanded', String(si));
  };
  const mirar = () => {
    const plegada = scrollY > 40 || menu.children.length > 4;
    if (plegada === barra.classList.contains('barra--plegada')) return;
    barra.classList.toggle('barra--plegada', plegada);
    if (!plegada) abrir(false);
  };
  boton.addEventListener('click', () => abrir(!barra.classList.contains('barra--abierta')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) abrir(false); });
  document.addEventListener('click', e => { if (!barra.contains(e.target)) abrir(false); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && barra.classList.contains('barra--abierta')) { abrir(false); boton.focus(); }
  });
  addEventListener('scroll', mirar, { passive: true });
  mirar();
})();
