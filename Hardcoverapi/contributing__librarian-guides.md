<div class="astro-bguv2lll" role="main" pagefind-body="" lang="en" dir="ltr">

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

# Librarian Contribution Guide

</div>

</div>

<div class="content-panel astro-7nkwcw3z">

<div class="sl-container astro-7nkwcw3z">

<div class="sl-markdown-content">

<div class="flex flex-auto flex-row justify-between mb-4">

Last Updated   March 31, 2025

<span class="sl-badge note small w-fit astro-avdet4wd">Guide</span>

</div>

# Librarian Contribution Guide

## Ways to Contribute

We are currently looking for contributions in the following areas:

- API Documentation: Help us improve the API documentation by adding new pages or updating existing content.
- API Guides: Share your knowledge by writing guides on how to use the Hardcover API.
- Bug Fixes: Help us fix bugs in the documentation site.
- Reporting Issues: Report any issues you encounter with the documentation site. <a href="https://github.com/hardcoverapp/hardcover-docs/issues/new?assignees=&amp;labels=&amp;projects=&amp;template=bug_report.md&amp;title=" target="_blank" rel="noreferrer noopener">Create Issue</a>
- Feature Requests: Share your ideas for new features or improvements to the documentation site. <a href="https://github.com/hardcoverapp/hardcover-docs/issues/new?assignees=&amp;labels=&amp;projects=&amp;template=feature_request.md&amp;title=" target="_blank" rel="noreferrer noopener">Suggest Feature</a>
- Librarian Guides: Share your expertise by writing guides on how to use the Librarian tools.

## Finding Something to Work On

You can find issues to work on by looking at the <a href="https://github.com/hardcoverapp/hardcover-docs/issues" target="_blank" rel="noreferrer noopener">Issues Board</a> on GitHub or by joining the <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Hardcover Discord</a> and asking for suggestions in the <a href="https://discord.com/channels/835558721115389962/1278040045324075050" target="_blank" rel="noreferrer noopener">#API</a> or <a href="https://discord.com/channels/835558721115389962/1105918193022812282" target="_blank" rel="noreferrer noopener">#librarians</a> channels.

## Being a Good Contributor

When contributing to Hardcover, please follow these guidelines:

- Be respectful of others and their contributions.
- Be open to feedback and willing to make changes based on feedback.
- Be patient and understanding of the time it takes to review and merge contributions.
- Be clear and concise in your contributions.
- Be willing to help others and answer questions.
- Be willing to work with others to improve the documentation site.
- Be open to learning and growing as a contributor.
- Be willing to follow the contribution processes.
- Be willing to accept that not all contributions will be accepted.

## How Do I Add a New Page or Update an Existing Page?

### Adding a New Page

