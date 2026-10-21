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
 */

(function () {
  "use strict";

  const DATA_URL = "data/community-testimonials.json";
  const AVATAR_URL = "images/testimonial/default-avatar.svg";
  const SVG_NS = "http://www.w3.org/2000/svg";

  const section = document.querySelector("#testimonials-section");
  const carousel = section?.querySelector(".testimonial-carousel");

  if (!carousel) return;

  // Prevent duplicate initialization if the script is loaded twice.
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
    "côte d'ivoire": "CI",
    "cote d'ivoire": "CI",
    "ci": "CI"
  };

  // SVG path data for social icons. No icon font is required.
  const SOCIAL_ICONS = {
    "linkedin.com":
      "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z",

    "github.com":
      "M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.51-1.3-1.24-1.65-1.24-1.65-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.08 1.14a10.7 10.7 0 0 1 5.6 0c2.14-1.44 3.08-1.14 3.08-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.6 5.23-5.08 5.51.4.35.75 1.03.75 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"
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

  function createSocialIcon(domain) {
    const pathData = SOCIAL_ICONS[domain];

    if (!pathData) return null;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.classList.add("testimonial-social-icon");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);

    return svg;
  }

  function addExternalLink(list, value, domain, label) {
    const safeUrl = getSafeProfileUrl(value, domain);

    if (!safeUrl) return;

    const icon = createSocialIcon(domain);

    if (!icon) return;

    const item = document.createElement("li");
    item.className = "ftco-animate";

    const link = document.createElement("a");
    link.href = safeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.title = label;

    link.appendChild(icon);
    item.appendChild(link);
    list.appendChild(item);
  }

  function getCountryFlag(country) {
    if (typeof country !== "string" || !country.trim()) {
      return "";
    }

    const normalized = country.trim().toLowerCase();
    let code = COUNTRY_CODES[normalized];

    // Also support two-letter country codes, such as TN and RW.
    if (!code && /^[a-z]{2}$/i.test(country.trim())) {
      code = country.trim().toUpperCase();
    }

    if (!code || !/^[A-Z]{2}$/.test(code)) {
      return "";
    }

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

    const item = document.createElement("li");
    item.className = "ftco-animate";

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

    // Only accept local testimonial images with the expected filename format.
    if (
      /^images\/testimonial\/t-[a-f0-9]{16}\.(?:jpg|png|webp)$/i.test(
        imagePath
      )
    ) {
      return imagePath;
    }

    // Support legacy Google Drive image URLs.
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
      "“" + testimonial.message + "”"
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

    const positionParts = [
      testimonial.position,
      testimonial.organization
    ].filter(value =>
      typeof value === "string" && value.trim()
    );

    addTextElement(
      person,
      "span",
      "position",
      positionParts.join(" · ")
    );

    card.appendChild(person);

    return item;
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) {
        throw new Error(
          "Could not load community testimonials (HTTP " +
          response.status + ")"
        );
      }

      return response.json();
    })
    .then(records => {
      if (!Array.isArray(records) || !records.length) {
        return;
      }

      const $carousel = window.jQuery
        ? window.jQuery(carousel)
        : null;

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
