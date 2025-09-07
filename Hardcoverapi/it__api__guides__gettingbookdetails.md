<div class="astro-bguv2lll" role="main" pagefind-body="" lang="it" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Getting Book Details

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   29 dicembre 2024

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

## Related Schemas

- [Books](/api/graphql/schemas/books)
- [Editions](/api/graphql/schemas/editions)

## Getting All Editions of a Book

### Example Request

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-131" id="tab-131" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-132" id="tab-132" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-131" aria-labelledby="tab-131" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:50ch"><code>query GetEditionsFromTitle {  editions(where: {title: {_eq: &quot;Oathbringer&quot;}}) {      id      title      edition_format      pages      release_date      isbn_10      isbn_13      publisher {          name      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Query di esempio</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-132" aria-labelledby="tab-132" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Getting Details of a Specific Edition

### Example Request

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-133" id="tab-133" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-134" id="tab-134" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-133" aria-labelledby="tab-133" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:42ch"><code>query GetSpecificEdition {  editions(where: {id: {_eq: 21953653}}) {      book {          title          release_date          slug          subtitle          contributions {              author {                  name              }          }      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Query di esempio</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-134" aria-labelledby="tab-134" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Ultimo aggiornamento: 29 dic 2024

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/it/api/guides/gettingallbooksinlibrary/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">Getting All Books in Your Library</span> </span></a> <a href="/it/api/guides/gettingbookswithstatus/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">Getting Books With a Status</span> </span></a>

</div>

</div>

</div>

</div>
