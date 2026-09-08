'use strict';

const assert = require('assert');
const parse = require('../lib/parse-expense');

const zomato = parse.parseExpenseUtterance('Zomato pe 349');
assert.strictEqual(zomato.amount, 349);
assert.strictEqual(zomato.merchant, 'Zomato');

const chai = parse.parseExpenseUtterance('spent 200 on chai');
assert.strictEqual(chai.amount, 200);
assert.match(chai.merchant, /chai/i);

const lunch = parse.parseExpenseUtterance('Aaj lunch pe 150');
assert.strictEqual(lunch.amount, 150);
assert.match(lunch.merchant, /lunch/i);

const receipt = parse.parseReceiptText('THE HAZELNUT FACTORY\nVaranasi\nTotal Rs 670.00\nGST 12');
assert.strictEqual(receipt.amount, 670);
assert.match(receipt.merchant, /HAZELNUT/i);

const empty = parse.parseExpenseUtterance('');
assert.strictEqual(empty.amount, null);

console.log('ok — parse expense utterance + receipt text');
