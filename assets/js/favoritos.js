/* Página de favoritos: las tarjetas, la leyenda, los gráficos y la tabla
   salen de las carreras guardadas desde el index (ver catalogo.js). */
(() => {
  const $ = id => document.getElementById(id);
  const MOD = {presencial: 'Presencial', semi: 'Semipresencial', virtual: 'Virtual'};
  const DEM = ['', 'Media', 'Alta', 'Muy alta'];
  const off = new Set();   // favoritas que el usuario destildó de la comparación

  const names = () => MC.user() ? MC.favs().filter(n => CARRERAS[n]) : [];
  // paleta monocromática: los tonos se reparten de oscuro a claro según cuántas carreras haya,
  // así siempre quedan lo más separados posible (extremos --cmp-l-from/--cmp-l-to en el CSS)
  const shade = (i, n) => {
    const t = n < 2 ? 0 : i / (n - 1);
    return `hsl(calc(250 + ${30 * t}) 62% calc(var(--cmp-l-from) + (var(--cmp-l-to) - var(--cmp-l-from)) * ${t}))`;
  };
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
    {title: 'Duración', sub: 'En años de cursada', min: 0, max: 6, ticks: [0, 2, 4, 6], tick: v => v, span: r => [0, r.years], label: r => `${r.years} años`, noValue: true, key: r => -r.years, win: 'Más corta'},
    {title: 'Salario inicial estimado', sub: 'Rango en miles de pesos*', pie: true, label: r => `$${r.sal[0]}–${r.sal[1]}k`, key: r => r.sal[1], win: 'Rango más alto'},
    {title: 'Demanda laboral', sub: 'Búsquedas activas de empleo', min: 0, max: 3, ticks: [1, 2, 3], tick: v => DEM[v], span: r => [0, r.dem], label: r => DEM[r.dem], noValue: true, key: r => r.dem, win: 'Mayor demanda'},
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
        ${p.noValue ? '' : `<text class="vl" x="${x(b) + 8}" y="${y + 15}">${p.label(r)}</text>`}`;
    });
    return s + '</svg>';
  }

  // torta de salarios: las carreras con el mismo rango se unifican en una sola porción;
  // de cada porción sale una flecha hacia las carreras que incluye
  function pieChart(p, rows) {
    const groups = [];
    rows.forEach(r => {
      const g = groups.find(x => x.rows[0].sal[0] === r.sal[0] && x.rows[0].sal[1] === r.sal[1]);
      g ? g.rows.push(r) : groups.push({rows: [r], color: r.color, value: (r.sal[0] + r.sal[1]) / 2});
    });
    const total = groups.reduce((a, g) => a + g.value, 0), cx = 188, cy = 115, R = 60, out = 22;
    let ang = -Math.PI / 2;
    let slices = '', arrows = '';
    groups.forEach(g => {
      const a = g.value / total * 2 * Math.PI, end = ang + a, mid = ang + a / 2;
      slices += groups.length === 1
        ? `<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:${g.color}"/>`
        : `<path d="M${cx} ${cy}L${cx + R * Math.cos(ang)} ${cy + R * Math.sin(ang)}A${R} ${R} 0 ${a > Math.PI ? 1 : 0} 1 ${cx + R * Math.cos(end)} ${cy + R * Math.sin(end)}Z" style="fill:${g.color};stroke:var(--surface);stroke-width:2"/>`;
      const c = Math.cos(mid), sn = Math.sin(mid);
      const x1 = cx + R * .62 * c, y1 = cy + R * .62 * sn, x2 = cx + (R + out) * c, y2 = cy + (R + out) * sn;
      const anchor = Math.abs(c) < .25 ? 'middle' : c > 0 ? 'start' : 'end';
      const tx = x2 + (anchor === 'middle' ? 0 : c > 0 ? 6 : -6);
      const ty = anchor === 'middle' && sn < 0 ? y2 - 6 - (g.rows.length - 1) * 12 : anchor === 'middle' ? y2 + 12 : y2 + 3 - (g.rows.length - 1) * 6;
      arrows += `<line class="pie-arrow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#pieHead)"/>
        <text class="rl" x="${tx}" y="${ty}" text-anchor="${anchor}">${g.rows.map((r, i) => `<tspan x="${tx}"${i ? ' dy="12"' : ''}>${r.short}</tspan>`).join('')}</text>`;
      ang = end;
    });
    const label = groups.map(g => `${g.rows.map(r => r.name).join(' y ')} ${p.label(g.rows[0])}`).join(', ');
    return `<svg viewBox="0 0 376 230" role="img" aria-label="${p.title}: ${label}">
      <defs><marker id="pieHead" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" class="pie-head"/></marker></defs>
      ${slices}${arrows}</svg>
      <ul class="pie-legend">${groups.map(g => `<li style="--tone:${g.color}"><span class="sw"></span>${p.label(g.rows[0])}</li>`).join('')}</ul>`;
  }

  /* ---------- tabla ---------- */
  // meas: valores medibles. Se pintan según su posición entre las carreras comparadas
  // (verde = mejor, rojo = más exigente, ámbar = intermedio; la demanda nunca va en rojo)
  const ROWS = [
    ['Tipo de carrera', c => c.tipo],
    ['Modalidad', c => `<span class="chip mod">${MOD[c.t]}</span>`, c => `t-${c.t}`],
    ['Duración', c => `${c.years} años`],
    ['Costo', costChip],
    ['Ubicación', c => c.ubic],
    ['Requisitos de ingreso', c => c.req],
    ['Demanda laboral', c => DEM[c.dem], null, {key: c => c.dem, soft: true}],
    ['Salario inicial*', c => `$${c.sal[0]}–${c.sal[1]}k`, null, {key: c => c.sal[1]}],
    ['Plan de estudios', c => c.plan],
    ['Posgrado', c => c.pos],
    ['Trabajo remoto', c => c.remoto],
  ];
  const tier = (meas, c, rows) => {
    const ks = rows.map(meas.key), hi = Math.max(...ks), lo = Math.min(...ks), k = meas.key(c);
    return hi === lo ? 'mid' : k === hi ? 'good' : k === lo && !meas.soft ? 'low' : 'mid';
  };
  const cell = ([, fn, , meas], c, rows) => meas ? `<span class="val ${tier(meas, c, rows)}">${fn(c)}</span>` : fn(c);

  let pinned = null;   // nombre de la carrera fijada en la grilla
  function drawTable(rows) {
    const table = $('cmpTable');
    if (pinned && !rows.some(r => r.name === pinned)) pinned = null;
    table.style.minWidth = `${200 + rows.length * 190}px`;
    table.classList.toggle('pinned', !!pinned);
    table.innerHTML = `<thead><tr><th scope="col">Aspecto</th>${rows.map((r, j) =>
      `<th scope="col" data-col="${j + 1}" style="--tone:${r.color}"${r.name === pinned ? ' class="pin"' : ''}><button type="button" aria-pressed="${r.name === pinned}" title="Fijar esta carrera" data-name="${r.name}"><span class="sw"></span>${r.name}<span>${r.uni}</span></button></th>`).join('')}</tr></thead>
      <tbody>${ROWS.map(row => `<tr><th scope="row">${row[0]}</th>${rows.map((r, j) =>
        `<td data-col="${j + 1}"${r.name === pinned ? ' style="--tone:' + r.color + '"' : ''} class="${[row[2] ? row[2](r) : '', r.name === pinned ? 'pin' : ''].join(' ').trim()}">${cell(row, r, rows)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  }

  // cruz de resaltado: al pasar por una celda se marcan su fila y su columna
  const tbl = $('cmpTable');
  const clearHl = () => tbl.querySelectorAll('.hl, .hl-x').forEach(e => e.classList.remove('hl', 'hl-x'));
  const hl = target => {
    const cellEl = target.closest('td, th[data-col]');
    clearHl();
    if (!cellEl || !cellEl.dataset.col) return;
    const col = cellEl.dataset.col;
    tbl.querySelectorAll(`[data-col="${col}"]`).forEach(e => e.classList.add('hl-x'));
    const tr = cellEl.closest('tr');
    if (tr.parentNode.tagName === 'TBODY') tr.classList.add('hl');
    tr.querySelectorAll('td').forEach(e => e.classList.add('hl'));
  };
  tbl.addEventListener('mouseover', e => hl(e.target));
  tbl.addEventListener('mouseleave', clearHl);
  tbl.addEventListener('focusin', e => hl(e.target));
  tbl.addEventListener('focusout', clearHl);
  tbl.addEventListener('click', e => {
    const b = e.target.closest('button[data-name]');
    if (!b) return;
    pinned = pinned === b.dataset.name ? null : b.dataset.name;
    drawCmp();
    const again = [...tbl.querySelectorAll('button[data-name]')].find(x => x.dataset.name === b.dataset.name);
    if (again) again.focus();
  });

  /* ---------- tabla en mobile: selector de carrera + tabla de una sola carrera ---------- */
  const mob = $('cmpMobile');
  let mSel = null, mRows = [];
  function drawMobile(rows) {
    mRows = rows;
    mob.hidden = !rows.length;
    if (!rows.length) return;
    let cur = rows.find(r => r.name === mSel);
    if (!cur) { cur = rows[0]; mSel = cur.name; }
    mob.innerHTML = `<p class="note cmp-m-note">La comparación se hace en desktop: en mobile la tabla muestra una sola carrera por vez.</p>
      <div class="field"><label for="cmpCareer">Carrera</label>
      <select id="cmpCareer">${rows.map(r => `<option value="${r.name}"${r === cur ? ' selected' : ''}>${r.name}</option>`).join('')}</select></div>
      <div class="cmp-m-head" style="--tone:${cur.color}"><span class="sw"></span>${cur.name}<small>${cur.uni}</small></div>
      <table class="cmp-m-table"><tbody>${ROWS.map(row =>
        `<tr><th scope="row">${row[0]}</th><td${row[2] ? ` class="${row[2](cur)}"` : ''}>${cell(row, cur, rows)}</td></tr>`).join('')}</tbody></table>`;
  }
  mob.addEventListener('change', e => {
    if (e.target.id !== 'cmpCareer') return;
    mSel = e.target.value;
    drawMobile(mRows);
    $('cmpCareer').focus();
  });

  // el trazo de la columna fija solo se ve mientras hay scroll horizontal
  const tblWrap = $('cmpTableWrap');
  tblWrap.addEventListener('scroll', () => tblWrap.classList.toggle('scrolled', tblWrap.scrollLeft > 0), { passive: true });

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
      return `<figure class="chart"><figcaption><b>${p.title}</b><span>${p.sub}</span></figcaption>${p.pie ? pieChart(p, rows) : `${panelSVG(p, rows)}<p class="win">${p.win}: ${winners}</p>`}</figure>`;
    }).join('') : '<p class="note">Seleccioná al menos una carrera para ver los gráficos.</p>';
    $('cmpTableWrap').hidden = $('cmpTools').hidden = !rows.length;
    if (rows.length) drawTable(rows);
    drawMobile(rows);
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
