/**
 * Browser helpers for Sarvam voice + Cloud Vision OCR + image compress.
 */
(function () {
  function loadCaptureStatus() {
    return fetch('api/status', { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) return { notion: false, sarvam: false, vision: false };
        return res.json();
      })
      .catch(function () {
        return { notion: false, sarvam: false, vision: false, offline: true };
      });
  }

  function postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().then(function (json) {
        if (!res.ok) {
          var err = new Error((json && (json.error || json.message)) || ('HTTP ' + res.status));
          err.status = res.status;
          err.body = json;
          throw err;
        }
        return json;
      });
    });
  }

  function transcribeVoice(audioBase64, mimeType) {
    return postJson('api/voice', { audioBase64: audioBase64, mimeType: mimeType || 'audio/webm' });
  }

  function ocrReceipt(imageBase64) {
    return postJson('api/ocr', { imageBase64: imageBase64 });
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function compressImageFile(file, maxEdge, quality) {
    var cap = maxEdge || 1280;
    var q = quality == null ? 0.72 : quality;
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, cap / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', q));
      };
      img.onerror = function (err) {
        URL.revokeObjectURL(url);
        reject(err || new Error('Could not read image'));
      };
      img.src = url;
    });
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.loadCaptureStatus = loadCaptureStatus;
    globalThis.transcribeVoice = transcribeVoice;
    globalThis.ocrReceipt = ocrReceipt;
    globalThis.blobToDataUrl = blobToDataUrl;
    globalThis.compressImageFile = compressImageFile;
  }
})();
