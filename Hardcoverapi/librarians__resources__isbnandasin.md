<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# ISBN and ASIN

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Last Updated   July 27, 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

# Working with ISBN

The **International Standard Book Number** (ISBN) of a book is a unique number which helps identify information about published works. While Hardcover will pull most information associated with an ISBN automatically, it can still be helpful to know how to use an ISBN to retrieve data about an edition you’re intending to add to the database.

**Note:** Some retailers may refer to an ISBN as *European Article Number* (EAN).

## Dissecting an ISBN

An ISBN consists of 5 distinct blocks:

| EAN | Group | Publisher | Title | Check digit |
|-----|-------|-----------|-------|-------------|
| 978 | 1     | 9747      | 3463  | 4           |

**EAN Prefix**: Almost always 978 or 979.

**Registration Group**: Either a language-sharing country group, individual country or territory.

**Publisher**: A unique number issued to a registered publisher by their local or national ISBN registration agency.

**Title / Publication Element**: A unique number assigned by the publisher which is associated with a specific edition of a book.

**Check digit**: A checksum character or digit, validating the ISBN.

Most blocks do not have a fixed number of digits, making it difficult to split an ISBN into its parts. However, publishers often separate them with hyphens. When you add an ISBN to Hardcover, the hyphens are automatically removed.

### Identifying the publisher of a book

With the help of the first three blocks it is possible to look up the publisher of a specific edition. The International ISBN Agency maintains an annually updated and searchable database of all registered publishers: The <a href="https://grp.isbn-international.org/" target="_blank" rel="noreferrer noopener">Global Register of Publishers</a>. In the example above the registered publisher for any works starting with `978-1-9747` is `Viz Media, United States of America`.

### Identifying a `Country`/`ISBN` mismatch

You will often find that Hardcover has pulled the wrong information for the `Country` field of an edition. The second block of an ISBN will make that obvious at a glance.

| Group | Region / Language Area / Country |
|-------|----------------------------------|
| 0     | English                          |
| 1     | English                          |
| 2     | French                           |
| 3     | German                           |
| 4     | Japan                            |
| 5     | Former USSR                      |
| 6     | Prefixes of length 2 or 3        |
| 7     | China                            |
| 8     | Prefixes of length 2             |
| 9     | Prefixes of length 2, 3, 4 or 5  |

*For a complete list, refer to <a href="https://en.wikipedia.org/wiki/List_of_ISBN_registration_groups" target="_blank" rel="noreferrer noopener">Wikipedia</a>*

If you see ISBN `9782820344960` with the `Country` listed as `United States of America` you will immediately know that this edition needs editing!

We can also use the group block to identify whether an edition with a Portuguese title was published in Portugal (972) or Brazil (85).

## Calculating ISBN-10 and ISBN-13

