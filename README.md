# Generation Hot Tubs Factory Sale: landing pages

Three static pages, no build step. Upload the whole folder to any host, or paste each page into a page builder.

| File | Purpose |
|---|---|
| `index.html` | Sale landing page (where the social ad sends people) |
| `quiz.html` | "Find Your Perfect Hot Tub" questionnaire and lead form |
| `thank-you.html` | Factory Pass, 0% financing call to action, the visitor's match |
| `config.js` | Dates, hours, phone, address, financing link, form endpoint |
| `styles.css` | Shared styling |
| `app.js` | Countdown, lead capture, matching logic, ad attribution |
| `img/` | Logo and product photos pulled from generationhottubs.com |

## Before launch

1. **Financing link.** Paste Kevin's application URL into `financingUrl` in `config.js`. Until then the button shows a "link coming soon, call us" note when tapped.
2. **Where leads go.** Set `formEndpoint` in `config.js` to a webhook (Zapier, Make, GoHighLevel, HubSpot) and every lead is POSTed there as JSON with: name, phone, email, ZIP, payment preference, email consent, the five quiz answers, the matched model, the pass number, and any UTM or click IDs from the ad.
3. **Confirm with Kevin:**
   - Sale hours for each day (placeholders are Thu and Fri 9 to 6, Sat 9 to 4).
   - That the "price sheet a day early" and "first pick on floor models" promises are ones he will honor. They are the reason to hand over info.
   - Financing terms wording ("0% APR for qualified buyers through our financing partner").
   - Delivery wording in the FAQ.
   - Which models will actually be on the floor. Lineup copy names Alpha 1 and 2, Silent, Boomer, Millennial, Gen X, Gen Z, GH500, GH550, GH 800 Deluxe and the swim spas.
4. **Photos.** The site only has top-down product renders and two water shots. Real photos of tubs installed in backyards, the factory floor, and Kevin and Dawn would lift the page a lot. Swap them in `img/` and update the `src` attributes.
5. **Email and phone follow-up.** The pages promise an email with the pass and the price sheet, plus a call from the team. There is no texting anywhere. Set the email automation up on whatever receives the webhook, and route the phone numbers to whoever is making the calls.

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
