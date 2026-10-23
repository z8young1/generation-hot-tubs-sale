/* Shared behavior for the Factory Sale pages: config fill-in, countdown,
   ad attribution capture, lead storage/submission, Factory Pass numbers,
   and the hot tub matching logic used by the quiz and thank-you page. */
(function () {
  var C = window.GHT || {};
  var LEAD_KEY = "ght_lead";
  var UTM_KEY = "ght_utm";

  function ls(get, key, val) {
    try {
      if (get) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* 1. Fill any [data-ght="key"] element from config.js */
  document.querySelectorAll("[data-ght]").forEach(function (el) {
    var v = C[el.getAttribute("data-ght")];
    if (v != null && v !== "") el.textContent = v;
  });
  document.querySelectorAll("[data-ght-href]").forEach(function (el) {
    var v = C[el.getAttribute("data-ght-href")];
    if (v) el.setAttribute("href", v);
  });
  document.querySelectorAll("[data-ght-hours]").forEach(function (el) {
    el.innerHTML = (C.hours || []).map(function (r) {
      return '<div class="row"><b>' + r[0] + "</b><span>" + r[1] + "</span></div>";
    }).join("");
  });

  /* 2. Countdown to doors open */
  var timer = document.querySelector("[data-countdown]");
  if (timer && C.eventStart) {
    var start = new Date(C.eventStart).getTime();
    var end = C.eventEnd ? new Date(C.eventEnd).getTime() : start;
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var tick = function () {
      var now = Date.now();
      var label = timer.parentElement.querySelector("[data-countdown-label]");
      if (now >= end) {
        timer.innerHTML = "<span>Sale has ended</span>";
        if (label) label.textContent = "Thank you, McMinnville";
        return;
      }
      if (now >= start) {
        timer.innerHTML = "<span><b>OPEN</b> now</span>";
        if (label) label.textContent = "Doors are open";
        return;
      }
      var s = Math.floor((start - now) / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60);
      timer.innerHTML =
        "<span><b>" + d + "</b>days</span>" +
        "<span><b>" + pad(h) + "</b>hrs</span>" +
        "<span><b>" + pad(m) + "</b>min</span>";
    };
    tick();
    setInterval(tick, 30000);
  }

  /* 3. Capture ad attribution from the URL so the lead carries it */
  (function () {
    var p = new URLSearchParams(location.search);
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "ttclid"];
    var o = {};
    keys.forEach(function (k) { if (p.get(k)) o[k] = p.get(k); });
    if (Object.keys(o).length) ls(false, UTM_KEY, JSON.stringify(o));
  })();

  function getUTM() {
    try { return JSON.parse(ls(true, UTM_KEY) || "{}"); } catch (e) { return {}; }
  }

  /* 4. Factory Pass number, e.g. GHT-1105-7KQ3 */
  function passNumber() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return "GHT-1105-" + s;
  }

  /* 5. Hot tub matching used by the quiz and the thank-you page.
        Specs come from generationhottubs.com and dealer spec sheets.
        Models without published specs say so instead of guessing. */
  var TUBS = {
    alpha1: { name: "Alpha 1", series: "Classic Series", seats: "3 person", img: "img/Generation-GH-700-Classic.jpg",
      spec: "Built for two. Full specs on the sale sheet.",
      why: "A tub for one or two people does not need six seats. The Alpha fits a small patio and keeps the price down." },
    alpha2: { name: "Alpha 2", series: "Signature Series", seats: "3 person", img: "img/Generation-GH-700-Deluxe.jpg",
      spec: "Built for two, with the Signature jet package. Full specs on the sale sheet.",
      why: "You want the massage without the footprint. The Alpha 2 is the Signature Series in a two-person size." },
    gh550: { name: "GH550", series: "Classic Series", seats: "5 to 6 person", img: "img/Generation-GH-700-Classic.jpg",
      spec: "25 jets · 1 pump · 305 gallons · 77\" x 77\" x 34\"",
      why: "Simple, reliable and easy on the power bill. One pump, fewer parts, the same 10-year shell warranty." },
    silent: { name: "Silent", series: "Signature Series", seats: "5 to 6 person", img: "img/Generation-GH-700-Deluxe.jpg",
      spec: "44 jets · 2 pumps · 400 gallons · 82\" x 82\" x 36\"",
      why: "The end-of-day tub. Two pumps and 44 jets, in a footprint that fits an ordinary patio." },
    boomer: { name: "Boomer", series: "Signature Series", seats: "5 to 6 person", img: "img/Generation-GH-700-Deluxe.jpg",
      spec: "44 jets · 2 pumps · 425 gallons · 82\" x 82\" x 36\" · LED waterfall",
      why: "Room for the family and friends who show up, with the lights and waterfall that make it the backyard hangout." },
    genx: { name: "Gen X", series: "Signature Series", seats: "5 to 6 person", img: "img/Generation-GH-800-Deluxe.jpg",
      spec: "44 jets · 2 pumps · 500 gallons · 92\" x 92\" x 36\"",
      why: "The deepest, roomiest Signature tub. Stretch out fully, which is what a sore back wants." },
    gh800: { name: "GH 800 Deluxe", series: "Deluxe", seats: "7 person", img: "img/Generation-GH-800-Deluxe.jpg",
      spec: "49 jets · 2 pumps · 500 gallons · 92\" x 92\" x 36\"",
      why: "Seven seats and 49 jets. When you host a crowd, nobody waits their turn." },
    swim: { name: "GH 14000 Swim Spa", series: "Swim Spa Series", seats: "8 person", img: "img/Product-Classic-BG-1.webp",
      spec: "Swim current plus hot tub seating. Also see the GH 10000, 12000 and 16000.",
      why: "You said swimming and exercise. Only a swim spa gives you a current to swim against, year round." }
  };

  function matchTub(a) {
    a = a || {};
    if (a.purpose === "r4") return TUBS.swim;
    var simple = a.features === "f2" || a.features === "f4";
    if (a.people === "p1" || a.people === "p2") return simple ? TUBS.alpha1 : TUBS.alpha2;
    if (a.people === "p4") return TUBS.gh800;
    if (simple) return TUBS.gh550;
    if (a.purpose === "r2") return (a.space === "s1") ? TUBS.boomer : TUBS.genx;
    if (a.purpose === "r3" || a.features === "f3") return TUBS.boomer;
    return TUBS.silent;
  }

  /* 6. Lead storage and submission */
  function saveLead(data) {
    var existing = loadLead() || {};
    var lead = Object.assign({}, data);
    lead.passNumber = existing.passNumber || passNumber();
    lead.submittedAt = new Date().toISOString();
    lead.attribution = getUTM();
    lead.page = location.pathname;
    if (lead.answers) lead.match = matchTub(lead.answers).name;
    ls(false, LEAD_KEY, JSON.stringify(lead));
    return lead;
  }
  function loadLead() {
    try { return JSON.parse(ls(true, LEAD_KEY) || "null"); } catch (e) { return null; }
  }
  /* Plain-English labels so quiz answers read well in the CRM */
  var LABELS = {
    people: { p1: "Just me", p2: "Me and one other", p3: "Family or friends, 3 to 5", p4: "A crowd, 6 or more" },
    purpose: { r1: "Unwinding at the end of the day", r2: "A sore back, stiff joints, recovery", r3: "Time with family and friends", r4: "Swimming and exercise" },
    space: { s1: "A small patio or deck", s2: "An average backyard", s3: "Plenty of room", s4: "Not sure yet, needs help with placement" },
    features: { f1: "Maximum jets and massage", f2: "Simple, reliable, easy to maintain", f3: "Lights, the waterfall, the extras", f4: "The lowest price that still lasts" },
    timing: { t1: "As soon as the sale, before Thanksgiving", t2: "Before Christmas", t3: "Sometime this winter", t4: "Just looking right now" },
    payment: { financing: "Monthly, with 0% financing", full: "Pay in full", unsure: "Not sure yet" }
  };
  function label(group, v) { return (LABELS[group] && LABELS[group][v]) || v || ""; }

  /* Flat payload for the webhook. Every key is a top-level field so it maps
     straight onto a GoHighLevel contact or custom field. */
  function webhookPayload(lead) {
    var a = lead.answers || {};
    var utm = lead.attribution || {};
    var o = {
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      full_name: [lead.first_name, lead.last_name].filter(Boolean).join(" "),
      phone: lead.phone ? "+1" + lead.phone : "",
      email: lead.email || "",
      postal_code: lead.zip || "",
      payment_preference: label("payment", lead.payment_preference),
      email_consent: lead.email_consent ? "Yes" : "No",
      quiz_who: label("people", a.people),
      quiz_purpose: label("purpose", a.purpose),
      quiz_space: label("space", a.space),
      quiz_priority: label("features", a.features),
      quiz_timing: label("timing", a.timing),
      matched_tub: lead.match || "",
      factory_pass_number: lead.passNumber || "",
      form_name: lead.source === "perfect-hot-tub-quiz" ? "Perfect Hot Tub Quiz" : "Factory Sale Quick Form",
      lead_source: lead.source || "",
      event: C.eventName || "",
      page_url: location.origin + (lead.page || location.pathname),
      submitted_at: lead.submittedAt || new Date().toISOString(),
      tags: ["factory-sale-2026", lead.source || "factory-sale-form"].join(",")
    };
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "ttclid"].forEach(function (k) {
      o[k] = utm[k] || "";
    });
    return o;
  }

  function postLead(lead) {
    if (!C.formEndpoint) return Promise.resolve();
    try {
      var send = fetch(C.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload(lead)),
        keepalive: true
      }).catch(function () {});
      // Never hold the visitor on the form for a slow webhook; keepalive finishes the send.
      var timeout = new Promise(function (r) { setTimeout(r, 2500); });
      return Promise.race([send, timeout]);
    } catch (e) { return Promise.resolve(); }
  }

  /* 7. Simple field validation */
  function cleanPhone(v) { return (v || "").replace(/\D/g, "").replace(/^1(\d{10})$/, "$1"); }
  function validate(form) {
    var ok = true;
    form.querySelectorAll(".field[data-req]").forEach(function (f) {
      var input = f.querySelector("input, select");
      var v = (input.value || "").trim();
      var bad = !v;
      if (!bad && input.type === "tel") bad = cleanPhone(v).length !== 10;
      if (!bad && input.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (bad) { f.setAttribute("data-bad", "1"); input.setAttribute("aria-invalid", "true"); ok = false; }
      else { f.removeAttribute("data-bad"); input.removeAttribute("aria-invalid"); }
    });
    var consent = form.querySelector("input[name=email_consent]");
    if (consent && !consent.checked) {
      consent.closest(".consent").style.color = "#e07a5a"; ok = false;
    } else if (consent) {
      consent.closest(".consent").style.color = "";
    }
    return ok;
  }

  function formData(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) { o[k] = typeof v === "string" ? v.trim() : v; });
    if (o.phone) o.phone = cleanPhone(o.phone);
    o.email_consent = !!form.querySelector("input[name=email_consent]:checked");
    return o;
  }

  /* 8. Wire every lead form on the page */
  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) {
        var first = form.querySelector("[aria-invalid=true]");
        if (first) first.focus();
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Holding your pass…"; }
      var data = formData(form);
      if (form.getAttribute("data-lead-form") === "quiz" && window.GHTQuizAnswers) data.answers = window.GHTQuizAnswers();
      var lead = saveLead(data);
      postLead(lead).then(function () { location.href = form.getAttribute("data-next") || "thank-you.html"; });
    });
  });

  window.GHTLead = { save: saveLead, load: loadLead, post: postLead, payload: webhookPayload, match: matchTub, tubs: TUBS, passNumber: passNumber };
})();
