(() => {
  "use strict";

  const config = window.CONSENT_PAGE_CONFIG || {};
  const form = document.querySelector("#consent-form");
  if (!form) return;

  const requiredInputs = Array.from(form.querySelectorAll("input[required]"));
  const continueButton = document.querySelector("#continue-button");
  const selectRequiredButton = document.querySelector("#select-required");
  const notice = document.querySelector("#form-notice");
  const noticeText = notice?.querySelector("p");
  const dialog = document.querySelector("#documents-dialog");
  const closeDialogButtons = document.querySelectorAll("[data-close-dialog]");
  const telegram = window.Telegram?.WebApp;

  const defaultNotice = "Для перехода к оплате нужны все отметки.";

  const safeReturnUrl = (value) => {
    if (!value) return "";

    try {
      const url = new URL(value, window.location.origin);
      const allowedProtocols = ["https:", "http:", "tg:"];
      return allowedProtocols.includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };

  const backUrl = safeReturnUrl(config.defaultBackUrl)
    || "https://t.me/";

  const setNotice = (message, type = "") => {
    if (!notice || !noticeText) return;
    noticeText.textContent = message;
    notice.classList.toggle("is-error", type === "error");
    notice.classList.toggle("is-success", type === "success");
  };

  const allRequiredChecked = () => requiredInputs.every((input) => input.checked);

  const updateState = () => {
    const isComplete = allRequiredChecked();
    continueButton.disabled = !isComplete;
    continueButton.querySelector("span").textContent = "Продолжить";
    selectRequiredButton.innerHTML = isComplete
      ? "<span aria-hidden=\"true\">↺</span> Снять все отметки"
      : "<span aria-hidden=\"true\">✓</span> Выбрать все отметки";

    if (notice?.classList.contains("is-error") && isComplete) {
      setNotice(defaultNotice);
    }
  };

  const scheduleStateSync = () => {
    window.requestAnimationFrame(updateState);
    window.setTimeout(updateState, 0);
  };

  const openDocuments = (documentKey = "") => {
    if (!dialog) return;
    dialog.showModal();

    if (documentKey) {
      const item = dialog.querySelector(`[data-document-link="${documentKey}"]`);
      item?.focus();
    } else {
      dialog.querySelector(".dialog-close")?.focus();
    }
  };

  const closeDocuments = () => {
    if (dialog?.open) dialog.close();
  };

  const setupInlineDocumentLinks = () => {
    document.querySelectorAll("[data-inline-document]").forEach((link) => {
      const key = link.dataset.inlineDocument;
      const url = config.documents?.[key]?.url;

      if (url && url !== "#") {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        link.href = "#";
        link.setAttribute("role", "button");
        link.setAttribute("aria-haspopup", "dialog");
      }

      link.addEventListener("click", (event) => {
        event.stopPropagation();

        if (!url || url === "#") {
          event.preventDefault();
          openDocuments(key);
        }
      });
    });
  };

  const applyConfig = () => {
    document.querySelectorAll("[data-price]").forEach((element) => {
      element.textContent = config.price || "10 000 ₽";
    });

    document.querySelectorAll("[data-document-link]").forEach((link) => {
      const key = link.dataset.documentLink;
      const url = config.documents?.[key]?.url;

      if (url && url !== "#") {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
        link.removeAttribute("aria-disabled");
      } else {
        link.href = "#";
        link.addEventListener("click", (event) => {
          event.preventDefault();
        });
      }
    });
  };

  requiredInputs.forEach((input) => {
    input.addEventListener("change", updateState);
    input.addEventListener("input", updateState);
  });

  form.addEventListener("click", (event) => {
    if (event.target.closest(".check-row")) scheduleStateSync();
  });

  selectRequiredButton?.addEventListener("click", () => {
    const nextState = !allRequiredChecked();
    requiredInputs.forEach((input) => {
      input.checked = nextState;
    });
    updateState();
  });

  closeDialogButtons.forEach((button) => button.addEventListener("click", closeDocuments));

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeDocuments();
  });

  document.querySelectorAll("[data-back-button], [data-back-link]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.assign(backUrl);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!allRequiredChecked()) {
      setNotice("Отметь, пожалуйста, все пункты, чтобы продолжить.", "error");
      requiredInputs.find((input) => !input.checked)?.focus();
      return;
    }

    setNotice(defaultNotice);
  });

  applyConfig();
  setupInlineDocumentLinks();
  updateState();
  window.requestAnimationFrame(updateState);
  window.setTimeout(updateState, 0);
  window.setTimeout(updateState, 250);
  window.addEventListener("focus", scheduleStateSync);
  telegram?.ready?.();
  telegram?.expand?.();
})();
