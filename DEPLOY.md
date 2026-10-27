# PaintHelperV2 auf der Synology installieren

PaintHelperV2 ist der Warhammer Paint Helper mit Benutzerkonten. Paletten, Profile,
die eigene Farbsammlung und die Einkaufsliste liegen pro Person in einer SQLite-Datenbank
auf der NAS, nicht mehr im Browser. Damit ist auf jedem Gerät derselbe Stand da.

```
Browser ──HTTP──▶ Container "painthelper" (Node.js, Port 8080)
                    ├── liefert die App aus
                    ├── /api/…  Login, Sitzungen, Daten pro Benutzer
                    └── /data   paint-helper.db + tägliche Backups
                              ↳ /volume1/docker/painthelper auf der NAS
```

Der Server hat keine npm-Abhängigkeiten. Er nutzt nur Node.js 24 mit dem eingebauten
`node:sqlite`.

## 1. Image bereitstellen (einmalig)

Bei jedem Push auf `main` testet GitHub Actions den Code
(`.github/workflows/docker.yml`) und veröffentlicht danach das Image
`ghcr.io/sebielele/painthelperv2:latest`.

1. Nach dem ersten Push in GitHub unter **Actions** prüfen, ob der Lauf grün ist.
2. Unter deinem Profil → **Packages** → `painthelperv2` → **Package settings** die
   Sichtbarkeit auf **Public** stellen. Dann kann die NAS das Image ohne Login holen.
   Soll es privat bleiben, in Portainer unter *Registries* `ghcr.io` mit einem
   GitHub-Token (`read:packages`) hinterlegen.

## 2. Stack in Portainer anlegen

1. Den alten Stack `warhammer-paint-helper` (`wph-sync`/`wph-web`) löschen, weil er
   ebenfalls Port 8484 belegt.
2. In der File Station den Ordner `docker/painthelper` anlegen.
3. Portainer → **Stacks** → **Add stack** → Name `painthelper` → **Web editor**
   → Inhalt von [`docker-compose.yml`](docker-compose.yml) einfügen → **Deploy the stack**.

## 3. Benutzer anlegen

Portainer → **Containers** → `painthelper` → **Console** → Command `/bin/sh` → Connect:

```sh
wph-user add sebastian          # Passwort wird verdeckt abgefragt (mind. 8 Zeichen)
wph-user add anna
wph-user list
wph-user passwd anna            # Passwort zurücksetzen, meldet alle Geräte ab
wph-user delete anna            # löscht Benutzer und alle seine Daten
wph-user backup                 # sofortiges Backup nach /data/backups
```

Danach <http://10.2.1.89:8484> öffnen und anmelden. Jede Person kann ihr Passwort in der
App über **Passwort ändern** selbst ändern.

Alternativ legt der Container beim allerersten Start einen Benutzer an, wenn
`INITIAL_USER` und `INITIAL_PASSWORD` im Stack gesetzt sind. Diese beiden Zeilen danach
wieder entfernen.

## 4. Updates

Nach einem Push auf `main` und einem grünen Actions-Lauf: Portainer → Stack
`painthelper` → **Editor** → **Update the stack**, dabei **Re-pull image** aktivieren.
Die Daten in `/volume1/docker/painthelper` bleiben erhalten.

Ohne GitHub-Registry geht es auch mit [`docker-compose.build.yml`](docker-compose.build.yml):
Portainer baut das Image dann direkt aus dem Repo.

## Daten und Backups

| Pfad auf der NAS | Inhalt |
|---|---|
| `/volume1/docker/painthelper/paint-helper.db` | Datenbank (dazu `-wal`/`-shm`) |
| `/volume1/docker/painthelper/backups/` | tägliche Kopien, die letzten 14 bleiben (`BACKUP_KEEP`) |

Für eine externe Sicherung den Ordner `docker/painthelper` in Hyper Backup aufnehmen.
Die Dateien in `backups/` sind in sich konsistent. Wiederherstellen: Container stoppen,
die gewünschte Backup-Datei als `paint-helper.db` zurückkopieren, dabei `-wal`/`-shm`
löschen, dann den Container wieder starten.

