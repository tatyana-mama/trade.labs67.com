/* form-validator.js v1.0 — LABS67
   Universal form validation for LABS67 sites.
   Auto-detects form fields by type, adds phone country codes, name validation, etc. */

(function () {
  'use strict';

  var COUNTRIES = [
    { code: '+48',  iso: 'PL', name: 'Polska',        mask: '### ### ###' },
    { code: '+375', iso: 'BY', name: 'Belarus',        mask: '## ###-##-##' },
    { code: '+380', iso: 'UA', name: 'Ukraina',        mask: '## ### ## ##' },
    { code: '+7',   iso: 'RU', name: 'Rosja',          mask: '### ###-##-##' },
    { code: '+49',  iso: 'DE', name: 'Deutschland',    mask: '### #######' },
    { code: '+33',  iso: 'FR', name: 'France',         mask: '# ## ## ## ##' },
    { code: '+44',  iso: 'GB', name: 'United Kingdom', mask: '#### ######' },
    { code: '+34',  iso: 'ES', name: 'Espana',         mask: '### ### ###' },
    { code: '+39',  iso: 'IT', name: 'Italia',         mask: '### ### ####' },
    { code: '+351', iso: 'PT', name: 'Portugal',       mask: '### ### ###' },
    { code: '+81',  iso: 'JP', name: 'Japan',          mask: '##-####-####' },
    { code: '+82',  iso: 'KR', name: 'Korea',          mask: '##-####-####' },
    { code: '+1',   iso: 'US', name: 'USA / Canada',   mask: '(###) ###-####' },
    { code: '+43',  iso: 'AT', name: 'Osterreich',     mask: '### #######' },
    { code: '+41',  iso: 'CH', name: 'Schweiz',        mask: '## ### ## ##' },
    { code: '+31',  iso: 'NL', name: 'Nederland',      mask: '# ########' },
    { code: '+46',  iso: 'SE', name: 'Sverige',        mask: '## ### ## ##' },
    { code: '+47',  iso: 'NO', name: 'Norge',          mask: '### ## ###' },
    { code: '+45',  iso: 'DK', name: 'Danmark',        mask: '## ## ## ##' },
    { code: '+358', iso: 'FI', name: 'Suomi',          mask: '## ### ####' },
    { code: '+420', iso: 'CZ', name: 'Cesko',          mask: '### ### ###' },
    { code: '+421', iso: 'SK', name: 'Slovensko',      mask: '### ### ###' },
    { code: '+36',  iso: 'HU', name: 'Magyarorszag',   mask: '## ### ####' },
    { code: '+40',  iso: 'RO', name: 'Romania',        mask: '### ### ###' },
    { code: '+370', iso: 'LT', name: 'Lietuva',        mask: '### #####' },
    { code: '+371', iso: 'LV', name: 'Latvija',        mask: '## ### ###' },
    { code: '+372', iso: 'EE', name: 'Eesti',          mask: '#### ####' },
    { code: '+90',  iso: 'TR', name: 'Turkiye',        mask: '### ### ## ##' },
    { code: '+972', iso: 'IL', name: 'Israel',         mask: '##-###-####' },
    { code: '+61',  iso: 'AU', name: 'Australia',      mask: '### ### ###' },
    { code: '+55',  iso: 'BR', name: 'Brasil',         mask: '## #####-####' },
    { code: '+86',  iso: 'CN', name: 'China',          mask: '### #### ####' },
    { code: '+91',  iso: 'IN', name: 'India',          mask: '##### #####' }
  ];

  var DEFAULT_CC = '+48';

  function ce(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  }
  function findCC(code) {
    for (var i = 0; i < COUNTRIES.length; i++) if (COUNTRIES[i].code === code) return COUNTRIES[i];
    return COUNTRIES[0];
  }
  function digits(s) { return s.replace(/\D/g, ''); }
  function applyMask(d, m) {
    var r = '', di = 0;
    for (var i = 0; i < m.length && di < d.length; i++) {
      if (m[i] === '#') r += d[di++]; else r += m[i];
    }
    if (di < d.length) r += d.substring(di);
    return r;
  }
  function getMinMax(c) {
    var map = {
      '+48':[9,9],'+375':[9,10],'+380':[9,9],'+7':[10,10],'+49':[10,11],'+33':[9,9],
      '+44':[10,10],'+34':[9,9],'+39':[9,10],'+351':[9,9],'+81':[10,10],'+82':[10,10],
      '+1':[10,10],'+43':[10,10],'+41':[9,9],'+31':[9,9],'+46':[9,9],'+47':[8,8],
      '+45':[8,8],'+358':[9,10],'+420':[9,9],'+421':[9,9],'+36':[9,9],'+40':[9,9],
      '+370':[8,8],'+371':[8,8],'+372':[7,8],'+90':[10,10],'+972':[9,9],
      '+61':[9,9],'+55':[10,11],'+86':[11,11],'+91':[10,10]
    };
    return map[c.code] || [7, 15];
  }

  function isValidName(v) {
    v = v.trim();
    if (v.length < 2) return false;
    if (/\d/.test(v)) return false;
    if (/[!@#$%^&*()_+=\[\]{};:"\\|,.<>?\/~`]/.test(v)) return false;
    return true;
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ── Phone UI builder ── */
  function buildPhoneUI(inp) {
    var wrap = ce('div', 'fv-pw');
    inp.parentNode.insertBefore(wrap, inp);
    var cur = findCC(DEFAULT_CC);
    var btn = ce('button', 'fv-cb');
    btn.type = 'button';
    btn.innerHTML = '<span class="fv-ci">' + cur.iso + '</span> <span class="fv-cc">' + cur.code + '</span> <span class="fv-ca">&#9662;</span>';

    var dd = ce('div', 'fv-dd');
    var si = ce('input', 'fv-ds');
    si.type = 'text'; si.placeholder = 'Search...'; si.autocomplete = 'off';
    dd.appendChild(si);
    var list = ce('div', 'fv-dl');
    dd.appendChild(list);

    function render(f) {
      list.innerHTML = '';
      var fl = (f || '').toLowerCase();
      COUNTRIES.forEach(function (c) {
        if (fl && c.name.toLowerCase().indexOf(fl) === -1 && c.code.indexOf(fl) === -1 && c.iso.toLowerCase().indexOf(fl) === -1) return;
        var it = ce('div', 'fv-di', '<span class="fv-diso">' + c.iso + '</span> ' + c.name + ' <span class="fv-dcc">' + c.code + '</span>');
        it.addEventListener('click', function () {
          cur = c;
          btn.innerHTML = '<span class="fv-ci">' + c.iso + '</span> <span class="fv-cc">' + c.code + '</span> <span class="fv-ca">&#9662;</span>';
          dd.classList.remove('open');
          fmt(); inp.focus();
        });
        list.appendChild(it);
      });
    }
    render('');
    si.addEventListener('input', function () { render(this.value); });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = dd.classList.contains('open');
      dd.classList.toggle('open');
      if (!o) { si.value = ''; render(''); si.focus(); }
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) dd.classList.remove('open'); });

    function fmt() {
      var raw = digits(inp.value);
      inp.value = applyMask(raw, cur.mask);
      inp.placeholder = cur.mask.replace(/#/g, '0');
    }
    inp.addEventListener('input', fmt);
    inp.removeAttribute('placeholder');
    inp.placeholder = cur.mask.replace(/#/g, '0');

    wrap.appendChild(btn);
    wrap.appendChild(inp);
    wrap.appendChild(dd);

    inp._fvCC = function () { return cur; };
    inp._fvD = function () { return digits(inp.value); };
  }

  /* ── Error helpers ── */
  function showErr(inp, msg) {
    inp.style.borderColor = '#e74c3c';
    var er = inp.parentNode.querySelector('.fv-err');
    if (!er) {
      er = ce('div', 'fv-err');
      inp.parentNode.appendChild(er);
    }
    er.textContent = msg;
    er.style.display = 'block';
  }
  function clearErr(inp) {
    inp.style.borderColor = '';
    var er = inp.parentNode.querySelector('.fv-err');
    if (er) er.style.display = 'none';
  }

  /* ── Main init ── */
  function init() {
    // Find all forms: either <form> or .form or .form-card
    var containers = document.querySelectorAll('form, .form, .form-card, .bk-form');
    containers.forEach(function (form) {
      // Skip chat forms
      if (form.closest('#cb') || form.closest('#sv-chat-win') || form.closest('.sv-chat-foot') || form.closest('.chat-widget')) return;

      var nameInp = form.querySelector('input[type="text"]:first-of-type') || form.querySelector('input[type="text"]');
      var phoneInp = form.querySelector('input[type="tel"]');
      var emailInp = form.querySelector('input[type="email"]');
      var selects = form.querySelectorAll('select');
      var submitBtn = form.querySelector('.form-submit, .fsub, button[onclick*="Submit"], button[onclick*="submit"]');

      if (!submitBtn) return;

      // Build phone UI
      if (phoneInp) buildPhoneUI(phoneInp);

      // Name: filter digits on input
      if (nameInp) {
        nameInp.addEventListener('input', function () {
          this.value = this.value.replace(/[\d!@#$%^&*()_+=\[\]{};:"\\|,.<>?\/~`]/g, '');
          clearErr(this);
        });
      }
      if (emailInp) emailInp.addEventListener('input', function () { clearErr(this); });
      if (phoneInp) phoneInp.addEventListener('input', function () { clearErr(this); });
      selects.forEach(function (s) { s.addEventListener('change', function () { clearErr(this); }); });

      // Build confirmation checkbox
      var confirmWrap = ce('div', 'fv-cw');
      var cb = ce('input', 'fv-chk');
      cb.type = 'checkbox'; cb.id = 'fv-cf-' + Math.random().toString(36).substr(2, 4);
      var lbl = ce('label', 'fv-cl');
      lbl.setAttribute('for', cb.id);
      lbl.setAttribute('data-i18n', 'form_confirm');
      lbl.textContent = 'I confirm the request details';
      var cErr = ce('div', 'fv-err');
      cErr.style.display = 'none';
      confirmWrap.appendChild(cb);
      confirmWrap.appendChild(lbl);
      confirmWrap.appendChild(cErr);
      submitBtn.parentNode.insertBefore(confirmWrap, submitBtn);
      cb.addEventListener('change', function () { cErr.style.display = 'none'; });

      // Override submit
      var origOnclick = submitBtn.getAttribute('onclick');
      submitBtn.removeAttribute('onclick');
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var valid = true;

        // Name
        if (nameInp) {
          if (!isValidName(nameInp.value)) {
            showErr(nameInp, 'Only letters, min 2 characters');
            valid = false;
          } else { clearErr(nameInp); }
        }

        // Phone
        if (phoneInp && phoneInp._fvD) {
          var d = phoneInp._fvD();
          var cc = phoneInp._fvCC();
          var mm = getMinMax(cc);
          if (d.length < mm[0] || d.length > mm[1]) {
            showErr(phoneInp, cc.code + ': ' + mm[0] + ' digits required');
            valid = false;
          } else { clearErr(phoneInp); }
        }

        // Email
        if (emailInp) {
          if (!EMAIL_RE.test(emailInp.value.trim())) {
            showErr(emailInp, 'Valid email required');
            valid = false;
          } else { clearErr(emailInp); }
        }

        // Selects — first option is placeholder
        selects.forEach(function (s) {
          if (s.selectedIndex === 0 && s.options[0].textContent.indexOf('—') !== -1) {
            showErr(s, 'Please select an option');
            valid = false;
          } else { clearErr(s); }
        });

        // Confirmation
        if (!cb.checked) {
          cErr.textContent = 'Please confirm';
          cErr.style.display = 'block';
          valid = false;
        }

        if (!valid) return;

        // Run original submit logic
        if (origOnclick) {
          try { new Function('btn', origOnclick.replace(/this/g, 'btn'))(submitBtn); }
          catch (ex) { eval(origOnclick); }
        }
      });
    });
  }

  /* ── CSS ── */
  function css() {
    var s = document.createElement('style');
    s.textContent = [
      '.fv-pw{position:relative;display:flex;gap:0;align-items:stretch}',
      '.fv-cb{display:flex;align-items:center;gap:4px;padding:0 10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-right:none;border-radius:8px 0 0 8px;color:inherit;font-size:13px;cursor:pointer;white-space:nowrap;min-height:44px;transition:border-color .2s}',
      '.fv-cb:hover{background:rgba(255,255,255,.1)}',
      '.fv-ci{font-weight:600;font-size:11px;opacity:.7}',
      '.fv-cc{font-weight:500}',
      '.fv-ca{font-size:8px;opacity:.5}',
      '.fv-pw input[type="tel"],.fv-pw .fi,.fv-pw .form-input{border-radius:0 8px 8px 0!important;flex:1;min-width:0}',
      '.fv-dd{position:absolute;top:100%;left:0;width:280px;max-height:0;overflow:hidden;background:#1a1a1a;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:999;opacity:0;transition:max-height .25s,opacity .2s}',
      '.fv-dd.open{max-height:300px;opacity:1;overflow:visible;border:1px solid rgba(255,255,255,.12)}',
      '.fv-ds{width:100%;padding:10px 12px;background:rgba(255,255,255,.06);border:none;border-bottom:1px solid rgba(255,255,255,.1);color:inherit;font-size:14px;outline:none;box-sizing:border-box}',
      '.fv-ds::placeholder{color:rgba(255,255,255,.3)}',
      '.fv-dl{max-height:230px;overflow-y:auto;scrollbar-width:thin}',
      '.fv-di{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;font-size:13px;transition:background .15s}',
      '.fv-di:hover{background:rgba(255,255,255,.08)}',
      '.fv-diso{font-weight:600;font-size:11px;opacity:.5;width:24px}',
      '.fv-dcc{opacity:.6;font-size:12px;margin-left:auto}',
      '.fv-err{color:#e74c3c;font-size:11px;margin-top:4px;display:none}',
      '.fv-cw{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0 8px}',
      '.fv-chk{width:18px;height:18px;accent-color:var(--accent,var(--blue,#2B7ACC));cursor:pointer}',
      '.fv-cl{font-size:13px;opacity:.8;cursor:pointer;user-select:none}'
    ].join('\n');
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { css(); init(); });
  } else { css(); init(); }
})();
