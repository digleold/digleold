# NuovoSitoLD

Sito del gruppo LD che riunisce **LD Technologies** e **LD Robotics**.
Sito statico (HTML, CSS, JavaScript), tema dark tech, responsive.

## Avvio in locale

```bash
cd NuovoSitoLD
python3 -m http.server 8000
```

Poi apri http://localhost:8000.

## Struttura

- `index.html` – home del gruppo con le due divisioni
- `ld-technologies.html` – sezione LD Technologies (tema ciano)
- `ld-robotics.html` – sezione LD Robotics (tema viola)
- `contatti.html` – contatti e modulo (non ancora collegato a un servizio email)
- `css/style.css` – stili e variabili colore
- `js/main.js` – menu mobile e animazioni allo scroll
- `img/` – immagini e loghi

## Contenuti

I testi, i loghi e i contatti provengono da ldtechnologies.it e ldrobotics.it
(scaricati a ottobre 2026). Le sezioni di esempio dei template WordPress originali
(team fittizio, articoli demo, premi, case study "Industrium") non sono state riportate.

Il modulo in `contatti.html` apre il programma di posta con il messaggio compilato
(`mailto:`); per un invio diretto va collegato a un servizio di form.
