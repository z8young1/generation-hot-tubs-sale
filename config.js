/* ============================================================
   Generation Hot Tubs Factory Sale: site settings
   Everything a non-developer might need to change lives here.
   ============================================================ */
window.GHT = {
  // Event
  eventName: "Generation Hot Tubs Factory Sale",
  eventStart: "2026-11-05T09:00:00-06:00", // Doors open, Central Time (CST on Nov 5)
  eventEnd: "2026-11-07T16:00:00-06:00",
  dateLine: "November 5, 6 and 7, 2026",
  // CONFIRM WITH KEVIN: sale hours (normal business hours are Mon to Thu 8 to 5)
  hours: [
    ["Thursday, Nov 5", "9 am to 6 pm"],
    ["Friday, Nov 6", "9 am to 6 pm"],
    ["Saturday, Nov 7", "9 am to 4 pm"]
  ],
  priceSheetDay: "Wednesday, November 4",

  // Location and contact
  address1: "300 Garfield Street",
  address2: "McMinnville, TN 37110",
  phone: "931-414-2908",
  phoneHref: "tel:+19314142908",
  email: "sales@generationhottubs.com",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=300+Garfield+Street+McMinnville+TN+37110",

  // Links
  // PASTE KEVIN'S 0% FINANCING APPLICATION LINK HERE (leave blank until you have it)
  financingUrl: "",
  // Where lead data is POSTed as JSON. Currently the GoHighLevel inbound webhook,
  // which creates or updates the contact and fills the GHL fields.
  // Leave blank and the pages still work; leads are only stored in the visitor's browser.
  formEndpoint: "https://services.leadconnectorhq.com/hooks/opaag6b94UoGQNHdGYfw/webhook-trigger/89c6441a-ec9d-4cb0-a494-0541bca46fff",
  privacyUrl: "https://generationhottubs.com/privacy-notice/",
  siteUrl: "https://generationhottubs.com/"
};
