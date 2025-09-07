<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Contributions

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLW9wenNydmV3IGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLWNvbG9yOiB2YXIoLS1zbC1jb2xvci1vcmFuZ2UtaGlnaCk7LS1zbC1pY29uLXNpemU6IDEuNWVtOyI+PHBhdGggZD0iTTEyIDE2YTEgMSAwIDEgMCAwIDIgMSAxIDAgMCAwIDAtMlptMTAuNjcgMS40Ny04LjA1LTE0YTMgMyAwIDAgMC01LjI0IDBsLTggMTRBMyAzIDAgMCAwIDMuOTQgMjJoMTYuMTJhMyAzIDAgMCAwIDIuNjEtNC41M1ptLTEuNzMgMmExIDEgMCAwIDEtLjg4LjUxSDMuOTRhMSAxIDAgMCAxLS44OC0uNTEgMSAxIDAgMCAxIDAtMWw4LTE0YTEgMSAwIDAgMSAxLjc4IDBsOC4wNSAxNGExIDEgMCAwIDEgLjA1IDEuMDJ2LS4wMlpNMTIgOGExIDEgMCAwIDAtMSAxdjRhMSAxIDAgMCAwIDIgMFY5YTEgMSAwIDAgMC0xLTFaIiAvPjwvc3ZnPg==" class="astro-opzsrvew astro-c6vsoqas" /> <span class="astro-opzsrvew">Questi contenuti non sono ancora disponibili nella tua lingua.</span>

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   25 luglio 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Reference</span>

</div>

# What Is a Contribution?

A Contribution in Hardcover represents the relationship between an author and a book or edition, along with the specific role the author played. This flexible system allows for various types of contributions including writing, illustration, translation, editing, and more, providing detailed credit information for all contributors to a work.

# Fields

| Field | Type | Description |
|----|----|----|
| id | bigint | Unique identifier for the contribution |
| author_id | int | ID of the contributing author |
| contributable_id | int | ID of the item being contributed to (book or edition) |
| contributable_type | string | Type of item: “Book” or “Edition” |
| contribution | string | Role or type of contribution (Author, Illustrator, Translator, etc.) |
| created_at | timestamp | When the contribution was recorded |
| updated_at | timestamp | When the contribution was last updated |
| author | Author | Author object with complete information |
| book | Book | Book object (when contributable_type is “Book”) |

# Common Contribution Types

| Contribution Type | Description                             |
|-------------------|-----------------------------------------|
| Author            | Primary writer of the book              |
| Illustrator       | Created illustrations or artwork        |
| Translator        | Translated the work to another language |
| Editor            | Edited or compiled the work             |
| Narrator          | Narrated the audiobook version          |
| Foreword          | Wrote the foreword or introduction      |
| Afterword         | Wrote the afterword or conclusion       |
| Cover Artist      | Created the cover art or design         |

# Related Schemas

- [Authors](/api/graphql/schemas/authors) - The contributors to books
- [Books](/api/graphql/schemas/books) - Works that receive contributions
- [Editions](/api/graphql/schemas/editions) - Specific editions with unique contributions

# Example Queries

## Get Book Contributors

