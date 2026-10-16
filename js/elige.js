 
(() => {
  const LIBROS = ['sabana', 'amazonas', 'norte', 'oriente', 'bosques', 'australia', 'pinguino', 'artico'];
  const pedido = new URLSearchParams(location.search).get('libro');
  window.ELEGIDO = LIBROS.includes(pedido) ? pedido : LIBROS[Math.floor(Math.random() * LIBROS.length)];
  document.documentElement.dataset.elegido = window.ELEGIDO;
})();
