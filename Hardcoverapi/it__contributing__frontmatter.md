<div class="astro-bguv2lll" role="main" pagefind-body="" lang="it" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Frontmatter

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   28 aprile 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

## Cos’è il `Frontmatter`?

Il Frontmatter è un blocco di metadati all’inizio di un file Markdown che fornisce informazioni sulla pagina. Viene utilizzato da Starlight per generare le pagine HTML e può essere usato per controllare vari aspetti del comportamento e dell’aspetto della pagina.

## Quali opzioni sono disponibili?

Le seguenti opzioni sono disponibili nel frontmatter delle pagine:

Vedi [Starlight - Frontmatter](https://starlight.astro.build/it/reference/frontmatter/) per ulteriori informazioni e opzioni aggiuntive.

| Campo | Descrizione | Obbligatorio |
|----|----|----|
| title | Stringa contenente il titolo della pagina | Sì |
| category | Stringa della categoria in cui la pagina deve essere inclusa `guide` o `reference` | Sì |
| layout | Percorso relativo di uno dei layout in `/src/layouts` | Sì |
| description | Stringa contenente la descrizione da utilizzare nei meta tag HTML | Consigliato |
| lastUpdated | Stringa nel formato `YYYY-MM-DD HH:MM:SS` | Consigliato |
| draft | Valore booleano che determina se la pagina debba essere nascosta dal sito di produzione | No |
| slug | Stringa contenente lo slug dell’URL per la pagina | No |
| tableOfContents | Valore booleano che determina se debba essere generata una tabella dei contenuti | No |
| template | `doc` o `splash` predefinito è `doc`. `splash` è un layout più ampio senza le barre laterali normali | No |
| hero | Vedi [Starlight - Frontmatter HeroConfig](https://starlight.astro.build/it/reference/frontmatter/#heroconfig) per ulteriori informazioni | No |
| banner | Vedi [Starlight - Frontmatter Banner](https://starlight.astro.build/reference/frontmatter/#banner) per ulteriori informazioni | No |
| prev | Valore booleano che determina se debba essere mostrato un pulsante di collegamento alla pagina precedente. Vedi [Starlight - Frontmatter Prev](https://starlight.astro.build/it/reference/frontmatter/#prev) per ulteriori informazioni | No |
| next | Valore booleano che determina se debba essere mostrato un pulsante di collegamento alla pagina successiva. Vedi [Starlight - Frontmatter Next](https://starlight.astro.build/it/reference/frontmatter/#next) per ulteriori informazioni | No |
| sidebar | Controlla come la pagina viene visualizzata nella barra laterale. Vedi [Starlight - Frontmatter Sidebar](https://starlight.astro.build/it/reference/frontmatter/#sidebarconfig) per ulteriori informazioni | No |

### Esempio di Frontmatter

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="md"><code>---title: Introduzione all&#39;APIdescription: Inizia a utilizzare l&#39;API GraphQL di Hardcover.category: guidelastUpdated: 2025-02-01 17:03:00layout: ../../layouts/documentation.astro---</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Ultimo aggiornamento: 28 apr 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/it/contributing/doc-translations/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">Guida alla Traduzione della Documentazione</span> </span></a> <a href="/it/contributing/librarian-guides/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">Guida alla Contribuzione per Bibliotecari</span> </span></a>

</div>

</div>

</div>

</div>
