# ChordMap Pro — iPad Edition

Aplicación web (PWA) de una sola página para crear mapas de canciones y cifrado armónico, pensada para ensayos y escenario en iPad.

## Estructura del proyecto

```
ChordsPro/
├── index.html          # Toda la app: HTML + CSS + JS (única página)
├── manifest.json        # Manifest de la PWA
├── sw.js                 # Service Worker (estrategia network-first)
└── assets/
    └── images/
        ├── cosmic_horror_bg.jpg
        └── satanic_ritual_bg.jpg
```

## Dependencias (vía CDN, no requieren instalación)

- [SortableJS](https://cdnjs.com/libraries/Sortable) — drag & drop
- [html2pdf.js](https://cdnjs.com/libraries/html2pdf.js) — exportación a PDF
- [Font Awesome](https://cdnjs.com/libraries/font-awesome) — iconos
- Google Fonts: Inter, JetBrains Mono

## Cómo correrlo localmente

Al ser un sitio estático, basta con servirlo con cualquier servidor HTTP simple:

```bash
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

(Abrir el `index.html` directamente con `file://` también funciona para la mayoría de las funciones, pero el Service Worker y el manifest requieren `http(s)://`.)

## Estado

- [ ] Pendiente: primera ronda de correcciones/revisión de código.

## Licencia

Por definir.
