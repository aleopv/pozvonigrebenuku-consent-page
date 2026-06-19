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
      url: "https://drive.google.com/file/d/1YOiVHTsf0qtYiI6jU8u93wRfWxArWkb2/view?usp=sharing",
      version: "replace-with-current-version"
    },
    privacy: {
      url: "https://drive.google.com/file/d/1YOiVHTsf0qtYiI6jU8u93wRfWxArWkb2/view?usp=sharing",
      version: "replace-with-current-version"
    },
    personalData: {
      url: "https://drive.google.com/file/d/1YOiVHTsf0qtYiI6jU8u93wRfWxArWkb2/view?usp=sharing",
      version: "replace-with-current-version"
    },
    aiConversation: {
      url: "https://drive.google.com/file/d/1YOiVHTsf0qtYiI6jU8u93wRfWxArWkb2/view?usp=sharing",
      version: "replace-with-current-version"
    },
    subscription: {
      url: "https://drive.google.com/file/d/1YOiVHTsf0qtYiI6jU8u93wRfWxArWkb2/view?usp=sharing",
      version: "replace-with-current-version"
    }
  }
};
