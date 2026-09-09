// state.js — Zenith v1 local-first store, categories, formatters, copy

const ZENITH_STORE_KEY = 'zenith_v1_store';

const ZENITH = {
  page: '#F2F5FA',
  ink: '#0F172A',
  muted: '#64748B',
  accent: '#2563EB',
  accentDeep: '#1D4ED8',
  card: '#FFFFFF',
  cream: '#E8EEF7',
  live: '#059669',
  warn: '#D97706',
};

function zenithTone(key) {
  const fallback = {
    page: '#F2F5FA', ink: '#0F172A', muted: '#64748B',
    accent: '#2563EB', accentDeep: '#1D4ED8', card: '#FFFFFF',
    cream: '#E8EEF7', live: '#059669', warn: '#D97706',
  };
  return (typeof ZENITH !== 'undefined' && ZENITH[key]) || fallback[key];
}

function zenithHeroGradient() {
  return 'linear-gradient(145deg, ' + ZENITH.accent + ' 0%, ' + ZENITH.accentDeep + ' 100%)';
}

function zenithHeroShadow() {
  return '0 12px 40px rgba(29,78,216,0.28)';
}

function zenithSoftShadow() {
  return '0 2px 14px rgba(15,23,42,0.06)';
}

const CATEGORY_GROUPS = [
  { id: 'grp-food', name: 'Food', nameHi: 'खाना', emoji: '🍽️', color: '#F97316', type: 'expense', group: 'food' },
  { id: 'grp-move', name: 'Transport', nameHi: 'यातायात', emoji: '🛺', color: '#3B82F6', type: 'expense', group: 'move' },
  { id: 'grp-home', name: 'Home', nameHi: 'घर', emoji: '🏠', color: '#8B5CF6', type: 'expense', group: 'home' },
  { id: 'grp-life', name: 'Life', nameHi: 'जीवन', emoji: '✨', color: '#EC4899', type: 'expense', group: 'life' },
  { id: 'grp-money', name: 'Money', nameHi: 'पैसा', emoji: '💼', color: '#10B981', type: 'expense', group: 'money' },
];

