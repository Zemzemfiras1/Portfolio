/**
 * Portfolio testimonial intake.
 *
 * Install as a spreadsheet-bound Apps Script project on the
 * Google Form response spreadsheet.
 *
 * Required Script Property:
 * GITHUB_TOKEN
 */

const CONFIG = {
  owner: "Zemzemfiras1",
  repo: "Portfolio",
  eventType: "testimonial_submission",
  maxName: 100,
  maxPosition: 120,
  maxCountry: 80,
  maxMessage: 1200
};

/**
 * These field names must match your Google Sheets headers exactly.
 */
const FORM_FIELDS = {
  name: "Full Name :",
  position: "Position or job title :",
  country: "Country :",
  message: "Your testimonial :",
  linkedin: "LinkedIn profile URL :",
  github: "Github link URL",
  consent: "Permission to publish :",
  timestamp: "Horodateur"
};

function onFormSubmit(e) {
  if (!e || !e.namedValues) {
    throw new Error(
      "Run this function using the spreadsheet form-submit trigger."
    );
  }

  const nv = e.namedValues;

  const get = (title) =>
    String((nv[title] || [""])[0] || "").trim();

  // Publication consent is mandatory.
  const consent = get(FORM_FIELDS.consent);

  if (!/agree/i.test(consent)) {
    throw new Error(
      "Submission does not contain publication consent."
    );
  }

  // Validate and normalize submitted information.
  const item = {
    name: cleanText(
      get(FORM_FIELDS.name),
      CONFIG.maxName,
      "Full Name"
    ),

    position: cleanText(
      get(FORM_FIELDS.position),
      CONFIG.maxPosition,
      "Position or job title"
    ),

    country: cleanText(
      get(FORM_FIELDS.country),
      CONFIG.maxCountry,
      "Country",
      true
    ),

    message: cleanText(
      get(FORM_FIELDS.message),
      CONFIG.maxMessage,
      "Your testimonial"
    ),

    linkedinUrl: validateProfileUrl(
      get(FORM_FIELDS.linkedin),
      "linkedin.com",
      "LinkedIn"
    ),

    githubUrl: validateProfileUrl(
      get(FORM_FIELDS.github),
      "github.com",
      "GitHub"
    ),

    submittedAt:
      get(FORM_FIELDS.timestamp) || new Date().toISOString()
  };

  // Generate a deterministic ID for retry protection.
  const digestInput = [
    item.submittedAt,
    item.name.toLowerCase(),
    item.message.toLowerCase()
  ].join("\n");

  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    digestInput,
    Utilities.Charset.UTF_8
  );

  item.id =
    "t-" +
    digest
      .slice(0, 8)
      .map(b =>
        ("0" + ((b + 256) % 256).toString(16)).slice(-2)
      )
      .join("");

  const props = PropertiesService.getScriptProperties();
  const propertyKey = "SUBMITTED_" + item.id;

  if (props.getProperty(propertyKey)) {
    console.log("Already dispatched response " + item.id);
    return;
  }

  const token = props.getProperty("GITHUB_TOKEN");

  if (!token) {
    throw new Error(
      "Missing Script Property GITHUB_TOKEN."
    );
  }

  const url =
    "https://api.github.com/repos/" +
    CONFIG.owner +
    "/" +
    CONFIG.repo +
    "/dispatches";

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    payload: JSON.stringify({
      event_type: CONFIG.eventType,
      client_payload: item
    }),
    muteHttpExceptions: true
  });

  const status = response.getResponseCode();

  if (status < 200 || status >= 300) {
    throw new Error(
      "GitHub dispatch failed (" +
      status +
      "): " +
      response.getContentText()
    );
  }

  // Save only after GitHub accepts the event.
  props.setProperty(
    propertyKey,
    new Date().toISOString()
  );

  console.log("Dispatched testimonial " + item.id);
}

/**
 * Clean text input and enforce its maximum length.
 */
function cleanText(value, maxLength, label, optional) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text && optional) return "";

  if (!text) {
    throw new Error(label + " is required.");
  }

  if (text.length > maxLength) {
    throw new Error(
      label + " exceeds " + maxLength + " characters."
    );
  }

  return text.replace(
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
    ""
  );
}

/**
 * Validate optional LinkedIn and GitHub HTTPS profile URLs.
 * Empty URLs are allowed.
 */
function validateProfileUrl(value, allowedDomain, label) {
  const raw = String(value || "").trim();

  if (!raw) return "";

  if (raw.length > 300) {
    throw new Error(label + " URL is too long.");
  }

  const escapedDomain = allowedDomain.replace(/\./g, "\\.");

  const pattern = new RegExp(
    "^https://(?:[a-z0-9-]+\\.)*" +
    escapedDomain +
    "/[^\\s<>\"'`]*$",
    "i"
  );

  if (!pattern.test(raw)) {
    throw new Error(
      "Enter a valid HTTPS " + label + " profile URL."
    );
  }

  return raw;
}
