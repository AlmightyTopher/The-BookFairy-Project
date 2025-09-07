<div class="astro-bguv2lll" role="main" pagefind-body="" lang="it" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# ISBN e ASIN

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Ultimo Aggiornamento   2 marzo 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

# Lavorare con l’ISBN

L’**International Standard Book Number** (ISBN) di un libro è un numero univoco che aiuta a identificare informazioni sulle opere pubblicate. Hardcover estrarrà automaticamente la maggior parte delle informazioni associate a un ISBN, tuttavia può essere comunque utile sapere come utilizzare un ISBN per recuperare dati su un’edizione che vuoi aggiungere al database.

**Nota:** Alcuni rivenditori potrebbero fare riferimento a un ISBN come *European Article Number* (EAN).

## Anatomia di un ISBN

Un ISBN è composto da 5 blocchi distinti:

| EAN | Gruppo | Editore | Titolo | Cifra di controllo |
|-----|--------|---------|--------|--------------------|
| 978 | 1      | 9747    | 3463   | 4                  |

**EAN**: Quasi sempre 978 o 979.

**Gruppo di registrazione**: Può essere un gruppo di paesi che condividono una lingua, un singolo paese o territorio.

**Editore**: Un numero univoco assegnato a un editore registrato dalla propria agenzia locale o nazionale di registrazione ISBN.

**Elemento Titolo / Pubblicazione**: Un numero univoco assegnato dall’editore che è associato a una specifica edizione di un libro.

**Cifra di controllo**: Un carattere o cifra di checksum, che convalida l’ISBN.

La maggior parte dei blocchi non ha un numero fisso di cifre, rendendo difficile dividere un ISBN nelle sue parti. Tuttavia, gli editori spesso li separano con trattini. Quando aggiungi un ISBN a Hardcover, i trattini vengono rimossi automaticamente.

### Identificare l’editore di un libro

Con l’aiuto dei primi tre blocchi è possibile cercare l’editore di una specifica edizione. L’International ISBN Agency (Agenzia Internazionale ISBN) mantiene un database aggiornato annualmente e consultabile di tutti gli editori registrati: Il <a href="https://grp.isbn-international.org/" target="_blank" rel="noreferrer noopener">Global Register of Publisher</a> (Registro Globale degli Editori). Nell’esempio sopra, l’editore registrato per qualsiasi opera che inizia con `978-1-9747` è `Viz Media, Stati Uniti d'America`.

### Identificare una discrepanza tra `Paese`/`ISBN`

Spesso troverai che Hardcover ha estratto l’informazione errata per il campo `Paese` di un’edizione. Il secondo blocco di un ISBN renderà questo evidente a colpo d’occhio.

| Gruppo | Regione / Area linguistica / Paese |
|--------|------------------------------------|
| 0      | Inglese                            |
| 1      | Inglese                            |
| 2      | Francese                           |
| 3      | Tedesco                            |
| 4      | Giappone                           |
| 5      | Ex URSS                            |
| 6      | Prefissi di lunghezza 2 o 3        |
| 7      | Cina                               |
| 8      | Prefissi di lunghezza 2            |
| 9      | Prefissi di lunghezza 2, 3, 4 o 5  |

*Per un elenco completo, consulta <a href="https://en.wikipedia.org/wiki/List_of_ISBN_registration_groups" target="_blank" rel="noreferrer noopener">Wikipedia</a>*

Se vedi un ISBN `9782820344960` con il `Paese` indicato come `Stati Uniti d'America`, saprai immediatamente che questa edizione necessita di modifiche!

Possiamo anche utilizzare il blocco del gruppo per identificare se un’edizione con un titolo in portoghese è stata pubblicata in Portogallo (972) o in Brasile (85).

## Calcolare ISBN-10 e ISBN-13

