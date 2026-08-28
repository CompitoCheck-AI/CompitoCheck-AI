# CompitoCheck AI — V3

Webapp statica bilingue Italiano/English pensata come supporto alla correzione scolastica.

## Funzioni
- Archivio studenti in localStorage.
- 2–10 compiti campione per profilo stilistico.
- Rilevamento automatico Italiano/English.
- Indicatore euristico di caratteristiche compatibili con testi fortemente regolari / assistiti.
- Confronto con lo stile storico dello studente.
- Evidenziazione dei passaggi da verificare.
- Correzioni grammaticali di base.
- Stima indicativa CEFR per elaborati in inglese.
- Valutazione didattica orientativa.
- Generazione di 3 domande per verifica orale.
- Importazione TXT, MD, DOCX, PDF.
- Esportazione report TXT.
- PWA installabile.

## Pubblicazione su GitHub Pages
1. Crea un nuovo repository, ad esempio `compitocheck-ai`.
2. Carica nella root tutti i file contenuti in questa cartella.
3. Apri `Settings > Pages`.
4. In `Build and deployment`, scegli `Deploy from a branch`.
5. Branch: `main`, cartella `/ (root)`.
6. Salva.

Dopo la pubblicazione l'indirizzo sarà simile a:
`https://TUO-USERNAME.github.io/compitocheck-ai/`

## Nota importante
L'indicatore IA NON dimostra che un testo sia stato generato con intelligenza artificiale.
È una valutazione euristica che deve essere affiancata a:
- confronto con lavori precedenti;
- processo di scrittura;
- verifica orale;
- giudizio del docente.

## Privacy
La V1 salva studenti e campioni solo nel browser (localStorage). Non invia i testi a un server.
Le librerie PDF/DOCX vengono caricate da CDN quando necessarie.


## Novità V2 — Modalità “Compito in classe”
- Avvio, pausa, ripresa e chiusura della sessione.
- Conteggio dei caratteri digitati.
- Conteggio dei caratteri incollati.
- Stima delle cancellazioni.
- Rilevazione di pause superiori a 20 secondi.
- Segnalazione di grandi inserimenti rapidi.
- Percentuale testo digitato / incollato.
- Timeline cronologica della sessione.
- Esportazione della cronologia in TXT.

### Importante
La rilevazione dell'incolla documenta ciò che è avvenuto dentro l'editor della webapp durante la sessione.
Non può stabilire automaticamente da quale programma o sito provenga il testo incollato.


## Novità V3 — Docente / Studente

### Modalità Docente
- Creazione di una prova con titolo, classe, lingua, durata e traccia.
- Generazione automatica di codice prova a 6 caratteri.
- Apertura e chiusura della prova.
- Registro delle consegne.
- Apertura del testo consegnato.
- Visualizzazione di durata, percentuale digitata/incollata e indicatore IA.
- Esportazione singola consegna.
- Esportazione registro completo.

### Modalità Studente
- Accesso con codice prova.
- Inserimento nome/codice studente.
- Visualizzazione della traccia.
- Editor dedicato.
- Registrazione di digitazione, incolla e cancellazioni.
- Timer della sessione.
- Consegna finale.

## Limite della V3 statica
Questa V3 funziona interamente nel browser. Di conseguenza il codice prova e le consegne sono visibili solo sullo stesso dispositivo/browser.
Per usare davvero più telefoni o computer contemporaneamente serve una V4 con backend/cloud (per esempio Cloudflare Worker + D1/KV oppure Firebase/Supabase).
