<div class="astro-bguv2lll" role="main" pagefind-body="" lang="it" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Guida alla Traduzione della Documentazione

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   27 aprile 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-34" id="tab-34" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0">Aggiornare le Traduzioni per Pagine Esistenti</a>
- <a href="#tab-panel-35" id="tab-35" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1">Aggiungere una Pagina a una Traduzione Esistente</a>

</div>

<div id="tab-panel-34" aria-labelledby="tab-34" role="tabpanel" tabindex="0">

Quando è già presente una traduzione per una pagina, puoi aggiornare la traduzione seguendo questi passaggi:

1.  Vai alla pagina che desideri tradurre.

2.  Utilizzando il menu delle lingue nella parte superiore della pagina, seleziona la lingua in cui desideri tradurre il documento.

3.  Clicca sul pulsante “Modifica pagina” nella parte inferiore della pagina.

4.  Traduci il contenuto nella lingua selezionata.

5.  Dopo aver apportato le modifiche, clicca sul pulsante “Commit changes…” nella parte superiore della pagina.

6.  Nella finestra modale che appare, aggiungi un titolo e una descrizione per descrivere le tue modifiche, quindi clicca sul pulsante “Propose changes”.

7.  Su Discord menziona `@Revelry` per rivedere le tue modifiche.

</div>

<div id="tab-panel-35" aria-labelledby="tab-35" role="tabpanel" tabindex="0" hidden="">

Durante la navigazione del sito della documentazione, potresti trovare una pagina che non è tradotta nella lingua che stai visualizzando. In questo caso potresti vedere un banner nella parte superiore della pagina simile a quello qui sotto:

![Traduzione Non Trovata](/images/Translation-Not-Found-IT.png)

Se vedi questo banner, dovrai creare una copia della pagina nella directory di traduzione per la lingua che stai visualizzando, e poi seguire i passaggi descritti in `Aggiornare le Traduzioni per Pagine Esistenti`.

Una volta che una lingua è stata aggiunta al file di configurazione astro, puoi creare un nuovo file nella directory `src/content/docs/` all’interno di una cartella denominata con il codice della lingua. Questo nuovo file deve avere lo stesso nome del file originale che stai traducendo.

Ad esempio, se stai traducendo il file `src/content/docs/getting-started.mdx` in spagnolo, creeresti un nuovo file in `src/content/docs/es/getting-started.mdx` con la traduzione spagnola del contenuto.

Istruzioni più dettagliate al riguardo saranno aggiunte in futuro.

</div>

## Aggiungere nuove lingue al menu delle lingue

Se desideri aggiungere una nuova lingua che non è attualmente disponibile nel menu delle lingue, puoi farlo seguendo questi passaggi:

Per maggiori informazioni, vedi [Starlight - Configurare i18n](https://starlight.astro.build/it/guides/i18n/#configurare-i18n).

### Note Importanti

- La lingua principale **non** deve essere cambiata dall’inglese.
- Quando aggiungi una nuova lingua, dovresti anche aggiornare i blocchi di traduzione esistenti nel file di configurazione astro per includere la nuova lingua.

## Come fare riferimento agli elementi dell’interfaccia utente nelle traduzioni

Poiché l’app Hardcover è attualmente disponibile solo in inglese, dovresti scrivere le pagine di documentazione con le etichette in inglese ma includere anche quale dovrebbe essere la traduzione.

Ad esempio, se stai traducendo una pagina che fa riferimento a un pulsante con l’etichetta “Save”, dovresti scrivere la pagina con il pulsante etichettato come “Save” e includere la traduzione nel contenuto della pagina come segue:

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="plaintext"><code>Click the &lt;kbd&gt;Save&lt;/kbd&gt; button to save your changes.</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

Diventerebbe:

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="plaintext"><code>Clicca sul pulsante &lt;kbd&gt;Save&lt;/kbd&gt; &quot;Salva&quot; per salvare le tue modifiche.</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

## Utilizzare le nuove traduzioni

Vedi [Utilizzare le Traduzioni nelle Pagine della Documentazione](./using-translations) per maggiori informazioni su come utilizzare le nuove traduzioni nelle pagine di documentazione.

</div>

<div class="meta sl-flex astro-3yyafb3n">

Ultimo aggiornamento: 27 apr 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/it/contributing/astro-components/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">Componenti Astro</span> </span></a> <a href="/it/contributing/frontmatter/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">Frontmatter</span> </span></a>

</div>

</div>

</div>

</div>
