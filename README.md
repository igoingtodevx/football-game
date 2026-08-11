# FUßBAAAAAALL

## Zweck

Kleines statisches Browser-Spiel als interaktive **7:1-Challenge**: Der Spieler steuert einen Fußballer gegen einen einfachen Bot und soll bei einem 7:1-Sieg eine animierte Mystery-Gift-Sequenz erreichen.

## Aktueller Status

**Spielbarer Frontend-Prototyp/Demo.** Der aktuelle Baum enthält eine HTML-Seite, ein CSS-Stylesheet, ein JavaScript-Spiel und Vercel-Konfiguration. Es gibt keinen Server, kein Backend und keine persistente Spielerdatenhaltung.

### Implementiert

- Canvas-basiertes 1-gegen-1-Spiel mit Ball-/Tor-Kollisionen, Spielstand und Bot-Gegner.
- Tastatursteuerung: `A`/`D` oder Pfeile zum Bewegen, `W`/`Space` oder `↑` zum Springen.
- Startbildschirm, Restart/Menu, Tor-Overlay, Konfetti und mehrstufige Geschenk-Animation.
- Sichtbarer Dev-Score-Button zum Setzen auf `6:1` für Demo-/Testzwecke.
- Statisches Hosting über die enthaltene Vercel-Konfiguration.

### Geplant bzw. nicht enthalten

- Kein echtes Online-Multiplayer, kein Matchmaking und keine serverseitige Ergebnisprüfung.
- Keine Accounts, Bestenliste, Speicherung oder Analytics im Repository.
- Keine automatisierten Tests und kein Build-/Bundling-Schritt.
- Touch-Steuerung ist im aktuellen Quelltext nicht belegt; die dokumentierten Controls sind tastaturorientiert.

## Stack

- Plain HTML, CSS und JavaScript
- HTML5 Canvas und browserseitige Spiel-/Animationslogik
- Externe Google-Fonts-Einbindung in `index.html`
- Vercel (`vercel.json`) als statisches Deployment-Ziel

## Setup & Nutzung

```bash
python3 -m http.server 8000
# anschließend http://localhost:8000/ öffnen
```

Alternativ die fünf statischen Dateien auf einen beliebigen Webserver legen. Für eine Vercel-Veröffentlichung das Repository importieren; es ist kein `npm install` erforderlich.

## Öffentliche Demo

**Anonym verifiziert:** [football-game-weld.vercel.app](https://football-game-weld.vercel.app/) — HTTP 200, Seitentitel `FUßBAAAAAALL - The Ultimate 7:1 Challenge`.

## Limitierungen & Lizenzhinweis

- Spielstand, Dev-Button und Geschenkfreischaltung laufen vollständig im Browser und sind nicht manipulationssicher.
- Texte und Geschenk-Inhalt sind fest im Frontend hinterlegt.
- Keine Lizenzdatei vorhanden; Rechte an eingebundenen Fonts, Grafiken und Inhalten vor Weitergabe prüfen.
