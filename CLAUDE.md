# Ir al Super

App de Lucas para cargar los productos mientras hace la compra (precio, cantidad, foto), ver el total en vivo, guardar el historial de precios y los gastos por mes. PWA instalable que funciona sin internet.

## Cómo está armada
- HTML, CSS y JavaScript puros, sin frameworks ni build: `index.html`, `styles.css` y `app.js`, que tiene toda la lógica.
- Los datos quedan en el dispositivo: IndexedDB para compras, productos y fotos, y `localStorage` para ajustes. No hay nube ni servidor.
- `sw.js` guarda la app para usarla sin conexión. `manifest.webmanifest` e `icons/` sirven para instalarla.
- Funciones que dependen del navegador: el escaneo de código de barras solo anda en Chrome Android, y la lectura de precios por OCR necesita internet la primera vez.

## Reglas para trabajar
- Trabajá siempre sobre la rama `main` de este repo (`ginzaacademia-prog/ir-al-super`). Esta app antes vivía en una rama de `Ginza-gestion`, que ya no se usa.
- Cada vez que cambies archivos de la app, subí la versión de `CACHE` en `sw.js` (`ir-al-super-v1` → `ir-al-super-v2`) para que los celulares tomen la versión nueva.
- No rompas los datos guardados: si cambiás la estructura de IndexedDB, subí la versión de la base y migrá lo existente. La copia exportada (Ajustes → Exportar) tiene que poder seguir importándose.
- Los montos son en pesos argentinos.
- Textos de la interfaz y mensajes de commit en español rioplatense.

## Publicación
GitHub Pages: Settings → Pages → Deploy from a branch → `main`, carpeta `/ (root)`. Queda en `https://ginzaacademia-prog.github.io/ir-al-super/`. Con el repo privado, Pages puede requerir un plan pago de GitHub.
