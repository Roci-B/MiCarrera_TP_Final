/* Sesión y favoritos simulados con localStorage (prototipo, sin servidor). */
(() => {
  const K = {users: 'micarrera-users', session: 'micarrera-sesion', favs: 'micarrera-favs'};
  const DEMO = {name: 'Camila', email: 'demo@micarrera.ar', pass: 'micarrera1'};
  const SEED = ['Ingeniería en Sistemas', 'Administración de Empresas', 'Tecnicatura en Programación', 'Licenciatura en Enfermería'];
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];

  const users = () => { const u = read(K.users, []); return u.some(x => x.email === DEMO.email) ? u : [DEMO, ...u]; };
  const user = () => read(K.session, null);
  const favs = () => read(K.favs, {})[user()?.email] || [];
  const setFavs = list => write(K.favs, {...read(K.favs, {}), [user().email]: list});

  function login(u) {
    write(K.session, {name: u.name, email: u.email});
    if (!(u.email in read(K.favs, {}))) setFavs(SEED);
  }
  function register(name, email, pass) {
    const all = users();
    if (all.some(x => x.email === email)) return false;
    write(K.users, [...all, {name, email, pass}]);
    login({name, email});
    return true;
  }
  const logout = () => { try { localStorage.removeItem(K.session); } catch (e) {} };

  /* ---------- aviso (alerta) ---------- */
  let toast, timer;
  function notify(msg, action) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast'; toast.setAttribute('role', 'alert');
      document.body.append(toast);
    }
    toast.innerHTML = '';
    const p = document.createElement('p'); p.textContent = msg; toast.append(p);
    if (action) { const a = document.createElement('a'); a.className = 'btn btn-light'; a.href = action.href; a.textContent = action.label; toast.append(a); }
    const x = document.createElement('button');
    x.type = 'button'; x.className = 'toast-x'; x.setAttribute('aria-label', 'Cerrar aviso');
    x.innerHTML = '<svg class="i"><use href="#i-x"/></svg>'; x.onclick = () => toast.classList.remove('show');
    toast.append(x);
    toast.classList.add('show');
    clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 7000);
  }

  /* ---------- sincronizar interfaz ---------- */
  function syncFavs() {
    const mine = favs(), on = !!user();
    $$('.fav-toggle[data-fav]').forEach(b => {
      const saved = on && mine.includes(b.dataset.fav);
      b.setAttribute('aria-pressed', saved);
      const l = b.querySelector('.fav-label'); if (l) l.textContent = saved ? 'En favoritos' : 'Guardar';
    });
    $$('[data-fav-count]').forEach(c => { c.textContent = on ? mine.length : 0; });
    const grid = document.getElementById('favGrid');
    if (grid) {
      $$('.fav[data-fav]', grid).forEach(c => { c.hidden = !mine.includes(c.dataset.fav); });
      const left = $$('.fav[data-fav]', grid).filter(c => !c.hidden).length;
      grid.hidden = !on || !left;
      document.getElementById('favGate').hidden = on;
      document.getElementById('favEmpty').hidden = !on || left > 0;
      document.querySelector('.bar-actions')?.toggleAttribute('hidden', !on || !left);
    }
  }
  function syncAuth() {
    const u = user();
    $$('[data-auth]').forEach(a => {
      if (u) {
        a.textContent = `Salir (${u.name})`; a.href = '#'; a.className = 'btn btn-ghost';
        a.onclick = e => { e.preventDefault(); logout(); syncAuth(); syncFavs(); notify('Cerraste sesión.'); };
      } else {
        a.textContent = 'Ingresar'; a.href = 'login.html'; a.className = 'btn btn-primary'; a.onclick = null;
      }
    });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('.fav-toggle[data-fav], .fav .btn-icon[aria-label^="Quitar"]');
    if (!b) return;
    const name = b.dataset.fav || b.closest('[data-fav]')?.dataset.fav;
    if (!user()) {
      notify('Iniciá sesión para guardar carreras en tus favoritos.', {href: `login.html?next=${location.pathname.split('/').pop() || 'index.html'}`, label: 'Ingresar'});
      return;
    }
    const mine = favs();
    setFavs(mine.includes(name) ? mine.filter(n => n !== name) : [...mine, name]);
    syncFavs();
  });

  window.MC = {user, login, register, users, notify, syncFavs, syncAuth};
  syncAuth(); syncFavs();
})();
