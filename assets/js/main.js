document.addEventListener('DOMContentLoaded', () => {
  /* ================= DATOS ================= */
  const WA_NUMBER = '573028459802';
  const PRICE = 138000, PEOPLE = 35, TOTAL = PRICE * PEOPLE;
  const DISHES = {
    e1:{name:'Ceviche de camarón',img:'assets/images/entrada-1.jpeg'},
    e2:{name:'Croqueta de falafel',img:'assets/images/entrada-2.jpeg'},
    p1:{name:'Coq au Vin',img:'assets/images/plato-1.jpeg'},
    p2:{name:'Pollo estofado',img:'assets/images/plato-2.jpeg'},
    d1:{name:'Pera confitada',img:'assets/images/postre-1.jpeg'},
    d2:{name:'Mini pavlova rellena',img:'assets/images/postre-2.jpeg'}
  };
  const COURSES = [
    {key:'entrada',label:'Entrada',emoji:'🥗'},
    {key:'plato',label:'Plato fuerte',emoji:'🍽️'},
    {key:'postre',label:'Postre',emoji:'🍰'}
  ];
  const PRESETS = {
    1:{entrada:'e1',plato:'p1',postre:'d1',label:'Menú recomendado 1 (Intenso y sofisticado)'},
    2:{entrada:'e2',plato:'p2',postre:'d2',label:'Menú recomendado 2 (Suave y cremoso)'}
  };
  const state = {entrada:null,plato:null,postre:null};
  const fmt = n => new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(n);

  // Quote extras: single source of truth for the page and WhatsApp (keep assets/docs PDF in sync)
  const EXTRAS = [
    {group:'Bebidas', items:[
      {name:'Bebidas', detail:'35 personas', price:200000}
    ]},
    {group:'Menaje y mobiliario', items:[
      {name:'Platos para torta', detail:'35 unidades', price:70000},
      {name:'Platos', detail:'35 unidades', price:70000},
      {name:'Cubiertos (tenedor, cuchillo, cuchara)', detail:'35 unidades', price:140000},
      {name:'Copas', detail:'35 unidades', price:70000},
      {name:'Manteles', detail:'3 unidades', price:36000},
      {name:'Caminos de mesa', detail:'3 unidades', price:36000},
      {name:'Sillas doradas', detail:'35 unidades', price:350000},
      {name:'Mesas', detail:'3 unidades', price:45000},
      {name:'Platos base dorados', detail:'35 unidades', price:105000}
    ]},
    {group:'Logística', items:[
      {name:'Transporte y ayudante', detail:'', price:250000}
    ]},
    {group:'Servicio de atención', items:[
      {name:'Servicio de inicio a fin del evento', detail:'2 meseros, 1 auxiliar de cocina, 1 chef, 1 bartender', price:800000}
    ]}
  ];
  const EXTRAS_TOTAL = EXTRAS.flatMap(g => g.items).reduce((s, i) => s + i.price, 0);
  const GRAND_TOTAL = TOTAL + EXTRAS_TOTAL;
  console.assert(EXTRAS_TOTAL === 2172000 && GRAND_TOTAL === 7002000, 'Quote totals changed', EXTRAS_TOTAL, GRAND_TOTAL);

  const billRow = (name, detail, price) =>
    `<div><span>${name}${detail ? `<small>${detail}</small>` : ''}</span><b>$${fmt(price)}</b></div>`;
  document.querySelector('[data-bill]').innerHTML =
    `<p class="bill__group">Menú</p>` + billRow('Menú por persona', `$${fmt(PRICE)} × ${PEOPLE} personas`, TOTAL) +
    EXTRAS.map(g => `<p class="bill__group">${g.group}</p>` + g.items.map(i => billRow(i.name, i.detail, i.price)).join('')).join('');
  document.querySelector('[data-grand]').dataset.to = GRAND_TOTAL;

  /* ================= ENTORNO ================= */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGSAP = !!window.gsap;
  const anim = hasGSAP && !reduce;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  document.getElementById('year').textContent = new Date().getFullYear();

  // Imagen que falla → queda el fondo cacao (sin icono roto)
  document.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.style.opacity = 0; }, {once:true}));

  /* ================= LENIS (smooth scroll) ================= */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration:1.15, easing:t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel:true});
    if (anim && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToEl = (target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, {offset:-70, duration:1.4});
    else el.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
  };
  document.querySelectorAll('.js-scroll').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) { e.preventDefault(); scrollToEl(href); }
  }));

  // Header al hacer scroll
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ================= SPLIT TEXT ================= */
  function splitChars(el){
    const walk = (node, out) => {
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'word';
            [...part].forEach(c => { const s = document.createElement('span'); s.className = 'char'; s.textContent = c; w.appendChild(s); });
            out.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          const clone = n.cloneNode(false); walk(n, clone); out.appendChild(clone);
        }
      });
    };
    const label = el.textContent.trim();
    const frag = document.createElement('div'); walk(el, frag);
    el.innerHTML = ''; [...frag.childNodes].forEach(c => el.appendChild(c));
    el.setAttribute('aria-label', label);
    el.querySelectorAll('.word').forEach(w => w.setAttribute('aria-hidden','true'));
    return el.querySelectorAll('.char');
  }
  function splitWords(el){
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    return el.querySelectorAll('.w');
  }

  /* ================= ANIMACIONES ================= */
  if (anim) {
    // Hero
    const chars = splitChars(document.querySelector('[data-split]'));
    const tl = gsap.timeline({defaults:{ease:'expo.out'}});
    tl.from(chars, {yPercent:110, opacity:0, rotate:6, duration:1.1, stagger:.028})
      .from('.hero-fade', {y:24, opacity:0, duration:1, stagger:.12}, '-=.8')
      .from('#heroMedia', {clipPath:'inset(100% 0 0 0 round 300px 300px 24px 24px)', duration:1.5, ease:'expo.inOut'}, 0.1)
      .from('#heroImg', {scale:1.35, duration:2.2}, 0.1)
      .from('.hero__badge', {x:-30, opacity:0, duration:.9}, '-=1.2');
    gsap.to('#heroImg', {yPercent:-14, ease:'none', scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}});
    gsap.to('.hat', {yPercent:60, rotate:12, ease:'none', scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}});

    // Revelados genéricos
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.from(el, {y:50, opacity:0, duration:1.1, ease:'expo.out', scrollTrigger:{trigger:el, start:'top 88%'}});
    });

    // Texto destacado palabra por palabra (scrub)
    const words = splitWords(document.querySelector('[data-words]'));
    gsap.fromTo(words, {opacity:.15}, {opacity:1, stagger:.05, ease:'none',
      scrollTrigger:{trigger:'[data-words]', start:'top 80%', end:'bottom 55%', scrub:true}});

    // Menús sugeridos
    gsap.from('.menu', {y:80, opacity:0, duration:1.2, stagger:.15, ease:'expo.out', scrollTrigger:{trigger:'.menus', start:'top 82%'}});
    gsap.utils.toArray('.menu').forEach(m => {
      gsap.from(m.querySelectorAll('.menu__thumb'), {clipPath:'inset(100% 0 0 0)', duration:1.2, stagger:.1, ease:'expo.inOut', scrollTrigger:{trigger:m, start:'top 75%'}});
    });

    // Tarjetas de platos: fade + slide, máscara clip-path y zoom lento
    gsap.utils.toArray('.dish').forEach((card, i) => {
      const media = card.querySelector('.dish__media');
      const img = media.querySelector('img');
      const t = gsap.timeline({scrollTrigger:{trigger:card, start:'top 85%'}});
      card.style.transition = 'none'; // evita que la transición CSS pelee con GSAP durante la entrada
      t.fromTo(card, {y:70, opacity:0}, {y:0, opacity:1, duration:1.1, ease:'expo.out', delay:(i % 2) * .12,
        clearProps:'opacity,transform', onComplete:() => { card.style.transition = ''; }})
       .from(media, {clipPath:'inset(0 0 100% 0)', duration:1.3, ease:'expo.inOut'}, '<')
       .from(img, {scale:1.4, duration:2.4, ease:'expo.out', clearProps:'transform'}, '<');
      gsap.to(img, {yPercent:-6, ease:'none', scrollTrigger:{trigger:card, start:'top bottom', end:'bottom top', scrub:true}});
    });
    gsap.utils.toArray('.course__n').forEach(n => {
      gsap.from(n, {xPercent:-30, opacity:0, duration:1.2, ease:'expo.out', scrollTrigger:{trigger:n, start:'top 88%'}});
    });
  }

  /* ================= TILT 3D ================= */
  if (fine && !reduce) {
    const tilt = (el, max) => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        const tf = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-8px)`;
        if (hasGSAP) gsap.to(el, {transform:tf, duration:.6, ease:'power3.out', overwrite:'auto'}); else el.style.transform = tf;
      });
      el.addEventListener('pointerleave', () => {
        const tf = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        if (hasGSAP) gsap.to(el, {transform:tf, duration:.9, ease:'elastic.out(1,.6)', overwrite:'auto'}); else el.style.transform = '';
      });
    };
    document.querySelectorAll('.dish').forEach(el => tilt(el, 6));
    document.querySelectorAll('.js-tilt').forEach(el => tilt(el, 3));

    // Botones magnéticos
    document.querySelectorAll('.js-magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        if (b.disabled || !hasGSAP) return;
        const r = b.getBoundingClientRect();
        gsap.to(b, {x:(e.clientX - r.left - r.width / 2) * .18, y:(e.clientY - r.top - r.height / 2) * .3, duration:.5, ease:'power3.out'});
      });
      b.addEventListener('pointerleave', () => hasGSAP && gsap.to(b, {x:0, y:0, duration:.8, ease:'elastic.out(1,.5)'}));
    });
  }

  // Ripple en todos los botones
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn');
    if (!b || b.disabled || reduce) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const sp = document.createElement('span'); sp.className = 'ripple';
    sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(sp); setTimeout(() => sp.remove(), 700);
  });

  /* ================= CONTADOR ================= */
  function countUp(el, to){
    if (!anim) { el.textContent = fmt(to); return; }
    const o = {v:0};
    gsap.to(o, {v:to, duration:2, ease:'power3.out', onUpdate:() => { el.textContent = fmt(o.v); }});
  }
  document.querySelectorAll('.js-count').forEach(el => {
    const to = +el.dataset.to;
    if (!anim || !window.ScrollTrigger) { el.textContent = fmt(to); return; }
    ScrollTrigger.create({trigger:el, start:'top 92%', once:true, onEnter:() => countUp(el, to)});
  });

  /* ================= LÓGICA DEL SELECTOR ================= */
  const menuType = () => {
    if (!state.entrada || !state.plato || !state.postre) return null;
    for (const k in PRESETS) {
      const p = PRESETS[k];
      if (p.entrada === state.entrada && p.plato === state.plato && p.postre === state.postre) return {kind:'rec', id:k, label:p.label};
    }
    return {kind:'custom', label:'Personalizado'};
  };
  const done = () => COURSES.filter(c => state[c.key]).length;

  function statusHTML(){
    const t = menuType();
    if (!t) { const f = 3 - done(); return `<span class="status status--pending">Faltan ${f} ${f === 1 ? 'tiempo' : 'tiempos'} por elegir</span>`; }
    return t.kind === 'rec'
      ? '<span class="status status--rec">✨ Combinación recomendada por el chef</span>'
      : '<span class="status status--custom">Menú personalizado</span>';
  }
  const thumb = id => id ? `<img src="${DISHES[id].img}" alt="" loading="lazy">` : '<span class="q" aria-hidden="true">?</span>';
  const rowHTML = c => `<li class="row" data-row="${c.key}"><span class="row__thumb">${thumb(state[c.key])}</span><span class="row__txt"><small>${c.label}</small>${state[c.key] ? `<span>${DISHES[state[c.key]].name}</span>` : '<span class="empty">Por elegir</span>'}</span></li>`;

  let lastStatus = '';
  function render(changed){
    // Tarjetas
    document.querySelectorAll('.dish').forEach(card => {
      const course = card.dataset.course, id = card.dataset.id, sel = state[course];
      const isSel = sel === id, wasSel = card.classList.contains('is-selected');
      card.classList.toggle('is-selected', isSel);
      card.classList.toggle('is-dim', !!sel && !isSel);
      card.querySelector('input').checked = isSel;
      const check = card.querySelector('.dish__check'), path = check.querySelector('path'), rect = card.querySelector('.dish__frame rect');
      if (isSel && !wasSel) {
        if (anim) {
          gsap.timeline()
            .to(check, {scale:1, duration:.6, ease:'back.out(2)'})
            .fromTo(path, {strokeDashoffset:1}, {strokeDashoffset:0, duration:.45, ease:'power2.out'}, '-=.25');
          gsap.fromTo(rect, {strokeDashoffset:1}, {strokeDashoffset:0, duration:1.1, ease:'power2.inOut'});
          gsap.fromTo(card, {scale:.97}, {scale:1, duration:.7, ease:'elastic.out(1,.5)', clearProps:'scale'});
        } else { check.style.transform = 'scale(1)'; path.style.strokeDashoffset = 0; rect.style.strokeDashoffset = 0; }
      } else if (!isSel && wasSel) {
        if (anim) {
          gsap.to(check, {scale:0, duration:.35, ease:'power2.in'});
          gsap.to(rect, {strokeDashoffset:1, duration:.5, ease:'power2.in'});
        } else { check.style.transform = 'scale(0)'; path.style.strokeDashoffset = 1; rect.style.strokeDashoffset = 1; }
      }
    });
    document.querySelectorAll('.dish').forEach(card => {
      const lbl = card.querySelector('.pick-label');
      const base = {entrada:'Elegir esta entrada', plato:'Elegir este plato', postre:'Elegir este postre'}[card.dataset.course];
      lbl.textContent = card.classList.contains('is-selected') ? 'Seleccionado' : base;
    });

    // Resumen sticky + bloque de cotización
    document.querySelectorAll('[data-summary-rows],[data-chosen]').forEach(list => {
      list.innerHTML = COURSES.map(rowHTML).join('');
      if (anim && changed) {
        const rows = changed === 'all' ? list.children : list.querySelectorAll(`[data-row="${changed}"]`);
        gsap.from(rows, {x:24, opacity:0, duration:.7, stagger:.08, ease:'expo.out'});
        gsap.from([...rows].map(r => r.querySelector('.row__thumb')), {scale:.6, duration:.8, stagger:.08, ease:'back.out(2)'});
      }
    });
    const sHTML = statusHTML();
    document.querySelectorAll('[data-status-wrap]').forEach(w => {
      if (sHTML !== lastStatus) {
        w.innerHTML = sHTML;
        if (anim) gsap.from(w.firstElementChild, {y:14, scale:.85, opacity:0, duration:.7, ease:'back.out(2.2)'});
      }
    });
    lastStatus = sHTML;

    // Barra móvil
    document.querySelector('[data-mslots]').innerHTML = COURSES.map((c, i) => `<span class="mbar__slot">${state[c.key] ? `<img src="${DISHES[state[c.key]].img}" alt="">` : i + 1}</span>`).join('');
    const t = menuType();
    document.querySelector('[data-mstatus]').textContent = t ? (t.kind === 'rec' ? '✨ Recomendado por el chef' : 'Menú personalizado') : `${done()} de 3 tiempos`;
    if (anim && changed) gsap.from('[data-mslots] .mbar__slot', {scale:.8, duration:.5, stagger:.05, ease:'back.out(2)'});

    // Botón WhatsApp
    const btn = document.getElementById('sendBtn'), st = document.getElementById('formStatus');
    const complete = done() === 3;
    const wasDisabled = btn.disabled;
    btn.disabled = !complete;
    st.className = 'form__status' + (complete ? ' ok' : '');
    st.textContent = complete ? '¡Listo! Tu menú está completo.' : `Elige los 3 tiempos para continuar (faltan: ${COURSES.filter(c => !state[c.key]).map(c => c.label.toLowerCase()).join(', ')}).`;
    if (complete && wasDisabled && anim) gsap.fromTo(btn, {scale:.92}, {scale:1, duration:.9, ease:'elastic.out(1,.45)'});
  }

  // Eventos de selección
  document.querySelectorAll('.dish input').forEach(inp => inp.addEventListener('change', () => {
    state[inp.name] = inp.value; render(inp.name);
  }));
  document.querySelectorAll('.js-preset').forEach(b => b.addEventListener('click', () => {
    const p = PRESETS[b.dataset.preset];
    state.entrada = p.entrada; state.plato = p.plato; state.postre = p.postre;
    render('all');
    setTimeout(() => scrollToEl('#armar'), 250);
  }));

  // Barra móvil: visible dentro del selector
  const mbar = document.getElementById('mbar');
  const builder = document.getElementById('armar');
  const io = new IntersectionObserver(([e]) => mbar.classList.toggle('is-visible', e.isIntersecting), {rootMargin:'-30% 0px -30% 0px'});
  io.observe(builder);

  /* ================= WHATSAPP ================= */
  const fmtDate = v => { if (!v) return 'Sin definir'; const [y, m, d] = v.split('-'); return `${d}/${m}/${y}`; };
  document.getElementById('quoteForm').addEventListener('submit', e => {
    e.preventDefault();
    if (done() < 3) return;
    const f = e.target, t = menuType();
    const msg =
`Hola Cocoa 👋 Quiero confirmar mi menú para el evento:
🥗 Entrada: ${DISHES[state.entrada].name}
🍽️ Plato fuerte: ${DISHES[state.plato].name}
🍰 Postre: ${DISHES[state.postre].name}
Tipo: ${t.label}
Personas: ${PEOPLE}
Valor por persona: $${fmt(PRICE)}
Total menú: $${fmt(TOTAL)} COP

${EXTRAS.map(g => `${g.group}:\n` + g.items.map(i => `• ${i.name}${i.detail ? ` (${i.detail})` : ''}: $${fmt(i.price)}`).join('\n')).join('\n')}

TOTAL COTIZACIÓN: $${fmt(GRAND_TOTAL)} COP
Nombre: ${f.nombre.value.trim() || 'Sin especificar'}
Fecha del evento: ${fmtDate(f.fecha.value)}
Comentarios: ${f.comentarios.value.trim() || 'Ninguno'}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  render(null);
  if (window.ScrollTrigger) window.addEventListener('load', () => ScrollTrigger.refresh());
});
