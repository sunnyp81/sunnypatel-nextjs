(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ARROW = '<svg class="arw" viewBox="0 0 20 16" aria-hidden="true" focusable="false"><path d="M1 8h15M10 2l6 6-6 6"/></svg>';
  var NEWTAB = '<span class="sr-only"> (opens in a new tab)</span>';
  var gbp = function (n) { return '£' + n.toLocaleString('en-GB'); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* Menu */
  var menu = $('.menu-btn'), nav = $('#nav');
  if (menu && nav) {
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; menu.focus(); } });
  }

  /* Data */
  var dataEl = $('#chooser-data');
  var DATA = dataEl ? JSON.parse(dataEl.textContent) : null;
  var byId = {};
  if (DATA) DATA.clinics.forEach(function (c) { byId[c.id] = c; });

  /* Finder height drives the map offset on wide screens */
  var finder = $('#finder');
  function setFinderH() { if (finder) document.documentElement.style.setProperty('--finder-h', (finder.offsetHeight + 18) + 'px'); }
  setFinderH(); window.addEventListener('resize', setFinderH);
  if (finder && window.ResizeObserver) new ResizeObserver(setFinderH).observe(finder);

  /* ===== Map, finder and directory ===== */
  var pts = $$('.map .pt');
  var mapSvg = $('.map');
  if (mapSvg && pts.length) {
    mapSvg.setAttribute('role', 'group');
    var d = $('#map-desc'); if (d) d.textContent += ' Use the arrow keys to move between clinics and Enter to choose one.';
    pts.forEach(function (p) { p.setAttribute('role', 'button'); p.setAttribute('tabindex', '-1'); p.setAttribute('aria-label', p.getAttribute('data-label')); });
  }
  var items = $$('.clinic[data-id]');
  var q = $('#q'), count = $('#finder-count'), none = $('#none'), picked = $('#picked');
  var filter = 'all', selected = null;

  function norm(t) { return String(t).toLowerCase().replace(/[\u2018\u2019\u02bc\u0060\u00b4']/g, '').replace(/[,]/g, ' ').replace(/\s+/g, ' ').trim(); }
  var onSelect = null, onClear = null;
  var regionsEl = $('#regions'), dirMore = null, dirOpen = false;
  function matches(id) {
    var li = $('#c-' + id), c = byId[id];
    if (!c) return false;
    var ok = filter === 'all' || (filter === 'gp' && !c.soon) || (filter === 'dental' && c.dental) || (filter === 'tesco' && c.tesco);
    var term = q ? norm(q.value) : '';
    if (ok && term) {
      var hay = norm(li ? li.getAttribute('data-search') : c.name + ' ' + c.region);
      ok = hay.indexOf(term) !== -1 || (/\d/.test(term) && hay.replace(/ /g, '').indexOf(term.replace(/ /g, '')) !== -1);
    }
    return ok;
  }

  function apply() {
    if (!DATA) return;
    var shown = [];
    DATA.clinics.forEach(function (c) {
      var ok = matches(c.id);
      var li = $('#c-' + c.id);
      if (li) li.hidden = !ok;
      var pt = $('.map .pt[data-id="' + c.id + '"]');
      if (pt) pt.classList.toggle('is-out', !ok);
      if (ok) shown.push(c);
    });
    $$('.region').forEach(function (r) { r.hidden = !$('.clinic:not([hidden])', r); });
    if (none) none.hidden = shown.length > 0;
    var term = q && q.value.trim();
    if (count) {
      if (!term && filter === 'all') count.textContent = '17 clinics open and Reading coming soon.';
      else if (!shown.length) count.textContent = 'No clinics match.';
      else count.textContent = shown.length + (shown.length === 1 ? ' clinic: ' : ' clinics: ') + shown.map(function (c) { return c.short; }).join(', ') + '.';
    }
    if (selected && !matches(selected)) clearSelection();
    if (term && shown.length === 1) select(shown[0].id, false);
    updateDir(!!term || filter !== 'all');
    rovingReset();
  }

  function clearSelection() {
    selected = null;
    pts.forEach(function (p) { p.classList.remove('is-on'); p.setAttribute('aria-pressed', 'false'); });
    items.forEach(function (li) { li.classList.remove('is-on'); });
    if (picked) picked.innerHTML = '<p class="picked-hint">Choose a clinic on the map or in the list to see its address.</p>';
    if (onClear) onClear();
  }

  function updateDir(filtering) {
    if (!regionsEl || !dirMore) return;
    var collapsed = !dirOpen && !filtering;
    regionsEl.classList.toggle('is-collapsed', collapsed);
    dirMore.hidden = filtering;
    dirMore.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    dirMore.textContent = collapsed ? 'View all 18 clinics' : 'Show fewer clinics';
  }
  if (regionsEl && $$('.region', regionsEl).length > 1) {
    dirMore = document.createElement('button');
    dirMore.type = 'button'; dirMore.className = 'btn btn-line dir-more'; dirMore.setAttribute('aria-controls', 'regions');
    dirMore.addEventListener('click', function () { dirOpen = !dirOpen; updateDir(false); if (!dirOpen) { var h2 = $('#dir-h'); if (h2) h2.scrollIntoView({ block: 'start' }); } });
    regionsEl.parentNode.insertBefore(dirMore, regionsEl.nextSibling);
  }

  function select(id, focusPoint) {
    selected = id;
    if (!dirOpen && regionsEl && regionsEl.classList.contains('is-collapsed')) { var tl = $('#c-' + id); if (tl && tl.closest('.region') !== $('.region', regionsEl)) { dirOpen = true; updateDir(false); } }
    pts.forEach(function (p) { var on = p.getAttribute('data-id') === id; p.classList.toggle('is-on', on); p.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    items.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-id') === id); });
    var c = byId[id];
    if (picked && c) {
      var services = (c.dental ? 'GP and dentist' : 'GP') + (c.tesco ? ', inside Tesco Extra' : '');
      var act = c.soon
        ? '<a class="btn btn-line btn-sm" href="' + c.url + '" target="_blank" rel="noopener noreferrer">Clinic details' + NEWTAB + '</a><span>Coming soon. Not taking bookings yet.</span>'
        : '<a class="btn btn-book btn-sm" href="' + DATA.book.main + '" target="_blank" rel="noopener noreferrer">Book' + ARROW + NEWTAB + '</a>' +
          '<a href="' + c.url + '"' + (c.local ? '' : ' target="_blank" rel="noopener noreferrer"') + '>Clinic page' + (c.local ? '' : NEWTAB) + '</a>';
      picked.innerHTML = '<h3>' + esc(c.name) + '</h3><p>' + esc(c.addr) + '</p><p>' + services + '</p><div class="pk-row">' + act + '</div>' + (c.soon ? '' : '<p class="pk-hint">Choose ' + esc(c.name) + ' on the booking page.</p>');
    }
    if (onSelect) onSelect(id);
    if (focusPoint) { var p = $('.map .pt[data-id="' + id + '"]'); if (p) p.focus(); }
  }

  // Roving tabindex across visible map points, ordered north to south as drawn.
  function visiblePts() { return pts.filter(function (p) { return !p.classList.contains('is-out'); }); }
  function rovingReset() {
    var vis = visiblePts();
    pts.forEach(function (p) { p.setAttribute('tabindex', '-1'); });
    var cur = vis.filter(function (p) { return p.getAttribute('data-id') === selected; })[0] || vis[0];
    if (cur) cur.setAttribute('tabindex', '0');
  }
  if (pts.length) {
    pts.sort(function (a, b) {
      var ba = a.getBoundingClientRect ? 0 : 0; // stable order fallback
      var ca = byId[a.getAttribute('data-id')], cb = byId[b.getAttribute('data-id')];
      return DATA.clinics.indexOf(ca) - DATA.clinics.indexOf(cb) + ba;
    });
    pts.forEach(function (p) {
      p.setAttribute('aria-pressed', 'false');
      p.addEventListener('click', function () { select(p.getAttribute('data-id')); rovingReset(); });
      p.addEventListener('keydown', function (e) {
        var vis = visiblePts(), i = vis.indexOf(p), n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = vis[(i + 1) % vis.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = vis[(i - 1 + vis.length) % vis.length];
        else if (e.key === 'Home') n = vis[0];
        else if (e.key === 'End') n = vis[vis.length - 1];
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.getAttribute('data-id')); return; }
        if (n) { e.preventDefault(); p.setAttribute('tabindex', '-1'); n.setAttribute('tabindex', '0'); n.focus(); }
      });
      p.addEventListener('mouseenter', function () { var li = $('#c-' + p.getAttribute('data-id')); if (li) li.classList.add('is-hover'); });
      p.addEventListener('mouseleave', function () { var li = $('#c-' + p.getAttribute('data-id')); if (li) li.classList.remove('is-hover'); });
    });
    rovingReset();
  }
  items.forEach(function (li) {
    var id = li.getAttribute('data-id');
    var pt = function () { return $('.map .pt[data-id="' + id + '"]'); };
    li.addEventListener('mouseenter', function () { var p = pt(); if (p) p.classList.add('is-hover'); });
    li.addEventListener('mouseleave', function () { var p = pt(); if (p) p.classList.remove('is-hover'); });
    li.addEventListener('focusin', function () { var p = pt(); if (p) p.classList.add('is-hover'); });
    li.addEventListener('focusout', function () { var p = pt(); if (p) p.classList.remove('is-hover'); });
    if (pt()) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn-text show-map';
      b.innerHTML = 'Show on map<span class="sr-only"> for ' + esc(byId[id].name) + '</span>';
      b.addEventListener('click', function () {
        select(id); rovingReset();
        var a = $('#atlas'); if (a && window.innerWidth <= 1000) a.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
      var act = $('.c-act', li); if (act) act.appendChild(b);
    }
  });
  $$('.flt').forEach(function (b) {
    b.addEventListener('click', function () {
      filter = b.getAttribute('data-f');
      $$('.flt').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      apply();
    });
  });
  if (q) {
    q.addEventListener('input', apply);
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); var first = $('.clinic:not([hidden])'); if (first) select(first.getAttribute('data-id')); }
    });
  }
  /* Near me: uses the device's location, compares with the clinic coordinates baked into the page, sends nothing anywhere */
  var flts = $('.filters');
  if (flts && DATA && navigator.geolocation && (!document.featurePolicy || document.featurePolicy.allowsFeature('geolocation'))) {
    var nb = document.createElement('button');
    nb.type = 'button'; nb.className = 'near-me';
    nb.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="5"/><path d="M8 0v4M8 12v4M0 8h4M12 8h4"/></svg>Near me';
    flts.parentNode.insertBefore(nb, flts.nextSibling);
    nb.addEventListener('click', function () {
      count.textContent = 'Finding your location...';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var la = pos.coords.latitude, lo = pos.coords.longitude, r = Math.PI / 180;
        var mi = function (c) { var x = Math.sin((c.lat - la) * r / 2), y = Math.sin((c.lon - lo) * r / 2); return 7918 * Math.asin(Math.sqrt(x * x + Math.cos(la * r) * Math.cos(c.lat * r) * y * y)); };
        var fl = filter, label = fl === 'dental' ? 'dentist ' : fl === 'tesco' ? 'Tesco Extra ' : fl === 'gp' ? 'GP ' : '';
        var near = DATA.clinics.filter(function (c) { return !c.soon && (fl === 'all' || fl === 'gp' || (fl === 'dental' && c.dental) || (fl === 'tesco' && c.tesco)); }).map(function (c) { return { c: c, m: mi(c) }; }).sort(function (a, b) { return a.m - b.m; }).slice(0, 3);
        if (q) q.value = '';
        apply(); select(near[0].c.id); rovingReset();
        count.textContent = 'Nearest ' + label + 'clinics to you: ' + near.map(function (n) { var m = Math.round(n.m); return n.c.short + ' (' + (n.m < 1 ? 'less than 1 mile)' : m + (m === 1 ? ' mile)' : ' miles)')); }).join(', ') + '. Straight-line distances.';
      }, function () { count.textContent = 'Your location is not available. Type a town instead.'; }, { maximumAge: 600000, timeout: 10000 });
    });
  }
  var reset = $('#reset');
  if (reset) reset.addEventListener('click', function () { if (q) q.value = ''; filter = 'all'; $$('.flt').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-f') === 'all' ? 'true' : 'false'); }); apply(); if (q) q.focus(); });

  /* ===== Chooser: service, clinic, price and Book ===== */
  var body = $('#board-body');
  if (body && DATA) {
    var state = { svc: null, clinic: null };
    var svcById = {}; DATA.services.forEach(function (s) { svcById[s.id] = s; });
    var GO = '<svg class="go" viewBox="0 0 22 22" aria-hidden="true" focusable="false"><path d="M3 11h15M12 5l6 6-6 6"/></svg>';

    function priceFor(s, c) { if (s.priceTesco && c && c.tesco) return s.priceTesco; return s.price; }
    function priceHTML(p, was) { return (p === 0 ? 'Free' : gbp(p)) + (was ? '<small>usually ' + gbp(was) + '</small>' : ''); }
    function steps(n) {
      var labels = ['Service', 'Clinic', 'Price and book'];
      return '<ol class="steps">' + labels.map(function (l, i) {
        var cur = i + 1 === n ? ' aria-current="step"' : '';
        return '<li class="' + (i + 1 < n ? 'done' : '') + '"' + cur + '><b>' + (i + 1) + '</b>' + l + '</li>';
      }).join('') + '</ol>';
    }
    function render(step, focusSel) {
      var h = '';
      if (step === 1) {
        h = steps(1) + '<div class="svc-list">' + DATA.services.map(function (s) {
          var p = s.priceTesco ? '<small>' + gbp(s.priceTesco) + ' at Tesco Extra</small>' : (s.was ? '<small>usually ' + gbp(s.was) + '</small>' : '');
          return '<button type="button" class="svc-pick" data-svc="' + s.id + '" data-dept="' + s.dept + '"><span class="sr-only">' + (s.dept === 'gp' ? 'GP' : 'Dentist') + ': </span>' +
            '<span class="svc-name">' + s.name + '<small>' + s.len + '</small></span><span class="svc-price">' + (s.price === 0 ? 'Free' : gbp(s.price)) + p + '</span>' + GO + '</button>';
        }).join('') + '</div>';
      } else if (step === 2) {
        var s = svcById[state.svc];
        var list = DATA.clinics.filter(function (c) { return s.where === 'all' || c.dental; });
        var groups = s.where === 'all'
          ? [['On the high street, ' + gbp(s.price), list.filter(function (c) { return !c.tesco; })], ['Inside Tesco Extra, ' + gbp(s.priceTesco), list.filter(function (c) { return c.tesco; })]]
          : [['London clinics with a dentist', list]];
        h = steps(2) + '<div class="pane-title"><h3>Where would you like to go?</h3><button type="button" class="btn-text back" data-back="1">Change service</button></div>' +
          '<div class="clinic-pick" role="group" aria-label="Clinics for ' + esc(s.short) + '">' + groups.map(function (g) {
            return '<p class="grp">' + g[0] + '</p>' + g[1].map(function (c) {
              return c.soon
                ? '<button type="button" class="cp" disabled>' + esc(c.name) + '<span>Coming soon</span></button>'
                : '<button type="button" class="cp" data-clinic="' + c.id + '">' + esc(c.name) + '<span>' + priceHTML(priceFor(s, c)).replace(/<small>.*<\/small>/, '') + '</span></button>';
            }).join('');
          }).join('') + '</div>';
      } else {
        var sv = svcById[state.svc], c = state.clinic ? byId[state.clinic] : null, p = priceFor(sv, c);
        var online = sv.where === 'none';
        var where = c ? 'At ' + esc(c.name) + '. ' + esc(c.addr) : 'Online appointment.';
        h = steps(3) + '<div class="result"><div><p class="r-what">' + sv.name + '. ' + sv.len + '.</p>' +
          '<p class="r-where">' + where + '</p><p class="r-note">' + sv.note + '</p></div>' +
          '<p class="r-price">' + (p === 0 ? 'Free' : gbp(p)) + (sv.was ? '<small>usually ' + gbp(sv.was) + '</small>' : '') + '</p></div>' +
          '<div class="result-act">' + (online
            ? '<a class="btn btn-book" href="tel:' + DATA.phone.tel + '">Call to book' + ARROW + '<span class="sr-only"> an online GP appointment on ' + DATA.phone.label + '</span></a><span>' + DATA.phone.label + '</span>'
            : '<a class="btn btn-book" href="' + DATA.book[sv.link] + '" target="_blank" rel="noopener noreferrer">Book ' + (p === 0 ? 'free ' : '') + 'appointment' + ARROW + NEWTAB + '</a>' +
              '<a href="tel:' + DATA.phone.tel + '">Or call ' + DATA.phone.label + '</a>') +
          '<button type="button" class="btn-text back" data-back="' + (sv.where === 'none' ? 1 : 2) + '">' + (sv.where === 'none' ? 'Change service' : 'Change clinic') + '</button>' +
          (c ? '<p class="tip">The booking page opens in a new tab. Choose ' + esc(c.name) + ' as your clinic there.</p>' : '') + '</div>';
      }
      body.innerHTML = h;
      body.setAttribute('data-step', step);
      var f = focusSel ? $(focusSel, body) : null;
      if (f) f.focus();
      // light up eligible clinics on the map while choosing
      pts.forEach(function (pt) { pt.classList.remove('is-dim'); });
    }
    onSelect = function (id) {
      if (!state.svc || !state.clinic || state.clinic === id) return;
      var sv = svcById[state.svc], c = byId[id];
      if (c && !c.soon && (sv.where === 'all' || c.dental)) { state.clinic = id; render(3); }
      else { state.clinic = null; render(2); }
    };
    onClear = function () {
      if (!state.svc || !state.clinic) return;
      state.clinic = null; render(2);
    };
    body.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-svc')) {
        state.svc = b.getAttribute('data-svc'); state.clinic = null;
        var s = svcById[state.svc];
        if (s.where === 'none') render(3, '.result-act .btn');
        else {
          if (selected && byId[selected] && !byId[selected].soon && (s.where === 'all' || byId[selected].dental)) { state.clinic = selected; render(3, '.result-act .btn'); }
          else render(2, '.cp:not([disabled])');
        }
      } else if (b.hasAttribute('data-clinic')) {
        state.clinic = b.getAttribute('data-clinic'); select(state.clinic); rovingReset(); render(3, '.result-act .btn');
      } else if (b.hasAttribute('data-back')) {
        var to = +b.getAttribute('data-back');
        render(to, to === 1 ? '.svc-pick[data-svc="' + state.svc + '"]' : '.cp:not([disabled])');
      }
    });
    render(1);
  }

  /* ===== Implant explorer ===== */
  var chart = $('.chart');
  if (chart) {
    chart.setAttribute('role', 'group');
    chart.setAttribute('aria-label', 'Dental chart with 28 teeth. Choose the teeth you want to replace. Use the arrow keys to move and Space to choose.');
    $$('.tooth', chart).forEach(function (t, i) { t.setAttribute('role', 'button'); t.setAttribute('tabindex', i === 6 ? '0' : '-1'); t.setAttribute('aria-pressed', 'false'); t.setAttribute('aria-label', t.getAttribute('data-label')); });
    var teeth = $$('.tooth', chart), totalEl = $('#est-total'), countEl = $('#est-count'), noteEl = $('#est-note');
    var ARCH = 9995;
    function tier() { var r = $('input[name="tier"]:checked'); return { p: +r.value, n: r.getAttribute('data-name') }; }
    function update() {
      var on = teeth.filter(function (t) { return t.getAttribute('aria-pressed') === 'true'; });
      var up = on.filter(function (t) { return t.getAttribute('data-jaw') === 'upper'; }).length, lo = on.length - up, tr = tier();
      totalEl.textContent = gbp(on.length * tr.p);
      countEl.textContent = on.length ? on.length + (on.length === 1 ? ' tooth' : ' teeth') + ' (' + up + ' upper, ' + lo + ' lower), ' + tr.n + ' at ' + gbp(tr.p) + ' each' : 'No teeth chosen yet';
      var heavy = [['upper', up], ['lower', lo]].filter(function (j) { return j[1] * tr.p > ARCH; });
      var perJaw = function (j) { return gbp(j[1] * tr.p); };
      noteEl.textContent = !on.length ? 'Choose teeth on the chart to see a list-price total.'
        : heavy.length === 2 ? 'Your selected implants cost ' + (up === lo ? perJaw(heavy[0]) + ' per jaw' : perJaw(heavy[0]) + ' for the upper jaw and ' + perJaw(heavy[1]) + ' for the lower jaw') + ' at list price. All-on-4 is listed at ' + gbp(ARCH) + ' per jaw. Ask your dentist to explain the treatment options.'
        : heavy.length ? 'At list price, ' + heavy[0][1] + ' ' + tr.n + ' implants in your ' + heavy[0][0] + ' jaw cost more than All-on-4 for a whole jaw (£9,995). Ask which suits you at the free consultation.'
        : 'List price before any offer. Your dentist confirms the plan and price at the free consultation.';
    }
    teeth.forEach(function (t, i) {
      var toggle = function () { t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); teeth.forEach(function (x) { x.setAttribute('tabindex', x === t ? '0' : '-1'); }); update(); };
      t.addEventListener('click', toggle);
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = teeth[(i + 1) % teeth.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = teeth[(i - 1 + teeth.length) % teeth.length];
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); return; }
        if (n) { e.preventDefault(); t.setAttribute('tabindex', '-1'); n.setAttribute('tabindex', '0'); n.focus(); }
      });
    });
    $$('input[name="tier"]').forEach(function (r) { r.addEventListener('change', update); });
    var clr = $('#teeth-clear');
    if (clr) clr.addEventListener('click', function () { teeth.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); }); update(); });
    update();
  }

  if (DATA) apply();
})();
