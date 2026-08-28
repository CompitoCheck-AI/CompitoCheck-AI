# CompitoCheck AI — V2

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
