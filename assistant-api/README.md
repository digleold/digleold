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

## Avatar realistico dal vivo (HeyGen LiveAvatar)

Funzione `netlify/functions/avatar-token.mjs`: crea il token di sessione; la chiave HeyGen resta solo sul server.

Variabili d'ambiente (Netlify):
- `LIVEAVATAR_API_KEY` – chiave API LiveAvatar (mai nel codice o in chat)
- `LIVEAVATAR_CONTEXT_IT` = `841c84a4-250f-4864-b746-2ab5ca034a55`, `LIVEAVATAR_CONTEXT_EN` = `2354cf0f-2afa-4426-a252-9b1aed0ad6ae` (contenuti e regole dell'assistente, già creati nell'account)
- `LIVEAVATAR_AVATAR_ID` (opzionale, default: Claire a figura intera `cc65bf90-dbe6-4ad3-8a4b-e936c9b34401`)
- `LIVEAVATAR_MAX_SECONDS` (default 120, massimo del piano attuale), `LIVEAVATAR_MAX_PER_HOUR_IP` (default 4), `ALLOWED_ORIGINS`

Poi in `index.html` e `en/index.html`: `<meta name="ld-avatar-endpoint" content="https://<sito>.netlify.app/api/avatar-token">`.
Compare il pulsante "Parla con l'avatar" nel widget (microfono + testo). Ogni conversazione consuma crediti HeyGen.
Se i contenuti cambiano, aggiorna i due contesti (`PATCH /v1/contexts/{id}` con il nuovo testo di `kb.*.json`).
