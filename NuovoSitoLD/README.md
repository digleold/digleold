# NuovoSitoLD

Sito di **LD Technologies SRL**: servizi informatici, sviluppo software, gestione documentale, cloud, sicurezza e
robotica collaborativa. Pagina unica in **italiano** (`/`) e **inglese** (`/en/`), stile editoriale minimale
(bianco, nero e grigi, titoli enormi e compatti) con un cenno di colori aziendali.

## Avvio in locale

```bash
cd NuovoSitoLD
python3 -m http.server 8000
```

Poi apri http://localhost:8000 (italiano) o http://localhost:8000/en/ (inglese).

## Struttura

- `index.html` - versione italiana. `en/index.html` - versione inglese (stessa struttura, percorsi con `../`).
- `css/style.css` - stile completo. I colori aziendali sono in `:root` (`--brand-mint`, `--brand-amber`, `--brand-navy`, `--dark*`):
  per tornare al solo bianco/nero basta uguagliarli a `--ink` e `--muted`.
- `js/main.js` - scorrimento morbido, testo che si riempie con lo scroll, parallasse, contatori, filtri, finestre di dettaglio, menu, modulo.
  Le poche stringhe dell'interfaccia sono per lingua in cima al file (`TXT`).
- `js/robot.js` - robot 3D nell'apertura (pick-and-place con cinematica inversa); parte dopo il caricamento della pagina.
- `js/vendor/` - Lenis 1.3.23 (MIT) e Three.js r128 (MIT), incorporati.
- `fonts/` - Inter (variabile) e Fragment Mono, licenza SIL OFL, incorporati.
- `img/` - loghi, schermate dei progetti, foto dei partner (WebP).
- `404.html` (bilingue), `robots.txt`, `sitemap.xml` (con hreflang), `site.webmanifest`, icone.

## Grafica robotica

- **Apertura:** robot 3D nel riquadro, con segni di taglio agli angoli e lettura in tempo reale dei giunti (J1-J4, gli stessi angoli che muovono il braccio) e conteggio delle casse impilate.
- **Nastro pick-and-place** (tra "Cosa facciamo" e "Servizi"): illustrazione SVG a tratto di un braccio che prende una cassa dal nastro e la posa sul pallet, ciclo di 12 s.
  Il movimento e' calcolato con cinematica inversa a due bracci (pinza sempre verticale, cassa sempre nella pinza); i fotogrammi chiave sono generati nel CSS.
  Si anima solo quando e' visibile; con "riduci movimento" resta un fotogramma fermo con la cassa nella pinza.
- **Disegno tecnico** nella sezione scura: braccio a 4 giunti che si traccia al passaggio, con archi di movimento, quote J1-J4 e oscillazione lenta.
- **Icone a tratto** per i 6 servizi di robotica (finitura, asservimento, controllo qualita', assemblaggio, pallettizzazione, saldatura).
- **Barra di avanzamento** con una cassa che scorre sul binario.
- Il 3D parte solo se il dispositivo supporta WebGL; altrimenti resta la foto e non si scarica Three.js.

## Lingue

Due URL separati, ciascuno con titolo, descrizione, Open Graph, dati strutturati (JSON-LD) e FAQ nella propria lingua; `hreflang` it/en/x-default,
canonical per lingua, sitemap con alternative. Selettore IT / EN in testata. Le testimonianze nella versione inglese sono traduzioni
(indicato in pagina). I nomi propri di aziende e progetti restano invariati.

## Nessuna richiesta a terzi

Font, Three.js e Lenis sono serviti dal sito stesso: la pagina non contatta server esterni (utile per la privacy: niente
chiamate a Google Fonts o a CDN). Il sito non usa cookie ne' analytics. L'informativa privacy resta da redigere a cura dell'azienda.

## Accessibilita e movimento

Rispetta "riduci movimento" del sistema; il pulsante "Riduci animazioni" nel footer ferma scorrimento morbido, parallasse e animazioni
e ricorda la scelta. Contrasti verificati, aree di tocco di almeno 44px, navigazione da tastiera, `<details>` nativi per servizi e FAQ.

## SEO e prestazioni

- Dominio di destinazione in canonical, sitemap e Open Graph: **https://www.ldtechnologies.it/**. Se cambia, aggiornare `index.html`, `en/index.html` (rigenerare), `robots.txt` e `sitemap.xml`.
- Immagini WebP con `width`/`height`; il robot 3D parte dopo il caricamento; font incorporati con ripiego calibrato (nessuno spostamento di layout).
- Lighthouse (mobile, rete lenta simulata, con compressione), italiano e inglese: Prestazioni 99, Accessibilita 100, Best Practices 96-100, SEO 100, CLS 0, TBT 0-60 ms; circa 215 KB trasferiti.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pages.yml` pubblica la cartella `NuovoSitoLD` ad ogni push sul branch predefinito.
Attivazione una tantum: Settings > Pages > Source: **GitHub Actions**. Sito su `https://digleold.github.io/digleold/` (italiano) e
`https://digleold.github.io/digleold/en/` (inglese); i percorsi sono relativi.

## Dati aziendali e contenuti

LD Technologies SRL - Via Enrico Fermi snc, 70024 Gravina in Puglia (BA) - P.IVA 08921740729.
Testi, loghi e contatti provengono da ldtechnologies.it e ldrobotics.it; le sezioni di esempio dei template WordPress originali
non sono state riportate. Le foto `img/partner-*` provengono da ldrobotics.it e sono dei rispettivi produttori
(Universal Robots, Dobot, MiR, Microsoft, Robotiq, JAKA, ABB).
Il modulo contatti apre il programma di posta (`mailto:`); per un invio diretto va collegato a un servizio di form.
