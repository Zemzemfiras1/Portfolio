# Community testimonials integration for Zemzemfiras1/Portfolio

This starter kit adds public Google Form submissions -> Google Sheets -> Apps Script -> GitHub Actions -> pull request. It does **not** modify your repository automatically. Copy the files into your local clone and push them to `main`.

## Files
- `apps-script.gs`: Apps Script to paste into the linked response spreadsheet.
- `.github/workflows/testimonial-submission.yml`: validates a submission, appends `data/community-testimonials.json`, and opens a PR.
- `js/community-testimonials.js`: safely renders approved JSON using the existing `.testimonial-card` markup classes.
- `data/community-testimonials.json`: starts as an empty array.
- `images/testimonial/default-avatar.svg`: neutral avatar; submissions cannot provide photos.

## A. Create the Google Form
Create a public Google Form and link it to a new response spreadsheet. Use these exact question titles:
1. `Full name` — short answer, required
2. `Position` — short answer, required
3. `Company or organization` — short answer, optional
4. `Country` — short answer, required
5. `Testimonial` — paragraph, required
6. `LinkedIn URL` — short answer, optional
7. `Consent to publish` — required checkbox with an option containing the word `agree`, e.g. `I agree to have my testimonial and name published on Firas's portfolio if approved.`

Allow responses from outside your organization if your account's settings permit it. Do not require sign-in and do not add a photo upload field.

## B. Add the Apps Script
1. Open the linked response spreadsheet.
2. Choose **Extensions -> Apps Script**.
3. Replace the sample code with the contents of `apps-script.gs`.
4. In Apps Script, open **Project Settings -> Script Properties** and add:
   - Property: `GITHUB_TOKEN`
   - Value: a fine-grained personal access token (never paste it into HTML or commit it).
5. Create the trigger:
   - Apps Script left sidebar -> **Triggers** -> **Add Trigger**
   - Function: `onFormSubmit`
   - Event source: **From spreadsheet**
   - Event type: **On form submit**
   - Save and authorize.

Use a GitHub fine-grained PAT restricted to `Zemzemfiras1/Portfolio`, with **Contents: Read and write** permission for the repository-dispatch endpoint. The token is held in Apps Script Script Properties; it is not exposed to form respondents or the portfolio.

## C. Enable GitHub Actions pull requests
1. Copy `.github/workflows/testimonial-submission.yml` into the repository at that exact path.
2. Copy `data/community-testimonials.json`, `js/community-testimonials.js`, and `images/testimonial/default-avatar.svg` to their exact paths.
3. In GitHub, open **Settings -> Actions -> General**.
4. Under workflow permissions, allow read/write access if required.
5. Enable **Allow GitHub Actions to create and approve pull requests**.
6. Commit and push these files to `main`.

The workflow uses the built-in `GITHUB_TOKEN` to push the branch and open the PR. This avoids storing a second token in GitHub Secrets. The Apps Script PAT is used only to dispatch the event.

## D. Integrate with `index.html`
In the Testimonials section, add a button/link near the section heading. Replace `YOUR_GOOGLE_FORM_URL` with the published form URL:

```html
<p>
  What people say about working with me and our collaborations.
</p>
<a class="btn btn-primary"
   href="YOUR_GOOGLE_FORM_URL"
   target="_blank"
   rel="noopener noreferrer">
  Leave a testimonial
</a>
```

At the bottom of `index.html`, your current page loads `js/main.js`. Add the new script immediately **after** that line so the existing Owl Carousel initialization has run first:

```html
<script src="js/main.js"></script>
<script src="js/community-testimonials.js"></script>
```

The renderer targets `#testimonials-section .testimonial-carousel`, not the publications carousel, and uses DOM `textContent` for all user-entered text. It loads only records already merged into `data/community-testimonials.json`. A pending PR is not visible on the live site.

## E. Duplicate handling
- Apps Script derives a stable ID from the submission timestamp, name, and testimonial text, so retries of the same response use the same ID.
- Apps Script records the ID only after GitHub accepts the dispatch.
- The workflow checks for an existing ID and for an exact normalized name + testimonial duplicate in the committed JSON.
- Each new ID uses its own branch, `testimonials/<id>`, and an open PR is not created twice for that branch.

A second, separately submitted copy with different timestamps can have a different ID, but exact duplicate text is still rejected if an equivalent entry is already merged into the JSON file.

## F. Test it
1. Make sure the workflow and the script are saved.
2. Submit a test response through the public form.
3. Check Apps Script **Executions** for errors.
4. Open the repository's **Actions** tab. A `Review community testimonial` run should appear.
5. Verify that a branch and PR were created and that the JSON contains the new entry.
6. Review the PR. Merge it only after verifying identity, content, and consent.
7. After GitHub Pages deploys, check `https://zemzemfiras1.github.io/Portfolio/`.

## Important notes
- The workflow targets the `main` branch. If the repository's default branch changes, update `ref: main`, `--base main`, and branch permissions accordingly.
- The current setup handles new Form submissions only. Manually editing a response row will not trigger a PR.
- Public forms can receive spam. Keep the consent checkbox, moderate every PR, and consider adding a moderation/captcha layer if spam becomes an issue.
- No user-provided HTML or photo URL is accepted. LinkedIn URLs are restricted to HTTPS LinkedIn hosts.
- The JSON is a public file after merge. Do not add email addresses or other private fields.
