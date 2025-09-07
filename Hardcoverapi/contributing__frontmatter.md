<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Frontmatter

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Last Updated   March 29, 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

## What Is Frontmatter?

Frontmatter is a block of metadata at the top of a Markdown file that provides information about the page. It is used by Starlight to generate the HTML pages and can be used to control various aspects of the page’s behavior and appearance.

## What options are available?

The following options are available in the frontmatter for pages:

See [Starlight - Frontmatter](https://starlight.astro.build/reference/frontmatter/) for more information and additional options.

| Field | Description | Required |
|----|----|----|
| title | String containing the title of the page | Yes |
| category | String of the category the page should be included in `guide` or `reference` | Yes |
| layout | relative path to one of the layouts in `/src/layouts` | Yes |
| description | String containing the descriptive text to use in HTML meta tags | Recommended |
| lastUpdated | String in the format `YYYY-MM-DD HH:MM:SS` | Recommended |
| draft | Boolean value determining whether the page should be hidden from the production site | No |
| slug | String containing the URL slug for the page | No |
| tableOfContents | Boolean value determining whether a table of contents should be generated | No |
| template | `doc` or `splash` default is `doc`. `splash` is a wider layout without the normal sidebars | No |
| hero | See [Starlight - Frontmatter HeroConfig](https://starlight.astro.build/reference/frontmatter/#heroconfig) for more information | No |
| banner | See [Starlight - Frontmatter Banner](https://starlight.astro.build/reference/frontmatter/#banner) for more information | No |
| prev | Boolean value determining whether a previous button should be shown. See [Starlight - Frontmatter Prev](https://starlight.astro.build/reference/frontmatter/#prev) for more information | No |
| next | Boolean value determining whether a next button should be shown. See [Starlight - Frontmatter Next](https://starlight.astro.build/reference/frontmatter/#next) for more information | No |
| sidebar | Control how the page is displayed in the sidebar. See [Starlight - Frontmatter Sidebar](https://starlight.astro.build/reference/frontmatter/#sidebarconfig) for more information | No |

### Example Frontmatter

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="md"><code>---title: Getting Started with the APIdescription: Get started with the Hardcover GraphQL API.category: guidelastUpdated: 2025-02-01 17:03:00layout: ../../layouts/documentation.astro---</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Last updated: Mar 29, 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/contributing/astro-components/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Previous<br />
<span class="link-title astro-u2l5gyhi">Astro Components</span> </span></a> <a href="/contributing/librarian-guides/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Next<br />
<span class="link-title astro-u2l5gyhi">Librarian Contribution Guide</span> </span></a>

</div>

</div>

</div>

</div>
