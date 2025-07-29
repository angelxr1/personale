# Riepilogo Comandi Git Utili

Questo file riassume i comandi Git più comuni per gestire questo progetto.

---

### 1. Setup Iniziale del Progetto

Questi comandi si usano in genere una sola volta all'inizio.

```bash
# Inizializza una nuova repository Git nella cartella corrente
git init

# Crea un file .gitignore per escludere file e cartelle (es. node_modules)
echo "node_modules/" > .gitignore

# Collega la tua repository locale a quella remota su GitHub
# (Sostituisci l'URL con quello della tua repository)
git remote add origin https://github.com/tuo-utente/tuo-progetto.git

# (Solo per macOS) Salva le credenziali nel Portachiavi per non doverle inserire ogni volta
git config --global credential.helper osxkeychain
```

---

### 2. Flusso di Lavoro Quotidiano (Salvare e Caricare le Modifiche)

Questa è la sequenza che userai più spesso per salvare il tuo lavoro e pubblicarlo.

```bash
# 1. Controlla lo stato dei file (quali file sono stati modificati?)
git status

# 2. Aggiungi i file modificati alla "staging area", pronti per essere salvati.
# Per aggiungere tutti i file modificati:
git add .
# Oppure per aggiungere solo file specifici:
git add public/index.html public/css/style.css

# 3. Salva le modifiche in un "commit" (una "fotografia" del progetto)
# Il messaggio deve essere breve e descrittivo.
git commit -m "Breve descrizione delle modifiche fatte"

# 4. Carica le modifiche su GitHub (e quindi su Render)
git push origin main
```

---

### 3. Risoluzione Problemi

Comandi che abbiamo usato per risolvere situazioni specifiche.

```bash
# Rimuove forzatamente una cartella o un submodule da Git
# (Utile per rimuovere repository Git annidate come "personale1")
git rm -r nome_cartella
```

---

### 4. Creazione di un Eseguibile per Windows (.exe)

Questi comandi servono per impacchettare il progetto in un unico file eseguibile che può essere distribuito.

```bash
# 1. (Da fare solo una volta) Installa il pacchetto 'pkg'
# Questo comando aggiunge 'pkg' alle dipendenze di sviluppo nel package.json
npm install --save-dev pkg

# 2. Avvia il processo di creazione dell'eseguibile
# Questo comando legge la configurazione "pkg" nel package.json e genera il file.
npm run build
```
L'eseguibile verrà creato nella cartella `dist`.

---

### Nota sul Personal Access Token (PAT)

Ricorda che quando il terminale ti chiede la **password** per GitHub, devi inserire un **Personal Access Token (PAT)** e non la password del tuo account.

- Puoi generare un PAT da: **GitHub > Settings > Developer settings > Personal access tokens (classic)**.
- Assicurati di dare al token lo scope (permesso) **`repo`**.