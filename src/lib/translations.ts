export type Language = "en" | "ha" | "yo" | "sw" | "fr" | "ig" | "pcm" | "am" | "zu";

export type TranslationKeys = {
  // Common UI
  app_name: string;
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  back: string;
  next: string;
  submit: string;
  confirm: string;
  close: string;
  search: string;
  no_results: string;
  retry: string;
  offline: string;
  online: string;

  // Navigation
  nav_home: string;
  nav_knowledge: string;
  nav_market: string;
  nav_community: string;
  nav_profile: string;
  nav_ask_ai: string;
  nav_consult: string;

  // Onboarding
  onboarding_welcome: string;
  onboarding_subtitle: string;
  onboarding_language_prompt: string;
  onboarding_name_label: string;
  onboarding_name_placeholder: string;
  onboarding_phone_label: string;
  onboarding_phone_placeholder: string;
  onboarding_location_label: string;
  onboarding_location_placeholder: string;
  onboarding_farm_size_label: string;
  onboarding_farm_size_placeholder: string;
  onboarding_crops_label: string;
  onboarding_crops_placeholder: string;
  onboarding_complete_btn: string;

  // Dashboard
  dashboard_greeting: string;
  dashboard_weather_title: string;
  dashboard_articles_title: string;
  dashboard_prices_title: string;
  dashboard_quick_actions: string;
  dashboard_view_all: string;

  // Knowledge Library
  knowledge_title: string;
  knowledge_search_placeholder: string;
  knowledge_category_all: string;
  knowledge_category_crops: string;
  knowledge_category_livestock: string;
  knowledge_category_climate: string;
  knowledge_category_business: string;
  knowledge_read_more: string;
  knowledge_save_article: string;
  knowledge_saved_articles: string;

  // Market
  market_title: string;
  market_price_alerts: string;
  market_nearby_markets: string;
  market_add_listing: string;
  market_my_listings: string;

  // Community
  community_title: string;
  community_new_post: string;
  community_reply: string;
  community_like: string;

  // Profile
  profile_title: string;
  profile_edit: string;
  profile_logout: string;
  profile_farm_details: string;
  profile_language_setting: string;
  profile_notifications: string;

  // Learn page
  learn_offline_banner: string;
  learn_saved_offline: string;
  learn_fetching: string;

  // Consult page
  consult_title: string;
  consult_crop_label: string;
  consult_crop_placeholder: string;
  consult_problem_label: string;
  consult_problem_placeholder: string;
  consult_photo_label: string;
  consult_photo_hint: string;
  consult_submit: string;
  consult_submitting: string;
  consult_success: string;
  consult_ticket_pending: string;
  consult_ticket_under_review: string;
  consult_ticket_responded: string;
  consult_ticket_closed: string;
  consult_image_too_large: string;
  consult_upload_failed: string;
  consult_try_again: string;
  consult_my_tickets: string;
  consult_new_request: string;

  // Ask AI page
  chat_empty_title: string;
  chat_empty_subtitle: string;
  chat_input_placeholder: string;
  chat_streaming: string;
  chat_response_complete: string;
  chat_send_message: string;
  chat_stop_generation: string;
  chat_message_input: string;
  chat_attach_image: string;
  chat_suggestion_1: string;
  chat_suggestion_2: string;
  chat_suggestion_3: string;
  chat_suggestion_4: string;

  // Errors
  error_network: string;
  error_generic: string;
  error_not_found: string;
  error_unauthorized: string;
  error_timeout: string;
  error_save_failed: string;

  // Settings page
  settings_push_notifications: string;
  settings_daily_tips: string;
  settings_consult_updates: string;
  settings_appearance: string;
  settings_dark_mode: string;
  settings_about: string;
  settings_about_desc: string;
};

