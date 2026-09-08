/**
 * Parse amount + merchant from voice / OCR text (Hinglish + English).
 */
(function () {
  function parseExpenseUtterance(text) {
    var raw = String(text || '').replace(/\s+/g, ' ').trim();
    if (!raw) return { amount: null, merchant: '', transcript: '' };

    var cleaned = raw.replace(/₹/g, ' ').replace(/\brs\.?\b/gi, ' ');
    var amount = null;
    var pe = cleaned.match(/(.+?)\s+pe\s+(\d[\d,]*(?:\.\d{1,2})?)/i);
    var on = cleaned.match(/(?:spent|spend|paid|pay)\s+(\d[\d,]*(?:\.\d{1,2})?)\s+(?:on|for)\s+(.+)/i);
    var rupee = cleaned.match(/(\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/);

    var merchant = '';
    if (pe) {
      merchant = pe[1].replace(/^(aaj|kal|today|yesterday)\s+/i, '').trim();
      amount = Number(String(pe[2]).replace(/,/g, ''));
    } else if (on) {
      amount = Number(String(on[1]).replace(/,/g, ''));
      merchant = on[2].replace(/[.]+$/, '').trim();
    } else if (rupee) {
      amount = Number(String(rupee[1]).replace(/,/g, ''));
    }

    if (!merchant) {
      merchant = cleaned
        .replace(/(\d[\d,]*(?:\.\d{1,2})?)/g, ' ')
        .replace(/\b(aaj|kal|today|yesterday|spent|spend|paid|pay|on|for|pe|rupees?|rs)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (merchant) {
      merchant = merchant.replace(/^[\s,.-]+|[\s,.-]+$/g, '');
      merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1);
    }

    if (amount !== null && (Number.isNaN(amount) || amount <= 0)) amount = null;

    return { amount: amount, merchant: merchant, transcript: raw };
  }

  function parseReceiptText(text) {
    var raw = String(text || '');
    var amounts = [];
    var re = /(?:₹|rs\.?\s*)(\d{1,3}(?:,\d{2,3})+|\d+)(?:\.(\d{1,2}))?/gi;
    var m;
    while ((m = re.exec(raw))) {
      var n = Number(m[1].replace(/,/g, '') + (m[2] ? '.' + m[2] : ''));
      if (n > 0 && n < 10000000) amounts.push(n);
    }
    if (!amounts.length) {
      var fallback = parseExpenseUtterance(raw);
      return fallback;
    }
    var amount = Math.max.apply(null, amounts);
    var lines = raw.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var merchant = '';
    for (var i = 0; i < Math.min(lines.length, 6); i++) {
      if (/total|amount|gst|invoice|tax|qty|rate/i.test(lines[i])) continue;
      if (/\d/.test(lines[i]) && lines[i].length < 4) continue;
      merchant = lines[i].slice(0, 48);
      break;
    }
    return { amount: amount, merchant: merchant, transcript: raw };
  }

  var api = { parseExpenseUtterance: parseExpenseUtterance, parseReceiptText: parseReceiptText };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') Object.assign(globalThis, api);
})();
