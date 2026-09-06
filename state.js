// state.js — Zenith v2 local-first ledger: accounts, merchants, receipts

const ZENITH_STORE_KEY = 'zenith_v1_store';
const STORE_VERSION = 2;

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
  { id: 'cash', name: 'Cash', nameHi: 'नकद', type: 'cash', last4: '', opening: 0, upiId: '' },
  { id: 'bank', name: 'Bank', nameHi: 'बैंक', type: 'bank', last4: '', opening: 0, upiId: '' },
  { id: 'card', name: 'Credit card', nameHi: 'क्रेडिट कार्ड', type: 'card', last4: '', opening: 0, upiId: '' },
];

const CAT_EMOJIS = ['🛒', '☕', '🍱', '🍽️', '🛺', '🚕', '🚇', '⛽', '🏠', '💊', '🛍️', '🎬', '🪔', '📈', '💼', '✈️', '🏋️', '🎮', '📚', '🎁', '🐕', '🔧', '🍼', '🎵', '✦'];
const CAT_COLORS = ['#34D399', '#FF6B6B', '#60A5FA', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#0EA5E9', '#64748B'];

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
    noCloudDesc: 'v1 is local-only. Everything lives on this device.',
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
    localOnly: 'Zenith · Local-only · No data leaves this device',
    alerts: 'Alerts',
    allCaughtUp: 'All caught up',
    allCaughtUpSub: 'Budget warnings will show here when a category hits 90%.',
    notifications: 'Notifications',
    profile: 'Profile',
    firstExpense: 'Add expense',
    merchant: 'Merchant',
    merchantPh: 'Zomato, Sharma Kirana…',
    merchantUpi: 'Merchant UPI',
    merchantUpiPh: 'shop@oksbi',
    paidFrom: 'Paid from',
    yourAccount: 'Your account',
    customerAccount: 'Your account (customer)',
    accounts: 'Accounts',
    merchants: 'Merchants',
    receipt: 'Receipt',
    addPhoto: 'Add photo',
    removePhoto: 'Remove photo',
    listening: 'Listening…',
    speakNow: 'Speak now',
    voiceHint: 'Try “Zomato pe 349” or “spent 200 on chai”.',
    voiceNeedMic: 'Allow the microphone to fill amount and merchant.',
    voiceGot: 'Got it',
    openingBalance: 'Opening balance',
    last4: 'Last 4 digits',
    upiId: 'Your UPI ID',
    addAccount: 'Add account',
    addMerchant: 'Add merchant',
    addCategory: 'Add category',
    newCategory: 'New category',
    used: 'Used',
    available: 'Available',
    netWorth: 'Net worth',
    fromAccount: 'From',
    toAccount: 'To',
    createMerchant: 'Create merchant',
    noMerchants: 'No merchants yet — they appear when you add a payment.',
    noAccounts: 'No accounts yet',
    customCategory: 'Custom category',
    pickAccount: 'Pick an account',
    transferTo: 'Transfer to',
    photo: 'Photo',
    voice: 'Voice',
    accountType: 'Type',
    cashType: 'Cash',
    bankType: 'Bank',
    cardType: 'Card',
    editAccount: 'Edit account',
    editMerchant: 'Edit merchant',
    spentWith: 'Spent here',
    paidVia: 'Paid via',
    manageCats: 'Manage categories',
    catName: 'Category name',
    defaultAccount: 'Pays from',
    walletStrip: 'Wallets',
    cardOutstanding: 'Outstanding',
    addCustom: '+ Custom',
    keypad: 'Keypad',
    tapAmount: 'Tap amount for keypad',
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
    noCloudDesc: 'v1 सिर्फ़ इस डिवाइस पर है।',
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
    localOnly: 'Zenith · सिर्फ़ इस डिवाइस पर',
    alerts: 'अलर्ट',
    allCaughtUp: 'सब ठीक है',
    allCaughtUpSub: 'कोई श्रेणी 90% पर पहुँचे तो चेतावनी यहाँ दिखेगी।',
    notifications: 'सूचनाएँ',
    profile: 'प्रोफ़ाइल',
    firstExpense: 'खर्च जोड़ें',
    merchant: 'व्यापारी',
    merchantPh: 'ज़ोमैटो, शर्मा किराना…',
    merchantUpi: 'व्यापारी UPI',
    merchantUpiPh: 'shop@oksbi',
    paidFrom: 'भुगतान खाता',
    yourAccount: 'आपका खाता',
    customerAccount: 'आपका खाता (ग्राहक)',
    accounts: 'खाते',
    merchants: 'व्यापारी',
    receipt: 'रसीद',
    addPhoto: 'फ़ोटो जोड़ें',
    removePhoto: 'फ़ोटो हटाएँ',
    listening: 'सुन रहा हूँ…',
    speakNow: 'बोलें',
    voiceHint: '“ज़ोमैटो पे 349” या “चाय पर 200” कहें।',
    voiceNeedMic: 'राशि और व्यापारी भरने के लिए माइक दें।',
    voiceGot: 'समझ गया',
    openingBalance: 'शुरुआती बैलेंस',
    last4: 'आखिरी 4 अंक',
    upiId: 'आपकी UPI ID',
    addAccount: 'खाता जोड़ें',
    addMerchant: 'व्यापारी जोड़ें',
    addCategory: 'श्रेणी जोड़ें',
    newCategory: 'नई श्रेणी',
    used: 'बकाया',
    available: 'उपलब्ध',
    netWorth: 'कुल संपत्ति',
    fromAccount: 'से',
    toAccount: 'को',
    createMerchant: 'नया व्यापारी',
    noMerchants: 'अभी कोई व्यापारी नहीं — पेमेंट जोड़ने पर दिखेंगे।',
    noAccounts: 'अभी कोई खाता नहीं',
    customCategory: 'अपनी श्रेणी',
    pickAccount: 'खाता चुनें',
    transferTo: 'ट्रांसफर को',
    photo: 'फ़ोटो',
    voice: 'आवाज़',
    accountType: 'प्रकार',
    cashType: 'नकद',
    bankType: 'बैंक',
    cardType: 'कार्ड',
    editAccount: 'खाता बदलें',
    editMerchant: 'व्यापारी बदलें',
    spentWith: 'यहाँ खर्च',
    paidVia: 'माध्यम',
    manageCats: 'श्रेणियाँ प्रबंधित करें',
    catName: 'श्रेणी का नाम',
    defaultAccount: 'भुगतान खाता',
    walletStrip: 'वॉलेट',
    cardOutstanding: 'बकाया',
    addCustom: '+ अपनी',
    keypad: 'कीपैड',
    tapAmount: 'कीपैड के लिए राशि दबाएँ',
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
  return locale === 'hi' ? (cat.nameHi || cat.name) : cat.name;
}

