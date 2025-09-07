<div class="astro-bguv2lll" role="main" pagefind-body="" lang="it" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Guida alla Contribuzione per Bibliotecari

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   27 aprile 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

# Guida alla Contribuzione per Bibliotecari

## Modi per Contribuire

Attualmente stiamo cercando contributi nelle seguenti aree:

- Documentazione API: Aiutaci a migliorare la documentazione API aggiungendo nuove pagine o aggiornando i contenuti esistenti.
- Guide API: Condividi ciò che conosci scrivendo guide su come utilizzare l’API di Hardcover.
- Correzione Bug: Aiutaci a correggere bug nel sito della documentazione.
- Segnalazione Problemi: Segnala qualsiasi problema riscontrato con il sito della documentazione. <a href="https://github.com/hardcoverapp/hardcover-docs/issues/new?assignees=&amp;labels=&amp;projects=&amp;template=bug_report.md&amp;title=" target="_blank" rel="noreferrer noopener">Crea Issue</a>
- Richiesta Funzionalità: Condividi le tue idee per nuove funzionalità o miglioramenti al sito della documentazione. <a href="https://github.com/hardcoverapp/hardcover-docs/issues/new?assignees=&amp;labels=&amp;projects=&amp;template=feature_request.md&amp;title=" target="_blank" rel="noreferrer noopener">Suggerisci Funzionalità</a>
- Guide per Bibliotecari: Condividi le tue competenze scrivendo guide su come utilizzare gli strumenti per Bibliotecari.

## Trovare Qualcosa su cui Lavorare

Per trovare problemi su cui lavorare puoi guardare la <a href="https://github.com/hardcoverapp/hardcover-docs/issues" target="_blank" rel="noreferrer noopener">Bacheca degli Issues</a> su GitHub o unirti al <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Discord di Hardcover</a> e chiedendo suggerimenti nei canali <a href="https://discord.com/channels/835558721115389962/1278040045324075050" target="_blank" rel="noreferrer noopener">#API</a> o <a href="https://discord.com/channels/835558721115389962/1105918193022812282" target="_blank" rel="noreferrer noopener">#librarians</a>.

## Essere un Buon Contributore

Quando contribuisci a Hardcover, segui queste linee guida:

- Sii rispettoso degli altri e dei loro contributi.
- Sii aperto al feedback e disposto a fare cambiamenti basati sul feedback.
- Sii paziente e comprensivo riguardo al tempo necessario per revisionare e fare merge dei contributi.
- Sii chiaro e conciso nei tuoi contributi.
- Sii disposto ad aiutare gli altri e rispondere alle domande.
- Sii disposto a lavorare con altri per migliorare il sito della documentazione.
- Sii aperto all’apprendimento e alla crescita come contributore.
- Sii disposto a seguire i processi di contribuzione.
- Sii disposto ad accettare che non tutti i contributi saranno accettati.

## Come aggiungo una nuova pagina o aggiorno una pagina esistente?

### Aggiungere una Nuova Pagina