1.  Navigate to the <a href="https://github.com/hardcoverapp/hardcover-docs/" target="_blank" rel="noreferrer noopener">Hardcover Docs GitHub</a>
2.  Navigate to the `src/content/docs/` directory.
3.  Navigate to the appropriate subdirectory for the page you want to add.
4.  Click the “Add file” button near the top right of the file list.
5.  Click the “Create new file” option.
6.  In the editor that opens, give the new file a meaningful name ending in `.mdx`, see the existing files for examples.
7.  Add the [frontmatter](#page-frontmatter) to the new page using the template below.
8.  Provide the content for the new page using [Markdown](https://www.markdownguide.org/cheat-sheet/) or [MDX](https://mdxjs.com/guides/) syntax.
9.  Preview your changes for formatting and accuracy.
10. Click the “Commit changes…” button at the top of the page.
11. In the dialog that opens, provide a title and description for your changes.
12. Ensure the “Create a new branch for this commit and start a pull request” option is selected.
13. Give your branch a short, descriptive name.
14. Click the “Propose changes” button to save your changes.
15. Notify the Hardcover team, namely `@revelry` in the <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Hardcover Discord</a> that you have submitted a pull request.
16. Wait for feedback and review from the Hardcover team.
17. Make any requested changes.
18. Once your pull request is approved, it will be merged into the main branch.
19. Celebrate your contribution!
20. Continue contributing to Hardcover!

### Editing an Existing Page

1.  Using the UI navigate to the page, you want to edit.
2.  Click the “Edit page” button near the bottom of the content.
3.  In the GitHub page that opens, click the pencil icon on the top right of the file to start editing.
4.  Make your changes in the editor using [Markdown](https://www.markdownguide.org/cheat-sheet/) or [MDX](https://mdxjs.com/guides/) syntax.
5.  Update the [frontmatter](#page-frontmatter) as needed using the template below, make sure to update the `lastUpdated` field.
6.  Preview your changes for formatting and accuracy.
7.  Click the “Commit changes…” button at the top of the page.
8.  In the dialog that opens, provide a title and description for your changes.
9.  Ensure the “Create a new branch for this commit and start a pull request” option is selected.
10. Give your branch a short, descriptive name.
11. Click the “Propose changes” button to save your changes.
12. Notify the Hardcover team, namely `@revelry` in the <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Hardcover Discord</a> that you have submitted a pull request.
13. Wait for feedback and review from the Hardcover team.
14. Make any requested changes.
15. Once your pull request is approved, it will be merged into the main branch.
16. Celebrate your contribution!
17. Continue contributing to Hardcover!

## Adding Images

Currently, images have to be added as a separate pull request. To add an image:

1.  Navigate to the <a href="https://github.com/hardcoverapp/hardcover-docs/" target="_blank" rel="noreferrer noopener">Hardcover Docs Github</a>
2.  Navigate to the `public/images/` directory.
3.  Navigate to the appropriate subdirectory `api` or `librarians` depending on where the image will be used.
4.  Click the “Add file” button near the top right of the file list.
5.  Click the “Upload files” option.
6.  Drag and drop the image file(s) into the upload area.
7.  In the Commit changes section, provide a title and description for your changes.
8.  Ensure the “Create a new branch for this commit and start a pull request” option is selected.
9.  Give your branch a short, descriptive name.
10. Click the “Propose changes” button to save your changes.
11. Notify the Hardcover team, namely `@revelry` in the <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Hardcover Discord</a> that you have submitted a pull request.
12. Wait for feedback and review from the Hardcover team.
13. Make any requested changes.
14. Once your pull request is approved, it will be merged into the main branch.
15. After the image is merged, follow the steps in the [Editing an Existing Page](#editing-an-existing-page) section to add the image to and reference it using the relative path: `/images/subdirectory/your-image.png`.

<div class="expressive-code">

<figure class="frame not-content">
<pre data-language="md"><code>&lt;img src=&quot;/images/librarians/long-title-example.png&quot; alt=&quot;Example of a long title on Hardcover&quot; /&gt;</code></pre>
<div class="copy">
<div>

</div>
</div>
</figure>

</div>

## Page Frontmatter

Moved to [Frontmatter](../frontmatter)

## Available Components

Moved to [Astro Components](../astro-components) for Astro components and [React Components](../react-components) for React components.

## Translation Support

While we currently only support English, we are open to adding translations in the future. If you are interested in contributing translations, please reach out to the Hardcover team in the <a href="https://discord.com/channels/835558721115389962/1278040045324075050" target="_blank" rel="noreferrer noopener">#API</a> or <a href="https://discord.com/channels/835558721115389962/1105918193022812282" target="_blank" rel="noreferrer noopener">#librarians</a> channels on the <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Hardcover Discord</a>.

## Support Resources

### Finding Help on Discord

Connect with us on <a href="https://discord.gg/edGpYN8ym8" target="_blank" rel="noreferrer noopener">Discord</a>

</div>

<div class="meta sl-flex astro-3yyafb3n">

Last updated: Mar 31, 2025

</div>

<div class="pagination-links astro-u2l5gyhi" dir="ltr">

<a href="/contributing/frontmatter/" class="astro-u2l5gyhi" rel="prev"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNyAxMUg5LjQxbDMuMy0zLjI5YTEuMDA0IDEuMDA0IDAgMSAwLTEuNDItMS40MmwtNSA1YTEgMSAwIDAgMC0uMjEuMzMgMSAxIDAgMCAwIDAgLjc2IDEgMSAwIDAgMCAuMjEuMzNsNSA1YTEuMDAyIDEuMDAyIDAgMCAwIDEuNjM5LS4zMjUgMSAxIDAgMCAwLS4yMTktMS4wOTVMOS40MSAxM0gxN2ExIDEgMCAwIDAgMC0yWiIgLz48L3N2Zz4=" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Previous<br />
<span class="link-title astro-u2l5gyhi">Frontmatter</span> </span></a> <a href="/contributing/react-components/" class="astro-u2l5gyhi" rel="next"><img src="data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgY2xhc3M9ImFzdHJvLXUybDVneWhpIGFzdHJvLWM2dnNvcWFzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiBzdHlsZT0iLS1zbC1pY29uLXNpemU6IDEuNXJlbTsiPjxwYXRoIGQ9Ik0xNy45MiAxMS42MmExLjAwMSAxLjAwMSAwIDAgMC0uMjEtLjMzbC01LTVhMS4wMDMgMS4wMDMgMCAxIDAtMS40MiAxLjQybDMuMyAzLjI5SDdhMSAxIDAgMCAwIDAgMmg3LjU5bC0zLjMgMy4yOWExLjAwMiAxLjAwMiAwIDAgMCAuMzI1IDEuNjM5IDEgMSAwIDAgMCAxLjA5NS0uMjE5bDUtNWExIDEgMCAwIDAgLjIxLS4zMyAxIDEgMCAwIDAgMC0uNzZaIiAvPjwvc3ZnPg==" class="astro-u2l5gyhi astro-c6vsoqas" /> <span class="astro-u2l5gyhi"> Next<br />
<span class="link-title astro-u2l5gyhi">React Components</span> </span></a>

</div>

</div>

</div>

</div>