const DEFAULT_CATEGORIES = [
  { id: 'kirana', name: 'Kirana', nameHi: 'किराना', emoji: '🛒', color: '#34D399', type: 'expense', group: 'food' },
  { id: 'chai', name: 'Chai / Coffee', nameHi: 'चाय / कॉफ़ी', emoji: '☕', color: '#C4A484', type: 'expense', group: 'food' },
  { id: 'tiffin', name: 'Tiffin / Zomato', nameHi: 'टिफ़िन / ज़ोमैटो', emoji: '🍱', color: '#FF6B6B', type: 'expense', group: 'food' },
  { id: 'dining', name: 'Dining', nameHi: 'डाइनिंग', emoji: '🍽️', color: '#F97316', type: 'expense', group: 'food' },
  { id: 'auto', name: 'Auto / Rapido', nameHi: 'ऑटो / रैपिडो', emoji: '🛺', color: '#60A5FA', type: 'expense', group: 'move' },
  { id: 'cab', name: 'Cab', nameHi: 'कैब', emoji: '🚕', color: '#3B82F6', type: 'expense', group: 'move' },
  { id: 'metro', name: 'Metro / Bus', nameHi: 'मेट्रो / बस', emoji: '🚇', color: '#0EA5E9', type: 'expense', group: 'move' },
  { id: 'fuel', name: 'Fuel / Fastag', nameHi: 'पेट्रोल / फास्टैग', emoji: '⛽', color: '#F59E0B', type: 'expense', group: 'move' },
  { id: 'rent', name: 'Rent', nameHi: 'किराया', emoji: '🏠', color: '#8B5CF6', type: 'expense', group: 'home' },
  { id: 'society', name: 'Society', nameHi: 'सोसाइटी', emoji: '🏢', color: '#6366F1', type: 'expense', group: 'home' },
  { id: 'lpg', name: 'LPG', nameHi: 'एलपीजी', emoji: '🔥', color: '#EF4444', type: 'expense', group: 'home' },
  { id: 'electricity', name: 'Electricity', nameHi: 'बिजली', emoji: '💡', color: '#EAB308', type: 'expense', group: 'home' },
  { id: 'broadband', name: 'Broadband', nameHi: 'ब्रॉडबैंड', emoji: '📡', color: '#14B8A6', type: 'expense', group: 'home' },
  { id: 'health', name: 'Health', nameHi: 'स्वास्थ्य', emoji: '💊', color: '#F97316', type: 'expense', group: 'life' },
  { id: 'shopping', name: 'Shopping', nameHi: 'शॉपिंग', emoji: '🛍️', color: '#EC4899', type: 'expense', group: 'life' },
  { id: 'entertainment', name: 'Entertainment', nameHi: 'मनोरंजन', emoji: '🎬', color: '#A78BFA', type: 'expense', group: 'life' },
  { id: 'puja', name: 'Puja', nameHi: 'पूजा', emoji: '🪔', color: '#F59E0B', type: 'expense', group: 'life' },
  { id: 'sip', name: 'SIP', nameHi: 'एसआईपी', emoji: '📈', color: '#10B981', type: 'expense', group: 'money' },
  { id: 'transfer', name: 'Transfer', nameHi: 'ट्रांसफर', emoji: '↔️', color: '#64748B', type: 'transfer', group: 'money' },
  { id: 'cashback', name: 'Cashback', nameHi: 'कैशबैक', emoji: '💸', color: '#22C55E', type: 'income', group: 'money' },
  { id: 'salary', name: 'Salary', nameHi: 'वेतन', emoji: '💼', color: '#16A34A', type: 'income', group: 'money' },
  { id: 'other', name: 'Other', nameHi: 'अन्य', emoji: '✦', color: '#6E6E73', type: 'expense', group: 'money' },
];

const DEFAULT_ACCOUNTS = [
  { id: 'cash', name: 'Cash', nameHi: 'नकद', opening: 0 },
  { id: 'bank', name: 'Bank', nameHi: 'बैंक', opening: 0 },
  { id: 'card', name: 'Credit card', nameHi: 'क्रेडिट कार्ड', opening: 0 },
];

