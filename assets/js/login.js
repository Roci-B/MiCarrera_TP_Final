const byId = id => document.getElementById(id);
const next = new URLSearchParams(location.search).get('next');
const dest = /^[\w-]+\.html$/.test(next || '') ? next : 'favoritos.html';
const alertBox = byId('formAlert');
const forms = {in: byId('formIn'), up: byId('formUp')};
const tabs = {in: byId('tab-in'), up: byId('tab-up')};

if (MC.user()) location.replace(dest);

function showTab(k) {
  for (const t of ['in', 'up']) {
    forms[t].hidden = t !== k;
    tabs[t].setAttribute('aria-selected', t === k);
    tabs[t].tabIndex = t === k ? 0 : -1;
  }
  byId('h-auth').textContent = k === 'in' ? 'Ingresar' : 'Crear cuenta';
  alertBox.hidden = true;
  clear(forms[k]);
}
tabs.in.onclick = () => showTab('in');
tabs.up.onclick = () => showTab('up');
document.querySelector('.tabs').addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const k = tabs.in.getAttribute('aria-selected') === 'true' ? 'up' : 'in';
  showTab(k); tabs[k].focus();
});
if (location.hash === '#registro') showTab('up');

function clear(f) {
  f.querySelectorAll('input').forEach(i => i.removeAttribute('aria-invalid'));
  f.querySelectorAll('.err').forEach(p => { p.hidden = true; p.textContent = ''; });
}
function fail(input, msg) {
  const err = byId(input.id + 'Err');
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', [err.id, input.id === 'upPass' ? 'upPassHint' : ''].join(' ').trim());
  err.textContent = msg; err.hidden = false;
}
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function validate(f, fields) {
  clear(f); alertBox.hidden = true;
  let first = null;
  for (const [input, check] of fields) {
    const msg = check(input.value.trim());
    if (msg) { fail(input, msg); first ??= input; }
  }
  if (first) {
    alertBox.textContent = 'Revisá los campos marcados para continuar.';
    alertBox.hidden = false; first.focus();
  }
  return !first;
}
const required = label => v => v ? '' : `Ingresá ${label}.`;
const mail = v => !v ? 'Ingresá tu correo electrónico.' : emailOk(v) ? '' : 'El correo no parece válido. Ejemplo: nombre@correo.com';

forms.in.addEventListener('submit', e => {
  e.preventDefault();
  const email = byId('inEmail'), pass = byId('inPass');
  if (!validate(forms.in, [[email, mail], [pass, required('tu contraseña')]])) return;
  const u = MC.users().find(x => x.email === email.value.trim().toLowerCase() && x.pass === pass.value);
  if (!u) {
    alertBox.textContent = 'El correo o la contraseña no son correctos. Probá de nuevo o creá una cuenta.';
    alertBox.hidden = false; pass.value = ''; pass.focus();
    return;
  }
  MC.login(u); location.href = dest;
});

forms.up.addEventListener('submit', e => {
  e.preventDefault();
  const name = byId('upName'), email = byId('upEmail'), pass = byId('upPass');
  const ok = validate(forms.up, [[name, required('tu nombre')], [email, mail],
    [pass, v => v.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres.']]);
  if (!ok) return;
  if (!MC.register(name.value.trim(), email.value.trim().toLowerCase(), pass.value)) {
    fail(email, 'Ya existe una cuenta con ese correo.');
    alertBox.textContent = 'Ese correo ya está registrado. Ingresá con tu contraseña.';
    alertBox.hidden = false; email.focus();
    return;
  }
  location.href = dest;
});
