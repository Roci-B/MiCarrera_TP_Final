# MiCarrera

Buscador unificado de carreras universitarias (TP Final, Visualización e Interfaces 2026). Prototipo de alta fidelidad en HTML, CSS y JS sin dependencias: abrí `index.html` en el navegador.

## Estructura

```
index.html        Home, resultados y detalle
favoritos.html    Favoritos y comparación (gráficos + tabla)
login.html        Ingresar / Crear cuenta (formulario, errores)
assets/css        micarrera.css (modo claro/oscuro, responsive)
assets/js         micarrera.js (UI) · auth.js (sesión y favoritos) · login.js (validación)
docs/             Consigna del TP e investigacion/ (documentos a entregar)
docs/investigacion/     Documentos a entregar (DOCX) y capturas/ (.jpg, wireframes, flujo)
archive/          Versiones anteriores (wireframes de baja fidelidad y diseño v1)
```

## Pantallas

| # | Pantalla | Archivo |
|---|----------|---------|
| 1 | Home | `index.html#inicio` |
| 2 | Resultados | `index.html#resultados` |
| 3 | Detalle de carrera | `index.html#detalle` |
| 4 | Favoritos | `favoritos.html#favoritos` |
| 5 | Comparación (gráfico) | `favoritos.html#comparar` |
| 6 | Ingresar / Crear cuenta (formulario y errores) | `login.html` |
| 7 | Error 404 (página no encontrada) | `404.html` |
| — | Alerta "iniciá sesión" | al tocar ♥ sin sesión |

## Sesión simulada

No hay servidor: usuarios, sesión y favoritos se guardan en `localStorage`.
Cuenta de prueba: `demo@micarrera.ar` / `micarrera1` (viene con 4 favoritas de ejemplo).

## Sistema visual

Violeta `#4A2BA0` como marca, amarillo `#FFD84D` para "gratuita", un color por modalidad (presencial, semipresencial, virtual), tipografía Archivo, modo claro/oscuro y breakpoints en 1060, 900 y 720 px.