## Bestehende Browser-Daten übernehmen

Wurde die App vorher ohne Login unter derselben Adresse genutzt, fragt sie nach der
ersten Anmeldung (bei noch leerem Konto), ob die im Browser gespeicherten Daten ins
Konto übernommen oder verworfen werden sollen. In beiden Fällen werden sie danach aus
dem Browser entfernt, damit sie keinem anderen Konto angeboten werden.

## Optional: HTTPS über den DSM-Reverse-Proxy

Systemsteuerung → Anmeldeportal → Erweitert → **Reverse Proxy** → Erstellen:

- Quelle: `HTTPS`, `paint.sebisdms.synology.me`, Port 443
- Ziel: `HTTP`, `localhost`, Port `8484`
- Das Sitzungs-Cookie bekommt automatisch das `Secure`-Flag, wenn der Proxy
  `X-Forwarded-Proto: https` mitschickt. DSM tut das normalerweise selbst. Falls nicht,
  unter *Benutzerdefinierte Kopfzeile* `X-Forwarded-Proto` = `$scheme` ergänzen oder im
  Stack `COOKIE_SECURE: "true"` setzen (dann nur noch per HTTPS nutzbar).

Ist die App von aussen erreichbar, schützt das Login die Daten. Trotzdem empfehle ich
ein Zugriffsprofil nur für LAN und VPN. Nach 10 Fehlversuchen pro Benutzer und IP
(bzw. 30 pro Benutzer insgesamt) ist der Login für 15 Minuten gesperrt.

## Konfiguration

| Variable | Standard | Bedeutung |
|---|---|---|
| `PORT` | `8080` | Port im Container |
| `DATA_DIR` | `/data` | Ort der Datenbank |
| `SESSION_DAYS` | `90` | Wie lange ein Gerät angemeldet bleibt |
| `BACKUP_KEEP` | `14` | Anzahl täglicher Backups (`0` = aus) |
| `COOKIE_SECURE` | `auto` | `auto`, `true` oder `false` |
| `TRUST_PROXY` | `false` | `true` nur setzen, wenn die App ausschliesslich über den Reverse Proxy erreichbar ist: dann zählt für die Login-Sperre die echte Client-IP aus `X-Forwarded-For` |
| `INITIAL_USER` / `INITIAL_PASSWORD` | – | Ersten Benutzer bei leerer Datenbank anlegen |

## Sicherheit

- Passwörter werden mit scrypt gehasht. Sitzungs-Tokens liegen nur als SHA-256-Hash in
  der Datenbank. Das Cookie ist `HttpOnly` und `SameSite=Strict`.
- Schreibende API-Aufrufe brauchen JSON und den Header `X-WPH-Request` (Schutz vor CSRF).
- Content-Security-Policy, `nosniff`, `X-Frame-Options`. Ausgeliefert werden nur die
  App-Dateien, Quellcode, `.git` und die Datenbank sind nicht erreichbar.
- Der Container läuft read-only mit `no-new-privileges`, der Server selbst als
  Benutzer `node`. Der Server startet nicht, wenn `DATA_DIR` in einem ausgelieferten
  Ordner liegt.
- Ist der Server beim Laden nicht erreichbar, zeigt die App „Erneut versuchen“ statt
  mit leeren Einstellungen zu starten. Beim Abmelden wartet sie, bis alles gespeichert
  ist.

## Lokal entwickeln

```sh
npm run user -- add test        # Benutzer in ./data-local anlegen
npm start                       # http://localhost:8080
npm test                        # Unit- und Server-Tests
npm run test:browser            # Browser-Test ohne Server (statischer Modus)
npm run test:server-browser     # Browser-Test mit Login und Datenbank
```

Die App läuft weiterhin auch als reine statische Seite, etwa per `file://` oder auf
GitHub Pages. Dann speichert sie wie bisher nur im Browser.