I libri pubblicati prima del 2007 molto probabilmente utilizzano un ISBN di dieci cifre. Allo stesso modo, i libri pubblicati dopo il 2007 spesso non hanno un ISBN-10. È possibile calcolare il corrispondente ISBN con uno [strumento online](http://www.hahnlibrary.net/libraries/isbncalc.html).

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9InN0YXJsaWdodC1hc2lkZV9faWNvbiBhc3Ryby1jNnZzb3FhcyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Ym94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3R5bGU9Ii0tc2wtaWNvbi1zaXplOiAxZW07Ij48cGF0aCBkPSJNMTIgMTZhMSAxIDAgMSAwIDAgMiAxIDEgMCAwIDAgMC0yWm0xMC42NyAxLjQ3LTguMDUtMTRhMyAzIDAgMCAwLTUuMjQgMGwtOCAxNEEzIDMgMCAwIDAgMy45NCAyMmgxNi4xMmEzIDMgMCAwIDAgMi42MS00LjUzWm0tMS43MyAyYTEgMSAwIDAgMS0uODguNTFIMy45NGExIDEgMCAwIDEtLjg4LS41MSAxIDEgMCAwIDEgMC0xbDgtMTRhMSAxIDAgMCAxIDEuNzggMGw4LjA1IDE0YTEgMSAwIDAgMSAuMDUgMS4wMnYtLjAyWk0xMiA4YTEgMSAwIDAgMC0xIDF2NGExIDEgMCAwIDAgMiAwVjlhMSAxIDAgMCAwLTEtMVoiIC8+PC9zdmc+" class="starlight-aside__icon astro-c6vsoqas" /> Attenzione

<div class="starlight-aside__content">

Aggiungere o rimuovere semplicemente `978` davanti a un ISBN non produrrà un numero valido! Il blocco di checksum viene calcolato algoritmicamente.

</div>

## Recuperare informazioni su un libro

L’ISBN non codifica informazioni come il titolo o l’autore di un libro. Hardcover estrarrà automaticamente questi campi da vari database. Possiamo verificare questi dati con l’aiuto di alcuni siti web:

- <a href="https://isbnsearch.org" target="_blank" rel="noreferrer noopener">ISBNsearch.org</a>: Controlla rapidamente la rilegatura, la data di pubblicazione e la copertina associata.
- <a href="https://search.worldcat.org/" target="_blank" rel="noreferrer noopener">WorldCat</a>: WorldCat spesso include descrizioni fisiche di un libro, incluso il numero di pagine.
- <a href="https://amazon.com" target="_blank" rel="noreferrer noopener">Amazon</a>: La ricerca di un ISBN restituirà la pagina del prodotto associata al libro. Amazon ha copertine ad alta risoluzione e spesso un elenco completo di informazioni sulla serie.
- <a href="https://books.google.com" target="_blank" rel="noreferrer noopener">Google Libri</a>: Puoi cercare un libro specifico nel database di Google aggiungendo `isbn:` davanti all’ISBN. Esempio: <a href="https://www.google.com/search?udm=36&amp;q=isbn%3A9782820344960" target="_blank" rel="noreferrer noopener"><code dir="auto">isbn:9782820344960</code></a>.

**Attenzione:** Google tende ad auto-tradurre. Il risultato sopra mostra `Band 1` per gli utenti in Germania, ma l’edizione è in realtà francese e dovrebbe essere etichettata come `Tome 1`!

Infine, puoi cercare informazioni direttamente sul sito web di un editore, che spesso presenta i dati più accurati e aggiornati.

### Biblioteche Nazionali

Le biblioteche nazionali hanno il compito di preservare documenti e opere pubblicate nei rispettivi paesi. Ciò le rende una buona fonte di informazioni sulle edizioni internazionali di un libro.

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

### Rivenditori

Anche i rivenditori sono una buona fonte di informazioni, ad esempio:

- <a href="https://www.agapea.com/" target="_blank" rel="noreferrer noopener">Agapea</a> (Spagna)
- <a href="https://www.barnesandnoble.com/" target="_blank" rel="noreferrer noopener">Barnes &amp; Noble</a>, <a href="https://www.powells.com/" target="_blank" rel="noreferrer noopener">Powells</a> (Stati Uniti d’America)
- <a href="https://www.cultura.com/" target="_blank" rel="noreferrer noopener">Cultura</a>, <a href="https://www.fnac.com" target="_blank" rel="noreferrer noopener">fnac</a> (Francia)
- <a href="https://www.thalia.de/" target="_blank" rel="noreferrer noopener">Thalia</a>, <a href="https://www.buecher.de/" target="_blank" rel="noreferrer noopener">Bücher.de</a> (Germania)

## ASIN

Amazon utilizza l’**Amazon Standard Identification Number** (ASIN) per l’identificazione dei prodotti nel loro sistema interno. L’ASIN non è uno standard internazionale. Puoi visualizzare l’ASIN di un libro nella relativa pagina del prodotto sul sito web di Amazon. Il modo più veloce per trovare l’ASIN è guardare l’URL:

`https://www.amazon.com/dp/0143105434`

L’ASIN di solito segue direttamente dopo `dp`. Per *Wuthering Heights* l’ASIN è quindi `0141439556`.

**Nota:** Per i libri stampati, l’ISBN-10 è solitamente lo stesso dell’ASIN.

- <a href="https://addons.mozilla.org/en-US/firefox/addon/asin-collector/" target="_blank" rel="noreferrer noopener">ASIN Collector</a> è un’estensione di Firefox che può estrarre in bulk gli ASIN per tutte le edizioni disponibili di un libro.

### ASIN per gli eBook

Per gli eBook l’ASIN di solito inizia con una `B` ed è elencato sotto *Dettagli del prodotto*.

Ad esempio, l’ASIN per *Wuthering Heights - (Penguin Classics Deluxe Edition)* è `B0768ZM5QH`.

<img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9InN0YXJsaWdodC1hc2lkZV9faWNvbiBhc3Ryby1jNnZzb3FhcyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Ym94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgc3R5bGU9Ii0tc2wtaWNvbi1zaXplOiAxZW07Ij48cGF0aCBkPSJNMTIgMTZhMSAxIDAgMSAwIDAgMiAxIDEgMCAwIDAgMC0yWm0xMC42NyAxLjQ3LTguMDUtMTRhMyAzIDAgMCAwLTUuMjQgMGwtOCAxNEEzIDMgMCAwIDAgMy45NCAyMmgxNi4xMmEzIDMgMCAwIDAgMi42MS00LjUzWm0tMS43MyAyYTEgMSAwIDAgMS0uODguNTFIMy45NGExIDEgMCAwIDEtLjg4LS41MSAxIDEgMCAwIDEgMC0xbDgtMTRhMSAxIDAgMCAxIDEuNzggMGw4LjA1IDE0YTEgMSAwIDAgMSAuMDUgMS4wMnYtLjAyWk0xMiA4YTEgMSAwIDAgMC0xIDF2NGExIDEgMCAwIDAgMiAwVjlhMSAxIDAgMCAwLTEtMVoiIC8+PC9zdmc+" class="starlight-aside__icon astro-c6vsoqas" /> ISBN per gli eBook

<div class="starlight-aside__content">

Non farti ingannare da Amazon: una pagina di prodotto eBook quasi sempre ometterà l’ISBN dell’eBook in favore di un ASIN. Ciò non significa che l’eBook di *Wuthering Heights* sia un’esclusiva Kindle. Puoi trovare l’ISBN associato visitando il sito web dell’editore: l’ISBN dell’eBook di <a href="https://www.penguinrandomhouse.com/books/286389/wuthering-heights-by-emily-bronte/" target="_blank" rel="noreferrer noopener">Wuthering Heights</a> è `9780525505143`.

</div>

## Altri strumenti disponibili

### isbntools

- <a href="https://pypi.org/project/isbntools/" target="_blank" rel="noreferrer noopener">isbntools</a> è un’applicazione CLI Python in grado di recuperare informazioni ISBN da varie fonti. Può anche elaborare più ISBN forniti da un file di testo o anche da altri programmi CLI.

Per favore, consulta la documentazione ufficiale per le istruzioni di installazione. Alcuni comandi utili:

<div class="expressive-code">

<figure class="frame is-terminal not-content">
<pre data-language="bash"><code># Ricerca fuzzy di un ISBN dal titolo (conferma sempre il risultato!)$ isbn_from_words &quot;mistborn final empire&quot;9780765311788
# Restituisce una raccolta di ISBN associati a un libro$ isbn_editions 9780765311788978841314319497841502049909784150204952
# Ottiene informazioni meta di base$ isbn_meta 9780765311788Type:      BOOKTitle:     Mistborn - The Final EmpireAuthor:    Brandon SandersonISBN:      9780765311788Year:      2006Publisher: Macmillan
# Calcola l&#39;ISBN-10$ to_isbn10 9780765311788076531178X
# Divide l&#39;ISBN nei suoi elementi$ isbn_mask 9780765311788978-0-7653-1178-8
# Usa un servizio e un formato di output specifici$ isbn_meta 9780525505143 goob json{&quot;type&quot;: &quot;book&quot;, &quot;title&quot;: &quot;Wuthering Heights - (Penguin Classics Deluxe Edition)&quot;, &quot;author&quot;: [{&quot;name&quot;: &quot;Emily Bronte&quot;}], &quot;year&quot;: &quot;2009&quot;, &quot;identifier&quot;: [{&quot;type&quot;: &quot;ISBN&quot;, &quot;id&quot;: &quot;9780525505143&quot;}], &quot;publisher&quot;: &quot;Penguin&quot;}</code></pre>
<div class="copy">
<div>

</div>
</div>
<figcaption><span class="title"></span><span class="sr-only">Terminal window</span></figcaption>
</figure>

</div>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Ultimo aggiornamento: 2 mar 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/it/librarians/faq" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Indietro<br />
<span class="link-title astro-u2l5gyhi">FAQ Bibliotecari</span> </span></a> <a href="/it/librarians/standards/authorstandards/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Avanti<br />
<span class="link-title astro-u2l5gyhi">Standard per gli autori</span> </span></a>

</div>

</div>

</div>

</div>
