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
  hairline: 'rgba(15,23,42,0.08)',
  navBg: 'rgba(255,255,255,0.94)',
};

const ZENITH_PRO_PRICE_MO = 149;
const ZENITH_PRO_PRICE_YR = 999;
const TRAVEL_FREE_MAX_TRIPS = 1;
const TRAVEL_FREE_MAX_EXPENSES = 8;

const GOAL_COLORS = ['#2563EB', '#7C3AED', '#0F766E', '#C2410C', '#BE185D', '#0369A1'];
const GOAL_EMOJI = ['🛡️', '💻', '🏖️', '🏍️', '🏠', '✈️', '💍', '📚'];

const TRAVEL_COUNTRIES = [
  { name: 'Australia', flag: '🇦🇺', code: 'AUD', symbol: 'A$', rate: 54.32 },
  { name: 'Canada', flag: '🇨🇦', code: 'CAD', symbol: 'C$', rate: 61.34 },
  { name: 'Europe', flag: '🇪🇺', code: 'EUR', symbol: '€', rate: 89.54 },
  { name: 'Hong Kong', flag: '🇭🇰', code: 'HKD', symbol: 'HK$', rate: 10.69 },
  { name: 'Indonesia', flag: '🇮🇩', code: 'IDR', symbol: 'Rp', rate: 0.0051 },
  { name: 'Japan', flag: '🇯🇵', code: 'JPY', symbol: '¥', rate: 0.56 },
  { name: 'Malaysia', flag: '🇲🇾', code: 'MYR', symbol: 'RM', rate: 18.92 },
  { name: 'Maldives', flag: '🇲🇻', code: 'MVR', symbol: 'Rf', rate: 6.48 },
  { name: 'Nepal', flag: '🇳🇵', code: 'NPR', symbol: '₨', rate: 0.62 },
  { name: 'Singapore', flag: '🇸🇬', code: 'SGD', symbol: 'S$', rate: 62.18 },
  { name: 'Sri Lanka', flag: '🇱🇰', code: 'LKR', symbol: '₨', rate: 0.28 },
  { name: 'Switzerland', flag: '🇨🇭', code: 'CHF', symbol: 'CHF', rate: 93.28 },
  { name: 'Thailand', flag: '🇹🇭', code: 'THB', symbol: '฿', rate: 2.32 },
  { name: 'UAE', flag: '🇦🇪', code: 'AED', symbol: 'د.إ', rate: 22.71 },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GBP', symbol: '£', rate: 104.72 },
  { name: 'United States', flag: '🇺🇸', code: 'USD', symbol: '$', rate: 83.45 },
  { name: 'Vietnam', flag: '🇻🇳', code: 'VND', symbol: '₫', rate: 0.0033 },
];

const TRAVEL_CATS = ['Food', 'Transport', 'Stay', 'Shopping', 'Groceries', 'Other'];
const TRAVEL_CAT_COLORS = { Food: '#F97316', Transport: '#3B82F6', Stay: '#8B5CF6', Shopping: '#EC4899', Groceries: '#10B981', Other: '#64748B' };
const TRAVEL_HOME_CAT = { Food: 'dining', Transport: 'cab', Stay: 'other', Shopping: 'shopping', Groceries: 'kirana', Other: 'other' };
const TRAVEL_CHECKLIST_DEFAULT = [
  { id: 'ck-pass', label: 'Passport / visa' },
  { id: 'ck-fx', label: 'Forex / travel card' },
  { id: 'ck-sim', label: 'SIM / eSIM' },
  { id: 'ck-ins', label: 'Insurance' },
  { id: 'ck-stay', label: 'Stay / tickets' },
  { id: 'ck-med', label: 'Medicines' },
];

function firstEmoji(raw) {
  const s = String(raw == null ? '' : raw).trim();
  if (!s) return '';
  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const it = new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s);
      for (const part of it) {
        if (part && part.segment) return part.segment;
      }
    }
  } catch (e) { /* ignore */ }
  const chars = Array.from(s);
  return chars[0] || '';
}

