(function () {
  var NOTICE_KEY = 'liora_site_notice';

  function cookieBar() {
    try {
      if (localStorage.getItem(NOTICE_KEY) === '1') return;
    } catch (err) { return; }
    var bar = document.createElement('div');
    bar.className = 'site-cookie';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'How Liora stores data');
    bar.innerHTML = '<p>Liora keeps your ledger on this device. Marketing pages may count visits. No ad cookies. <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></p><button type="button" data-ok>OK</button>';
    document.body.appendChild(bar);
    bar.querySelector('[data-ok]').addEventListener('click', function () {
      try { localStorage.setItem(NOTICE_KEY, '1'); } catch (err) {}
      bar.remove();
    });
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  function bindFeedback() {
    var form = document.getElementById('feedback-form');
    if (!form) return;
    var name = form.querySelector('[name="name"]');
    var email = form.querySelector('[name="email"]');
    var message = form.querySelector('[name="message"]');
    var submit = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var nameVal = (name.value || '').trim();
      var emailVal = (email.value || '').trim();
      var msgVal = (message.value || '').trim();
      name.setAttribute('aria-invalid', nameVal ? 'false' : 'true');
      email.setAttribute('aria-invalid', /.+@.+\..+/.test(emailVal) ? 'false' : 'true');
      message.setAttribute('aria-invalid', msgVal.length >= 8 ? 'false' : 'true');
      showError('err-name', nameVal ? '' : 'Enter your name.');
      showError('err-email', /.+@.+\..+/.test(emailVal) ? '' : 'Enter a valid email.');
      showError('err-message', msgVal.length >= 8 ? '' : 'Tell us what happened (at least a sentence).');
      if (!nameVal || !/.+@.+\..+/.test(emailVal) || msgVal.length < 8) ok = false;
      if (!ok) return;
      submit.disabled = true;
      submit.textContent = 'Opening mail…';
      var body = 'From: ' + nameVal + ' <' + emailVal + '>\n\n' + msgVal;
      var mailto = 'mailto:raaghavkanodia@gmail.com?subject=' + encodeURIComponent('Liora feedback') + '&body=' + encodeURIComponent(body);
      window.location.href = mailto;
      setTimeout(function () { window.location.href = 'thanks.html'; }, 500);
    });
  }

  function ready() {
    cookieBar();
    bindFeedback();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
