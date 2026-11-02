# NuovoSitoLD

Sito di **LD Technologies SRL**: servizi informatici, sviluppo software, gestione documentale, cloud, sicurezza e
robotica collaborativa. Pagina unica, stile editoriale minimale (bianco, nero e grigi, titoli enormi e compatti).

## Avvio in locale

```bash
cd NuovoSitoLD
python3 -m http.server 8000
```

Poi apri http://localhost:8000.

## Struttura

- `index.html` - pagina unica: apertura, settori, cella robotica 3D, cosa facciamo, servizi, lavori selezionati,
  archivio progetti filtrabile, azienda, storie dei clienti, partner, FAQ, contatti, footer.
- `css/style.css` - stile completo (variabili in `:root`).
- `js/main.js` - scorrimento morbido, testo che si riempie con lo scroll, parallasse, contatori, filtri, finestre di dettaglio, menu, modulo.
- `js/robot.js` - cella robotica 3D (Three.js r128) con pick-and-place e cinematica inversa; si carica solo quando ci si avvicina.
- `js/vendor/lenis.min.js` - Lenis 1.3.23 (licenza MIT), scorrimento morbido.
- `img/` - loghi, schermate dei progetti, foto dei partner (WebP).
- `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, icone.

## Stile

Ispirato allo stile editoriale di studi di design contemporanei: fondo bianco con una sezione nera, carattere Inter
(titoli con spaziatura molto stretta), etichette maiuscole piccole, pulsanti a pillola, elenchi con linee sottili,
parole enormi, testata che si inverte sui fondi scuri, wordmark gigante nel footer. Un solo accento di colore (verde menta)
usato con parsimonia. I contenuti e il codice sono originali; nessun testo o immagine del sito di riferimento e' stato copiato.

## Accessibilita e movimento

Rispetta "riduci movimento" del sistema; il pulsante "Riduci animazioni" nel footer ferma scorrimento morbido, parallasse e
animazioni e ricorda la scelta. Contrasti verificati (minimo 4,95:1), aree di tocco di almeno 44px, navigazione da tastiera,
`<details>` nativi per servizi e FAQ.

## SEO e prestazioni

- Title/description, canonical, Open Graph e Twitter Card (`img/og-image.jpg`, 1200x630), JSON-LD (attivita locale, sito, pagina, FAQ).
- Dominio di destinazione in canonical, sitemap e Open Graph: **https://www.ldtechnologies.it/**. Se cambia, aggiornare `index.html`, `robots.txt` e `sitemap.xml`.
- Immagini WebP con `width`/`height`; Three.js non nell'HTML (si scarica solo vicino al riquadro 3D); font non bloccanti con ripiego calibrato.
- Lighthouse (mobile, rete lenta simulata, con compressione): Prestazioni 99, Accessibilita 100, Best Practices 96, SEO 100, CLS 0,001.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pages.yml` pubblica la cartella `NuovoSitoLD` ad ogni push sul branch predefinito.
Attivazione una tantum: Settings > Pages > Source: **GitHub Actions**. Sito su `https://digleold.github.io/digleold/` (percorsi relativi).

## Dati aziendali e contenuti

LD Technologies SRL - Via Enrico Fermi snc, 70024 Gravina in Puglia (BA) - P.IVA 08921740729.
Testi, loghi e contatti provengono da ldtechnologies.it e ldrobotics.it; le sezioni di esempio dei template WordPress originali
non sono state riportate. Le foto `img/partner-*` provengono da ldrobotics.it e sono dei rispettivi produttori
(Universal Robots, Dobot, MiR, Microsoft, Robotiq, JAKA, ABB).
Il modulo contatti apre il programma di posta (`mailto:`); per un invio diretto va collegato a un servizio di form.
