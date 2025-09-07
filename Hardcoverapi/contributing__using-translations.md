<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Using Translations in Doc Pages

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Last Updated   May 2, 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

This document is relevant when you are building new components or expanding existing ones. It is not used for translating the documentation pages themselves.

See [Translating Documentation Guide](./translating-documentation) for more information on how to translate documentation pages.

## Using Translations in React Components

When using translations in React components, you can use the `useTranslation` utility function from `@/lib/utils` to translate strings. This function takes a string as an argument and returns the translated string based on the provided locale.

Currently, translations must be defined in the `src/content/docs/{LANG}/ui.json` file, where `{LANG}` is the language code for the translation.

### Basic Example

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

### Using Dynamic Tokens

You can also use dynamic tokens in a translation string.  
However, the returned string will need to be sanitized before being rendered.

#### Example

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

Last updated: May 2, 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/contributing/translating-documentation/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Previous<br />
<span class="link-title astro-u2l5gyhi">Translating Documentation Guide</span> </span></a> <a href="/librarians/editing" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Next<br />
<span class="link-title astro-u2l5gyhi">Editing FAQ</span> </span></a>

</div>

</div>

</div>

</div>
