<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Publishers

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLW9wenNydmV3IGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLWNvbG9yOiB2YXIoLS1zbC1jb2xvci1vcmFuZ2UtaGlnaCk7LS1zbC1pY29uLXNpemU6IDEuNWVtOyI+PHBhdGggZD0iTTEyIDE2YTEgMSAwIDEgMCAwIDIgMSAxIDAgMCAwIDAtMlptMTAuNjcgMS40Ny04LjA1LTE0YTMgMyAwIDAgMC01LjI0IDBsLTggMTRBMyAzIDAgMCAwIDMuOTQgMjJoMTYuMTJhMyAzIDAgMCAwIDIuNjEtNC41M1ptLTEuNzMgMmExIDEgMCAwIDEtLjg4LjUxSDMuOTRhMSAxIDAgMCAxLS44OC0uNTEgMSAxIDAgMCAxIDAtMWw4LTE0YTEgMSAwIDAgMSAxLjc4IDBsOC4wNSAxNGExIDEgMCAwIDEgLjA1IDEuMDJ2LS4wMlpNMTIgOGExIDEgMCAwIDAtMSAxdjRhMSAxIDAgMCAwIDIgMFY5YTEgMSAwIDAgMC0xLTFaIiAvPjwvc3ZnPg==" class="astro-opzsrvew astro-c6vsoqas" /> <span class="astro-opzsrvew">Questi contenuti non sono ancora disponibili nella tua lingua.</span>

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   7 giugno 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Reference</span>

</div>

# What Is a Publisher?

A Publisher in Hardcover represents a company or organization that publishes books. Publishers are linked to specific editions of books, as the same book may be published by different publishers in different regions or formats. Publishers help users find books from their favorite publishing houses and understand the publishing history of editions.

# Fields

| Field | Type | Description |
|----|----|----|
| id | bigint | Unique identifier for the publisher |
| name | string | The name of the publisher |
| slug | string | URL-friendly identifier for the publisher |
| canonical_id | int | Canonical ID for merged publishers |
| parent_id | int | ID of the parent publisher (for imprints) |
| editions_count | int | Number of editions published by this publisher |
| locked | bool | Whether the publisher is locked from editing |
| state | string | Current state of the publisher record |
| user_id | int | ID of the user who created the publisher |
| created_at | timestamp | When the publisher was created |
| updated_at | timestamp | When the publisher was last updated |
| editions | Edition\[\] | Array of editions published by this publisher |
| parent_publisher | Publisher | Parent publisher object (for imprints) |

# Related Schemas

- [Editions](/api/graphql/schemas/editions) - Editions published by publishers
- [Books](/api/graphql/schemas/books) - Books have multiple editions from different publishers
- [Authors](/api/graphql/schemas/authors) - Authors work with various publishers

# Example Queries

## Get Publisher Details

Retrieve detailed information about a specific publisher including recent editions. This example uses Penguin Random House (ID: 1).

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-246" id="tab-246" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-247" id="tab-247" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-246" aria-labelledby="tab-246" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:40ch"><code>query GetPublisherDetails {  publishers(where: {id: {_eq: 1}}) {      id      name      slug      editions_count      parent_publisher {          name      }      editions(          limit: 5          order_by: {release_date: desc}      ) {          id          title          isbn_13          release_date          book {              title              contributions {                  author {                      name                  }              }          }      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Publisher Details</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-247" aria-labelledby="tab-247" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Find Publishers by Name

Search for publishers by name pattern. This example searches for publishers with “Penguin” in the name.

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-240" id="tab-240" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-241" id="tab-241" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-240" aria-labelledby="tab-240" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:50ch"><code>query FindPublishers {  publishers(      where: {name: {_eq: &quot;Penguin Random House&quot;}}      order_by: {editions_count: desc}      limit: 10  ) {      id      name      editions_count      parent_publisher {          name      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Publisher Search</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-241" aria-labelledby="tab-241" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Get Books by Publisher

Find all books published by a specific publisher, showing different editions.

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9InN0YXJsaWdodC1hc2lkZV9faWNvbiBhc3Ryby1jNnZzb3FhcyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Ym94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3R5bGU9Ii0tc2wtaWNvbi1zaXplOiAxZW07Ij48cGF0aCBkPSJNMTIgMTFhMSAxIDAgMCAwLTEgMXY0YTEgMSAwIDAgMCAyIDB2LTRhMSAxIDAgMCAwLTEtMVptLjM4LTMuOTJhMSAxIDAgMCAwLS43NiAwIDEgMSAwIDAgMC0uMzMuMjEgMS4xNSAxLjE1IDAgMCAwLS4yMS4zMyAxIDEgMCAwIDAgLjIxIDEuMDljLjA5Ny4wODguMjA5LjE2LjMzLjIxQTEgMSAwIDAgMCAxMyA4YTEuMDUgMS4wNSAwIDAgMC0uMjktLjcxIDEgMSAwIDAgMC0uMzMtLjIxWk0xMiAyYTEwIDEwIDAgMSAwIDAgMjAgMTAgMTAgMCAwIDAgMC0yMFptMCAxOGE4IDggMCAxIDEgMC0xNi4wMDFBOCA4IDAgMCAxIDEyIDIwWiIgLz48L3N2Zz4=" class="starlight-aside__icon astro-c6vsoqas" /> Nota

<div class="starlight-aside__content">

This query shows unique books (not editions) published by the publisher, grouped by the parent book.

</div>

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-244" id="tab-244" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-245" id="tab-245" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-244" aria-labelledby="tab-244" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:40ch"><code>query GetPublisherBooks {  publishers(where: {id: {_eq: 1}}) {      name      editions(          order_by: {book: {title: asc}}          limit: 5      ) {          id          isbn_13          physical_format          pages          release_date          book {              id              title              rating              contributions {                  author {                      name                  }              }          }      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Publisher Books</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-245" aria-labelledby="tab-245" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Get Popular Publishers

Retrieve the most active publishers by edition count.

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-242" id="tab-242" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-243" id="tab-243" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-242" aria-labelledby="tab-242" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:42ch"><code>query GetPopularPublishers {  publishers(      where: {editions_count: {_gt: 100}}      order_by: {editions_count: desc}      limit: 5  ) {      id      name      slug      editions_count      editions(          limit: 3          order_by: {book: {rating: desc}}      ) {          book {              title              rating          }      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Popular Publishers</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-243" aria-labelledby="tab-243" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Ultimo aggiornamento: 7 giu 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/it/api/graphql/schemas/lists/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">Lists</span> </span></a> <a href="/it/api/graphql/schemas/users/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">Users</span> </span></a>

</div>

</div>

</div>

</div>
