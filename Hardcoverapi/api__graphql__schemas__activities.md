<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Activities

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Last Updated   October 7, 2024

<span class="sl-badge note small w-fit astro-avdet4wd">Reference</span>

</div>

## What Is an Activity?

Activities are actions that users perform on the platform. These actions include things like liking a book, following a user, or adding a book to a shelf. Activities are used to show what users are doing on the platform and to help users discover new content.

## Types of Activities

There are many types of activities that can be performed on the platform. Some examples of activities include:

- A user adds a book to a shelf
- A user creates a list
- A user adds a book to a list
- A user reviews a book
- A user marks a book as read
- A user answers a prompt

See some [example payloads below](#example-payloads) for more information on the different types of activities.

## Activity Schema

The activity schema contains the following fields:

### Fields

| Field | Type | Description |
|----|----|----|
| [book](../books) | Relation | The book details of the activity |
| book_id | String | The unique identifier of the book that the activity is related to |
| created_at | String | The timestamp of when the activity occurred. |
| [data](#example-payloads) | Object | The payload of the activity |
| [event](#event-types) | String | The type of activity |
| [followers](../users) | Relation | List of users who have followed this activity |
| id | Int | The unique identifier of the activity |
| [likes](../users) | Relation | List of users who have liked this activity |
| likes_count | Number | The number of users who have liked this activity |
| object_type | String | ’Activity’ |
| [user](../users) | Relation | User object for the user who performed the activity |
| user_id | String | The unique identifier of the user who performed the activity |

### Related Schemas

These schemas use the same fields as the activities schema, and are used to help filter and query the activities.

- activity_feed
- activity_foryou_feed

### Event Types

- GoalActivity
- ListActivity
- PromptActivity
- UserBookActivity

### Example Payloads

#### User Added a Rating to a Book

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre data-language="graphql"><code>    {      &quot;id&quot;: 3,      &quot;event&quot;: &quot;UserBookActivity&quot;,      &quot;data&quot;: {        &quot;userBook&quot;: {          &quot;rating&quot;: &quot;4.5&quot;,          &quot;review&quot;: null,          &quot;statusId&quot;: 3,          &quot;readingFormatId&quot;: 1,          &quot;reviewHasSpoilers&quot;: false        }      },      &quot;book_id&quot;: 10257,      &quot;object_type&quot;: &quot;Activity&quot;    }</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">User Book Activity</span></figcaption>
</figure>

</div>

#### User Started Reading a Book

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre data-language="graphql"><code>    {      &quot;id&quot;: 4,      &quot;event&quot;: &quot;UserBookActivity&quot;,      &quot;data&quot;: {        &quot;userBook&quot;: {          &quot;rating&quot;: null,          &quot;review&quot;: &quot;&quot;,          &quot;statusId&quot;: 1,          &quot;readingFormatId&quot;: 1,          &quot;reviewHasSpoilers&quot;: false        }      },      &quot;book_id&quot;: 10257,      &quot;object_type&quot;: &quot;Activity&quot;    }</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">User Started Reading</span></figcaption>
</figure>

</div>

#### User Added a Review to a Book

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre data-language="graphql"><code>  {      &quot;id&quot;: 1234,      &quot;event&quot;: &quot;UserBookActivity&quot;,      &quot;data&quot;: {        &quot;userBook&quot;: {          &quot;rating&quot;: &quot;4.5&quot;,          &quot;review&quot;: &quot;This is a great book!&quot;,          &quot;statusId&quot;: 3,          &quot;readingFormatId&quot;: 1,          &quot;reviewHasSpoilers&quot;: false        }      },      &quot;book_id&quot;: 10257,      &quot;object_type&quot;: &quot;Activity&quot;    }  }</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">User Added Review</span></figcaption>
</figure>

</div>

#### Goal Activity

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre data-language="graphql"><code>  {      &quot;data&quot;: {        &quot;goal&quot;: {          &quot;id&quot;: 12345,          &quot;goal&quot;: 40,          &quot;metric&quot;: &quot;book&quot;,          &quot;endDate&quot;: &quot;2024-12-31&quot;,          &quot;progress&quot;: 30,          &quot;startDate&quot;: &quot;2024-01-01&quot;,          &quot;conditions&quot;: {},          &quot;description&quot;: &quot;2024 Reading Goal&quot;,          &quot;percentComplete&quot;: 0.75,          &quot;privacySettingId&quot;: 1        }      },      &quot;event&quot;: &quot;GoalActivity&quot;,      &quot;object_type&quot;: &quot;Activity&quot;   },  }</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Goal Activity</span></figcaption>
</figure>

</div>

#### List Activity

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre data-language="graphql"><code>    {      &quot;data&quot;: {        &quot;list&quot;: {          &quot;id&quot;: 1234,          &quot;url&quot;: null,          &quot;name&quot;: &quot;Owned&quot;,          &quot;path&quot;: &quot;@user/lists/owned&quot;,          &quot;ranked&quot;: false,          &quot;featured&quot;: false,          &quot;listBooks&quot;: [            {              &quot;book&quot;: ... See Book schema,              &quot;position&quot;: null,              &quot;updatedAt&quot;: &quot;2024-09-23T23:58:14.027Z&quot;            }          ],          &quot;updatedAt&quot;: &quot;2024-09-23T23:58:14.040Z&quot;,          &quot;booksCount&quot;: 1,          &quot;description&quot;: &quot;Any editions of books you&#39;ve marked as &#39;owned&#39; will show up in this list.&quot;,          &quot;followersCount&quot;: 0,          &quot;privacySettingId&quot;: 1        }      },    },    &quot;event&quot;: &quot;ListActivity&quot;,    &quot;object_type&quot;: &quot;Activity&quot;,    &quot;book_id&quot;: 1108457  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">List Activity</span></figcaption>
</figure>

</div>

#### Prompt Activity

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre data-language="graphql"><code>  {      &quot;data&quot;: {        &quot;prompt&quot;: {          &quot;id&quot;: 1,          &quot;slug&quot;: &quot;what-are-your-favorite-books-of-all-time&quot;,          &quot;user&quot;: {              ... See User schema          },          &quot;answers&quot;: [{              &quot;book&quot;: ... See Book schema            }          ],          &quot;question&quot;: &quot;What are your favorite books of all time?&quot;,          &quot;description&quot;: &quot;What are some of your favorites? These can be from any time of your life.&quot;        }      },      &quot;event&quot;: &quot;PromptActivity&quot;,      &quot;object_type&quot;: &quot;Activity&quot;,      &quot;book_id&quot;: 370893  }</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Prompt Activity</span></figcaption>
</figure>

</div>

## Example Queries

Let’s take a look at some example queries that you can use to interact with the activities’ schema.

### Get My Activities

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-36" id="tab-36" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-37" id="tab-37" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Try it yourself</a>

</div>

<div id="tab-panel-36" aria-labelledby="tab-36" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:63ch"><code>{  activities(where: {user_id: {_eq: ##USER_ID##}}, limit: 10) {      event      likes_count      book_id      created_at  }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">My Activities</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-37" aria-labelledby="tab-37" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

### Get Activities for a Specific Book

<div class="tablist-wrapper not-content astro-esqgolmp">

- <a href="#tab-panel-38" id="tab-38" class="astro-esqgolmp" role="tab" aria-selected="true" tabindex="0"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik05IDEwaDFhMSAxIDAgMSAwIDAtMkg5YTEgMSAwIDAgMCAwIDJabTAgMmExIDEgMCAwIDAgMCAyaDZhMSAxIDAgMCAwIDAtMkg5Wm0xMS0zLjA2YTEuMyAxLjMgMCAwIDAtLjA2LS4yN3YtLjA5Yy0uMDUtLjEtLjExLS4yLS4xOS0uMjhsLTYtNmExLjA3IDEuMDcgMCAwIDAtLjI4LS4xOWgtLjA5YS44OC44OCAwIDAgMC0uMzMtLjExSDdhMyAzIDAgMCAwLTMgM3YxNGEzIDMgMCAwIDAgMyAzaDEwYTMgMyAwIDAgMCAzLTNWOC45NFptLTYtMy41M0wxNi41OSA4SDE1YTEgMSAwIDAgMS0xLTFWNS40MVpNMTggMTlhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTFWNWExIDEgMCAwIDEgMS0xaDV2M2EzIDMgMCAwIDAgMyAzaDN2OVptLTMtM0g5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-esqgolmp astro-c6vsoqas" /> Query</a>
- <a href="#tab-panel-39" id="tab-39" class="astro-esqgolmp" role="tab" aria-selected="false" tabindex="-1"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLWVzcWdvbG1wIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDFlbTsiPjxwYXRoIGQ9Ik0yMS4zMzcgMTQuOTU4TDIxLjMzNyAxNC45NThRMjEuMjY5IDE0Ljk1OCAyMS4yMDEgMTQuODkwTDIxLjIwMSAxNC44OTBRMjAuOTYzIDE0Ljc1NCAyMC43OTMgMTQuNzU0TDIwLjc5MyAxNC43NTRMMjAuNzkzIDkuMjQ2UTIxLjEzMyA5LjI0NiAyMS4zMzcgOS4wNDJMMjEuMzM3IDkuMDQyUTIyLjA4NSA4LjYwMCAyMi4zMjMgNy43NjdRMjIuNTYxIDYuOTM0IDIyLjExOSA2LjE2OVEyMS42NzcgNS40MDQgMjAuODI3IDUuMTgzUTE5Ljk3NyA0Ljk2MiAxOS4yMjkgNS40MDRMMTkuMjI5IDUuNDA0UTE4LjkyMyA1LjU0MCAxOC43ODcgNS44NDZMMTguNzg3IDUuODQ2TDEzLjk5MyAzLjA5MlExMy45OTMgMi44ODggMTQuMDYxIDIuNzE4UTE0LjEyOSAyLjU0OCAxNC4wOTUgMi40NDZMMTQuMDk1IDIuNDQ2UTE0LjEyOSAxLjU2MiAxMy41MDAgMC45MzNRMTIuODcxIDAuMzA0IDExLjk4NyAwLjMwNFExMS4xMDMgMC4zMDQgMTAuNDkxIDAuOTMzUTkuODc5IDEuNTYyIDkuODc5IDIuNDQ2TDkuODc5IDIuNDQ2UTkuODc5IDIuODU0IDkuOTgxIDMuMDkyTDkuOTgxIDMuMDkyTDUuMTg3IDUuODQ2UTUuMTE5IDUuNjc2IDQuODgxIDUuNTA2TDQuODgxIDUuNTA2TDQuNzc5IDUuNDA0UTMuOTk3IDQuOTYyIDMuMTQ3IDUuMTgzUTIuMjk3IDUuNDA0IDEuODg5IDYuMTM1UTEuNDgxIDYuODY2IDEuNzAyIDcuNjk5UTEuOTIzIDguNTMyIDIuNjM3IDkuMDQyTDIuNjM3IDkuMDQyTDIuNzczIDkuMTEwUTMuMDExIDkuMjQ2IDMuMTgxIDkuMjQ2TDMuMTgxIDkuMjQ2TDMuMTgxIDE0Ljc1NFEyLjg0MSAxNC43NTQgMi42MzcgMTQuOTkyTDIuNjM3IDE0Ljk5MlExLjg4OSAxNS40MDAgMS42NTEgMTYuMjMzUTEuNDEzIDE3LjA2NiAxLjg1NSAxNy44MzFRMi4yOTcgMTguNTk2IDMuMTQ3IDE4LjgxN1EzLjk5NyAxOS4wMzggNC43NzkgMTguNTk2TDQuNzc5IDE4LjU5NlE1LjA1MSAxOC40NjAgNS4xODcgMTguMTU0TDUuMTg3IDE4LjE1NEw5Ljk4MSAyMC45NDJROS45ODEgMjEuMTEyIDkuOTMwIDIxLjI4MlE5Ljg3OSAyMS40NTIgOS44NDUgMjEuNTU0TDkuODQ1IDIxLjU1NFE5Ljg3OSAyMi40MzggMTAuNDkxIDIzLjA2N1ExMS4xMDMgMjMuNjk2IDExLjk4NyAyMy42OTZRMTIuODcxIDIzLjY5NiAxMy41MDAgMjMuMDY3UTE0LjEyOSAyMi40MzggMTQuMTI5IDIxLjU1NEwxNC4xMjkgMjEuNTU0UTE0LjEyOSAyMS4xNDYgMTMuOTkzIDIwLjk0MkwxMy45OTMgMjAuOTQyTDE4Ljc4NyAxOC4xNTRRMTguODg5IDE4LjM5MiAxOS4zMzEgMTguNTk2TDE5LjMzMSAxOC41OTZRMjAuMDQ1IDE5LjAwNCAyMC44NzggMTguNzgzUTIxLjcxMSAxOC41NjIgMjIuMTg3IDE3Ljg0OEwyMi4xODcgMTcuODQ4UTIyLjU5NSAxNy4xMzQgMjIuMzIzIDE2LjMwMVEyMi4wNTEgMTUuNDY4IDIxLjMzNyAxNC45NThaTTE4LjI0MyAxNi4zNTJMNS43MzEgMTYuMzUyUTUuNzMxIDE2LjA0NiA1LjQ5MyAxNS44MDhMNS40OTMgMTUuODA4UTUuMzkxIDE1LjYwNCA1LjE4NyAxNS40MDBMNS4xODcgMTUuNDAwTDExLjQ0MyA0LjQ1MlExMS41NzkgNC40NTIgMTEuODE3IDQuNTIwTDExLjgxNyA0LjUyMEwxMS45ODcgNC41NTRRMTIuNDI5IDQuNTU0IDEyLjUzMSA0LjQ1MkwxMi41MzEgNC40NTJMMTguNzg3IDE1LjQwMFExOC40ODEgMTUuNzA2IDE4LjQ4MSAxNS44MDhMMTguNDgxIDE1LjgwOEwxOC4zNzkgMTUuOTc4UTE4LjI0MyAxNi4yMTYgMTguMjQzIDE2LjM1MkwxOC4yNDMgMTYuMzUyWk0xMy41ODUgMy44MDZMMTguMjQzIDYuNTk0UTE4LjA3MyA3LjUxMiAxOC40ODEgOC4xNThMMTguNDgxIDguMTU4UTE4Ljk1NyA4Ljk3NCAxOS43MzkgOS4xNDRMMTkuNzM5IDkuMTQ0TDE5LjczOSAxNC42NTJMMTkuNjM3IDE0LjY1MkwxMy40ODMgMy45MDhMMTMuNTg1IDMuODA2Wk01LjYyOSA2LjY5NkwxMC40OTEgMy44MDZRMTAuNDkxIDMuODQwIDEwLjQ5MSAzLjg3NEwxMC40OTEgMy44NzRMMTAuNDkxIDMuODA2TDQuMjM1IDE0Ljc1NEw0LjEzMyAxNC43NTRMNC4xMzMgOS4yNDZRNC45MTUgOS4wNzYgNS4zOTEgOC4yOTRMNS4zOTEgOC4yOTRRNS43OTkgNy42MTQgNS42MjkgNi42OTZMNS42MjkgNi42OTZaTTE4LjI0MyAxNy40MDZMMTMuNDgzIDIwLjE5NFExMi44MzcgMTkuNTQ4IDExLjk4NyAxOS41NDhMMTEuOTg3IDE5LjU0OFExMC45NjcgMTkuNTQ4IDEwLjQ5MSAyMC4xOTRMMTAuNDkxIDIwLjE5NEw1LjczMSAxNy40MDZMNS43MzEgMTcuMzA0TDE4LjI0MyAxNy4zMDRMMTguMjQzIDE3LjQwNloiIC8+PC9zdmc+" class="astro-esqgolmp astro-c6vsoqas" /> Try it yourself</a>

</div>

<div id="tab-panel-38" aria-labelledby="tab-38" role="tabpanel">

<div class="expressive-code">

<figure class="frame has-title not-content">
<pre class="wrap" data-language="graphql" style="--ecMaxLine:74ch"><code>{    activities(          order_by: {created_at: desc}          where: {book_id: {_eq: 10257}, event: {_eq: &quot;UserBookActivity&quot;}}          limit: 10    ) {          data          event          object_type          book_id    }}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title">Book Specific Activities</span></figcaption>
</figure>

</div>

</div>

<div id="tab-panel-39" aria-labelledby="tab-39" role="tabpanel" tabindex="0" hidden="">

<div class="not-content">

</div>

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Last updated: Oct 7, 2024

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/api/guides/searching/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Previous<br />
<span class="link-title astro-u2l5gyhi">Searching for Content in the API</span> </span></a> <a href="/api/graphql/schemas/authors/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Next<br />
<span class="link-title astro-u2l5gyhi">Authors</span> </span></a>

</div>

</div>

</div>

</div>
