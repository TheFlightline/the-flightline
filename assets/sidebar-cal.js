// ─── SIDEBAR CALENDAR ────────────────────────────────────────────────────────
// Paste this block into app.js just before function calInit()
// Depends on: TODAY, CAL_EVENTS, CAL_CATS, MONTH_NAMES (already declared in app.js)
// CAL_EVENTS format: { day, month, year, title, time, venue, cat, key, url }

var sideCalYear  = TODAY.getFullYear();
var sideCalMonth = TODAY.getMonth(); // 0-indexed
var sideCalSelDay = null; // "YYYY-MM-DD"

// ── helpers ──────────────────────────────────────────────────────────────────

function sideCalDateKey(y, m, d) {
  return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

function sideCalEventsForDay(key) {
  // key is "YYYY-MM-DD"; events store day/month/year integers (month is 1-indexed)
  var parts = key.split('-');
  var y = parseInt(parts[0]);
  var m = parseInt(parts[1]);
  var d = parseInt(parts[2]);
  return CAL_EVENTS.filter(function(e) {
    return e.year === y && e.month === m && e.day === d;
  });
}

function sideCalUpcoming(n) {
  var now = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  return CAL_EVENTS
    .filter(function(e) {
      var evDate = new Date(e.year, e.month - 1, e.day);
      return evDate >= now;
    })
    .sort(function(a, b) {
      var da = new Date(a.year, a.month - 1, a.day);
      var db = new Date(b.year, b.month - 1, b.day);
      return da - db;
    })
    .slice(0, n || 5);
}

function sideCalCatColor(cat) {
  return (CAL_CATS[cat] && CAL_CATS[cat].color) ? CAL_CATS[cat].color : '#999';
}

function sideCalFormatDate(e) {
  var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return { month: months[e.month - 1], day: String(e.day) };
}

// ── render ────────────────────────────────────────────────────────────────────

function renderSideCal() {
  var label = document.getElementById('side-cal-label');
  var grid  = document.getElementById('side-cal-grid');
  var list  = document.getElementById('side-cal-list');
  if (!label || !grid || !list) { return; }

  label.textContent = MONTH_NAMES[sideCalMonth].toUpperCase() + ' ' + sideCalYear;

  var firstDay    = new Date(sideCalYear, sideCalMonth, 1).getDay();
  var daysInMonth = new Date(sideCalYear, sideCalMonth + 1, 0).getDate();
  var html = '';

  for (var b = 0; b < firstDay; b++) {
    html += '<div style="height:32px;"></div>';
  }

  for (var d = 1; d <= daysInMonth; d++) {
    var key     = sideCalDateKey(sideCalYear, sideCalMonth, d);
    var dayEvts = sideCalEventsForDay(key);
    var isToday = (sideCalYear === TODAY.getFullYear() &&
                   sideCalMonth === TODAY.getMonth() &&
                   d === TODAY.getDate());
    var isSel   = (key === sideCalSelDay);
    var hasDots = dayEvts.length > 0;

    var cellBg     = isSel ? 'var(--navy)' : isToday ? 'var(--gold)' : 'transparent';
    var cellColor  = (isSel || isToday) ? '#fff' : 'var(--navy)';
    var cellBorder = isSel ? '2px solid var(--navy)' : '2px solid transparent';

    html += '<div data-eid="' + key + '" style="' +
      'display:flex;flex-direction:column;align-items:center;justify-content:flex-start;' +
      'height:32px;padding-top:3px;cursor:' + (hasDots ? 'pointer' : 'default') + ';' +
      'background:' + cellBg + ';border:' + cellBorder + ';' +
      'border-radius:3px;transition:background .12s;">';

    html += '<span style="font-size:11px;font-weight:' + (isToday || isSel ? '700' : '400') +
      ';line-height:1.1;color:' + cellColor + ';">' + d + '</span>';

    if (hasDots) {
      html += '<span style="display:flex;gap:2px;margin-top:1px;">';
      var dotEvts = dayEvts.slice(0, 3);
      for (var di = 0; di < dotEvts.length; di++) {
        var dotColor = (isSel || isToday) ? 'rgba(255,255,255,0.85)' : sideCalCatColor(dotEvts[di].cat);
        html += '<span style="width:4px;height:4px;border-radius:50%;background:' + dotColor + ';display:inline-block;"></span>';
      }
      html += '</span>';
    }
    html += '</div>';
  }

  grid.innerHTML = html;

  grid.onclick = function(e) {
    var cell = e.target;
    while (cell && cell !== grid) {
      if (cell.dataset && cell.dataset.eid) { break; }
      cell = cell.parentNode;
    }
    if (!cell || !cell.dataset || !cell.dataset.eid) { return; }
    var clickedKey  = cell.dataset.eid;
    var clickedEvts = sideCalEventsForDay(clickedKey);
    if (!clickedEvts.length) { return; }
    sideCalSelDay = (sideCalSelDay === clickedKey) ? null : clickedKey;
    sideCalSelectDay(sideCalSelDay, clickedEvts);
    renderSideCal();
  };

  renderSideCalList();

  var prevBtn = document.getElementById('side-cal-prev');
  var nextBtn = document.getElementById('side-cal-next');
  if (prevBtn) { prevBtn.onclick = function() { sideCalNav(-1); }; }
  if (nextBtn) { nextBtn.onclick = function() { sideCalNav(1); }; }

  var vaBtn = document.getElementById('side-cal-view-all');
  if (vaBtn) {
    vaBtn.onmouseenter = function() { this.style.background = 'var(--navy)'; this.style.color = '#fff'; };
    vaBtn.onmouseleave = function() { this.style.background = 'none'; this.style.color = 'var(--navy)'; };
    vaBtn.onclick = function() { goPage('community-calendar'); };
  }
}

function sideCalSelectDay(key, evts) {
  var panel = document.getElementById('side-cal-day-events');
  if (!panel) { return; }

  if (!key || !evts || !evts.length) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  var parts = key.split('-');
  var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var heading  = dayNames[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();

  var html = '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:11px;letter-spacing:.05em;color:var(--g2);margin-bottom:5px;">' +
    heading.toUpperCase() + '</div>';

  for (var i = 0; i < evts.length; i++) {
    var ev      = evts[i];
    var color   = sideCalCatColor(ev.cat);
    var isLink  = ev.key || ev.url;
    var dataAttr = ev.key ? ('data-ekey="' + ev.key + '"') : (ev.url ? ('data-url="' + ev.url + '"') : '');

    html += '<div ' + dataAttr + ' style="' +
      'display:flex;align-items:flex-start;gap:6px;padding:4px 0;' +
      'border-top:1px solid var(--bd);cursor:' + (isLink ? 'pointer' : 'default') + ';">';
    html += '<span style="flex-shrink:0;width:3px;min-height:32px;background:' + color + ';border-radius:1px;margin-top:2px;"></span>';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:11px;font-weight:600;color:var(--navy);line-height:1.25;' +
      (isLink ? 'text-decoration:underline;text-decoration-color:' + color + ';text-underline-offset:2px;' : '') +
      '">' + ev.title + '</div>';
    var meta = [];
    if (ev.time)  { meta.push(ev.time); }
    if (ev.venue) { meta.push(ev.venue); }
    if (meta.length) {
      html += '<div style="font-size:10px;color:var(--g2);line-height:1.3;margin-top:1px;">' + meta.join(' \u00b7 ') + '</div>';
    }
    html += '</div></div>';
  }

  panel.innerHTML = html;
  panel.style.display = 'block';

  panel.onclick = function(e) {
    var node = e.target;
    while (node && node !== panel) {
      if (node.dataset && (node.dataset.ekey || node.dataset.url)) { break; }
      node = node.parentNode;
    }
    if (!node || node === panel) { return; }
    if (node.dataset.ekey) {
      openArticle(node.dataset.ekey);
    } else if (node.dataset.url) {
      window.open(node.dataset.url, '_blank');
    }
  };
}

function renderSideCalList() {
  const list = document.getElementById('side-cal-list');
  if (!list) return;
  const upcoming = sideCalUpcoming();
  if (!upcoming.length) {
    list.innerHTML = '<div style="font-size:11px;color:var(--g2);margin:0 0 8px;">No events listed for the next two weeks.</div>';
    list.onclick = null;
    return;
  }
  list.innerHTML = upcoming.slice(0, 5).map(e => {
    const monthAbbr = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][e.month] || '';
    const color = e.color || '#1E2D4A';
    const hasModal = typeof EVENTS !== 'undefined' && EVENTS[e.id];
    const isLink = hasModal || e.key || e.url;
    
    let dataAttrs = '';
    if (hasModal) {
      dataAttrs = ' data-eid="' + (e.id || '').replace(/"/g, '&quot;') + '"';
    } else if (e.key) {
      dataAttrs = ' data-ekey="' + e.key.replace(/"/g, '&quot;') + '"';
    } else if (e.url) {
      dataAttrs = ' data-url="' + e.url.replace(/"/g, '&quot;') + '"'
        + ' data-title="' + (e.title || '').replace(/"/g, '&quot;') + '"'
        + ' data-time="' + (e.time || '').replace(/"/g, '&quot;') + '"'
        + ' data-venue="' + (e.venue || '').replace(/"/g, '&quot;') + '"'
        + ' data-color="' + color.replace(/"/g, '&quot;') + '"'
        + ' data-cat="' + (e.cat || 'Event').replace(/"/g, '&quot;') + '"'
        + ' data-day="' + e.day + '"'
        + ' data-month="' + e.month + '"'
        + ' data-year="' + e.year + '"';
    }
    
    return '<div class="event-item"' + dataAttrs + ' style="display:flex;gap:8px;padding:5px 0;border-top:1px solid var(--bd);cursor:' + (isLink ? 'pointer' : 'default') + ';">'
      + '<div class="event-date-box" style="flex-shrink:0;width:30px;text-align:center;border-top:2px solid ' + color + ';">'
      + '<div class="event-date-month" style="font-size:8px;font-weight:700;color:' + color + ';text-transform:uppercase;letter-spacing:.04em;">' + monthAbbr + '</div>'
      + '<div class="event-date-num" style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;color:var(--navy);line-height:1;">' + e.day + '</div>'
      + '</div>'
      + '<div style="flex:1;min-width:0;">'
      + '<div class="event-title" style="font-size:11px;font-weight:600;color:var(--navy);line-height:1.3;">' + (e.title || '') + '</div>'
      + '<div class="event-meta" style="font-size:10px;color:var(--g2);line-height:1.3;margin-top:2px;">' + (e.time || '') + (e.venue ? ' · ' + e.venue : '') + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
  
  list.onclick = function(ev) {
    const node = ev.target.closest('.event-item');
    if (!node) return;
    if (node.dataset.eid && typeof openEvent === 'function') {
      openEvent(node.dataset.eid);
    } else if (node.dataset.ekey && typeof openArticle === 'function') {
      openArticle(node.dataset.ekey);
    } else if (node.dataset.url && typeof openEventInline === 'function') {
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const d = parseInt(node.dataset.day, 10);
      const m = parseInt(node.dataset.month, 10);
      const y = parseInt(node.dataset.year, 10);
      let dateStr = '';
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        const obj = new Date(y, m, d);
        dateStr = dayNames[obj.getDay()] + ', ' + monthNames[m] + ' ' + d + ', ' + y;
      }
      const cat = node.dataset.cat || 'Event';
      const labelTitle = cat.charAt(0).toUpperCase() + cat.slice(1);
      openEventInline(
        node.dataset.title || '',
        dateStr,
        node.dataset.time || '',
        node.dataset.venue || '',
        node.dataset.url || '',
        node.dataset.color || '',
        labelTitle
      );
    } else if (node.dataset.url) {
      window.open(node.dataset.url, '_blank', 'noopener,noreferrer');
    }
  };
}