<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Translating Documentation Guide

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Last Updated   May 2, 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-4" id="tab-4" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0">Updating Translations for Existing Pages</a>
- <a href="#tab-panel-5" id="tab-5" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1">Adding a Page to Existing Translation</a>

</div>

<div id="tab-panel-4" aria-labelledby="tab-4" role="tabpanel" tabindex="0">

When a page already exists in the translation you are working on, you can update the translation by following these steps:

1.  Go to the page you want to translate.

2.  Using the language dropdown at the top of the page, select the language you want to translate the document into.

3.  Click the “Edit page” button at the bottom of the page.

4.  Translate the content into the selected language.

5.  After making your changes click the “Commit changes…” button at the top of the page.

6.  In the modal that appears, add a title and description to describe your changes, then click the “Propose changes” button.

7.  In Discord ping `@Revelry` to review your changes.

</div>

<div id="tab-panel-5" aria-labelledby="tab-5" role="tabpanel" tabindex="0" hidden="">

When browsing the documentation site, you may find a page that is not translated into the language you are viewing. If this is the case you might see a banner at the top of the page similar to the one below:

![Translation Not Found](/images/Translation-Not-Found-IT.png)

If you see this banner you will need to create a copy of the page in the translation directory for the language you are viewing, and then following the steps outlined in `Updating Translations for Existing Pages`.

Once a language has been added to the astro config file you can create a new file in the `src/content/docs/` directory inside a folder named with the language code. This new file should have the same name as the original file you are translating.

For example, if you are translating the `src/content/docs/getting-started.mdx` file into Spanish you would create a new file at `src/content/docs/es/getting-started.mdx` with the Spanish translation of the content.

More detailed instructions for how to do this will be added in the future.

</div>

## Adding New Languages to the Language Dropdown

If you want to add a new language that is not currently available in the language dropdown, you can do so by following these steps:

For more information, see [Starlight - Configure i18n](https://starlight.astro.build/guides/i18n/#configure-i18n).

### Important Notes

- The root language should **not** be changed from English.
- When adding a new language, you should also update the existing translation blocks in the astro config file to include the new language.

## How To Reference UI Elements in Translations

Since the Hardcover app is currently only available in English, you should write the documentation pages with the English labels but also include what the translation should be.

For example, if you are translating a page that references a button with the label “Save”, you should write the page with the button labeled as “Save” and include the translation in the page content like so:

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="plaintext"><code>Click the &lt;kbd&gt;Save&lt;/kbd&gt; button to save your changes.</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

Would become:

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="plaintext"><code>Haga clic en el botón &lt;kbd&gt;Save&lt;/kbd&gt; &quot;Guardar&quot; para guardar los cambios.</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

## Using the New Translations

See [Using Translations in Doc Pages](./using-translations) for more information on how to use the new translations in your documentation pages.

</div>

<div class="meta sl-flex astro-3yyafb3n">

Last updated: May 2, 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/contributing/react-components/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Previous<br />
<span class="link-title astro-u2l5gyhi">React Components</span> </span></a> <a href="/contributing/using-translations/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Next<br />
<span class="link-title astro-u2l5gyhi">Using Translations in Doc Pages</span> </span></a>

</div>

</div>

</div>

</div>