function defaultTravelChecklist() {
  return TRAVEL_CHECKLIST_DEFAULT.map((row) => ({ id: row.id, label: row.label, done: false, custom: false }));
}

function travelHomeCategoryId(store, travelCat) {
  const mapped = TRAVEL_HOME_CAT[travelCat] || 'other';
  const cats = (store && store.categories) || [];
  if (cats.some((c) => c.id === mapped)) return mapped;
  const expense = cats.find((c) => c.type === 'expense');
  return expense ? expense.id : mapped;
}

function canAddChecklistItem(store, trip, loc) {
  if (zenithIsPro(store, loc)) return true;
  return false;
}

function tripSummaryText(trip, locale) {
  const loc = locale || 'en';
  const spent = tripSpentINR(trip);
  const fx = tripSpentForeign(trip);
  const lines = [
    (trip.flag || '✈️') + ' ' + (trip.name || 'Trip'),
    (trip.startDate || '') + ' – ' + (trip.endDate || ''),
    (trip.currency || '') + ' ' + (Number(fx) || 0) + ' ≈ ' + fmt(spent),
  ];
  ((trip.expenses) || []).forEach((e) => {
    lines.push('- ' + e.merchant + ' · ' + (trip.currency || '') + ' ' + e.amount + ' · ' + fmt(e.inr));
  });
  if (trip.notes) lines.push('', trip.notes);
  return lines.join('\n');
}

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
    insights: 'Insights',
    healthScore: 'Health score',
    wallets: 'Wallets',
    darkMode: 'Dark mode',
    appLock: 'App lock',
    setPin: 'Set PIN',
    confirmPin: 'Confirm PIN',
    unlock: 'Unlock',
    backupJson: 'Backup JSON',
    importJson: 'Restore JSON',
    zenithPro: 'Zenith Pro',
    travel: 'Travel',
    travelDemo: 'Free demo: one trip, 8 expenses. Pro unlocks unlimited trips, history, SOS, and custom packing items.',
    upgrade: 'Upgrade',
    subscribe: 'Unlock Pro',
    restore: 'Restore purchases',
    dueSoon: 'Due soon',
    onTrack: 'On track',
    needsBoost: 'Needs a boost',
    contribute: 'Add to goal',
    newGoal: 'New goal',
    goalName: 'Goal name',
    goalTarget: 'Target',
    cadenceWeekly: 'Weekly',
    cadenceMonthly: 'Monthly',
    cadenceYearly: 'Yearly',
    fromDate: 'From',
    toDate: 'To',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    vsLast: 'vs last month',
    weekday: 'Weekday spend',
    pinMismatch: 'PINs do not match.',
    unlockWithBiometrics: 'Use Face ID / passkey',
    exportJson: 'Download a full copy of this ledger.',
    importOk: 'Ledger restored.',
    demoTrip: 'Demo trip',
    proUnlock: 'Zenith Pro',
    travelHistory: 'Trip history',
    addTripExpense: 'Add trip expense',
    startTrip: 'Start a trip',
    endTrip: 'End trip',
    convert: 'Convert',
    tripBudget: 'Trip budget',
    destination: 'Destination',
    savedTotal: 'Saved',
    remaining: 'Left',
    paused: 'Paused',
    activeSubs: 'Active',
    monthlyCost: 'Monthly cost',
    whereItWent: 'Where it went',
    avgDay: 'Avg / day',
    txCount: 'Transactions',
    strong: 'Strong',
    okLabel: 'On track',
    watch: 'Watch',
    tight: 'Tight',
    startTracking: 'Add a few expenses to score your month.',
    lockHint: 'PIN stays on this device. Optional passkey if the phone supports it.',
    proBlurb: 'Unlimited trips, full history, and emergency assist. Home ledger stays free.',
    proPrice: '₹149 / month or ₹999 / year',
    demoBanner: 'Demo trip — upgrade for unlimited travel.',
    historyPro: 'Trip history is a Pro feature. Your demo trip still saves.',
    sosPro: 'Emergency assist is included in Pro.',
    expenseCap: 'Demo includes 8 trip expenses. Unlock Pro to keep logging.',
    secondTrip: 'The free demo is one trip. Unlock Pro for the next one.',
    appearance: 'Appearance',
    security: 'Security',
    backup: 'Backup',
    turnOnLock: 'Turn on PIN',
    turnOffLock: 'Turn off lock',
    enterPin: 'Enter PIN',
    pinDigits: '4–8 digits',
    jsonInvalid: 'That file is not a Zenith backup.',
    recurringName: 'Bill name',
    nextOn: 'Next on',
    cadence: 'Cadence',
    addRecurring: 'Add recurring',
    addGoal: 'Add goal',
    dueDate: 'Due',
    insightsDigest: 'This vs last month',
    lessSpend: 'Spent less',
    moreSpend: 'Spent more',
    noChange: 'Same as last month',
    paid: 'Pro',
    freePlan: 'Free',
    unlockNow: 'Unlock now',
    laterMaybe: 'Not now',
    converter: 'Converter',
    liveRate: '1 {code} = ₹{rate}',
    tripSpent: 'Trip spent',
    dailyLeft: 'Daily left',
    chooseCountry: 'Where are you going?',
    tripDetails: 'Trip details',
    activateTravel: 'Activate Travel Mode',
    headingSomewhere: 'Heading somewhere?',
    travelHero: 'Track spend in local currency. Home budget stays separate.',
    whatYouGet: 'What you get',
    liveRates: 'Live exchange rates',
    liveRatesSub: 'Edit the rate to match the board at the airport.',
    tripBudgetSep: 'Separate trip budget',
    tripBudgetSepSub: 'Optionally also post spend into a home wallet.',
    perTripLedger: 'Per-trip ledger',
    perTripLedgerSub: 'Edit, delete, and group expenses by day.',
    emergencyAssist: 'Emergency assist',
    emergencyAssistSub: 'Embassy and SOS shortcuts — Pro.',
    pickAnyEmoji: 'Any emoji',
    pickEmojiHint: 'Type or paste any emoji. On iPhone, tap the field and open the emoji keyboard.',
    kit: 'Kit',
    tripNotes: 'Trip notes',
    packingList: 'Packing list',
    addCheckItem: 'Add item',
    customRate: 'Your rate',
    logToHome: 'Also log in home wallet',
    forexCash: 'Forex cash on hand',
    tipPct: 'Tip',
    copySummary: 'Copy summary',
    copied: 'Copied',
    checklistPro: 'Custom packing items are included in Pro.',
    ckPass: 'Passport / visa',
    ckFx: 'Forex / travel card',
    ckSim: 'SIM / eSIM',
    ckIns: 'Insurance',
    ckStay: 'Stay / tickets',
    ckMed: 'Medicines',
    withTip: 'With tip',
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
    insights: 'इनसाइट्स',
    healthScore: 'हेल्थ स्कोर',
    wallets: 'वॉलेट',
    darkMode: 'डार्क मोड',
    appLock: 'ऐप लॉक',
    setPin: 'PIN सेट करें',
    confirmPin: 'PIN दोहराएँ',
    unlock: 'अनलॉक',
    backupJson: 'JSON बैकअप',
    importJson: 'JSON रीस्टोर',
    zenithPro: 'Zenith Pro',
    travel: 'ट्रैवल',
    travelDemo: 'फ्री डेमो: एक ट्रिप, 8 खर्च। Pro में अनलिमिटेड ट्रिप, इतिहास, SOS और कस्टम पैकिंग।',
    upgrade: 'अपग्रेड',
    subscribe: 'Pro खोलें',
    restore: 'खरीद वापस लाएँ',
    dueSoon: 'जल्द देय',
    onTrack: 'ट्रैक पर',
    needsBoost: 'थोड़ा और चाहिए',
    contribute: 'लक्ष्य में जोड़ें',
    newGoal: 'नया लक्ष्य',
    goalName: 'लक्ष्य का नाम',
    goalTarget: 'लक्ष्य राशि',
    cadenceWeekly: 'साप्ताहिक',
    cadenceMonthly: 'मासिक',
    cadenceYearly: 'वार्षिक',
    fromDate: 'से',
    toDate: 'तक',
    thisMonth: 'इस महीने',
    lastMonth: 'पिछला महीना',
    vsLast: 'पिछले महीने से',
    weekday: 'सप्ताह का खर्च',
    pinMismatch: 'PIN मेल नहीं खाते।',
    unlockWithBiometrics: 'Face ID / पासकी',
    exportJson: 'पूरी बही की कॉपी डाउनलोड करें।',
    importOk: 'बही रीस्टोर हो गई।',
    demoTrip: 'डेमो ट्रिप',
    proUnlock: 'Zenith Pro',
    travelHistory: 'ट्रिप इतिहास',
    addTripExpense: 'ट्रिप खर्च जोड़ें',
    startTrip: 'ट्रिप शुरू करें',
    endTrip: 'ट्रिप खत्म',
    convert: 'कनवर्ट',
    tripBudget: 'ट्रिप बजट',
    destination: 'गंतव्य',
    savedTotal: 'बचाया',
    remaining: 'बाकी',
    paused: 'रुका',
    activeSubs: 'सक्रिय',
    monthlyCost: 'मासिक लागत',
    whereItWent: 'कहाँ गया',
    avgDay: 'रोज़ औसत',
    txCount: 'लेन-देन',
    strong: 'मज़बूत',
    okLabel: 'ठीक',
    watch: 'ध्यान दें',
    tight: 'तंग',
    startTracking: 'स्कोर के लिए कुछ खर्च जोड़ें।',
    lockHint: 'PIN इसी डिवाइस पर रहता है। फ़ोन हो तो पासकी भी।',
    proBlurb: 'अनलिमिटेड ट्रिप, पूरा इतिहास, SOS। घर की बही फ्री रहती है।',
    proPrice: '₹149 / महीना या ₹999 / साल',
    demoBanner: 'डेमो ट्रिप — अनलिमिटेड ट्रैवल के लिए अपग्रेड करें।',
    historyPro: 'ट्रिप इतिहास Pro में है। डेमो ट्रिप फिर भी सेव होती है।',
    sosPro: 'इमरजेंसी असिस्ट Pro में है।',
    expenseCap: 'डेमो में 8 ट्रिप खर्च। आगे के लिए Pro खोलें।',
    secondTrip: 'फ्री डेमो एक ट्रिप है। अगली के लिए Pro खोलें।',
    appearance: 'दिखावट',
    security: 'सुरक्षा',
    backup: 'बैकअप',
    turnOnLock: 'PIN चालू करें',
    turnOffLock: 'लॉक बंद करें',
    enterPin: 'PIN डालें',
    pinDigits: '4–8 अंक',
    jsonInvalid: 'यह Zenith बैकअप नहीं है।',
    recurringName: 'बिल का नाम',
    nextOn: 'अगली तारीख',
    cadence: 'चक्र',
    addRecurring: 'आवर्ती जोड़ें',
    addGoal: 'लक्ष्य जोड़ें',
    dueDate: 'समय सीमा',
    insightsDigest: 'इस vs पिछले महीने',
    lessSpend: 'कम खर्च',
    moreSpend: 'ज़्यादा खर्च',
    noChange: 'पिछले महीने जैसा',
    paid: 'Pro',
    freePlan: 'फ्री',
    unlockNow: 'अभी खोलें',
    laterMaybe: 'अभी नहीं',
    converter: 'कनवर्टर',
    liveRate: '1 {code} = ₹{rate}',
    tripSpent: 'ट्रिप खर्च',
    dailyLeft: 'रोज़ बचा',
    chooseCountry: 'कहाँ जा रहे हैं?',
    tripDetails: 'ट्रिप डिटेल',
    activateTravel: 'ट्रैवल मोड चालू करें',
    headingSomewhere: 'कहीं जा रहे हैं?',
    travelHero: 'लोकल करेंसी में खर्च ट्रैक करें। घर का बजट अलग रहता है।',
    whatYouGet: 'क्या मिलेगा',
    liveRates: 'लाइव रेट',
    liveRatesSub: 'लोकप्रिय ट्रैवल करेंसी का INR रूपांतरण।',
    tripBudgetSep: 'अलग ट्रिप बजट',
    tripBudgetSepSub: 'घर का महीना नहीं छूटेगा।',
    perTripLedger: 'ट्रिप बही',
    perTripLedgerSub: 'हर ट्रिप का पूरा खर्च।',
    emergencyAssist: 'इमरजेंसी असिस्ट',
    emergencyAssistSub: 'दूतावास और SOS — Pro।',
    pickAnyEmoji: 'कोई भी इमोजी',
    pickEmojiHint: 'कोई भी इमोजी टाइप या पेस्ट करें। iPhone पर फ़ील्ड टैप कर इमोजी कीबोर्ड खोलें।',
    kit: 'किट',
    tripNotes: 'ट्रिप नोट्स',
    packingList: 'पैकिंग लिस्ट',
    addCheckItem: 'आइटम जोड़ें',
    customRate: 'आपका रेट',
    logToHome: 'घर के वॉलेट में भी लिखें',
    forexCash: 'विदेशी नकदी हाथ में',
    tipPct: 'टिप',
    copySummary: 'सारांश कॉपी',
    copied: 'कॉपी हो गया',
    checklistPro: 'कस्टम पैकिंग आइटम Pro में हैं।',
    ckPass: 'पासपोर्ट / वीज़ा',
    ckFx: 'फॉरेक्स / ट्रैवल कार्ड',
    ckSim: 'SIM / eSIM',
    ckIns: 'इंश्योरेंस',
    ckStay: 'स्टे / टिकट',
    ckMed: 'दवाई',
    withTip: 'टिप सहित',
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

