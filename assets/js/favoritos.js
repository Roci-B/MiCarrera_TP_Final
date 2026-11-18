/* Página de favoritos: las tarjetas, la leyenda, los gráficos y la tabla
   salen de las carreras guardadas desde el index (ver catalogo.js). */
(() => {
  const $ = id => document.getElementById(id);
  const MOD = {presencial: 'Presencial', semi: 'Semipresencial', virtual: 'Virtual'};
  const DEM = ['', 'Media', 'Alta', 'Muy alta'];
  const off = new Set();   // favoritas que el usuario destildó de la comparación

  const names = () => MC.user() ? MC.favs().filter(n => CARRERAS[n]) : [];
  // paleta monocromática: azul de más intenso a más claro según la posición en favoritos
  const shade = (i, n) => `hsl(214 72% ${n < 2 ? 52 : Math.round(46 + i * 30 / (n - 1))}%)`;
  const costChip = c => c.free ? '<span class="chip gratis">Gratuita</span>' : '<span class="chip">Arancelada</span>';

  /* ---------- tarjetas y leyenda ---------- */
  const card = n => {
    const c = CARRERAS[n];
    return `<article class="fav t-${c.t}" data-fav="${n}">
      <div class="fav-top"><div class="ficha sm${c.free ? ' free' : ''}"><b>${c.years}</b><span>años</span></div><button class="btn-icon" type="button" aria-label="Quitar ${n} de favoritos"><svg class="i"><use href="#i-x"/></svg></button></div>
      <h3>${n}</h3><p class="uni">${c.uni}</p>
      <div class="chips"><span class="chip">${c.tipo}</span><span class="chip mod">${MOD[c.t]}</span>${costChip(c)}</div>
      <p class="desc">${c.desc}</p>
      <label class="cmp"><input type="checkbox" value="${n}"${off.has(n) ? '' : ' checked'}>Incluir en la comparación</label>
      <div class="fav-act"><a class="btn btn-primary" href="index.html#detalle">Ver detalle</a><button class="btn btn-ghost" type="button"><svg class="i"><use href="#i-phone"/></svg>Contacto</button></div>
    </article>`;
  };
  const legendItem = (n, i, total) => {
    const c = CARRERAS[n];
    return `<li style="--tone:${shade(i, total)}"><label><input type="checkbox" value="${n}"${off.has(n) ? '' : ' checked'}><span><b>${n}</b><span>${c.uni}, ${MOD[c.t].toLowerCase()}</span></span></label></li>`;
  };

  /* ---------- gráficos ---------- */
  const panels = [
    {title: 'Duración', sub: 'En años de cursada', min: 0, max: 6, ticks: [0, 2, 4, 6], tick: v => v, span: r => [0, r.years], label: r => `${r.years} años`, key: r => -r.years, win: 'Más corta'},
    {title: 'Salario inicial estimado', sub: 'Rango en miles de pesos*', min: 30, max: 60, ticks: [30, 40, 50, 60], tick: v => `$${v}k`, span: r => r.sal, label: r => `$${r.sal[0]}–${r.sal[1]}k`, key: r => r.sal[1], win: 'Rango más alto'},
    {title: 'Demanda laboral', sub: 'Búsquedas activas de empleo', min: 0, max: 3, ticks: [1, 2, 3], tick: v => DEM[v], span: r => [0, r.dem], label: r => DEM[r.dem], key: r => r.dem, win: 'Mayor demanda'},
  ];
  // parte el nombre en dos líneas equilibradas: "Ingeniería en" / "Sistemas"
  function wrap(name) {
    const w = name.split(' ');
    if (w.length < 2) return [name];
    let best = 1, diff = Infinity;
    for (let i = 1; i < w.length; i++) {
      const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length);
      if (d < diff) { diff = d; best = i; }
    }
    return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
  }
  function panelSVG(p, rows) {
    const W = 376, L = 124, R = 284, rowH = 42, top = 4, H = top + rows.length * rowH + 24;
    const x = v => L + (v - p.min) / (p.max - p.min) * (R - L);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${p.title}: ${rows.map(r => `${r.name} ${p.label(r)}`).join(', ')}">`;
    for (const t of p.ticks) s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top}" y2="${H - 20}"/><text class="tick" x="${x(t)}" y="${H - 5}" text-anchor="middle">${p.tick(t)}</text>`;
    rows.forEach((r, i) => {
      const y = top + i * rowH + 8, [a, b] = p.span(r);
      const [l1, l2] = wrap(r.name);
      s += `<text class="rl" x="0" y="${l2 ? y + 5 : y + 15}">${l1}${l2 ? `<tspan x="0" dy="14">${l2}</tspan>` : ''}</text>
        <rect x="${x(a)}" y="${y}" width="${Math.max(x(b) - x(a), 4)}" height="20" rx="6" style="fill:${r.color}"/>
        <text class="vl" x="${x(b) + 8}" y="${y + 15}">${p.label(r)}</text>`;
    });
    return s + '</svg>';
  }

  /* ---------- tabla ---------- */
  const ROWS = [
    ['Tipo de carrera', c => c.tipo],
    ['Modalidad', c => `<span class="chip mod">${MOD[c.t]}</span>`, c => `t-${c.t}`],
    ['Duración', c => `${c.years} años`],
    ['Costo', costChip],
    ['Ubicación', c => c.ubic],
    ['Requisitos de ingreso', c => c.req],
    ['Demanda laboral', c => DEM[c.dem]],
    ['Salario inicial*', c => `$${c.sal[0]}–${c.sal[1]}k`],
    ['Plan de estudios', c => c.plan],
    ['Posgrado', c => c.pos],
    ['Trabajo remoto', c => c.remoto],
  ];
  function drawTable(rows) {
    const table = $('cmpTable');
    table.style.minWidth = `${200 + rows.length * 190}px`;
    table.innerHTML = `<thead><tr><th scope="col">Aspecto</th>${rows.map(r =>
      `<th scope="col" style="--tone:${r.color}"><span class="sw"></span>${r.name}<span>${r.uni}</span></th>`).join('')}</tr></thead>
      <tbody>${ROWS.map(([label, fn, cls]) => `<tr><th scope="row">${label}</th>${rows.map(r =>
        `<td${cls ? ` class="${cls(r)}"` : ''}>${fn(r)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  }

  /* ---------- armado ---------- */
  function drawCmp() {
    const list = names();
    const rows = list.filter(n => !off.has(n)).map(n => ({name: n, ...CARRERAS[n], color: shade(list.indexOf(n), list.length)}));
    const btn = $('cmpBtn');
    btn.textContent = `Comparar seleccionadas (${rows.length})`;
    btn.setAttribute('aria-disabled', rows.length < 2);
    $('charts').innerHTML = rows.length ? panels.map(p => {
      const best = Math.max(...rows.map(p.key));
      const winners = rows.filter(r => p.key(r) === best).map(r => r.short).join(' y ');
      return `<figure class="chart"><figcaption><b>${p.title}</b><span>${p.sub}</span></figcaption>${panelSVG(p, rows)}<p class="win">${p.win}: ${winners}</p></figure>`;
    }).join('') : '<p class="note">Seleccioná al menos una carrera para ver los gráficos.</p>';
    $('cmpTableWrap').hidden = !rows.length;
    if (rows.length) drawTable(rows);
  }
  // se llama cada vez que cambian los favoritos (auth.js avisa con el evento mc:favs)
  function render() {
    const list = names();
    $('favGrid').innerHTML = list.map(card).join('');
    $('cmpLegend').innerHTML = list.map((n, i) => legendItem(n, i, list.length)).join('');
    $('comparar').hidden = !list.length;
    drawCmp();
  }

  // tildar en la tarjeta o en la leyenda: se mantienen sincronizados sin redibujar todo
  function pick(e) {
    const input = e.target;
    if (input.type !== 'checkbox') return;
    input.checked ? off.delete(input.value) : off.add(input.value);
    document.querySelectorAll('#favGrid input, #cmpLegend input').forEach(i => { if (i.value === input.value) i.checked = input.checked; });
    drawCmp();
  }
  // con menos de dos carreras tildadas el botón está deshabilitado: no navega
  $('cmpBtn').addEventListener('click', e => { if (e.currentTarget.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
  $('favGrid').addEventListener('change', pick);
  $('cmpLegend').addEventListener('change', pick);

  document.addEventListener('mc:favs', render);
  window.addEventListener('storage', () => MC.syncFavs());   // cambios hechos en otra pestaña
  MC.syncFavs();
})();
