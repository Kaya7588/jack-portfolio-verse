export type LangId = "en" | "hi" | "ar";

export const LANG_META: Record<LangId, { label: string; sub: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English", sub: "Continue in English", dir: "ltr" },
  hi: { label: "हिन्दी", sub: "हिन्दी में जारी रखें", dir: "ltr" },
  ar: { label: "العربية", sub: "المتابعة بالعربية", dir: "rtl" },
};

export type Dict = {
  skip: string;
  next: string;
  getStarted: string;
  continue: string;
  finish: string;
  restart: string;
  back: string;
  features: { title: string; body: string }[];
  langTitle: string;
  langSub: string;
  themeTitle: string;
  themeSub: string;
  themes: { mono: { label: string; sub: string }; dark: { label: string; sub: string }; cream: { label: string; sub: string } };
  currencyTitle: string;
  currencySub: string;
  sample: string;
  doneTitle: string;
  doneBody: string;
  language: string;
  theme: string;
  currency: string;
  storePreview: string;
  stories: { name: string; tag: string }[];
};

export const DICTS: Record<LangId, Dict> = {
  en: {
    skip: "Skip",
    next: "Next",
    getStarted: "Get Started",
    continue: "Continue",
    finish: "Finish",
    restart: "Restart Onboarding",
    back: "Back",
    features: [
      { title: "Welcome to Arya Premium", body: "Your automated store inside Telegram for premium audio and video story series — delivered instantly to your chat." },
      { title: "Buy Stories in Minutes", body: "Pay with UPI, Cards, NetBanking, Wallets or Crypto. Multi-currency pricing with 10–15 second UTR auto-verification." },
      { title: "Instant Telegram Delivery", body: "Episodes land in your own Telegram with lifetime access. Forwarding and downloading stay on, always. (T&C apply)" },
      { title: "24/7 Live Support", body: "Real-time chat with dedicated agents and a built-in Story Request portal for missing episodes and series." },
    ],
    langTitle: "Choose your Language",
    langSub: "Pick the language you're most comfortable with. You can change this later in Settings.",
    themeTitle: "Pick your Theme",
    themeSub: "How should Arya Premium look? Applied after onboarding.",
    themes: {
      mono: { label: "Mono", sub: "Minimal monochrome" },
      dark: { label: "Dark", sub: "Deep contrast (default)" },
      cream: { label: "Cream", sub: "Soft warm paper" },
    },
    currencyTitle: "Select your Currency",
    currencySub: "Prices across the store will show in this currency.",
    sample: "sample",
    doneTitle: "You're all set",
    doneBody: "Welcome to Arya Premium. Your personal audio & video story store is ready inside Telegram.",
    language: "Language",
    theme: "Theme",
    currency: "Currency",
    storePreview: "Store preview",
    stories: [
      { name: "Midnight Whisper", tag: "Audio series" },
      { name: "Neon Rain", tag: "Video series" },
      { name: "The Last Signal", tag: "Bundle" },
    ],
  },
  hi: {
    skip: "छोड़ें",
    next: "आगे",
    getStarted: "शुरू करें",
    continue: "जारी रखें",
    finish: "पूरा करें",
    restart: "फिर से शुरू करें",
    back: "वापस",
    features: [
      { title: "आर्य प्रीमियम में स्वागत है", body: "टेलीग्राम के अंदर आपकी अपनी ऑटोमेटेड दुकान — प्रीमियम ऑडियो और वीडियो कहानियाँ तुरंत आपकी चैट में।" },
      { title: "मिनटों में कहानियाँ खरीदें", body: "UPI, कार्ड, नेटबैंकिंग, वॉलेट या क्रिप्टो से भुगतान करें। 10–15 सेकंड में UTR वेरिफिकेशन।" },
      { title: "तुरंत टेलीग्राम डिलीवरी", body: "एपिसोड आपकी अपनी टेलीग्राम में आजीवन एक्सेस के साथ आते हैं। फॉरवर्ड और डाउनलोड हमेशा चालू।" },
      { title: "24/7 लाइव सपोर्ट", body: "समर्पित एजेंट्स से रीयल-टाइम चैट और मिसिंग एपिसोड के लिए बिल्ट-इन स्टोरी रिक्वेस्ट पोर्टल।" },
    ],
    langTitle: "अपनी भाषा चुनें",
    langSub: "वह भाषा चुनें जिसमें आप सहज हों। आप इसे बाद में सेटिंग्स में बदल सकते हैं।",
    themeTitle: "अपनी थीम चुनें",
    themeSub: "आर्य प्रीमियम कैसा दिखे? ऑनबोर्डिंग के बाद लागू होगा।",
    themes: {
      mono: { label: "मोनो", sub: "मिनिमल मोनोक्रोम" },
      dark: { label: "डार्क", sub: "डीप कॉन्ट्रास्ट (डिफ़ॉल्ट)" },
      cream: { label: "क्रीम", sub: "हल्का गरम पेपर" },
    },
    currencyTitle: "अपनी मुद्रा चुनें",
    currencySub: "स्टोर में सभी क़ीमतें इसी मुद्रा में दिखेंगी।",
    sample: "नमूना",
    doneTitle: "आप तैयार हैं",
    doneBody: "आर्य प्रीमियम में आपका स्वागत है। आपकी निजी ऑडियो और वीडियो कहानी दुकान तैयार है।",
    language: "भाषा",
    theme: "थीम",
    currency: "मुद्रा",
    storePreview: "स्टोर प्रीव्यू",
    stories: [
      { name: "मिडनाइट व्हिस्पर", tag: "ऑडियो सीरीज़" },
      { name: "नियॉन रेन", tag: "वीडियो सीरीज़" },
      { name: "द लास्ट सिग्नल", tag: "बंडल" },
    ],
  },
  ar: {
    skip: "تخطي",
    next: "التالي",
    getStarted: "ابدأ الآن",
    continue: "متابعة",
    finish: "إنهاء",
    restart: "إعادة البدء",
    back: "رجوع",
    features: [
      { title: "أهلاً بك في آريا بريميوم", body: "متجرك الآلي داخل تيليجرام لمسلسلات صوتية ومرئية مميزة — تصلك فوراً في محادثتك." },
      { title: "اشترِ القصص في دقائق", body: "ادفع عبر UPI أو البطاقات أو المحافظ أو العملات الرقمية. تحقق تلقائي من UTR خلال 10–15 ثانية." },
      { title: "توصيل فوري عبر تيليجرام", body: "تصلك الحلقات داخل تيليجرام مع وصول مدى الحياة. إعادة التوجيه والتنزيل مفعّلان دائماً." },
      { title: "دعم مباشر 24/7", body: "محادثة فورية مع وكلاء مخصصين وبوابة مدمجة لطلب القصص المفقودة." },
    ],
    langTitle: "اختر لغتك",
    langSub: "اختر اللغة التي تفضلها. يمكنك تغييرها لاحقاً من الإعدادات.",
    themeTitle: "اختر المظهر",
    themeSub: "كيف يبدو آريا بريميوم؟ يُطبَّق بعد الإعداد.",
    themes: {
      mono: { label: "أحادي", sub: "بسيط أحادي اللون" },
      dark: { label: "داكن", sub: "تباين عميق (افتراضي)" },
      cream: { label: "كريمي", sub: "ورقي دافئ" },
    },
    currencyTitle: "اختر عملتك",
    currencySub: "ستظهر الأسعار في المتجر بهذه العملة.",
    sample: "عيّنة",
    doneTitle: "أنت جاهز",
    doneBody: "أهلاً بك في آريا بريميوم. متجر القصص الصوتية والمرئية الخاص بك جاهز داخل تيليجرام.",
    language: "اللغة",
    theme: "المظهر",
    currency: "العملة",
    storePreview: "معاينة المتجر",
    stories: [
      { name: "همس منتصف الليل", tag: "مسلسل صوتي" },
      { name: "مطر نيون", tag: "مسلسل مرئي" },
      { name: "الإشارة الأخيرة", tag: "حزمة" },
    ],
  },
};
