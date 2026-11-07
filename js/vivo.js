 
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const raton = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const vivos = [...document.querySelectorAll('.vivo')];
  const centra = v => {   
    const c = v.parentElement.querySelector('.libro3d');
    if (!c) return;
    const a = v.getBoundingClientRect(), b = c.getBoundingClientRect();
    v.style.setProperty('--lx', `${Math.round(b.left - a.left + b.width / 2)}px`);
    v.style.setProperty('--ly', `${Math.round(b.top - a.top + b.height / 2)}px`);
    v.style.setProperty('--lw', `${Math.round(b.width)}px`);
    v.style.setProperty('--lh', `${Math.round(b.height)}px`);
  };
  const ro = new ResizeObserver(es => es.forEach(e => centra(e.target)));
  const io = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    v._ve = e.isIntersecting;
    v.classList.toggle('vivo--quieto', !v._ve);
    if (v._gl) v._gl(v._ve);
  }));
  vivos.forEach(v => { centra(v); v.classList.add('vivo--listo'); ro.observe(v); io.observe(v); });
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;
uniform vec2 ra;uniform vec4 caja;uniform float t,esc,hay;uniform vec3 base;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.45;}return s/.86;}
void main(){
 vec2 p=gl_FragCoord.xy,q=p/(esc*260.);
 vec2 d=(p-ra)/(esc*200.);float m=hay*exp(-dot(d,d));
 vec2 w=vec2(fbm(q+vec2(0.,t*.05)),fbm(q+vec2(5.2,1.3)-t*.04))+m*d*.8;
 float hojas=fbm(q*1.1+1.8*w+vec2(t*.015,0.));
 vec2 b=abs(p-caja.xy)-caja.zw;float f=length(max(b,0.))/(esc*70.);
 float der=max(p.x-caja.x-caja.z,0.)/(esc*35.);
 float luz=exp(-2.*f*f)*(1.-smoothstep(0.,1.,der))*(.86+.14*sin(t*.7));
 vec3 c=base*mix(.76,1.,smoothstep(.3,.7,hojas))+vec3(1.,.9,.7)*luz*(.1+.26*smoothstep(.48,.7,hojas));
 gl_FragColor=vec4(c,1.);
}`;
  let px = -1e4, py = -1e4;
  const shader = v => {
    const cv = document.createElement('canvas');
    cv.className = 'vivo__gl';
    const gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return null;
    const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    for (const n of ['ra', 'caja', 't', 'esc', 'hay', 'base']) U[n] = gl.getUniformLocation(pr, n);
    v.appendChild(cv);
    const s = v.parentElement, tapa = s.querySelector('.libro3d'), esc = .5;   
    let cuadro = 0, ult = 0, k = 0, hay = 0, col = [0, 0, 0];
    const pinta = ahora => {
      cuadro = requestAnimationFrame(pinta);
      if (ahora - ult < 33) return;
      ult = ahora;
      const a = v.getBoundingClientRect();
      if (k++ % 30 === 0) {   
        const W = Math.max(1, Math.round(a.width * esc)), H = Math.max(1, Math.round(a.height * esc));
        if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); }
        const m = getComputedStyle(s).backgroundColor.match(/[\d.]+/g);
        if (m) col = m.slice(0, 3).map(x => x / 255);
      }
      const dentro = px >= a.left && px <= a.right && py >= a.top && py <= a.bottom;
      hay += ((dentro ? 1 : 0) - hay) * .08;
      gl.uniform1f(U.t, ahora / 1000); gl.uniform1f(U.esc, esc); gl.uniform1f(U.hay, hay);
      gl.uniform2f(U.ra, (px - a.left) * esc, (a.bottom - py) * esc);
      if (tapa) {
        const b = tapa.getBoundingClientRect();
        gl.uniform4f(U.caja, (b.left - a.left + b.width / 2) * esc, (a.bottom - b.top - b.height / 2) * esc, b.width / 2 * esc, b.height / 2 * esc);
      } else gl.uniform4f(U.caja, -1e4, -1e4, 0, 0);
      gl.uniform3f(U.base, col[0], col[1], col[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      v.classList.add('vivo--gl');
    };
    const anda = si => {
      if (si && !cuadro) cuadro = requestAnimationFrame(pinta);
      if (!si && cuadro) { cancelAnimationFrame(cuadro); cuadro = 0; }
    };
    cv.addEventListener('webglcontextlost', () => {   
      anda(false); v.classList.remove('vivo--gl'); cv.remove(); v._gl = null;
    });
    anda(v._ve !== false);
    return anda;
  };
  if (raton && vivos.length) {
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { px = py = -1e4; });
    const empieza = () => vivos.forEach(v => { v._gl = shader(v); });
    const luego = () => (window.requestIdleCallback ? requestIdleCallback(empieza, { timeout: 1500 }) : setTimeout(empieza, 300));
    luego();
  }
  let capa = null;
  const vuela = (a, cuantas) => {
    if (!capa) {
      capa = document.createElement('div');
      capa.className = 'luces'; capa.setAttribute('aria-hidden', 'true');
      document.body.appendChild(capa);
    }
    const r = a.getBoundingClientRect(), papel = !a.closest('.mundo, .pie-web');
    for (let i = 0; i < cuantas; i++) {
      const l = document.createElement('span');
      l.className = papel ? 'luciernaga luciernaga--papel' : 'luciernaga';
      const x = r.left + Math.random() * r.width, y = r.top + r.height * (.2 + Math.random() * .6);
      const dx = (Math.random() - .5) * 90, dy = -(50 + Math.random() * 90), z = .6 + Math.random() * .7, o = (Math.random() - .5) * 30;
      const en = (f, ox, zz, op, offset) => ({ transform: `translate(${(x + dx * f + ox).toFixed(1)}px, ${(y + dy * f).toFixed(1)}px) scale(${zz.toFixed(2)})`, opacity: op, offset });
      capa.appendChild(l);
      l.animate([en(0, 0, z * .4, 0, 0), en(.3, o, z, 1, .25), en(.6, -o, z, .35, .55), en(.85, o * .5, z, 1, .78), en(1, 0, z * .5, 0, 1)],
        { duration: 1300 + Math.random() * 900, delay: Math.random() * 260, easing: 'ease-out', fill: 'both' }).onfinish = () => l.remove();
    }
  };
  const amazon = e => (e.target.closest ? e.target.closest('a[href*="amazon."]') : null);
  const ultima = new WeakMap();
  if (raton) {
    document.addEventListener('pointerover', e => {
      const a = amazon(e);
      if (!a || a.contains(e.relatedTarget)) return;
      const ya = performance.now();
      if (ultima.has(a) && ya - ultima.get(a) < 1500) return;
      ultima.set(a, ya); vuela(a, 7);
    });
  }
  document.addEventListener('pointerdown', e => { const a = amazon(e); if (a) { ultima.set(a, performance.now()); vuela(a, 16); } });
  if (!raton) {   
    const ve = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { ve.unobserve(e.target); setTimeout(() => vuela(e.target, 7), 350); }
    }), { threshold: .9 });
    const busca = () => document.querySelectorAll('a.btn[href*="amazon."]:not([data-luces])').forEach(a => { a.dataset.luces = ''; ve.observe(a); });
    busca();
  }
})();
