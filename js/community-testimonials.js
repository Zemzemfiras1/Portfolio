/*
 * Community testimonial renderer for index.html.
 * Load this script AFTER js/main.js so Owl Carousel has initialized.
 * All user-controlled strings are assigned with textContent, never innerHTML.
 */
(function () {
  "use strict";

  const DATA_URL = "data/community-testimonials.json";
  const AVATAR_URL = "images/testimonial/default-avatar.svg";
  const section = document.querySelector("#testimonials-section");
  const carousel = section && section.querySelector(".testimonial-carousel");

  if (!carousel) return;

  function addTextElement(parent, tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = value || "";
    parent.appendChild(el);
    return el;
  }

  function addExternalLink(list, url, iconClass, label) {
    if (!url) return;
    let parsed;
    try { parsed = new URL(url); } catch (_) { return; }
    if (parsed.protocol !== "https:" || parsed.hostname !== "www.linkedin.com" && parsed.hostname !== "linkedin.com" && !parsed.hostname.endsWith(".linkedin.com")) return;

    const li = document.createElement("li");
    li.className = "ftco-animate";
    const a = document.createElement("a");
    a.href = parsed.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", label);
    const span = document.createElement("span");
    span.className = iconClass;
    a.appendChild(span);
    li.appendChild(a);
    list.appendChild(li);
  }

  function buildCard(t) {
    const item = document.createElement("div");
    item.className = "item";

    const card = document.createElement("div");
    card.className = "testimonial-card";
    item.appendChild(card);

    // fix uploaded testimonil img url vs default

    const imageWrap = document.createElement("div");
    imageWrap.className = "testimonial-img";
    
    const img = document.createElement("img");
    
    // Use the submitted photo when it is a valid HTTPS Google Drive URL.
    function getProfileImageUrl(value) {
      if (typeof value !== "string" || !value.trim()) {
        return AVATAR_URL;
      }
    
      try {
        const url = new URL(value.trim());
    
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
      } catch {
        return AVATAR_URL;
      }
    }
    
    img.src = getProfileImageUrl(t.imageUrl);
    img.alt = "Profile photo of " + t.name;
    img.loading = "lazy";
    img.onerror = function () {
      // Fall back to the default avatar if the uploaded image
      // cannot be loaded or accessed.
      img.onerror = null;
      img.src = AVATAR_URL;
    };
    
    imageWrap.appendChild(img);
    card.appendChild(imageWrap);


    const content = document.createElement("div");
    content.className = "testimonial-content";
    const quote = document.createElement("div");
    quote.className = "quote-icon";
    const quoteIcon = document.createElement("span");
    quoteIcon.className = "icon-quote-left";
    quote.appendChild(quoteIcon);
    content.appendChild(quote);
    addTextElement(content, "p", "testimonial-text", "“" + t.message + "”");

    const social = document.createElement("ul");
    social.className = "ftco-footer-social list-unstyled mt-4";
    addExternalLink(social, t.linkedinUrl, "icon-linkedin", "LinkedIn profile for " + t.name);

    if (t.country) {
      const li = document.createElement("li");
      li.className = "ftco-animate";
      const country = addTextElement(li, "span", "testimonial-country", t.country);
      country.title = t.country;
      social.appendChild(li);
    }
    content.appendChild(social);
    card.appendChild(content);

    const person = document.createElement("div");
    person.className = "testimonial-person";
    addTextElement(person, "h3", "", t.name);
    addTextElement(person, "span", "position", [t.position, t.organization].filter(Boolean).join(" · "));
    card.appendChild(person);
    return item;
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("Could not load community testimonials");
      return response.json();
    })
    .then(records => {
      if (!Array.isArray(records) || !records.length) return;

      // Preserve the existing Owl Carousel instance and styling.
      const $carousel = window.jQuery && window.jQuery(carousel);
      const owlReady = $carousel && $carousel.data("owl.carousel");
      records.forEach(t => {
        if (!t || typeof t.name !== "string" || typeof t.message !== "string") return;
        const card = buildCard(t);
        if (owlReady) {
          $carousel.trigger("add.owl.carousel", [card]);
        } else {
          carousel.appendChild(card);
        }
      });
      if (owlReady) $carousel.trigger("refresh.owl.carousel");
    })
    .catch(error => console.warn("[testimonials]", error.message));
})();
