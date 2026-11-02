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
- Lighthouse (mobile, rete lenta simulata, con compressione), italiano e inglese: Prestazioni 99, Accessibilita 100, Best Practices 96, SEO 100, CLS 0, TBT 0 ms.

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