export const translations: Record<Language, TranslationKeys> = {
  // =========================================================================
  // ENGLISH
  // =========================================================================
  en: {
    app_name: "AgriAfrica AI",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    submit: "Submit",
    confirm: "Confirm",
    close: "Close",
    search: "Search",
    no_results: "No results found",
    retry: "Retry",
    offline: "You are offline",
    online: "Connected",

    nav_home: "Home",
    nav_knowledge: "Knowledge",
    nav_market: "Market",
    nav_community: "Community",
    nav_profile: "Profile",
    nav_ask_ai: "Ask AI",
    nav_consult: "Consult",

    onboarding_welcome: "Welcome to AgriAfrica AI",
    onboarding_subtitle: "Your intelligent farming companion for Africa",
    onboarding_language_prompt: "Choose your preferred language",
    onboarding_name_label: "Full Name",
    onboarding_name_placeholder: "Enter your full name",
    onboarding_phone_label: "Phone Number",
    onboarding_phone_placeholder: "Enter your phone number",
    onboarding_location_label: "Location",
    onboarding_location_placeholder: "Enter your location",
    onboarding_farm_size_label: "Farm Size (hectares)",
    onboarding_farm_size_placeholder: "Enter farm size in hectares",
    onboarding_crops_label: "Crops Grown",
    onboarding_crops_placeholder: "e.g. Maize, Cassava, Yam",
    onboarding_complete_btn: "Get Started",

    dashboard_greeting: "Hello",
    dashboard_weather_title: "Weather Forecast",
    dashboard_articles_title: "Latest Articles",
    dashboard_prices_title: "Market Prices",
    dashboard_quick_actions: "Quick Actions",
    dashboard_view_all: "View All",

    knowledge_title: "Knowledge Library",
    knowledge_search_placeholder: "Search articles...",
    knowledge_category_all: "All",
    knowledge_category_crops: "Crops",
    knowledge_category_livestock: "Livestock",
    knowledge_category_climate: "Climate",
    knowledge_category_business: "Business",
    knowledge_read_more: "Read More",
    knowledge_save_article: "Save Article",
    knowledge_saved_articles: "Saved Articles",

    market_title: "Market Prices",
    market_price_alerts: "Price Alerts",
    market_nearby_markets: "Nearby Markets",
    market_add_listing: "Add Listing",
    market_my_listings: "My Listings",

    community_title: "Community",
    community_new_post: "New Post",
    community_reply: "Reply",
    community_like: "Like",

    profile_title: "Profile",
    profile_edit: "Edit Profile",
    profile_logout: "Log Out",
    profile_farm_details: "Farm Details",
    profile_language_setting: "Language",
    profile_notifications: "Notifications",

    learn_offline_banner: "You're offline. Showing saved articles.",
    learn_saved_offline: "Saved for offline reading",
    learn_fetching: "Fetching latest articles...",

    consult_title: "Expert Consultation",
    consult_crop_label: "Crop Category",
    consult_crop_placeholder: "Select crop type",
    consult_problem_label: "Describe the Problem",
    consult_problem_placeholder: "What issue are you seeing on your farm?",
    consult_photo_label: "Attach Photos",
    consult_photo_hint: "Max 5MB per image. JPG or PNG.",
    consult_submit: "Submit Consultation",
    consult_submitting: "Submitting...",
    consult_success: "Consultation submitted successfully",
    consult_ticket_pending: "Pending",
    consult_ticket_under_review: "Under Review",
    consult_ticket_responded: "Responded",
    consult_ticket_closed: "Closed",
    consult_image_too_large: "Image exceeds 5MB limit",
    consult_upload_failed: "Upload failed. Please try again.",
    consult_try_again: "Try Again",
    consult_my_tickets: "My Consultations",
    consult_new_request: "New Request",

    chat_empty_title: "Ask me anything about farming",
    chat_empty_subtitle: "I can help with crops, pests, soil, planting, and more.",
    chat_input_placeholder: "Ask about your crops...",
    chat_streaming: "AI responding...",
    chat_response_complete: "Response complete",
    chat_send_message: "Send message",
    chat_stop_generation: "Stop generation",
    chat_message_input: "Message input",
    chat_attach_image: "Attach image",
    chat_suggestion_1: "Why are my maize leaves turning yellow?",
    chat_suggestion_2: "When is the best time to plant cassava?",
    chat_suggestion_3: "How do I control tomato blight?",
    chat_suggestion_4: "What fertilizer should I use for rice?",

    error_network: "Network error. Please check your connection.",
    error_generic: "Something went wrong. Please try again.",
    error_not_found: "Page not found.",
    error_unauthorized: "Please log in to continue.",
    error_timeout: "Request timed out. Please try again.",
    error_save_failed: "Failed to save. Please try again.",

    settings_push_notifications: "Push Notifications",
    settings_daily_tips: "Daily Farming Tips",
    settings_consult_updates: "Consultation Updates",
    settings_appearance: "Appearance",
    settings_dark_mode: "Dark Mode",
    settings_about: "About",
    settings_about_desc: "Empowering African farmers with AI-driven agricultural advice.",
  },

  // =========================================================================
  // HAUSA
  // =========================================================================
  ha: {
    app_name: "AgriAfrica AI",
    loading: "Ana lodawa...",
    save: "Ajiye",
    cancel: "Soke",
    delete: "Goge",
    edit: "Gyara",
    back: "Baya",
    next: "Gaba",
    submit: "Tura",
    confirm: "Tabbatar",
    close: "Rufe",
    search: "Bincika",
    no_results: "Ba a sami sakamako ba",
    retry: "Sake gwadawa",
    offline: "Ba ka da haɗin yanar gizo",
    online: "An haɗa",

    nav_home: "Gida",
    nav_knowledge: "Ilimi",
    nav_market: "Kasuwa",
    nav_community: "Al'umma",
    nav_profile: "Bayani",
    nav_ask_ai: "Tambayi AI",
    nav_consult: "Tambaya",

    onboarding_welcome: "Barka da zuwa AgriAfrica AI",
    onboarding_subtitle: "Mataimakiyar noma ta hankali don Afirka",
    onboarding_language_prompt: "Zaɓi harshen da kake so",
    onboarding_name_label: "Cikakken Suna",
    onboarding_name_placeholder: "Shigar da cikakken suna",
    onboarding_phone_label: "Lambar Waya",
    onboarding_phone_placeholder: "Shigar da lambar waya",
    onboarding_location_label: "Wuri",
    onboarding_location_placeholder: "Shigar da wuri",
    onboarding_farm_size_label: "Girman farm (hektar)",
    onboarding_farm_size_placeholder: "Shigar da girman farm a hektar",
    onboarding_crops_label: "Amfanin Gona",
    onboarding_crops_placeholder: "kamar: Masara, Dawa, Dabino",
    onboarding_complete_btn: "Fara",

    dashboard_greeting: "Sannu",
    dashboard_weather_title: "Iskar Sama",
    dashboard_articles_title: "Labarai Na Zamani",
    dashboard_prices_title: "Farashin Kasuwa",
    dashboard_quick_actions: "Ayyuka Masu Sauri",
    dashboard_view_all: "Duba Duka",

    knowledge_title: "Darussa",
    knowledge_search_placeholder: "Bincika labarai...",
    knowledge_category_all: "Duka",
    knowledge_category_crops: "Amfanin Gona",
    knowledge_category_livestock: "Abokan Kiwo",
    knowledge_category_climate: "Iskar Sama",
    knowledge_category_business: "Bizness",
    knowledge_read_more: "Karanta Ƙari",
    knowledge_save_article: "Ajiye Labari",
    knowledge_saved_articles: "Labarai Da Aka Ajiye",

    market_title: "Farashin Kasuwa",
    market_price_alerts: "Sanarwar Farashi",
    market_nearby_markets: "Kasuwa Da Ke Kusa",
    market_add_listing: "Ƙara Tallace-tallace",
    market_my_listings: "Tallace-tace Na",

    community_title: "Al'umma",
    community_new_post: "Sabon Posti",
    community_reply: "Amsa",
    community_like: "So",

    profile_title: "Bayani",
    profile_edit: "Gyara Bayani",
    profile_logout: "Fita",
    profile_farm_details: "Cikakkun Bayanin Farm",
    profile_language_setting: "Harshe",
    profile_notifications: "Sanarwa",

    error_network: "Kuskuren hanyar sadarwa. Da fatan za a duba haɗin ku.",
    error_generic: "Wani abu bai dace ba. Da fatan za a sake gwadawa.",
    error_not_found: "Ba a sami shafin ba.",
    error_unauthorized: "Da fatan za a shiga don ci gaba.",
    error_timeout: "Buƙatar ta ƙare. Da fatan za a sake gwadawa.",
    error_save_failed: "An gaza ajiye. Da fatan za a sake gwadawa.",

    settings_push_notifications: "Sanarwar Turawa",
    settings_daily_tips: "Shawarwarin Noma na Yau",
    settings_consult_updates: "Sabuntawa na Tattaunawa",
    settings_appearance: "Bayyanar",
    settings_dark_mode: "Yanayin Duhu",
    settings_about: "Game da mu",
    settings_about_desc: "Ba da damar manoma na Afrika da shawarwarin noma ta AI.",

    learn_offline_banner: "Ba ka da haɗin yanar gizo. Ana nuna labarai da aka ajiye.",
    learn_saved_offline: "An ajiye don karantawa ba tare da haɗi ba",
    learn_fetching: "Ana ɗaukar labarai na zamani...",

    consult_title: "Shawarwarin Masani",
    consult_crop_label: "Nau'in Amfanin Gona",
    consult_crop_placeholder: "Zaɓi nau'in amfanin gona",
    consult_problem_label: "Bayyana Matsalar",
    consult_problem_placeholder: "Wanne matsala kake ganin a gonar ka?",
    consult_photo_label: "Haɗa Hoto",
    consult_photo_hint: "Mafi girma 5MB a kowane hoto. JPG ko PNG.",
    consult_submit: "Tura Tambaya",
    consult_submitting: "Ana tura...",
    consult_success: "An ci gaba da tura tambaya",
    consult_ticket_pending: "Jiran",
    consult_ticket_under_review: "Ana dubawa",
    consult_ticket_responded: "An amsa",
    consult_ticket_closed: "An rufe",
    consult_image_too_large: "Hoto ya wuce iyaka na 5MB",
    consult_upload_failed: "An gaza lodi. Da fatan za a sake gwadawa.",
    consult_try_again: "Sake Gwadawa",
    consult_my_tickets: "Tambayoyina",
    consult_new_request: "Sabon Tambaya",

    chat_empty_title: "Tambayi ni game da noma",
    chat_empty_subtitle: "Ina iya taimaka da amfanin gona, cututtuka, ƙasa, shuka, da sauransu.",
    chat_input_placeholder: "Tambayi game da amfanin gona...",
    chat_streaming: "AI yana amsa...",
    chat_response_complete: "An gama amsa",
    chat_send_message: "Aika saƙo",
    chat_stop_generation: "Dakatar da samarwa",
    chat_message_input: "Shigar da saƙo",
    chat_attach_image: "Haɗa hoto",
    chat_suggestion_1: "Me yasa ganyena na masara ke fari?",
    chat_suggestion_2: "Wanne lokacin ya dace don shuka dawa?",
    chat_suggestion_3: "Ta yaya zan rufe cutar_tomato?",
    chat_suggestion_4: "Wanne abokin taruwa zan yi amfani da shi ga shinkafa?",
  },

  // =========================================================================
  // YORUBA
  // =========================================================================
  yo: {
    app_name: "AgriAfrica AI",
    loading: "N ṣiṣẹ́...",
    save: "Fi ipamọ́",
    cancel: "Fagilé",
    delete: "Parẹ",
    edit: "Ṣe àtúnṣe",
    back: "Padà",
    next: "Tó nìkàn",
    submit: "Fi ránṣẹ́",
    confirm: "Jẹ́rìísí",
    close: "Pí",
    search: "Wá",
    no_results: "Kò sí àbájáde",
    retry: "Tún ṣe",
    offline: "Ọ̀ kò ní ìṣòro ìbáṣepọ̀",
    online: "Ti ìbáṣepọ̀",

    nav_home: "Ilé",
    nav_knowledge: "Ìmọ̀",
    nav_market: "Ọjà",
    nav_community: "Àwùjọ",
    nav_profile: "Profaili",
    nav_ask_ai: "Bèèrì AI",
    nav_consult: "Èbáni",

    onboarding_welcome: "Kú ìbọ̀wọ̀ sí AgriAfrica AI",
    onboarding_subtitle: "Ọmọ́wé ìṣẹ́ agbẹ́ rẹ fún Áfríkà",
    onboarding_language_prompt: "Yan èdè tí ọ bá fẹ́",
    onboarding_name_label: "Orúkọ Kíkún",
    onboarding_name_placeholder: "Tẹ orúkọ kíkún rẹ",
    onboarding_phone_label: "Nọ́mbà Fóònù",
    onboarding_phone_placeholder: "Tẹ nọ́mbà fóònù rẹ",
    onboarding_location_label: "Ibùgbé",
    onboarding_location_placeholder: "Tẹ ibùgbé rẹ",
    onboarding_farm_size_label: "Ìwọ̀n ilẹ̀ ogbin (hectare)",
    onboarding_farm_size_placeholder: "Tẹ ìwọ̀n ilẹ̀ rẹ nínú hectare",
    onboarding_crops_label: "Èso Ilẹ̀",
    onboarding_crops_placeholder: "bíi: Ajá, Gbígbẹ́, Isu",
    onboarding_complete_btn: "Bẹ̀rẹ̀",

    dashboard_greeting: "Báwo ni",
    dashboard_weather_title: "Ìpọ̀kàn Afẹ́fẹ́",
    dashboard_articles_title: "Àwọn Àkọ́kọ́ Àṣa",
    dashboard_prices_title: "Ìyọ̀wò Ọjà",
    dashboard_quick_actions: "Ìṣe Kíkàká",
    dashboard_view_all: "Wo Gbogbo Rẹ̀",

    knowledge_title: "Ilé Ìmọ̀",
    knowledge_search_placeholder: "Wá àwọn àkọ́kọ́...",
    knowledge_category_all: "Gbogbo",
    knowledge_category_crops: "Èso",
    knowledge_category_livestock: "Ẹran",
    knowledge_category_climate: "Afẹ́fẹ́",
    knowledge_category_business: "Iṣẹ́",
    knowledge_read_more: "Kà Sí Ìròyìn",
    knowledge_save_article: "Fi Àkọ́kọ́ Pamọ́",
    knowledge_saved_articles: "Àwọn Àkọ́kọ́ Tí A Fi Pamọ́",

    market_title: "Ìyọ̀wò Ọjà",
    market_price_alerts: "Ìkìlọ̀ Ìyọ̀wò",
    market_nearby_markets: "Ọjà Tó Wọ́n",
    market_add_listing: "Fi Àtòjọ Kún",
    market_my_listings: "Àtòjọ Mi",

    community_title: "Àwùjọ",
    community_new_post: "Àpótí Tuntun",
    community_reply: "Dáhùn",
    community_like: "Fẹ́rin",

    profile_title: "Profaili",
    profile_edit: "Ṣe Àtúnṣe Profaili",
    profile_logout: "Jáde",
    profile_farm_details: "Àlàyé Ilẹ̀ Ogbin",
    profile_language_setting: "Èdè",
    profile_notifications: "Ìkìlọ̀",

    error_network: "Ìṣòro ìbáṣepọ̀. Jọ̀wọ́ ṣe àtúnṣe ìbáṣepọ̀ rẹ.",
    error_generic: "Àwọn àbájáde nǹkan kò sí dáadáa. Jọ̀wọ́ tún ṣe.",
    error_not_found: "Kò sí ojú-ìwé yìí.",
    error_unauthorized: "Jọ̀wọ́ wọ inú láti tẹ̀síwájú.",
    error_timeout: "Ìbéèrè parí akókò. Jọ̀wọ́ tún ṣe.",
    error_save_failed: "Kò ṣe àtúnṣe dáadáa. Jọ̀wọ́ tún ṣe.",

    settings_push_notifications: "Ìkìlọ̀ Push",
    settings_daily_tips: "Ìmọ̀ Ogbin Ojoojúmọ́",
    settings_consult_updates: "Ìkọ̀sílẹ̀ Sọ̀rọ̀",
    settings_appearance: "Ìràwọ̀",
    settings_dark_mode: "Ìmọ̀lẹ̀ Dúdú",
    settings_about: "Nípa àwa",
    settings_about_desc: "Fún àwọn àgbà ogbin ní Áfíríkà pẹ̀lú ìmọ̀ ogbin tí AI fi ń ṣiṣẹ́.",

    learn_offline_banner: "Ọ̀ kò ní ìbáṣepọ̀. Àwọn àkọ́kọ́ tí a fi pamọ́.",
    learn_saved_offline: "A fi pamọ́ fún ìkànsí láìsí ìbáṣepọ̀",
    learn_fetching: "Ń mú àwọn àkọ́kọ́ tuntun wá...",

    consult_title: "Ìbáá mú Òmọ̀wé",
    consult_crop_label: "Írírí Èso",
    consult_crop_placeholder: "Yan ìrísí eso",
    consult_problem_label: "Ṣàlàyé Ìṣòro",
    consult_problem_placeholder: "Kíni ìṣòro tí ọ bá rí nínú ilẹ̀ gbin rẹ?",
    consult_photo_label: "Fi Awòrán Sọ̀rọ̀",
    consult_photo_hint: "Iye ọ̀pọ̀lọpọ̀ 5MB fún kọ̀ọ̀kan. JPG tàbí PNG.",
    consult_submit: "Fi Ìbéèrè Ránṣẹ́",
    consult_submitting: "Ń fi ránṣẹ́...",
    consult_success: "A ti kún ìbéèrè lọ́wọ́ ní ìṣẹ́gun",
    consult_ticket_pending: "Ń dúró",
    consult_ticket_under_review: "Ń wá àdúgbò",
    consult_ticket_responded: "A ti dáhùn",
    consult_ticket_closed: "A ti pá",
    consult_image_too_large: "Awòrán kò lè tó 5MB",
    consult_upload_failed: "Kò lè lò. Jọ̀wọ́ tún ṣe.",
    consult_try_again: "Tún Ṣe",
    consult_my_tickets: "Ìbéèrè Mi",
    consult_new_request: "Ìbéèrí Tuntun",

    chat_empty_title: "Bèèrì nǹkan bíogbóko nípa ìṣẹ́ agbẹ́",
    chat_empty_subtitle: "Mo lè ran ọ lọwọ pẹ̀lú eso, ariku, ilẹ̀, àkóso, àti bẹ̀ẹ̀ bọ̀ọ̀rọ̀.",
    chat_input_placeholder: "Bèèrì nípa eso rẹ...",
    chat_streaming: "AI ń dáhùn...",
    chat_response_complete: "Ìdáhùn parí",
    chat_send_message: "Ránṣẹ́ ìfiránṣẹ́",
    chat_stop_generation: "Dá àdàní sí",
    chat_message_input: "Ìfiránṣẹ́ ìbáṣepọ̀",
    chat_attach_image: "Fi awòrán sọ̀rọ̀",
    chat_suggestion_1: "Kíni ìdí tí ọ̀pẹ̀ ajá mi fi ń yàrá pọ̀pọ̀?",
    chat_suggestion_2: "Ìpẹ́ tó dára jùlọ láti gbígbẹ kásávà jẹ́ kíni?",
    chat_suggestion_3: "Báwo ni mo ṣe lè da bọ̀ọ̀rọ̀ tomato lọ́wọ́?",
    chat_suggestion_4: "Kíni àpọ́n tí yóò tọ́ jù fún ìrísí?",
  },

  // =========================================================================
  // KISWAHILI
  // =========================================================================
  sw: {
    app_name: "AgriAfrica AI",
    loading: "Inapakia...",
    save: "Hifadhi",
    cancel: "Ghairi",
    delete: "Futa",
    edit: "Hariri",
    back: "Rudi",
    next: "Ifuatayo",
    submit: "Wasilisha",
    confirm: "Thibitisha",
    close: "Funga",
    search: "Tafuta",
    no_results: "Hakuna matokeo",
    retry: "Jaribu tena",
    offline: "Huna mtandao",
    online: "Umeungana",

    nav_home: "Nyumbani",
    nav_knowledge: " Maarifa",
    nav_market: "Soko",
    nav_community: "Jumuiya",
    nav_profile: "Wasifu",
    nav_ask_ai: "Uliza AI",
    nav_consult: "Ushauri",

    onboarding_welcome: "Karibu AgriAfrica AI",
    onboarding_subtitle: "Msimamizi wako wa kilimo kwa Afrika",
    onboarding_language_prompt: "Chagua lugha yako",
    onboarding_name_label: "Jina Kamili",
    onboarding_name_placeholder: "Weka jina lako kamili",
    onboarding_phone_label: "Nambari ya Simu",
    onboarding_phone_placeholder: "Weka nambari yako ya simu",
    onboarding_location_label: "Eneo",
    onboarding_location_placeholder: "Weka eneo lako",
    onboarding_farm_size_label: "Ukubwa wa shamba (hekta)",
    onboarding_farm_size_placeholder: "Weka ukubwa wa shamba kwa hekta",
    onboarding_crops_label: "Mazao",
    onboarding_crops_placeholder: "k.m. Mahindi, Muhogo, Viazi",
    onboarding_complete_btn: "Anza",

    dashboard_greeting: "Habari",
    dashboard_weather_title: "Hali ya Hewa",
    dashboard_articles_title: "Makala Mpya",
    dashboard_prices_title: "Bei za Soko",
    dashboard_quick_actions: "Hatua za Haraka",
    dashboard_view_all: "Tazama Zote",

    knowledge_title: "Maktaba ya Maarifa",
    knowledge_search_placeholder: "Tafuta makala...",
    knowledge_category_all: "Zote",
    knowledge_category_crops: "Mazao",
    knowledge_category_livestock: "Mifugo",
    knowledge_category_climate: "Hali ya Hewa",
    knowledge_category_business: "Biashara",
    knowledge_read_more: "Soma Zaidi",
    knowledge_save_article: "Hifadhi Nakala",
    knowledge_saved_articles: "Makala Zilizohifadhiwa",

    market_title: "Bei za Soko",
    market_price_alerts: "Arifa za Bei",
    market_nearby_markets: "Masoko Yanayo Karibu",
    market_add_listing: "Ongeza Orodha",
    market_my_listings: "Orodha Yangu",

    community_title: "Jumuiya",
    community_new_post: "Chapisho Jipya",
    community_reply: "Jibu",
    community_like: "Penda",

    profile_title: "Wasifu",
    profile_edit: "Hariri Wasifu",
    profile_logout: "Ondoka",
    profile_farm_details: "Maelezo ya Shamba",
    profile_language_setting: "Lugha",
    profile_notifications: "Arifa",

    error_network: "Hitilafu ya mtandao. Tafadhali angalia muunganisho wako.",
    error_generic: "Kuna hitilafu. Tafadhali jaribu tena.",
    error_not_found: "Ukurasa haujapatikana.",
    error_unauthorized: "Tafadhali ingia ili kuendelea.",
    error_timeout: "Muda wa ombi umekwisha. Tafadhali jaribu tena.",
    error_save_failed: "Imeshindwa kuhifadhi. Tafadhali jaribu tena.",

    settings_push_notifications: "Arifa za Push",
    settings_daily_tips: "Vidokezo vya Kilimo kwa Siku",
    settings_consult_updates: "Sasisha za Ushauri",
    settings_appearance: "Mwonekano",
    settings_dark_mode: "Hali ya Giza",
    settings_about: "Kuhusu",
    settings_about_desc: "Kuwezesha wakulima wa Afrika kwa ushauri wa kilimo unaotokana na AI.",

    learn_offline_banner: "Huna mtandao. Inaonyesha makala zilizohifadhiwa.",
    learn_saved_offline: "Imehifadhiwa kwa usomaji bila mtandao",
    learn_fetching: "Inapata makala mpya...",

    consult_title: "Ushauri wa Mtaalamu",
    consult_crop_label: "Aina ya Mazao",
    consult_crop_placeholder: "Chagua aina ya mazao",
    consult_problem_label: "Eleza Tatizo",
    consult_problem_placeholder: "Tatizo gani unaloona shambani kwako?",
    consult_photo_label: "Piga Picha",
    consult_photo_hint: "Ukubwa wa juu 5MB kwa picha. JPG au PNG.",
    consult_submit: "Wasilisha Ombi",
    consult_submitting: "Inawasilisha...",
    consult_success: "Ombi limewasilishwa kwa mafanikio",
    consult_ticket_pending: "Inasubiri",
    consult_ticket_under_review: "Inakaguliwa",
    consult_ticket_responded: "Imejibiwa",
    consult_ticket_closed: "Imefungwa",
    consult_image_too_large: "Picha inazidi kikomo cha 5MB",
    consult_upload_failed: "Imeshindwa kupakia. Tafadhali jaribu tena.",
    consult_try_again: "Jaribu Tena",
    consult_my_tickets: "Ombi Langu",
    consult_new_request: "Ombi Jipya",

    chat_empty_title: "Niulize chochote kuhusu kilimo",
    chat_empty_subtitle: "Ninaweza kusaidia na mazao, wadudu, udongo, kupanda, na zaidi.",
    chat_input_placeholder: "Uliza kuhusu mazao yako...",
    chat_streaming: "AI inajibu...",
    chat_response_complete: "Jibu limekamilika",
    chat_send_message: "Tuma ujumbe",
    chat_stop_generation: "Simamisha uundaji",
    chat_message_input: "Ujumbe wa ujumbe",
    chat_attach_image: "Ambatisha picha",
    chat_suggestion_1: "Kwa nini majani ya mahindi yanaanza kuwa manjano?",
    chat_suggestion_2: "Wakati gani bora wa kupanda muhogo?",
    chat_suggestion_3: "Jinsi gani ninavyodhibiti ugonjwa wa nyanya?",
    chat_suggestion_4: "Mbolea gani nipaswa kutumia kwa mpunga?",
  },

  // =========================================================================
  // FRANÇAIS
  // =========================================================================
  fr: {
    app_name: "AgriAfrica AI",
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    back: "Retour",
    next: "Suivant",
    submit: "Soumettre",
    confirm: "Confirmer",
    close: "Fermer",
    search: "Rechercher",
    no_results: "Aucun résultat trouvé",
    retry: "Réessayer",
    offline: "Vous êtes hors ligne",
    online: "Connecté",

    nav_home: "Accueil",
    nav_knowledge: "Connaissances",
    nav_market: "Marché",
    nav_community: "Communauté",
    nav_profile: "Profil",
    nav_ask_ai: "Demander à l'IA",
    nav_consult: "Consultation",

    onboarding_welcome: "Bienvenue sur AgriAfrica AI",
    onboarding_subtitle: "Votre compagnon agricole intelligent pour l'Afrique",
    onboarding_language_prompt: "Choisissez votre langue préférée",
    onboarding_name_label: "Nom complet",
    onboarding_name_placeholder: "Entrez votre nom complet",
    onboarding_phone_label: "Numéro de téléphone",
    onboarding_phone_placeholder: "Entrez votre numéro de téléphone",
    onboarding_location_label: "Localisation",
    onboarding_location_placeholder: "Entrez votre localisation",
    onboarding_farm_size_label: "Taille de la ferme (hectares)",
    onboarding_farm_size_placeholder: "Entrez la taille en hectares",
    onboarding_crops_label: "Cultures",
    onboarding_crops_placeholder: "ex. Maïs, Manioc, Igname",
    onboarding_complete_btn: "Commencer",

    dashboard_greeting: "Bonjour",
    dashboard_weather_title: "Prévisions Météo",
    dashboard_articles_title: "Derniers Articles",
    dashboard_prices_title: "Prix du Marché",
    dashboard_quick_actions: "Actions Rapides",
    dashboard_view_all: "Voir Tout",

    knowledge_title: "Bibliothèque de Connaissances",
    knowledge_search_placeholder: "Rechercher des articles...",
    knowledge_category_all: "Tous",
    knowledge_category_crops: "Cultures",
    knowledge_category_livestock: "Élevage",
    knowledge_category_climate: "Climat",
    knowledge_category_business: "Entreprise",
    knowledge_read_more: "Lire la Suite",
    knowledge_save_article: "Sauvegarder l'Article",
    knowledge_saved_articles: "Articles Sauvegardés",

    market_title: "Prix du Marché",
    market_price_alerts: "Alertes de Prix",
    market_nearby_markets: "Marchés à Proximité",
    market_add_listing: "Ajouter une Annonce",
    market_my_listings: "Mes Annonces",

    community_title: "Communauté",
    community_new_post: "Nouveau Message",
    community_reply: "Répondre",
    community_like: "Aimer",

    profile_title: "Profil",
    profile_edit: "Modifier le Profil",
    profile_logout: "Se Déconnecter",
    profile_farm_details: "Détails de la Ferme",
    profile_language_setting: "Langue",
    profile_notifications: "Notifications",

    error_network: "Erreur réseau. Veuillez vérifier votre connexion.",
    error_generic: "Une erreur s'est produite. Veuillez réessayer.",
    error_not_found: "Page non trouvée.",
    error_unauthorized: "Veuillez vous connecter pour continuer.",
    error_timeout: "La requête a expiré. Veuillez réessayer.",
    error_save_failed: "Échec de l'enregistrement. Veuillez réessayer.",

    settings_push_notifications: "Notifications Push",
    settings_daily_tips: "Conseils Agricoles Quotidiens",
    settings_consult_updates: "Mises à Jour de Consultation",
    settings_appearance: "Apparence",
    settings_dark_mode: "Mode Sombre",
    settings_about: "À propos",
    settings_about_desc: "Autonomiser les agriculteurs africains avec des conseils agricoles basés sur l'IA.",

    learn_offline_banner: "Vous êtes hors ligne. Articles sauvegardés affichés.",
    learn_saved_offline: "Sauvegardé pour lecture hors ligne",
    learn_fetching: "Récupération des derniers articles...",

    consult_title: "Consultation Expert",
    consult_crop_label: "Catégorie de Culture",
    consult_crop_placeholder: "Sélectionner le type de culture",
    consult_problem_label: "Décrivez le Problème",
    consult_problem_placeholder: "Quel problème voyez-vous dans votre champ?",
    consult_photo_label: "Joindre des Photos",
    consult_photo_hint: "Max 5MB par image. JPG ou PNG.",
    consult_submit: "Soumettre la Consultation",
    consult_submitting: "Soumission en cours...",
    consult_success: "Consultation soumise avec succès",
    consult_ticket_pending: "En attente",
    consult_ticket_under_review: "En cours d'examen",
    consult_ticket_responded: "Répondu",
    consult_ticket_closed: "Fermé",
    consult_image_too_large: "L'image dépasse la limite de 5MB",
    consult_upload_failed: "Échec du téléchargement. Veuillez réessayer.",
    consult_try_again: "Réessayer",
    consult_my_tickets: "Mes Consultations",
    consult_new_request: "Nouvelle Demande",

    chat_empty_title: "Demandez-moi tout sur l'agriculture",
    chat_empty_subtitle: "Je peux vous aider avec les cultures, les ravageurs, le sol, la plantation, et plus encore.",
    chat_input_placeholder: "Posez une question sur vos cultures...",
    chat_streaming: "L'IA répond...",
    chat_response_complete: "Réponse terminée",
    chat_send_message: "Envoyer le message",
    chat_stop_generation: "Arrêter la génération",
    chat_message_input: "Saisie du message",
    chat_attach_image: "Joindre une image",
    chat_suggestion_1: "Pourquoi les feuilles de mon maïs jaunissent-elles?",
    chat_suggestion_2: "Quel est le meilleur moment pour planter le manioc?",
    chat_suggestion_3: "Comment lutter contre le mildiou de la tomate?",
    chat_suggestion_4: "Quel engrais dois-je utiliser pour le riz?",
  },

  // =========================================================================
  // IGBO
  // =========================================================================
  ig: {
    app_name: "AgriAfrica AI",
    loading: "Na-agba ume...",
    save: "Chekwaa",
    cancel: "Kagbuo",
    delete: "Hichapụ",
    edit: "Gbanwee",
    back: "Azụ",
    next: "Osote",
    submit: "Nye aka",
    confirm: "Nyochaa",
    close: "Mechie",
    search: "Chọọ",
    no_results: "A chọghị ihe mgbaru ọsọ",
    retry: "Nwaa ọzọ",
    offline: "Ị nọghị na network",
    online: "E jikọtara",

    nav_home: "Ụlọ",
    nav_knowledge: "Mmụta",
    nav_market: "Ahịa",
    nav_community: "Ụmụ",
    nav_profile: "Profile",
    nav_ask_ai: "Jụọ AI",
    nav_consult: "Consult",

    onboarding_welcome: "Nnọkọ na AgriAfrica AI",
    onboarding_subtitle: "Onye nyochọrụ ugbo gị n'ime Africa",
    onboarding_language_prompt: "Họrọ asụsụ ị chọrọ",
    onboarding_name_label: "Aha Zuru Oke",
    onboarding_name_placeholder: "Tinye aha gị zuru oke",
    onboarding_phone_label: "Nọmba Ekwentị",
    onboarding_phone_placeholder: "Tinye nọmba ekwentị gị",
    onboarding_location_label: "Ebe",
    onboarding_location_placeholder: "Tinye ebe ị nọ",
    onboarding_farm_size_label: "Nnukwu ulo (hectares)",
    onboarding_farm_size_placeholder: "Tinye nnukwu ulo n'hectares",
    onboarding_crops_label: "Ahụhụ E Si Na Alọ",
    onboarding_crops_placeholder: "dị ka: Masara, Cassava, Yam",
    onboarding_complete_btn: "Bido",

    dashboard_greeting: "Ndewo",
    dashboard_weather_title: "Ihe Ị Ga Ejị",
    dashboard_articles_title: "Akụkọ Ụbọchị",
    dashboard_prices_title: "Ahịa Ahịa",
    dashboard_quick_actions: "Omume Ngwa Ngwa",
    dashboard_view_all: "Lebara Ihe Niile",

    knowledge_title: "Ile Mmụta",
    knowledge_search_placeholder: "Chọọ akụkọ...",
    knowledge_category_all: "Niile",
    knowledge_category_crops: "Ahụhụ",
    knowledge_category_livestock: "Azụ",
    knowledge_category_climate: "Ihe Ị Ga Ejị",
    knowledge_category_business: "Azụmaahịa",
    knowledge_read_more: "Gụọ Ọzọ",
    knowledge_save_article: "Chekwaa Akụkọ",
    knowledge_saved_articles: "Akụkọ E Chekwara",

    market_title: "Ahịa Ahịa",
    market_price_alerts: "Ọkụ Ahịa",
    market_nearby_markets: "Ahịa Nọ Ebe Na",
    market_add_listing: "Tinye Ozi",
    market_my_listings: "Ozi M",

    community_title: "Ụmụ",
    community_new_post: "Ozi Ọhụrụ",
    community_reply: "Zaa Azụ",
    community_like: "Hụrụ N'anya",

    profile_title: "Profile",
    profile_edit: "Gbanwee Profile",
    profile_logout: "Pụọ",
    profile_farm_details: "Nkọwa Ulo",
    profile_language_setting: "Asụsụ",
    profile_notifications: "Ọkụ",

    error_network: "Nsogbu network. Biko nyochaa njikọ gị.",
    error_generic: "Ihe eji eme ihe adịghị mma. Biko nwaa ọzọ.",
    error_not_found: "A chọghị ibe.",
    error_unauthorized: "Biko bata iji gaa n'ihu.",
    error_timeout: "Aja aja gachara. Biko nwaa ọzọ.",
    error_save_failed: "Echekwala ihe. Biko nwaa ọzọ.",

    settings_push_notifications: "Ụkọsi Ntụziaka",
    settings_daily_tips: "Ndụmọdụ Ọrụ Ugbo Kwa Ụbọchị",
    settings_consult_updates: "Mgbọrọndụ Nsyọrọ",
    settings_appearance: "Họrọ Ihe Ị Hụ",
    settings_dark_mode: "Ọnụdụ Anụnị Anụnị",
    settings_about: "Banyere anyị",
    settings_about_desc: "Inye ndị nwa obodo Afrika ike na ndụmọdụ ọrụ ugbo nke AI si n'okpuru.",

    learn_offline_banner: "Ị nọghị na network. Na-egosi akụkọ e chekwara.",
    learn_saved_offline: "E chekwara maka gụọ na-adịghị na network",
    learn_fetching: "Na-enye akụkọ ọhụrụ...",

    consult_title: "Nchọpụta Expert",
    consult_crop_label: "Ụdị Ahụhụ",
    consult_crop_placeholder: "Họrọ ụdị ahụhụ",
    consult_problem_label: "Kọwaa nsogbu",
    consult_problem_placeholder: "Kedu nsogbu ị na-ahụ na ulo gị?",
    consult_photo_label: "Tinye Foto",
    consult_photo_hint: "Ụzọ kachasị nta 5MB maka foto. JPG ma ọ bụ PNG.",
    consult_submit: "Nye Tụrụ Tụrụ",
    consult_submitting: "Na-enye...",
    consult_success: "E nyekwara ozi nke ọma",
    consult_ticket_pending: "Na-echere",
    consult_ticket_under_review: "Na-enyocha",
    consult_ticket_responded: "E zaa ajụjụ",
    consult_ticket_closed: "E mechiri",
    consult_image_too_large: "Foto gafere 5MB",
    consult_upload_failed: "Echekwa ihe gbagwojere anya. Biko nwaa ọzọ.",
    consult_try_again: "Nwaa Ọzọ",
    consult_my_tickets: "Tụrụ Tụrụ M",
    consult_new_request: "Arịrịọ Ọhụrụ",

    chat_empty_title: "Jụ m ihe ọ bụla gbasoro ọrụ ugbo",
    chat_empty_subtitle: "Enwere m ike inyaka aka na ahụhụ, ụmụ ahụhụ, ala, planting, na ọzọ.",
    chat_input_placeholder: "Jụ banyere ahụhụ gị...",
    chat_streaming: "AI na-azaa ajụjụ...",
    chat_response_complete: "Azịza agwụla",
    chat_send_message: "Zipe ozi",
    chat_stop_generation: "Kwụsị ọrụ",
    chat_message_input: "Tinye ozi",
    chat_attach_image: "Tinye foto",
    chat_suggestion_1: "Gịnị mere akpụkpọ ahụ masara m na-acha ọbara ọbara?",
    chat_suggestion_2: "Oge kachasị mma iji kụwa cassava kedu?",
    chat_suggestion_3: "Otú esi enweghị ike ịlaghachi na tomato blight?",
    chat_suggestion_4: "Kedu fertilizer ga-ekwe omume maka rice?",
  },

  // =========================================================================
  // NIGERIAN PIDGIN
  // =========================================================================
  pcm: {
    app_name: "AgriAfrica AI",
    loading: "E dey load...",
    save: "Save am",
    cancel: "Cancel am",
    delete: "Comot am",
    edit: "Change am",
    back: "Waka back",
    next: "Next one",
    submit: "Submit am",
    confirm: "Confirm am",
    close: "Shut am",
    search: "Find",
    no_results: "We no see anything",
    retry: "Try again",
    offline: "You no get network",
    online: "E don connect",

    nav_home: "House",
    nav_knowledge: "Knowledge",
    nav_market: "Market",
    nav_community: "People",
    nav_profile: "Your profile",
    nav_ask_ai: "Ask AI",
    nav_consult: "Consult",

    onboarding_welcome: "Welcome to AgriAfrica AI",
    onboarding_subtitle: "Your farming friend wey sabi well well for Africa",
    onboarding_language_prompt: "Wetin language you want?",
    onboarding_name_label: "Your full name",
    onboarding_name_placeholder: "Type your full name",
    onboarding_phone_label: "Phone number",
    onboarding_phone_placeholder: "Type your phone number",
    onboarding_location_label: "Where you dey",
    onboarding_location_placeholder: "Type where you dey",
    onboarding_farm_size_label: "How big your farm (hectares)",
    onboarding_farm_size_placeholder: "Type how big your farm be",
    onboarding_crops_label: "Wetin you dey plant",
    onboarding_crops_placeholder: "Like: Maize, Cassava, Yam",
    onboarding_complete_btn: "Let's go",

    dashboard_greeting: "How body",
    dashboard_weather_title: "Weather wey dey come",
    dashboard_articles_title: "New things to read",
    dashboard_prices_title: "Market price",
    dashboard_quick_actions: "Quick quick things",
    dashboard_view_all: "See all",

    knowledge_title: "Knowledge Library",
    knowledge_search_placeholder: "Find article...",
    knowledge_category_all: "All",
    knowledge_category_crops: "Crops",
    knowledge_category_livestock: "Animals",
    knowledge_category_climate: "Weather",
    knowledge_category_business: "Business",
    knowledge_read_more: "Read more",
    knowledge_save_article: "Save this article",
    knowledge_saved_articles: "Articles wey you don save",

    market_title: "Market price",
    market_price_alerts: "Price alert",
    market_nearby_markets: "Market wey near you",
    market_add_listing: "Add your thing",
    market_my_listings: "My things for market",

    community_title: "Community",
    community_new_post: "New post",
    community_reply: "Reply",
    community_like: "Like",

    profile_title: "Your profile",
    profile_edit: "Change your profile",
    profile_logout: "Comot for here",
    profile_farm_details: "Wetin dey your farm",
    profile_language_setting: "Language",
    profile_notifications: "Alert dem",

    error_network: "Network wahala. Abeg check your connection.",
    error_generic: "Something no set. Abeg try again.",
    error_not_found: "We no find this page.",
    error_unauthorized: "Abeg login first make you fit continue.",
    error_timeout: "E don cast. Abeg try again.",
    error_save_failed: "We no fit save am. Abeg try again.",

    settings_push_notifications: "Push Alert",
    settings_daily_tips: "Farm Tips for Today",
    settings_consult_updates: "Update for Consultation",
    settings_appearance: "How e look",
    settings_dark_mode: "Dark Mode",
    settings_about: "About us",
    settings_about_desc: "We dey help African farmers with AI farming advice.",

    learn_offline_banner: "You no get network. E dey show you the things wey you don save.",
    learn_saved_offline: "You don save am make you fit read later",
    learn_fetching: "E dey bring new things...",

    consult_title: "Talk to Expert",
    consult_crop_label: "Which crop",
    consult_crop_placeholder: "Choose your crop",
    consult_problem_label: "Wetin be the problem",
    consult_problem_placeholder: "Wetin you see for your farm wey no dey right?",
    consult_photo_label: "Add picture",
    consult_photo_hint: "Max 5MB for each picture. JPG or PNG.",
    consult_submit: "Send your question",
    consult_submitting: "E dey send...",
    consult_success: "We don collect your question",
    consult_ticket_pending: "E dey wait",
    consult_ticket_under_review: "Dem dey check am",
    consult_ticket_responded: "Dem don talk",
    consult_ticket_closed: "E don close",
    consult_image_too_large: "This picture too big pass 5MB",
    consult_upload_failed: "E no gree upload. Abeg try again.",
    consult_try_again: "Try Again",
    consult_my_tickets: "My questions",
    consult_new_request: "New question",

    chat_empty_title: "Ask me anything about farming",
    chat_empty_subtitle: "I fit help you with crops, pests, soil, planting, and more.",
    chat_input_placeholder: "Ask about your crops...",
    chat_streaming: "AI dey talk...",
    chat_response_complete: "E don finish talk",
    chat_send_message: "Send message",
    chat_stop_generation: "Stop am",
    chat_message_input: "Type your message",
    chat_attach_image: "Add picture",
    chat_suggestion_1: "Why my maize leaves dey turn yellow?",
    chat_suggestion_2: "When e be the best time plant cassava?",
    chat_suggestion_3: "How I go take stop tomato blight?",
    chat_suggestion_4: "Which fertilizer I go use for rice?",
  },

  // =========================================================================
  // AMHARIC (አማርኛ)
  // =========================================================================
  am: {
    app_name: "AgriAfrica AI",
    loading: "በመጫን ላይ...",
    save: "አስቀምጥ",
    cancel: "ሰርዝ",
    delete: "ሰረዝ",
    edit: "ḳayyime",
    back: "ተመለስ",
    next: "ቀጥል",
    submit: "አስቀምጥ",
    confirm: "ረጋገጥ",
    close: "ዝጋ",
    search: "ፈልግ",
    no_results: "ምንም ውጤት አልተገኘም",
    retry: "እንደገና ሞክር",
    offline: "በመስመር ላይ አይደለህም",
    online: "ተገናኝቷል",

    nav_home: "መነሻ",
    nav_knowledge: "እውቀት",
    nav_market: "ገበያ",
    nav_community: "ማህበራት",
    nav_profile: "መገለጫ",
    nav_ask_ai: "AI ጠይቅ",
    nav_consult: "ምክር",

    onboarding_welcome: "ወደ AgriAfrica AI እንኳን በደህና መጡ",
    onboarding_subtitle: "ለአፍሪካ ብልህ የእርሻ ባልደረባ",
    onboarding_language_prompt: "የምትጠቃም ቋንቋ ምረጥ",
    onboarding_name_label: "ሙሉ ስም",
    onboarding_name_placeholder: "ሙሉ ስምህን ያስገቡ",
    onboarding_phone_label: "ስልክ ቁጥር",
    onboarding_phone_placeholder: "ስልክ ቁጥርህን ያስገቡ",
    onboarding_location_label: "አድራሻ",
    onboarding_location_placeholder: "አድራሻህን ያስገቡ",
    onboarding_farm_size_label: "የእርሻ መጠን (ሄክታር)",
    onboarding_farm_size_placeholder: "የእርሻ መጠንን በሄክታር ያስገቡ",
    onboarding_crops_label: "የሚተ琬 እርሻ",
    onboarding_crops_placeholder: "እንደ: በስጣ፣ ቸኮላ፣ ዛፍ",
    onboarding_complete_btn: "ጀምር",

    dashboard_greeting: "ሰላም",
    dashboard_weather_title: "የአየር ሁኔታ",
    dashboard_articles_title: "�তን ጽሑፎች",
    dashboard_prices_title: "የገበያ ዋጋ",
    dashboard_quick_actions: "ፈጣን ድርጊቶች",
    dashboard_view_all: "ሁሉንም ተመልከት",

    knowledge_title: "የእውቀት ቤተ መዛግብት",
    knowledge_search_placeholder: "ጽሑፎችን ፈልግ...",
    knowledge_category_all: "ሁሉም",
    knowledge_category_crops: "እርሻ",
    knowledge_category_livestock: "ግልጽ",
    knowledge_category_climate: "አየር",
    knowledge_category_business: "ንግድ",
    knowledge_read_more: "ተጨማሪ አንብብ",
    knowledge_save_article: "ጽሑፍ አስቀምጥ",
    knowledge_saved_articles: "የተቀመጡ ጽሑፎች",

    market_title: "የገበያ ዋጋ",
    market_price_alerts: "የዋጋ ማስታወቂያ",
    market_nearby_markets: "በቅርብ ያሉ ገበያዎች",
    market_add_listing: "መረጃ አክል",
    market_my_listings: "የእኔ መረጃ",

    community_title: "ማህበራት",
    community_new_post: "አዲስ ማስታወቂያ",
    community_reply: "ምላሽ",
    community_like: "ይወድ",

    profile_title: "መገለጫ",
    profile_edit: "መገለጫ ቀይር",
    profile_logout: "ወጣ",
    profile_farm_details: "የእርሻ መረጃ",
    profile_language_setting: "ቋንቋ",
    profile_notifications: "ማስታወቂያዎች",

    error_network: "የመስመር ስህተት። እባክህ ግንኙነትህን ሞክር።",
    error_generic: "ችግር ተፈጥሯል። እባክህ እንደገና ሞክር።",
    error_not_found: "ገጹ አልተገኘም።",
    error_unauthorized: "እባክህ በመቀጠል ይግቡ።",
    error_timeout: "ጊዜው አብቅቷል። እባክህ እንደገና ሞክር።",
    error_save_failed: "ማስቀመጥ አልተቻለም። እባክህ እንደገና ሞክር።",

    settings_push_notifications: "ፑሽ ማስታወቂያዎች",
    settings_daily_tips: "የዕለት ተዕለት የእርሻ ምክሮች",
    settings_consult_updates: "የምክር ማሻሻያዎች",
    settings_appearance: "መገለጫ",
    settings_dark_mode: "ጥልቅ ገጽታ",
    settings_about: "ስለ እኛ",
    settings_about_desc: "በ AI የሚነሱ የእርሻ ምክሮች በመስጠት የአፍሪካ ነጋዴዎችን ማበረታታት።",

    learn_offline_banner: "በመስመር ላይ አይደለህም። የተቀመጡ ጽሑፎች እያሳየ።",
    learn_saved_offline: "ለመስመር ያልተገኘ ማንበብ ተቀምጧል",
    learn_fetching: "የቅርብ ጊዜ ጽሑፎች እየተContentLoaded...",

    consult_title: "የግልጽ ምክር",
    consult_crop_label: "የእርሻ ዓይነት",
    consult_crop_placeholder: "የእርሻ ዓይነት ምረጥ",
    consult_problem_label: "ችግሩን ግለጽ",
    consult_problem_placeholder: "ምን ችግር ነው ለእርሻህ የምትเหው?",
    consult_photo_label: "ፎቶ አክል",
    consult_photo_hint: "ከ5MB በላይ አይደለም። JPG ወይም PNG።",
    consult_submit: "ምክር አስቀምጥ",
    consult_submitting: "በማስቀመጥ ላይ...",
    consult_success: "ምክሩ በተሳካ ሁኔታ ተቀምጧል",
    consult_ticket_pending: "በመጠበቅ ላይ",
    consult_ticket_under_review: "በማጣቀስ ላይ",
    consult_ticket_responded: "ምላሽ ተሰጥቷል",
    consult_ticket_closed: "ተዝጋቧል",
    consult_image_too_large: "ፎቱ ከ5MB በላይ ነው",
    consult_upload_failed: "መጫን አልተቻለም። እባክህ እንደገና ሞክር።",
    consult_try_again: "እንደገና ሞክር",
    consult_my_tickets: "የእኔ ምክሮች",
    consult_new_request: "አዲስ ጥያቄ",

    chat_empty_title: "ስለእርሻ ማንኛውንም ነገር ጠይቅ",
    chat_empty_subtitle: "ስለ እርሻ፣ በሬት፣ ዛፍ፣ መትከል እና ሌሎች ነገሮች ልርዳህ እችላለሁ።",
    chat_input_placeholder: "ስለ እርሻህ ጠይቅ...",
    chat_streaming: "AI እያመለከተ ነው...",
    chat_response_complete: "ምላሹ ተጠናቋል",
    chat_send_message: "መልዕክት ላክ",
    chat_stop_generation: "ማስጠንቀቂያ አቁም",
    chat_message_input: "መልዕክት ያስገቡ",
    chat_attach_image: "ፎቶ አክል",
    chat_suggestion_1: "ለምን የበስጣ አኳናን ቢጫ ይሆናል?",
    chat_suggestion_2: "ቸኮላ ለመትከል ምን ጊዜ ትልቅ ነው?",
    chat_suggestion_3: "ንatiletomato እንዴት ነው የምቃወምት?",
    chat_suggestion_4: "ለሪስ ምን ተጥባጭ መጠቅም አለብኝ?",
  },

  // =========================================================================
  // ISIZULU
  // =========================================================================
  zu: {
    app_name: "AgriAfrica AI",
    loading: "Iyalayisha...",
    save: "Gcina",
    cancel: "Khansela",
    delete: "Susa",
    edit: "Lungisa",
    back: "Emuva",
    next: "Okulandelayo",
    submit: "Thumela",
    confirm: "Qinisa",
    close: "Vala",
    search: "Sesha",
    no_results: "Akukho okutholakele",
    retry: "Zama futhi",
    offline: "Awuxhunyekile ku-inthanethi",
    online: "Ixhunywe",

    nav_home: "Ikhaya",
    nav_knowledge: "Ulwazi",
    nav_market: "Imakethe",
    nav_community: "Umphakathi",
    nav_profile: "Iphrofayela",
    nav_ask_ai: "Buza i-AI",
    nav_consult: "Xhumana",

    onboarding_welcome: "Siyakwamukela ku-AgriAfrica AI",
    onboarding_subtitle: "Umlingani wakho wezolimo e-Afrika",
    onboarding_language_prompt: "Khetha ulimi lwakho",
    onboarding_name_label: "Igama Eligcwele",
    onboarding_name_placeholder: "Faka igama lakho eligcwele",
    onboarding_phone_label: "Inombolo yocingo",
    onboarding_phone_placeholder: "Faka inombolo yocingo",
    onboarding_location_label: "Indawo",
    onboarding_location_placeholder: "Faka indawo oyohlala kuyo",
    onboarding_farm_size_label: "Usayizi we-farm (hectares)",
    onboarding_farm_size_placeholder: "Faka usayizi we-farm nge-hectares",
    onboarding_crops_label: "Izilimo",
    onboarding_crops_placeholder: "njengo: Ummbila, Umtshubisi, Iyam",
    onboarding_complete_btn: "Qala",

    dashboard_greeting: "Sawubona",
    dashboard_weather_title: "Isimo Sezulu",
    dashboard_articles_title: "Amanyuzi Okugcina",
    dashboard_prices_title: "Intengo Yemakethe",
    dashboard_quick_actions: "Izenzo Ezisheshayo",
    dashboard_view_all: "Buka Konke",

    knowledge_title: "Ibhuloho Lolwazi",
    knowledge_search_placeholder: "Sesha amanyuza...",
    knowledge_category_all: "Konke",
    knowledge_category_crops: "Izilimo",
    knowledge_category_livestock: "Izinkomo",
    knowledge_category_climate: "Isimo Sezulu",
    knowledge_category_business: "Ibhizinisi",
    knowledge_read_more: "Funda Kabanzi",
    knowledge_save_article: "Gcina I南希",
    knowledge_saved_articles: "Amanyuza Agciniwe",

    market_title: "Intengo Yemakethe",
    market_price_alerts: "Isexwayiso Setengo",
    market_nearby_markets: "Imakethe Eseduze",
    market_add_listing: "Engeza Isitayela",
    market_my_listings: "Izitayela Zami",

    community_title: "Umphakathi",
    community_new_post: "Iposi Elisha",
    community_reply: "Phendula",
    community_like: "Thanda",

    profile_title: "Iphrofayela",
    profile_edit: "Lungisa Iphrofayela",
    profile_logout: "Phuma",
    profile_farm_details: "Imininingwane Yefamu",
    profile_language_setting: "Ulimi",
    profile_notifications: "Izexwayiso",

    error_network: "Iphutha lenethiwekhi. Sicela uhlola ukuxhumana kwakho.",
    error_generic: "Kunokungahambi kahle. Sicela uzame futhi.",
    error_not_found: "Ikhasi alitholakali.",
    error_unauthorized: "Sicela ungene ukuze uqhubeke.",
    error_timeout: "Isicelo sidingiswe yisikhathi. Sicela uzame futhi.",
    error_save_failed: "Kuhlulekile ukugcina. Sicela uzame futhi.",

    settings_push_notifications: "Izaziso ze-Push",
    settings_daily_tips: "Izeluleko Zokulima Zansuku",
    settings_consult_updates: "Ukuvuselelwa Kokubonisana",
    settings_appearance: "Ukubukeka",
    settings_dark_mode: "Isimo Somnyama",
    settings_about: "Mayelana",
    settings_about_desc: "Sinikeza abalimi base-Afrika ngeluleko yokulima eqhutshwa yi-AI.",

    learn_offline_banner: "Awuxhunyekile ku-inthanethi. Ibuyisela amanyuza agciniwe.",
    learn_saved_offline: "Kugcinwe ukufunda ngaphandle kwe-inthanethi",
    learn_fetching: "Ithatha amanyuza amasha...",

    consult_title: "Ukuxhumana Ngethiphu",
    consult_crop_label: "Uhlobo Lwezilimo",
    consult_crop_placeholder: "Khetha uhlobo lwezilimo",
    consult_problem_label: "Chaza Inkinga",
    consult_problem_placeholder: "Yini inkinga oyibonayo e-farm yakho?",
    consult_photo_label: "Faka Iphicenti",
    consult_photo_hint: "Max 5MB ngayinye. JPG noma PNG.",
    consult_submit: "Thumela Isicelo",
    consult_submitting: "Iyathumela...",
    consult_success: "Isicelo sithunyelwe ngempumelelo",
    consult_ticket_pending: "Iyalinde",
    consult_ticket_under_review: "Iyahlola",
    consult_ticket_responded: "Iphendulwe",
    consult_ticket_closed: "Ivaliwe",
    consult_image_too_large: "Iphicenti idlula 5MB",
    consult_upload_failed: "Ukulayisha kuhlulekile. Sicela uzame futhi.",
    consult_try_again: "Zama Futhi",
    consult_my_tickets: "Izicelo Zami",
    consult_new_request: "Isicelo Elisha",

    chat_empty_title: "Buza noma yini ngokulima",
    chat_empty_subtitle: "Ngingakusiza ngezilimo, izinambuzane, uhlabathi, ukutshala, nokunye.",
    chat_input_placeholder: "Buza ngezilimo zakho...",
    chat_streaming: "I-AI iphendula...",
    chat_response_complete: "Iphendulo iqediwe",
    chat_send_message: "Thumela umyalezo",
    chat_stop_generation: "Yeka ukukhiqiza",
    chat_message_input: "Faka umyalezo",
    chat_attach_image: "Faka isithombe",
    chat_suggestion_1: "Kungani amaphaphu embila yami eqala ukuba luhlaza okwesibhakabhaka?",
    chat_suggestion_2: "Isikhathi esihle sokutshala utshubisi yini?",
    chat_suggestion_3: "Ngisilawula kanjani i-blight yetamatisi?",
    chat_suggestion_4: "Ifertilizer yini engayisebenzisa kummbila?",
  },
};

export const languageLabels: Record<Language, string> = {
  en: "English",
  ha: "Hausa",
  yo: "Yorùbá",
  sw: "Kiswahili",
  fr: "Français",
  ig: "Igbo",
  pcm: "Pidgin",
  am: "አማርኛ",
  zu: "isiZulu",
};

export const defaultLanguage: Language = "en";
