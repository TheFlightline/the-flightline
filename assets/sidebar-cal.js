// ─── SIDEBAR CALENDAR ────────────────────────────────────────────────────────
// Paste this block into app.js just before function calInit()
// Depends on: TODAY, CAL_EVENTS, CAL_CATS, MONTH_NAMES (already declared in app.js)

var sideCalYear  = TODAY.getFullYear();
var sideCalMonth = TODAY.getMonth(); // 0-indexed
var sideCalSelDay = null; // currently selected date string "YYYY-MM-DD"

// ── helpers ──────────────────────────────────────────────────────────────────

function sideCalDateKey(y, m, d) {
  // Returns zero-padded "YYYY-MM-DD"
  return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

function sideCalEventsForDay(key) {
  return CAL_EVENTS.filter(function(e) { return e.date === key; });
}

function sideCalUpcoming(n) {
  var todayKey = sideCalDateKey(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  return CAL_EVENTS
    .filter(function(e) { return e.date >= todayKey; })
    .sort(function(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; })
    .slice(0, n || 5);
}

function sideCalCatColor(cat) {
  return (CAL_CATS[cat] && CAL_CATS[cat].color) ? CAL_CATS[cat].color : '#999';
}

function sideCalFormatDate(dateStr) {
  // "YYYY-MM-DD" → { month: "APR", day: "24" }
  var parts = dateStr.split('-');
  var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return { month: months[d.getMonth()], day: String(d.getDate()) };
}

// ── render ────────────────────────────────────────────────────────────────────

function renderSideCal() {
  var label = document.getElementById('side-cal-label');
  var grid  = document.getElementById('side-cal-grid');
  var list  = document.getElementById('side-cal-list');
  if (!label || !grid || !list) { return; }

  // Header label
  label.textContent = MONTH_NAMES[sideCalMonth].toUpperCase() + ' ' + sideCalYear;

  // Build day-event index for this month
  var firstDay = new Date(sideCalYear, sideCalMonth, 1).getDay(); // 0=Sun
  var daysInMonth = new Date(sideCalYear, sideCalMonth + 1, 0).getDate();

  var html = '';

  // Leading blank cells
  for (var b = 0; b < firstDay; b++) {
    html += '<div style="height:32px;"></div>';
  }

  // Day cells
  for (var d = 1; d <= daysInMonth; d++) {
    var key     = sideCalDateKey(sideCalYear, sideCalMonth, d);
    var dayEvts = sideCalEventsForDay(key);
    var isToday = (sideCalYear === TODAY.getFullYear() &&
                   sideCalMonth === TODAY.getMonth() &&
                   d === TODAY.getDate());
    var isSel   = (key === sideCalSelDay);
    var hasDots = dayEvts.length > 0;

    var cellBg    = isSel   ? 'var(--navy)' : isToday ? 'var(--gold)' : 'transparent';
    var cellColor = (isSel || isToday) ? '#fff' : 'var(--navy)';
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

  // Attach single-handler event delegation on the grid
  grid.onclick = function(e) {
    var cell = e.target;
    // Walk up to the [data-eid] cell (dots are child spans)
    while (cell && cell !== grid) {
      if (cell.dataset && cell.dataset.eid) { break; }
      cell = cell.parentNode;
    }
    if (!cell || !cell.dataset || !cell.dataset.eid) { return; }
    var clickedKey = cell.dataset.eid;
    var clickedEvts = sideCalEventsForDay(clickedKey);
    if (!clickedEvts.length) { return; }
    sideCalSelDay = (sideCalSelDay === clickedKey) ? null : clickedKey;
    sideCalSelectDay(sideCalSelDay, clickedEvts);
    renderSideCal(); // re-render to update selection highlight
  };

  // Render upcoming list
  renderSideCalList();

  // Wire nav buttons (idempotent — replace each time)
  var prevBtn = document.getElementById('side-cal-prev');
  var nextBtn = document.getElementById('side-cal-next');
  if (prevBtn) { prevBtn.onclick = function() { sideCalNav(-1); }; }
  if (nextBtn) { nextBtn.onclick = function() { sideCalNav(1); }; }

  // Wire view-all button
  var vaBtn = document.getElementById('side-cal-view-all');
  if (vaBtn) {
    vaBtn.onmouseenter = function() {
      this.style.background = 'var(--navy)';
      this.style.color = '#fff';
    };
    vaBtn.onmouseleave = function() {
      this.style.background = 'none';
      this.style.color = 'var(--navy)';
    };
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
    var ev = evts[i];
    var color = sideCalCatColor(ev.cat);
    var isLink = ev.aid || ev.url;
    var dataAttr = ev.aid ? ('data-aid="' + ev.aid + '"') : (ev.url ? ('data-url="' + ev.url + '"') : '');

    html += '<div ' + dataAttr + ' style="' +
      'display:flex;align-items:flex-start;gap:6px;padding:4px 0;' +
      'border-top:1px solid var(--bd);cursor:' + (isLink ? 'pointer' : 'default') + ';">';

    html += '<span style="flex-shrink:0;width:3px;height:100%;min-height:32px;background:' + color + ';border-radius:1px;margin-top:2px;"></span>';

    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:11px;font-weight:600;color:var(--navy);line-height:1.25;' +
      (isLink ? 'text-decoration:underline;text-decoration-color:' + color + ';text-underline-offset:2px;' : '') +
      '">' + ev.title + '</div>';

    var meta = [];
    if (ev.time)  { meta.push(ev.time); }
    if (ev.venue) { meta.push(ev.venue); }
    if (meta.length) {
      html += '<div style="font-size:10px;color:var(--g2);line-height:1.3;margin-top:1px;">' + meta.join(' · ') + '</div>';
    }
    html += '</div></div>';
  }

  panel.innerHTML = html;
  panel.style.display = 'block';

  // Single delegation handler for day-event clicks
  panel.onclick = function(e) {
    var node = e.target;
    while (node && node !== panel) {
      if (node.dataset && (node.dataset.aid || node.dataset.url)) { break; }
      node = node.parentNode;
    }
    if (!node || node === panel) { return; }
    if (node.dataset.aid) {
      openArticle(node.dataset.aid);
    } else if (node.dataset.url) {
      window.open(node.dataset.url, '_blank');
    }
  };
}

function renderSideCalList() {
  var list = document.getElementById('side-cal-list');
  if (!list) { return; }
  var upcoming = sideCalUpcoming(5);

  if (!upcoming.length) {
    list.innerHTML = '<p style="font-size:11px;color:var(--g2);margin:0 0 8px;">No upcoming events.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < upcoming.length; i++) {
    var ev     = upcoming[i];
    var fd     = sideCalFormatDate(ev.date);
    var color  = sideCalCatColor(ev.cat);
    var isLink = ev.aid || ev.url;
    var dataAttr = ev.aid ? ('data-aid="' + ev.aid + '"') : (ev.url ? ('data-url="' + ev.url + '"') : '');

    html += '<div ' + dataAttr + ' class="event-item" style="display:flex;gap:8px;padding:5px 0;border-top:1px solid var(--bd);cursor:' + (isLink ? 'pointer' : 'default') + ';">';

    // Date badge
    html += '<div class="event-date-box" style="flex-shrink:0;width:30px;text-align:center;border-top:2px solid ' + color + ';">';
    html += '<div class="event-date-month" style="font-size:8px;font-weight:700;color:' + color + ';text-transform:uppercase;letter-spacing:.04em;">' + fd.month + '</div>';
    html += '<div class="event-date-num" style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;color:var(--navy);line-height:1;">' + fd.day + '</div>';
    html += '</div>';

    // Title + meta
    html += '<div style="flex:1;min-width:0;">';
    html += '<div class="event-title" style="font-size:11px;font-weight:600;color:var(--navy);line-height:1.3;">' + ev.title + '</div>';
    var meta = [];
    if (ev.time)  { meta.push(ev.time); }
    if (ev.venue) { meta.push(ev.venue); }
    if (meta.length) {
      html += '<div class="event-meta" style="font-size:10px;color:var(--g2);line-height:1.3;margin-top:2px;">' + meta.join(' · ') + '</div>';
    }
    html += '</div></div>';
  }

  list.innerHTML = html;

  // Single delegation handler
  list.onclick = function(e) {
    var node = e.target;
    while (node && node !== list) {
      if (node.dataset && (node.dataset.aid || node.dataset.url)) { break; }
      node = node.parentNode;
    }
    if (!node || node === list) { return; }
    if (node.dataset.aid) {
      openArticle(node.dataset.aid);
    } else if (node.dataset.url) {
      window.open(node.dataset.url, '_blank');
    }
  };
}

function sideCalNav(dir) {
  sideCalMonth += dir;
  if (sideCalMonth > 11) { sideCalMonth = 0; sideCalYear++; }
  if (sideCalMonth < 0)  { sideCalMonth = 11; sideCalYear--; }
  sideCalSelDay = null;
  var panel = document.getElementById('side-cal-day-events');
  if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
  renderSideCal();
}

document.addEventListener('DOMContentLoaded', renderSideCal);

// ─── END SIDEBAR CALENDAR ─────────────────────────────────────────────────────
