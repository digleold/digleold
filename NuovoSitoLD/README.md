# NuovoSitoLD

Sito di **LD Technologies SRL**: servizi informatici, sviluppo software, gestione documentale,
cloud, sicurezza e robotica collaborativa. Pagina unica con fondale 3D.

## Avvio in locale

```bash
cd NuovoSitoLD
python3 -m http.server 8000
```

Poi apri http://localhost:8000.

## Struttura

- `index.html` - pagina unica: home, chi siamo, servizi IT, robotica, metodo, progetti (portfolio filtrabile con schede di dettaglio), partner (schede prodotto), contatti
- `css/style.css` - stili, variabili colore, effetti 3D CSS (card inclinabili, anello partner, passi in prospettiva)
- `js/scene.js` - fondale 3D con Three.js r128 (braccio robotico + rete di nodi), guidato da scroll e mouse
- `js/main.js` - menu mobile, animazioni allo scroll, contatori, inclinazione 3D delle card, modulo
- `img/` - loghi e foto dei partner

Three.js viene caricato da cdnjs (versione fissa r128). Se WebGL non e disponibile il sito
resta pienamente utilizzabile con uno sfondo a gradiente. Con "riduci movimento" attivo nel
sistema le animazioni si fermano.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pages.yml` pubblica la cartella `NuovoSitoLD` ad ogni push
sul branch predefinito. Attivazione una tantum: Settings > Pages > Source: **GitHub Actions**.
Il sito sara su `https://digleold.github.io/digleold/` (percorsi relativi).

## Dati aziendali

LD Technologies SRL - Via Enrico Fermi snc, 70024 Gravina in Puglia (BA) - P.IVA 08921740729.
Testi, loghi e contatti provengono da ldtechnologies.it e ldrobotics.it. Le sezioni di esempio
dei template WordPress originali (team fittizio, articoli demo, premi) non sono state riportate.
Le foto in `img/partner-*` provengono da ldrobotics.it e sono dei rispettivi produttori
(Universal Robots, Dobot, MiR, Microsoft, Robotiq, JAKA, ABB).

Il modulo contatti apre il programma di posta (`mailto:`); per un invio diretto va collegato
a un servizio di form.

## SEO e prestazioni

- Titolo e description ottimizzati, canonical, Open Graph e Twitter Card (`img/og-image.jpg`, 1200x630).
- Dati strutturati Schema.org (JSON-LD): organizzazione/attivita locale con indirizzo, P.IVA, contatti e catalogo servizi; sito web; pagina; FAQ.
- Sezione FAQ visibile (8 domande) allineata ai dati strutturati.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, icone (favicon, apple-touch, 192/512), pagina `404.html`.
- Dominio di destinazione usato in canonical, sitemap e Open Graph: **https://www.ldtechnologies.it/**. Se cambia, aggiornare `index.html`, `robots.txt` e `sitemap.xml`.
- Immagini in WebP con `width`/`height`; Three.js caricato dopo il caricamento della pagina e solo su dispositivi adatti; font non bloccanti con ripiego calibrato.
- Misure Lighthouse (mobile, rete lenta simulata): Prestazioni 97, Accessibilita 100, Best Practices 96, SEO 100, CLS 0,004.

## Responsive

Menu a tendina fino a 1000px, griglie a 4/2/1 colonne, telefoni in orizzontale, zone sicure (notch), schermi 2K/4K (la base dei font cresce), aree di tocco di almeno 44px, effetti 3D delle card solo con mouse.

## Effetti dinamici e 3D

- **Fondale 3D** (`js/scene.js`, Three.js r128): braccio robotico che segue il mouse, rete di nodi, cubi orbitanti, camera guidata dallo scroll.
- **Pick-and-place**: nella sezione robotica il braccio prende le casse da un nastro e le impila su un pallet. Cinematica inversa a due bracci con polso sempre verticale, ciclo di 9 secondi, pallet che si svuota dopo 8 casse.
- **Raggi di luce** (sezione "Un solo partner"): porting in JavaScript puro dell'*Animated Beam* di Magic UI. Percorsi curvi misurati nel DOM e ricalcolati al ridimensionamento, raggio che scorre con ease out expo.
- **Testo a velocita' variabile** (fascia tra Servizi e Robotica): porting dello *Scroll Based Velocity* di Magic UI. Due righe in direzioni opposte che accelerano e si invertono con la velocita' di scroll.
- **Altri effetti**: bordo luminoso rotante (*Border Beam*), riflesso periodico sui pulsanti, testo con gradiente scorrevole, luce che segue il cursore, pulsanti magnetici, card inclinabili in 3D, comparsa in prospettiva.
- Tutti gli effetti rispettano "riduci movimento"; cursore e pulsanti magnetici solo con mouse; la rotazione di comparsa e' disattivata su telefono.

I componenti Magic UI sono distribuiti con licenza MIT; il codice qui e' una riscrittura senza React ne framer-motion.
