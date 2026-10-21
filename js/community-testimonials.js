/*
 * Community testimonial renderer for index.html.
 * Load this script AFTER js/main.js so Owl Carousel can initialize.
 *
 * Supported image sources:
 *   - Local: images/testimonial/t-<16 hex characters>.jpg|png|webp
 *   - Legacy Google Drive:
 *     https://drive.google.com/uc?export=view&id=...
 *
 * User-controlled text is rendered with textContent, never innerHTML.
 * Markup mirrors the hand-written testimonial cards in index.html.
 */

(function () {
  "use strict";

  const DATA_URL = "data/community-testimonials.json";
  const AVATAR_URL = "images/testimonial/default-avatar.svg";

  const section = document.querySelector("#testimonials-section");
  const carousel = section?.querySelector(".testimonial-carousel");

  if (!carousel) return;

  // Prevent duplicate initialization if the script is loaded twice.
  if (carousel.dataset.testimonialsInitialized === "true") return;
  carousel.dataset.testimonialsInitialized = "true";

  const COUNTRY_CODES = {
    "tunisia": "TN", "tunisie": "TN", "tn": "TN",
    "rwanda": "RW", "rw": "RW",
    "united states": "US", "united states of america": "US", "usa": "US", "us": "US",
    "united kingdom": "GB", "uk": "GB", "gb": "GB",
    "france": "FR", "fr": "FR",
    "germany": "DE", "de": "DE",
    "italy": "IT", "it": "IT",
    "spain": "ES", "es": "ES",
    "canada": "CA", "ca": "CA",
    "india": "IN", "in": "IN",
    "nigeria": "NG", "ng": "NG",
    "kenya": "KE", "ke": "KE",
    "south africa": "ZA", "za": "ZA",
    "morocco": "MA", "ma": "MA",
    "algeria": "DZ", "dz": "DZ",
    "egypt": "EG", "eg": "EG",
    "senegal": "SN", "sn": "SN",
    "cameroon": "CM", "cm": "CM",
    "uganda": "UG", "ug": "UG",
    "ethiopia": "ET", "et": "ET",
    "brazil": "BR", "br": "BR",
    "japan": "JP", "jp": "JP",
    "china": "CN", "cn": "CN",
    "australia": "AU", "au": "AU",
    "switzerland": "CH", "ch": "CH",
    "belgium": "BE", "be": "BE",
    "netherlands": "NL", "nl": "NL",
    "sweden": "SE", "se": "SE",
    "norway": "NO", "no": "NO",
    "finland": "FI", "fi": "FI",
    "ireland": "IE", "ie": "IE",
    "portugal": "PT", "pt": "PT",
    "poland": "PL", "pl": "PL",
    "turkey": "TR", "türkiye": "TR", "tr": "TR",
    "pakistan": "PK", "pk": "PK",
    "bangladesh": "BD", "bd": "BD",
    "indonesia": "ID", "id": "ID",
    "malaysia": "MY", "my": "MY",
    "singapore": "SG", "sg": "SG",
    "new zealand": "NZ", "nz": "NZ",
    "mexico": "MX", "mx": "MX",
    "argentina": "AR", "ar": "AR",
    "colombia": "CO", "co": "CO",
    "ghana": "GH", "gh": "GH",
    "ivory coast": "CI", "côte d’ivoire": "CI",
    "côte d'ivoire": "CI", "cote d'ivoire": "CI", "ci": "CI"
  };

  // Icon-font classes already styled by the site theme.
  const ICON_CLASSES = {
    "linkedin.com": "icon-linkedin",
    "github.com": "icon-github"
  };

  function addTextElement(parent, tag, className, value) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    element.textContent = value == null ? "" : String(value);
    parent.appendChild(element);

    return element;
  }

  // Only allow HTTPS URLs on the requested platform or its subdomains.
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

  // NOTE: no "ftco-animate" class on dynamic items. That class starts at
  // opacity 0 and is only revealed by main.js for elements present at page
  // load, so dynamically added items would stay invisible.
  function addExternalLink(list, value, domain, label) {
    const safeUrl = getSafeProfileUrl(value, domain);
    const iconClass = ICON_CLASSES[domain];

    if (!safeUrl || !iconClass) return;

    const item = document.createElement("li");

    const link = document.createElement("a");
    link.href = safeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.title = label;

    const icon = document.createElement("span");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");

    link.appendChild(icon);
    item.appendChild(link);
    list.appendChild(item);
  }

  function getCountryFlag(country) {
    if (typeof country !== "string" || !country.trim()) {
      return "";
    }

    const trimmed = country.trim();
    let code = COUNTRY_CODES[trimmed.toLowerCase()];

    // Also support any two-letter country code.
    if (!code && /^[a-z]{2}$/i.test(trimmed)) {
      code = trimmed.toUpperCase();
    }

    if (!code || !/^[A-Z]{2}$/.test(code)) {
      return "";
    }

    return String.fromCodePoint(
      ...Array.from(code, character => 127397 + character.charCodeAt(0))
    );
  }

  function addCountry(list, country) {
    if (typeof country !== "string" || !country.trim()) return;

    const name = country.trim();
    const flag = getCountryFlag(name);

    const item = document.createElement("li");

    const countryElement = document.createElement("span");
    countryElement.className = "testimonial-country";
    countryElement.title = name;
    countryElement.setAttribute("aria-label", name);

    // Show a flag for recognized countries; otherwise show the country name.
    countryElement.textContent = flag || name;

    item.appendChild(countryElement);
    list.appendChild(item);
  }

  function getProfileImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
      return AVATAR_URL;
    }

    const imagePath = value.trim();

    // Local testimonial images with the expected filename format.
    if (
      /^images\/testimonial\/t-[a-f0-9]{16}\.(?:jpg|png|webp)$/i.test(imagePath)
    ) {
      return imagePath;
    }

    // Legacy Google Drive image URLs.
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
        /^[a-zA-Z0-9_-]+$/.test(url.searchParams.get("id") || "") &&
        [...url.searchParams.keys()].every(key =>
          ["export", "id"].includes(key)
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

    // Person image.
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

    // Testimonial content.
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
      "\u201C" + testimonial.message + "\u201D"
    );

    // Social row: LinkedIn | Country | GitHub.
    const social = document.createElement("ul");
    social.className = "ftco-footer-social list-unstyled mt-4";

    addExternalLink(
      social,
      testimonial.linkedinUrl,
      "linkedin.com",
      "LinkedIn profile for " + testimonial.name
    );

    addCountry(social, testimonial.country);

    addExternalLink(
      social,
      testimonial.githubUrl,
      "github.com",
      "GitHub profile for " + testimonial.name
    );

    content.appendChild(social);
    card.appendChild(content);

    // Person name and position.
    const person = document.createElement("div");
    person.className = "testimonial-person";

    addTextElement(person, "h3", "", testimonial.name);

    const positionParts = [testimonial.position, testimonial.organization]
      .filter(value => typeof value === "string" && value.trim());

    addTextElement(person, "span", "position", positionParts.join(" \u00B7 "));

    card.appendChild(person);

    return item;
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) {
        throw new Error(
          "Could not load community testimonials (HTTP " + response.status + ")"
        );
      }

      return response.json();
    })
    .then(records => {
      if (!Array.isArray(records) || !records.length) {
        return;
      }

      const $carousel = window.jQuery ? window.jQuery(carousel) : null;

      const owlReady = Boolean(
        $carousel &&
        typeof $carousel.data === "function" &&
        $carousel.data("owl.carousel")
      );

      records.forEach(testimonial => {
        // Ignore empty or malformed records.
        if (
          !testimonial ||
          typeof testimonial.name !== "string" ||
          !testimonial.name.trim() ||
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
