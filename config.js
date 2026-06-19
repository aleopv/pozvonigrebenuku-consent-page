window.CONSENT_PAGE_CONFIG = {
  price: "10 000 ₽",

  // POST endpoint, который сохранит согласия перед переходом к оплате.
  // Оставьте пустым для демонстрационного режима.
  submitUrl: "",

  // Возвращает пользователя в бот на экран готовности к оплате.
  defaultReturnUrl: "https://t.me/grebenyuk_call_bot?start=payment_ready",

  // Кнопка «Назад» возвращает на стартовый экран основного бота.
  defaultBackUrl: "https://t.me/grebenyuk_call_bot?start=start",

  documents: {
    offer: {
      url: "#",
      version: "replace-with-current-version"
    },
    privacy: {
      url: "#",
      version: "replace-with-current-version"
    },
    personalData: {
      url: "#",
      version: "replace-with-current-version"
    },
    aiConversation: {
      url: "#",
      version: "replace-with-current-version"
    },
    subscription: {
      url: "#",
      version: "replace-with-current-version"
    }
  }
};