function defaultSettings() {
  return {
    theme: 'light',
    lock: { enabled: false, pinHash: '', webauthn: false },
    pro: false,
  };
}

function normalizeSettings(raw) {
  const base = defaultSettings();
  const src = raw && typeof raw === 'object' ? raw : {};
  const lock = src.lock && typeof src.lock === 'object' ? src.lock : {};
  return {
    theme: src.theme === 'dark' ? 'dark' : 'light',
    lock: {
      enabled: !!lock.enabled,
      pinHash: String(lock.pinHash || ''),
      webauthn: !!lock.webauthn,
    },
    pro: !!src.pro,
  };
}

function normalizeGoal(row, i) {
  const g = row && typeof row === 'object' ? row : {};
  return {
    id: g.id || ('goal-' + i + '-' + Date.now().toString(36)),
    name: String(g.name || '').trim() || 'Goal',
    target: Math.max(0, Number(g.target) || 0),
    saved: Math.max(0, Number(g.saved) || 0),
    emoji: g.emoji || GOAL_EMOJI[i % GOAL_EMOJI.length],
    color: g.color || GOAL_COLORS[i % GOAL_COLORS.length],
    due: g.due || '',
  };
}

function normalizeRecurring(row, i) {
  const r = row && typeof row === 'object' ? row : {};
  const cadence = r.cadence === 'weekly' || r.cadence === 'yearly' ? r.cadence : 'monthly';
  return {
    id: r.id || ('rec-' + i + '-' + Date.now().toString(36)),
    name: String(r.name || '').trim() || 'Recurring',
    amount: Math.max(0, Number(r.amount) || 0),
    categoryId: r.categoryId || 'other',
    accountId: r.accountId || 'bank',
    cadence: cadence,
    nextOn: r.nextOn || todayISO(),
    note: r.note || '',
    active: r.active !== false,
    type: r.type === 'income' ? 'income' : 'expense',
  };
}

