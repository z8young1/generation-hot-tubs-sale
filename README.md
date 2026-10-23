# Generation Hot Tubs Factory Sale: landing pages

Three static pages, no build step. Upload the whole folder to any host, or paste each page into a page builder.

| File | Purpose |
|---|---|
| `index.html` | Sale landing page (where the social ad sends people) |
| `quiz.html` | "Find Your Perfect Hot Tub" questionnaire and lead form |
| `thank-you.html` | Factory Pass, GreenSky financing module, the visitor's match |
| `config.js` | Dates, hours, phone, address, form endpoint |
| `styles.css` | Shared styling |
| `app.js` | Countdown, lead capture, matching logic, ad attribution |
| `img/` | Logo and product photos pulled from generationhottubs.com |

## Before launch

1. **Financing.** GreenSky's finance module (merchant 81140372, plan 2613) is embedded on `index.html` and `thank-you.html` exactly as GreenSky supplied it. GreenSky's usage guidelines forbid editing that code, so to change plans, replace the whole block with new code from GreenSky. Plan 2613 is deferred interest (no interest if paid in full in 12 months, 17.99% to 29.99% APR otherwise), so the pages never say "0%". Any copy that states the terms must also say that interest is charged from the purchase date if the balance is not paid in full in 12 months.
2. **Where leads go.** `formEndpoint` in `config.js` is set to the GoHighLevel inbound webhook. Both forms POST one flat JSON object, so each key maps straight onto a GHL contact or custom field in the workflow's webhook trigger:
   - Contact: `first_name`, `last_name`, `full_name`, `phone` (+1 format), `email`, `postal_code`, `email_consent` (Yes/No)
   - Quiz, in plain English: `quiz_who`, `quiz_purpose`, `quiz_space`, `quiz_priority`, `quiz_timing`, `matched_tub`, `payment_preference`
   - Sale: `factory_pass_number`, `form_name`, `lead_source`, `event`, `page_url`, `submitted_at`, `tags`
   - Ad tracking: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `ttclid`

   Quick-form leads send the same keys with the quiz fields empty. The redirect to the thank-you page never waits more than 2.5 seconds on the webhook.
3. **Confirm with Kevin:**
   - Sale hours for each day (placeholders are Thu and Fri 9 to 6, Sat 9 to 4).
   - That the "price sheet a day early" and "first pick on floor models" promises are ones he will honor. They are the reason to hand over info.
   - GreenSky's Merchant Marketing Guidelines, so the financing copy can be checked against them.
   - Delivery wording in the FAQ.
   - Which models will actually be on the floor. Lineup copy names Alpha 1 and 2, Silent, Boomer, Millennial, Gen X, Gen Z, GH500, GH550, GH 800 Deluxe and the swim spas.
4. **Photos.** The site only has top-down product renders and two water shots. Real photos of tubs installed in backyards, the factory floor, and Kevin and Dawn would lift the page a lot. Swap them in `img/` and update the `src` attributes.
5. **Email and phone follow-up.** The pages promise an email with the pass and the price sheet, plus a call from the team. There is no texting anywhere. Set the email automation up on whatever receives the webhook, and route the phone numbers to whoever is making the calls.

## Publishing on generationhottubs.com (WordPress)

The live pages are three WordPress pages that use the **Elementor Canvas** template, each holding one Custom HTML block:

| Page | Address | Bundle |
|---|---|---|
| Factory Sale (parent) | `/factory-sale/` | `wp-bundles/factory-sale.txt` |
| Quiz (child) | `/factory-sale/quiz/` | `wp-bundles/quiz.txt` |
| Thank You (child) | `/factory-sale/thank-you/` | `wp-bundles/thank-you.txt` |

After editing any page, styles or scripts, run `python3 build-wp.py`, then paste the new bundle over the page's Custom HTML block (or update it through the REST API) and purge LiteSpeed Cache. The bundles inline all CSS and JS, scope the CSS under `#ght` so the theme cannot restyle it, use the images already in the WordPress Media Library, and tag scripts so LiteSpeed does not minify or defer them.

## Sharing a review link

`build-demo.py` combines the three pages into `demo.html` (and `demo-local.html` for opening on a laptop). One link, with the pages at `#home`, `#quiz` and `#thanks`. Rebuild it after editing any page:

```bash
python3 build-demo.py
```

The deployable pages are still the separate `index.html`, `quiz.html` and `thank-you.html`.

## Ad tracking

Append UTM parameters to the ad URL, for example `index.html?utm_source=facebook&utm_campaign=factory-sale`. The values are captured on the first page and attached to the lead when it is submitted.

## Testing

Run a local server from this folder:

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765/ in a browser.
