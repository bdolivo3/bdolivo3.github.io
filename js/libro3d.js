 
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let activo = null, cuadro = 0;
    const suelta = () => {
      if (!activo) return;
      activo.classList.remove('libro3d--vivo');
      for (const v of ['--ry', '--rx', '--bx', '--by']) activo.style.removeProperty(v);
      activo = null;
    };
    document.addEventListener('pointermove', e => {
      const l = e.target.closest ? e.target.closest('.libro3d') : null;
      if (l !== activo) suelta();
      if (!l) return;
      activo = l; l.classList.add('libro3d--vivo');
      const r = l.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        l.style.setProperty('--ry', `${(x * 44).toFixed(1)}deg`); l.style.setProperty('--rx', `${(-y * 24).toFixed(1)}deg`);
        l.style.setProperty('--bx', `${Math.round((x + .5) * 100)}%`); l.style.setProperty('--by', `${Math.round((y + .5) * 100)}%`);
      });
    });
    document.documentElement.addEventListener('mouseleave', suelta);   
    return;
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('libro3d--barre'); io.unobserve(e.target); }
  }), { threshold: .6 });
  const mira = () => document.querySelectorAll('.libro3d:not(.libro3d--barre)').forEach(l => io.observe(l));
  mira();
  addEventListener('load', mira);
})();