function acctLabel(acct, locale) {
  if (!acct) return '';
  return locale === 'hi' ? (acct.nameHi || acct.name) : acct.name;
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

function inferAccountType(acct) {
  if (acct && acct.type) return acct.type;
  const n = String((acct && acct.name) || '').toLowerCase();
  if (n.includes('card') || n.includes('कार्ड')) return 'card';
  if (n.includes('cash') || n.includes('नकद')) return 'cash';
  return 'bank';
}

function railForAccount(acct) {
  const type = inferAccountType(acct);
  if (type === 'cash') return 'Cash';
  if (type === 'card') return 'Card';
  return 'UPI';
}

function newTxnId() {
  return 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function newMerchantId() {
  return 'mer-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function newAccountId() {
  return 'acc-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function newCatId() {
  return 'cat-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function normalizeAccount(a, openingCash) {
  const type = inferAccountType(a);
  const opening = a.opening != null
    ? Number(a.opening) || 0
    : ((a.id === 'cash' || type === 'cash') ? Number(openingCash) || 0 : 0);
  return {
    id: a.id,
    name: a.name,
    nameHi: a.nameHi || a.name,
    type,
    last4: a.last4 || '',
    opening,
    upiId: a.upiId || '',
    custom: !!a.custom,
  };
}

function normalizeMerchant(m) {
  return {
    id: m.id,
    name: m.name,
    upiVpa: m.upiVpa || m.upiId || '',
    defaultCategoryId: m.defaultCategoryId || '',
    lastAccountId: m.lastAccountId || '',
  };
}

function createInitialStore() {
  return {
    version: STORE_VERSION,
    onboardingComplete: false,
    user: { name: '', locale: 'en', currency: 'INR' },
    openingCash: 0,
    monthlyIncome: 0,
    startedAt: todayISO(),
    accounts: DEFAULT_ACCOUNTS.map((a) => ({ ...a })),
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    merchants: [],
    transactions: [],
    budgets: [],
    alertsRead: {},
  };
}

function seedMerchantsFromTxns(transactions, existing) {
  const merchants = (existing || []).map(normalizeMerchant);
  const seen = new Set(merchants.map((m) => String(m.name || '').trim().toLowerCase()).filter(Boolean));
  (transactions || []).forEach((tx) => {
    const name = String(tx.merchant || '').trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    merchants.push(normalizeMerchant({
      id: tx.merchantId || newMerchantId(),
      name,
      upiVpa: tx.merchantUpi || '',
      defaultCategoryId: tx.categoryId || '',
      lastAccountId: tx.accountId || '',
    }));
  });
  return merchants;
}

function migrateStore(parsed) {
  const base = createInitialStore();
  const openingCash = Number(parsed.openingCash) || 0;
  const rawAccounts = (parsed.accounts && parsed.accounts.length) ? parsed.accounts : DEFAULT_ACCOUNTS;
  const accounts = rawAccounts.map((a) => normalizeAccount(a, openingCash));
  const cash = accounts.find((a) => a.id === 'cash' || a.type === 'cash');
  if (cash && (parsed.version || 1) < 2 && cash.opening === 0 && openingCash) {
    cash.opening = openingCash;
  }

  const categories = (parsed.categories && parsed.categories.length)
    ? parsed.categories.map((c) => ({ ...c, custom: !!c.custom }))
    : base.categories;

  let merchants = seedMerchantsFromTxns(parsed.transactions, parsed.merchants);
  if (parsed.merchants && parsed.merchants.length && (parsed.version || 1) >= 2) {
    merchants = parsed.merchants.map(normalizeMerchant);
    const extras = seedMerchantsFromTxns(parsed.transactions, merchants);
    merchants = extras;
  }

  const transactions = (parsed.transactions || []).map((tx) => {
    const name = String(tx.merchant || '').trim();
    const m = name ? merchants.find((x) => x.name.toLowerCase() === name.toLowerCase()) : null;
    const acct = accounts.find((a) => a.id === tx.accountId);
    return {
      ...tx,
      merchantId: tx.merchantId || (m ? m.id : ''),
      merchantUpi: tx.merchantUpi || (m ? m.upiVpa : '') || '',
      method: tx.method || railForAccount(acct),
      receiptThumb: tx.receiptThumb || '',
      voiceText: tx.voiceText || '',
      toAccountId: tx.toAccountId || '',
    };
  });

  return {
    ...base,
    ...parsed,
    version: STORE_VERSION,
    user: { ...base.user, ...(parsed.user || {}) },
    openingCash,
    monthlyIncome: Number(parsed.monthlyIncome) || 0,
    accounts,
    categories,
    merchants,
    transactions,
    budgets: parsed.budgets || [],
    alertsRead: parsed.alertsRead || {},
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(ZENITH_STORE_KEY);
    if (!raw) return createInitialStore();
    const parsed = JSON.parse(raw);
    if (!parsed) return createInitialStore();
    return migrateStore(parsed);
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

function findAccount(store, id) {
  return (store.accounts || []).find((a) => a.id === id);
}

function findMerchant(store, idOrName) {
  const key = String(idOrName || '').trim().toLowerCase();
  if (!key) return null;
  return (store.merchants || []).find((m) => m.id === idOrName || String(m.name || '').toLowerCase() === key);
}

function accountBalance(store, accountId) {
  const acct = findAccount(store, accountId);
  if (!acct) return 0;
  let bal = Number(acct.opening) || 0;
  (store.transactions || []).forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (acct.type === 'card') {
      if (tx.type === 'expense' && tx.accountId === accountId) bal += amt;
      if (tx.type === 'income' && tx.accountId === accountId) bal -= amt;
      if (tx.type === 'transfer' && tx.toAccountId === accountId) bal -= amt;
      if (tx.type === 'transfer' && tx.accountId === accountId) bal += amt;
    } else {
      if (tx.type === 'expense' && tx.accountId === accountId) bal -= amt;
      if (tx.type === 'income' && tx.accountId === accountId) bal += amt;
      if (tx.type === 'transfer' && tx.accountId === accountId) bal -= amt;
      if (tx.type === 'transfer' && tx.toAccountId === accountId) bal += amt;
    }
  });
  return bal;
}

function liquidOpening(store) {
  const rows = (store.accounts || []).filter((a) => a.type !== 'card');
  if (!rows.length) return Number(store.openingCash) || 0;
  return rows.reduce((s, a) => s + (Number(a.opening) || 0), 0);
}

function netWorth(store) {
  let assets = 0;
  let liabilities = 0;
  (store.accounts || []).forEach((a) => {
    const bal = accountBalance(store, a.id);
    if (a.type === 'card') liabilities += bal;
    else assets += bal;
  });
  return assets - liabilities;
}

function merchantSpend(store, merchantId, mk) {
  return (store.transactions || [])
    .filter((tx) => {
      if (tx.type !== 'expense') return false;
      if (tx.merchantId !== merchantId && String(tx.merchant || '').toLowerCase() !== String((findMerchant(store, merchantId) || {}).name || '').toLowerCase()) return false;
      if (mk && monthKey(tx.date) !== mk) return false;
      return true;
    })
    .reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
}

function upsertMerchantInStore(store, fields) {
  const name = String(fields.name || '').trim();
  if (!name) return { store, merchant: null };
  const merchants = [...(store.merchants || [])];
  let existing = merchants.find((m) => m.id === fields.id || m.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    const next = normalizeMerchant({
      ...existing,
      name,
      upiVpa: fields.upiVpa != null ? fields.upiVpa : existing.upiVpa,
      defaultCategoryId: fields.defaultCategoryId || existing.defaultCategoryId,
      lastAccountId: fields.lastAccountId || existing.lastAccountId,
    });
    return { store: { ...store, merchants: merchants.map((m) => (m.id === existing.id ? next : m)) }, merchant: next };
  }
  const created = normalizeMerchant({
    id: fields.id || newMerchantId(),
    name,
    upiVpa: fields.upiVpa || '',
    defaultCategoryId: fields.defaultCategoryId || '',
    lastAccountId: fields.lastAccountId || '',
  });
  return { store: { ...store, merchants: [created, ...merchants] }, merchant: created };
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
  const row = (store.budgets || []).find((b) => b.categoryId === categoryId && b.monthKey === key);
  return row ? Number(row.limit) || 0 : 0;
}

function totalBudgetLimit(store, mk) {
  const key = mk || monthKey();
  return (store.budgets || [])
    .filter((b) => b.monthKey === key)
    .reduce((s, b) => s + (Number(b.limit) || 0), 0);
}

function spentInCategory(store, categoryId, mk) {
  return monthTxns(store, mk)
    .filter((tx) => tx.type === 'expense' && tx.categoryId === categoryId)
    .reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
}

function categorySpendRows(store, mk) {
  const key = mk || monthKey();
  return store.categories
    .filter((c) => c.type === 'expense')
    .map((c) => ({
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
  return liquidOpening(store) + income - spent;
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

function parseVoiceUtterance(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return { amount: 0, merchant: '', voiceText: '' };
  const lower = raw.toLowerCase();
  let amount = 0;
  const amtRe = /(?:₹|rs\.?|inr|rupees?|रुप[एये]|रु\.?)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:₹|rs\.?|inr|rupees?|रुप[एये])?/gi;
  let m;
  const amounts = [];
  while ((m = amtRe.exec(lower))) amounts.push(parseFloat(String(m[1]).replace(',', '.')));
  if (!amounts.length) {
    const n = lower.match(/(\d+(?:\.\d{1,2})?)/);
    if (n) amounts.push(parseFloat(n[1]));
  }
  amount = amounts[0] || 0;

  let merchant = '';
  const prep = /^(.*?)(?:\s+)(?:on|at|to|for|pe|ko|se|से|को|पे|पर)(?:\s+)(.+)$/i;
  const mm = raw.match(prep);
  if (mm) {
    const left = mm[1].replace(/(?:₹|rs\.?|inr)?\s*\d+(?:[.,]\d{1,2})?\s*(?:₹|rs\.?|inr|rupees?|रुप[एये])?/ig, ' ')
      .replace(/\b(spent|paid|pay|spend|aaj|आज|kal|add|expense|kharcha|खर्च)\b/ig, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const right = mm[2]
      .replace(/[।.!?]+$/g, '')
      .replace(/(?:rupees?|rs\.?|₹|inr|रुप[एये])/ig, '')
      .replace(/\d+(?:[.,]\d{1,2})?/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    merchant = right || left;
  } else {
    merchant = raw
      .replace(/(?:₹|rs\.?|inr)?\s*\d+(?:[.,]\d{1,2})?\s*(?:₹|rs\.?|inr|rupees?|रुप[एये])?/ig, ' ')
      .replace(/\b(spent|paid|pay|spend|aaj|आज|kal|add|expense|kharcha|खर्च)\b/ig, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  if (/^\d+(\.\d+)?$/.test(merchant)) merchant = '';
  return { amount, merchant, voiceText: raw };
}

function hintCategoryFromText(text, categories) {
  const s = String(text || '').toLowerCase();
  const rules = [
    ['chai', /chai|coffee|चाय|कॉफ/],
    ['tiffin', /zomato|swiggy|tiffin|lunch|dinner|खाना|लंच/],
    ['dining', /dining|restaurant|रेस्टोर/],
    ['kirana', /kirana|grocery|big ?bazaar|dmart|किराना/],
    ['auto', /auto|rapido|rickshaw|ऑटो/],
    ['cab', /uber|ola|cab|कैब/],
    ['metro', /metro|bus|मेट्रो/],
    ['fuel', /fuel|petrol|diesel|fastag|पेट्रोल/],
    ['rent', /rent|किराया/],
    ['shopping', /amazon|flipkart|myntra|shopping/],
    ['entertainment', /movie|pvr|netflix|hotstar/],
  ];
  for (let i = 0; i < rules.length; i++) {
    if (rules[i][1].test(s) && (categories || []).some((c) => c.id === rules[i][0])) return rules[i][0];
  }
  return '';
}

function compressImageFile(file, cb) {
  if (!file || !file.type || file.type.indexOf('image') !== 0) {
    cb('');
    return;
  }
  const reader = new FileReader();
  reader.onerror = () => cb('');
  reader.onload = () => {
    const img = new Image();
    img.onerror = () => cb('');
    img.onload = () => {
      const max = 720;
      let w = img.width;
      let h = img.height;
      if (w > max || h > max) {
        const scale = Math.min(max / w, max / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      try {
        cb(canvas.toDataURL('image/jpeg', 0.72));
      } catch (e) {
        cb('');
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

Object.assign(window, {
  ZENITH_STORE_KEY,
  STORE_VERSION,
  DEFAULT_CATEGORIES,
  DEFAULT_ACCOUNTS,
  CAT_EMOJIS,
  CAT_COLORS,
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
  inferAccountType,
  railForAccount,
  createInitialStore,
  migrateStore,
  loadStore,
  saveStore,
  findCat,
  findAccount,
  findMerchant,
  accountBalance,
  liquidOpening,
  netWorth,
  merchantSpend,
  upsertMerchantInStore,
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
  newMerchantId,
  newAccountId,
  newCatId,
  parseVoiceUtterance,
  hintCategoryFromText,
  compressImageFile,
  normalizeAccount,
  normalizeMerchant,
});
