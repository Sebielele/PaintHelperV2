"use strict";

// User management for PaintHelperV2.
// In the container use the wrapper:  wph-user <command> ...

const path = require("node:path");
const readline = require("node:readline");
const { openDatabase, UserError } = require("./db");
const { loadConfig } = require("./server");

const HELP = `PaintHelperV2 – Benutzerverwaltung

  wph-user list                       Benutzer anzeigen
  wph-user add <name> [passwort]      Benutzer anlegen
  wph-user passwd <name> [passwort]   Passwort zurücksetzen (meldet alle Geräte ab)
  wph-user delete <name>              Benutzer und alle seine Daten löschen
  wph-user backup [datei]             Datenbank-Backup erstellen

Ohne Passwort-Argument wird das Passwort verdeckt abgefragt.`;

async function main(argv) {
  const [command, name, passwordArg] = argv;
  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(HELP);
    return 0;
  }
  const config = loadConfig();
  const store = openDatabase(config.dataDir);
  try {
    switch (command) {
      case "list": {
        const users = store.listUsers();
        if (!users.length) {
          console.log("Keine Benutzer vorhanden.");
        }
        users.forEach(user => {
          console.log(`${user.username.padEnd(24)} angelegt ${user.created_at}  letzter Login ${user.last_login_at || "–"}  Einträge ${user.keys}`);
        });
        return 0;
      }
      case "add": {
        requireName(name);
        const password = passwordArg || await askPassword(`Passwort für ${name}: `, true);
        console.log(`Benutzer "${store.createUser(name, password)}" angelegt.`);
        return 0;
      }
      case "passwd": {
        requireName(name);
        const password = passwordArg || await askPassword(`Neues Passwort für ${name}: `, true);
        store.setPassword(name, password);
        console.log(`Passwort für "${name}" geändert; alle Sitzungen wurden beendet.`);
        return 0;
      }
      case "delete": {
        requireName(name);
        store.deleteUser(name);
        console.log(`Benutzer "${name}" und seine Daten wurden gelöscht.`);
        return 0;
      }
      case "backup": {
        const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const target = path.resolve(name || path.join(config.dataDir, "backups", `manual-${stamp}.db`));
        console.log(`Backup geschrieben: ${store.backup(target)}`);
        return 0;
      }
      default:
        console.error(`Unbekannter Befehl "${command}".\n\n${HELP}`);
        return 2;
    }
  } catch (error) {
    if (error instanceof UserError) {
      console.error(`Fehler: ${error.message}`);
      return 1;
    }
    throw error;
  } finally {
    store.close();
  }
}

function requireName(name) {
  if (!name) {
    throw new UserError("Benutzername fehlt.");
  }
}

async function askPassword(prompt, confirm) {
  const first = await readHidden(prompt);
  if (confirm) {
    const second = await readHidden("Wiederholen: ");
    if (first !== second) {
      throw new UserError("Die Passwörter stimmen nicht überein.");
    }
  }
  return first;
}

function readHidden(prompt) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = rl._writeToOutput.bind(rl);
    rl._writeToOutput = text => write(text.startsWith(prompt) ? prompt : "");
    rl.question(prompt, answer => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

main(process.argv.slice(2)).then(code => { process.exitCode = code; }, error => {
  console.error(error);
  process.exitCode = 1;
});
