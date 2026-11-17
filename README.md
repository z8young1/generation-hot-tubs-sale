# Generation Hot Tubs Factory Sale: landing pages

**Extended sale (updated 2026-11-17).** Factory Sale pricing now runs through Saturday, December 5, 2026. The Factory Pass and the emailed price sheet are retired: the form is "Get my factory price" and a team member calls with pricing. Hours are Monday to Thursday 7 to 5, Friday and Saturday by appointment (the "Book a Fri/Sat visit" links go to `/factory-sale/appointment/`, set as `appointmentUrl` in `config.js`), closed Thanksgiving Day. The webhook still sends every key it did before; `factory_pass_number` is now always empty. The sections below marked "Before launch" describe the original November 5 to 7 event.

Three static pages, no build step. Upload the whole folder to any host, or paste each page into a page builder.

| File | Purpose |
|---|---|
| `index.html` | Sale landing page (where the social ad sends people) |
| `quiz.html` | "Find Your Perfect Hot Tub" questionnaire and lead form |
| `thank-you.html` | Confirmation (a team member calls with pricing), hours, GreenSky financing module, the visitor's match |
| `config.js` | Dates, hours, phone, address, form endpoint |
| `styles.css` | Shared styling |
| `app.js` | Countdown to the end of the sale, lead capture, matching logic, ad attribution |
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

## GoHighLevel

Leads land in the Generation Hot Tubs sub-account (agency CNXTNS GROUP) through the published workflow **10. Factory Sale: Find Your Perfect Hot Tub Submission**: Inbound Webhook trigger, then **Create contact** (26 mapped fields), then **Add Tag** (`factory-sale-2026`, `factory-sale-website-lead`). The quiz and quick-form fields live in the contact custom-field folder **Factory Sale 2026**. `gclid` is reserved by GoHighLevel, so the Google click ID lands in **Google Click ID**. The Inbound Webhook is a premium trigger with a small per-run charge. If the trigger is ever deleted and re-added, GoHighLevel issues a new URL: update `formEndpoint` in `config.js`, run `build-wp.py`, and update the three WordPress pages.

## Friday and Saturday appointments

`appointment.html` books a Fri/Sat visit during the sale extension (through Saturday, Dec 5) and lands on `appointment-thank-you.html`, which shows a visit card with the chosen day and time. It posts to its own GoHighLevel inbound webhook, `apptEndpoint` in `config.js`, as flat JSON: `first_name`, `last_name`, `full_name`, `phone` (+1 format), `email`, `visit_date`, `visit_time`, `notes`, `form_name`, `lead_source` and `tags` (both `FS-Ext-Appt`), `event`, `page_url`, `submitted_at`, plus the same ad tracking keys as the other forms. Ad tracking carries over from the landing page on its own, because `app.js` stores it in the browser on the first page. Days that have passed drop out of the day list automatically. To change the days or times, edit the two `<select>` lists in `appointment.html`.

## Publishing on generationhottubs.com (WordPress)

The live pages are WordPress pages that use the **Elementor Canvas** template, each holding one Custom HTML block:

| Page | Address | Bundle |
|---|---|---|
| Factory Sale (parent) | `/factory-sale/` | `wp-bundles/factory-sale.txt` |
| Quiz (child) | `/factory-sale/quiz/` | `wp-bundles/quiz.txt` |
| Thank You (child) | `/factory-sale/thank-you/` | `wp-bundles/thank-you.txt` |
| Appointment (child) | `/factory-sale/appointment/` | `wp-bundles/appointment.txt` |
| Appointment Thank You (grandchild) | `/factory-sale/appointment/thank-you/` | `wp-bundles/appointment-thank-you.txt` |

After editing any page, styles or scripts, run `python3 build-wp.py` (it also writes `ghl-bundles/*.html`, the same pages for a GoHighLevel Custom HTML/JS element, not yet tried inside GoHighLevel), then paste the new bundle over the page's Custom HTML block (or update it through the REST API) and purge LiteSpeed Cache. The bundles inline all CSS and JS, scope the CSS under `#ght` so the theme cannot restyle it, use the images already in the WordPress Media Library, and tag scripts so LiteSpeed does not minify or defer them.

## Sharing a review link

`build-demo.py` combines the five pages into `demo.html` (and `demo-local.html` for opening on a laptop). One link, with the pages at `#home`, `#quiz`, `#thanks`, `#appointment` and `#appt-thanks`. In the review build the appointment form sends no lead. Rebuild it after editing any page:

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
