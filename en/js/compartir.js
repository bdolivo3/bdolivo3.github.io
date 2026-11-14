/* Hecho por herramientas/traducir.py desde herramientas/idiomas/en.py. */
(() => {
  const DOMINIO = 'https://selvativo.com/';
  const TEXTO = libro => `${libro}: an animal coloring and activity book for ages 6 and up.`;
  window.enlaceCompartir = (libro, pagina) => {
    const url = DOMINIO + pagina;
    return `<a class="compartir" data-compartir data-libro="${libro}" data-url="${url}" aria-live="polite" target="_blank" rel="noopener"
      href="https://wa.me/?text=${encodeURIComponent(`${TEXTO(libro)} ${url}`)}">Compartir</a>`;
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-compartir]');
    if (!a) return;
    const datos = { title: a.dataset.libro, text: TEXTO(a.dataset.libro), url: a.dataset.url };
    if (navigator.share) {
      e.preventDefault();
      navigator.share(datos).catch(() => {});   
    } else if (navigator.clipboard) {
      e.preventDefault();
      navigator.clipboard.writeText(datos.url).then(() => {
        const antes = a.textContent; a.textContent = 'Link copied';
        setTimeout(() => { a.textContent = antes; }, 2200);
      }, () => window.open(a.href, '_blank', 'noopener'));
    }   
  });
})();
