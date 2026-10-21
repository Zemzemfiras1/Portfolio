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


  const COUNTRY_CODES = Object.fromEntries(
    [
      ["Afghanistan", "AF"],
      ["Albania", "AL"],
      ["Algeria", "DZ"],
      ["Andorra", "AD"],
      ["Angola", "AO"],
      ["Antigua and Barbuda", "AG"],
      ["Argentina", "AR"],
      ["Armenia", "AM"],
      ["Australia", "AU"],
      ["Austria", "AT"],
      ["Azerbaijan", "AZ"],
      ["Bahamas", "BS"],
      ["Bahrain", "BH"],
      ["Bangladesh", "BD"],
      ["Barbados", "BB"],
      ["Belarus", "BY"],
      ["Belgium", "BE"],
      ["Belize", "BZ"],
      ["Benin", "BJ"],
      ["Bhutan", "BT"],
      ["Bolivia", "BO"],
      ["Bosnia and Herzegovina", "BA"],
      ["Botswana", "BW"],
      ["Brazil", "BR"],
      ["Brunei", "BN"],
      ["Bulgaria", "BG"],
      ["Burkina Faso", "BF"],
      ["Burundi", "BI"],
      ["Cabo Verde", "CV"],
      ["Cape Verde", "CV"],
      ["Cambodia", "KH"],
      ["Cameroon", "CM"],
      ["Canada", "CA"],
      ["Central African Republic", "CF"],
      ["Chad", "TD"],
      ["Chile", "CL"],
      ["China", "CN"],
      ["Colombia", "CO"],
      ["Comoros", "KM"],
      ["Congo", "CG"],
      ["Republic of the Congo", "CG"],
      ["Congo-Brazzaville", "CG"],
      ["Democratic Republic of the Congo", "CD"],
      ["Democratic Republic of Congo", "CD"],
      ["DR Congo", "CD"],
      ["DRC", "CD"],
      ["Congo-Kinshasa", "CD"],
      ["Costa Rica", "CR"],
      ["Cote d'Ivoire", "CI"],
      ["Côte d'Ivoire", "CI"],
      ["Côte d’Ivoire", "CI"],
      ["Ivory Coast", "CI"],
      ["Croatia", "HR"],
      ["Cuba", "CU"],
      ["Cyprus", "CY"],
      ["Czechia", "CZ"],
      ["Czech Republic", "CZ"],
      ["Denmark", "DK"],
      ["Djibouti", "DJ"],
      ["Dominica", "DM"],
      ["Dominican Republic", "DO"],
      ["Ecuador", "EC"],
      ["Egypt", "EG"],
      ["El Salvador", "SV"],
      ["Equatorial Guinea", "GQ"],
      ["Eritrea", "ER"],
      ["Estonia", "EE"],
      ["Eswatini", "SZ"],
      ["Swaziland", "SZ"],
      ["Ethiopia", "ET"],
      ["Fiji", "FJ"],
      ["Finland", "FI"],
      ["France", "FR"],
      ["Gabon", "GA"],
      ["Gambia", "GM"],
      ["The Gambia", "GM"],
      ["Georgia", "GE"],
      ["Germany", "DE"],
      ["Ghana", "GH"],
      ["Greece", "GR"],
      ["Grenada", "GD"],
      ["Guatemala", "GT"],
      ["Guinea", "GN"],
      ["Guinea-Bissau", "GW"],
      ["Guinea Bissau", "GW"],
      ["Guyana", "GY"],
      ["Haiti", "HT"],
      ["Honduras", "HN"],
      ["Hungary", "HU"],
      ["Iceland", "IS"],
      ["India", "IN"],
      ["Indonesia", "ID"],
      ["Iran", "IR"],
      ["Iraq", "IQ"],
      ["Ireland", "IE"],
      ["Republic of Ireland", "IE"],
      ["Italy", "IT"],
      ["Jamaica", "JM"],
      ["Japan", "JP"],
      ["Jordan", "JO"],
      ["Kazakhstan", "KZ"],
      ["Kenya", "KE"],
      ["Kiribati", "KI"],
      ["North Korea", "KP"],
      ["South Korea", "KR"],
      ["Korea, Republic of", "KR"],
      ["Kuwait", "KW"],
      ["Kyrgyzstan", "KG"],
      ["Laos", "LA"],
      ["Lao PDR", "LA"],
      ["Latvia", "LV"],
      ["Lebanon", "LB"],
      ["Lesotho", "LS"],
      ["Liberia", "LR"],
      ["Libya", "LY"],
      ["Liechtenstein", "LI"],
      ["Lithuania", "LT"],
      ["Luxembourg", "LU"],
      ["Madagascar", "MG"],
      ["Malawi", "MW"],
      ["Malaysia", "MY"],
      ["Maldives", "MV"],
      ["Mali", "ML"],
      ["Malta", "MT"],
      ["Marshall Islands", "MH"],
      ["Mauritania", "MR"],
      ["Mauritius", "MU"],
      ["Mexico", "MX"],
      ["Micronesia", "FM"],
      ["Federated States of Micronesia", "FM"],
      ["Moldova", "MD"],
      ["Republic of Moldova", "MD"],
      ["Monaco", "MC"],
      ["Mongolia", "MN"],
      ["Montenegro", "ME"],
      ["Morocco", "MA"],
      ["Mozambique", "MZ"],
      ["Myanmar", "MM"],
      ["Burma", "MM"],
      ["Namibia", "NA"],
      ["Nauru", "NR"],
      ["Nepal", "NP"],
      ["Netherlands", "NL"],
      ["The Netherlands", "NL"],
      ["Holland", "NL"],
      ["New Zealand", "NZ"],
      ["Nicaragua", "NI"],
      ["Niger", "NE"],
      ["Nigeria", "NG"],
      ["North Macedonia", "MK"],
      ["Macedonia", "MK"],
      ["Norway", "NO"],
      ["Oman", "OM"],
      ["Pakistan", "PK"],
      ["Palau", "PW"],
      ["Palestine", "PS"],
      ["State of Palestine", "PS"],
      ["Panama", "PA"],
      ["Papua New Guinea", "PG"],
      ["Paraguay", "PY"],
      ["Peru", "PE"],
      ["Philippines", "PH"],
      ["Poland", "PL"],
      ["Portugal", "PT"],
      ["Qatar", "QA"],
      ["Romania", "RO"],
      ["Russia", "RU"],
      ["Russian Federation", "RU"],
      ["Rwanda", "RW"],
      ["Saint Kitts and Nevis", "KN"],
      ["Saint Lucia", "LC"],
      ["Saint Vincent and the Grenadines", "VC"],
      ["Samoa", "WS"],
      ["San Marino", "SM"],
      ["Sao Tome and Principe", "ST"],
      ["São Tomé and Príncipe", "ST"],
      ["Saudi Arabia", "SA"],
      ["Senegal", "SN"],
      ["Serbia", "RS"],
      ["Seychelles", "SC"],
      ["Sierra Leone", "SL"],
      ["Singapore", "SG"],
      ["Slovakia", "SK"],
      ["Slovenia", "SI"],
      ["Solomon Islands", "SB"],
      ["Somalia", "SO"],
      ["South Africa", "ZA"],
      ["South Sudan", "SS"],
      ["Spain", "ES"],
      ["Sri Lanka", "LK"],
      ["Sudan", "SD"],
      ["Suriname", "SR"],
      ["Sweden", "SE"],
      ["Switzerland", "CH"],
      ["Syria", "SY"],
      ["Syrian Arab Republic", "SY"],
      ["Tajikistan", "TJ"],
      ["Tanzania", "TZ"],
      ["United Republic of Tanzania", "TZ"],
      ["Thailand", "TH"],
      ["Timor-Leste", "TL"],
      ["Timor Leste", "TL"],
      ["East Timor", "TL"],
      ["Togo", "TG"],
      ["Tonga", "TO"],
      ["Trinidad and Tobago", "TT"],
      ["Tunisia", "TN"],
      ["Tunisie", "TN"],
      ["Turkey", "TR"],
      ["Türkiye", "TR"],
      ["Turkiye", "TR"],
      ["Turkmenistan", "TM"],
      ["Tuvalu", "TV"],
      ["Uganda", "UG"],
      ["Ukraine", "UA"],
      ["United Arab Emirates", "AE"],
      ["UAE", "AE"],
      ["United Kingdom", "GB"],
      ["UK", "GB"],
      ["Great Britain", "GB"],
      ["Britain", "GB"],
      ["United States", "US"],
      ["United States of America", "US"],
      ["USA", "US"],
      ["America", "US"],
      ["Uruguay", "UY"],
      ["Uzbekistan", "UZ"],
      ["Vanuatu", "VU"],
      ["Vatican City", "VA"],
      ["Vatican", "VA"],
      ["Holy See", "VA"],
      ["Venezuela", "VE"],
      ["Vietnam", "VN"],
      ["Viet Nam", "VN"],
      ["Yemen", "YE"],
      ["Zambia", "ZM"],
      ["Zimbabwe", "ZW"],
  
      // Additional commonly encountered territories.
      ["Taiwan", "TW"],
      ["Kosovo", "XK"],
      ["Hong Kong", "HK"],
      ["Macau", "MO"],
      ["Macao", "MO"],
      ["Puerto Rico", "PR"],
      ["Guam", "GU"],
      ["Greenland", "GL"],
      ["Faroe Islands", "FO"],
      ["Bermuda", "BM"],
      ["Cayman Islands", "KY"],
      ["Aruba", "AW"],
      ["Curacao", "CW"],
      ["Curaçao", "CW"],
      ["Gibraltar", "GI"],
      ["Isle of Man", "IM"],
      ["Jersey", "JE"],
      ["Guernsey", "GG"],
      ["French Polynesia", "PF"],
      ["New Caledonia", "NC"],
      ["Réunion", "RE"],
      ["Reunion", "RE"],
      ["Mayotte", "YT"],
      ["Martinique", "MQ"],
      ["Guadeloupe", "GP"],
      ["French Guiana", "GF"],
      ["American Samoa", "AS"],
      ["U.S. Virgin Islands", "VI"],
      ["British Virgin Islands", "VG"],
      ["Northern Mariana Islands", "MP"],
      ["Cook Islands", "CK"],
      ["Niue", "NU"],
      ["Tokelau", "TK"],
      ["Anguilla", "AI"],
      ["Montserrat", "MS"],
      ["Turks and Caicos Islands", "TC"],
      ["Saint Martin", "MF"],
      ["Sint Maarten", "SX"],
      ["Saint Barthelemy", "BL"],
      ["Saint Barthélemy", "BL"],
      ["South Georgia and the South Sandwich Islands", "GS"],
      ["Falkland Islands", "FK"],
      ["Christmas Island", "CX"],
      ["Cocos Islands", "CC"],
      ["Cocos (Keeling) Islands", "CC"],
      ["Norfolk Island", "NF"],
      ["Pitcairn Islands", "PN"],
      ["Wallis and Futuna", "WF"],
      ["Svalbard and Jan Mayen", "SJ"],
      ["British Indian Ocean Territory", "IO"],
      ["French Southern Territories", "TF"],
      ["United States Minor Outlying Islands", "UM"],
      ["Bouvet Island", "BV"],
      ["Heard Island and McDonald Islands", "HM"],
      ["Antarctica", "AQ"],
      ["Åland Islands", "AX"],
      ["Aland Islands", "AX"]
    ].flatMap(([name, code]) => [
      [name.toLowerCase(), code],
      [code.toLowerCase(), code]
    ])
  );


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
