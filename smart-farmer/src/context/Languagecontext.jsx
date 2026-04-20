import { createContext, useContext, useState } from "react";

/* ══════════════════════════════════════
   ALL TRANSLATIONS
══════════════════════════════════════ */
const translations = {
  en: {
    // General
    welcome: "Welcome to Smart Farmer",
    selectRole: "Choose how you want to continue",
    back: "← Back",
    continueBtn: "Continue",
    alreadyAccount: "Already have an account?",
    logIn: "Log In",

    // Language
    chooseLang: "Choose Your Language",
    chooseLangDesc: "Select the language you're most comfortable with",

    // Roles
    farmerUser: "Farmer / User",
    farmerDesc: "Register your farm and get smart agriculture insights",
    admin: "Administrator",
    adminDesc: "Manage farmers, data and system settings",

    // Admin login
    adminLogin: "Admin Login",
    adminLoginDesc: "Enter your administrator credentials to continue",
    username: "Username",
    password: "Password",
    loginAsAdmin: "Login as Administrator",
    invalidCreds: "Invalid username or password",
    defaultCreds: "Default credentials",

    // Step labels
    personal: "Personal",
    farmInfo: "Farm Info",
    preferences: "Preferences",

    // Step 1 — Personal
    createAccount: "Create Your Account",
    joinFarmers: "Join thousands of smart farmers",
    fullName: "Full Name",
    namePlaceholder: "Enter your full name",
    nameRequired: "Full name is required",
    mobileNumber: "Mobile Number",
    phonePlaceholder: "10-digit mobile number",
    validPhone: "Enter a valid 10-digit mobile number",
    emailAddress: "Email Address",
    emailPlaceholder: "your@email.com",
    validEmail: "Enter a valid email address",
    passwordLabel: "Password",
    passPlaceholder: "Min. 8 characters",
    minPassword: "Password must be at least 8 characters",
    confirmPassword: "Confirm Password",
    confirmPlaceholder: "Re-enter password",
    passwordMatch: "Passwords do not match",
    continueToFarm: "Continue to Farm Info →",

    // Password strength
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",

    // Step 2 — Farm Info
    farmName: "Farm Name",
    farmPlaceholder: "e.g. Green Valley Farm",
    farmRequired: "Farm name is required",
    cropType: "Primary Crop",
    selectCrop: "Select crop type",
    selectCropError: "Please select a crop type",
    landSize: "Land Size",
    selectLand: "Select land size",
    selectLandError: "Please select land size",
    state: "State",
    selectState: "Select state",
    selectStateError: "Please select a state",
    district: "District",
    districtPlaceholder: "Enter your district",
    districtRequired: "District is required",
    village: "Village / Taluk",
    villagePlaceholder: "Enter village name",
    continueToPrefs: "Continue to Preferences →",

    // Step 3 — Preferences
    irrigationType: "Irrigation Type",
    selectIrrigation: "Select irrigation type",
    drip: "Drip Irrigation",
    sprinkler: "Sprinkler",
    flood: "Flood / Canal",
    borewell: "Borewell",
    rainfed: "Rainfed",
    soilType: "Soil Type",
    selectSoil: "Select soil type",
    blackCotton: "Black Cotton Soil",
    redSoil: "Red Soil",
    alluvial: "Alluvial Soil",
    sandySoil: "Sandy Soil",
    laterite: "Laterite",
    smartAlerts: "Enable Smart Alerts",
    alertsDesc: "Receive weather, pest and crop notifications",
    termsText: "I agree to the",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    agreeTerms: "You must agree to the terms to continue",
    createMyAccount: "Create My Account 🌾",

    // Success
    welcomeUser: "Welcome",
    accountCreated: "Your account has been successfully created!",
    verificationSent: "A verification email has been sent to",
    accountSummary: "Account Summary",
    nameLabel: "Name",
    farmLabel: "Farm",
    locationLabel: "Location",
    cropLabel: "Crop",
    landLabel: "Land",
    goToLogin: "Go to Login →",
    checkEmail: "Please check your email to verify your account",
  },

  te: {
    // General
    welcome: "స్మార్ట్ ఫార్మర్‌కి స్వాగతం",
    selectRole: "మీరు ఎలా కొనసాగాలనుకుంటున్నారో ఎంచుకోండి",
    back: "← వెనక్కి",
    continueBtn: "కొనసాగించు",
    alreadyAccount: "ఇప్పటికే అకౌంట్ ఉందా?",
    logIn: "లాగిన్ చేయండి",

    // Language
    chooseLang: "మీ భాషను ఎంచుకోండి",
    chooseLangDesc: "మీకు సౌకర్యంగా ఉన్న భాషను ఎంచుకోండి",

    // Roles
    farmerUser: "రైతు / వినియోగదారుడు",
    farmerDesc: "మీ పొలాన్ని నమోదు చేసి స్మార్ట్ సమాచారం పొందండి",
    admin: "నిర్వాహకుడు",
    adminDesc: "రైతులు, డేటా మరియు సిస్టమ్ సెట్టింగ్‌లను నిర్వహించండి",

    // Admin login
    adminLogin: "నిర్వాహక లాగిన్",
    adminLoginDesc: "కొనసాగించడానికి మీ నిర్వాహక ఆధారాలను నమోదు చేయండి",
    username: "వినియోగదారు పేరు",
    password: "పాస్‌వర్డ్",
    loginAsAdmin: "నిర్వాహకుడిగా లాగిన్ చేయండి",
    invalidCreds: "వినియోగదారు పేరు లేదా పాస్‌వర్డ్ తప్పు",
    defaultCreds: "డిఫాల్ట్ ఆధారాలు",

    // Step labels
    personal: "వ్యక్తిగత",
    farmInfo: "పొలం వివరాలు",
    preferences: "ప్రాధాన్యతలు",

    // Step 1
    createAccount: "మీ అకౌంట్ సృష్టించండి",
    joinFarmers: "వేలాది స్మార్ట్ రైతులలో చేరండి",
    fullName: "పూర్తి పేరు",
    namePlaceholder: "మీ పూర్తి పేరు నమోదు చేయండి",
    nameRequired: "పూర్తి పేరు అవసరం",
    mobileNumber: "మొబైల్ నంబర్",
    phonePlaceholder: "10 అంకెల మొబైల్ నంబర్",
    validPhone: "చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి",
    emailAddress: "ఇమెయిల్ చిరునామా",
    emailPlaceholder: "your@email.com",
    validEmail: "చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామా నమోదు చేయండి",
    passwordLabel: "పాస్‌వర్డ్",
    passPlaceholder: "కనీసం 8 అక్షరాలు",
    minPassword: "పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి",
    confirmPassword: "పాస్‌వర్డ్ నిర్ధారించండి",
    confirmPlaceholder: "పాస్‌వర్డ్ మళ్ళీ నమోదు చేయండి",
    passwordMatch: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు",
    continueToFarm: "పొలం వివరాలకు కొనసాగించు →",

    // Password strength
    weak: "బలహీనం",
    fair: "సాధారణం",
    good: "మంచిది",
    strong: "బలంగా",

    // Step 2
    farmName: "పొలం పేరు",
    farmPlaceholder: "ఉదా: హరిత వ్యాలీ ఫార్మ్",
    farmRequired: "పొలం పేరు అవసరం",
    cropType: "ప్రధాన పంట",
    selectCrop: "పంట రకం ఎంచుకోండి",
    selectCropError: "దయచేసి పంట రకం ఎంచుకోండి",
    landSize: "భూమి పరిమాణం",
    selectLand: "భూమి పరిమాణం ఎంచుకోండి",
    selectLandError: "దయచేసి భూమి పరిమాణం ఎంచుకోండి",
    state: "రాష్ట్రం",
    selectState: "రాష్ట్రం ఎంచుకోండి",
    selectStateError: "దయచేసి రాష్ట్రం ఎంచుకోండి",
    district: "జిల్లా",
    districtPlaceholder: "మీ జిల్లా నమోదు చేయండి",
    districtRequired: "జిల్లా అవసరం",
    village: "గ్రామం / తాలూకా",
    villagePlaceholder: "గ్రామం పేరు నమోదు చేయండి",
    continueToPrefs: "ప్రాధాన్యతలకు కొనసాగించు →",

    // Step 3
    irrigationType: "నీటిపారుదల రకం",
    selectIrrigation: "నీటిపారుదల రకం ఎంచుకోండి",
    drip: "డ్రిప్ నీటిపారుదల",
    sprinkler: "స్ప్రింక్లర్",
    flood: "వరద / కాలువ",
    borewell: "బోర్వెల్",
    rainfed: "వర్షాధారిత",
    soilType: "నేల రకం",
    selectSoil: "నేల రకం ఎంచుకోండి",
    blackCotton: "నల్ల నేల",
    redSoil: "ఎర్ర నేల",
    alluvial: "ఒండ్రు నేల",
    sandySoil: "ఇసుక నేల",
    laterite: "లాటరైట్",
    smartAlerts: "స్మార్ట్ అలర్ట్‌లు ప్రారంభించండి",
    alertsDesc: "వాతావరణం, తెగులు మరియు పంట నోటిఫికేషన్లు పొందండి",
    termsText: "నేను అంగీకరిస్తున్నాను",
    termsOfService: "సేవా నిబంధనలు",
    and: "మరియు",
    privacyPolicy: "గోప్యతా విధానం",
    agreeTerms: "కొనసాగించడానికి నిబంధనలకు అంగీకరించాలి",
    createMyAccount: "నా అకౌంట్ సృష్టించండి 🌾",

    // Success
    welcomeUser: "స్వాగతం",
    accountCreated: "మీ అకౌంట్ విజయవంతంగా సృష్టించబడింది!",
    verificationSent: "ధృవీకరణ ఇమెయిల్ పంపబడింది",
    accountSummary: "అకౌంట్ సారాంశం",
    nameLabel: "పేరు",
    farmLabel: "పొలం",
    locationLabel: "స్థానం",
    cropLabel: "పంట",
    landLabel: "భూమి",
    goToLogin: "లాగిన్‌కు వెళ్ళండి →",
    checkEmail: "మీ అకౌంట్‌ను ధృవీకరించడానికి ఇమెయిల్ చూడండి",
  },

  hi: {
    // General
    welcome: "स्मार्ट फार्मर में आपका स्वागत है",
    selectRole: "आप कैसे जारी रखना चाहते हैं चुनें",
    back: "← वापस",
    continueBtn: "जारी रखें",
    alreadyAccount: "पहले से खाता है?",
    logIn: "लॉग इन करें",

    // Language
    chooseLang: "अपनी भाषा चुनें",
    chooseLangDesc: "वह भाषा चुनें जिसमें आप सबसे सहज हों",

    // Roles
    farmerUser: "किसान / उपयोगकर्ता",
    farmerDesc: "अपना खेत पंजीकृत करें और स्मार्ट जानकारी पाएं",
    admin: "प्रशासक",
    adminDesc: "किसानों, डेटा और सिस्टम सेटिंग्स प्रबंधित करें",

    // Admin login
    adminLogin: "प्रशासक लॉगिन",
    adminLoginDesc: "जारी रखने के लिए अपनी प्रशासक जानकारी दर्ज करें",
    username: "उपयोगकर्ता नाम",
    password: "पासवर्ड",
    loginAsAdmin: "प्रशासक के रूप में लॉगिन करें",
    invalidCreds: "उपयोगकर्ता नाम या पासवर्ड गलत है",
    defaultCreds: "डिफ़ॉल्ट जानकारी",

    // Step labels
    personal: "व्यक्तिगत",
    farmInfo: "खेत की जानकारी",
    preferences: "प्राथमिकताएं",

    // Step 1
    createAccount: "अपना खाता बनाएं",
    joinFarmers: "हजारों स्मार्ट किसानों से जुड़ें",
    fullName: "पूरा नाम",
    namePlaceholder: "अपना पूरा नाम दर्ज करें",
    nameRequired: "पूरा नाम आवश्यक है",
    mobileNumber: "मोबाइल नंबर",
    phonePlaceholder: "10 अंकों का मोबाइल नंबर",
    validPhone: "वैध 10 अंकों का मोबाइल नंबर दर्ज करें",
    emailAddress: "ईमेल पता",
    emailPlaceholder: "your@email.com",
    validEmail: "वैध ईमेल पता दर्ज करें",
    passwordLabel: "पासवर्ड",
    passPlaceholder: "न्यूनतम 8 अक्षर",
    minPassword: "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    confirmPlaceholder: "पासवर्ड फिर से दर्ज करें",
    passwordMatch: "पासवर्ड मेल नहीं खाते",
    continueToFarm: "खेत की जानकारी के लिए जारी रखें →",

    // Password strength
    weak: "कमजोर",
    fair: "ठीक है",
    good: "अच्छा",
    strong: "मजबूत",

    // Step 2
    farmName: "खेत का नाम",
    farmPlaceholder: "जैसे: हरित घाटी खेत",
    farmRequired: "खेत का नाम आवश्यक है",
    cropType: "मुख्य फसल",
    selectCrop: "फसल का प्रकार चुनें",
    selectCropError: "कृपया फसल का प्रकार चुनें",
    landSize: "भूमि का आकार",
    selectLand: "भूमि का आकार चुनें",
    selectLandError: "कृपया भूमि का आकार चुनें",
    state: "राज्य",
    selectState: "राज्य चुनें",
    selectStateError: "कृपया राज्य चुनें",
    district: "जिला",
    districtPlaceholder: "अपना जिला दर्ज करें",
    districtRequired: "जिला आवश्यक है",
    village: "गांव / तालुका",
    villagePlaceholder: "गांव का नाम दर्ज करें",
    continueToPrefs: "प्राथमिकताओं के लिए जारी रखें →",

    // Step 3
    irrigationType: "सिंचाई का प्रकार",
    selectIrrigation: "सिंचाई का प्रकार चुनें",
    drip: "ड्रिप सिंचाई",
    sprinkler: "स्प्रिंकलर",
    flood: "बाढ़ / नहर",
    borewell: "बोरवेल",
    rainfed: "वर्षा आधारित",
    soilType: "मिट्टी का प्रकार",
    selectSoil: "मिट्टी का प्रकार चुनें",
    blackCotton: "काली मिट्टी",
    redSoil: "लाल मिट्टी",
    alluvial: "जलोढ़ मिट्टी",
    sandySoil: "बलुई मिट्टी",
    laterite: "लैटेराइट",
    smartAlerts: "स्मार्ट अलर्ट सक्षम करें",
    alertsDesc: "मौसम, कीट और फसल सूचनाएं प्राप्त करें",
    termsText: "मैं सहमत हूं",
    termsOfService: "सेवा की शर्तें",
    and: "और",
    privacyPolicy: "गोपनीयता नीति",
    agreeTerms: "जारी रखने के लिए शर्तों से सहमत होना आवश्यक है",
    createMyAccount: "मेरा खाता बनाएं 🌾",

    // Success
    welcomeUser: "स्वागत है",
    accountCreated: "आपका खाता सफलतापूर्वक बनाया गया है!",
    verificationSent: "सत्यापन ईमेल भेजा गया है",
    accountSummary: "खाता सारांश",
    nameLabel: "नाम",
    farmLabel: "खेत",
    locationLabel: "स्थान",
    cropLabel: "फसल",
    landLabel: "भूमि",
    goToLogin: "लॉगिन पर जाएं →",
    checkEmail: "अपने खाते को सत्यापित करने के लिए ईमेल देखें",
  },
};

/* ══════════════════════════════════════
   CONTEXT
══════════════════════════════════════ */
const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState("en"); // default language

  // t() function — looks up the key in current language, falls back to English
  const t = (key) => translations[lang]?.[key] ?? translations["en"][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}