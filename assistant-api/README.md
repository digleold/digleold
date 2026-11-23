# Assistente IA – funzione serverless

Il widget del sito funziona già in "modalità base" (risposte dai contenuti della pagina).
Per le risposte libere con IA si pubblica questa funzione e si imposta l'endpoint nel sito.

1. Account Anthropic aziendale → crea una API key (mai nel codice o in chat).
2. Pubblica la cartella `assistant-api/` su Netlify (o adatta `chat.mjs` ad altro hosting).
3. Variabili d'ambiente: `ANTHROPIC_API_KEY`, `ALLOWED_ORIGINS` (es. `https://tuodominio.it,https://utente.github.io`), opzionale `ANTHROPIC_MODEL`.
4. In `index.html` e `en/index.html` imposta `<meta name="ld-assistant-endpoint" content="https://<sito>.netlify.app/api/chat">`.
5. Aggiorna la KB dopo modifiche ai contenuti: `python3 tools/build_kb.py` e ripubblica.

Protezioni: allowlist origini, rate limit 12 req/min/IP, max 6 messaggi da 400 caratteri, max_tokens 500.
Privacy: con l'endpoint attivo le domande dei visitatori vengono inviate ad Anthropic → aggiornare l'informativa privacy.