const COPY = {
  en: {
    hi: "Hi, I'm Zenith.",
    callYou: 'What should I call you?',
    yourName: 'Your name',
    continue: 'Continue',
    langTitle: 'Choose your language',
    langSub: 'You can change this later in You.',
    cashTitle: 'How much cash do you have',
    cashNow: 'right now?',
    cashHint: 'This is opening cash, not your salary. You can add accounts later.',
    skipCash: 'Skip with ₹0',
    setBalance: 'Set opening cash',
    privacyTitle: 'Your data stays with you.',
    noCloud: 'No Cloud Sync',
    noCloudDesc: 'The ledger lives on this device. Optional voice and receipt OCR use Sarvam and Cloud Vision when those keys are set.',
    encrypt: 'Local storage',
    encryptDesc: 'Your ledger stays in this browser. We never see it.',
    noHarvest: 'Zero Data Harvest',
    noHarvestDesc: "We don't collect your name, spend, or contacts.",
    begin: "I understand — let's begin",
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    leftToSpend: 'Left to spend',
    dailyAllow: 'Daily allowance',
    daysLeft: 'Days left',
    spentMonth: 'Spent this month',
    ofBudget: 'of {n} budget',
    noBudgetYet: 'No monthly budget yet',
    categories: 'Categories',
    seeAll: 'See all',
    recent: 'Recent activity',
    all: 'All',
    emptyHome: 'Add your first expense',
    emptyHomeSub: 'Tap + to log a UPI, card, or cash payment.',
    nearLimit: 'Near limit',
    overspent: 'Overspent',
    home: 'Home',
    activity: 'Activity',
    plan: 'Plan',
    you: 'You',
    addTxn: 'Add',
    expense: 'Expense',
    income: 'Income',
    transferType: 'Transfer',
    account: 'Account',
    method: 'Method',
    date: 'Date',
    category: 'Category',
    note: 'Note',
    pickCategory: 'Pick a category',
    addAmount: 'Add {n}',
    save: 'Save',
    close: 'Close',
    backspace: 'Backspace',
    search: 'Search',
    searchPh: 'Search Zomato, kirana, rent…',
    noTxns: 'No transactions yet',
    budgets: 'Budgets',
    goals: 'Goals',
    recurring: 'Recurring',
    monthlyIncome: 'Monthly income',
    setIncome: 'Set income',
    allocated: 'Allocated',
    unallocated: 'Unallocated',
    incomeHint: 'Optional. Used to see how much is still unassigned.',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    confirmDelete: 'Delete this transaction?',
    confirmDeleteSub: 'This cannot be undone.',
    later: 'Later',
    travelLater: 'Travel Mode is coming later.',
    language: 'Language',
    localOnly: 'Ledger stays in this browser and the Home Screen app. Notion sync is optional and off by default.',
    alerts: 'Alerts',
    allCaughtUp: 'All caught up',
    allCaughtUpSub: 'Budget warnings will show here when a category hits 90%.',
    notifications: 'Notifications',
    profile: 'Profile',
    firstExpense: 'Add expense',
    notionExpenses: 'Notion Expenses',
    notionThisMonth: 'This month',
    notionExample: 'Example data',
    notionLive: 'Live from Notion',
    notionMissing: 'Notion env is not set. Showing example INR expenses until NOTION_TOKEN is wired.',
    notionError: 'Could not load Notion',
    notionRetry: 'Try again',
    notionEmpty: 'No Notion expenses yet',
    notionReadOnly: 'Read-only. Expense Tracker writes to Notion.',
    localLedger: 'Local',
    notionSource: 'Notion',
    notionByCategory: 'By category',
    notionByKind: 'By kind',
    notionByTrip: 'By trip',
    notionUnpriced: '{n} unpriced (₹—) left out of this total',
    notionAccounts: 'Accounts',
    notionBudgets: 'Notion budgets',
    notionBalance: 'Balance',
    notionOpening: 'Opening',
    notionSpentTagged: 'Tagged spend',
    notionOpeningMissing: 'Opening not set',
    notionSpendOnly: 'Spend only',
    notionSpendOnlyHint: 'Staff UPI — spend total, not a wallet.',
    notionLeftMonth: 'Left this month',
    notionCapMissing: 'No monthly cap',
    notionOverBy: 'Over by {n}',
    notionAccountsEmpty: 'No Notion accounts yet',
    notionBudgetsEmpty: 'No Notion budgets yet',
    notionAccountsHint: 'Cash and IDFC: opening minus tagged spend. Kamlesh UPI is spend-only. Inactive wallets are hidden.',
    notionBudgetsHint: 'Monthly cap minus this-month spend in that Category. Expense Tracker owns the caps.',
    notionAcrossCaps: 'across category caps',
    voiceTitle: 'Voice',
    voiceHint: 'Try “Zomato pe 349” or “spent 200 on chai”.',
    voiceNeedKey: 'Add SARVAM_API_KEY to transcribe with Sarvam Saaras. You can still log manually.',
    voiceHold: 'Tap to speak',
    voiceStop: 'Stop',
    voiceListening: 'Listening…',
    voiceSending: 'Transcribing…',
    scanTitle: 'Scan receipt',
    scanHint: 'Photo is compressed on this device. Cloud Vision reads it when GOOGLE_CLOUD_VISION_API_KEY is set.',
    scanNoOcr: 'OCR is off. The photo still attaches locally.',
    addFromVoice: 'Review & add',
    attachPhoto: 'Attach photo',
    addAccount: 'Add account',
    editAccount: 'Edit account',
    accountName: 'Account name',
    openingBalance: 'Opening balance',
    monthlyCap: 'Monthly budget',
    addCategory: 'Add category',
    editCategory: 'Edit category',
    categoryName: 'Category name',
    newAccount: 'New',
    newCategory: 'New',
    accountsTitle: 'Accounts',
    saveChanges: 'Save',
    installHome: 'Safari → Share → Add to Home Screen to hide the browser bar.',
    moneyHint: 'Edit is in the top-right. Manage accounts to rename, set opening cash, and set a monthly budget per bank.',
    categoryHint: 'Open Categories to add, rename, delete, reorder, and nest subcategories.',
    cannotDeleteLast: 'Keep at least one account.',
    manageAccounts: 'Manage accounts',
    manageCategories: 'Manage categories',
    subcategory: 'Subcategory',
    addSubcategory: 'Add subcategory',
    done: 'Done',
    customizeHint: 'Accounts, category trees, and per-account budgets live here — same depth as a ledger app, calmer UI.',
    moveUp: 'Move up',
    moveDown: 'Move down',
    parentCategory: 'Parent',
    noSubcategories: 'No subcategories yet',
    accountsManageHint: 'Opening balance and a monthly cap per account. Reorder with the arrows.',
  },
  hi: {
    hi: 'नमस्ते, मैं Zenith हूँ।',
    callYou: 'आपको क्या कहूँ?',
    yourName: 'आपका नाम',
    continue: 'आगे बढ़ें',
    langTitle: 'भाषा चुनें',
    langSub: 'यह बाद में You में बदल सकते हैं।',
    cashTitle: 'अभी आपके पास कितनी नकदी है',
    cashNow: 'इस समय?',
    cashHint: 'यह शुरुआती नकदी है, सैलरी नहीं। खाते बाद में जोड़ सकते हैं।',
    skipCash: '₹0 से छोड़ें',
    setBalance: 'नकदी सेट करें',
    privacyTitle: 'आपका डेटा आपके पास रहता है।',
    noCloud: 'कोई क्लाउड सिंक नहीं',
    noCloudDesc: 'बही इस डिवाइस पर है। Voice और रसीद OCR तभी Sarvam/Vision पर जाते हैं जब कुंजी सेट हो।',
    encrypt: 'लोकल स्टोरेज',
    encryptDesc: 'आपकी बही इसी ब्राउज़र में रहती है।',
    noHarvest: 'कोई डेटा कलेक्ट नहीं',
    noHarvestDesc: 'हम आपका नाम या खर्च नहीं देखते।',
    begin: 'समझ गया — शुरू करें',
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'नमस्कार',
    goodEvening: 'शुभ संध्या',
    leftToSpend: 'खर्च करने को बचा',
    dailyAllow: 'रोज़ का भत्ता',
    daysLeft: 'बचे दिन',
    spentMonth: 'इस महीने खर्च',
    ofBudget: '{n} बजट में से',
    noBudgetYet: 'अभी मासिक बजट नहीं',
    categories: 'श्रेणियाँ',
    seeAll: 'सभी',
    recent: 'हाल की गतिविधि',
    all: 'सभी',
    emptyHome: 'पहला खर्च जोड़ें',
    emptyHomeSub: '+ दबाकर UPI, कार्ड या कैश लिखें।',
    nearLimit: 'सीमा के पास',
    overspent: 'बजट से ज़्यादा',
    home: 'होम',
    activity: 'गतिविधि',
    plan: 'योजना',
    you: 'आप',
    addTxn: 'जोड़ें',
    expense: 'खर्च',
    income: 'आय',
    transferType: 'ट्रांसफर',
    account: 'खाता',
    method: 'तरीका',
    date: 'तारीख',
    category: 'श्रेणी',
    note: 'नोट',
    pickCategory: 'श्रेणी चुनें',
    addAmount: '{n} जोड़ें',
    save: 'सेव',
    close: 'बंद',
    backspace: 'बैकस्पेस',
    search: 'खोज',
    searchPh: 'ज़ोमैटो, किराना, किराया…',
    noTxns: 'अभी कोई लेन-देन नहीं',
    budgets: 'बजट',
    goals: 'लक्ष्य',
    recurring: 'आवर्ती',
    monthlyIncome: 'मासिक आय',
    setIncome: 'आय सेट करें',
    allocated: 'आवंटित',
    unallocated: 'बाकी',
    incomeHint: 'वैकल्पिक। यह दिखाता है कितना अभी असाइन नहीं हुआ।',
    edit: 'बदलें',
    delete: 'हटाएँ',
    cancel: 'रद्द',
    confirmDelete: 'यह लेन-देन हटाएँ?',
    confirmDeleteSub: 'यह वापस नहीं आएगा।',
    later: 'बाद में',
    travelLater: 'ट्रैवल मोड बाद में आएगा।',
    language: 'भाषा',
    localOnly: 'बही इस ब्राउज़र और होम स्क्रीन ऐप में रहती है। Notion सिंक वैकल्पिक है और डिफ़ॉल्ट बंद है।',
    alerts: 'अलर्ट',
    allCaughtUp: 'सब ठीक है',
    allCaughtUpSub: 'कोई श्रेणी 90% पर पहुँचे तो चेतावनी यहाँ दिखेगी।',
    notifications: 'सूचनाएँ',
    profile: 'प्रोफ़ाइल',
    firstExpense: 'खर्च जोड़ें',
    notionExpenses: 'Notion खर्च',
    notionThisMonth: 'इस महीने',
    notionExample: 'उदाहरण डेटा',
    notionLive: 'Notion से लाइव',
    notionMissing: 'Notion env सेट नहीं है। NOTION_TOKEN लगाने तक उदाहरण INR खर्च दिखेंगे।',
    notionError: 'Notion लोड नहीं हुआ',
    notionRetry: 'फिर कोशिश करें',
    notionEmpty: 'Notion में अभी खर्च नहीं',
    notionReadOnly: 'सिर्फ़ पढ़ने के लिए। Expense Tracker Notion पर लिखता है।',
    localLedger: 'लोकल',
    notionSource: 'Notion',
    notionByCategory: 'श्रेणी',
    notionByKind: 'प्रकार',
    notionByTrip: 'ट्रिप',
    notionUnpriced: '{n} बिना राशि (₹—) कुल में नहीं हैं',
    notionAccounts: 'खाते',
    notionBudgets: 'Notion बजट',
    notionBalance: 'शेष',
    notionOpening: 'शुरुआती',
    notionSpentTagged: 'टैग किया खर्च',
    notionOpeningMissing: 'शुरुआती शेष नहीं',
    notionSpendOnly: 'सिर्फ़ खर्च',
    notionSpendOnlyHint: 'स्टाफ़ UPI — खर्च का योग, वॉलेट नहीं।',
    notionLeftMonth: 'इस महीने बचा',
    notionCapMissing: 'मासिक सीमा नहीं',
    notionOverBy: '{n} ज़्यादा',
    notionAccountsEmpty: 'Notion में अभी खाते नहीं',
    notionBudgetsEmpty: 'Notion में अभी बजट नहीं',
    notionAccountsHint: 'कैश और IDFC: शुरुआती शेष में से टैग खर्च। Kamlesh UPI सिर्फ़ खर्च। निष्क्रिय खाते छिपे हैं।',
    notionBudgetsHint: 'मासिक सीमा में से इस महीने की श्रेणी का खर्च। सीमा Expense Tracker लिखता है।',
    notionAcrossCaps: 'श्रेणी सीमाओं में',
    voiceTitle: 'आवाज़',
    voiceHint: '“Zomato pe 349” या “spent 200 on chai” कहें।',
    voiceNeedKey: 'Sarvam Saaras के लिए SARVAM_API_KEY लगाएँ। मैन्युअल जोड़ अभी भी चलता है।',
    voiceHold: 'बोलने के लिए टैप करें',
    voiceStop: 'रोकें',
    voiceListening: 'सुन रहा है…',
    voiceSending: 'लिख रहा है…',
    scanTitle: 'रसीद स्कैन',
    scanHint: 'फ़ोटो यहीं कंप्रेस होती है। GOOGLE_CLOUD_VISION_API_KEY हो तो Vision पढ़ेगा।',
    scanNoOcr: 'OCR बंद है। फ़ोटो लोकल अटैच रहेगी।',
    addFromVoice: 'जाँचकर जोड़ें',
    attachPhoto: 'फ़ोटो जोड़ें',
    addAccount: 'खाता जोड़ें',
    editAccount: 'खाता बदलें',
    accountName: 'खाते का नाम',
    openingBalance: 'शुरुआती शेष',
    monthlyCap: 'मासिक बजट',
    addCategory: 'श्रेणी जोड़ें',
    editCategory: 'श्रेणी बदलें',
    categoryName: 'श्रेणी का नाम',
    newAccount: 'नया',
    newCategory: 'नई',
    accountsTitle: 'खाते',
    saveChanges: 'सेव',
    installHome: 'Safari → Share → होम स्क्रीन पर जोड़ें, ताकि ब्राउज़र बार छिपे।',
    moneyHint: 'ऊपर दाएँ Edit है। खाते में नाम, शुरुआती शेष, और बैंक का मासिक बजट सेट करें।',
    categoryHint: 'श्रेणियाँ खोलकर जोड़ें, नाम बदलें, हटाएँ, क्रम बदलें, और उपश्रेणी बनाएँ।',
    cannotDeleteLast: 'कम से कम एक खाता रखें।',
    manageAccounts: 'खाते प्रबंधित करें',
    manageCategories: 'श्रेणियाँ प्रबंधित करें',
    subcategory: 'उपश्रेणी',
    addSubcategory: 'उपश्रेणी जोड़ें',
    done: 'हो गया',
    customizeHint: 'खाते, श्रेणी पेड़, और हर खाते का बजट यहीं — पूरी डिटेल, साफ़ UI।',
    moveUp: 'ऊपर',
    moveDown: 'नीचे',
    parentCategory: 'मूल श्रेणी',
    noSubcategories: 'अभी उपश्रेणी नहीं',
    accountsManageHint: 'शुरुआती शेष और हर खाते की मासिक सीमा। तीर से क्रम बदलें।',
  },
};

