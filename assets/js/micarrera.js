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
