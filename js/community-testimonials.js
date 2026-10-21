/*
 * Community testimonial renderer for index.html.
 * Load this script AFTER js/main.js so Owl Carousel has initialized.
 *
 * Supported image sources:
 *   - Local: images/testimonial/t-<16 hex characters>.jpg|png|webp
 *   - Legacy Google Drive: https://drive.google.com/uc?export=view&id=...
 *
 * User-controlled text is inserted with textContent, never innerHTML.
 */

(function () {
  "use strict";

  const DATA_URL = "data/community-testimonials.json";
  const AVATAR_URL = "images/testimonial/default-avatar.svg";

  const section = document.querySelector("#testimonials-section");
  const carousel = section && section.querySelector(".testimonial-carousel");

  if (!carousel) return;

  // Prevent duplicate initialization if this script is loaded twice.
  if (carousel.dataset.testimonialsInitialized === "true") return;
  carousel.dataset.testimonialsInitialized = "true";

  const COUNTRY_CODES = {
    "tunisia": "TN",
    "tunisie": "TN",
    "tn": "TN",
    "rwanda": "RW",
    "rw": "RW",
    "united states": "US",
    "united states of america": "US",
    "usa": "US",
    "us": "US",
    "united kingdom": "GB",
    "uk": "GB",
    "gb": "GB",
    "france": "FR",
    "fr": "FR",
    "germany": "DE",
    "de": "DE",
    "italy": "IT",
    "it": "IT",
    "spain": "ES",
    "es": "ES",
    "canada": "CA",
    "ca": "CA",
    "india": "IN",
    "in": "IN",
    "nigeria": "NG",
    "ng": "NG",
    "kenya": "KE",
    "ke": "KE",
    "south africa": "ZA",
    "za": "ZA",
    "morocco": "MA",
    "ma": "MA",
    "algeria": "DZ",
    "dz": "DZ",
    "egypt": "EG",
    "eg": "EG",
    "senegal": "SN",
    "sn": "SN",
    "cameroon": "CM",
    "cm": "CM",
    "uganda": "UG",
    "ug": "UG",
    "ethiopia": "ET",
    "et": "ET",
    "brazil": "BR",
    "br": "BR",
    "japan": "JP",
    "jp": "JP",
    "china": "CN",
    "cn": "CN",
    "australia": "AU",
    "au": "AU",
    "switzerland": "CH",
    "ch": "CH",
    "belgium": "BE",
    "be": "BE",
    "netherlands": "NL",
    "nl": "NL",
    "spain": "ES",
    "sweden": "SE",
    "se": "SE",
    "norway": "NO",
    "no": "NO",
    "finland": "FI",
    "fi": "FI",
    "ireland": "IE",
    "ie": "IE",
    "portugal": "PT",
    "pt": "PT",
    "poland": "PL",
    "pl": "PL",
    "turkey": "TR",
    "türkiye": "TR",
    "tr": "TR",
    "pakistan": "PK",
    "pk": "PK",
    "bangladesh": "BD",
    "bd": "BD",
    "indonesia": "ID",
    "id": "ID",
    "malaysia": "MY",
    "my": "MY",
    "singapore": "SG",
    "sg": "SG",
    "new zealand": "NZ",
    "nz": "NZ",
    "mexico": "MX",
    "mx": "MX",
    "argentina": "AR",
    "ar": "AR",
    "colombia": "CO",
    "co": "CO",
    "ghana": "GH",
    "gh": "GH",
    "ivory coast": "CI",
    "côte d’ivoire": "CI",
    "cote d'ivoire": "CI",
    "ci": "CI"
  };

  function addTextElement(parent, tag, className, value) {
    const el = document.createElement(tag);

    if (className) {
      el.className = className;
    }

    el.textContent = value == null ? "" : String(value);
    parent.appendChild(el);

    return el;
  }

  // Only allow HTTPS URLs belonging to the requested social platform.
  function getSafeProfileUrl(value, domain) {
    if (typeof value !== "string" || !value.trim()) {
      return null;
    }

    try {
      const url = new URL(value.trim());
      const hostname = url.hostname.toLowerCase();

      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        url.port ||
        url.hash ||
        !(hostname === domain || hostname.endsWith("." + domain))
      ) {
        return null;
      }

      return url.href;
    } catch (_) {
      return null;
    }
  }

  function addExternalLink(list, value, domain, iconClass, label) {
    const safeUrl = getSafeProfileUrl(value, domain);

    if (!safeUrl) return;

    const li = document.createElement("li");
    li.className = "ftco-animate";

    const a = document.createElement("a");
    a.href = safeUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", label);
    a.title = label;

    const icon = document.createElement("span");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");

    a.appendChild(icon);
    li.appendChild(a);
    list.appendChild(li);
  }

  function getCountryFlag(country) {
    if (typeof country !== "string" || !country.trim()) {
      return "";
    }

    const normalized = country.trim().toLowerCase();
    let code = COUNTRY_CODES[normalized];

    // Also support valid two-letter ISO country codes.
    if (!code && /^[a-z]{2}$/i.test(country.trim())) {
      code = country.trim().toUpperCase();
    }

    if (!code) return "";

    // Convert ISO country code into regional indicator symbols.
    return String.fromCodePoint(
      ...Array.from(code, character =>
        127397 + character.charCodeAt(0)
      )
    );
  }

  function addCountry(list, country) {
    if (typeof country !== "string" || !country.trim()) {
      return;
    }

    const name = country.trim();
    const flag = getCountryFlag(name);

    const li = document.createElement("li");
    li.className = "ftco-animate";

    const countryElement = document.createElement("span");
    countryElement.className = "testimonial-country";
    countryElement.title = name;
    countryElement.setAttribute("aria-label", name);

    // Show the flag for recognized countries, otherwise the country name.
    countryElement.textContent = flag || name;

    li.appendChild(countryElement);
    list.appendChild(li);
  }

  function getProfileImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
      return AVATAR_URL;
    }

    const imagePath = value.trim();

    // Only accept local testimonial filenames with the expected ID format.
    if (
      /^images\/testimonial\/t-[a-f0-9]{16}\.(?:jpg|png|webp)$/i.test(
        imagePath
      )
    ) {
      return imagePath;
    }

    // Support legacy Google Drive URLs.
    try {
      const url = new URL(imagePath);

      const validDriveUrl =
        url.protocol === "https:" &&
        url.hostname === "drive.google.com" &&
        !url.username &&
        !url.password &&
        !url.port &&
        url.pathname === "/uc" &&
        url.searchParams.get("export") === "view" &&
        /^[a-zA-Z0-9_-]+$/.test(
          url.searchParams.get("id") || ""
        ) &&
        [...url.searchParams.keys()].every(
          key => ["export", "id"].includes(key)
        ) &&
        !url.hash;

      return validDriveUrl ? url.href : AVATAR_URL;
    } catch (_) {
      return AVATAR_URL;
    }
  }

  function buildCard(testimonial) {
    const item = document.createElement("div");
    item.className = "item";

    const card = document.createElement("div");
    card.className = "testimonial-card";
    item.appendChild(card);

    // Person image
    const imageWrap = document.createElement("div");
    imageWrap.className = "testimonial-img";

    const img = document.createElement("img");
    img.src = getProfileImageUrl(testimonial.imageUrl);
    img.alt = "Profile photo of " + testimonial.name;
    img.loading = "lazy";
    img.decoding = "async";

    img.onerror = function () {
      img.onerror = null;
      img.src = AVATAR_URL;
    };

    imageWrap.appendChild(img);
    card.appendChild(imageWrap);

    // Testimonial content
    const content = document.createElement("div");
    content.className = "testimonial-content";

    const quote = document.createElement("div");
    quote.className = "quote-icon";

    const quoteIcon = document.createElement("span");
    quoteIcon.className = "icon-quote-left";
    quoteIcon.setAttribute("aria-hidden", "true");

    quote.appendChild(quoteIcon);
    content.appendChild(quote);

    addTextElement(
      content,
      "p",
      "testimonial-text",
      "“" + testimonial.message + "”"
    );

    // LinkedIn | Country | GitHub
    const social = document.createElement("ul");
    social.className = "ftco-footer-social list-unstyled mt-4";

    addExternalLink(
      social,
      testimonial.linkedinUrl,
      "linkedin.com",
      "icon-linkedin",
      "LinkedIn profile for " + testimonial.name
    );

    addCountry(social, testimonial.country);

    addExternalLink(
      social,
      testimonial.githubUrl,
      "github.com",
      "icon-github",
      "GitHub profile for " + testimonial.name
    );

    content.appendChild(social);
    card.appendChild(content);

    // Person name and position
    const person = document.createElement("div");
    person.className = "testimonial-person";

    addTextElement(person, "h3", "", testimonial.name);

    addTextElement(
      person,
      "span",
      "position",
      [testimonial.position, testimonial.organization]
        .filter(value => typeof value === "string" && value.trim())
        .join(" · ")
    );

    card.appendChild(person);

    return item;
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) {
        throw new Error("Could not load community testimonials");
      }

      return response.json();
    })
    .then(records => {
      if (!Array.isArray(records) || !records.length) return;

      const $carousel = window.jQuery
        ? window.jQuery(carousel)
        : null;

      const owlReady =
        $carousel &&
        typeof $carousel.data === "function" &&
        $carousel.data("owl.carousel");

      records.forEach(testimonial => {
        if (
          !testimonial ||
          typeof testimonial.name !== "string" ||
          typeof testimonial.message !== "string"
        ) {
          return;
        }

        const card = buildCard(testimonial);

        if (owlReady) {
          $carousel.trigger("add.owl.carousel", [card]);
        } else {
          carousel.appendChild(card);
        }
      });

      if (owlReady) {
        $carousel.trigger("refresh.owl.carousel");
      }
    })
    .catch(error => {
      console.warn("[testimonials]", error.message);
    });
})();