function t(locale, key, vars) {
  const table = COPY[locale] || COPY.en;
  let s = table[key] || COPY.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      s = s.replace('{' + k + '}', vars[k]);
    });
  }
  return s;
}

function catLabel(cat, locale) {
  if (!cat) return '';
  return locale === 'hi' ? cat.nameHi : cat.name;
}

function acctLabel(acct, locale) {
  if (!acct) return '';
  return locale === 'hi' ? acct.nameHi : acct.name;
}

function fmt(n) {
  const v = Number(n) || 0;
  return '₹' + Math.round(v).toLocaleString('en-IN');
}

function fmtCompact(n) {
  const v = Math.abs(Number(n) || 0);
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
  if (v >= 100000) return '₹' + (v / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
  return fmt(n);
}

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

function monthKey(date) {
  const d = date ? new Date(date) : new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function monthLabel(date, locale) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });
}

function daysLeftInMonth(date) {
  const d = date ? new Date(date) : new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Math.max(1, last - d.getDate() + 1);
}

function relDate(iso, locale) {
  if (!iso) return '';
  const today = todayISO();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yIso = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
  if (iso === today) return locale === 'hi' ? 'आज' : 'Today';
  if (iso === yIso) return locale === 'hi' ? 'कल' : 'Yesterday';
  return new Date(iso + 'T12:00:00').toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function moveIndex(list, from, to) {
  const arr = (list || []).slice();
  if (from < 0 || to < 0 || from >= arr.length || to >= arr.length || from === to) return arr;
  const item = arr.splice(from, 1)[0];
  arr.splice(to, 0, item);
  return arr.map((row, i) => ({ ...row, sortOrder: i }));
}

function withCategoryTree(categories) {
  const list = Array.isArray(categories) ? categories.map((c, i) => ({
    sortOrder: c.sortOrder != null ? c.sortOrder : i,
    parentId: c.parentId || null,
    ...c,
  })) : [];
  const hasGroupParent = list.some((c) => c.id && String(c.id).indexOf('grp-') === 0);
  if (hasGroupParent) {
    return list.map((c, i) => ({
      ...c,
      parentId: c.parentId || null,
      sortOrder: c.sortOrder != null ? c.sortOrder : i,
    }));
  }
  const parents = CATEGORY_GROUPS.map((g, i) => ({ ...g, parentId: null, sortOrder: i, custom: false }));
  const offset = parents.length;
  const children = list.map((c, i) => {
    const parent = c.type === 'expense' ? CATEGORY_GROUPS.find((g) => g.group === c.group) : null;
    return {
      ...c,
      parentId: parent ? parent.id : null,
      sortOrder: offset + i,
    };
  });
  return parents.concat(children);
}

function parentCategories(categories, type) {
  return (categories || []).filter((c) => !c.parentId && (!type || c.type === type));
}

function childCategories(categories, parentId) {
  if (!parentId) return [];
  return (categories || []).filter((c) => c.parentId === parentId);
}

function categoryTreeIds(categories, categoryId) {
  const kids = childCategories(categories, categoryId).map((c) => c.id);
  return [categoryId].concat(kids);
}

function categoryPreview(categories, parentId, locale) {
  return childCategories(categories, parentId).map((c) => catLabel(c, locale)).join(', ');
}

function createInitialStore() {
  return {
    version: 1,
    onboardingComplete: false,
    user: { name: '', locale: 'en', currency: 'INR' },
    openingCash: 0,
    monthlyIncome: 0,
    startedAt: todayISO(),
    accounts: DEFAULT_ACCOUNTS.map((a, i) => ({ ...a, sortOrder: i })),
    categories: withCategoryTree(DEFAULT_CATEGORIES.map((c) => ({ ...c }))),
    transactions: [],
    budgets: [],
    alertsRead: {},
    showSubcategories: true,
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(ZENITH_STORE_KEY);
    if (!raw) return createInitialStore();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return createInitialStore();
    return {
      ...createInitialStore(),
      ...parsed,
      user: { ...createInitialStore().user, ...(parsed.user || {}) },
      categories: withCategoryTree((parsed.categories && parsed.categories.length) ? parsed.categories : DEFAULT_CATEGORIES.map((c) => ({ ...c }))),
      accounts: (parsed.accounts && parsed.accounts.length) ? parsed.accounts : DEFAULT_ACCOUNTS.map((a) => ({ ...a })),
      transactions: parsed.transactions || [],
      budgets: parsed.budgets || [],
      alertsRead: parsed.alertsRead || {},
      showSubcategories: parsed.showSubcategories !== false,
    };
  } catch (e) {
    return createInitialStore();
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(ZENITH_STORE_KEY, JSON.stringify(store));
  } catch (e) { /* ignore quota */ }
}

function findCat(store, idOrName) {
  return (store.categories || []).find((c) => c.id === idOrName || c.name === idOrName);
}

function monthTxns(store, mk) {
  const key = mk || monthKey();
  return (store.transactions || []).filter((tx) => monthKey(tx.date) === key);
}

function monthExpenseTotal(store, mk) {
  return monthTxns(store, mk)
    .filter((tx) => tx.type === 'expense')
    .reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
}

function monthIncomeTotal(store, mk) {
  return monthTxns(store, mk)
    .filter((tx) => tx.type === 'income')
    .reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
}

function budgetLimit(store, categoryId, mk) {
  const key = mk || monthKey();
  const row = (store.budgets || []).find((b) => b.categoryId === categoryId && !b.accountId && b.monthKey === key);
  return row ? Number(row.limit) || 0 : 0;
}

function accountBudgetLimit(store, accountId, mk) {
  const key = mk || monthKey();
  const row = (store.budgets || []).find((b) => b.accountId === accountId && b.monthKey === key);
  return row ? Number(row.limit) || 0 : 0;
}

function totalBudgetLimit(store, mk) {
  const key = mk || monthKey();
  return (store.budgets || [])
    .filter((b) => b.monthKey === key && b.categoryId && !b.accountId)
    .reduce((s, b) => s + (Number(b.limit) || 0), 0);
}

function spentOnAccount(store, accountId, mk) {
  return monthTxns(store, mk)
    .filter((tx) => tx.type === 'expense' && tx.accountId === accountId)
    .reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
}

function newMoneyId(prefix, name) {
  const s = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12);
  return prefix + '-' + (s || 'x') + '-' + Date.now().toString(36).slice(-4);
}

