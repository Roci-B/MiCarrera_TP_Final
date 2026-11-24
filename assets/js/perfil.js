const byId = id => document.getElementById(id);
const alertBox = byId('formAlert');
const form = byId('formProfile');
const name = byId('pfName'), email = byId('pfEmail'), pass = byId('pfPass');

if (!MC.user()) location.replace('login.html?next=perfil.html');
else { name.value = MC.user().name; email.value = MC.user().email; }

function clear() {
  form.querySelectorAll('input').forEach(i => i.removeAttribute('aria-invalid'));
  form.querySelectorAll('.err').forEach(p => { p.hidden = true; p.textContent = ''; });
}
function fail(input, msg) {
  const err = byId(input.id + 'Err');
  input.setAttribute('aria-invalid', 'true');
  err.textContent = msg; err.hidden = false;
}
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

form.addEventListener('submit', e => {
  e.preventDefault();
  clear(); alertBox.hidden = true;
  const checks = [
    [name, name.value.trim() ? '' : 'Ingresá tu nombre.'],
    [email, !email.value.trim() ? 'Ingresá tu correo electrónico.' : emailOk(email.value.trim()) ? '' : 'El correo no parece válido. Ejemplo: nombre@correo.com'],
    [pass, !pass.value || pass.value.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres.']
  ];
  let first = null;
  for (const [input, msg] of checks) if (msg) { fail(input, msg); first ??= input; }
  if (first) {
    alertBox.className = 'form-alert';
    alertBox.textContent = 'Revisá los campos marcados para continuar.';
    alertBox.hidden = false; first.focus();
    return;
  }
  pass.value = '';
  MC.notify('Cambios aceptados (prototipo: no se guardan).');
});