function normalizeTrip(row, i) {
  const t = row && typeof row === 'object' ? row : {};
  const country = (TRAVEL_COUNTRIES || []).find((c) => c.code === t.countryCode) || null;
  const preset = defaultTravelChecklist();
  const incoming = Array.isArray(t.checklist) && t.checklist.length ? t.checklist : preset;
  const byId = {};
  incoming.forEach((item, j) => {
    const id = item.id || ('ck-custom-' + j);
    byId[id] = {
      id: id,
      label: String(item.label || '').trim() || 'Item',
      done: !!item.done,
      custom: !!item.custom || preset.every((p) => p.id !== id),
    };
  });
  preset.forEach((p) => { if (!byId[p.id]) byId[p.id] = p; });
  return {
    id: t.id || ('trip-' + i + '-' + Date.now().toString(36)),
    name: String(t.name || '').trim() || (country ? country.name + ' trip' : 'Trip'),
    countryCode: t.countryCode || (country && country.code) || 'USD',
    countryName: t.countryName || (country && country.name) || '',
    flag: t.flag || (country && country.flag) || '✈️',
    currency: t.currency || (country && country.code) || 'USD',
    symbol: t.symbol || (country && country.symbol) || '$',
    rate: Number(t.rate) || (country && country.rate) || 83.45,
    startDate: t.startDate || todayISO(),
    endDate: t.endDate || todayISO(),
    budgetINR: Math.max(0, Number(t.budgetINR) || 0),
    status: t.status === 'ended' ? 'ended' : 'active',
    notes: String(t.notes || ''),
    forexCash: Math.max(0, Number(t.forexCash) || 0),
    checklist: Object.keys(byId).map((k) => byId[k]),
    expenses: Array.isArray(t.expenses) ? t.expenses.map((e, j) => ({
      id: e.id || ('tex-' + j),
      merchant: e.merchant || 'Expense',
      cat: TRAVEL_CATS.indexOf(e.cat) >= 0 ? e.cat : 'Other',
      amount: Number(e.amount) || 0,
      inr: Number(e.inr) || 0,
      date: e.date || todayISO(),
      accountId: e.accountId || '',
      homeTxnId: e.homeTxnId || '',
      postHome: !!e.postHome,
    })) : [],
  };
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
    goals: [],
    recurring: [],
    trips: [],
    activeTripId: null,
    settings: defaultSettings(),
  };
}