function methodForAccount(account) {
  if (!account) return 'UPI';
  const n = String(account.name || account.id || '');
  if (account.id === 'cash' || /cash|नकद/i.test(n)) return 'Cash';
  if (account.id === 'card' || /card|credit|क्रेडिट/i.test(n)) return 'Card';
  return 'UPI';
}

function spentInCategory(store, categoryId, mk) {
  const ids = new Set(categoryTreeIds(store.categories || [], categoryId));
  return monthTxns(store, mk)
    .filter((tx) => tx.type === 'expense' && ids.has(tx.categoryId))
    .reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
}

function categorySpendRows(store, mk) {
  const key = mk || monthKey();
  const cats = store.categories || [];
  const parents = cats.filter((c) => c.type === 'expense' && !c.parentId);
  const extra = cats.filter((c) => c.type === 'expense' && c.parentId && budgetLimit(store, c.id, key) > 0);
  return parents.concat(extra).map((c) => ({
    ...c,
    spent: spentInCategory(store, c.id, key),
    budget: budgetLimit(store, c.id, key),
  }));
}

function leftToSpend(store, mk) {
  const spent = monthExpenseTotal(store, mk);
  const budget = totalBudgetLimit(store, mk);
  if (budget > 0) return budget - spent;
  const income = (Number(store.monthlyIncome) || 0) + monthIncomeTotal(store, mk);
  return (Number(store.openingCash) || 0) + income - spent;
}

