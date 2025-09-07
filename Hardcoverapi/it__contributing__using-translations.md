<div class="astro-bguv2lll" role="main" pagefind-body="" lang="it" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Utilizzare le Traduzioni nelle Pagine della Documentazione

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   28 aprile 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

Questo documento è rilevante quando stai costruendo nuovi componenti o espandendo quelli esistenti. Non va utilizzato per tradurre le pagine di documentazione.

Vedi [Guida alla Traduzione della Documentazione](./doc-translations) per ulteriori informazioni su come tradurre le pagine di documentazione.

## Utilizzare le Traduzioni nei Componenti React

Quando si utilizzano le traduzioni nei componenti React, puoi utilizzare la funzione utility `useTranslation` da `@/lib/utils` per tradurre le stringhe. Questa funzione accetta una stringa come argomento e restituisce la stringa tradotta in base alla lingua fornita.

Attualmente, le traduzioni devono essere definite nel file `src/content/docs/{LANG}/ui.json`, dove `{LANG}` è il codice della lingua per la traduzione.

### Esempio Base

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="ts"><code>import React from &quot;react&quot;;import { useTranslation } from &#39;@/lib/utils&#39;;
const MyComponent = () =&gt; {  return (    &lt;div&gt;      &lt;h1&gt;{useTranslation(&#39;pages.api.disclaimerBanner.title&#39;, locale)}&lt;/h1&gt;    &lt;/div&gt;  );};</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

### Utilizzare Token Dinamici

Puoi utilizzare anche token dinamici in una stringa di traduzione.  
Tuttavia, la stringa restituita dovrà essere sanitizzata prima di essere renderizzata.

#### Esempio

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="ts"><code>import {URLS} from &quot;@/Consts&quot;;import {useTokenTranslation} from &quot;@/lib/utils.ts&quot;;import DOMPurify from &quot;dompurify&quot;;import React from &quot;react&quot;;
const MyComponent = (locale: string = &#39;en&#39;) =&gt; {    const disclaimerText: string | Node = useTokenTranslation(&#39;pages.api.disclaimerBanner.title&#39;, locale, {        &quot;a&quot;: (chunks: any) =&gt; {            return `&lt;a href=${URLS.API_DISCORD}                   target=&quot;_blank&quot; rel=&quot;noreferrer noopener&quot;&gt;{chunks}&lt;/a&gt;`        }    });
    const sanitizedText = () =&gt; ({        __html: DOMPurify.sanitize(disclaimerText)    });
    return (        &lt;div&gt;            &lt;h1&gt;{sanitizedText()}&lt;/h1&gt;        &lt;/div&gt;    );};</code></pre>
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

<a href="/it/contributing/translating-documentation/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">Translating Documentation Guide</span> </span></a> <a href="/it/librarians/editing" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">FAQ Modifiche</span> </span></a>

</div>

</div>

</div>

</div>