function normalizeState(parsed) {
  const base = createInitialStore();
  const src = parsed && typeof parsed === 'object' ? parsed : {};
  const trips = Array.isArray(src.trips) ? src.trips.map(normalizeTrip) : [];
  let activeTripId = src.activeTripId || null;
  if (activeTripId && !trips.some((t) => t.id === activeTripId && t.status === 'active')) {
    const live = trips.find((t) => t.status === 'active');
    activeTripId = live ? live.id : null;
  }
  return {
    ...base,
    ...src,
    version: 1,
    user: { ...base.user, ...(src.user || {}) },
    categories: withCategoryTree((src.categories && src.categories.length) ? src.categories : DEFAULT_CATEGORIES.map((c) => ({ ...c }))),
    accounts: (src.accounts && src.accounts.length) ? src.accounts : DEFAULT_ACCOUNTS.map((a) => ({ ...a })),
    transactions: Array.isArray(src.transactions) ? src.transactions : [],
    budgets: Array.isArray(src.budgets) ? src.budgets : [],
    alertsRead: src.alertsRead && typeof src.alertsRead === 'object' ? src.alertsRead : {},
    showSubcategories: src.showSubcategories !== false,
    goals: Array.isArray(src.goals) ? src.goals.map(normalizeGoal) : [],
    recurring: Array.isArray(src.recurring) ? src.recurring.map(normalizeRecurring) : [],
    trips: trips,
    activeTripId: activeTripId,
    settings: normalizeSettings(src.settings),
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(ZENITH_STORE_KEY);
    if (!raw) return createInitialStore();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return createInitialStore();
    return normalizeState(parsed);
  } catch (e) {
    return createInitialStore();
  }
}