function buildAlerts(store) {
  const mk = monthKey();
  return categorySpendRows(store, mk)
    .filter((c) => c.budget > 0 && c.spent / c.budget >= 0.9)
    .map((c) => ({
      id: 'near-' + c.id + '-' + mk,
      categoryId: c.id,
      title: catLabel(c, store.user.locale),
      body: (c.spent >= c.budget ? t(store.user.locale, 'overspent') : t(store.user.locale, 'nearLimit'))
        + ' · ' + fmt(c.spent) + ' / ' + fmt(c.budget),
      over: c.spent >= c.budget,
    }));
}

function newTxnId() {
  return 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

Object.assign(window, {
  ZENITH,
  zenithTone,
  zenithHeroGradient,
  zenithHeroShadow,
  zenithSoftShadow,
  ZENITH_STORE_KEY,
  DEFAULT_CATEGORIES,
  CATEGORY_GROUPS,
  DEFAULT_ACCOUNTS,
  COPY,
  t,
  catLabel,
  acctLabel,
  fmt,
  fmtCompact,
  todayISO,
  monthKey,
  monthLabel,
  daysLeftInMonth,
  relDate,
  createInitialStore,
  loadStore,
  saveStore,
  findCat,
  monthTxns,
  monthExpenseTotal,
  monthIncomeTotal,
  budgetLimit,
  totalBudgetLimit,
  spentInCategory,
  categorySpendRows,
  leftToSpend,
  buildAlerts,
  newTxnId,
  accountBudgetLimit,
  spentOnAccount,
  newMoneyId,
  methodForAccount,
  moveIndex,
  withCategoryTree,
  parentCategories,
  childCategories,
  categoryTreeIds,
  categoryPreview,
});
