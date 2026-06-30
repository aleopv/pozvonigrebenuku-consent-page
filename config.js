window.CONSENT_PAGE_CONFIG = {
  price: "10 000 ₽",

  // Логотип возвращает на стартовый экран основного бота.
  defaultBackUrl: "https://t.me/grebenyuk_call_bot?start=start",

  // Production PDF кладем в ./static и версионируем прямо в имени файла.
  // Пример: url: "./static/offer-v2026-06-29.pdf", version: "v2026-06-29"
  documents: {
    offer: {
      url: "./static/offer-v2026-06-29.pdf",
      version: "v2026-06-29"
    },
    privacy: {
      url: "./static/privacy-v2026-06-29.pdf",
      version: "v2026-06-29"
    },
    personalData: {
      url: "./static/personal-data-v2026-06-29.pdf",
      version: "v2026-06-29"
    },
    recording: {
      url: "./static/recording-v2026-06-29.pdf",
      version: "v2026-06-29"
    },
    aiConversation: {
      url: "./static/recording-v2026-06-29.pdf",
      version: "v2026-06-29"
    },
    subscription: {
      url: "./static/subscription-v2026-06-29.pdf",
      version: "v2026-06-29"
    },
    marketing: {
      url: "./static/marketing-v2026-06-29.pdf",
      version: "v2026-06-29"
    }
  }
};