1.  Naviga alla pagina <a href="https://github.com/hardcoverapp/hardcover-docs/" target="_blank" rel="noreferrer noopener">GitHub della Documentazione di Hardcover</a>
2.  Naviga alla directory `src/content/docs/`.
3.  Naviga alla sottodirectory della pagina che vuoi aggiungere.
4.  Clicca sul pulsante “Add file” nella parte superiore destra dell’elenco dei file.
5.  Clicca sull’opzione “Create new file”.
6.  Nell’editor che si apre, dai al nuovo file un nome significativo che termini con `.mdx`, controlla i file esistenti per vedere degli esempi.
7.  Aggiungi il [frontmatter](#page-frontmatter) alla nuova pagina utilizzando il template sottostante.
8.  Fornisci il contenuto per la nuova pagina utilizzando la sintassi [Markdown](https://www.markdownguide.org/cheat-sheet/) o [MDX](https://mdxjs.com/guides/).
9.  Visualizza un’anteprima delle tue modifiche per verificare formattazione e accuratezza.
10. Clicca sul pulsante “Commit changes…” nella parte superiore della pagina.
11. Nella finestra di dialogo che si apre, fornisci un titolo e una descrizione per le tue modifiche.
12. Assicurati che l’opzione “Create a new branch for this commit and start a pull request” sia selezionata.
13. Dai al tuo branch un nome breve e descrittivo.
14. Clicca sul pulsante “Propose changes” per salvare le tue modifiche.
15. Notifica il team di Hardcover, in particolare `@revelry` nel <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Discord di Hardcover</a> comunicando che hai inviato una pull request.
16. Attendi una revisione e feedback dal team di Hardcover.
17. Apporta eventuali modifiche richieste.
18. Una volta che la tua pull request è approvata, sarà unita al branch principale.
19. Festeggia il tuo contributo!
20. Continua a contribuire a Hardcover!

### Modificare una Pagina Esistente

1.  Utilizzando l’interfaccia utente, naviga alla pagina che desideri modificare.
2.  Clicca sul pulsante “Modifica paigina” nella parte inferiore del contenuto.
3.  Nella pagina GitHub che si apre, clicca sull’icona della matita nella parte superiore destra del file per iniziare a modificare.
4.  Apporta le tue modifiche nell’editor utilizzando la sintassi [Markdown](https://www.markdownguide.org/cheat-sheet/) o [MDX](https://mdxjs.com/guides/).
5.  Aggiorna il [frontmatter](#page-frontmatter) utilizzando il modello sottostante, assicurati di aggiornare il campo `lastUpdated`.
6.  Visualizza un’anteprima delle tue modifiche per verificare formattazione e accuratezza.
7.  Clicca sul pulsante “Commit changes…” nella parte superiore della pagina.
8.  Nella finestra di dialogo che si apre, fornisci un titolo e una descrizione per le tue modifiche.
9.  Assicurati che l’opzione “Create a new branch for this commit and start a pull request” sia selezionata.
10. Dai al tuo branch un nome breve e descrittivo.
11. Clicca sul pulsante “Propose changes” per salvare le tue modifiche.
12. Notifica il team di Hardcover, in particolare `@revelry` nel <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Discord di Hardcover</a> comunicando che hai inviato una pull request.
13. Attendi la revisione e feedback dal team di Hardcover.
14. Apporta eventuali modifiche richieste.
15. Una volta che la tua pull request è approvata, sarà unita al branch principale.
16. Festeggia il tuo contributo!
17. Continua a contribuire a Hardcover!

## Aggiungere Immagini

Attualmente, le immagini devono essere aggiunte tramite una pull request separata. Per aggiungere un’immagine:

1.  Naviga alla pagine <a href="https://github.com/hardcoverapp/hardcover-docs/" target="_blank" rel="noreferrer noopener">GitHub della Documentazione di Hardcover</a>
2.  Naviga alla directory `public/images/`.
3.  Naviga alla sottodirectory `api` o `librarians` a seconda di dove verrà utilizzata l’immagine.
4.  Clicca sul pulsante “Add file” nella parte superiore destra dell’elenco dei file.
5.  Clicca sull’opzione “Upload files”.
6.  Trascina e rilascia i file immagine nell’area di caricamento.
7.  Nella sezione Commit changes, fornisci un titolo e una descrizione per le tue modifiche.
8.  Assicurati che l’opzione “Create a new branch for this commit and start a pull request” sia selezionata.
9.  Dai al tuo branch un nome breve e descrittivo.
10. Clicca sul pulsante “Propose changes” per salvare le tue modifiche.
11. Notifica il team di Hardcover, in particolare `@revelry` nel <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Discord di Hardcover</a> comunicando che hai inviato una pull request.
12. Attendi la revisione e feedback dal team di Hardcover.
13. Apporta eventuali modifiche richieste.
14. Una volta che la tua pull request è approvata, sarà unita al branch principale.
15. Dopo che l’immagine è stata unita, segui i passaggi nella sezione [Modificare una Pagina Esistente](#editing-an-existing-page) per aggiungere l’immagine e farvi riferimento utilizzando il percorso relativo: `/images/subdirectory/your-image.png`.

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="md"><code>&lt;img src=&quot;/images/librarians/long-title-example.png&quot; alt=&quot;Esempio di un titolo lungo su Hardcover&quot; /&gt;</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

## Page Frontmatter

Spostato in [Frontmatter](../frontmatter)

## Componenti Disponibili

Spostato in [Astro Components](../astro-components) per i componenti Astro e [React Components](../react-components) per i componenti React.

## Supporto per le Traduzioni

Sebbene attualmente supportiamo solo l’inglese, siamo aperti ad aggiungere traduzioni in futuro. Se sei interessato a contribuire con traduzioni, contatta il team di Hardcover nei canali <a href="https://discord.com/channels/835558721115389962/1278040045324075050" target="_blank" rel="noreferrer noopener">#API</a> o <a href="https://discord.com/channels/835558721115389962/1105918193022812282" target="_blank" rel="noreferrer noopener">#librarians</a> sul <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Discord di Hardcover</a>.

## Risorse di Supporto

### Trovare Aiuto su Discord

Connettiti con noi su <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Discord</a>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Ultimo aggiornamento: 27 apr 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/it/contributing/frontmatter/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">Frontmatter</span> </span></a> <a href="/it/contributing/react-components/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">Componenti React</span> </span></a>

</div>

</div>

</div>

</div>
