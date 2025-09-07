<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Editions

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLW9wenNydmV3IGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLWNvbG9yOiB2YXIoLS1zbC1jb2xvci1vcmFuZ2UtaGlnaCk7LS1zbC1pY29uLXNpemU6IDEuNWVtOyI+PHBhdGggZD0iTTEyIDE2YTEgMSAwIDEgMCAwIDIgMSAxIDAgMCAwIDAtMlptMTAuNjcgMS40Ny04LjA1LTE0YTMgMyAwIDAgMC01LjI0IDBsLTggMTRBMyAzIDAgMCAwIDMuOTQgMjJoMTYuMTJhMyAzIDAgMCAwIDIuNjEtNC41M1ptLTEuNzMgMmExIDEgMCAwIDEtLjg4LjUxSDMuOTRhMSAxIDAgMCAxLS44OC0uNTEgMSAxIDAgMCAxIDAtMWw4LTE0YTEgMSAwIDAgMSAxLjc4IDBsOC4wNSAxNGExIDEgMCAwIDEgLjA1IDEuMDJ2LS4wMlpNMTIgOGExIDEgMCAwIDAtMSAxdjRhMSAxIDAgMCAwIDIgMFY5YTEgMSAwIDAgMC0xLTFaIiAvPjwvc3ZnPg==" class="astro-opzsrvew astro-c6vsoqas" /> <span class="astro-opzsrvew">Questi contenuti non sono ancora disponibili nella tua lingua.</span>

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   24 giugno 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Reference</span>

</div>

# What Is an Edition?

An Edition in Hardcover represents a specific published version of a book. While a book is the conceptual work (e.g., “Pride and Prejudice”), an edition is a particular physical or digital manifestation with specific attributes like ISBN, publisher, format, and release date. Multiple editions of the same book may exist with different publishers, languages, formats, or cover art.

# Fields

| Field | Type | Description |
|----|----|----|
| id | int | Unique identifier for the edition |
| title | string | Title of this edition |
| subtitle | string | Subtitle of this edition |
| isbn_10 | string | 10-digit ISBN |
| isbn_13 | string | 13-digit ISBN |
| asin | string | Amazon Standard Identification Number |
| pages | int | Number of pages |
| audio_seconds | int | Duration in seconds (for audiobooks) |
| release_date | date | Full release date |
| release_year | int | Year of release |
| physical_format | string | Physical format (hardcover, paperback, etc.) |
| edition_format | string | Edition format information |
| edition_information | string | Additional edition details |
| description | string | Description of this edition |
| book_id | int | ID of the parent book |
| publisher_id | int | ID of the publisher |
| language_id | int | ID of the language |
| country_id | int | ID of the country of publication |
| reading_format_id | int | ID of the reading format |
| image_id | int | ID of the cover image |
| rating | numeric | Average rating for this edition |
| users_count | int | Number of users who have this edition |
| users_read_count | int | Number of users who have read this edition |
| lists_count | int | Number of lists containing this edition |
| locked | bool | Whether the edition is locked from editing |
| state | string | Current state of the edition record |
| created_at | timestamp | When the edition was created |
| updated_at | timestamp | When the edition was last updated |
| book | Book | Parent book object |
| publisher | Publisher | Publisher object |
| language | Language | Language object |
| country | Country | Country object |
| reading_format | ReadingFormat | Reading format object |
| image | Image | Cover image object |
| contributions | Contribution\[\] | Array of contributor relationships |

# Related Schemas

- [Books](/api/graphql/schemas/books) - Parent book for editions
- [Publishers](/api/graphql/schemas/publishers) - Publishers of editions
- [Languages](/api/graphql/schemas/languages) - Edition languages
- [Authors](/api/graphql/schemas/authors) - Authors via contributions

# Example Queries

## Get Edition Details by ISBN