Books published before 2007 will most likely use a ten-digit long ISBN. Similarly, books published after 2007 often lack an ISBN-10. You can calculate the corresponding ISBN with an [online tool](http://www.hahnlibrary.net/libraries/isbncalc.html) ([alternate](https://isbn.co.in/check-digit/)).

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9InN0YXJsaWdodC1hc2lkZV9faWNvbiBhc3Ryby1jNnZzb3FhcyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Ym94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3R5bGU9Ii0tc2wtaWNvbi1zaXplOiAxZW07Ij48cGF0aCBkPSJNMTIgMTZhMSAxIDAgMSAwIDAgMiAxIDEgMCAwIDAgMC0yWm0xMC42NyAxLjQ3LTguMDUtMTRhMyAzIDAgMCAwLTUuMjQgMGwtOCAxNEEzIDMgMCAwIDAgMy45NCAyMmgxNi4xMmEzIDMgMCAwIDAgMi42MS00LjUzWm0tMS43MyAyYTEgMSAwIDAgMS0uODguNTFIMy45NGExIDEgMCAwIDEtLjg4LS41MSAxIDEgMCAwIDEgMC0xbDgtMTRhMSAxIDAgMCAxIDEuNzggMGw4LjA1IDE0YTEgMSAwIDAgMSAuMDUgMS4wMnYtLjAyWk0xMiA4YTEgMSAwIDAgMC0xIDF2NGExIDEgMCAwIDAgMiAwVjlhMSAxIDAgMCAwLTEtMVoiIC8+PC9zdmc+" class="starlight-aside__icon astro-c6vsoqas" /> Caution

<div class="starlight-aside__content">

Simply adding or removing `978` in front of an ISBN will not result in a valid number! The checksum block is algorithmically calculated.

</div>

## Retrieving information about a book

The ISBN does not encode information such as title or author of a book. Hardcover will pull these fields from various databases automatically. We can verify this data with the help of a few websites:

- <a href="https://isbnsearch.org" target="_blank" rel="noreferrer noopener">ISBNsearch.org</a>: Quickly check the binding, publication date and associated cover.
- <a href="https://search.worldcat.org/" target="_blank" rel="noreferrer noopener">WorldCat</a>: WorldCat will often include physical descriptions of a book, including the page count.
- <a href="https://amazon.com" target="_blank" rel="noreferrer noopener">Amazon</a>: Searching for an ISBN will return the product page associated with the book. Amazon has high resolution covers and often a complete list of series information.
- <a href="https://books.google.com" target="_blank" rel="noreferrer noopener">Google Books</a>: You can search through Google’s database for a specific book by appending `isbn:` in front of the ISBN. Example: <a href="https://www.google.com/search?udm=36&amp;q=isbn%3A9782820344960" target="_blank" rel="noreferrer noopener"><code dir="auto">isbn:9782820344960</code></a>.

**Careful:** Google tends to auto-translate. The result above shows `Band 1` for users in Germany, but the edition is actually from France and should be labeled as `Tome 1`!

Finally, you can look up information directly on a publisher’s website, which will often feature the most accurate and up-to-date data.

### National Libraries

National libraries are tasked with the preservation of documents and works published in their respective countries. This makes them a good source of information about international editions of a book.

| Country | Website |
|----|----|
| 🇦🇺 AU | <a href="https://www.library.gov.au/" target="_blank" rel="noreferrer noopener">National Library of Australia</a> |
| 🇨🇦 CA | <a href="https://library-archives.canada.ca/eng/" target="_blank" rel="noreferrer noopener">Library and Archives Canada</a> |
| 🇨🇳 CN | <a href="https://www.nlc.cn/" target="_blank" rel="noreferrer noopener">中国国家图书馆</a> |
| 🇫🇷 FR | <a href="https://catalogue.bnf.fr" target="_blank" rel="noreferrer noopener">BnF Catalogue Général</a> |
| 🇩🇪 DE | <a href="https://katalog.dnb.de/DE/home.html?v=plist" target="_blank" rel="noreferrer noopener">Deutsche National Bibliothek</a> |
| 🇬🇧 GB | <a href="https://bll01.primo.exlibrisgroup.com/discovery/search?vid=44BL_INST:BLL01&amp;lang=en" target="_blank" rel="noreferrer noopener">British Library</a> |
| 🇯🇵 JP | <a href="https://www.ndl.go.jp/en/" target="_blank" rel="noreferrer noopener">国立国会図書館</a> |
| 🇳🇱 NL | <a href="https://www.kb.nl/en/research-find" target="_blank" rel="noreferrer noopener">Koninklijke Bibliotheek</a> |
| 🇵🇱 PL | <a href="https://www.bn.org.pl/en" target="_blank" rel="noreferrer noopener">Biblioteka Narodowa</a> |
| 🇵🇹 PT | <a href="https://urn.porbase.org" target="_blank" rel="noreferrer noopener">PORBASE Catalogue</a> |
| 🇨🇭 CH | <a href="https://www.helveticat.ch" target="_blank" rel="noreferrer noopener">Schweizerische Nationalbibliothek</a> |
| 🇪🇸 ES | <a href="https://www.cultura.gob.es/en/cultura/libro/isbn.html" target="_blank" rel="noreferrer noopener">Ministerio de Cultura de España</a> |
| 🇮🇹 IT | <a href="https://opac.sbn.it/" target="_blank" rel="noreferrer noopener">Servizio Bibliotecario Nazionale</a> |
| 🇺🇸 US | <a href="https://www.loc.gov/" target="_blank" rel="noreferrer noopener">Library of Congress</a> |

### Retailers

Retailers are also a good source for information, for example:

- <a href="https://www.agapea.com/" target="_blank" rel="noreferrer noopener">Agapea</a> (Spain)
- <a href="https://www.barnesandnoble.com/" target="_blank" rel="noreferrer noopener">Barnes &amp; Noble</a>, <a href="https://www.powells.com/" target="_blank" rel="noreferrer noopener">Powells</a> (United States of America)
- <a href="https://www.cultura.com/" target="_blank" rel="noreferrer noopener">Cultura</a>, <a href="https://www.fnac.com" target="_blank" rel="noreferrer noopener">fnac</a> (France)
- <a href="https://www.thalia.de/" target="_blank" rel="noreferrer noopener">Thalia</a>, <a href="https://www.buecher.de/" target="_blank" rel="noreferrer noopener">Bücher.de</a> (Germany)

## ASIN

Amazon uses the **Amazon Standard Identification Number** (ASIN) for product identification within their internal system. ASIN is not an international standard. You can view the ASIN of a book on the associated product page on Amazon’s website. The quickest way to find the ASIN is to look at the URL:

`https://www.amazon.com/dp/0143105434`

The ASIN usually follows directly after `dp`. For *Wuthering Heights* the ASIN is thus `0141439556`.

**Note:** For printed books, the ISBN-10 is usually the same as the ASIN.

- <a href="https://addons.mozilla.org/en-US/firefox/addon/asin-collector/" target="_blank" rel="noreferrer noopener">ASIN Collector</a> is a Firefox extension that can bulk-extract ASIN’s for all available editions of a book.

### eBook ASIN

For eBooks the ASIN usually starts with a `B` and is listed under *Product details*.

For example, the ASIN for *Wuthering Heights - (Penguin Classics Deluxe Edition)* is `B0768ZM5QH`.

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9InN0YXJsaWdodC1hc2lkZV9faWNvbiBhc3Ryby1jNnZzb3FhcyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Ym94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3R5bGU9Ii0tc2wtaWNvbi1zaXplOiAxZW07Ij48cGF0aCBkPSJNMTIgMTZhMSAxIDAgMSAwIDAgMiAxIDEgMCAwIDAgMC0yWm0xMC42NyAxLjQ3LTguMDUtMTRhMyAzIDAgMCAwLTUuMjQgMGwtOCAxNEEzIDMgMCAwIDAgMy45NCAyMmgxNi4xMmEzIDMgMCAwIDAgMi42MS00LjUzWm0tMS43MyAyYTEgMSAwIDAgMS0uODguNTFIMy45NGExIDEgMCAwIDEtLjg4LS41MSAxIDEgMCAwIDEgMC0xbDgtMTRhMSAxIDAgMCAxIDEuNzggMGw4LjA1IDE0YTEgMSAwIDAgMSAuMDUgMS4wMnYtLjAyWk0xMiA4YTEgMSAwIDAgMC0xIDF2NGExIDEgMCAwIDAgMiAwVjlhMSAxIDAgMCAwLTEtMVoiIC8+PC9zdmc+" class="starlight-aside__icon astro-c6vsoqas" /> eBook ISBN

<div class="starlight-aside__content">

Don’t get tricked by Amazon: An eBook product page will almost always omit the ISBN of an eBook in favor of an ASIN. That doesn’t mean that the eBook of *Wuthering Heights* is Kindle-exclusive. You can find the associated ISBN by visiting the publisher’s website: <a href="https://www.penguinrandomhouse.com/books/286389/wuthering-heights-by-emily-bronte/" target="_blank" rel="noreferrer noopener">Wuthering Heights</a>’ eBook ISBN is `9780525505143`.

</div>

## Other available tools

### isbntools

- <a href="https://pypi.org/project/isbntools/" target="_blank" rel="noreferrer noopener">isbntools</a> is a python CLI application capable of retrieving ISBN information from various sources. It can also process multiple ISBN provided by a text-file or even other CLI programs.

Please refer to the official documentation for install instructions. Some useful commands:

<div class="expressive-code">

<figure class="frame is-terminal not-content">
<pre data-language="bash"><code># Fuzzy find an ISBN from the title (always confirm the result!)$ isbn_from_words &quot;mistborn final empire&quot;9780765311788
# Return a collection of ISBN&#39;s associated with a book$ isbn_editions 9780765311788978841314319497841502049909784150204952
# Get basic meta information$ isbn_meta 9780765311788Type:      BOOKTitle:     Mistborn - The Final EmpireAuthor:    Brandon SandersonISBN:      9780765311788Year:      2006Publisher: Macmillan
# Calculate ISBN-10$ to_isbn10 9780765311788076531178X
# Split ISBN into its elements$ isbn_mask 9780765311788978-0-7653-1178-8
# Use a specific service and output-format$ isbn_meta 9780525505143 goob json{&quot;type&quot;: &quot;book&quot;, &quot;title&quot;: &quot;Wuthering Heights - (Penguin Classics Deluxe Edition)&quot;, &quot;author&quot;: [{&quot;name&quot;: &quot;Emily Bronte&quot;}], &quot;year&quot;: &quot;2009&quot;, &quot;identifier&quot;: [{&quot;type&quot;: &quot;ISBN&quot;, &quot;id&quot;: &quot;9780525505143&quot;}], &quot;publisher&quot;: &quot;Penguin&quot;}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title"></span><span class="sr-only">Terminal window</span></figcaption>
</figure>

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Last updated: Jul 27, 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/librarians/faq" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Previous<br />
<span class="link-title astro-u2l5gyhi">Librarian FAQ</span> </span></a> <a href="/librarians/standards/authorstandards/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Next<br />
<span class="link-title astro-u2l5gyhi">Author Standards</span> </span></a>

</div>

</div>

</div>

</div>
