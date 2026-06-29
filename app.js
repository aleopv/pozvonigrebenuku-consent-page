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
  const params = new URLSearchParams(window.location.search);
  const telegram = window.Telegram?.WebApp;
  const state = {
    isSubmitting: false,
    recoveryTimer: null
  };

  const defaultNotice = "Для перехода к оплате нужны все отметки, кроме рекламной рассылки. Рассылку можно оставить выключенной.";

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

  const returnUrl = safeReturnUrl(config.defaultReturnUrl)
    || "https://t.me/";
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
    continueButton.disabled = state.isSubmitting || !isComplete;
    continueButton.querySelector("span").textContent = state.isSubmitting
      ? "Сохраняем"
      : "Продолжить";
    selectRequiredButton.innerHTML = isComplete
      ? "<span aria-hidden=\"true\">↺</span> Снять обязательные отметки"
      : "<span aria-hidden=\"true\">✓</span> Выбрать обязательные отметки";

    if (notice?.classList.contains("is-error") && isComplete) {
      setNotice(defaultNotice);
    }
  };

  const resetSubmittingState = () => {
    window.clearTimeout(state.recoveryTimer);
    state.isSubmitting = false;
    updateState();
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

  const buildPayload = () => {
    const data = new FormData(form);
    const documents = Object.fromEntries(
      Object.entries(config.documents || {}).map(([key, value]) => [
        key,
        value?.version || "not-set"
      ])
    );

    return {
      type: "consent_accepted",
      nextStep: "payment_ready",
      sessionId: params.get("session_id") || "",
      userId: params.get("user_id") || "",
      acceptedAt: new Date().toISOString(),
      documents,
      consents: {
        offer: data.has("offer"),
        personalData: data.has("personal_data"),
        recording: data.has("recording"),
        aiProcessing: data.has("ai_processing"),
        recurringPayment: data.has("recurring_payment"),
        marketing: data.has("marketing")
      }
    };
  };

  const saveConsent = async (payload) => {
    if (!config.submitUrl) {
      localStorage.setItem("pg:last-consent", JSON.stringify(payload));
      return { demo: true };
    }

    const response = await fetch(config.submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Consent endpoint returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? response.json() : {};
  };

  const finishFlow = (payload, responseData) => {
    const nextUrl = safeReturnUrl(responseData?.returnUrl) || returnUrl;

    if (telegram?.sendData && params.get("telegram_webapp") === "1") {
      telegram.sendData(JSON.stringify(payload));
      window.setTimeout(() => telegram.close(), 250);
      return;
    }

    window.location.assign(nextUrl);
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
      setNotice("Отметь, пожалуйста, все обязательные пункты, чтобы продолжить.", "error");
      requiredInputs.find((input) => !input.checked)?.focus();
      return;
    }

    if (state.isSubmitting) return;
    state.isSubmitting = true;
    updateState();
    setNotice("Фиксируем согласия и возвращаем тебя в бот для перехода к оплате…");

    try {
      const payload = buildPayload();
      const responseData = await saveConsent(payload);
      setNotice("Согласия приняты. В боте откроется следующий шаг — переход к оплате.", "success");
      finishFlow(payload, responseData);
      state.recoveryTimer = window.setTimeout(() => {
        if (document.visibilityState === "visible") resetSubmittingState();
      }, 2500);
    } catch (error) {
      console.error(error);
      setNotice("Не удалось сохранить согласия. Проверь, пожалуйста, соединение и попробуй ещё раз.", "error");
      resetSubmittingState();
    }
  });

  applyConfig();
  setupInlineDocumentLinks();
  updateState();
  window.requestAnimationFrame(updateState);
  window.setTimeout(updateState, 0);
  window.setTimeout(updateState, 250);
  window.addEventListener("pageshow", resetSubmittingState);
  window.addEventListener("focus", scheduleStateSync);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resetSubmittingState();
  });
  telegram?.ready?.();
  telegram?.expand?.();
})();