Retrieve all contributors for a specific book with their roles:

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-202" id="tab-202" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-203" id="tab-203" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-202" aria-labelledby="tab-202" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:37ch"><code>query GetBookContributors {  books(where: {id: {_eq: 328491}}) {      id      title      contributions {          id          contribution          author {              id              name              bio          }      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Book Contributors</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-203" aria-labelledby="tab-203" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Get Author’s Contributions

Find all works an author has contributed to with their roles:

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-204" id="tab-204" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-205" id="tab-205" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-204" aria-labelledby="tab-204" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:38ch"><code>query GetAuthorContributions {  contributions(      where: {author_id: {_eq: 80626}}      order_by: {created_at: desc}  ) {      id      contribution      contributable_type      book {          id          title          release_year          rating      }      created_at  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Author Contributions</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-205" aria-labelledby="tab-205" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Find Books by Illustrator

Search for books that have illustrators and display their names:

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-208" id="tab-208" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-209" id="tab-209" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-208" aria-labelledby="tab-208" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:44ch"><code>query FindBooksByContributor {  contributions(      where: {          contribution: {_eq: &quot;Illustrator&quot;}          book: {id: {_is_null: false}}      }      order_by: {created_at: desc}      limit: 10  ) {      id      contribution      author {          name      }      book {          id          title          rating          release_year      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Books by Contributor Type</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-209" aria-labelledby="tab-209" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Find Authors With Multiple Roles

Discover authors who have contributed to books in different roles (e.g., as both author and illustrator):

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9InN0YXJsaWdodC1hc2lkZV9faWNvbiBhc3Ryby1jNnZzb3FhcyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Ym94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3R5bGU9Ii0tc2wtaWNvbi1zaXplOiAxZW07Ij48cGF0aCBkPSJNMTIgMTFhMSAxIDAgMCAwLTEgMXY0YTEgMSAwIDAgMCAyIDB2LTRhMSAxIDAgMCAwLTEtMVptLjM4LTMuOTJhMSAxIDAgMCAwLS43NiAwIDEgMSAwIDAgMC0uMzMuMjEgMS4xNSAxLjE1IDAgMCAwLS4yMS4zMyAxIDEgMCAwIDAgLjIxIDEuMDljLjA5Ny4wODguMjA5LjE2LjMzLjIxQTEgMSAwIDAgMCAxMyA4YTEuMDUgMS4wNSAwIDAgMC0uMjktLjcxIDEgMSAwIDAgMC0uMzMtLjIxWk0xMiAyYTEwIDEwIDAgMSAwIDAgMjAgMTAgMTAgMCAwIDAgMC0yMFptMCAxOGE4IDggMCAxIDEgMC0xNi4wMDFBOCA4IDAgMCAxIDEyIDIwWiIgLz48L3N2Zz4=" class="starlight-aside__icon astro-c6vsoqas" /> Nota

<div class="starlight-aside__content">

This query finds authors who have contributions with roles other than “Author”, helping identify versatile creators who write, illustrate, translate, or contribute in multiple ways.

</div>

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-210" id="tab-210" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-211" id="tab-211" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-210" aria-labelledby="tab-210" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:58ch"><code>query AuthorMultipleRoles {  authors(      where: {          contributions_aggregate: {              count: {                  predicate: {_gt: 0},                  filter: {contribution: {_neq: &quot;Author&quot;}}              }          }      }  ) {      id      name      contributions_aggregate(          distinct_on: contribution      ) {          nodes {              contribution          }      }      contributions(          distinct_on: contribution          limit: 5      ) {          contribution      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Authors With Multiple Roles</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-211" aria-labelledby="tab-211" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Edition-Specific Contributors

Find contributors specific to particular editions:

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-206" id="tab-206" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-207" id="tab-207" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-206" aria-labelledby="tab-206" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:68ch"><code>query EditionContributors {  contributions(      where: {contributable_type: {_eq: &quot;Edition&quot;}}      order_by: {created_at: desc}      limit: 20  ) {      id      contribution      author {          name      }      # The contributable_id field references the edition ID      # You can join this with editions table to get edition details      contributable_id      created_at  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Edition-Specific Contributors</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-207" aria-labelledby="tab-207" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9InN0YXJsaWdodC1hc2lkZV9faWNvbiBhc3Ryby1jNnZzb3FhcyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Ym94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3R5bGU9Ii0tc2wtaWNvbi1zaXplOiAxZW07Ij48cGF0aCBkPSJNMTIgMTFhMSAxIDAgMCAwLTEgMXY0YTEgMSAwIDAgMCAyIDB2LTRhMSAxIDAgMCAwLTEtMVptLjM4LTMuOTJhMSAxIDAgMCAwLS43NiAwIDEgMSAwIDAgMC0uMzMuMjEgMS4xNSAxLjE1IDAgMCAwLS4yMS4zMyAxIDEgMCAwIDAgLjIxIDEuMDljLjA5Ny4wODguMjA5LjE2LjMzLjIxQTEgMSAwIDAgMCAxMyA4YTEuMDUgMS4wNSAwIDAgMC0uMjktLjcxIDEgMSAwIDAgMC0uMzMtLjIxWk0xMiAyYTEwIDEwIDAgMSAwIDAgMjAgMTAgMTAgMCAwIDAgMC0yMFptMCAxOGE4IDggMCAxIDEgMC0xNi4wMDFBOCA4IDAgMCAxIDEyIDIwWiIgLz48L3N2Zz4=" class="starlight-aside__icon astro-c6vsoqas" /> Nota

<div class="starlight-aside__content">

Edition-specific contributions are used when a contribution applies only to a particular edition, not the work as a whole. Common examples include:

- Translators for translated editions
- Narrators for audiobook editions
- Cover artists for specific print runs
- Editors for revised editions

The original author is typically credited at the book level, while edition-specific contributors are linked to individual editions.

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Ultimo aggiornamento: 25 lug 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/it/api/graphql/schemas/characters/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">Characters</span> </span></a> <a href="/it/api/graphql/schemas/countries/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">Countries</span> </span></a>

</div>

</div>

</div>

</div>
