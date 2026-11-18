const MOD = { presencial: 'Presencial', semi: 'Semipresencial', virtual: 'Virtual' };
const fmt = n => n.toLocaleString('es-AR');
const $ = id => document.getElementById(id);

/* ---------- modo claro / oscuro ---------- */
const root = document.documentElement, themeBtn = $('themeToggle'), darkMQ = matchMedia('(prefers-color-scheme: dark)');
try { const t = localStorage.getItem('micarrera-tema'); if (t) root.dataset.theme = t; } catch (e) { }
const isDark = () => (root.dataset.theme || (darkMQ.matches ? 'dark' : 'light')) === 'dark';
function syncThemeBtn() {
  const d = isDark();
  themeBtn.setAttribute('aria-label', d ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  themeBtn.querySelector('use').setAttribute('href', d ? '#i-sun' : '#i-moon');
}
themeBtn.onclick = () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('micarrera-tema', root.dataset.theme); } catch (e) { }
  syncThemeBtn();
};
darkMQ.addEventListener('change', syncThemeBtn);
syncThemeBtn();

/* ---------- slider de carreras destacadas ---------- */
const slides = [
  {
    name: 'Ingeniería en Sistemas', uni: 'Universidad Nacional de La Matanza', short: 'UNLaM', tipo: 'Ingeniería', t: 'presencial', free: true, years: 5, c: 12480, icon: 'i-code',
    blurb: 'Diseñá y desarrollá soluciones tecnológicas: programación, bases de datos, redes y seguridad informática.'
  },
  {
    name: 'Licenciatura en Enfermería', uni: 'Universidad de Buenos Aires', short: 'UBA', tipo: 'Licenciatura', t: 'presencial', free: true, years: 3, c: 10950, icon: 'i-plus',
    blurb: 'Atención integral del paciente, investigación y gestión sanitaria, con prácticas en hospitales desde el primer año.'
  },
  {
    name: 'Tecnicatura en Programación', uni: 'UTN, Facultad Regional Avellaneda', short: 'UTN', tipo: 'Tecnicatura', t: 'semi', free: true, years: 2, c: 9310, icon: 'i-laptop',
    blurb: 'Programación aplicada en dos años. Cursás una parte en la facultad cada semana y el resto en línea.'
  },
  {
    name: 'Administración de Empresas', uni: 'Universidad Nacional de Quilmes', short: 'UNQ', tipo: 'Licenciatura', t: 'virtual', free: false, years: 4, c: 8720, icon: 'i-chart',
    blurb: 'Gestión, finanzas, recursos humanos y estrategia comercial. Cursada 100% a distancia, a tu ritmo.'
  },
  {
    name: 'Psicología', uni: 'Universidad de Buenos Aires', short: 'UBA', tipo: 'Licenciatura', t: 'presencial', free: true, years: 5, c: 7640, icon: 'i-mind',
    blurb: 'Estudio científico del comportamiento humano, con formación en teoría, investigación y práctica clínica.'
  },
  {
    name: 'Diseño Gráfico', uni: 'Universidad Argentina de la Empresa', short: 'UADE', tipo: 'Licenciatura', t: 'presencial', free: false, years: 4, c: 6200, icon: 'i-pen',
    blurb: 'Identidad visual, diseño editorial y digital, con talleres prácticos y un portfolio desde el primer año.'
  },
];
const stage = $('stage');
if (stage) {
  const maxC = Math.max(...slides.map(s => s.c));
  const body = $('stageBody'), list = $('rankList'), grid = $('heroGrid');
  let cur = 0;

  list.innerHTML = slides.map((s, k) => `
  <li><button class="rank-item t-${s.t}" type="button" data-i="${k}" aria-label="Ver ${s.name}, puesto ${k + 1}">
    <span class="rank-n${s.free ? ' free' : ''}">${k + 1}</span>
    <span><span class="rank-name">${s.name}</span><span class="rank-uni">${s.short}, ${MOD[s.t].toLowerCase()}${s.free ? ', gratuita' : ''}</span></span>
    <span class="rank-num">${fmt(s.c)}</span>
    <span class="rank-bar"><i style="width:${s.c / maxC * 100}%"></i></span>
    <span class="rank-prog"></span>
  </button></li>`).join('');
  const items = [...list.querySelectorAll('.rank-item')];

  function show(k, byUser) {
    cur = (k + slides.length) % slides.length;
    const s = slides[cur];
    stage.className = 'stage t-' + s.t;
    body.setAttribute('aria-live', byUser ? 'polite' : 'off');
    body.innerHTML = `
    <p class="stage-kicker"><span class="rank-badge">Nº ${cur + 1}</span>${fmt(s.c)} consultas este mes</p>
    <h2 class="stage-name">${s.name}</h2>
    <p class="stage-uni">${s.uni}</p>
    <p class="stage-blurb">${s.blurb}</p>
    <div class="chips on-tone"><span class="chip">${s.tipo}</span><span class="chip mod">${MOD[s.t]}</span>${s.free ? '<span class="chip gratis">Gratuita</span>' : '<span class="chip">Arancelada</span>'}<span class="chip">${s.years} años</span></div>
    <div class="stage-act"><a class="btn btn-light" href="#detalle">Ver carrera</a><button class="btn btn-line-light fav-toggle" type="button" aria-pressed="false" data-fav="${s.name}"><svg class="i"><use href="#i-heart"/></svg><span class="fav-label">Guardar</span></button></div>`;
    stage.querySelector('.stage-art')?.remove();
    stage.insertAdjacentHTML('afterbegin', `<svg class="stage-art" aria-hidden="true" viewBox="0 0 24 24"><use href="#${s.icon}"/></svg>`);
    body.classList.remove('enter'); void body.offsetWidth; body.classList.add('enter');
    $('pos').textContent = `${cur + 1} de ${slides.length}`;
    items.forEach((b, j) => {
      b.setAttribute('aria-current', j === cur ? 'true' : 'false');
      const p = b.querySelector('.rank-prog');
      p.classList.remove('run');
      if (j === cur) { void p.offsetWidth; p.classList.add('run'); }
    });
    window.MC?.syncFavs();
    if (byUser && matchMedia('(max-width:900px)').matches) items[cur].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  // la barra de progreso del ítem activo marca el tiempo: al terminar, avanza (no corre con reduced-motion)
  list.addEventListener('animationend', e => { if (e.target.classList.contains('rank-prog')) show(cur + 1); });
  list.addEventListener('click', e => { const b = e.target.closest('.rank-item'); if (b) show(+b.dataset.i, true); });
  $('prev').onclick = () => show(cur - 1, true);
  $('next').onclick = () => show(cur + 1, true);
  $('pause').onclick = e => {
    const paused = grid.classList.toggle('paused');
    e.currentTarget.setAttribute('aria-label', paused ? 'Reanudar rotación' : 'Pausar rotación');
    e.currentTarget.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) $('pause').hidden = true;
  show(0);
}

/* ---------- búsqueda ---------- */
$('searchForm')?.addEventListener('submit', e => {
  e.preventDefault();
  $('qEcho').textContent = $('q').value.trim() || 'todas las áreas';
  $('resultados').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

/* ---------- filtros de resultados ---------- */
const filters = $('filters'), groups = ['tipo', 'mod', 'cost'];
function applyFilters() {
  const sel = Object.fromEntries(groups.map(g => [g, [...filters.querySelectorAll(`input[name="${g}"]:checked`)].map(i => i.value)]));
  let n = 0;
  document.querySelectorAll('#resList .res').forEach(card => {
    const ok = groups.every(g => !sel[g].length || sel[g].includes(card.dataset[g]));
    card.hidden = !ok; n += ok;
  });
  $('resCount').textContent = n === 1 ? '1 carrera' : `${n} carreras`;
  $('resEmpty').hidden = n > 0;
}
if (filters) {
  filters.addEventListener('change', applyFilters);
  filters.addEventListener('reset', () => setTimeout(applyFilters));
  $('clearFilters').onclick = () => filters.reset();
}

// /* ---------- selección para comparar ---------- */
// const cmpChecks = [...document.querySelectorAll('.cmp input')];
// function updCmp() {
//   const n = cmpChecks.filter(c => c.checked).length;
//   $('cmpBtn').textContent = `Comparar seleccionadas (${n})`;
//   $('cmpBtn').setAttribute('aria-disabled', n < 2);
// }
// cmpChecks.forEach(c => c.addEventListener('change', updCmp));

// /* ---------- gráfico de comparación ---------- */
// const cmp = [
//   { short: 'Sistemas', name: 'Ingeniería en Sistemas', uni: 'UNLaM', t: 'presencial', years: 5, sal: [45, 55], dem: 3 },
//   { short: 'Administración', name: 'Administración de Empresas', uni: 'UNQ', t: 'virtual', years: 4, sal: [35, 45], dem: 2 },
//   { short: 'Programación', name: 'Tecnicatura en Programación', uni: 'UTN Avellaneda', t: 'semi', years: 2, sal: [40, 50], dem: 3 },
// ];
// const DEM = ['', 'Media', 'Alta', 'Muy alta'];
// const panels = [
//   { title: 'Duración', sub: 'En años de cursada', min: 0, max: 6, ticks: [0, 2, 4, 6], tick: v => v, span: r => [0, r.years], label: r => `${r.years} años`, key: r => -r.years, win: 'Más corta' },
//   { title: 'Salario inicial estimado', sub: 'Rango en miles de pesos*', min: 30, max: 60, ticks: [30, 40, 50, 60], tick: v => `$${v}k`, span: r => r.sal, label: r => `$${r.sal[0]}–${r.sal[1]}k`, key: r => r.sal[1], win: 'Rango más alto' },
//   { title: 'Demanda laboral', sub: 'Búsquedas activas de empleo', min: 0, max: 3, ticks: [1, 2, 3], tick: v => DEM[v], span: r => [0, r.dem], label: r => DEM[r.dem], key: r => r.dem, win: 'Mayor demanda' },
// ];
// // function panelSVG(p) {
// //   const W = 360, L = 108, R = 272, rowH = 42, top = 4, H = top + cmp.length * rowH + 24;
// //   const x = v => L + (v - p.min) / (p.max - p.min) * (R - L);
// //   let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${p.title}: ${cmp.map(r => `${r.short} ${p.label(r)}`).join(', ')}">`;
// //   for (const t of p.ticks) s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top}" y2="${H - 20}"/><text class="tick" x="${x(t)}" y="${H - 5}" text-anchor="middle">${p.tick(t)}</text>`;
// //   cmp.forEach((r, i) => {
// //     const y = top + i * rowH + 8, [a, b] = p.span(r);
// //     s += `<text class="rl" x="0" y="${y + 15}">${r.short}</text>
// //       <rect x="${x(a)}" y="${y}" width="${Math.max(x(b) - x(a), 4)}" height="20" rx="6" style="fill:var(--c-${r.t})"/>
// //       <text class="vl" x="${x(b) + 8}" y="${y + 15}">${p.label(r)}</text>`;
// //   });
// //   return s + '</svg>';
// // }

// // parte el nombre en dos líneas equilibradas: "Ingeniería en" / "Sistemas"
// function wrap(name) {
//   const w = name.split(' ');
//   if (w.length < 2) return [name];
//   let best = 1, diff = Infinity;
//   for (let i = 1; i < w.length; i++) {
//     const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length);
//     if (d < diff) { diff = d; best = i; }
//   }
//   return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
// }

// // function panelSVG(p) {
// //   const W = 376, L = 124, R = 284, rowH = 42, top = 4, H = top + cmp.length * rowH + 24;
// //   const x = v => L + (v - p.min) / (p.max - p.min) * (R - L);
// //   let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${p.title}: ${cmp.map(r => `${r.name} ${p.label(r)}`).join(', ')}">`;
// //   for (const t of p.ticks) s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top}" y2="${H - 20}"/><text class="tick" x="${x(t)}" y="${H - 5}" text-anchor="middle">${p.tick(t)}</text>`;
// //   cmp.forEach((r, i) => {
// //     const y = top + i * rowH + 8, [a, b] = p.span(r);
// //     const [l1, l2] = wrap(r.name);
// //     s += `<text class="rl" x="0" y="${l2 ? y + 5 : y + 15}">${l1}${l2 ? `<tspan x="0" dy="14">${l2}</tspan>` : ''}</text>
// //       <rect x="${x(a)}" y="${y}" width="${Math.max(x(b) - x(a), 4)}" height="20" rx="6" style="fill:var(--c-${r.t})"/>
// //       <text class="vl" x="${x(b) + 8}" y="${y + 15}">${p.label(r)}</text>`;
// //   });
// //   return s + '</svg>';
// // }

// function panelSVG(p, rows) {
//   const W = 376, L = 124, R = 284, rowH = 42, top = 4, H = top + rows.length * rowH + 24;
//   const x = v => L + (v - p.min) / (p.max - p.min) * (R - L);
//   let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${p.title}: ${rows.map(r => `${r.name} ${p.label(r)}`).join(', ')}">`;
//   for (const t of p.ticks) s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top}" y2="${H - 20}"/><text class="tick" x="${x(t)}" y="${H - 5}" text-anchor="middle">${p.tick(t)}</text>`;
//   rows.forEach((r, i) => {
//     const y = top + i * rowH + 8, [a, b] = p.span(r);
//     const [l1, l2] = wrap(r.name);
//     s += `<text class="rl" x="0" y="${l2 ? y + 5 : y + 15}">${l1}${l2 ? `<tspan x="0" dy="14">${l2}</tspan>` : ''}</text>
//     //  <rect x="${x(a)}" y="${y}" width="${Math.max(x(b) - x(a), 4)}" height="20" rx="6" style="fill:var(--c-${r.t})"/>
//      <rect x="${x(a)}" y="${y}" width="${Math.max(x(b) - x(a), 4)}" height="20" rx="6" style="fill:var(--bar-${cmp.indexOf(r)})"/>
//       <text class="vl" x="${x(b) + 8}" y="${y + 15}">${p.label(r)}</text>`;
//   });
//   return s + '</svg>';
// }

// // if ($('charts')) {
// //   $('cmpLegend').innerHTML = cmp.map(r => `<li class="t-${r.t}"><span class="sw"></span><span><b>${r.name}</b><span>${r.uni}, ${MOD[r.t].toLowerCase()}</span></span></li>`).join('');
// //   $('charts').innerHTML = panels.map(p => {
// //     const best = Math.max(...cmp.map(p.key));
// //     const winners = cmp.filter(r => p.key(r) === best).map(r => r.short).join(' y ');
// //     return `<figure class="chart"><figcaption><b>${p.title}</b><span>${p.sub}</span></figcaption>${panelSVG(p)}<p class="win">${p.win}: ${winners}</p></figure>`;
// //   }).join('');
// // }

// if ($('charts')) {
//   const sel = new Set(cmp.map((_, i) => i));   // carreras tildadas
//   const legend = $('cmpLegend');

//   legend.innerHTML = cmp.map((r, i) => `<li class="t-${r.t}"><label><input type="checkbox" value="${i}" checked><span><b>${r.name}</b><span>${r.uni}, ${MOD[r.t].toLowerCase()}</span></span></label></li>`).join('');

//   function drawCharts() {
//     const rows = cmp.filter((_, i) => sel.has(i));
//     $('charts').innerHTML = rows.length ? panels.map(p => {
//       const best = Math.max(...rows.map(p.key));
//       const winners = rows.filter(r => p.key(r) === best).map(r => r.short).join(' y ');
//       return `<figure class="chart"><figcaption><b>${p.title}</b><span>${p.sub}</span></figcaption>${panelSVG(p, rows)}<p class="win">${p.win}: ${winners}</p></figure>`;
//     }).join('') : '<p class="note">Seleccioná al menos una carrera para ver los gráficos.</p>';
//   }

//   legend.addEventListener('change', e => {
//     const i = +e.target.value;
//     e.target.checked ? sel.add(i) : sel.delete(i);
//     drawCharts();
//   });
//   drawCharts();
// }
