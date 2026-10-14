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

- `index.html` - pagina unica: home, chi siamo, servizi IT, robotica, metodo, partner, progetti, contatti
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