Retrieve detailed information about a specific edition by ISBN.

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-218" id="tab-218" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-219" id="tab-219" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-218" aria-labelledby="tab-218" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:54ch"><code>query GetEditionByISBN {  editions(where: {isbn_13: {_eq: &quot;9780547928227&quot;}}) {      id      title      subtitle      isbn_13      isbn_10      asin      pages      release_date      physical_format      publisher {          name      }      book {          id          title          rating          contributions {              author {                  name              }          }      }      language {          language      }      reading_format {          format      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Edition Details by ISBN</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-219" aria-labelledby="tab-219" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Get All Editions of a Book

Find all editions of a specific book, showing different formats and publishers.

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9InN0YXJsaWdodC1hc2lkZV9faWNvbiBhc3Ryby1jNnZzb3FhcyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Ym94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3R5bGU9Ii0tc2wtaWNvbi1zaXplOiAxZW07Ij48cGF0aCBkPSJNMTIgMTFhMSAxIDAgMCAwLTEgMXY0YTEgMSAwIDAgMCAyIDB2LTRhMSAxIDAgMCAwLTEtMVptLjM4LTMuOTJhMSAxIDAgMCAwLS43NiAwIDEgMSAwIDAgMC0uMzMuMjEgMS4xNSAxLjE1IDAgMCAwLS4yMS4zMyAxIDEgMCAwIDAgLjIxIDEuMDljLjA5Ny4wODguMjA5LjE2LjMzLjIxQTEgMSAwIDAgMCAxMyA4YTEuMDUgMS4wNSAwIDAgMC0uMjktLjcxIDEgMSAwIDAgMC0uMzMtLjIxWk0xMiAyYTEwIDEwIDAgMSAwIDAgMjAgMTAgMTAgMCAwIDAgMC0yMFptMCAxOGE4IDggMCAxIDEgMC0xNi4wMDFBOCA4IDAgMCAxIDEyIDIwWiIgLz48L3N2Zz4=" class="starlight-aside__icon astro-c6vsoqas" /> Nota

<div class="starlight-aside__content">

Different editions may have varying page counts, publishers, and formats. This helps readers find their preferred edition.

</div>

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-216" id="tab-216" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-217" id="tab-217" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-216" aria-labelledby="tab-216" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:37ch"><code>query GetBookEditions {  editions(      where: {book_id: {_eq: 328491}}      order_by: {release_date: desc}  ) {      id      title      isbn_13      pages      release_date      physical_format      publisher {          name      }      language {          language      }      reading_format {          format      }      users_count      rating  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Book Editions</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-217" aria-labelledby="tab-217" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Find Editions by Publisher

Get recent editions from a specific publisher.

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-214" id="tab-214" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-215" id="tab-215" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-214" aria-labelledby="tab-214" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:37ch"><code>query GetPublisherEditions {  editions(      where: {publisher_id: {_eq: 1}}      order_by: {release_date: desc}      limit: 10  ) {      id      title      isbn_13      release_date      physical_format      book {          title          rating          contributions {              author {                  name              }          }      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Publisher Editions</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-215" aria-labelledby="tab-215" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

## Search Editions by Format

Find audiobook editions with specific criteria.

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-212" id="tab-212" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-213" id="tab-213" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Provalo tu stesso</a>

</div>

<div id="tab-panel-212" aria-labelledby="tab-212" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:67ch"><code>query GetAudiobookEditions {  editions(      where: {reading_format_id: {_eq: 2}, audio_seconds: {_gt: 0}}      order_by: {users_count: desc}      limit: 10  ) {      id      title      asin      audio_seconds      publisher {          name      }      cached_contributors      book {          title          rating      }  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Audiobook Editions</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-213" aria-labelledby="tab-213" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Ultimo aggiornamento: 24 giu 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/it/api/graphql/schemas/countries/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">Countries</span> </span></a> <a href="/it/api/graphql/schemas/lists/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">Lists</span> </span></a>

</div>

</div>

</div>

</div>