function parseStorePayload(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!parsed || parsed.version !== 1) throw new Error('invalid');
  return normalizeState(parsed);
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

function isoFromDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function addDaysISO(iso, n) {
  const d = new Date((iso || todayISO()) + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return isoFromDate(d);
}

function addMonthsISO(iso, n) {
  const d = new Date((iso || todayISO()) + 'T12:00:00');
  const day = d.getDate();
  d.setMonth(d.getMonth() + n);
  if (d.getDate() !== day) d.setDate(0);
  return isoFromDate(d);
}

function nextOnAfter(iso, cadence) {
  if (cadence === 'weekly') return addDaysISO(iso, 7);
  if (cadence === 'yearly') return addMonthsISO(iso, 12);
  return addMonthsISO(iso, 1);
}

function hashPin(pin) {
  let h = 5381;
  const s = 'zenith-lock:' + String(pin || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function pinLooksValid(pin) {
  return /^\d{4,8}$/.test(String(pin || ''));
}

function checkPin(store, pin) {
  const hash = store && store.settings && store.settings.lock && store.settings.lock.pinHash;
  return !!hash && hash === hashPin(pin);
}

function materializeRecurring(store, today) {
  const day = today || todayISO();
  const txns = (store.transactions || []).slice();
  const rules = (store.recurring || []).map((r) => ({ ...r }));
  let changed = false;
  rules.forEach((rule) => {
    if (!rule.active) return;
    let guard = 0;
    while (rule.nextOn && rule.nextOn <= day && guard < 36) {
      const acct = (store.accounts || []).find((a) => a.id === rule.accountId);
      txns.unshift({
        id: newTxnId(),
        date: rule.nextOn,
        type: rule.type || 'expense',
        amount: Number(rule.amount) || 0,
        categoryId: rule.categoryId,
        accountId: rule.accountId,
        merchant: rule.name,
        note: rule.note || '',
        method: typeof methodForAccount === 'function' ? methodForAccount(acct) : 'UPI',
        recurringId: rule.id,
      });
      rule.nextOn = nextOnAfter(rule.nextOn, rule.cadence);
      changed = true;
      guard += 1;
    }
  });
  if (!changed) return store;
  return { ...store, transactions: txns, recurring: rules };
}

function healthScore(store, mk) {
  const key = mk || monthKey();
  const parts = [];
  const rows = categorySpendRows(store, key).filter((c) => c.budget > 0);
  if (rows.length) {
    const scores = rows.map((c) => {
      const pct = c.spent / c.budget;
      if (pct <= 0.8) return 100;
      if (pct <= 1) return 100 - ((pct - 0.8) / 0.2) * 20;
      return Math.max(0, 80 - (pct - 1) * 80);
    });
    parts.push({ key: 'budget', weight: 40, value: scores.reduce((a, b) => a + b, 0) / scores.length });
  }
  const income = (Number(store.monthlyIncome) || 0) + monthIncomeTotal(store, key);
  const spent = monthExpenseTotal(store, key);
  if (income > 0) {
    const rate = Math.max(0, (income - spent) / income);
    parts.push({ key: 'savings', weight: 25, value: Math.min(100, (rate / 0.3) * 100) });
  }
  const goals = store.goals || [];
  if (goals.length) {
    const g = goals.reduce((s, row) => s + Math.min(1, (Number(row.saved) || 0) / Math.max(1, Number(row.target) || 1)), 0) / goals.length;
    parts.push({ key: 'goals', weight: 20, value: g * 100 });
  }
  const accts = store.accounts || [];
  if (accts.length) {
    const ok = accts.filter((a) => {
      const cap = accountBudgetLimit(store, a.id, key);
      if (cap <= 0) return true;
      return spentOnAccount(store, a.id, key) <= cap;
    }).length;
    parts.push({ key: 'accounts', weight: 15, value: (ok / accts.length) * 100 });
  }
  if (!parts.length) return { score: 0, label: 'start', parts };
  const tw = parts.reduce((s, p) => s + p.weight, 0);
  const score = Math.round(parts.reduce((s, p) => s + p.value * p.weight, 0) / tw);
  const label = score >= 80 ? 'strong' : score >= 60 ? 'ok' : score >= 40 ? 'watch' : 'tight';
  return { score, label, parts };
}

function prevMonthKey(mk) {
  const key = mk || monthKey();
  const parts = key.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 2, 1);
  return monthKey(d);
}

function monthInsights(store, mk) {
  const thisMk = mk || monthKey();
  const prevMk = prevMonthKey(thisMk);
  const spent = monthExpenseTotal(store, thisMk);
  const prevSpent = monthExpenseTotal(store, prevMk);
  const income = monthIncomeTotal(store, thisMk) + (Number(store.monthlyIncome) || 0);
  const cats = categorySpendRows(store, thisMk).filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent);
  const txns = monthTxns(store, thisMk);
  const weekday = [0, 0, 0, 0, 0, 0, 0];
  txns.filter((tx) => tx.type === 'expense').forEach((tx) => {
    const d = new Date((tx.date || '') + 'T12:00:00');
    if (!isNaN(d.getTime())) weekday[d.getDay()] += Number(tx.amount) || 0;
  });
  const delta = prevSpent > 0 ? (spent - prevSpent) / prevSpent : null;
  return {
    monthKey: thisMk,
    prevMonthKey: prevMk,
    spent: spent,
    prevSpent: prevSpent,
    income: income,
    saved: Math.max(income - spent, 0),
    cats: cats,
    weekday: weekday,
    delta: delta,
    txCount: txns.length,
  };
}

function zenithIsPro(store, loc) {
  if (store && store.settings && store.settings.pro) return true;
  try {
    const search = loc && loc.search != null ? loc.search : (typeof location !== 'undefined' ? location.search : '');
    if (/(?:^|[?&])pro=1(?:&|$)/.test(String(search || ''))) return true;
  } catch (e) { /* ignore */ }
  return false;
}

function travelTripCount(store) {
  return (store.trips || []).length;
}

function activeTrip(store) {
  const id = store && store.activeTripId;
  if (!id) return null;
  return (store.trips || []).find((t) => t.id === id && t.status === 'active') || null;
}

function canStartTrip(store, loc) {
  if (zenithIsPro(store, loc)) return true;
  if (activeTrip(store)) return false;
  return travelTripCount(store) < TRAVEL_FREE_MAX_TRIPS;
}

function canAddTripExpense(store, trip, loc) {
  if (zenithIsPro(store, loc)) return true;
  return ((trip && trip.expenses) || []).length < TRAVEL_FREE_MAX_EXPENSES;
}

function canUseTravelHistory(store, loc) {
  return zenithIsPro(store, loc);
}

function canUseTravelSos(store, loc) {
  return zenithIsPro(store, loc);
}

function tripSpentINR(trip) {
  return ((trip && trip.expenses) || []).reduce((s, e) => s + (Number(e.inr) || 0), 0);
}

function tripSpentForeign(trip) {
  return ((trip && trip.expenses) || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
}

function tripDaysLeft(trip, today) {
  const day = today || todayISO();
  if (!trip || !trip.endDate) return 1;
  const a = new Date(day + 'T12:00:00');
  const b = new Date(trip.endDate + 'T12:00:00');
  return Math.max(1, Math.ceil((b - a) / 86400000) + 1);
}

function findTravelCountry(code) {
  return (TRAVEL_COUNTRIES || []).find((c) => c.code === code) || null;
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
  defaultSettings,
  normalizeSettings,
  normalizeState,
  normalizeGoal,
  normalizeRecurring,
  normalizeTrip,
  parseStorePayload,
  addDaysISO,
  addMonthsISO,
  nextOnAfter,
  hashPin,
  pinLooksValid,
  checkPin,
  materializeRecurring,
  healthScore,
  prevMonthKey,
  monthInsights,
  zenithIsPro,
  travelTripCount,
  activeTrip,
  canStartTrip,
  canAddTripExpense,
  canUseTravelHistory,
  canUseTravelSos,
  canAddChecklistItem,
  firstEmoji,
  defaultTravelChecklist,
  travelHomeCategoryId,
  tripSummaryText,
  tripSpentINR,
  tripSpentForeign,
  tripDaysLeft,
  findTravelCountry,
  TRAVEL_COUNTRIES,
  TRAVEL_CATS,
  TRAVEL_CAT_COLORS,
  TRAVEL_FREE_MAX_TRIPS,
  TRAVEL_FREE_MAX_EXPENSES,
  ZENITH_PRO_PRICE_MO,
  ZENITH_PRO_PRICE_YR,
  GOAL_COLORS,
  GOAL_EMOJI,
});
