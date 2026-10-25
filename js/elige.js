 
(() => {
  const LIBROS = ['sabana', 'amazonas', 'norte', 'oriente', 'bosques', 'australia', 'pinguino', 'artico'];
  const pedido = new URLSearchParams(location.search).get('libro');
  let guardado = null;   
  try { guardado = sessionStorage.getItem('selvativo-libro'); } catch (e) {}
  const venta = LIBROS.filter(k => (window.AMAZON || {})[k]), bolsa = venta.length ? venta : LIBROS;
  window.ELEGIDO = LIBROS.includes(pedido) ? pedido : LIBROS.includes(guardado) ? guardado : bolsa[Math.floor(Math.random() * bolsa.length)];
  try { sessionStorage.setItem('selvativo-libro', window.ELEGIDO); } catch (e) {}
  document.documentElement.dataset.elegido = window.ELEGIDO;
})();
