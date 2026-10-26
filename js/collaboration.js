/* ==========================================
   COLLABORATION MEETING BOOKING
   Sticky Tab + Collapse/Restore + Modal
   Calendly Integration + Accessibility
========================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ==========================================
  // 1. GET HTML ELEMENTS
  // ==========================================

  const widget = document.getElementById("collabWidget");
  const tab = document.getElementById("collabTab");
  const dismissBtn = document.getElementById("collabDismiss");
  const restoreBtn = document.getElementById("collabRestore");

  const overlay = document.getElementById("collabOverlay");

  const modal = overlay
    ? overlay.querySelector(".collab-modal")
    : null;

  const closeBtn = document.getElementById("collabClose");
  const calendar = document.getElementById("collabCalendar");

  // Stop safely if required HTML elements are missing.
  if (
    !widget ||
    !tab ||
    !dismissBtn ||
    !restoreBtn ||
    !overlay ||
    !modal ||
    !closeBtn ||
    !calendar
  ) {
    console.error(
      "Collaboration widget: Required HTML elements are missing."
    );
    return;
  }

  // ==========================================
  // 2. STATE VARIABLES
  // ==========================================

  let previousFocus = null;
  let showTimer = null;
  let modalOpen = false;
  let previousBodyOverflow = "";

  // ==========================================
  // 3. SHOW THE STICKY WIDGET
  // ==========================================

  // Display the widget after three seconds.
  showTimer = window.setTimeout(function () {
    widget.classList.add("show");
  }, 3000);

  // ==========================================
  // 4. COLLAPSE THE STICKY WIDGET
  // ==========================================

  dismissBtn.addEventListener("click", function () {
    // Hide the widget.
    widget.classList.remove("show");

    // Display the restore button.
    restoreBtn.hidden = false;

    // Move keyboard focus to the restore button.
    restoreBtn.focus();
  });

  // ==========================================
  // 5. RESTORE THE STICKY WIDGET
  // ==========================================

  restoreBtn.addEventListener("click", function () {
    // Hide the restore button.
    restoreBtn.hidden = true;

    // Show the widget.
    widget.classList.add("show");

    // Return focus to the main collaboration button.
    tab.focus();
  });

  // ==========================================
  // 6. OPEN THE BOOKING MODAL
  // ==========================================

  function openModal() {
    // Prevent duplicate opening.
    if (modalOpen) {
      return;
    }

    modalOpen = true;

    // Remember the element that had keyboard focus.
    previousFocus = document.activeElement;

    // Apply the correct CSS class.
    // IMPORTANT: CSS uses .active, not .show.
    overlay.classList.add("active");

    // Update accessibility state.
    overlay.setAttribute("aria-hidden", "false");

    // Prevent the background page from scrolling.
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Load Calendly only when the modal is first opened.
    if (!calendar.getAttribute("src")) {
      const calendarUrl = calendar.dataset.src;

      if (calendarUrl) {
        calendar.setAttribute("src", calendarUrl);
      } else {
        console.error(
          "Collaboration widget: Calendly URL is missing from data-src."
        );
      }
    }

    // Move keyboard focus to the close button.
    closeBtn.focus();
  }

  // Open the modal when the main tab is clicked.
  tab.addEventListener("click", openModal);

  // ==========================================
  // 7. CLOSE THE BOOKING MODAL
  // ==========================================

  function closeModal() {
    // Do nothing if the modal is already closed.
    if (!modalOpen) {
      return;
    }

    modalOpen = false;

    // Remove the correct CSS class.
    overlay.classList.remove("active");

    // Update accessibility state.
    overlay.setAttribute("aria-hidden", "true");

    // Restore the body's previous scrolling setting.
    document.body.style.overflow = previousBodyOverflow;

    // Restore keyboard focus.
    if (
      previousFocus &&
      document.contains(previousFocus) &&
      typeof previousFocus.focus === "function"
    ) {
      previousFocus.focus();
    }

    previousFocus = null;
  }

  // Close using the close button.
  closeBtn.addEventListener("click", closeModal);

  // Close when the dark backdrop is clicked.
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeModal();
    }
  });

  // ==========================================
  // 8. KEYBOARD ACCESSIBILITY
  // ==========================================

  document.addEventListener("keydown", function (event) {
    // Handle keyboard input only when the modal is open.
    if (!modalOpen) {
      return;
    }

    // Close the modal with Escape.
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    // Keep keyboard focus inside the modal.
    if (event.key === "Tab") {
      const focusableElements = Array.from(
        modal.querySelectorAll(
          [
            "button:not([disabled])",
            "a[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "iframe",
            '[tabindex]:not([tabindex="-1"])'
          ].join(",")
        )
      ).filter(function (element) {
        return (
          element.getClientRects().length > 0 &&
          element.getAttribute("aria-hidden") !== "true"
        );
      });

      // If no focusable elements exist, focus the modal itself.
      if (focusableElements.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      // Shift + Tab from the first element wraps to the last.
      if (
        event.shiftKey &&
        (
          document.activeElement === firstElement ||
          !modal.contains(document.activeElement)
        )
      ) {
        event.preventDefault();
        lastElement.focus();
      }

      // Tab from the last element wraps to the first.
      else if (
        !event.shiftKey &&
        (
          document.activeElement === lastElement ||
          !modal.contains(document.activeElement)
        )
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  // ==========================================
  // 9. INITIAL ACCESSIBILITY STATE
  // ==========================================

  // Ensure the modal starts closed.
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");

  // Ensure the restore button starts hidden.
  restoreBtn.hidden = true;

  // ==========================================
  // 10. CLEANUP
  // ==========================================

  window.addEventListener("pagehide", function () {
    if (showTimer !== null) {
      window.clearTimeout(showTimer);
      showTimer = null;
    }
  });

});
