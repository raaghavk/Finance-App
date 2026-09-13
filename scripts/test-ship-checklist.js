'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pages = ['index.html', 'Zenith.html', 'invite.html', 'privacy.html', 'support.html', 'terms.html', 'thanks.html', '404.html'];

pages.forEach((rel) => {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  assert.match(html, /<title>.+<\/title>/, rel + ' title');
  assert.match(html, /<meta name="description"/, rel + ' description');
  assert.match(html, /og:title/, rel + ' og title');
  assert.match(html, /og:image/, rel + ' og image');
  assert.match(html, /icons\/og\.png/, rel + ' og png');
  assert.match(html, /rel="icon"/, rel + ' favicon');
});

const invite = fs.readFileSync(path.join(root, 'invite.html'), 'utf8');
assert.match(invite, /Open Liora/);
assert.match(invite, /sticky-cta/);
assert.match(invite, /alt="Liora leftover to spend/);
assert.match(invite, /Raaghav Kanodia, India/);
assert.match(invite, /_vercel\/insights\/script\.js/);

const support = fs.readFileSync(path.join(root, 'support.html'), 'utf8');
assert.match(support, /id="feedback-form"/);
assert.match(support, /err-name/);
assert.match(support, /Raaghav Kanodia, India/);

const terms = fs.readFileSync(path.join(root, 'terms.html'), 'utf8');
assert.match(terms, /Terms of use/);
assert.match(terms, /Not financial/);

const thanks = fs.readFileSync(path.join(root, 'thanks.html'), 'utf8');
assert.match(thanks, /Thanks/);

const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
assert.match(notFound, /not here/);
assert.match(notFound, /Open Liora/);

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
assert.match(robots, /Sitemap:/);
assert.match(robots, /Allow: \//);

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /invite\.html/);
assert.match(sitemap, /privacy\.html/);
assert.match(sitemap, /terms\.html/);

const siteJs = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
assert.match(siteJs, /liora_site_notice/);
assert.match(siteJs, /Enter your name/);
assert.match(siteJs, /thanks\.html/);
assert.match(siteJs, /Liora feedback/);

const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
assert.match(privacy, /No ad cookies|advertising cookie/);
assert.match(privacy, /Vercel/);

const og = fs.statSync(path.join(root, 'icons/og.png'));
assert.ok(og.size > 1000 && og.size < 150000, 'compressed og.png');
assert.ok(fs.existsSync(path.join(root, 'icons/favicon.ico')));
assert.ok(fs.existsSync(path.join(root, 'icons/favicon-32.png')));

const onboarding = fs.readFileSync(path.join(root, 'components/Onboarding.jsx'), 'utf8');
assert.match(onboarding, /enterName/);
assert.match(onboarding, /role="alert"/);

const add = fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8');
assert.match(add, /enterAmount/);

const profile = fs.readFileSync(path.join(root, 'components/Profile.jsx'), 'utf8');
assert.match(profile, /role="alert"/);
assert.match(profile, /cloudSyncing/);

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(index, /Loading Liora/);
assert.match(index, /role="status"/);
assert.match(index, /site\.js/);

const css = fs.readFileSync(path.join(root, 'site.css'), 'utf8');
assert.match(css, /@media \(max-width: 480px\)/);
assert.match(css, /sticky-cta/);
assert.match(css, /site-cookie/);

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.ok(Array.isArray(vercel.rewrites));

console.log('ship checklist: 404, meta, og, robots, sitemap, cookies, forms, contact ok');
