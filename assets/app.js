// ── ARTICLE DATA LOADER ─────────────────────────────────────────────────────
var A = window.A || {};
let articlesReady = false;
const articleReadyCallbacks = [];
function onArticlesReady(fn) {
  if (articlesReady) { fn(); } else { articleReadyCallbacks.push(fn); }
}



// ── PUB DATE HELPER — use key prefix not date field for sorting ───────────────
function pubDate(id) {
  if (!id) return new Date(0);
  var result;
  var m = id.match(/^(\d{4})(\d{2})(\d{2})/);
  if (m) { result = new Date(m[1]+'-'+m[2]+'-'+m[3]); }
  else if (A[id] && A[id].date) {
    var d = new Date(A[id].date);
    if (!isNaN(d.getTime())) result = d;
  }
  if (!result) return new Date(0);
  var today = new Date(); today.setHours(23,59,59,999);
  return result > today ? new Date(1) : result;
}

function autoTag(id, art) {
  if (art.tag) return art.tag;
  var text = ((art.headline || '') + ' ' + (art.dek || '') + ' ' + id + ' ' + (art.label || '')).toLowerCase();
  if (text.indexOf('gulf breeze') > -1 || text.indexOf('gulf-breeze') > -1 || text.indexOf('gulfbreeze') > -1) return 'gulfbreeze';
  if (text.indexOf('pensacola beach') > -1 || text.indexOf('perdido') > -1 || text.indexOf('beach blvd') > -1 || text.indexOf('beach nourishment') > -1 || text.indexOf('casino beach') > -1 || text.indexOf('fort pickens') > -1) return 'beach';
  if (text.indexOf('escambia county') > -1 || text.indexOf('escambia commission') > -1 || text.indexOf('county commission') > -1 || text.indexOf('molino') > -1 || text.indexOf('cantonment') > -1 || text.indexOf('century') > -1 || text.indexOf('warrington') > -1 || text.indexOf('brent') > -1 || text.indexOf('bellview') > -1 || text.indexOf('gonzalez') > -1 || text.indexOf('ensley') > -1 || text.indexOf('myrtle grove') > -1) return 'escambia';
  if (text.indexOf('downtown') > -1 || text.indexOf('palafox') > -1 || text.indexOf('garden street') > -1 || text.indexOf('bayfront') > -1 || text.indexOf('bay center') > -1 || text.indexOf('saenger') > -1 || text.indexOf('maritime park') > -1 || text.indexOf('community maritime') > -1 || text.indexOf('gallery night') > -1 || text.indexOf('vinyl music') > -1 || text.indexOf('fish house') > -1 || text.indexOf('alcaniz') > -1 || text.indexOf('intendencia') > -1) return 'downtown';
  return 'pensacola';
}

// ─────────────────────────────────────────────────────────────────────────────
const CAT_DISPLAY={govt:"Government",government:"Government",dev:"Business",development:"Business",business:"Business",military:"Military",news:"News",education:"Education",sports:"Sports",events:"Events",opinion:"Opinion",environment:"Environment",tourism:"Tourism",traffic:"Traffic",community:"Community"};
function catDisplay(c){return CAT_DISPLAY[c]||(c.charAt(0).toUpperCase()+c.slice(1));}

// ── HOME SECTION UNIFIED PHOTO-GRID RENDER ───────────────────────────────────
const HOME_SECTION_CATS = [
  { id: 'news',             cat: 'govt',     label: 'Government',                nbhdFilter: true },
  { id: 'development',      cat: 'dev',      label: 'Business & Development',    nbhdFilter: true },
  { id: 'military',         cat: 'military', label: 'Military & NAS Pensacola',  nbhdFilter: true },
  { id: 'sports',           cat: 'sports',   label: 'Sports',                    nbhdFilter: true },
  { id: 'opinion-section',  cat: 'opinion',  label: 'Opinion & Analysis',        nbhdFilter: true },
];

const HOME_PHOTOS = {
  govt:        ['/images/downtown_pensacola-aerial-downtown_003.jpg', '/images/editorial_gavel_005.jpg', '/images/govt_public-hearing_009.jpg'],
  government:  ['/images/downtown_pensacola-aerial-downtown_003.jpg', '/images/editorial_gavel_005.jpg', '/images/govt_public-hearing_009.jpg'],
  dev:         ['/images/development_construction-crane_001.jpg', '/images/development_road-work_002.jpg', '/images/development_scaffolding_003.jpg'],
  development: ['/images/development_construction-crane_001.jpg', '/images/development_road-work_002.jpg', '/images/downtown_pensacola-aerial-downtown_003.jpg'],
  military:    ['/images/military_blue-angels_001.jpg', '/images/military_nas_002.jpg', '/images/military_aircraft_003.jpg'],
  news:        ['/images/downtown_palafox-street-clock_007.jpg', '/images/downtown_waterfront_004.jpg', '/images/editorial_press_001.jpg'],
  education:   ['/images/education_uwf_001.jpg', '/images/education_campus_003.jpg', '/images/community_park_003.jpg'],
  sports:      ['/images/sports_wahoos_001.jpg', '/images/sports_stadium_002.jpg', '/images/community_park_003.jpg'],
  events:      ['/images/downtown_palafox-street-dusk_008.jpg', '/images/community_park_003.jpg', '/images/downtown_waterfront_004.jpg'],
  opinion:     ['/images/editorial_press_001.jpg', '/images/editorial_gavel_005.jpg', '/images/downtown_pensacola-aerial-downtown_003.jpg'],
  environment: ['/images/community_park_003.jpg', '/images/downtown_waterfront_004.jpg', '/images/editorial_press_001.jpg'],
  tourism:     ['/images/downtown_waterfront_004.jpg', '/images/downtown_palafox-street-dusk_008.jpg', '/images/community_park_003.jpg'],
  traffic:     ['/images/development_road-work_002.jpg', '/images/development_construction-crane_001.jpg', '/images/downtown_pensacola-aerial-downtown_003.jpg'],
  community:   ['/images/community_park_003.jpg', '/images/downtown_palafox-street-clock_007.jpg', '/images/downtown_waterfront_004.jpg'],
};

function homeCardImg(id, art) {
  if (art.thumbnail) {
    return '<img src="' + art.thumbnail + '" alt="' + art.cat + '" style="width:100%;height:100%;object-fit:cover;">';
  }
  var pool = HOME_PHOTOS[art.cat] || HOME_PHOTOS.news;
  var idx = Math.abs(id.split('').reduce(function(a, c) { return a + c.charCodeAt(0); }, 0)) % pool.length;
  return '<img src="' + pool[idx] + '" alt="' + art.cat + '" style="width:100%;height:100%;object-fit:cover;">';
}

function homeNbhd(id, art) {
  var KNOWN = {
    '20260402-escambia-commission-clerk-childers': 'downtown',
    '20260402-warringtons-damaged-hotel-gets': 'warrington',
    '20260404-sunshine-escambia-county-pensacolas': 'downtown',
    '20260327-city-council-awards-78m': 'downtown',
    '20260116-escambia-zoning-scam-warning': 'downtown',
    '20260401-flight-line-access-restored': 'nas',
    '20260402-nas-pensacola-family-housing': 'nas',
    '20260401-blue-wahoos-complete-ballpark': 'downtown',
  };
  if (KNOWN[id]) return KNOWN[id];
  if (art.cat === 'military') return 'nas';
  if (art.label && art.label.indexOf('Gulf Breeze') > -1) return 'gulf-breeze';
  if (art.label && art.label.indexOf('Pensacola Beach') > -1) return 'perdido-key';
  if (art.label && art.label.indexOf('Warrington') > -1) return 'warrington';
  if (art.label && art.label.indexOf('East Hill') > -1) return 'east-hill';
  return 'downtown';
}

function buildSection(sectionId, cat, nbhdFilter) {
  var el = document.getElementById(sectionId);
  if (!el) return;

  var articles = Object.entries(A)
    .filter(function(e) { return e[1].cat === cat; })
    .sort(function(a, b) { return pubDate(b[0]) - pubDate(a[0]); })
    .slice(0, 3);

  if (!articles.length) return;

  var sectionLabel = el.querySelector('.section-label');
  var labelHtml = sectionLabel ? sectionLabel.outerHTML : '';

  var nbhdHtml = '';
  if (nbhdFilter) {
    var tags = [['all','All'],['pensacola','Pensacola'],['downtown','Downtown'],['escambia','Escambia County'],['beach','Pensacola Beach'],['gulfbreeze','Gulf Breeze']];
    nbhdHtml = '<div class="tag-filters" data-section="' + sectionId + '" style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;">';
    for (var n = 0; n < tags.length; n++) {
      nbhdHtml += '<button class="nbhd-btn' + (tags[n][0] === 'all' ? ' active' : '') + '" data-tag="' + tags[n][0] + '" onclick="filterTag(\'' + sectionId + '\',\'' + tags[n][0] + '\',this)">' + tags[n][1] + '</button>';
    }
    nbhdHtml += '</div>';
  }

  var cards = '';
  for (var i = 0; i < articles.length; i++) {
    var id = articles[i][0];
    var art = articles[i][1];
    var tag = autoTag(id, art);
    var cls = 'story-card' + (i === 0 ? ' gold-top' : '');
    cards += '<div class="' + cls + '" data-tag="' + tag + '" onclick="openArticle(\'' + id + '\')">';
    cards += '<div class="story-card-img">' + homeCardImg(id, art) + '</div>';
    cards += '<span class="cat-badge cat-' + art.cat + '">' + catDisplay(art.cat) + '</span>';
    cards += '<div class="headline-md">' + art.headline + '</div>';
    cards += '<div class="dek-sm">' + (art.dek || '') + '</div>';
    cards += '<div class="byline">' + art.date + '</div>';
    cards += '</div>';
  }

  el.innerHTML = labelHtml + nbhdHtml + '<div class="three-col">' + cards + '</div>';
}

function buildHomeFeed() {
  for (var s = 0; s < HOME_SECTION_CATS.length; s++) {
    var sec = HOME_SECTION_CATS[s];
    buildSection(sec.id, sec.cat, sec.nbhdFilter);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

function renderMobileLatest() {
  var el = document.getElementById('mobile-latest-list');
  if (!el) return;
  // Sort by key date prefix descending (keys start with YYYYMMDD-)
  var sorted = Object.keys(A).sort(function(a,b){ return pubDate(b) - pubDate(a); });
  var top3 = sorted.slice(0, 3);
  el.innerHTML = top3.map(function(id) {
    var art = A[id];
    var cat = art.label || '';
    var date = art.date || '';
    var meta = [cat, date].filter(Boolean).join(' · ');
    return '<div class="mob-latest-item" onclick="event.stopPropagation();openArticle(\'' + id + '\')">'
      + '<div class="mob-latest-hed">' + art.headline + '</div>'
      + (meta ? '<div class="mob-latest-meta">' + meta + '</div>' : '')
      + '</div>';
  }).join('');
}


// articles.js loaded synchronously via <script> tag — boot immediately
articlesReady = true;
articleReadyCallbacks.forEach(fn => fn());
buildHomeFeed();
setTimeout(buildHomeFeed, 300);
renderMobileLatest();
function updateBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const modal = document.getElementById('modal');
  const modalOpen = modal && modal.classList.contains('open');
  const scrollY = modalOpen ? modal.scrollTop : window.scrollY;
  const show = scrollY > 300;
  btn.style.display = show ? 'flex' : 'none';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
}
window.addEventListener('scroll', updateBackToTop);
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modal');
  if (modal) modal.addEventListener('scroll', updateBackToTop);
});

// Category labels map
const CAT_META = {
  news:      { label:'News',                    color:'var(--cat-news)' },
  govt:      { label:'Government',              color:'var(--cat-govt)' },
  dev:       { label:'Business & Development',  color:'var(--cat-dev)' },
  business:  { label:'Business & Development',  color:'var(--cat-dev)' },
  opinion:   { label:'Opinion & Analysis',      color:'var(--cat-opinion)' },
  events:    { label:'Events',                  color:'var(--cat-events)' },
  military:  { label:'Military',                color:'var(--cat-military)' },
  education: { label:'Education',               color:'var(--cat-education)' },
  sports:    { label:'Sports',                  color:'var(--cat-sports)' },
};

function openWeather() {
  document.getElementById('weather-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  populateWeatherModal();
}
function closeWeather() {
  document.getElementById('weather-modal').classList.remove('open');
  document.body.style.overflow = '';
}

async function populateWeatherModal() {
  const WMO = {
    0:'Clear',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',
    45:'Foggy',48:'Icy Fog',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',
    61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',
    80:'Showers',81:'Heavy Showers',82:'Violent Showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'
  };
  const WMO_ICON = {
    0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',51:'🌦',53:'🌧',55:'🌧',
    61:'🌦',63:'🌧',65:'⛈',71:'🌨',73:'❄️',75:'❄️',80:'🌦',81:'🌧',82:'⛈',
    95:'⛈',96:'⛈',99:'⛈'
  };
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const fmt = t => Math.round(t * 9/5 + 32);
  const icon = c => WMO_ICON[c] || '🌡';
  const desc = c => WMO[c] || 'Unknown';
  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=30.4213&longitude=-87.2169' +
      '&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,relativehumidity_2m,apparent_temperature,surface_pressure,visibility' +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max' +
      '&temperature_unit=celsius&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=7';
    const res = await fetch(url);
    const d = await res.json();
    const c = d.current;
    const daily = d.daily;

    const windDirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const windDir = windDirs[Math.round(c.winddirection_10m / 22.5) % 16];
    const dewPoint = Math.round((c.temperature_2m - ((100 - c.relativehumidity_2m) / 5)) * 9/5 + 32);
    const pressureIn = (c.surface_pressure * 0.02953).toFixed(2);

    const forecastHTML = daily.time.map((t, i) => {
      const date = new Date(t + 'T12:00:00');
      const day = DAYS[date.getDay()];
      const pop = daily.precipitation_probability_max[i];
      const isToday = i === 0;
      return `<div class="weather-day${isToday ? ' today-col' : ''}">
        <div class="weather-day-name">${day}</div>
        <div class="weather-day-icon">${icon(daily.weathercode[i])}</div>
        <div class="weather-day-hi">${fmt(daily.temperature_2m_max[i])}°</div>
        <div class="weather-day-lo">${fmt(daily.temperature_2m_min[i])}°</div>
        ${pop > 20 ? `<div class="weather-day-pop">💧${pop}%</div>` : ''}
      </div>`;
    }).join('');

    document.getElementById('weather-modal-content').innerHTML = `
      <div class="weather-modal-header">
        <button class="weather-modal-close" onclick="closeWeather()">✕</button>
        <div class="weather-modal-location">📍 Pensacola, FL · ${dateLabel}</div>
        <div class="weather-modal-current">
          <div class="weather-modal-temp">${fmt(c.temperature_2m)}°</div>
          <div class="weather-modal-current-detail">
            <div class="weather-modal-condition">${icon(c.weathercode)} ${desc(c.weathercode)}</div>
            <div class="weather-modal-feel">Feels like ${fmt(c.apparent_temperature)}° · Wind ${windDir} ${Math.round(c.windspeed_10m)} mph</div>
          </div>
        </div>
        <div class="weather-modal-stats">
          <div class="weather-stat"><div class="weather-stat-label">High</div><div class="weather-stat-val">${fmt(daily.temperature_2m_max[0])}°</div></div>
          <div class="weather-stat"><div class="weather-stat-label">Low</div><div class="weather-stat-val">${fmt(daily.temperature_2m_min[0])}°</div></div>
          <div class="weather-stat"><div class="weather-stat-label">Humidity</div><div class="weather-stat-val">${c.relativehumidity_2m}%</div></div>
          <div class="weather-stat"><div class="weather-stat-label">Wind</div><div class="weather-stat-val">${windDir} ${Math.round(c.windspeed_10m)}</div></div>
          <div class="weather-stat"><div class="weather-stat-label">UV Index</div><div class="weather-stat-val">${daily.uv_index_max[0]?.toFixed(0) || '--'}</div></div>
          <div class="weather-stat"><div class="weather-stat-label">Dew Point</div><div class="weather-stat-val">${dewPoint}°</div></div>
          <div class="weather-stat"><div class="weather-stat-label">Pressure</div><div class="weather-stat-val">${pressureIn}"</div></div>
          <div class="weather-stat"><div class="weather-stat-label">Rain Chance</div><div class="weather-stat-val">${daily.precipitation_probability_max[0]}%</div></div>
        </div>
      </div>
      <div class="weather-modal-body">
        <div class="weather-forecast-label">7-Day Forecast</div>
        <div class="weather-forecast-grid">${forecastHTML}</div>
      </div>
      <div class="weather-modal-footer">
        <span>Source: Open-Meteo · Updated ${now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span>
        <a href="https://forecast.weather.gov/MapClick.php?CityName=Pensacola&state=FL&site=MOB&textField1=30.4213&textField2=-87.2169" target="_blank" rel="noopener">NWS Forecast ↗</a>
      </div>`;
  } catch(e) {
    document.getElementById('weather-modal-content').innerHTML = `
      <div class="weather-modal-header">
        <button class="weather-modal-close" onclick="closeWeather()">✕</button>
        <div class="weather-modal-location">📍 Pensacola, FL</div>
        <div style="color:rgba(255,255,255,0.5);padding:20px 0;font-size:13px;">Weather data unavailable. <a href="https://forecast.weather.gov" target="_blank" style="color:var(--gold);">Check NWS ↗</a></div>
      </div>`;
  }
}

const ALL_STATIC_PAGES = ['subscribe','newsletter','about','our-mission','letters','community-calendar','tips','advertise','privacy','terms','contact'];

// ── PAY PAGE NAVIGATION ──────────────────────────────────────
function goPage(page) {
  document.getElementById('page-home').classList.add('hidden');
  document.getElementById('page-cat').classList.remove('active');
  document.getElementById('page-search').classList.remove('active');
  ALL_STATIC_PAGES.forEach(p => { const el = document.getElementById('page-'+p); if (el) el.classList.remove('active'); });
  const payPage = document.getElementById('page-pay');
  if (payPage) payPage.classList.remove('active');
  const target = document.getElementById('page-'+page);
  if (target) target.classList.add('active');
  document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById('nav-'+page);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0,0);
  if (page === 'community-calendar') setTimeout(calInit, 0);
  if (page === 'pay') setTimeout(initPayCharts, 0);
}

function goCategory(cat, page) {
  const meta = CAT_META[cat] || { label: cat, color:'var(--navy)' };
  const matches = Object.entries(A).filter(([id, a]) => a.cat === cat).sort((a,b) => pubDate(b[0]) - pubDate(a[0]));
  if (!matches.length) return;

  document.getElementById('cat-page-title').textContent = meta.label;
  document.getElementById('cat-page-sub').textContent = matches.length + ' ' + (matches.length === 1 ? 'story' : 'stories');

  const catPhotos = {
    news: ['/images/downtown_pensacola-aerial-downtown_003.jpg','/images/downtown_palafox-street-clock_007.jpg','/images/community_park_003.jpg','/images/downtown_waterfront_004.jpg','/images/editorial_press_001.jpg'],
    govt: ['/images/editorial_gavel_005.jpg','/images/govt_office_007.jpg','/images/govt_public-hearing_009.jpg','/images/govt_police_003.jpg','/images/editorial_voting_010.jpg'],
    dev:  ['/images/development_construction-crane_001.jpg','/images/development_road-work_002.jpg','/images/development_scaffolding_003.jpg','/images/development_commercial_007.jpg','/images/development_concrete_009.jpg'],
    opinion: ['/images/editorial_writing_007.jpg','/images/editorial_press_001.jpg','/images/editorial_podium_002.jpg','/images/editorial_surveillance_009.jpg','/images/editorial_gavel_005.jpg'],
    events: ['/images/community_festival_002.jpg','/images/community_concert_008.jpg','/images/community_palafox-festival_008.jpg','/images/community_food-trucks_004.jpg','/images/community_farmers-market_001.jpg'],
    military: ['/images/military_blue-angels_001.jpg','/images/military_nas-pensacola-airshow_009.jpg','/images/military_hangar_011.jpg','/images/military_ceremony_005.jpg','/images/military_blue-angels-over-pensacola_008.jpg'],
    education: ['/images/education_campus_001.jpg','/images/education_classroom_002.jpg','/images/education_graduation_005.jpg','/images/education_library_004.jpg','/images/education_teacher_006.jpg'],
    sports: ['/images/sports_baseball_002.jpg','/images/sports_basketball_005.jpg','/images/sports_football_001.jpg','/images/sports_soccer_003.jpg','/images/sports_running_004.jpg'],
  };
  const ARTICLE_PHOTOS = {
    // UWF
    'uwf': '/images/education_campus_001.jpg',
    'uwf-track': '/images/sports_running_004.jpg',
    'uwf-d1-schedule': '/images/sports_football_001.jpg',
    'uwf-enrollment-growth': '/images/education_graduation_005.jpg',
    'op-uwf': '/images/sports_football_001.jpg',
    // Education
    'psc-dual-enrollment':        '/images/education_classroom_002.jpg',
    'escambia-teacher-shortage':  '/images/education_teacher_006.jpg',
    'escambia-schools-budget':    '/images/education_library_004.jpg',
    'escambia-school-board-capital': '/images/education_campus_001.jpg',
    'escambia-school-board-calendar': '/images/education_classroom_002.jpg',
    // Government
    'propertytax':                '/images/editorial_gavel_005.jpg',
    'escambia-childers':          '/images/govt_public-hearing_009.jpg',
    'superintendent':             '/images/editorial_voting_010.jpg',
    'superintendent-ballot':      '/images/editorial_voting_010.jpg',
    'fricker-center':             '/images/community_park_003.jpg',
    'cdbg-buyout':                '/images/development_residential_004.jpg',
    'tpo-feb-2026':               '/images/development_road-work_002.jpg',
    'tpo-hayne-street':           '/images/development_road-work_002.jpg',
    'tpo-i10-work-program':       '/images/development_road-work_002.jpg',
    'wfrpc-regional-planning': '/images/downtown_pensacola-aerial-downtown_003.jpg',
    'gulf-breeze-council-march26':'/images/downtown_waterfront_004.jpg',
    'gulf-breeze-council-parking':'/images/downtown_waterfront_004.jpg',
    'florida-dei-bill':           '/images/editorial_press_001.jpg',
    'florida-special-session':    '/images/editorial_gavel_005.jpg',
    'florida-special-session-april': '/images/editorial_gavel_005.jpg',
    'dei-ban-local-impact':       '/images/editorial_surveillance_009.jpg',
    'public-pay':                 '/images/govt_office_007.jpg',
    'east-hill-demolition':       '/images/development_demolition_006.jpg',
    // Development
    'warrington':                 '/images/development_commercial_007.jpg',
    'lost':                       '/images/downtown_maritime_aerial.jpg',
    'gulfbreeze':                 '/images/sports_soccer_003.jpg',
    'navy-federal-expansion':     '/images/development_commercial_007.jpg',
    'palafox-rezoning': '/images/downtown_palafox-street-clock_007.jpg',
    'palafox-reconstruction': '/images/downtown_palafox-street-dusk_008.jpg',
    'beach-path': '/images/beach_pensacola-beach-road-aerial_013.jpg',
    'lakeview-demo':              '/images/development_demolition_006.jpg',
    'i10-expansion':              '/images/development_road-work_002.jpg',
    'garden-street-construction': '/images/development_concrete_009.jpg',
    'gulf-breeze-cra':            '/images/downtown_waterfront_004.jpg',
    'sorrento-road-safety':       '/images/development_road-work_002.jpg',
    'downtown-parking': '/images/downtown_palafox-street-dusk_008.jpg',
    // News
    'garden-street-grocery': '/images/downtown_cafe-sidewalk_006.jpg',
    'gasprices':                  '/images/pensacola_beach_watertower.jpg',
    'barrancas':                  '/images/development_road-work_002.jpg',
    'hurricane-prep':             '/images/weather_hurricane-prep_008.jpg',
    'easthill-traffic':           '/images/development_road-work_002.jpg',
    // Military
    'blueangels':                 '/images/military_blue-angels_001.jpg',
    'nas-housing':                '/images/military_hangar_011.jpg',
    'blue-angels-schedule':       '/images/military_blue-angels-crowd-practice_010.jpg',
    'symphony-100': '/images/community_concert_008.jpg',
    'pso-100th': '/images/community_concert_008.jpg',
    'warrior-sacrifice-way':      '/images/military_ceremony_005.jpg',
    'warrior-sacrifice-way-orig': '/images/military_ceremony_005.jpg',
    'history-galvez':             '/images/military_ceremony_005.jpg',
    'history-naval-aviation':     '/images/military_aviation-museum_004.jpg',
    // Sports
    'wahoos': '/images/sports_baseball_002.jpg',
    'wahoos-opening-home':        '/images/sports_baseball_002.jpg',
    'pensacola-fc':               '/images/sports_soccer_003.jpg',
    'uwf-track':                  '/images/uwf_penair_field.jpg',
    'psc-pirates':                '/images/sports_basketball_005.jpg',
    // Opinion
    'op-nas-housing':             '/images/military_hangar_011.jpg',
    'op-propertytax':             '/images/editorial_gavel_005.jpg',
    'op-superintendent':          '/images/editorial_voting_010.jpg',
    'op-lakeview':                '/images/development_demolition_006.jpg',
    'op-gateway': '/images/downtown_pensacola-aerial-downtown_003.jpg',
    'op-affordable-housing':      '/images/development_residential_004.jpg',
    'op-beach-nourishment': '/images/beach_dunes-sea-oats_005.jpg',
    'op-ecua-water':              '/images/development_equipment_010.jpg',
    'op-bayou-chico':             '/images/beach_pensacola-bay-shoreline_019.jpg',
    'op-budget':                  '/images/editorial_writing_007.jpg',
    // Events
    'crawfish':                   '/images/downtown_palafox_church.jpg',
    'fiesta-parade': '/images/community_palafox-festival_008.jpg',
    'mullet-toss': '/images/beach_gulf-breeze-aerial-sunset_020.jpg',
    'gaffigan':                   '/images/community_concert_008.jpg',
    'bands-beach-guide': '/images/beach_pensacola-beach-scene_021.jpg',
    'pensacola-art-walk': '/images/downtown_pensacola-gallery-night_005.jpg',
    'fiesta-pensacola':           '/images/community_festival_002.jpg',
    'beach-art-wine': '/images/beach_pensacola-beach-crowd_016.jpg',
    'krewe-sirens-beach': '/images/beach_pensacola-beach-crowd_016.jpg',
    'disney-on-ice':              '/images/community_concert_008.jpg',
    'santana-bay-center':         '/images/community_concert_008.jpg',
    'zz-top-saenger':             '/images/community_concert_008.jpg',
    'gabriel-iglesias':           '/images/community_concert_008.jpg',
    'mrs-doubtfire-saenger':      '/images/community_concert_008.jpg',
    'gallery-night-april': '/images/downtown_pensacola-gallery-night_005.jpg',
    'panchiko-vinyl':             '/images/community_concert_008.jpg',
    'clutch-vinyl':               '/images/community_concert_008.jpg',
    'alice-cooper-bay-center':    '/images/community_concert_008.jpg',
    'pensacola-pride':            '/images/community_festival_002.jpg',
    'pickles-wings-festival':     '/images/community_food-trucks_004.jpg',
    'bavarian-circus':            '/images/community_festival_002.jpg',
    'pensacola-comedy-club':      '/images/downtown_pensacola-gallery-night_005.jpg',
    'palafox-market':             '/images/community_farmers-market_001.jpg',
    'iration-vinyl':              '/images/community_concert_008.jpg',
  };
  function catImg(cat, id) {
    const specific = ARTICLE_PHOTOS[id];
    if (specific) return `<img src="${specific}" alt="${cat}" style="width:100%;height:100%;object-fit:cover;">`;
    const photos = catPhotos[cat] || catPhotos.news;
    const idx = Math.abs(id.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % photos.length;
    return `<img src="${photos[idx]}" alt="${cat}" style="width:100%;height:100%;object-fit:cover;">`;
  }

  // Spotlight featured article at top of category page
  const SPOTLIGHTS = { govt: 'public-pay' };
  const spotlightId = SPOTLIGHTS[cat];
  const spotlightEntry = spotlightId ? matches.find(([id]) => id === spotlightId) : null;
  const regularMatches = spotlightEntry ? matches.filter(([id]) => id !== spotlightId) : matches;

  let spotlightHtml = '';
  if (spotlightEntry) {
    const [sid, sa] = spotlightEntry;
    spotlightHtml = `
    <div onclick="openArticle('${sid}')" style="cursor:pointer;background:var(--navy);border-radius:4px;padding:28px 32px;margin-bottom:28px;display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold);">☀ Let the Sunshine In</span>
      </div>
      <div style="font-family:'DM Sans',sans-serif;font-weight:900;font-size:26px;line-height:1.1;color:#fff;">${sa.headline}</div>
      <div style="font-size:15px;color:rgba(255,255,255,0.75);line-height:1.55;max-width:680px;">${sa.dek}</div>
      <div style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.45);">${sa.byline} · ${sa.date}</div>
      <div style="display:flex;gap:12px;margin-top:4px;">
        <span style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;color:var(--gold);border:1px solid var(--gold);border-radius:3px;padding:5px 12px;">Read the investigation →</span>
        <span onclick="event.stopPropagation();goPage('pay')" style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.25);border-radius:3px;padding:5px 12px;cursor:pointer;">Open salary database →</span>
      </div>
    </div>`;
  }

  // Events page: featured community calendar spotlight
  if (cat === 'events') {
    const calSpotlight = `
    <div onclick="goPage('community-calendar')" style="cursor:pointer;background:var(--navy);border-radius:4px;padding:28px 32px;margin-bottom:28px;display:flex;flex-direction:column;gap:12px;">
      <div>
        <span style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold);">📅 Community Calendar</span>
      </div>
      <div style="font-family:'DM Sans',sans-serif;font-weight:900;font-size:26px;line-height:1.1;color:#fff;">What's Happening in Pensacola</div>
      <div style="font-size:15px;color:rgba(255,255,255,0.75);line-height:1.55;max-width:680px;">The full Pensacola area event calendar — festivals, concerts, markets, arts, sports and community events across Escambia and Santa Rosa counties. Updated continuously.</div>
      <div style="display:flex;gap:12px;margin-top:4px;">
        <span style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;color:var(--gold);border:1px solid var(--gold);border-radius:3px;padding:5px 12px;">Open full calendar →</span>
      </div>
    </div>`;
    spotlightHtml = calSpotlight + spotlightHtml;
  }

  
  var perPage = 25;
  var currentPage = page || 1;
  var totalPages = Math.ceil(regularMatches.length / perPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  var pageMatches = regularMatches.slice((currentPage - 1) * perPage, currentPage * perPage);

  const cards = pageMatches.map(([id, a]) => `
    <div class="cat-card" onclick="openArticle('${id}')">
      <div class="cat-card-img" style="overflow:hidden;">${a.thumbnail ? `<img src="${a.thumbnail}" alt="${a.cat}" style="width:100%;height:100%;object-fit:cover;">` : catImg(a.cat, id)}</div>
      <div class="cat-card-body">
        <span class="cat-badge cat-${a.cat}" style="cursor:default">${catDisplay(a.cat)}</span>
        <div class="cat-card-headline">${a.headline}</div>
        <div class="cat-card-dek">${a.dek||''}</div>
        <div class="cat-card-meta">${a.byline} · ${a.date}</div>
      </div>
    </div>`).join('');

  
  var pagHtml = '';
  if (totalPages > 1) {
    pagHtml = '<div style="display:flex;justify-content:center;align-items:center;gap:6px;margin-top:32px;padding:20px 0;flex-wrap:wrap;grid-column:1/-1;">';
    if (currentPage > 1) {
      pagHtml += '<button onclick="goCategory(\'' + cat + '\',' + (currentPage - 1) + ')" style="font-family:DM Sans,sans-serif;font-size:13px;font-weight:700;padding:8px 14px;border:1px solid var(--bd);border-radius:4px;background:#fff;cursor:pointer;color:var(--navy);">\u2190 Previous</button>';
    }
    for (var p = 1; p <= totalPages; p++) {
      pagHtml += '<button onclick="goCategory(\'' + cat + '\',' + p + ')" style="font-family:DM Sans,sans-serif;font-size:13px;font-weight:' + (p === currentPage ? '800' : '600') + ';padding:8px 12px;border:1px solid ' + (p === currentPage ? 'var(--navy)' : 'var(--bd)') + ';border-radius:4px;background:' + (p === currentPage ? 'var(--navy)' : '#fff') + ';color:' + (p === currentPage ? '#fff' : 'var(--navy)') + ';cursor:pointer;">' + p + '</button>';
    }
    if (currentPage < totalPages) {
      pagHtml += '<button onclick="goCategory(\'' + cat + '\',' + (currentPage + 1) + ')" style="font-family:DM Sans,sans-serif;font-size:13px;font-weight:700;padding:8px 14px;border:1px solid var(--bd);border-radius:4px;background:#fff;cursor:pointer;color:var(--navy);">Next \u2192</button>';
    }
    pagHtml += '</div>';
  }

  document.getElementById('cat-card-grid').innerHTML = spotlightHtml + cards + pagHtml;
  document.getElementById('page-home').classList.add('hidden');
  document.getElementById('page-cat').classList.add('active');
  document.getElementById('page-search').classList.remove('active');
  ALL_STATIC_PAGES.forEach(p => { const el = document.getElementById('page-'+p); if (el) el.classList.remove('active'); });
  const payPage = document.getElementById('page-pay');
  if (payPage) payPage.classList.remove('active');
  document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById('nav-' + cat);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0,0);
}

function goAllArticles(filterTag, page) {
  var tag = filterTag || 'all';
  var currentPage = page || 1;
  var perPage = 25;

  // Tag can be a geo (pensacola, downtown, etc) OR a category (cat:govt, cat:military, etc)
  function matchesTag(id, a, tag) {
    if (tag === 'all') return true;
    if (tag.indexOf('cat:') === 0) {
      return a.cat === tag.slice(4);
    }
    return autoTag(id, a) === tag;
  }

  var allFiltered = Object.entries(A)
    .filter(function(e) { return matchesTag(e[0], e[1], tag); })
    .sort(function(a,b) { return pubDate(b[0]) - pubDate(a[0]); });

  var totalArticles = allFiltered.length;
  var totalPages = Math.ceil(totalArticles / perPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  var startIdx = (currentPage - 1) * perPage;
  var pageArticles = allFiltered.slice(startIdx, startIdx + perPage);

  var tagNames = {
    pensacola:'Pensacola', downtown:'Downtown Pensacola', escambia:'Escambia County',
    beach:'Pensacola Beach', gulfbreeze:'Gulf Breeze',
    'cat:news':'News', 'cat:govt':'Government', 'cat:dev':'Development',
    'cat:military':'Military', 'cat:sports':'Sports', 'cat:business':'Business',
    'cat:education':'Education', 'cat:opinion':'Opinion', 'cat:events':'Events'
  };
  document.getElementById('cat-page-title').textContent = tag === 'all' ? 'Latest' : (tagNames[tag] || tag);
  document.getElementById('cat-page-sub').textContent = totalArticles + (tag === 'all' ? '' : ' of ' + Object.keys(A).length) + ' ' + (totalArticles === 1 ? 'story' : 'stories');

  // Two-row tag filter bar: categories first (always visible), then geographic
  var catTags = [
    ['all','All'],
    ['cat:news','News'],
    ['cat:govt','Government'],
    ['cat:dev','Development'],
    ['cat:military','Military'],
    ['cat:sports','Sports'],
    ['cat:business','Business'],
    ['cat:education','Education'],
    ['cat:opinion','Opinion'],
    ['cat:events','Events']
  ];
  var geoTags = [
    ['pensacola','Pensacola'],
    ['downtown','Downtown'],
    ['escambia','Escambia County'],
    ['beach','Pensacola Beach'],
    ['gulfbreeze','Gulf Breeze']
  ];

  // Hide categories that have zero articles
  catTags = catTags.filter(function(t) {
    if (t[0] === 'all') return true;
    return Object.entries(A).some(function(e) { return matchesTag(e[0], e[1], t[0]); });
  });
  geoTags = geoTags.filter(function(t) {
    return Object.entries(A).some(function(e) { return matchesTag(e[0], e[1], t[0]); });
  });

  function buildFilterRow(tags, label) {
    var row = '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">';
    if (label) {
      row += '<span style="font-family:DM Sans,sans-serif;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--g2);margin-right:4px;">' + label + '</span>';
    }
    for (var t = 0; t < tags.length; t++) {
      var isActive = tags[t][0] === tag;
      var bg = isActive ? 'var(--navy)' : '#fff';
      var color = isActive ? '#fff' : 'var(--navy)';
      var border = isActive ? 'var(--navy)' : 'var(--bd)';
      var weight = isActive ? '700' : '500';
      row += '<button onclick="goAllArticles(\'' + tags[t][0] + '\')" style="font-family:DM Sans,sans-serif;font-size:12px;font-weight:' + weight + ';padding:6px 13px;border:1px solid ' + border + ';border-radius:4px;background:' + bg + ';color:' + color + ';cursor:pointer;">' + tags[t][1] + '</button>';
    }
    row += '</div>';
    return row;
  }

  var filterHtml = '<div style="grid-column:1/-1;margin-bottom:24px;">'
    + buildFilterRow(catTags, 'Topic')
    + buildFilterRow(geoTags, 'Area')
    + '</div>';

  // Article cards
  var cards = pageArticles.map(function(entry) {
    var id = entry[0], a = entry[1];
    var imgHtml = a.thumbnail
      ? '<img src="' + a.thumbnail + '" alt="' + (a.cat||'') + '" style="width:100%;height:100%;object-fit:cover;">'
      : '<div style="width:100%;height:100%;background:var(--g4);display:flex;align-items:center;justify-content:center;color:var(--g2);font-size:12px;">' + (a.cat||'') + '</div>';
    return '<div class="cat-card" onclick="openArticle(\'' + id + '\')">'
      + '<div class="cat-card-img" style="overflow:hidden;">' + imgHtml + '</div>'
      + '<div class="cat-card-body">'
      + '<span class="cat-badge cat-' + a.cat + '" style="cursor:default">' + catDisplay(a.cat) + '</span>'
      + '<div class="cat-card-headline">' + a.headline + '</div>'
      + '<div class="cat-card-dek">' + (a.dek||'') + '</div>'
      + '<div class="cat-card-meta">' + (a.byline||'') + ' \u00b7 ' + (a.date||'') + '</div>'
      + '</div></div>';
  }).join('');

  // Pagination controls
  var pagHtml = '';
  if (totalPages > 1) {
    pagHtml = '<div style="display:flex;justify-content:center;align-items:center;gap:6px;margin-top:32px;padding:20px 0;flex-wrap:wrap;grid-column:1/-1;">';
    if (currentPage > 1) {
      pagHtml += '<button onclick="goAllArticles(\'' + tag + '\',' + (currentPage - 1) + ')" style="font-family:DM Sans,sans-serif;font-size:13px;font-weight:700;padding:8px 14px;border:1px solid var(--bd);border-radius:4px;background:#fff;cursor:pointer;color:var(--navy);">\u2190 Previous</button>';
    }
    for (var p = 1; p <= totalPages; p++) {
      var isCurrent = p === currentPage;
      pagHtml += '<button onclick="goAllArticles(\'' + tag + '\',' + p + ')" style="font-family:DM Sans,sans-serif;font-size:13px;font-weight:' + (isCurrent ? '800' : '600') + ';padding:8px 12px;border:1px solid ' + (isCurrent ? 'var(--navy)' : 'var(--bd)') + ';border-radius:4px;background:' + (isCurrent ? 'var(--navy)' : '#fff') + ';color:' + (isCurrent ? '#fff' : 'var(--navy)') + ';cursor:pointer;">' + p + '</button>';
    }
    if (currentPage < totalPages) {
      pagHtml += '<button onclick="goAllArticles(\'' + tag + '\',' + (currentPage + 1) + ')" style="font-family:DM Sans,sans-serif;font-size:13px;font-weight:700;padding:8px 14px;border:1px solid var(--bd);border-radius:4px;background:#fff;cursor:pointer;color:var(--navy);">Next \u2192</button>';
    }
    pagHtml += '</div>';
  }

  document.getElementById('cat-card-grid').innerHTML = filterHtml + cards + pagHtml;
  document.getElementById('page-home').classList.add('hidden');
  document.getElementById('page-cat').classList.add('active');
  document.getElementById('page-search').classList.remove('active');
  if (typeof ALL_STATIC_PAGES !== 'undefined') {
    ALL_STATIC_PAGES.forEach(function(p) { var el = document.getElementById('page-'+p); if (el) el.classList.remove('active'); });
  }
  var payPage = document.getElementById('page-pay');
  if (payPage) payPage.classList.remove('active');
  document.querySelectorAll('.main-nav a').forEach(function(a) { a.classList.remove('active'); });
  var latestNav = document.getElementById('nav-latest');
  if (latestNav) latestNav.classList.add('active');
  window.scrollTo(0,0);
  history.pushState(null, '', '/all');
}

function selectTier(el) {
  el.closest('.newsletter-tiers').querySelectorAll('.newsletter-tier').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

function toggleMobileNav() {
  var nav = document.getElementById('mobile-nav');
  var btn = document.getElementById('hamburger-btn');
  if (!nav) return;
  var isOpen = nav.classList.contains('open');
  nav.classList.toggle('open', !isOpen);
  nav.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
  if (btn) btn.classList.toggle('open', !isOpen);
}
document.addEventListener('click', function(e) {
  var nav = document.getElementById('mobile-nav');
  var btn = document.getElementById('hamburger-btn');
  if (!nav || !nav.classList.contains('open')) return;
  if (!nav.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden', 'true');
    if (btn) btn.classList.remove('open');
  }
});

function goHome() {
  closeDropdown();
  document.getElementById('search-input').value = '';
  document.getElementById('page-home').classList.remove('hidden');
  document.getElementById('page-cat').classList.remove('active');
  document.getElementById('page-search').classList.remove('active');
  ALL_STATIC_PAGES.forEach(p => { const el = document.getElementById('page-'+p); if (el) el.classList.remove('active'); });
  const payPage = document.getElementById('page-pay');
  if (payPage) payPage.classList.remove('active');
  document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById('nav-home').classList.add('active');
  window.scrollTo(0,0);
}


const EVENTS = {
  fantasia:    { color:'#8a6e3a', label:'Entertainment · Tonight',       title:'Fantasia & Anthony Hamilton',    date:'Friday, April 3, 2026',            time:'8:00 PM',               venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola',       startISO:'20260403T200000', endISO:'20260403T230000', desc:'R&B royalty Fantasia and Anthony Hamilton bring a double-bill show to the Pensacola Bay Center. Two of the most acclaimed voices in contemporary soul on one stage — this one will sell out. Doors open at 7PM.', cta:'Get Tickets', url:'https://www.ticketmaster.com/fantasia-anthony-hamilton-pensacola-florida-04-03-2026/event/1B0062FCCF9854B5' },
  egghunt:     { color:'#1a8a6e', label:'Family · This Weekend',          title:'Egga-Wahooza Easter Egg Hunt',   date:'Saturday, April 4, 2026',          time:'11:00 AM · Free',           venue:'Community Maritime Park', address:'301 W Main St, Pensacola',        startISO:'20260404T110000', endISO:'20260404T130000', desc:"Pensacola's annual Easter tradition, hosted by Marcus Pointe Baptist Church at Community Maritime Park. Over 50,000 eggs spread across age-divided zones. Special needs and 0–4 year olds hunt at 11AM, K5–5th grade at noon. Free admission — bring your own basket.", cta:'Free — Event Info', url:'https://pensacolachurch.org/eggawahooza/' },
  bandsbeach:  { color:'#1e2d4a', label:'Music · Every Tuesday',          title:'Bands on the Beach — 2026 Season', date:'Starting Tuesday, April 7',      time:'Gates 6PM · Music 7PM', venue:'Gulfside Pavilion', address:'Pensacola Beach, FL',             startISO:'20260407T190000', endISO:'20260407T210000', desc:"Pensacola Beach's beloved Tuesday night concert series opens its 2026 season April 7 at the Gulfside Pavilion. Free live music every Tuesday through the summer on the shores of the Gulf. Bring chairs and coolers. No pets on the beach stage area.", cta:'Free — View Schedule', url:'https://www.visitpensacolabeach.com/events/bands-on-the-beach/' },
  iglesias:    { color:'#5a3d7a', label:'Comedy · April 11',              title:'Gabriel Iglesias: The 1976 Tour', date:'Saturday, April 11, 2026',         time:'Doors 7PM · Show 8PM',   venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola',       startISO:'20260411T200000', endISO:'20260411T223000', desc:'"Fluffy" brings his new stand-up special "The 1976 Tour: A Fluffy Celebration" to the Bay Center. One night only. One of the highest-grossing touring comedians in the country — limited seats remain.', cta:'Get Tickets', url:'https://www.ticketmaster.com/gabriel-fluffy-iglesias-the-1976-tour-pensacola-florida-04-11-2026/event/1B006390CD61D0CB' },
  gaffigan:    { color:'#1e2d4a', label:'Comedy · April 16',              title:'Jim Gaffigan: Everything is Wonderful!', date:'Thursday, April 16, 2026', time:'7:00 PM',               venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola',       startISO:'20260416T190000', endISO:'20260416T210000', desc:"Jim Gaffigan brings his 'Everything is Wonderful!' tour to Pensacola Bay Center. Sharp observational comedy, clean material, sold-out crowds. One of the most reliably good touring acts working today.", cta:'Get Tickets', url:'https://www.ticketmaster.com/jim-gaffigan-everything-is-wonderful-pensacola-florida-04-16-2026/event/1B006437A483B11B' },
  crawfishfest:{ color:'#8a6e3a', label:'Festival · April 24',            title:'Pensacola Crawfish Festival',    date:'Thursday, April 24, 2026',         time:'All day',               venue:'Downtown Pensacola', address:'Palafox Street, Pensacola',         startISO:'20260424T100000', endISO:'20260424T210000', desc:"Fiesta Pensacola's annual Crawfish Festival returns to downtown. Multiple crawfish boils running simultaneously, live entertainment across stages, and a vendor lineup that draws crowds from across the region. Arrive early — Palafox fills up fast. Bring cash for vendors.", cta:'Event Info', url:'https://www.fiestapensacola.org' },
  mullettoss:  { color:'#1a8a6e', label:'Gulf Coast Tradition · April 26', title:'Flora-Bama Mullet Toss',        date:'Saturday–Sunday, April 26–27, 2026', time:'All day',             venue:'Flora-Bama Lounge', address:'17401 Perdido Key Dr, Perdido Key',  startISO:'20260426T100000', endISO:'20260427T200000', desc:"The annual Flora-Bama Mullet Toss — contestants throw dead mullet from Florida into Alabama, competing for distance. A full weekend of live music, food, and the organized chaos only the Flora-Bama can pull off. Draws enormous crowds. Go if you haven't been.", cta:'Event Info', url:'https://www.florabama.com/mullet-toss' },
// === Apr 25 - Jun 30, 2026 events — added 2026-04-25 ===
  symphony100: { color:'#5a3d7a', label:'Music · April 25', title:'Pensacola Symphony Orchestra: 100th Anniversary Gala', date:'Saturday, April 25, 2026', time:'7:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260425T193000', endISO:'20260425T220000', desc:'The Pensacola Symphony Orchestra marks its 100th anniversary season with a Gala Concert at the Saenger. Centennial program led by Music Director and signature works from a century of Pensacola classical music. Black tie optional.', cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B0062AEA15B2067' },
  queentribute: { color:'#1e2d4a', label:'Music · April 28', title:'One Night of Queen — Gary Mullen & The Works', date:'Tuesday, April 28, 2026', time:'7:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260428T193000', endISO:'20260428T213000', desc:"Gary Mullen & The Works deliver a full-on Queen tribute show at the Saenger. Bohemian Rhapsody, Don't Stop Me Now, We Will Rock You — performed live by the Stars in Their Eyes Grand Champion who's been touring this show worldwide.", cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B006383FFA1A0D9' },
  wahoosbiloxi: { color:'#1a8a6e', label:'Baseball · April 28 - May 3', title:'Blue Wahoos vs. Biloxi Shuckers', date:'Tuesday-Sunday, April 28 - May 3, 2026', time:'Various game times', venue:'Blue Wahoos Stadium', address:'351 W Cedar St, Pensacola', startISO:'20260428T180500', endISO:'20260503T220000', desc:'The Blue Wahoos open a six-game home stand against the Biloxi Shuckers, the Double-A affiliate of the Milwaukee Brewers. Game times vary by night — check the official schedule for promotions and giveaways.', cta:'Tickets & Schedule', url:'https://www.milb.com/pensacola/tickets' },
  clutchvinyl: { color:'#1e2d4a', label:'Music · May 1', title:'Clutch — Live at Vinyl Music Hall', date:'Friday, May 1, 2026', time:'7:30 PM', venue:'Vinyl Music Hall', address:'2 S Palafox St, Pensacola', startISO:'20260501T193000', endISO:'20260501T230000', desc:'Maryland hard-rock veterans Clutch hit the Vinyl stage on a tour supporting their newest record. Doors open early; the 850-cap room means this one will sell out.', cta:'Get Tickets', url:'https://vinylmusichall.com/calendar/' },
  islandfights96: { color:'#8a6e3a', label:'MMA · May 1', title:'Island Fights 96', date:'Friday, May 1, 2026', time:'6:30 PM', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260501T183000', endISO:'20260501T230000', desc:'Island Fights returns to the Bay Center for its 96th installment — a full evening of regional MMA bouts featuring fighters from across the Gulf Coast. Doors at 5:30 PM.', cta:'Get Tickets', url:'https://www.pensacolabaycenter.com/events/detail/island-fights-96' },
  uwfgrad: { color:'#1a8a6e', label:'Community · May 2', title:'UWF Spring 2026 Commencement Ceremonies', date:'Saturday, May 2, 2026', time:'All day', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260502T090000', endISO:'20260502T180000', desc:'The University of West Florida holds its Spring 2026 commencement at the Bay Center across multiple ceremonies throughout the day. Graduates and guests should consult the UWF schedule for ceremony times by college.', cta:'Event Info', url:'https://www.pensacolabaycenter.com/events/detail/uwf-spring-commencement-ceremony-26' },
  caputo: { color:'#5a3d7a', label:'Entertainment · May 2', title:'Theresa Caputo LIVE: The Experience', date:'Saturday, May 2, 2026', time:'7:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260502T193000', endISO:'20260502T220000', desc:"The Long Island Medium brings her live touring show to the Saenger. Caputo delivers personal readings from the audience, on-stage stories from her TLC series, and an evening that fans of the show won't want to miss.", cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B00631DE688707F' },
  beachartwalk: { color:'#1a8a6e', label:'Art · May 3', title:'Pensacola Beach Art Walk', date:'Sunday, May 3, 2026', time:'11:00 AM - 6:00 PM · Free', venue:'Pensacola Beach Boardwalk', address:'400 Quietwater Beach Blvd, Pensacola Beach', startISO:'20260503T110000', endISO:'20260503T180000', desc:'Local artists set up along the Pensacola Beach Boardwalk for a Sunday afternoon outdoor art walk. Free to attend, weather permitting.', cta:'Free — Event Info', url:'https://visitpensacolabeach.com/whats-happening-calendar/' },
  alicecooper: { color:'#1e2d4a', label:'Music · May 3', title:"Alice Cooper — Alice's Attic Tour", date:'Sunday, May 3, 2026', time:'8:00 PM', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260503T200000', endISO:'20260503T230000', desc:"The Godfather of Shock Rock brings Alice's Attic Tour to Pensacola for one night. Schools Out, Poison, Ive Eighteen, No More Mr. Nice Guy — six decades of catalog and the theatrical staging that made Cooper a hall-of-famer.", cta:'Get Tickets', url:'https://www.ticketmaster.com/alice-cooper-alices-attic-tour-pensacola-florida-05-03-2026/event/1B006435F5DF33BC' },
  bandsmay5: { color:'#1e2d4a', label:'Music · May 5 · Free', title:'Bands on the Beach: Southern Breeze', date:'Tuesday, May 5, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260505T190000', endISO:'20260505T210000', desc:"Southern Breeze takes the Gulfside Pavilion stage for May's first Bands on the Beach. Bring lawn chairs and coolers. Free admission. Trolley service from the parking areas.", cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  wahoosrocket: { color:'#1a8a6e', label:'Baseball · May 5-10', title:'Blue Wahoos vs. Rocket City Trash Pandas', date:'Tuesday-Sunday, May 5-10, 2026', time:'Various game times', venue:'Blue Wahoos Stadium', address:'351 W Cedar St, Pensacola', startISO:'20260505T180500', endISO:'20260510T220000', desc:"Mother's Day weekend home stand. The Blue Wahoos host the Rocket City Trash Pandas — Double-A affiliate of the Los Angeles Angels — for six games. Sunday Mom's Day promotions on the field.", cta:'Tickets & Schedule', url:'https://www.milb.com/pensacola/tickets' },
  chorus8: { color:'#5a3d7a', label:'Family · May 8-10', title:"Pensacola Children's Chorus: Showtime 2026", date:'Friday-Sunday, May 8-10, 2026', time:'Fri/Sat 7:30 PM, Sun 2:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260508T193000', endISO:'20260510T160000', desc:"The Pensacola Children's Chorus returns to the Saenger for their annual Showtime production. Three performances across the weekend — Friday and Saturday evening, Sunday matinee.", cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B00634728DC82E8' },
  disneyice: { color:'#5a3d7a', label:'Family · May 8-10', title:'Disney On Ice presents Jump In!', date:'Friday-Sunday, May 8-10, 2026', time:'Multiple show times', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260508T190000', endISO:'20260510T173000', desc:"Disney On Ice returns to the Bay Center with Jump In! — six performances across three days featuring Mickey, Minnie, Frozen's Anna and Elsa, Toy Story characters, and the Disney Princess lineup. Best for families with kids 3-12.", cta:'Get Tickets', url:'https://www.pensacolabaycenter.com/events/detail/disney-on-ice-6' },
  sandpiperstrut: { color:'#1a8a6e', label:'Run · May 9', title:'Sandpiper Strut 4-Mile + Leftover Run', date:'Saturday, May 9, 2026', time:'7:00 AM start', venue:'Pensacola Beach', address:'400 Quietwater Beach Blvd, Pensacola Beach', startISO:'20260509T070000', endISO:'20260509T103000', desc:'The Sandpiper Strut returns to Pensacola Beach with a 4-mile run and the shorter Leftover companion event. Beachfront course, post-race party at the boardwalk. Registration via Run Pensacola.', cta:'Register', url:'https://runpensacola.com/' },
  artwine: { color:'#8a6e3a', label:'Festival · May 9', title:'Pensacola Beach Art & Wine Festival', date:'Saturday, May 9, 2026', time:'11:00 AM - 4:00 PM', venue:'Pensacola Beach Boardwalk', address:'400 Quietwater Beach Blvd, Pensacola Beach', startISO:'20260509T110000', endISO:'20260509T160000', desc:'Sip wine and browse art along the Pensacola Beach Boardwalk. Local artists, regional wineries, and the Gulf as the backdrop. Wristband required for wine sampling; the art browsing is free.', cta:'Event Info', url:'https://visitpensacolabeach.com/whats-happening-calendar/' },
  britfloyd: { color:'#5a3d7a', label:'Music · May 12', title:'Brit Floyd: The Moon, The Wall, and Beyond', date:'Tuesday, May 12, 2026', time:'7:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260512T193000', endISO:'20260512T220000', desc:"The world's most acclaimed Pink Floyd tribute returns with The Moon, The Wall, and Beyond — a career-spanning production celebrating Dark Side of the Moon and The Wall with full lasers, animations, and a band that has played this material to millions worldwide.", cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B006379F79ADCF5' },
  bandsmay12: { color:'#1e2d4a', label:'Music · May 12 · Free', title:'Bands on the Beach: Cristi Dee and BAD JUJU', date:'Tuesday, May 12, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260512T190000', endISO:'20260512T210000', desc:'Cristi Dee and BAD JUJU bring blues-rock to the Gulfside Pavilion stage for the second Bands on the Beach of May. Free admission, lawn-chair seating.', cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  pscgrad: { color:'#1a8a6e', label:'Community · May 13', title:'PSC Graduation Ceremony 2026', date:'Wednesday, May 13, 2026', time:'All day', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260513T100000', endISO:'20260513T200000', desc:'Pensacola State College holds its 2026 commencement at the Bay Center. Multiple ceremonies through the day across colleges; consult PSC for ceremony assignments.', cta:'Event Info', url:'https://www.pensacolabaycenter.com/events/detail/psc-graduation-ceremony-2028' },
  thorogood: { color:'#1e2d4a', label:'Music · May 13', title:'George Thorogood & The Destroyers', date:'Wednesday, May 13, 2026', time:'7:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260513T193000', endISO:'20260513T220000', desc:'Bad to the Bone. One Bourbon, One Scotch, One Beer. George Thorogood & The Destroyers bring 50 years of blues-rock to the Saenger. Lonesome Pat Hare-school slide guitar on a Pensacola Wednesday night.', cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B00642FE7A6AF0D' },
  salvulcano: { color:'#5a3d7a', label:'Comedy · May 15', title:"Sal Vulcano: Everything's Fine Tour", date:'Friday, May 15, 2026', time:'7:00 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260515T190000', endISO:'20260515T210000', desc:"Sal Vulcano of Impractical Jokers brings his Everything's Fine Tour to the Saenger. Stand-up from one of the four Tenderloins. Mature content; recommended for ages 16+.", cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B00634834EBC012' },
  gallerynightmay: { color:'#8a6e3a', label:'Free · May 15 · 5-9 PM', title:'Gallery Night: Festa Italiana', date:'Friday, May 15, 2026', time:'5:00-9:00 PM · Free', venue:'Downtown Pensacola', address:'13 Palafox Pl, Pensacola', startISO:'20260515T170000', endISO:'20260515T210000', desc:"May's Gallery Night theme is Festa Italiana — Italian food, music, and culture across the downtown footprint. Note 2026 venue runs along Jefferson Street and surrounding plazas due to the Palafox Street construction project.", cta:'Free — Event Info', url:'https://gallerynightpensacola.org/' },
  cinemasandzoo: { color:'#1a8a6e', label:'Free · May 15', title:'Cinemas in the Sand: Zootopia 2', date:'Friday, May 15, 2026', time:'After sunset · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260515T200000', endISO:'20260515T220000', desc:'Cinemas in the Sand returns with a free outdoor screening of Zootopia 2 at the Gulfside Pavilion. Bring blankets and beach chairs; concessions and food trucks on site. Show starts at sunset.', cta:'Free — Event Info', url:'https://visitpensacolabeach.com/whats-happening-calendar/' },
  pickleswings: { color:'#8a6e3a', label:'Festival · May 16', title:'Pickles & Wings Family Festival', date:'Saturday, May 16, 2026', time:'10:00 AM - 8:00 PM', venue:'Seville Square', address:'311 E Government St, Pensacola', startISO:'20260516T100000', endISO:'20260516T200000', desc:'A full day of pickle competitions, wing tasting, live music, kids activities, and Gulf Coast craft vendors at historic Seville Square. Free admission; food and drink for purchase.', cta:'Event Info', url:'https://pensacolabeach.com/event-calendar/' },
  pressthechest: { color:'#5a3d7a', label:'Community · May 17', title:'Press the Chest CPR Community Event', date:'Sunday, May 17, 2026', time:'All day', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260517T100000', endISO:'20260517T160000', desc:'Free hands-only CPR training led by Gulf Coast medical providers. Learn the technique that saves the life of a cardiac arrest victim. No registration required; sessions run throughout the day.', cta:'Free — Event Info', url:'https://www.pensacolabaycenter.com/events/detail/gulf-coast-press-the-chest-community-cpr-event' },
  jimbreuer: { color:'#5a3d7a', label:'Comedy · May 18', title:'Jim Breuer: Find the Funny Tour', date:'Monday, May 18, 2026', time:'7:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260518T193000', endISO:'20260518T213000', desc:'SNL alum and Half Baked star Jim Breuer brings his Find the Funny tour to the Saenger. Two decades of evolving stand-up from the Heavy Metal voice himself.', cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B006477D624FA63' },
  iration: { color:'#1e2d4a', label:'Music · May 19', title:'Iration — Live at Vinyl Music Hall', date:'Tuesday, May 19, 2026', time:'7:00 PM', venue:'Vinyl Music Hall', address:'2 S Palafox St, Pensacola', startISO:'20260519T190000', endISO:'20260519T230000', desc:'California reggae-rock band Iration plays the Vinyl. Time Bomb, Falling, Daydreamer — a tight 850-cap room and a band that knows how to fill it. All-ages with valid ID.', cta:'Get Tickets', url:'https://vinylmusichall.com/calendar/' },
  bandsmay19: { color:'#1e2d4a', label:'Music · May 19 · Free', title:'Bands on the Beach: Vibe Irie', date:'Tuesday, May 19, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260519T190000', endISO:'20260519T210000', desc:'Vibe Irie brings reggae and island sounds to the Gulfside Pavilion for the third Bands on the Beach of May. Free admission, lawn-chair seating.', cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  wahooscolumbus: { color:'#1a8a6e', label:'Baseball · May 19-24', title:'Blue Wahoos vs. Columbus Clingstones', date:'Tuesday-Sunday, May 19-24, 2026', time:'Various game times', venue:'Blue Wahoos Stadium', address:'351 W Cedar St, Pensacola', startISO:'20260519T180500', endISO:'20260524T220000', desc:'Memorial Day weekend home stand. The Blue Wahoos host the Columbus Clingstones — Double-A affiliate of the Atlanta Braves — for six games. Saturday fireworks night for Memorial Day.', cta:'Tickets & Schedule', url:'https://www.milb.com/pensacola/tickets' },
  memorialweekend: { color:'#5a3d7a', label:'Festival · May 21-25', title:'Memorial Weekend Pensacola Beach', date:'Thursday-Monday, May 21-25, 2026', time:'Multiple events daily', venue:'Pensacola Beach Park East', address:'1500 Via De Luna Dr, Pensacola Beach', startISO:'20260521T070000', endISO:'20260525T120000', desc:'Johnny Chisholm presents the largest LGBTQ+ Memorial Day event in North America. Five days of beach-tea dances, nightly circuit parties at Park East, and vendor activity across Pensacola Beach. Wristband and ticket purchase required.', cta:'Get Tickets', url:'https://www.eventbrite.com/e/memorial-weekend-pensacola-beach-2026-tickets-1388412873279' },
  memorialdayceremony: { color:'#1e2d4a', label:'Free · May 24', title:'Memorial Day Ceremony at Veterans Memorial Park', date:'Sunday, May 24, 2026', time:'Late morning · Free', venue:'Veterans Memorial Park', address:'200 S 10th Ave, Pensacola', startISO:'20260524T100000', endISO:'20260524T120000', desc:"Veterans Memorial Park's annual Memorial Day Ceremony. Presentation of the colors, the National Anthem, wreath-laying at the Vietnam Veterans Memorial Wall South, patriotic music, and remarks from a guest speaker. Free and open to the public.", cta:'Free — Event Info', url:'https://www.veteransmemorialparkpensacola.org/memorial-day-home' },
  bandsmay26: { color:'#1e2d4a', label:'Music · May 26 · Free', title:'Bands on the Beach: Modern Eldorados', date:'Tuesday, May 26, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260526T190000', endISO:'20260526T210000', desc:'Modern Eldorados close out May with classic-rock covers at the Gulfside Pavilion. Free admission, lawn-chair seating, the Gulf as backdrop.', cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  escambiagrad: { color:'#1a8a6e', label:'Community · May 26-27', title:'Escambia County High School Graduations', date:'Tuesday-Wednesday, May 26-27, 2026', time:'Multiple ceremonies', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260526T090000', endISO:'20260527T220000', desc:'Escambia County School District holds high school graduation ceremonies across two days at the Bay Center. Each high school is assigned its own time slot. Consult ECSD for the master schedule.', cta:'Event Info', url:'https://www.pensacolabaycenter.com/events/detail/escambia-county-2023-graduation-2' },
  thirtyeightspecial: { color:'#1e2d4a', label:'Music · May 28', title:'38 Special', date:'Thursday, May 28, 2026', time:'7:00 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260528T190000', endISO:'20260528T220000', desc:'Hold On Loosely. Caught Up in You. Southern rock veterans 38 Special bring four decades of catalog to the Saenger. Don Barnes still on lead vocals, the band still touring 100+ shows a year.', cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B006436BDCACC79' },
  santarosagrad: { color:'#1a8a6e', label:'Community · May 29', title:'Santa Rosa County HS Graduation', date:'Friday, May 29, 2026', time:'All day', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260529T100000', endISO:'20260529T220000', desc:'Santa Rosa County School District high school commencement ceremonies at the Bay Center. Schedule by school posted by SRCSD prior to the date.', cta:'Event Info', url:'https://www.pensacolabaycenter.com/events/detail/santa-rosa-county-high-school-graduation-2025' },
  grandfiesta: { color:'#8a6e3a', label:'Free · May 29 · 7 PM', title:'Grand Fiesta Parade', date:'Friday, May 29, 2026', time:'7:00 PM · Free', venue:'Downtown Pensacola', address:'Palafox Street, Pensacola', startISO:'20260529T190000', endISO:'20260529T220000', desc:'The Grand Fiesta Parade rolls down Palafox in downtown Pensacola — dozens of local krewes, oversized floats, and special appearances by a masked DeLuna LXXVI, his Queen, and the 2026 Court of DeLuna. The signature event of Fiesta Pensacola.', cta:'Free — Parade Info', url:'https://www.fiestapensacola.org/' },
  wahooschattanooga: { color:'#1a8a6e', label:'Baseball · June 2-7', title:'Blue Wahoos vs. Chattanooga Lookouts', date:'Tuesday-Sunday, June 2-7, 2026', time:'Various game times', venue:'Blue Wahoos Stadium', address:'351 W Cedar St, Pensacola', startISO:'20260602T180500', endISO:'20260607T220000', desc:'The Blue Wahoos host the Chattanooga Lookouts — Double-A affiliate of the Cincinnati Reds — for a six-game home stand. The Lookouts make their only Pensacola visit of the season.', cta:'Tickets & Schedule', url:'https://www.milb.com/pensacola/tickets' },
  bandsjun2: { color:'#1e2d4a', label:'Music · June 2 · Free', title:'Bands on the Beach: Cadillac Willy', date:'Tuesday, June 2, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260602T190000', endISO:'20260602T210000', desc:'Cadillac Willy opens the June Bands on the Beach series with rockabilly and roots music at the Gulfside Pavilion. Free admission, sand under your feet.', cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  bandsjun9: { color:'#1e2d4a', label:'Music · June 9 · Free', title:'Bands on the Beach: 12Eleven', date:'Tuesday, June 9, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260609T190000', endISO:'20260609T210000', desc:'Pensacola favorites 12Eleven take the Gulfside stage for the second Bands on the Beach of June. Free admission. Bring chairs and coolers.', cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  motown: { color:'#8a6e3a', label:'Music · June 13', title:'Magic of Motown featuring The Motowners', date:'Saturday, June 13, 2026', time:'7:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260613T193000', endISO:'20260613T220000', desc:'The Motowners bring the catalog of Hitsville USA to the Saenger — Temptations, Four Tops, Stevie Wonder, Marvin Gaye, the Supremes. A full review of the music that built Motown.', cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B006437D4A5F13C' },
  beetlejuice16: { color:'#5a3d7a', label:'Broadway · June 16-17', title:'Beetlejuice: The Musical', date:'Tuesday-Wednesday, June 16-17, 2026', time:'7:30 PM both nights', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260616T193000', endISO:'20260617T220000', desc:"Broadway in Pensacola brings Beetlejuice: The Musical to the Saenger for two nights. The Tony-nominated stage adaptation of the Tim Burton film, with the Ghost with the Most leading the cast through 'The Whole Being Dead Thing' and a 90-minute showstopper.", cta:'Get Tickets', url:'https://www.ticketmaster.com/event/1B00628AE0215814' },
  bandsjun16: { color:'#1e2d4a', label:'Music · June 16 · Free', title:'Bands on the Beach: Goldmine', date:'Tuesday, June 16, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260616T190000', endISO:'20260616T210000', desc:'Goldmine takes the Gulfside Pavilion stage for the third Bands on the Beach of June. Free admission, summer sunset over the Gulf.', cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  wahoosbirmingham: { color:'#1a8a6e', label:'Baseball · June 16-21', title:'Blue Wahoos vs. Birmingham Barons', date:'Tuesday-Sunday, June 16-21, 2026', time:'Various game times', venue:'Blue Wahoos Stadium', address:'351 W Cedar St, Pensacola', startISO:'20260616T180500', endISO:'20260621T220000', desc:"Father's Day weekend and Juneteenth home stand. The Blue Wahoos host the Birmingham Barons — Double-A affiliate of the Chicago White Sox — for six games. Sunday Father's Day promotions on the field.", cta:'Tickets & Schedule', url:'https://www.milb.com/pensacola/tickets' },
  imperialtriumphant: { color:'#1e2d4a', label:'Music · June 17', title:'Imperial Triumphant + Fallujah', date:'Wednesday, June 17, 2026', time:'7:00 PM', venue:'Vinyl Music Hall', address:'2 S Palafox St, Pensacola', startISO:'20260617T190000', endISO:'20260617T230000', desc:'New York avant-garde metal trio Imperial Triumphant brings their cinematic, art-deco-themed black metal show to the Vinyl. Fallujah opens. Heavy night for the heavy crowd.', cta:'Get Tickets', url:'https://vinylmusichall.com/calendar/' },
  gallerynightjun: { color:'#8a6e3a', label:'Free · June 19 · 5-9 PM', title:'Gallery Night: Journey to Juneteenth', date:'Friday, June 19, 2026', time:'5:00-9:00 PM · Free', venue:'Downtown Pensacola', address:'13 Palafox Pl, Pensacola', startISO:'20260619T170000', endISO:'20260619T210000', desc:"June's Gallery Night honors Juneteenth with a 'Journey to Juneteenth' theme — Black artists, music, and history across the downtown footprint. 2026 layout runs along Jefferson Street due to the Palafox construction project.", cta:'Free — Event Info', url:'https://gallerynightpensacola.org/' },
  bandsjun23: { color:'#1e2d4a', label:'Music · June 23 · Free', title:'Bands on the Beach: Disco Kiss', date:'Tuesday, June 23, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260623T190000', endISO:'20260623T210000', desc:'Disco Kiss takes the Gulfside Pavilion stage for the fourth Bands on the Beach of June. Disco hits the way they were meant to be heard — outside, by the Gulf, free.', cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  whitetie: { color:'#1e2d4a', label:'Music · June 27', title:'White Tie Rock Ensemble: Arena Rock', date:'Saturday, June 27, 2026', time:'7:30 PM', venue:'Pensacola Bay Center', address:'201 E Gregory St, Pensacola', startISO:'20260627T193000', endISO:'20260627T220000', desc:'White Tie Rock Ensemble brings Arena Rock to the Bay Center — a full-production tribute show covering Boston, Journey, Foreigner, Bon Jovi, Queen, and the giants of stadium-era rock. Featuring orchestral arrangements with the rock backline.', cta:'Get Tickets', url:'https://www.pensacolabaycenter.com/events/detail/white-tie-rock-ensemble-31' },
  princessconcert: { color:'#5a3d7a', label:'Family · June 29', title:'The Princess Concert', date:'Monday, June 29, 2026', time:'3:30 PM', venue:'Saenger Theatre', address:'118 S Palafox Pl, Pensacola', startISO:'20260629T153000', endISO:'20260629T173000', desc:'The Princess Concert brings every Disney princess to the Saenger stage in a family-friendly afternoon production. Anna, Elsa, Belle, Ariel, Moana — the full lineup with music from each film. Best for ages 3-10.', cta:'Get Tickets', url:'https://www.ticketmaster.com/the-princess-concert-pensacola-florida-06-29-2026/event/1B00644A9AE17F8A' },
  bandsjun30: { color:'#1e2d4a', label:'Music · June 30 · Free', title:'Bands on the Beach: Johnny Earthquake and the Moondogs', date:'Tuesday, June 30, 2026', time:'7:00-9:00 PM · Free', venue:'Gulfside Pavilion', address:'735 Pensacola Beach Blvd, Pensacola Beach', startISO:'20260630T190000', endISO:'20260630T210000', desc:'Johnny Earthquake and the Moondogs close out June at the Gulfside Pavilion. Free admission, the last sunset of the month over the Gulf.', cta:'Free — Series Info', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
};

function generateICS(e) {
  const uid = 'flightline-' + e.title.replace(/\s+/g,'-').toLowerCase() + '@theflightline.com';
  const now = new Date().toISOString().replace(/[-:.]/g,'').slice(0,15) + 'Z';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Flightline//Pensacola Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + now,
    'DTSTART:' + e.startISO,
    'DTEND:' + e.endISO,
    'SUMMARY:' + e.title,
    'DESCRIPTION:' + e.desc.replace(/,/g,'\\,').replace(/\n/g,'\\n'),
    'LOCATION:' + e.address,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  // Use data URI for iOS Safari compatibility
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    // iOS Calendar recognizes .ics files opened as data URIs via a link tap
    const dataUri = 'data:text/calendar;charset=utf8;filename=' + e.title.replace(/\s+/g,'-').toLowerCase() + '.ics,' + encodeURIComponent(ics);
    const a = document.createElement('a');
    a.href = dataUri;
    a.setAttribute('download', e.title.replace(/\s+/g,'-').toLowerCase() + '.ics');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 500);
  } else {
    const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = e.title.replace(/\s+/g,'-').toLowerCase() + '.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function googleCalUrl(e) {
  const fmt = s => s.replace('T','T').slice(0,15);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: fmt(e.startISO) + '/' + fmt(e.endISO),
    details: e.desc,
    location: e.address
  });
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}

function outlookCalUrl(e) {
  // Outlook.com live calendar
  const toOutlook = s => {
    // YYYYMMDDTHHMMSS -> YYYY-MM-DDTHH:MM:SS
    return s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8)+'T'+s.slice(9,11)+':'+s.slice(11,13)+':'+s.slice(13,15);
  };
  const p = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: e.title,
    startdt: toOutlook(e.startISO),
    enddt: toOutlook(e.endISO),
    body: e.desc,
    location: e.address
  });
  return 'https://outlook.live.com/calendar/0/action/compose?' + p.toString();
}

function openEvent(id) {
  const e = EVENTS[id]; if (!e) return;
  document.getElementById('event-modal-header').style.background = e.color;
  document.getElementById('event-modal-label').textContent = e.label;
  document.getElementById('event-modal-title').textContent = e.title;
  document.getElementById('event-modal-meta').innerHTML =
    `<div class="event-modal-meta-item"><span>📅</span> ${e.date}</div>` +
    `<div class="event-modal-meta-item"><span>🕐</span> ${e.time}</div>` +
    `<div class="event-modal-meta-item"><span>📍</span> ${e.venue}</div>`;
  document.getElementById('event-modal-desc').textContent = e.desc;
  const ctaEl = document.getElementById('event-modal-cta');
  if (e.url) {
    ctaEl.outerHTML = `<a id="event-modal-cta" class="event-modal-btn" href="${e.url}" target="_blank" rel="noopener">${e.cta} ↗</a>`;
  } else {
    ctaEl.outerHTML = `<button id="event-modal-cta" class="event-modal-btn">${e.cta}</button>`;
  }

  // Calendar buttons
  document.getElementById('cal-btn-row').innerHTML = `
    <button class="cal-btn" onclick="generateICS(EVENTS['${id}'])"><span class="cal-btn-icon">🍎</span> Apple</button>
    <a class="cal-btn" href="${googleCalUrl(e)}" target="_blank" rel="noopener"><span class="cal-btn-icon">📅</span> Google</a>
    <a class="cal-btn" href="${outlookCalUrl(e)}" target="_blank" rel="noopener"><span class="cal-btn-icon">🪟</span> Outlook</a>
    <button class="cal-btn" onclick="generateICS(EVENTS['${id}'])"><span class="cal-btn-icon">📲</span> Android / Other</button>`;

  document.getElementById('event-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeEvent() {
  document.getElementById('event-modal').classList.remove('open');
  document.body.style.overflow = '';
}


function openArticle(id){
  const a=A[id]; if(!a) return;
  const bullets = a.brief || a.bluf || [];
  const briefCollapsed = localStorage.getItem('fl_brief_collapsed') === '1';
  const briefHTML = bullets.length ? `
    <div class="flightline-brief${briefCollapsed ? ' brief-collapsed' : ''}" id="flightline-brief">
      <div class="brief-header" onclick="toggleBrief()" role="button" tabindex="0" aria-expanded="${briefCollapsed ? 'false' : 'true'}" aria-controls="brief-items-list" title="Click to collapse or expand">
        <span class="brief-plane">✈</span>
        <span class="brief-label">Flightline Brief</span>
        <span class="brief-chevron" aria-hidden="true">▾</span>
      </div>
      <ul class="brief-items" id="brief-items-list">
        ${bullets.map(b=>`<li class="brief-item"><span class="brief-bullet"></span><span class="brief-text">${b}</span></li>`).join('')}
      </ul>
    </div>` : '';
  const siteUrl = window.location.origin + window.location.pathname;
  const shareUrl = encodeURIComponent(siteUrl);
  const shareTitle = encodeURIComponent(a.headline);
  const shareBody = encodeURIComponent(a.headline + ' — ' + siteUrl);
  document.getElementById('modal-content').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--bd);padding-right:48px;">
      <span class="cat-badge cat-${a.cat}" style="font-size:11px;cursor:pointer;" onclick="closeArticle();goCategory('${a.cat}');" title="See more in ${catDisplay(a.cat)}">${catDisplay(a.cat)}</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <button onclick="adjustArticleSize(-1)" title="Decrease text size" style="background:var(--surface);border:1.5px solid var(--bd);border-radius:3px;padding:4px 8px;font-size:13px;font-weight:700;color:var(--g1);cursor:pointer;line-height:1;">A−</button>
        <button onclick="adjustArticleSize(1)" title="Increase text size" style="background:var(--surface);border:1.5px solid var(--bd);border-radius:3px;padding:4px 8px;font-size:16px;font-weight:700;color:var(--g1);cursor:pointer;line-height:1;">A+</button>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener" title="Share on Facebook" style="background:var(--surface);border:1.5px solid var(--bd);border-radius:3px;padding:5px 9px;font-size:13px;font-weight:700;color:var(--g1);cursor:pointer;text-decoration:none;line-height:1;">f</a>
        <a href="https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}" target="_blank" rel="noopener" title="Share on LinkedIn" style="background:var(--surface);border:1.5px solid var(--bd);border-radius:3px;padding:5px 9px;font-size:13px;font-weight:700;color:var(--g1);cursor:pointer;text-decoration:none;line-height:1;">in</a>
        <button onclick="navigator.share ? navigator.share({title:'${a.headline.replace(/'/g,"\\'")}',url:window.location.href}) : navigator.clipboard.writeText(window.location.href).then(()=>alert('Link copied!'))" title="Share" style="background:var(--surface);border:1.5px solid var(--bd);border-radius:3px;padding:5px 9px;font-size:13px;color:var(--g1);cursor:pointer;line-height:1;">⬆</button>
      </div>
    </div>
    <h1 style="font-family:'DM Sans',sans-serif;font-weight:900;font-size:30px;line-height:1.12;color:var(--navy);margin-bottom:12px;">${a.headline}</h1>
    <p style="font-size:16px;color:var(--g1);margin-bottom:12px;font-weight:400;line-height:1.55;">${a.dek}</p>
    <p style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--g2);margin-bottom:26px;padding-bottom:18px;border-bottom:1px solid var(--bd);">By <span style="color:var(--gold);">${a.byline}</span> · ${a.date}</p>
    ${briefHTML}
    <div class="article-body" id="article-body-text">${a.body}</div>
    ${(function(){
      // Auto-populate related coverage: same category, sorted by recency, max 3, exclude self
      var related = Object.entries(A)
        .filter(function(e){ return e[0] !== id && e[1].cat === a.cat; })
        .sort(function(x,y){ return pubDate(y[0]) - pubDate(x[0]); })
        .slice(0, 3);
      if (!related.length) return '';
      return `
      <div style="margin-top:32px;padding-top:24px;border-top:2px solid var(--navy);">
        <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--navy);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
          <span style="color:var(--gold);">✦</span> More ${catDisplay(a.cat)} Coverage
        </div>
        <div style="display:flex;flex-direction:column;gap:1px;background:var(--bd);border:1px solid var(--bd);border-radius:4px;overflow:hidden;">
          ${related.map(function(e){
            var rid = e[0], r = e[1];
            var thumb = r.thumbnail
              ? '<img src="' + r.thumbnail + '" alt="" style="width:80px;height:60px;object-fit:cover;border-radius:3px;flex-shrink:0;">'
              : '<div style="width:80px;height:60px;background:var(--surface);border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--g2);font-size:18px;">📰</div>';
            return '<div onclick="closeArticle();setTimeout(function(){openArticle(\'' + rid + '\');},120);" style="display:flex;gap:14px;padding:14px 16px;background:#fff;cursor:pointer;align-items:flex-start;transition:background 0.12s;" onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'#fff\'">'
              + thumb
              + '<div style="flex:1;min-width:0;">'
              +   '<div style="font-family:\'DM Sans\',sans-serif;font-weight:700;font-size:14px;line-height:1.35;color:var(--navy);margin-bottom:4px;">' + r.headline + '</div>'
              +   '<div style="font-family:\'DM Sans\',sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--g2);">' + r.date + '</div>'
              + '</div>'
              + '</div>';
          }).join('')}
        </div>
      </div>`;
    })()}
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--bd);">
      <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--g2);margin-bottom:10px;">React to this story</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;" id="reaction-row-${id}">
        ${[['👍','Helpful'],['❤️','Love it'],['😮','Surprising'],['😡','Frustrated'],['🤔','More questions']].map(([emoji,label])=>`
          <button onclick="handleReaction('${id}','${emoji}',this)" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:var(--surface);border:1.5px solid var(--bd);border-radius:20px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;color:var(--g1);transition:all 0.15s;" title="${label}">${emoji} <span class="rxn-count">0</span></button>`).join('')}
      </div>
    </div>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid var(--bd);">
      <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--g2);margin-bottom:12px;">Share this story</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:#1877f2;color:white;border-radius:3px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;text-decoration:none;">f Share on Facebook</a>
        <a href="https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:#0077b5;color:white;border-radius:3px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;text-decoration:none;">in Share on LinkedIn</a>
        <a href="mailto:?subject=${shareTitle}&body=${shareBody}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:var(--surface);border:1.5px solid var(--bd);color:var(--navy);border-radius:3px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;text-decoration:none;">✉ Share via Email</a>
        <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>alert('Link copied!'))" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:var(--surface);border:1.5px solid var(--bd);color:var(--navy);border-radius:3px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;">🔗 Copy Link</button>
      </div>
    </div>`
  document.getElementById('modal').classList.add('open');
  history.pushState({articleId: id}, '', '/story/' + id);
  document.getElementById('modal').scrollTop = 0;
  document.body.style.overflow='hidden';
  window._articleFontSize = 16;
  // Inject Leaflet map into article body if this article has map data
  if (a.mapMarker) {
    setTimeout(() => renderArticleMap(a), 80);
  }
  // Wire hover count-up on callouts after render
  setTimeout(() => initCalloutHovers(), 120);
  // Wire clickable images for lightbox enlargement
  setTimeout(() => initArticleImageLightbox(), 120);
}
function closeArticle(){
  document.getElementById('modal').classList.remove('open');
  if (location.pathname.startsWith('/story/')) history.pushState({}, '', '/');
  document.body.style.overflow='';
  // Destroy any active Leaflet map to avoid ID conflicts
  if (window._articleLeafletMap) {
    try { window._articleLeafletMap.remove(); } catch(e){}
    window._articleLeafletMap = null;
  }
}

function initCalloutHovers() {
  const callouts = document.querySelectorAll('#modal .data-callout');
  callouts.forEach(callout => {
    const el = callout.querySelector('.data-callout-num');
    if (!el) return;
    const raw = el.textContent.trim();

    // Parse number, prefix, suffix once
    const match = raw.match(/^([^0-9\-]*)([0-9][0-9,.]*)(.*)$/);
    if (!match) return;
    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const target = parseFloat(numStr);
    if (isNaN(target) || target === 0) return;

    const isDecimal = numStr.includes('.');
    const decimalPlaces = isDecimal ? (numStr.split('.')[1] || '').length : 0;
    const hasCommas = match[2].includes(',');

    let rafId = null;

    function runCountUp() {
      if (rafId) cancelAnimationFrame(rafId);
      const duration = 650;
      const startTime = performance.now();
      const easeOut = t => 1 - Math.pow(1 - t, 3);

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = target * easeOut(progress);
        let display;
        if (isDecimal) {
          display = value.toFixed(decimalPlaces);
        } else {
          const rounded = Math.round(value);
          display = hasCommas ? rounded.toLocaleString() : String(rounded);
        }
        el.textContent = prefix + display + suffix;
        if (progress < 1) rafId = requestAnimationFrame(tick);
        else el.textContent = raw;
      }
      rafId = requestAnimationFrame(tick);
    }

    function resetStatic() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      el.textContent = raw;
    }

    callout.addEventListener('mouseenter', runCountUp);
    callout.addEventListener('mouseleave', resetStatic);
  });
}

// ── Flightline Brief: collapse/expand with localStorage memory ─────────
function toggleBrief() {
  const brief = document.getElementById('flightline-brief');
  if (!brief) return;
  const nowCollapsed = !brief.classList.contains('brief-collapsed');
  brief.classList.toggle('brief-collapsed');
  const header = brief.querySelector('.brief-header');
  if (header) header.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
  try { localStorage.setItem('fl_brief_collapsed', nowCollapsed ? '1' : '0'); } catch(e){}
}

// ── Article image lightbox: click any article-body image to enlarge ────
function initArticleImageLightbox() {
  const imgs = document.querySelectorAll('#article-body-text img');
  imgs.forEach(img => {
    if (img.dataset.lightboxWired) return;
    img.dataset.lightboxWired = '1';
    img.style.cursor = 'zoom-in';
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Click to enlarge image');
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      // Find associated caption: prefer parent figure's figcaption
      let caption = '';
      const figure = img.closest('figure');
      if (figure) {
        const fc = figure.querySelector('figcaption');
        if (fc) caption = fc.innerHTML;
      }
      // Fallback to alt text
      if (!caption && img.alt) caption = '<span style="font-style:italic;">' + img.alt + '</span>';
      openImageLightbox(img.src, caption, img.alt || '');
    });
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        img.click();
      }
    });
  });
}

function openImageLightbox(src, captionHTML, altText) {
  // Lazy-create lightbox container the first time it's needed
  let lb = document.getElementById('fl-image-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'fl-image-lightbox';
    lb.className = 'fl-image-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image enlargement');
    lb.innerHTML = `
      <button class="fl-lightbox-close" onclick="closeImageLightbox()" aria-label="Close enlarged image">×</button>
      <div class="fl-lightbox-inner" onclick="closeImageLightbox()">
        <img class="fl-lightbox-img" alt="" onclick="event.stopPropagation()">
        <div class="fl-lightbox-caption" onclick="event.stopPropagation()"></div>
      </div>
    `;
    document.body.appendChild(lb);
  }
  lb.querySelector('.fl-lightbox-img').src = src;
  lb.querySelector('.fl-lightbox-img').alt = altText || '';
  lb.querySelector('.fl-lightbox-caption').innerHTML = captionHTML || '';
  // Hide caption block if empty
  lb.querySelector('.fl-lightbox-caption').style.display = captionHTML ? 'block' : 'none';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeImageLightbox() {
  const lb = document.getElementById('fl-image-lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  // Re-lock scroll if article modal is still open
  if (document.getElementById('modal').classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function renderArticleMap(a) {
  if (!a.mapMarker || typeof L === 'undefined') return;
  const coords = a.mapMarker.split(',').map(Number);
  if (coords.length < 2 || isNaN(coords[0])) return;
  const lat = coords[0], lng = coords[1];

  // Build map HTML and inject into article body
  const bodyEl = document.getElementById('article-body-text');
  if (!bodyEl) return;

  // Remove any existing inline map
  const existing = bodyEl.querySelector('.article-map-wrap');
  if (existing) existing.remove();

  // Create map container
  const mapId = 'article-leaflet-map-' + Date.now();
  const wrap = document.createElement('div');
  wrap.className = 'article-map-wrap';
  wrap.innerHTML = `
    <div class="article-map-label">📍 Location</div>
    <div id="${mapId}" class="article-map"></div>
    <div class="article-map-sublabel">
      <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener">Open in Google Maps ↗</a>
    </div>`;

  // Insert after last data-callout, or after first <p> if none
  const callouts = bodyEl.querySelectorAll('.data-callout');
  if (callouts.length > 0) {
    const last = callouts[callouts.length - 1];
    last.parentNode.insertBefore(wrap, last.nextSibling);
  } else {
    const firstP = bodyEl.querySelector('p');
    if (firstP && firstP.nextSibling) {
      firstP.parentNode.insertBefore(wrap, firstP.nextSibling);
    } else {
      bodyEl.appendChild(wrap);
    }
  }

  // Init Leaflet map
  requestAnimationFrame(() => {
    try {
      const map = L.map(mapId, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true
      });
      window._articleLeafletMap = map;

      // Esri World Imagery — satellite, free, no API key
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }).addTo(map);
      // Label overlay on top of satellite
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '',
        subdomains: 'abcd',
        maxZoom: 19,
        pane: 'overlayPane'
      }).addTo(map);

      // Custom clean marker
      const markerIcon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:var(--navy);border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -32]
      });

      const label = a.mapQuery || a.headline || 'Location';
      L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`<strong>${label}</strong>`)
        .openPopup();
    } catch(e) { console.warn('Map render failed:', e); }
  });
}
function closeDropdown() {
  const dd = document.getElementById('search-dropdown');
  dd.classList.remove('open');
  dd.innerHTML = '';
}
// Delegation-based search click handler — attached once, handles all dropdown clicks
document.addEventListener('DOMContentLoaded', function() {
  const dd = document.getElementById('search-dropdown');
  if (!dd) return;
  dd.addEventListener('mousedown', function(e) {
    e.preventDefault();
    const item = e.target.closest('[data-article-id]');
    const footer = e.target.closest('[data-search-q]');
    if (item) {
      const id = item.getAttribute('data-article-id');
      closeDropdown();
      openArticle(id);
    } else if (footer) {
      const q = footer.getAttribute('data-search-q');
      closeDropdown();
      runSearch(q);
    }
  });
});

function positionDropdown(inputEl) {
  const input = inputEl || document.getElementById('search-input');
  const dd = document.getElementById('search-dropdown');
  const rect = input.getBoundingClientRect();
  const ddWidth = 380;
  // Prefer right-align to input's right edge; clamp to viewport
  let right = window.innerWidth - rect.right - 2;
  if (right < 8) right = 8;
  dd.style.top = (rect.bottom + 6) + 'px';
  dd.style.right = 'auto';
  dd.style.left = Math.max(8, rect.right - ddWidth) + 'px';
  dd.style.width = ddWidth + 'px';
  // If footer search, position above if near bottom of screen
  if (inputEl && inputEl.id === 'footer-search-input') {
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 260) {
      dd.style.top = (rect.top - 6) + 'px';
      dd.style.transform = 'translateY(-100%)';
    } else {
      dd.style.transform = '';
    }
  } else {
    dd.style.transform = '';
  }
}

function liveSearch(q, inputEl) {
  q = (q || '').trim();
  const dd = document.getElementById('search-dropdown');
  if (!q || q.length < 2) { closeDropdown(); return; }

  const lower = q.toLowerCase();
  const CAT_COLORS_MAP = {
    news:'var(--cat-news)', govt:'var(--cat-govt)', dev:'var(--cat-dev)',
    opinion:'var(--cat-opinion)', events:'var(--cat-events)', military:'var(--cat-military)',
    education:'var(--cat-education)', sports:'var(--cat-sports)'
  };
  const results = [];
  Object.entries(A).forEach(([id, a]) => {
    const searchable = [a.headline, a.dek, a.label].join(' ').toLowerCase();
    if (searchable.includes(lower)) results.push({ id, ...a });
  });
  results.sort((a,b) => pubDate(b.id) - pubDate(a.id));

  positionDropdown(inputEl);

  if (!results.length) {
    dd.innerHTML = `<div class="search-drop-empty">No results for "<strong>${q}</strong>"</div>`;
    dd.classList.add('open');
    return;
  }

  const topResults = results.slice(0, 5);
  const itemsHtml = topResults.map(a => {
    const color = CAT_COLORS_MAP[a.cat] || 'var(--navy)';
    return `<div class="search-drop-item" data-article-id="${a.id}" style="cursor:pointer">
      <div class="search-drop-cat" style="color:${color};pointer-events:none">${a.label}</div>
      <div class="search-drop-text" style="pointer-events:none">
        <div class="search-drop-headline">${a.headline}</div>
        <div class="search-drop-dek">${a.dek}</div>
      </div>
    </div>`;
  }).join('');

  const safeQ = q.replace(/"/g, '&quot;');
  const footerHtml = `<div class="search-drop-footer" data-search-q="${safeQ}" style="cursor:pointer">See all ${results.length} result${results.length !== 1 ? 's' : ''} for "${q}" →</div>`;

  dd.innerHTML = itemsHtml + footerHtml;
  dd.classList.add('open');
}

function highlight(text, q) {
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return text.replace(new RegExp(`(${escaped})`,'gi'),'<span class="search-highlight">$1</span>');
}

function runSearch(q) {
  q = (q || '').trim();
  if (!q) return;

  const lower = q.toLowerCase();
  const results = [];

  Object.entries(A).forEach(([id, a]) => {
    const searchable = [a.headline, a.dek, a.byline, a.body.replace(/<[^>]+>/g,''), a.label].join(' ').toLowerCase();
    if (searchable.includes(lower)) {
      results.push({ id, ...a });
    }
  });
  results.sort((a,b) => pubDate(b.id) - pubDate(a.id));

  // Show search page
  document.querySelectorAll('.home-page,.cat-page,.static-page,.search-page').forEach(el => {
    el.classList.remove('active');
    if (el.classList.contains('home-page')) el.classList.add('hidden');
  });
  document.getElementById('page-search').classList.add('active');
  document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
  window.scrollTo(0,0);

  document.getElementById('search-page-title').textContent = results.length
    ? `Results for "${q}"`
    : `No results for "${q}"`;
  document.getElementById('search-page-sub').textContent = results.length
    ? `${results.length} article${results.length !== 1 ? 's' : ''} found`
    : '';

  const list = document.getElementById('search-results-list');
  if (!results.length) {
    list.innerHTML = `<div class="search-no-results">No articles matched "<strong>${q}</strong>." Try a different term — a name, neighborhood, topic or keyword.</div>`;
    return;
  }

  list.innerHTML = results.map(a => `
    <div class="search-result-item" onclick="openArticle('${a.id}')">
      <span class="cat-badge cat-${a.cat}" style="margin-bottom:8px;">${catDisplay(a.cat)}</span>
      <div class="search-result-headline">${highlight(a.headline, q)}</div>
      <div class="search-result-dek">${highlight(a.dek, q)}</div>
      <div class="search-result-meta">
        <span>${a.byline}</span><span>·</span><span>${a.date}</span>
      </div>
    </div>`).join('');
}

// ─── COMMUNITY CALENDAR ENGINE ───────────────────────────────────────────────

const CAL_EVENTS = [
  // ── APRIL 2026 ──────────────────────────────────────────────────
  { id:'santana',        day:1,  month:3, year:2026, title:'Santana: Oneness Tour',               time:'8:00 PM',                    venue:'Pensacola Bay Center',           cat:'entertainment', color:'#5a3d7a', url:'https://www.pensacolabaycenter.com/events/detail/santana-tour' },
  { id:'zztop',          day:2,  month:3, year:2026, title:'ZZ Top',                              time:'7:30 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#1e2d4a', url:'https://www.pensacolasaenger.com/events/zz-top-the-big-one' },
  { id:'fantasia',       day:3,  month:3, year:2026, title:'Fantasia & Anthony Hamilton',         time:'8:00 PM',                    venue:'Pensacola Bay Center',           cat:'entertainment', color:'#8a6e3a', url:'https://www.ticketmaster.com/fantasia-anthony-hamilton-pensacola-florida-04-03-2026/event/1B0062FCCF9854B5' },
  { id:'gary-owen',      day:3,  month:3, year:2026, title:'Gary Owen',                           time:'8:00 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#1e2d4a' , url:'https://www.pensacolasaenger.com/events/gary-owen' },
  { id:'wahoos-open',    day:3,  month:3, year:2026, title:'Blue Wahoos Home Opener',             time:'6:05 PM',                    venue:'Blue Wahoos Stadium',            cat:'sports',        color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'egghunt',        day:4,  month:3, year:2026, title:'Egga-Wahooza Easter Egg Hunt',        time:'11:00 AM · Free',            venue:'Community Maritime Park',        cat:'family',        color:'#1a8a6e' , url:'https://pensacolachurch.org/eggawahooza/' },
  { id:'bandsbeach',     day:7,  month:3, year:2026, title:'Bands on the Beach — Season Opener', time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a', url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'escambia-apr8',  day:8,  month:3, year:2026, title:'Escambia County Commission Meeting', time:'9:00 AM',                    venue:'County Center',                  cat:'government',    color:'#c2553f' , url:'https://myescambia.com/our-services/boards-committees/board-of-county-commissioners' },
  { id:'mrs-doubtfire1', day:7,  month:3, year:2026, title:'Mrs. Doubtfire the Musical',         time:'7:30 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#8a6e3a', url:'https://www.pensacolasaenger.com/events/mrs-doubtfire-the-musical' },
  { id:'mrs-doubtfire2', day:8,  month:3, year:2026, title:'Mrs. Doubtfire the Musical',         time:'7:30 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#8a6e3a', url:'https://www.pensacolasaenger.com/events/mrs-doubtfire-the-musical' },
  { id:'iglesias',       day:11, month:3, year:2026, title:'Gabriel Iglesias: The 1976 Tour',    time:'Doors 7PM · Show 8PM',       venue:'Pensacola Bay Center',           cat:'entertainment', color:'#5a3d7a', url:'https://www.ticketmaster.com/gabriel-fluffy-iglesias-the-1976-tour-pensacola-florida-04-11-2026/event/1B006390CD61D0CB' },
  { id:'pso-candlelight',day:11, month:3, year:2026, title:'Candlelight Concert',                time:'TBD',                        venue:'First United Methodist Church',  cat:'entertainment', color:'#8a6e3a' , url:'https://www.eventbrite.com/e/candlelight-pensacola' },
  { id:'citycouncil',    day:14, month:3, year:2026, title:'Pensacola City Council Meeting',     time:'5:30 PM',                    venue:'City Hall, 222 W Main St',       cat:'government',    color:'#c2553f' , url:'https://www.cityofpensacola.com/193/City-Council' },
  { id:'bandsbeach2',    day:14, month:3, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'gaffigan',       day:16, month:3, year:2026, title:'Jim Gaffigan',                       time:'7:00 PM',                    venue:'Pensacola Bay Center',           cat:'entertainment', color:'#1e2d4a', url:'https://www.pensacolabaycenter.com/events/detail/jim-gaffigan' },
  { id:'gallery-apr',    day:17, month:3, year:2026, title:'Gallery Night — Navy Days Theme',    time:'6:00–10:00 PM · Free',       venue:'Govt St & Jefferson, Downtown',  cat:'arts',          color:'#d4952b', url:'https://gallerynightpensacola.org' },
  { id:'panchiko',       day:20, month:3, year:2026, title:'Panchiko',                           time:'7:00 PM',                    venue:'Vinyl Music Hall',               cat:'entertainment', color:'#5a3d7a', url:'https://www.vinylmusichall.com' },
  { id:'bandsbeach3',    day:21, month:3, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'sesame',         day:22, month:3, year:2026, title:'Sesame Street Live',                 time:'6:00 PM',                    venue:'Saenger Theatre',                cat:'family',        color:'#1a8a6e' , url:'https://www.ticketmaster.com/sesame-street-live-pensacola' },
  { id:'escambia-apr22', day:22, month:3, year:2026, title:'Escambia County Commission Meeting', time:'9:00 AM',                    venue:'County Center',                  cat:'government',    color:'#c2553f' , url:'https://myescambia.com/our-services/boards-committees/board-of-county-commissioners' },
  { id:'crawfishfest',   day:24, month:3, year:2026, title:'Pensacola Crawfish Festival',        time:'All day',                    venue:'Palafox St, Downtown',           cat:'festival',      color:'#8a6e3a', url:'https://pensacolabeachcrawfishfestival.com/' },
  { id:'symphony100',       day:25, month:3, year:2026, title:'PSO 100th Anniversary Gala',        time:'7:30 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#1e2d4a', url:'https://www.ticketmaster.com/pensacola-symphony-orchestra-100th-anniversary-gala-pensacola-florida-04-25-2026/event/1B0062AEE7FB7374' },
  { id:'mullettoss',     day:26, month:3, year:2026, title:'Flora-Bama Mullet Toss',             time:'All day',                    venue:'Flora-Bama, Perdido Key',        cat:'festival',      color:'#1a8a6e', url:'https://www.florabama.com/mullet-toss' },
  { id:'mullettoss2',    day:27, month:3, year:2026, title:'Flora-Bama Mullet Toss — Day 2',    time:'All day',                    venue:'Flora-Bama, Perdido Key',        cat:'festival',      color:'#1a8a6e' , url:'https://www.florabama.com/mullet-toss' },
  { id:'bandsbeach4',    day:28, month:3, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'bavarian1',      day:30, month:3, year:2026, title:'Great Bavarian Circus — Opens',      time:'Multiple shows daily',       venue:'Pensacola Fairgrounds',          cat:'family',        color:'#1a8a6e', url:'https://www.visitpensacola.com/events/' },

  // ── MAY 2026 ───────────────────────────────────────────────────
  { id:'clutchvinyl',         day:1,  month:4, year:2026, title:'Clutch',                             time:'7:30 PM',                    venue:'Vinyl Music Hall',               cat:'entertainment', color:'#5a3d7a', url:'https://www.vinylmusichall.com' },
  { id:'krewe-sirens',   day:2,  month:4, year:2026, title:'Krewe of Sirens Beach Day',          time:'3:00–7:00 PM · Free',        venue:'Bounce Beach, Pensacola Beach',  cat:'festival',      color:'#1a8a6e', url:'https://visitpensacolabeach.com/event-calendar/' },
  { id:'comedy-may',     day:2,  month:4, year:2026, title:'Pensacola Comedy Club',              time:'7:30 PM',                    venue:"Genie's Coffee Shop",            cat:'entertainment', color:'#8a6e3a', url:'https://visitpensacolabeach.com/event-calendar/' },
  { id:'bavarian-may',   day:3,  month:4, year:2026, title:'Great Bavarian Circus',              time:'Multiple shows daily',       venue:'Pensacola Fairgrounds',          cat:'family',        color:'#1a8a6e', url:'https://www.visitpensacola.com/events/' },
  { id:'bandsmay5',day:5,  month:4, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'alicecooper',   day:3,  month:4, year:2026, title:'Alice Cooper',                       time:'7:00 PM',                    venue:'Pensacola Bay Center',           cat:'entertainment', color:'#5a3d7a', url:'https://www.pensacolabaycenter.com/events/detail/alice-cooper' },
  { id:'artwine', day:9,  month:4, year:2026, title:'Pensacola Beach Art & Wine Festival',time:'11:00 AM–4:00 PM · Free',    venue:'Pensacola Beach Boardwalk',      cat:'arts',          color:'#d4952b', url:'https://www.visitpensacola.com/events/2026-pensacola-beach-art-and-wine-festival/' },
  { id:'disneyice',    day:9,  month:4, year:2026, title:'Disney on Ice: Jump In! (Noon)',     time:'12:00 PM',                   venue:'Pensacola Bay Center',           cat:'family',        color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/disney-on-ice' },
  { id:'disneyice',    day:9,  month:4, year:2026, title:'Disney on Ice: Jump In! (Evening)',  time:'6:00 PM',                    venue:'Pensacola Bay Center',           cat:'family',        color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/disney-on-ice' },
  { id:'disneyice',    day:10, month:4, year:2026, title:'Disney on Ice: Jump In! (Noon)',     time:'12:00 PM',                   venue:'Pensacola Bay Center',           cat:'family',        color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/disney-on-ice' },
  { id:'citycouncil-may',day:12, month:4, year:2026, title:'Pensacola City Council Meeting',     time:'5:30 PM',                    venue:'City Hall, 222 W Main St',       cat:'government',    color:'#c2553f' , url:'https://www.cityofpensacola.com/193/City-Council' },
  { id:'escambia-may',   day:13, month:4, year:2026, title:'Escambia County Commission Meeting', time:'9:00 AM',                    venue:'County Center',                  cat:'government',    color:'#c2553f' , url:'https://myescambia.com/our-services/boards-committees/board-of-county-commissioners' },
  { id:'bandsmay12',day:12, month:4, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'gallerynightmay',    day:15, month:4, year:2026, title:'Gallery Night — Festa Italiana',     time:'6:00–10:00 PM · Free',       venue:'Govt St & Jefferson, Downtown',  cat:'arts',          color:'#d4952b' , url:'https://gallerynightpensacola.org' },
  { id:'pickleswings',  day:16, month:4, year:2026, title:'Pickles & Wings Family Festival',    time:'10:00 AM–8:00 PM · Free',    venue:'Seville Square',                 cat:'festival',      color:'#8a6e3a', url:'https://visitpensacolabeach.com/event-calendar/' },
  { id:'iration',        day:19, month:4, year:2026, title:'Iration',                            time:'7:00 PM',                    venue:'Vinyl Music Hall',               cat:'entertainment', color:'#1a8a6e', url:'https://www.vinylmusichall.com' },
  { id:'bandsmay19',day:19, month:4, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'bandsmay26',day:26, month:4, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'grandfiesta',  day:29, month:4, year:2026, title:'Grand Fiesta Parade',                time:'6:00 PM',                    venue:'Palafox St, Downtown',           cat:'festival',      color:'#8a6e3a', url:'https://www.fiestapensacola.org/' },
  { id:'pride-may',      day:23, month:4, year:2026, title:'Pensacola Pride — Weekend',          time:'All day',                    venue:'Park East, Pensacola Beach',     cat:'festival',      color:'#d4952b', url:'https://pensapride.org/festival/' },
  { id:'pride-may2',     day:24, month:4, year:2026, title:'Pensacola Pride — Weekend',          time:'All day',                    venue:'Park East, Pensacola Beach',     cat:'festival',      color:'#d4952b', url:'https://pensapride.org/festival/' },

  // ── JUNE 2026 ──────────────────────────────────────────────────
  { id:'gallerynightjun',    day:19, month:5, year:2026, title:'Gallery Night — Journey to Juneteenth', time:'6:00–10:00 PM · Free',  venue:'Govt St & Jefferson, Downtown',  cat:'arts',          color:'#d4952b' , url:'https://gallerynightpensacola.org' },
  { id:'bandsjun2',day:2,  month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'bandsjun9',day:9,  month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'bandsjun16',day:16, month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'bandsjun23',day:23, month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },
  { id:'bandsjun30',day:30, month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-bands-on-beach/' },

  // ── JULY 2026 ──────────────────────────────────────────────────
  { id:'4th-july',       day:4,  month:6, year:2026, title:'4th of July Fireworks',              time:'5:00 PM',                    venue:'Bayfront Pkwy, Downtown',        cat:'festival',      color:'#c2553f' , url:'https://www.visitpensacola.com/events/signature-events/' },
  { id:'airshow1',       day:18, month:6, year:2026, title:'Pensacola Beach Air Show',           time:'All day',                    venue:'Pensacola Beach',                cat:'entertainment', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-calendar/' },
  { id:'airshow2',       day:19, month:6, year:2026, title:'Pensacola Beach Air Show — Blue Angels', time:'All day',              venue:'Pensacola Beach',                cat:'entertainment', color:'#1e2d4a' , url:'https://visitpensacolabeach.com/whats-happening-calendar/' },
  { id:'gallery-jul',    day:17, month:6, year:2026, title:'Gallery Night — Future Makers',      time:'6:00–10:00 PM · Free',       venue:'Govt St & Jefferson, Downtown',  cat:'arts',          color:'#d4952b' , url:'https://gallerynightpensacola.org' },
  // ── ADDED Apr 25 - Jun 30 2026 ───────────────────────────────────
  { id:'queentribute', day:28, month:3, year:2026, title:'One Night of Queen — Gary Mullen & The Works', time:'7:30 PM', venue:'Saenger Theatre', cat:'music', color:'#1e2d4a', url:'https://www.ticketmaster.com/event/1B006383FFA1A0D9' },
  { id:'wahoosbiloxi', day:28, month:3, year:2026, title:'Blue Wahoos vs. Biloxi Shuckers', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbiloxi', day:29, month:3, year:2026, title:'Blue Wahoos vs. Biloxi Shuckers', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbiloxi', day:30, month:3, year:2026, title:'Blue Wahoos vs. Biloxi Shuckers', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbiloxi', day:1, month:4, year:2026, title:'Blue Wahoos vs. Biloxi Shuckers', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbiloxi', day:2, month:4, year:2026, title:'Blue Wahoos vs. Biloxi Shuckers', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbiloxi', day:3, month:4, year:2026, title:'Blue Wahoos vs. Biloxi Shuckers', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'islandfights96', day:1, month:4, year:2026, title:'Island Fights 96', time:'6:30 PM', venue:'Pensacola Bay Center', cat:'sports', color:'#1a6a9a', url:'https://www.pensacolabaycenter.com/events/detail/island-fights-96' },
  { id:'uwfgrad', day:2, month:4, year:2026, title:'UWF Spring 2026 Commencement', time:'All day', venue:'Pensacola Bay Center', cat:'community', color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/uwf-spring-commencement-ceremony-26' },
  { id:'caputo', day:2, month:4, year:2026, title:'Theresa Caputo LIVE: The Experience', time:'7:30 PM', venue:'Saenger Theatre', cat:'entertainment', color:'#5a3d7a', url:'https://www.ticketmaster.com/event/1B00631DE688707F' },
  { id:'beachartwalk', day:3, month:4, year:2026, title:'Pensacola Beach Art Walk', time:'11:00 AM-6 PM · Free', venue:'Pensacola Beach Boardwalk', cat:'arts', color:'#d4952b', url:'https://visitpensacolabeach.com/whats-happening-calendar/' },
  { id:'wahoosrocket', day:5, month:4, year:2026, title:'Blue Wahoos vs. Rocket City Trash Pandas', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosrocket', day:6, month:4, year:2026, title:'Blue Wahoos vs. Rocket City Trash Pandas', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosrocket', day:7, month:4, year:2026, title:'Blue Wahoos vs. Rocket City Trash Pandas', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosrocket', day:8, month:4, year:2026, title:'Blue Wahoos vs. Rocket City Trash Pandas', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosrocket', day:9, month:4, year:2026, title:'Blue Wahoos vs. Rocket City Trash Pandas', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosrocket', day:10, month:4, year:2026, title:'Blue Wahoos vs. Rocket City Trash Pandas', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'chorus8', day:8, month:4, year:2026, title:"Pensacola Children's Chorus: Showtime 2026", time:'Fri/Sat 7:30, Sun 2:30', venue:'Saenger Theatre', cat:'family', color:'#1a8a6e', url:'https://www.ticketmaster.com/event/1B00634728DC82E8' },
  { id:'chorus8', day:9, month:4, year:2026, title:"Pensacola Children's Chorus: Showtime 2026", time:'Fri/Sat 7:30, Sun 2:30', venue:'Saenger Theatre', cat:'family', color:'#1a8a6e', url:'https://www.ticketmaster.com/event/1B00634728DC82E8' },
  { id:'chorus8', day:10, month:4, year:2026, title:"Pensacola Children's Chorus: Showtime 2026", time:'Fri/Sat 7:30, Sun 2:30', venue:'Saenger Theatre', cat:'family', color:'#1a8a6e', url:'https://www.ticketmaster.com/event/1B00634728DC82E8' },
  { id:'disneyice', day:8, month:4, year:2026, title:'Disney On Ice presents Jump In!', time:'Multiple show times', venue:'Pensacola Bay Center', cat:'family', color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/disney-on-ice-6' },
  { id:'sandpiperstrut', day:9, month:4, year:2026, title:'Sandpiper Strut 4-Mile Run', time:'7:00 AM', venue:'Pensacola Beach', cat:'sports', color:'#1a6a9a', url:'https://runpensacola.com/' },
  { id:'britfloyd', day:12, month:4, year:2026, title:'Brit Floyd: The Moon, The Wall, and Beyond', time:'7:30 PM', venue:'Saenger Theatre', cat:'music', color:'#1e2d4a', url:'https://www.ticketmaster.com/event/1B006379F79ADCF5' },
  { id:'pscgrad', day:13, month:4, year:2026, title:'PSC Graduation Ceremony 2026', time:'All day', venue:'Pensacola Bay Center', cat:'community', color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/psc-graduation-ceremony-2028' },
  { id:'thorogood', day:13, month:4, year:2026, title:'George Thorogood & The Destroyers', time:'7:30 PM', venue:'Saenger Theatre', cat:'music', color:'#1e2d4a', url:'https://www.ticketmaster.com/event/1B00642FE7A6AF0D' },
  { id:'salvulcano', day:15, month:4, year:2026, title:"Sal Vulcano: Everything's Fine Tour", time:'7:00 PM', venue:'Saenger Theatre', cat:'entertainment', color:'#5a3d7a', url:'https://www.ticketmaster.com/event/1B00634834EBC012' },
  { id:'cinemasandzoo', day:15, month:4, year:2026, title:'Cinemas in the Sand: Zootopia 2', time:'After sunset · Free', venue:'Gulfside Pavilion', cat:'family', color:'#1a8a6e', url:'https://visitpensacolabeach.com/whats-happening-calendar/' },
  { id:'pressthechest', day:17, month:4, year:2026, title:'Press the Chest CPR Community Event', time:'All day · Free', venue:'Pensacola Bay Center', cat:'community', color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/gulf-coast-press-the-chest-community-cpr-event' },
  { id:'jimbreuer', day:18, month:4, year:2026, title:'Jim Breuer: Find the Funny Tour', time:'7:30 PM', venue:'Saenger Theatre', cat:'entertainment', color:'#5a3d7a', url:'https://www.ticketmaster.com/event/1B006477D624FA63' },
  { id:'wahooscolumbus', day:19, month:4, year:2026, title:'Blue Wahoos vs. Columbus Clingstones', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooscolumbus', day:20, month:4, year:2026, title:'Blue Wahoos vs. Columbus Clingstones', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooscolumbus', day:21, month:4, year:2026, title:'Blue Wahoos vs. Columbus Clingstones', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooscolumbus', day:22, month:4, year:2026, title:'Blue Wahoos vs. Columbus Clingstones', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooscolumbus', day:23, month:4, year:2026, title:'Blue Wahoos vs. Columbus Clingstones', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooscolumbus', day:24, month:4, year:2026, title:'Blue Wahoos vs. Columbus Clingstones', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'memorialweekend', day:21, month:4, year:2026, title:'Memorial Weekend Pensacola Beach', time:'Daily events', venue:'Pensacola Beach Park East', cat:'festival', color:'#d4952b', url:'https://www.eventbrite.com/e/memorial-weekend-pensacola-beach-2026-tickets-1388412873279' },
  { id:'memorialweekend', day:22, month:4, year:2026, title:'Memorial Weekend Pensacola Beach', time:'Daily events', venue:'Pensacola Beach Park East', cat:'festival', color:'#d4952b', url:'https://www.eventbrite.com/e/memorial-weekend-pensacola-beach-2026-tickets-1388412873279' },
  { id:'memorialweekend', day:23, month:4, year:2026, title:'Memorial Weekend Pensacola Beach', time:'Daily events', venue:'Pensacola Beach Park East', cat:'festival', color:'#d4952b', url:'https://www.eventbrite.com/e/memorial-weekend-pensacola-beach-2026-tickets-1388412873279' },
  { id:'memorialweekend', day:24, month:4, year:2026, title:'Memorial Weekend Pensacola Beach', time:'Daily events', venue:'Pensacola Beach Park East', cat:'festival', color:'#d4952b', url:'https://www.eventbrite.com/e/memorial-weekend-pensacola-beach-2026-tickets-1388412873279' },
  { id:'memorialweekend', day:25, month:4, year:2026, title:'Memorial Weekend Pensacola Beach', time:'Daily events', venue:'Pensacola Beach Park East', cat:'festival', color:'#d4952b', url:'https://www.eventbrite.com/e/memorial-weekend-pensacola-beach-2026-tickets-1388412873279' },
  { id:'memorialdayceremony', day:24, month:4, year:2026, title:'Memorial Day Ceremony', time:'Late morning · Free', venue:'Veterans Memorial Park', cat:'community', color:'#1a8a6e', url:'https://www.veteransmemorialparkpensacola.org/memorial-day-home' },
  { id:'escambiagrad', day:26, month:4, year:2026, title:'Escambia County HS Graduations', time:'Multiple ceremonies', venue:'Pensacola Bay Center', cat:'community', color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/escambia-county-2023-graduation-2' },
  { id:'escambiagrad', day:27, month:4, year:2026, title:'Escambia County HS Graduations', time:'Multiple ceremonies', venue:'Pensacola Bay Center', cat:'community', color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/escambia-county-2023-graduation-2' },
  { id:'thirtyeightspecial', day:28, month:4, year:2026, title:'38 Special', time:'7:00 PM', venue:'Saenger Theatre', cat:'music', color:'#1e2d4a', url:'https://www.ticketmaster.com/event/1B006436BDCACC79' },
  { id:'santarosagrad', day:29, month:4, year:2026, title:'Santa Rosa County HS Graduation', time:'All day', venue:'Pensacola Bay Center', cat:'community', color:'#1a8a6e', url:'https://www.pensacolabaycenter.com/events/detail/santa-rosa-county-high-school-graduation-2025' },
  { id:'wahooschattanooga', day:2, month:5, year:2026, title:'Blue Wahoos vs. Chattanooga Lookouts', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooschattanooga', day:3, month:5, year:2026, title:'Blue Wahoos vs. Chattanooga Lookouts', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooschattanooga', day:4, month:5, year:2026, title:'Blue Wahoos vs. Chattanooga Lookouts', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooschattanooga', day:5, month:5, year:2026, title:'Blue Wahoos vs. Chattanooga Lookouts', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooschattanooga', day:6, month:5, year:2026, title:'Blue Wahoos vs. Chattanooga Lookouts', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahooschattanooga', day:7, month:5, year:2026, title:'Blue Wahoos vs. Chattanooga Lookouts', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'motown', day:13, month:5, year:2026, title:'Magic of Motown featuring The Motowners', time:'7:30 PM', venue:'Saenger Theatre', cat:'music', color:'#1e2d4a', url:'https://www.ticketmaster.com/event/1B006437D4A5F13C' },
  { id:'beetlejuice16', day:16, month:5, year:2026, title:'Beetlejuice: The Musical', time:'7:30 PM', venue:'Saenger Theatre', cat:'entertainment', color:'#5a3d7a', url:'https://www.ticketmaster.com/event/1B00628AE0215814' },
  { id:'beetlejuice16', day:17, month:5, year:2026, title:'Beetlejuice: The Musical', time:'7:30 PM', venue:'Saenger Theatre', cat:'entertainment', color:'#5a3d7a', url:'https://www.ticketmaster.com/event/1B00628AE0215814' },
  { id:'wahoosbirmingham', day:16, month:5, year:2026, title:'Blue Wahoos vs. Birmingham Barons', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbirmingham', day:17, month:5, year:2026, title:'Blue Wahoos vs. Birmingham Barons', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbirmingham', day:18, month:5, year:2026, title:'Blue Wahoos vs. Birmingham Barons', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbirmingham', day:19, month:5, year:2026, title:'Blue Wahoos vs. Birmingham Barons', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbirmingham', day:20, month:5, year:2026, title:'Blue Wahoos vs. Birmingham Barons', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'wahoosbirmingham', day:21, month:5, year:2026, title:'Blue Wahoos vs. Birmingham Barons', time:'Game time TBD', venue:'Blue Wahoos Stadium', cat:'sports', color:'#1a6a9a', url:'https://www.milb.com/pensacola/tickets' },
  { id:'imperialtriumphant', day:17, month:5, year:2026, title:'Imperial Triumphant + Fallujah', time:'7:00 PM', venue:'Vinyl Music Hall', cat:'music', color:'#1e2d4a', url:'https://vinylmusichall.com/calendar/' },
  { id:'whitetie', day:27, month:5, year:2026, title:'White Tie Rock Ensemble: Arena Rock', time:'7:30 PM', venue:'Pensacola Bay Center', cat:'music', color:'#1e2d4a', url:'https://www.pensacolabaycenter.com/events/detail/white-tie-rock-ensemble-31' },
  { id:'princessconcert', day:29, month:5, year:2026, title:'The Princess Concert', time:'3:30 PM', venue:'Saenger Theatre', cat:'family', color:'#1a8a6e', url:'https://www.ticketmaster.com/the-princess-concert-pensacola-florida-06-29-2026/event/1B00644A9AE17F8A' },

];

const CAL_CATS = {
  entertainment: { label:'Entertainment',  color:'#5a3d7a' },
  music:         { label:'Music',          color:'#1e2d4a' },
  festival:      { label:'Festival',       color:'#d4952b' },
  arts:          { label:'Arts',           color:'#c2553f' },
  family:        { label:'Family',         color:'#1a8a6e' },
  sports:        { label:'Sports',         color:'#1a6a9a' },
  government:    { label:'Government',     color:'#8a3030' },
  community:     { label:'Community',      color:'#1a8a6e' },
};

let calYear = 2026, calMonth = 3; // 0-indexed month (3 = April)
let calView = 'grid';
let calActiveFilters = new Set(Object.keys(CAL_CATS));
let calSelectedDay = null;

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TODAY = new Date();

// ── SIDEBAR CALENDAR ─────────────────────────────────────────────────────

function calInit() {
  renderCalFilters();
  renderCalMonth();
}

function renderCalFilters() {
  const el = document.getElementById('comm-cal-filters');
  if (!el) return;
  el.innerHTML = Object.entries(CAL_CATS).map(([k, c]) => `
    <div class="comm-cal-filter ${calActiveFilters.has(k) ? 'active' : ''}" 
         style="color:${c.color}; ${calActiveFilters.has(k) ? 'border-color:'+c.color+';background:'+c.color+'12;' : ''}"
         onclick="calToggleFilter('${k}')">
      <span class="comm-cal-filter-dot" style="background:${c.color};opacity:${calActiveFilters.has(k)?1:0.3};"></span>
      ${c.label}
    </div>`).join('');
}

function calToggleFilter(cat) {
  if (calActiveFilters.has(cat)) {
    if (calActiveFilters.size > 1) calActiveFilters.delete(cat);
  } else {
    calActiveFilters.add(cat);
  }
  renderCalFilters();
  renderCalMonth();
}

function calNav(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  calSelectedDay = null;
  renderCalMonth();
}

function calSetView(v) {
  calView = v;
  document.getElementById('cal-btn-grid').classList.toggle('active', v === 'grid');
  document.getElementById('cal-btn-list').classList.toggle('active', v === 'list');
  document.getElementById('comm-cal-grid-view').classList.toggle('hidden', v !== 'grid');
  document.getElementById('comm-cal-list-view').classList.toggle('visible', v === 'list');
  renderCalMonth();
}

function eventsForDay(d, m, y) {
  return CAL_EVENTS.filter(e => e.day === d && e.month === m && e.year === y && calActiveFilters.has(e.cat));
}

function renderCalMonth() {
  document.getElementById('comm-cal-month-label').textContent = MONTH_NAMES[calMonth] + ' ' + calYear;
  if (calView === 'grid') renderCalGrid();
  else renderCalList();
}

function renderCalGrid() {
  const grid = document.getElementById('comm-cal-grid');
  if (!grid) return;
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev = new Date(calYear, calMonth, 0).getDate();

  let cells = '';
  // Leading cells from prev month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    cells += `<div class="comm-cal-cell other-month"><div class="comm-cal-cell-num">${d}</div></div>`;
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === TODAY.getDate() && calMonth === TODAY.getMonth() && calYear === TODAY.getFullYear();
    const isSelected = calSelectedDay === d;
    const evs = eventsForDay(d, calMonth, calYear);
    const extraClass = (isToday ? ' today-cell' : '') + (isSelected ? ' selected-cell' : '');
    const todayBadge = isToday ? `<span class="comm-cal-cell-today-badge">Today</span>` : '';
    const maxShow = 3;
    const pips = evs.slice(0, maxShow).map(e => {
      const hasModal = typeof EVENTS !== 'undefined' && EVENTS[e.id];
      const pipAction = hasModal ? `openEvent('${e.id}')` : e.key ? `openArticle('${e.key}')` : e.url ? `window.open('${e.url}','_blank','noopener,noreferrer')` : `calSelectDay(${d})`;
      return `
      <div class="comm-cal-event-pip" style="background:${e.color};" 
           onclick="event.stopPropagation();${pipAction}" title="${e.title}">${e.title}</div>`;
    }).join('');
    const more = evs.length > maxShow ? `<div class="comm-cal-more">+${evs.length - maxShow} more</div>` : '';
    cells += `
      <div class="comm-cal-cell${extraClass}" onclick="calSelectDay(${d})">
        <div class="comm-cal-cell-num">${d} ${todayBadge}</div>
        ${pips}${more}
      </div>`;
  }
  // Trailing cells
  const total = firstDay + daysInMonth;
  const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= trailing; d++) {
    cells += `<div class="comm-cal-cell other-month"><div class="comm-cal-cell-num">${d}</div></div>`;
  }
  grid.innerHTML = cells;

  // Render day panel if a day is selected
  if (calSelectedDay !== null) renderDayPanel(calSelectedDay);
  else hideDayPanel();
}

function calSelectDay(d) {
  calSelectedDay = (calSelectedDay === d) ? null : d;
  renderCalGrid();
}

function hideDayPanel() {
  const panel = document.getElementById('comm-cal-day-panel');
  if (panel) panel.style.display = 'none';
}

function renderDayPanel(d) {
  const panel = document.getElementById('comm-cal-day-panel');
  if (!panel) return;
  const evs = eventsForDay(d, calMonth, calYear);
  const dateLabel = MONTH_NAMES[calMonth] + ' ' + d + ', ' + calYear;
  const isToday = d === TODAY.getDate() && calMonth === TODAY.getMonth() && calYear === TODAY.getFullYear();
  const todayTag = isToday ? ' <span style="font-family:\'DM Sans\';font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:var(--navy);color:white;padding:2px 7px;border-radius:2px;">Today</span>' : '';

  const items = evs.length
    ? evs.map(e => {
        const hasModal = typeof EVENTS !== 'undefined' && EVENTS[e.id];
        const action = hasModal ? `openEvent('${e.id}')` : e.key ? `openArticle('${e.key}')` : e.url ? `window.open('${e.url}','_blank')` : '';
        const clickable = action ? `onclick="${action}"` : '';
        return `
        <div class="comm-cal-day-event" ${clickable} style="cursor:${action?'pointer':'default'}">
          <div class="comm-cal-list-bar" style="background:${e.color};"></div>
          <div>
            <div class="comm-cal-list-tag" style="background:${e.color};">${CAL_CATS[e.cat]?.label || e.cat}</div>
            <div class="comm-cal-list-title">${e.title}</div>
            <div class="comm-cal-list-meta">🕐 ${e.time} &nbsp;·&nbsp; 📍 ${e.venue}</div>
          </div>
        </div>`;
      }).join('')
    : `<div class="comm-cal-day-panel-empty">No events listed for this day. <a href="javascript:void(0)" onclick="document.querySelector('.comm-cal-submit-section').scrollIntoView({behavior:'smooth'});return false;" style="color:var(--gold);font-weight:700;">Submit one →</a></div>`;

  panel.style.display = 'block';
  panel.innerHTML = `
    <div class="comm-cal-day-panel-title">
      ${dateLabel}${todayTag}
      <button class="comm-cal-day-panel-close" onclick="calSelectedDay=null;renderCalGrid()">✕</button>
    </div>
    ${items}`;
}

function renderCalList() {
  const el = document.getElementById('comm-cal-list-view');
  if (!el) return;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // Group events by day
  const grouped = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const evs = eventsForDay(d, calMonth, calYear);
    if (evs.length) grouped[d] = evs;
  }

  if (!Object.keys(grouped).length) {
    el.innerHTML = `<div style="padding:32px 0;font-size:15px;color:var(--g2);">No events match the selected filters this month.</div>`;
    return;
  }

  el.innerHTML = Object.entries(grouped).map(([d, evs]) => {
    const date = new Date(calYear, calMonth, parseInt(d));
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
    const isToday = parseInt(d) === TODAY.getDate() && calMonth === TODAY.getMonth() && calYear === TODAY.getFullYear();
    const items = evs.map(e => {
      const hasModal = typeof EVENTS !== 'undefined' && EVENTS[e.id];
      const action = hasModal ? `openEvent('${e.id}')` : e.key ? `openArticle('${e.key}')` : e.url ? `window.open('${e.url}','_blank')` : '';
      const clickable = action ? `onclick="${action}"` : '';
      return `
        <div class="comm-cal-list-item" ${clickable} style="cursor:${action?'pointer':'default'}">
          <div class="comm-cal-list-bar" style="background:${e.color};"></div>
          <div>
            <div class="comm-cal-list-tag" style="background:${e.color};">${CAL_CATS[e.cat]?.label || e.cat}</div>
            <div class="comm-cal-list-title">${e.title}</div>
            <div class="comm-cal-list-meta">🕐 ${e.time} &nbsp;·&nbsp; 📍 ${e.venue}${(hasModal || e.key) ? ' &nbsp;· <span style="color:var(--gold);font-weight:700;">Details →</span>' : ''}</div>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="comm-cal-list-group">
        <div class="comm-cal-list-date-hdr">
          ${dayName}, ${MONTH_NAMES[calMonth]} ${d}
          ${isToday ? '<span class="today-tag">Today</span>' : ''}
        </div>
        ${items}
      </div>`;
  }).join('');
}

// ── LIVE TRAFFIC — Open Route Service (CORS-safe, browser-direct) ────────
// ORS Matrix API is free, browser-accessible, and needs no server proxy.
// HERE was blocked by CORS for cross-origin browser requests.
(function() {
  // Open Route Service free tier — no CORS restrictions on browser calls
  const ORS_KEY = '5b3ce3597851110001cf62484aef3f0d40a04c0fbbaf1fcc29ef36d6';

  const ORIGINS = {
    downtown: { label:'Veterans Memorial Park',  coords:[-87.2037076, 30.4124489] },
    nas:      { label:'NAS Visitor Center',      coords:[-87.2774303, 30.3685849] },
    airport:  { label:'PNS Terminal',            coords:[-87.1861041, 30.4737579] },
    uwf:      { label:'UWF Main Entrance',       coords:[-87.2186647, 30.5418837] }
  };

  // Route destinations: [lng, lat] for ORS — destination is the Welcome to Pensacola Beach sign
  const DESTINATIONS = {
    'pcb':     { coords:[-87.1421, 30.3340], label:'Pensacola Beach (Casino Beach)',  via:'Via Bob Sikes Bridge',  miles:'8.0' },
    'navarre': { coords:[-86.8602, 30.3796], label:'Navarre Beach',                   via:'Via US-98 E',           miles:'25' },
    'perdido': { coords:[-87.4538, 30.3007], label:'Perdido Key',                     via:'Via Sorrento Rd',       miles:'18' }
  };

  // Baseline drive times in seconds per origin (used for traffic ratio coloring)
  const BASELINES = {
    downtown: { pcb: 720,  navarre: 1800, perdido: 1500 },
    nas:      { pcb: 1080, navarre: 2160, perdido: 900  },
    airport:  { pcb: 960,  navarre: 1800, perdido: 1620 },
    uwf:      { pcb: 1380, navarre: 2280, perdido: 2100 }
  };

  // Route label/via overrides per origin
  const ROUTE_LABELS = {
    downtown: {
      'pcb':     { name:'Pensacola Beach',     via:'Via US-98 E + Bob Sikes Bridge',     miles:'8' },
      'navarre': { name:'Navarre Beach',       via:'Via US-98 E + FL-87 S',              miles:'25' },
      'perdido': { name:'Perdido Key',         via:'Via Barrancas + Sorrento Rd',        miles:'17' }
    },
    nas: {
      'pcb':     { name:'Pensacola Beach',     via:'Via Navy Blvd + Bob Sikes Bridge',   miles:'13' },
      'navarre': { name:'Navarre Beach',       via:'Via US-98 E + FL-87 S',              miles:'30' },
      'perdido': { name:'Perdido Key',         via:'Via Blue Angel Pkwy + Sorrento Rd',  miles:'12' }
    },
    airport: {
      'pcb':     { name:'Pensacola Beach',     via:'Via I-110 + Bob Sikes Bridge',       miles:'12' },
      'navarre': { name:'Navarre Beach',       via:'Via I-10 E + FL-87 S',               miles:'28' },
      'perdido': { name:'Perdido Key',         via:'Via I-110 + Sorrento Rd',            miles:'21' }
    },
    uwf: {
      'pcb':     { name:'Pensacola Beach',     via:'Via I-110 + Bob Sikes Bridge',       miles:'17' },
      'navarre': { name:'Navarre Beach',       via:'Via I-10 E + FL-87 S',               miles:'30' },
      'perdido': { name:'Perdido Key',         via:'Via I-110 + Sorrento Rd',            miles:'27' }
    }
  };

  // Google Maps destination coords for click-through (Welcome to Pensacola Beach sign)
  const GMAPS_DEST = {
    'pcb':     '30.3340,-87.1421',
    'navarre': '30.3796,-86.8602',
    'perdido': '30.3007,-87.4538'
  };

  const HOURLY_PATTERN = [
    0.8,0.8,0.8,0.8,0.8,0.85,
    0.9,0.95,1.05,1.1,1.1,1.15,
    1.2,1.3,1.3,1.35,1.45,1.5,
    1.4,1.25,1.1,1.0,0.9,0.85
  ];
  const DAY_MULTIPLIER = [0.85,0.9,0.95,1.0,1.1,1.5,1.4];
  const HOUR_LABELS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a',
                        '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];

  let currentOrigin = 'downtown';
  let lastResults   = null;
  let lastIncidents = [];
  window._trafficState = { currentOrigin, lastResults, lastIncidents };

  // ── Label updater ──────────────────────────────────────────────────
  function updateRouteLabels() {
    const labels = ROUTE_LABELS[currentOrigin];
    const keys = ['pcb','navarre','perdido'];
    keys.forEach(k => {
      const nameEl = document.getElementById('traffic-name-' + k);
      const viaEl  = document.getElementById('traffic-via-'  + k);
      if (nameEl) nameEl.textContent = labels[k].name;
      if (viaEl)  viaEl.textContent  = labels[k].via + ' · ' + labels[k].miles + ' mi';
    });
  }

  // ── ORS Matrix — one call gets all 3 route durations ──────────────
  async function fetchAllRoutes() {
    const orig = ORIGINS[currentOrigin].coords; // [lng, lat]
    const dests = [
      DESTINATIONS['pcb'].coords,
      DESTINATIONS['navarre'].coords,
      DESTINATIONS['perdido'].coords
    ];

    const body = {
      locations: [orig, ...dests],
      metrics: ['duration'],
      sources: [0],
      destinations: [1, 2, 3]
    };

    const res = await fetch(
      'https://api.openrouteservice.org/v2/matrix/driving-car',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ORS_KEY
        },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) throw new Error('ORS ' + res.status);
    const data = await res.json();
    // durations[0] is the source row → [dur_to_dest0, dur_to_dest1, dur_to_dest2]
    return data.durations?.[0] ?? [null, null, null];
  }

  // ── Main update ───────────────────────────────────────────────────
  async function updateTraffic() {
    const keys     = ['pcb','navarre','perdido'];
    const baselines = BASELINES[currentOrigin];

    try {
      const durations = await fetchAllRoutes();

      lastResults = durations;
      window._trafficState.lastResults = durations;
      if (window.updateRightNow) window.updateRightNow({});

      let totalRatio = 0, validCount = 0;

      keys.forEach((k, i) => {
        const pill = document.getElementById('traffic-' + k);
        if (!pill) return;
        const dur = durations[i];
        if (dur == null || dur === 0) {
          pill.textContent = '—';
          return;
        }
        const mins  = Math.round(dur / 60);
        const ratio = dur / baselines[k];
        const cls   = ratio < 1.15 ? 'traffic-normal' : ratio < 1.4 ? 'traffic-moderate' : 'traffic-heavy';
        pill.textContent = mins + ' min';
        pill.className   = 'traffic-time-pill ' + cls;
        totalRatio += ratio;
        validCount++;
      });

      // Status bar
      if (validCount) {
        const avg = totalRatio / validCount;
        window._trafficState.avgRatio = avg;
        const st  = document.getElementById('traffic-status');
        if (st) st.textContent = avg < 1.15 ? '🟢 Clear — moving well' :
                                  avg < 1.4  ? '🟡 Moderate — some delays' :
                                               '🔴 Heavy — significant delays';
      }
      const tu = document.getElementById('traffic-time-updated');
      if (tu) tu.textContent = 'Updated ' + new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});

    } catch(e) {
      console.warn('Traffic fetch failed:', e.message);
      // Graceful fallback: show estimated times based on time-of-day pattern
      const now   = new Date();
      const mult  = HOURLY_PATTERN[now.getHours()] * DAY_MULTIPLIER[now.getDay()];
      const baselines = BASELINES[currentOrigin];
      keys.forEach(k => {
        const pill = document.getElementById('traffic-' + k);
        if (!pill) return;
        const est  = Math.round((baselines[k] * mult) / 60);
        const cls  = mult < 1.15 ? 'traffic-normal' : mult < 1.4 ? 'traffic-moderate' : 'traffic-heavy';
        pill.textContent = '~' + est + ' min';
        pill.className   = 'traffic-time-pill ' + cls;
      });
      const tu = document.getElementById('traffic-time-updated');
      if (tu) tu.textContent = 'Est. · ' + new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
      const st = document.getElementById('traffic-status');
      if (st) st.textContent = '⏱ Estimated — live data unavailable';
      window._trafficState.avgRatio = mult;
    }
  }

  // ── Origin switcher ──────────────────────────────────────────────
  window.setTrafficOrigin = async function(key, btn) {
    currentOrigin = key;
    window._trafficState.currentOrigin = key;
    document.querySelectorAll('.traffic-origin-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    ['pcb','navarre','perdido'].forEach(id => {
      const pill = document.getElementById('traffic-' + id);
      if (pill) { pill.textContent = '…'; pill.className = 'traffic-time-pill traffic-normal'; }
    });
    const tu = document.getElementById('traffic-time-updated');
    if (tu) tu.textContent = 'Updating…';

    updateRouteLabels();
    await updateTraffic();
  };

  // ── Google Maps route opener ─────────────────────────────────────
  window.openGoogleMapsRoute = function(idx) {
    const orig    = ORIGINS[currentOrigin].coords;
    const keys    = ['pcb','navarre','perdido'];
    const destStr = GMAPS_DEST[keys[idx]];
    const origStr = orig[1] + ',' + orig[0];
    window.open(`https://www.google.com/maps/dir/${origStr}/${destStr}`, '_blank');
  };

  // ── Traffic detail modal ──────────────────────────────────────────
  window.openTrafficModal = function() {
    const overlay = document.getElementById('traffic-modal-overlay');
    const body    = document.getElementById('traffic-modal-body');
    if (!overlay || !body) return;

    const keys     = ['pcb','navarre','perdido'];
    const labels   = ROUTE_LABELS[currentOrigin];
    const baselines = BASELINES[currentOrigin];
    const results  = window._trafficState.lastResults || [null, null, null];
    const incs     = window._trafficState.lastIncidents || [];
    const icons_inc = { ACCIDENT:'🚨', CONSTRUCTION:'🚧', CONGESTION:'🚗', ROAD_CLOSED:'🚫', default:'⚠️' };

    const routeRows = keys.map((k, i) => {
      const dur   = results[i];
      const mins  = dur ? Math.round(dur / 60) : '—';
      const ratio = dur ? dur / baselines[k] : 1;
      const color = ratio < 1.15 ? '#2a8a4e' : ratio < 1.4 ? '#d4952b' : '#c2553f';
      const pill  = `<span style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:20px;color:${color};">${mins}${dur?' min':''}</span>`;
      const orig  = ORIGINS[currentOrigin].coords;
      const gmaps = `https://www.google.com/maps/dir/${orig[1]},${orig[0]}/${GMAPS_DEST[k]}`;
      return `
        <div class="traffic-modal-route-row">
          <div class="traffic-modal-route-info">
            <div class="traffic-modal-route-name">${labels[k].name}</div>
            <div class="traffic-modal-route-via">${labels[k].via} · ${labels[k].miles} mi</div>
          </div>
          ${pill}
          <button class="traffic-modal-map-btn" onclick="window.open('${gmaps}','_blank')">Maps →</button>
        </div>`;
    }).join('');

    const incHtml = incs.length ? `
      <div class="traffic-modal-section">
        <div class="traffic-modal-section-label">Active Incidents Near Route (${incs.length})</div>
        ${incs.map(inc => {
          const icon = icons_inc[(inc.type||'').toUpperCase()] || icons_inc.default;
          return `<div class="traffic-modal-incident">
            <span class="traffic-modal-incident-icon">${icon}</span>
            <div class="traffic-modal-incident-desc">
              ${inc.road ? `<strong>${inc.road}</strong><br>` : ''}${inc.description}
            </div>
          </div>`;
        }).join('')}
      </div>` : `<div class="traffic-modal-section"><div class="traffic-modal-section-label">Active Incidents</div><div style="font-size:12px;color:var(--g2);padding:4px 0;">No incidents reported on this corridor</div></div>`;

    const now    = new Date();
    const dayIdx = now.getDay();
    const dayMult= DAY_MULTIPLIER[dayIdx];
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const patternCells = HOURLY_PATTERN.map((h, i) => {
      const val = h * dayMult;
      const bg  = val < 1.05 ? '#2a8a4e' : val < 1.25 ? '#5aaa6e' : val < 1.4 ? '#d4952b' : val < 1.6 ? '#e07020' : '#c2553f';
      const isNow = i === now.getHours();
      return `<div class="traffic-pattern-cell" style="background:${bg};${isNow?'outline:2px solid white;':''}" title="${HOUR_LABELS[i]}">${HOUR_LABELS[i]}</div>`;
    }).join('');

    const originTabsHtml = `
      <div style="margin-bottom:14px;">
        <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--g2);margin-bottom:6px;">Origin</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${Object.entries(ORIGINS).map(([k,o]) => `
            <button onclick="setTrafficOriginModal('${k}')"
              style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:11px;padding:5px 10px;border-radius:2px;border:1.5px solid ${k===currentOrigin?'var(--navy)':'var(--bd)'};background:${k===currentOrigin?'var(--navy)':'white'};color:${k===currentOrigin?'white':'var(--g1)'};cursor:pointer;">
              ${o.label}
            </button>`).join('')}
        </div>
      </div>`;

    body.innerHTML = originTabsHtml + routeRows + incHtml + `
      <div class="traffic-modal-section">
        <div class="traffic-modal-section-label">Typical ${dayNames[dayIdx]} Traffic Pattern · Beach Corridor</div>
        <div class="traffic-pattern-grid">${patternCells}</div>
        <div style="display:flex;gap:10px;margin-top:8px;font-size:10px;color:var(--g2);">
          <span>🟢 Clear</span><span style="color:#d4952b;">🟡 Moderate</span><span style="color:#c2553f;">🔴 Heavy</span><span style="border:1px solid #aaa;padding:0 3px;">Now</span>
        </div>
      </div>
      <div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--bd);font-size:10px;color:var(--g2);">
        Data: Open Route Service · Updated ${new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
        &nbsp;·&nbsp; Click any route to open in Google Maps
      </div>`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.setTrafficOriginModal = async function(key) {
    currentOrigin = key;
    window._trafficState.currentOrigin = key;
    document.querySelectorAll('.traffic-origin-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.originKey === key);
    });
    ['pcb','navarre','perdido'].forEach(id => {
      const pill = document.getElementById('traffic-' + id);
      if (pill) { pill.textContent = '…'; pill.className = 'traffic-time-pill traffic-normal'; }
    });
    updateRouteLabels();
    await updateTraffic();
    openTrafficModal();
  };

  window.closeTrafficModal = function() {
    const el = document.getElementById('traffic-modal-overlay');
    if (el) el.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Init
  updateRouteLabels();
  updateTraffic();
  setInterval(updateTraffic, 120000);

})();

// ── BLUE ANGELS PRACTICE COUNTDOWN ──────────────────────────────────────
// Schedule sourced from navalaviationmuseum.org/blueangels/ (2026 season)
// Practices run Tuesday & Wednesday mornings at Sherman Field, NAS Pensacola.
// * = Autograph session following Wednesday practice.
(function() {
  // 2026 practice dates — [year, month(0-indexed), day]
  // Source: navalaviationmuseum.org/blueangels/ · All Tue/Wed mornings
  // * April 1 = autograph session Wednesday
  window.PRACTICES = window.PRACTICES || [];
  const PRACTICES = window.PRACTICES = [
    [2026,2,31],  // March 31 (Tue)
    [2026,3,1],   // April 1 (Wed) *
    [2026,3,7],[2026,3,8],    // April 7–8
    [2026,3,14],[2026,3,15],  // April 14–15
    [2026,3,21],[2026,3,22],  // April 21–22
    [2026,3,28],[2026,3,29],  // April 28–29
    [2026,4,5],[2026,4,6],    // May 5–6
    [2026,4,12],[2026,4,13],  // May 12–13
    [2026,4,27],              // May 27
    [2026,5,2],[2026,5,3],    // June 2–3
    [2026,5,9],[2026,5,10],   // June 9–10
    [2026,5,16],[2026,5,17],  // June 16–17
    [2026,5,23],[2026,5,24],  // June 23–24
    [2026,5,30],              // June 30
    [2026,6,1],               // July 1
    [2026,6,21],[2026,6,22],  // July 21–22
    [2026,6,28],              // July 28
    [2026,7,26],              // August 26
    [2026,8,1],[2026,8,9],[2026,8,15],[2026,8,22],  // September 1,9,15,22
    [2026,9,14],[2026,9,20],[2026,9,28]              // October 14,20,28
  ];

  // Autograph session dates (Wednesday following practice)
  const AUTOGRAPH_DATES = ['2026-04-01'];

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  function pad2(n) { return String(n).padStart(2,'0'); }

  function getNextPractice() {
    const now = new Date();
    // Practice starts at 8:00 AM CT (13:00 UTC, accounting for CDT = UTC-5)
    for (const [y,m,d] of PRACTICES) {
      const practiceStart = new Date(y, m, d, 8, 0, 0); // local 8 AM
      if (practiceStart > now) return practiceStart;
    }
    return null; // season over
  }

  function isAutograph(date) {
    const key = date.getFullYear() + '-' + pad2(date.getMonth()+1) + '-' + pad2(date.getDate());
    return AUTOGRAPH_DATES.includes(key);
  }

  function tick() {
    const next = getNextPractice();
    const dateLabel  = document.getElementById('ba-date-label');
    const dateSub    = document.getElementById('ba-date-sub');
    const daysEl     = document.getElementById('ba-days');
    const hoursEl    = document.getElementById('ba-hours');
    const minsEl     = document.getElementById('ba-mins');
    const secsEl     = document.getElementById('ba-secs');
    const accessNote = document.getElementById('ba-access-note');
    const wrap       = document.getElementById('ba-countdown-wrap');

    if (!next) {
      if (dateLabel) dateLabel.textContent = '2026 Season Complete';
      if (dateSub)   dateSub.textContent   = 'Check back for 2027 schedule';
      if (wrap)      wrap.style.display    = 'none';
      return;
    }

    // Update date label
    const dayName   = DAYS[next.getDay()];
    const monthName = MONTHS[next.getMonth()];
    const dayNum    = next.getDate();
    const autograph = isAutograph(next);

    if (dateLabel) dateLabel.textContent = dayName + ', ' + monthName + ' ' + dayNum;
    if (dateSub) {
      const parts = ['8:00 AM · Sherman Field'];
      if (autograph) parts.push('✍ Autograph session');
      dateSub.textContent = parts.join(' · ');
    }

    // Countdown
    const now  = new Date();
    const diff = next - now;

    if (diff <= 0) {
      // Practice is happening now — show "Today"
      if (daysEl)  daysEl.textContent  = '0';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl)  minsEl.textContent  = '00';
      if (secsEl)  secsEl.textContent  = '00';
      if (dateLabel) dateLabel.textContent = '🔵 Flying Now';
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    if (daysEl)  daysEl.textContent  = days;
    if (hoursEl) hoursEl.textContent = pad2(hours);
    if (minsEl)  minsEl.textContent  = pad2(mins);
    if (secsEl)  secsEl.textContent  = pad2(secs);

    // Access note — weekend vs weekday matters for base access policy
    if (accessNote) {
      const dayOfWeek = next.getDay(); // 0=Sun, 2=Tue, 3=Wed
      // Current NAS policy: civilian access Sat–Sun only 9AM–3PM
      // Practices run Tue/Wed — so civilians cannot access the flight line on practice days
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        accessNote.textContent = 'Civilian access: weekend schedule — check VCC at Navy Blvd';
      } else {
        accessNote.innerHTML = 'Note: Base access Sat–Sun only per current NAS policy.<br>Flight line viewing may be restricted weekdays.';
      }
    }
  }

  tick();
  setInterval(tick, 1000);
})();
(function() {
  const target = new Date('2026-06-01T04:00:00Z');
  function tick() {
    const now = new Date();
    const diff = target - now;
    const days  = diff <= 0 ? 0 : Math.floor(diff / 86400000);
    const hours = diff <= 0 ? 0 : Math.floor((diff % 86400000) / 3600000);
    const mins  = diff <= 0 ? 0 : Math.floor((diff % 3600000) / 60000);
    const secs  = diff <= 0 ? 0 : Math.floor((diff % 60000) / 1000);
    const fmt2 = n => String(n).padStart(2,'0');
    ['hc-days','hhc-days'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = days; });
    ['hc-hours','hhc-hours'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = fmt2(hours); });
    ['hc-mins','hhc-mins'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = fmt2(mins); });
    ['hc-secs','hhc-secs'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = fmt2(secs); });
  }
  tick();
  setInterval(tick, 1000);
})();

// ── LIVE WEATHER — Open-Meteo (free, no key) ──────────────────────────────
(function() {
  const WMO = {
    0:'Clear',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',
    45:'Foggy',48:'Icy Fog',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',
    61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',
    80:'Showers',81:'Heavy Showers',82:'Violent Showers',
    95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'
  };
  const WMO_ICON = {
    0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',
    51:'🌦',53:'🌧',55:'🌧',61:'🌦',63:'🌧',65:'⛈',
    71:'🌨',73:'❄️',75:'❄️',80:'🌦',81:'🌧',82:'⛈',
    95:'⛈',96:'⛈',99:'⛈'
  };
  function icon(code) { return WMO_ICON[code] || '🌡'; }
  function desc(code) { return WMO[code] || 'Unknown'; }
  function fmt(t) { return Math.round(t * 9/5 + 32); }
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  async function loadWeather() {
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=30.4213&longitude=-87.2169' +
        '&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,apparent_temperature' +
        '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
        '&temperature_unit=celsius&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=4';
      const res = await fetch(url);
      const d = await res.json();
      const c = d.current;
      const daily = d.daily;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});

      // Build 3-day forecast (skip today = index 0)
      const forecastHTML = [1,2,3].map(i => {
        const date = new Date(daily.time[i] + 'T12:00:00');
        const day = DAYS[date.getDay()];
        const pop = daily.precipitation_probability_max[i];
        return `<div style="padding:6px;background:var(--surface);border-radius:2px;text-align:center;">
          ${day}<br>
          <span style="font-size:16px;line-height:1.4;">${icon(daily.weathercode[i])}</span><br>
          <strong style="color:var(--navy);font-size:13px;">${fmt(daily.temperature_2m_max[i])}°</strong>
          <span style="color:var(--g2);font-size:11px;"> / ${fmt(daily.temperature_2m_min[i])}°</span>
          ${pop > 20 ? `<br><span style="font-size:10px;color:#2a5a8a;">💧${pop}%</span>` : ''}
        </div>`;
      }).join('');

      document.getElementById('weather-widget-body').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div style="text-align:center;padding:10px;background:var(--surface);border-radius:3px;">
            <div style="font-family:'Bebas Neue';font-size:36px;color:var(--navy);line-height:1;">${fmt(c.temperature_2m)}°</div>
            <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--g2);margin-top:3px;">Now</div>
          </div>
          <div style="font-size:13px;color:var(--g1);padding:8px;">
            <div style="font-weight:600;">${icon(c.weathercode)} ${desc(c.weathercode)}</div>
            <div style="margin-top:4px;font-size:12px;color:var(--g2);">Hi ${fmt(daily.temperature_2m_max[0])}° · Lo ${fmt(daily.temperature_2m_min[0])}°</div>
            <div style="margin-top:4px;font-size:11px;color:var(--g2);">Feels ${fmt(c.apparent_temperature)}° · ${c.windspeed_10m} mph wind</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">${forecastHTML}</div>
        <div style="font-size:10px;color:var(--g2);margin-top:8px;text-align:right;">Updated ${timeStr}</div>`;
      // Update topbar weather text
      const topbarEl = document.getElementById('topbar-weather');
      if (topbarEl) topbarEl.textContent = `${fmt(c.temperature_2m)}°F · ${desc(c.weathercode)}`;
    } catch(e) {
      document.getElementById('weather-widget-body').innerHTML =
        '<div style="padding:12px;font-size:12px;color:var(--g2);">Weather unavailable</div>';
    }
  }
  loadWeather();
  setInterval(loadWeather, 900000); // refresh every 15 min
})();

// ── LIVE BEACH CONDITIONS — Open-Meteo Marine + Air Quality + NOAA Tides ────
(function() {
  function degToCompass(deg) {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }
  function mToFt(m) { return (m * 3.28084).toFixed(1); }
  function cToF(c)  { return Math.round(c * 9/5 + 32); }

  function surfRating(waveHtM, period, windSpeed) {
    if (waveHtM < 0.15)                                      return {label:'Flat',      icon:'😐', cls:'surf-poor'};
    if (windSpeed > 20)                                      return {label:'Blown Out',  icon:'💨', cls:'surf-poor'};
    if (waveHtM >= 0.6 && period >= 8 && windSpeed < 12)    return {label:'Good',       icon:'🤙', cls:'surf-good'};
    if (waveHtM >= 0.3 && period >= 6)                      return {label:'Fair',       icon:'⚡', cls:'surf-fair'};
    return {label:'Poor', icon:'👎', cls:'surf-poor'};
  }

  // Pensacola Beach flag system based on UV + wave height + wind
  function beachFlag(uvIndex, waveHtM, windSpd) {
    if (waveHtM > 1.5 || windSpd > 25) return { color:'#c0392b', label:'Double Red', sub:'Water closed to swimmers', swatch:'🚩🚩' };
    if (waveHtM > 0.9 || windSpd > 18) return { color:'#c0392b', label:'Red Flag',   sub:'High surf / strong currents', swatch:'🚩' };
    if (uvIndex >= 8 || waveHtM > 0.5) return { color:'#8e44ad', label:'Purple Flag', sub:'Dangerous marine life possible', swatch:'🟣' };
    if (waveHtM > 0.2 || windSpd > 10) return { color:'#f39c12', label:'Yellow Flag', sub:'Medium hazard — swim with care', swatch:'🟡' };
    return { color:'#27ae60', label:'Green Flag', sub:'Low hazard — calm conditions', swatch:'🟢' };
  }

  // Store last-fetched data for modal
  let _beachData = null;

  async function loadBeach() {
    const el = document.getElementById('surf-widget-body');
    try {
      const now = new Date();
      const pad = n => String(n).padStart(2,'0');
      const dateStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;

      // 1. Marine: current + hourly SST + 3-day daily max wave
      const marineUrl = 'https://marine-api.open-meteo.com/v1/marine?' +
        'latitude=30.3271&longitude=-87.1386' +
        '&current=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,wind_wave_height,wind_wave_period' +
        '&hourly=sea_surface_temperature' +
        '&daily=wave_height_max,swell_wave_height_max' +
        '&timezone=America%2FChicago&forecast_days=4';

      // 2. Standard forecast: wind + UV + air temp + precipitation probability
      const windUrl = 'https://api.open-meteo.com/v1/forecast?' +
        'latitude=30.3271&longitude=-87.1386' +
        '&current=windspeed_10m,winddirection_10m,apparent_temperature,precipitation_probability' +
        '&hourly=uv_index' +
        '&wind_speed_unit=mph&timezone=America%2FChicago';

      // 3. NOAA Tides — full day hi/lo predictions
      const tidesUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&range=24&station=8729840&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&application=theflightline&format=json`;

      // 4. NOAA real-time water temperature
      const waterTempUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&range=3&station=8729840&product=water_temperature&time_zone=lst_ldt&units=english&application=theflightline&format=json`;

      const [marineRes, windRes, tidesRes, waterTempRes] = await Promise.all([
        fetch(marineUrl), fetch(windUrl), fetch(tidesUrl), fetch(waterTempUrl)
      ]);

      if (!marineRes.ok || !windRes.ok) throw new Error('API error');

      const marine   = await marineRes.json();
      const wind     = await windRes.json();
      const tides    = await tidesRes.json();
      const waterTempData = waterTempRes.ok ? await waterTempRes.json() : null;

      const mc = marine.current;
      const wc = wind.current;

      const waveHtM     = mc.wave_height ?? 0;
      const waveHtFt    = parseFloat(mToFt(waveHtM));
      const wavePeriod  = mc.wave_period ? mc.wave_period.toFixed(0) : '--';
      const swellHtM    = mc.swell_wave_height ?? waveHtM;
      const swellHtFt   = parseFloat(mToFt(swellHtM));
      const swellPeriod = mc.swell_wave_period ? mc.swell_wave_period.toFixed(0) : wavePeriod;
      const swellDir    = mc.swell_wave_direction != null ? degToCompass(mc.swell_wave_direction) : degToCompass(mc.wave_direction ?? 0);
      const windWaveHtFt= mc.wind_wave_height != null ? parseFloat(mToFt(mc.wind_wave_height)) : null;
      const windDir     = degToCompass(wc.winddirection_10m ?? 0);
      const windSpd     = Math.round(wc.windspeed_10m ?? 0);
      const airFeels    = wc.apparent_temperature != null ? cToF(wc.apparent_temperature) : null;
      const precipProb  = wc.precipitation_probability ?? null;

      // UV — current hour
      const uvIndex = wind.hourly?.uv_index?.[now.getHours()] ?? 0;

      // Water temp — prefer real-time NOAA sensor, fall back to marine model
      let waterTempF = '--';
      if (waterTempData?.data?.length) {
        const lastReading = waterTempData.data[waterTempData.data.length - 1];
        if (lastReading?.v) waterTempF = Math.round(parseFloat(lastReading.v)) + '°';
      }
      if (waterTempF === '--') {
        const sst = marine.hourly?.sea_surface_temperature?.[now.getHours()];
        if (sst != null) waterTempF = cToF(sst) + '°';
      }

      const rating = surfRating(waveHtM, parseFloat(wavePeriod), windSpd);
      const flag   = beachFlag(uvIndex, waveHtM, windSpd);

      // Wave height display
      const waveDisplay = waveHtFt < 0.5 ? 'Flat' :
        waveHtFt < 1.5 ? `${waveHtFt} ft` :
        `${Math.floor(waveHtFt)}–${Math.ceil(waveHtFt)} ft`;

      // All tides today
      const allTides = tides.predictions || [];
      const upcomingTides = allTides.filter(t => new Date(t.t) > now);
      const nextTide = upcomingTides[0];
      const nextTideStr = nextTide
        ? `${nextTide.type === 'H' ? '↑ High' : '↓ Low'} ${new Date(nextTide.t).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`
        : '--';

      // 3-day wave forecast (skip today = index 0)
      const dailyDates    = marine.daily?.time || [];
      const dailyMaxWave  = marine.daily?.wave_height_max || [];
      const dailyMaxSwell = marine.daily?.swell_wave_height_max || [];

      // UV label
      const uvLabel = uvIndex < 3 ? 'Low' : uvIndex < 6 ? 'Moderate' : uvIndex < 8 ? 'High' : uvIndex < 11 ? 'Very High' : 'Extreme';
      const uvColor = uvIndex < 3 ? '#27ae60' : uvIndex < 6 ? '#f39c12' : uvIndex < 8 ? '#e67e22' : uvIndex < 11 ? '#c0392b' : '#8e44ad';

      const timeStr = now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});

      // Store for modal
      _beachData = { waveHtFt, waveDisplay, wavePeriod, swellHtFt, swellPeriod, swellDir,
                     windWaveHtFt, windDir, windSpd, airFeels, precipProb, uvIndex, uvLabel, uvColor,
                     waterTempF, rating, flag, nextTideStr, allTides, upcomingTides,
                     dailyDates, dailyMaxWave, dailyMaxSwell, timeStr };

      // Update Right Now strip
      updateRightNow({ flag, nextTideStr, uvIndex, uvLabel });

      // ── RENDER WIDGET ──────────────────────────────────────────────────
      // Beach flag row
      const flagHtml = `
        <div class="beach-flag-row">
          <div class="beach-flag-swatch" style="background:${flag.color};"></div>
          <div style="flex:1;">
            <div class="beach-flag-label">${flag.label}</div>
            <div class="beach-flag-sub">${flag.sub}</div>
          </div>
          <div style="font-family:'DM Sans';font-weight:800;font-size:11px;color:${uvColor};">UV ${uvIndex} · ${uvLabel}</div>
        </div>`;

      // Main wave display
      const mainHtml = `
        <div class="surf-main">
          <div>
            <div class="surf-height">${waveDisplay}</div>
          </div>
          <div>
            <div class="surf-rating ${rating.cls}">${rating.icon} ${rating.label}</div>
            <div class="surf-condition">${swellDir} swell · ${swellPeriod}s</div>
          </div>
        </div>`;

      // Stats grid — 6 stats, 3 cols × 2 rows
      const statsHtml = `
        <div class="surf-grid" style="grid-template-columns:repeat(3,1fr);">
          <div class="surf-stat"><div class="surf-stat-val">${windDir} ${windSpd}</div><div class="surf-stat-label">Wind (mph)</div></div>
          <div class="surf-stat"><div class="surf-stat-val">${swellHtFt} ft</div><div class="surf-stat-label">Swell Ht</div></div>
          <div class="surf-stat"><div class="surf-stat-val">${waterTempF}</div><div class="surf-stat-label">Water</div></div>
          <div class="surf-stat"><div class="surf-stat-val">${swellPeriod}s</div><div class="surf-stat-label">Period</div></div>
          <div class="surf-stat"><div class="surf-stat-val">${nextTideStr}</div><div class="surf-stat-label">Next Tide</div></div>
          <div class="surf-stat"><div class="surf-stat-val">${airFeels !== null ? airFeels+'°' : '--'}</div><div class="surf-stat-label">Feels Like</div></div>
        </div>`;

      // 3-day forecast mini bars (days 1–3, skip today)
      let forecastHtml = '';
      if (dailyMaxWave.length > 1) {
        const barDays = dailyDates.slice(1,4);
        const barVals = dailyMaxWave.slice(1,4);
        const maxVal  = Math.max(...barVals.filter(Boolean), 0.5);
        const dayLabels = barDays.map(d => {
          const dt = new Date(d + 'T12:00:00');
          return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
        });
        const bars = barVals.map((v,i) => {
          const ft  = v ? parseFloat(mToFt(v)) : 0;
          const pct = Math.max(6, Math.round((v / maxVal) * 100));
          const col = ft < 0.5 ? '#9ca3af' : ft < 1.5 ? '#2a8a4e' : ft < 2.5 ? '#d4952b' : '#c2553f';
          return `<div class="beach-forecast-day">
            <div class="beach-forecast-bar-wrap">
              <div class="beach-forecast-bar" style="background:${col};height:${pct}%;"></div>
            </div>
            <div class="beach-forecast-val">${ft < 0.5 ? 'Flat' : ft.toFixed(1)+'ft'}</div>
            <div class="beach-forecast-label">${dayLabels[i]}</div>
          </div>`;
        }).join('');
        forecastHtml = `
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--bd);">
            <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:var(--g2);margin-bottom:4px;">3-Day Wave Forecast</div>
            <div class="beach-forecast-bars">${bars}</div>
          </div>`;
      }

      // Cam links row — minimal, opens in new tab
      const camLinksHtml = `
        <div style="margin-top:8px;padding-top:7px;border-top:1px solid var(--bd);display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;">
          <span style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:var(--g2);flex-shrink:0;">Cams:</span>
          <a href="https://www.visitpensacola.com/webcams/west-view-webcam/" target="_blank" rel="noopener" style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:10px;color:var(--navy);text-decoration:none;padding:2px 6px;border:1px solid var(--bd);border-radius:2px;transition:all 0.12s;" onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--navy)'">Beach West</a>
          <a href="https://www.visitpensacola.com/webcams/south-view-webcam/" target="_blank" rel="noopener" style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:10px;color:var(--navy);text-decoration:none;padding:2px 6px;border:1px solid var(--bd);border-radius:2px;transition:all 0.12s;" onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--navy)'">Beach South</a>
          <a href="https://bamboowillies.com/beach-camera" target="_blank" rel="noopener" style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:10px;color:var(--navy);text-decoration:none;padding:2px 6px;border:1px solid var(--bd);border-radius:2px;transition:all 0.12s;" onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--navy)'">Sound</a>
          <a href="https://www.nps.gov/media/webcam/view.htm?id=81B4662E-1DD8-B71B-0B01D8503D5C98F4" target="_blank" rel="noopener" style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:10px;color:var(--navy);text-decoration:none;padding:2px 6px;border:1px solid var(--bd);border-radius:2px;transition:all 0.12s;" onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--navy)'">Perdido NPS</a>
        </div>`;

      el.innerHTML = flagHtml + mainHtml + statsHtml + forecastHtml + `
        <div class="traffic-updated" style="margin-top:8px;">
          <span style="color:var(--gold);font-weight:700;font-size:9px;cursor:pointer;">Tap for full conditions ↗</span>
          <span>Updated ${timeStr}</span>
        </div>` + camLinksHtml;

    } catch(e) {
      console.error('Beach widget error:', e);
      const el = document.getElementById('surf-widget-body');
      if (el) el.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--g2);">Conditions temporarily unavailable</div>';
    }
  }

  // ── Beach modal ─────────────────────────────────────────────────────
  window.openBeachModal = function() {
    const overlay = document.getElementById('beach-modal-overlay');
    const body    = document.getElementById('beach-modal-body');
    if (!overlay || !body) return;

    if (!_beachData) {
      body.innerHTML = '<div style="padding:24px;text-align:center;color:var(--g2);">Loading conditions…</div>';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      return;
    }

    const d = _beachData;

    // Flag banner
    const flagBanner = `
      <div style="background:${d.flag.color};border-radius:5px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;">
        <div style="font-size:20px;">${d.flag.swatch}</div>
        <div>
          <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:14px;color:white;">${d.flag.label}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.75);">${d.flag.sub}</div>
        </div>
        <div style="margin-left:auto;text-align:right;">
          <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:20px;color:white;">UV ${d.uvIndex}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.7);">${d.uvLabel}</div>
        </div>
      </div>`;

    // Conditions grid
    const condGrid = `
      <div class="traffic-modal-section">
        <div class="traffic-modal-section-label">Current Conditions</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${[
            ['Wave Height', d.waveDisplay],
            ['Surf Rating', d.rating.icon + ' ' + d.rating.label],
            ['Swell', d.swellDir + ' ' + d.swellHtFt + 'ft · ' + d.swellPeriod + 's'],
            ['Wind Waves', d.windWaveHtFt !== null ? d.windWaveHtFt + ' ft' : '--'],
            ['Wind', d.windDir + ' ' + d.windSpd + ' mph'],
            ['Water Temp', d.waterTempF],
            ['Air (Feels Like)', d.airFeels !== null ? d.airFeels + '°F' : '--'],
            ['Rain Chance', d.precipProb !== null ? d.precipProb + '%' : '--'],
          ].map(([label, val]) => `
            <div style="background:var(--surface);border-radius:2px;padding:8px 10px;">
              <div style="font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--g2);">${label}</div>
              <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:14px;color:var(--navy);margin-top:2px;">${val}</div>
            </div>`).join('')}
        </div>
      </div>`;

    // Full tide schedule
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const tideItems = d.allTides.map(t => {
      const dt      = new Date(t.t);
      const isPast  = dt < new Date();
      const isHigh  = t.type === 'H';
      const timeStr = dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
      return `<div class="tide-item" style="opacity:${isPast?0.45:1};">
        <div class="tide-item-type" style="color:${isHigh?'#1a5fa8':'#2a8a4e'}">${isHigh?'↑ High':'↓ Low'}</div>
        <div class="tide-item-time">${timeStr}</div>
        <div class="tide-item-ht">${parseFloat(t.v).toFixed(1)} ft</div>
      </div>`;
    }).join('');

    const tidesSection = `
      <div class="traffic-modal-section">
        <div class="traffic-modal-section-label">Today's Tide Schedule · NOAA Station 8729840</div>
        <div class="tide-schedule">${tideItems || '<div style="font-size:12px;color:var(--g2);">Tide data unavailable</div>'}</div>
      </div>`;

    // 3-day forecast
    let forecastSection = '';
    if (d.dailyMaxWave.length > 1) {
      const barDays = d.dailyDates.slice(1,4);
      const barVals = d.dailyMaxWave.slice(1,4);
      const swVals  = d.dailyMaxSwell.slice(1,4);
      const maxVal  = Math.max(...barVals.filter(Boolean), 0.5);
      const dayFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const rows = barDays.map((day, i) => {
        const dt   = new Date(day + 'T12:00:00');
        const ft   = barVals[i] ? parseFloat(mToFt(barVals[i])) : 0;
        const sft  = swVals[i]  ? parseFloat(mToFt(swVals[i]))  : 0;
        const pct  = Math.max(8, Math.round((barVals[i] / maxVal) * 100));
        const col  = ft < 0.5 ? '#9ca3af' : ft < 1.5 ? '#2a8a4e' : ft < 2.5 ? '#d4952b' : '#c2553f';
        const disp = ft < 0.5 ? 'Flat' : ft.toFixed(1) + ' ft';
        return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--bd);">
          <div style="width:72px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;color:var(--navy);">${dayFull[dt.getDay()]}</div>
          <div style="flex:1;height:8px;background:var(--bd);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${col};border-radius:4px;"></div>
          </div>
          <div style="width:52px;text-align:right;font-family:'DM Sans',sans-serif;font-weight:800;font-size:13px;color:${col};">${disp}</div>
          <div style="width:60px;text-align:right;font-size:10px;color:var(--g2);">Swell ${sft < 0.1 ? '--' : sft.toFixed(1)+'ft'}</div>
        </div>`;
      }).join('');
      forecastSection = `
        <div class="traffic-modal-section">
          <div class="traffic-modal-section-label">3-Day Wave Forecast</div>
          ${rows}
        </div>`;
    }

    // Beach cam section for modal
    const cams = [
      { label:'Pensacola Beach West',  loc:'Casino Beach area',         url:'https://www.visitpensacola.com/webcams/west-view-webcam/' },
      { label:'Pensacola Beach South', loc:'Gulf-facing, pier view',     url:'https://www.visitpensacola.com/webcams/south-view-webcam/' },
      { label:'Pensacola Beach East',  loc:'East of Casino Beach',       url:'https://www.visitpensacola.com/webcams/east-view-webcam/' },
      { label:'Bamboo Willie\'s',      loc:'Santa Rosa Sound / Quietwater', url:'https://bamboowillies.com/beach-camera' },
      { label:'Café NOLA',             loc:'Pensacola Beach boardwalk',  url:'https://www.earthcam.com/usa/florida/pensacola/beach/' },
      { label:'Portofino Resort',      loc:'East Pensacola Beach',       url:'https://www.portofino-island.com/webcam/' },
      { label:'NPS Perdido Key',       loc:'Gulf Islands Nat\'l Seashore · updates every 15 min', url:'https://www.nps.gov/media/webcam/view.htm?id=81B4662E-1DD8-B71B-0B01D8503D5C98F4' },
      { label:'Mirabella / Perdido Key', loc:'Perdido Key Gulf-side',    url:'https://www.skylinewebcams.com/en/webcam/united-states/florida/perdido-key/mirabella-beach.html' },
    ];
    const camSection = `
      <div class="traffic-modal-section">
        <div class="traffic-modal-section-label">Live Beach Cams · Opens in New Tab</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          ${cams.map(c => `
            <a href="${c.url}" target="_blank" rel="noopener"
               style="display:block;padding:8px 10px;border:1px solid var(--bd);border-radius:2px;text-decoration:none;transition:border-color 0.12s,background 0.12s;"
               onmouseover="this.style.borderColor='var(--gold)';this.style.background='#fff8ed'"
               onmouseout="this.style.borderColor='var(--bd)';this.style.background='white'">
              <div style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;color:var(--navy);">📹 ${c.label}</div>
              <div style="font-size:10px;color:var(--g2);margin-top:2px;">${c.loc}</div>
            </a>`).join('')}
        </div>
      </div>`;

    body.innerHTML = flagBanner + condGrid + tidesSection + forecastSection + camSection + `
      <div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--bd);font-size:10px;color:var(--g2);">
        Sources: Open-Meteo Marine API · NOAA Tides &amp; Currents Station 8729840 · Updated ${d.timeStr}
        &nbsp;·&nbsp; <a href="https://visitpensacolabeach.com" target="_blank" style="color:var(--gold);">visitpensacolabeach.com ↗</a>
      </div>`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeBeachModal = function() {
    const el = document.getElementById('beach-modal-overlay');
    if (el) el.classList.remove('open');
    document.body.style.overflow = '';
  };

  loadBeach();
  setInterval(loadBeach, 1800000);
})();

// Reaction handler
const _reactions = {};
function handleReaction(articleId, emoji, btn) {
  const key = articleId + emoji;
  if (!_reactions[key]) _reactions[key] = 0;
  const alreadyReacted = btn.dataset.reacted;
  if (alreadyReacted) {
    _reactions[key] = Math.max(0, _reactions[key] - 1);
    btn.dataset.reacted = '';
    btn.style.borderColor = 'var(--bd)';
    btn.style.background = 'var(--surface)';
    btn.style.color = 'var(--g1)';
  } else {
    _reactions[key]++;
    btn.dataset.reacted = '1';
    btn.style.borderColor = 'var(--gold)';
    btn.style.background = '#fff8ed';
    btn.style.color = 'var(--navy)';
  }
  btn.querySelector('.rxn-count').textContent = _reactions[key];
}

// Text size adjustment
function adjustArticleSize(dir) {
  window._articleFontSize = Math.min(22, Math.max(13, (window._articleFontSize || 16) + dir * 2));
  const body = document.getElementById('article-body-text');
  if (!body) return;
  body.style.fontSize = window._articleFontSize + 'px';
  body.style.lineHeight = window._articleFontSize > 18 ? '1.9' : '1.78';
  // Also scale the lede paragraph if present
  const lede = body.querySelector('.article-lede');
  if (lede) lede.style.fontSize = (window._articleFontSize + 3) + 'px';
}

function inlinePaySearch(q) {
  const el = document.getElementById('inline-pay-results');
  if (!el) return;
  q = (q || '').trim().toLowerCase();
  if (!q || q.length < 2) { el.innerHTML = ''; return; }
  // Use the PAY_DATA array from the salary page
  const data = window.PAY_DATA || [];
  const matches = data.filter(r => (r.name||'').toLowerCase().includes(q) || (r.title||'').toLowerCase().includes(q)).slice(0,6);
  if (!matches.length) { el.innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:13px;padding:8px 0;">No results.</div>'; return; }
  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:6px;margin-top:4px;">' +
    matches.map(r => `<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.06);border-radius:4px;padding:8px 12px;gap:12px;">
      <div><div style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;color:white;">${r.name}</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;">${r.title}</div></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold);white-space:nowrap;">$${Number(r.salary).toLocaleString()}</div>
    </div>`).join('') + '</div>';
}


// Wire up category badges
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cat-badge').forEach(badge => {
    const cls = [...badge.classList].find(c => c.startsWith('cat-') && c !== 'cat-badge');
    if (cls) {
      const cat = cls.replace('cat-','');
      badge.addEventListener('click', (e) => { e.stopPropagation(); goCategory(cat); });
    }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    // If lightbox is open, close that first (don't dismiss the underlying article)
    const lb = document.getElementById('fl-image-lightbox');
    if (lb && lb.classList.contains('open')) {
      closeImageLightbox();
      return;
    }
    closeArticle();
    closeEvent();
    closeWeather();
    closeDropdown();
  }
});

// ══════════════════════════════════════════════════════════════
// PUBLIC PAY PAGE — Charts, Tabs, Search
// ══════════════════════════════════════════════════════════════

// ── Tab switching ────────────────────────────────────────────
window.payTab = function(name, btn) {
  ['officials','frontline','peers'].forEach(t => {
    const p = document.getElementById('pay-panel-' + t);
    const l = document.getElementById('pay-legend-' + t);
    if (p) p.classList.remove('active');
    if (l) l.style.display = 'none';
  });
  document.querySelectorAll('.pay-tab').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('pay-panel-' + name);
  const legend = document.getElementById('pay-legend-' + name);
  if (panel) panel.classList.add('active');
  if (legend) legend.style.display = 'flex';
  btn.classList.add('active');
  if (name === 'frontline' && !window._payChartFL) _initPayFrontline();
  if (name === 'peers'     && !window._payChartPR) _initPayPeers();
};

// ── Chart init (lazy — only when page opens) ─────────────────
const _payTip = { callbacks:{ label: ctx => ctx.raw != null ? '$' + Number(ctx.raw).toLocaleString() : '' } };

window._payChartsReady = false;
window.initPayCharts = function() {
  if (window._payChartsReady) return;
  if (typeof Chart === 'undefined') {
    // Chart.js not loaded yet — load it, then init
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = function() { _initPayOfficials(); window._payChartsReady = true; };
    document.head.appendChild(s);
  } else {
    _initPayOfficials();
    window._payChartsReady = true;
  }
};

function _initPayOfficials() {
  const ctx = document.getElementById('payChartOfficials');
  if (!ctx) return;
  // Fix: single dataset with per-bar color array — no multi-dataset null alignment issues
  const rows = [
    {l:'Escambia County Sheriff',                 v:251114, color:'#1a8a6e'},
    {l:'State Atty / Public Defender (1st Cir.)', v:223318, color:'#9ca3af'},
    {l:'Escambia Tax Collector',                  v:210938, color:'#1a8a6e'},
    {l:'Escambia School Superintendent',          v:210938, color:'#9ca3af'},
    {l:'Circuit Court Judge (1st Cir.)',          v:200836, color:'#9ca3af'},
    {l:'Escambia Clerk of Circuit Court',         v:182644, color:'#1a8a6e'},
    {l:'Escambia Property Appraiser',             v:182644, color:'#1a8a6e'},
    {l:'Escambia Supervisor of Elections',        v:182644, color:'#1a8a6e'},
    {l:'County Court Judge (Escambia)',           v:174000, color:'#9ca3af'},
    {l:'Mayor, City of Pensacola',                v:134000, color:'#1e2d4a'},
    {l:'Escambia County Commissioner (each)',     v:104696, color:'#1a8a6e'},
    {l:'Escambia School Board member (each)',     v:50299,  color:'#9ca3af'},
    {l:'ECUA Board member (each)',                v:50299,  color:'#9ca3af'},
    {l:'Pensacola City Council member (each)',    v:38204,  color:'#1e2d4a'},
    {l:'FL State Senator / Representative',       v:29697,  color:'#9ca3af'},
  ];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rows.map(r => r.l),
      datasets: [{
        data: rows.map(r => r.v),
        backgroundColor: rows.map(r => r.color),
        borderRadius: 2,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend:{ display:false }, tooltip: _payTip },
      scales: {
        x: { ticks:{ callback: v => '$'+Math.round(v/1000)+'K', font:{size:10} }, grid:{ color:'rgba(0,0,0,0.05)' } },
        y: { ticks:{ font:{size:10} } }
      }
    }
  });
}

function _initPayFrontline() {
  const ctx = document.getElementById('payChartFrontline');
  if (!ctx) return;
  const median = 67500;
  // BLS OEWS Pensacola-Ferry Pass-Brent MSA, May 2024 — mean annual wages
  const rows = [
    {l:'Food prep & serving (mean)',    v:33830},
    {l:'Building/grounds cleaning',     v:34410},
    {l:'Personal care & service',       v:35520},
    {l:'Min. teacher — ECSD (FY24-25)', v:48300},
    {l:'Elementary teacher (mean)',     v:58460},
    {l:'Firefighter (mean)',            v:56180},
    {l:'Police & sheriff officer (mean)',v:66470},
    {l:'County median HH income',       v:67500},
    {l:'Registered nurse (mean)',       v:88730},
  ];
  window._payChartFL = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rows.map(r => r.l),
      datasets:[{ data: rows.map(r => r.v), backgroundColor: rows.map(r => r.v < median ? '#c2553f' : '#1a8a6e'), borderRadius:2 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{ display:false }, tooltip: _payTip },
      scales: {
        y: {
          ticks:{ callback: v => '$'+Math.round(v/1000)+'K', font:{size:10} },
          suggestedMax: 100000,
          grid:{ color:'rgba(0,0,0,0.05)' },
        },
        x: { ticks:{ font:{size:10}, maxRotation:40 } }
      }
    }
  });
}

function _initPayPeers() {
  const ctx = document.getElementById('payChartPeers');
  if (!ctx) return;
  // Grouped bar: each position paired with its Florida peer/avg for direct comparison
  // FL peer figures: EDR finsal25.pdf median county (Group III, ~150k pop) for same offices
  // Alachua (293k, Group IV) as a comparable mid-size FL county: Sheriff $240,632, Commissioner $98,450, PA $174,065
  // Broward (large, Group V/VI) shown for contrast on teacher
  // Teacher: FL statewide minimum $47,500 (FL DOE), vs Escambia $48,300
  // Mayor: no direct state formula — Jacksonville CAO $330k+ shown as large-city contrast; Tallahassee mayor ~$80k
  // Council: FL Legislature members $29,697 shown as state comparison point
  window._payChartPR = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'Sheriff',
        'Tax Collector',
        'Property Appraiser',
        'Commissioner',
        'School Superintendent',
        'School Board member',
        'Teacher (min. start)',
        'Mayor (City)'
      ],
      datasets: [
        {
          label: 'Escambia / Pensacola · FY2025-26',
          data: [251114, 210938, 182644, 104696, 210938, 50299, 48300, 134000],
          backgroundColor: '#c2553f',
          borderRadius: 2
        },
        {
          label: 'FL comparable county avg (EDR formula, ~300k pop)',
          data: [240632, 201572, 174065, 98450, 201572, 47975, 47500, null],
          backgroundColor: '#1e2d4a',
          borderRadius: 2
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font:{ size:11 }, boxWidth:12, padding:14 } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + (ctx.raw != null ? '$' + Number(ctx.raw).toLocaleString() : 'N/A')
          }
        }
      },
      scales: {
        x: { ticks: { font: { size: 10 }, maxRotation: 30 } },
        y: {
          ticks: { callback: v => '$' + Math.round(v/1000) + 'K', font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });
}

// ── Confirmed officials data (indexed for search) ────────────
const PAY_CONFIRMED = [

  // ── CITY OF PENSACOLA ─────────────────────────────────────────────────────
  // Mayor salary set by City Ordinance, July 28, 2022. Source: WUWF Nov. 2025
  { name:'D.C. Reeves', title:'Mayor', employer:'City of Pensacola', tag:'city', salary:134000, year:'FY2025-26', source:'City Ordinance July 28, 2022 — WUWF Nov. 2025', url:'https://www.wuwf.org/local-news/2025-11-11/pensacola-to-consider-raising-next-mayors-salary' },
  // City Council — salary tied to school board formula per charter amendment after 2024 election
  { name:'Jennifer Brahier', title:'City Council Member, District 1', employer:'City of Pensacola', tag:'city', salary:38204, year:'FY2025-26', source:'City Charter formula, eff. post-2024 election — WUWF Nov. 2025', url:'https://www.wuwf.org/local-news/2025-11-11/pensacola-to-consider-raising-next-mayors-salary' },
  { name:'Charles L. Bare', title:'City Council Member, District 2', employer:'City of Pensacola', tag:'city', salary:38204, year:'FY2025-26', source:'City Charter formula, eff. post-2024 election — WUWF Nov. 2025', url:'https://www.wuwf.org/local-news/2025-11-11/pensacola-to-consider-raising-next-mayors-salary' },
  { name:'Casey Jones', title:'City Council Member, District 3', employer:'City of Pensacola', tag:'city', salary:38204, year:'FY2025-26', source:'City Charter formula, eff. post-2024 election — WUWF Nov. 2025', url:'https://www.wuwf.org/local-news/2025-11-11/pensacola-to-consider-raising-next-mayors-salary' },
  { name:'Jared Moore', title:'City Council Member, District 4', employer:'City of Pensacola', tag:'city', salary:38204, year:'FY2025-26', source:'City Charter formula, eff. post-2024 election — WUWF Nov. 2025', url:'https://www.wuwf.org/local-news/2025-11-11/pensacola-to-consider-raising-next-mayors-salary' },
  { name:'Teniadé Broughton', title:'City Council Member, District 5', employer:'City of Pensacola', tag:'city', salary:38204, year:'FY2025-26', source:'City Charter formula, eff. post-2024 election — WUWF Nov. 2025', url:'https://www.wuwf.org/local-news/2025-11-11/pensacola-to-consider-raising-next-mayors-salary' },
  { name:'Allison D. Patton', title:'City Council Member, District 6', employer:'City of Pensacola', tag:'city', salary:38204, year:'FY2025-26', source:'City Charter formula, eff. post-2024 election — WUWF Nov. 2025', url:'https://www.wuwf.org/local-news/2025-11-11/pensacola-to-consider-raising-next-mayors-salary' },
  { name:'Delarian Wiggins', title:'City Council Member, District 7', employer:'City of Pensacola', tag:'city', salary:38204, year:'FY2025-26', source:'City Charter formula, eff. post-2024 election — WUWF Nov. 2025', url:'https://www.wuwf.org/local-news/2025-11-11/pensacola-to-consider-raising-next-mayors-salary' },

  // ── ESCAMBIA COUNTY BCC ───────────────────────────────────────────────────
  // All five commissioners — FL EDR Ch. 145 formula, Escambia County population group
  { name:'Steve Stroberger', title:'County Commissioner, District 1', employer:'Escambia County BCC', tag:'county', salary:104696, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Mike Kohler', title:'County Commissioner, District 2', employer:'Escambia County BCC', tag:'county', salary:104696, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Lumon May', title:'County Commissioner, District 3', employer:'Escambia County BCC', tag:'county', salary:104696, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Ashlee Hofberger', title:'County Commissioner, District 4', employer:'Escambia County BCC', tag:'county', salary:104696, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Steven Barry', title:'County Commissioner, District 5', employer:'Escambia County BCC', tag:'county', salary:104696, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  // County Administrator — appointed, contract salary confirmed August 2022
  { name:'Wes Moreno', title:'County Administrator', employer:'Escambia County BCC', tag:'county', salary:191287, year:'2022 (contract)', source:'BCC contract vote Aug. 18, 2022 — NorthEscambia.com', url:'http://www.northescambia.com/2022/08/escambia-officially-hires-wes-moreno-as-permanent-county-administrator' },

  // ── ESCAMBIA COUNTY CONSTITUTIONAL OFFICERS ──────────────────────────────
  // All set by FL EDR Ch. 145 F.S. formula — finsal25.pdf Oct. 2025
  { name:'Chip Simmons', title:'Sheriff', employer:'Escambia County Sheriff\u2019s Office', tag:'county', salary:251114, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Scott Lunsford', title:'Tax Collector', employer:'Escambia County', tag:'county', salary:210938, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Pam Childers', title:'Clerk of Circuit Court', employer:'Escambia County', tag:'county', salary:182644, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Gary "Bubba" Peters', title:'Property Appraiser', employer:'Escambia County', tag:'county', salary:182644, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Robert Bender', title:'Supervisor of Elections', employer:'Escambia County', tag:'county', salary:182644, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },

  // ── ESCAMBIA COUNTY SCHOOL DISTRICT ──────────────────────────────────────
  { name:'Keith Leonard', title:'School Superintendent (appointed)', employer:'Escambia County School District', tag:'school', salary:210938, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Kevin Adams', title:'School Board Member, District 1', employer:'Escambia County School District', tag:'school', salary:50299, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Paul Fetsko', title:'School Board Member, District 2', employer:'Escambia County School District', tag:'school', salary:50299, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'David Williams', title:'School Board Member, District 3', employer:'Escambia County School District', tag:'school', salary:50299, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Carissa Bergosh', title:'School Board Member, District 4', employer:'Escambia County School District', tag:'school', salary:50299, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Thomas Harrell', title:'School Board Member, District 5', employer:'Escambia County School District', tag:'school', salary:50299, year:'FY2025-26', source:'FL EDR finsal25.pdf, Table 3 — Ch. 145 F.S. formula', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  // Minimum starting teacher salary — ECPS/EEA Board-approved agreement, March 2025
  { name:'Minimum starting teacher', title:'Classroom Teacher (minimum, ECSD)', employer:'Escambia County School District', tag:'school', salary:48300, year:'FY2024-25', source:'ECPS/EEA salary agreement, Board vote March 18, 2025 — WEAR-TV', url:'https://weartv.com/news/local/escambia-schools-set-to-raise-teacher-salaries-up-to-3000-for-the-2024-25-school-year' },

  // ── ECUA BOARD ───────────────────────────────────────────────────────────
  // ECUA board paid on school board salary formula + $200/month expense stipend
  // Per FL House Bill analysis CS/HB 1583 (2022): ECUA board compensation = school board formula
  { name:'Kevin Stephens', title:'ECUA Board Chair, District 5', employer:'Emerald Coast Utilities Authority', tag:'county', salary:50299, year:'FY2025-26', source:'ECUA charter — school board formula + $200/mo expense stipend, CS/HB 1583 (2022)', url:'https://www.flsenate.gov/Session/Bill/2022/1583/Analyses/h1583b.SAC.PDF' },
  { name:'Larry Williams', title:'ECUA Board Vice Chair, District 3', employer:'Emerald Coast Utilities Authority', tag:'county', salary:50299, year:'FY2025-26', source:'ECUA charter — school board formula + $200/mo expense stipend, CS/HB 1583 (2022)', url:'https://www.flsenate.gov/Session/Bill/2022/1583/Analyses/h1583b.SAC.PDF' },
  { name:'Vicki Campbell', title:'ECUA Board Member, District 1', employer:'Emerald Coast Utilities Authority', tag:'county', salary:50299, year:'FY2025-26', source:'ECUA charter — school board formula + $200/mo expense stipend, CS/HB 1583 (2022)', url:'https://www.flsenate.gov/Session/Bill/2022/1583/Analyses/h1583b.SAC.PDF' },
  { name:'Lois Benson', title:'ECUA Board Member, District 2', employer:'Emerald Coast Utilities Authority', tag:'county', salary:50299, year:'FY2025-26', source:'ECUA charter — school board formula + $200/mo expense stipend, CS/HB 1583 (2022)', url:'https://www.flsenate.gov/Session/Bill/2022/1583/Analyses/h1583b.SAC.PDF' },
  { name:'Dale Perkins', title:'ECUA Board Member, District 4', employer:'Emerald Coast Utilities Authority', tag:'county', salary:50299, year:'FY2025-26', source:'ECUA charter — school board formula + $200/mo expense stipend, CS/HB 1583 (2022)', url:'https://www.flsenate.gov/Session/Bill/2022/1583/Analyses/h1583b.SAC.PDF' },

  // ── STATE OFFICIALS (serve Escambia) ─────────────────────────────────────
  // State Attorney and Public Defender — FL General Appropriations Act Ch. 2025-198, s.8
  { name:'Ginger Bowden Madden', title:'State Attorney, 1st Circuit', employer:'State of Florida', tag:'state', salary:223318, year:'FY2025-26', source:'FL General Appropriations Act Ch. 2025-198, s.8 — EDR finsal25.pdf p.6', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  { name:'Bruce A. Miller', title:'Public Defender, 1st Circuit', employer:'State of Florida', tag:'state', salary:223318, year:'FY2025-26', source:'FL General Appropriations Act Ch. 2025-198, s.8 — EDR finsal25.pdf p.6', url:'https://edr.state.fl.us/Content/local-government/reports/finsal25.pdf' },
  // Florida State Senator — salary frozen at 2010 level per s.109, Ch. 2025-199 L.O.F.
  { name:'Don Gaetz', title:'State Senator, District 1', employer:'Florida Senate', tag:'state', salary:29697, year:'FY2025-26', source:'FL Statutes s.11.13 — frozen at 2010 level, Ch. 2025-199, s.109', url:'https://www.flsenate.gov/reference/publicrecords/salaries' },
  // Florida State Representatives — same frozen salary
  { name:'Michelle Salzman', title:'State Representative, District 1', employer:'Florida House', tag:'state', salary:29697, year:'FY2025-26', source:'FL Statutes s.11.13 — frozen at 2010 level, Ch. 2025-199, s.109', url:'https://www.flsenate.gov/reference/publicrecords/salaries' },
  { name:'Alex Andrade', title:'State Representative, District 2', employer:'Florida House', tag:'state', salary:29697, year:'FY2025-26', source:'FL Statutes s.11.13 — frozen at 2010 level, Ch. 2025-199, s.109', url:'https://www.flsenate.gov/reference/publicrecords/salaries' },

  // ── COUNTY COURT JUDGES ───────────────────────────────────────────────────
  // County court judges — FL General Appropriations Act, state salary schedule
  { name:'Scott Ritchie', title:'County Court Judge, Group 1', employer:'Escambia County', tag:'state', salary:172693, year:'FY2025-26', source:'FL General Appropriations Act Ch. 2025-198 — county court judge salary', url:'https://www.flsenate.gov/Session/Bill/2025/2500/BillText/er/PDF' },
  { name:'Charles Young', title:'County Court Judge, Group 2', employer:'Escambia County', tag:'state', salary:172693, year:'FY2025-26', source:'FL General Appropriations Act Ch. 2025-198 — county court judge salary', url:'https://www.flsenate.gov/Session/Bill/2025/2500/BillText/er/PDF' },
  { name:'Barry E. Dickson Jr.', title:'County Court Judge, Group 3', employer:'Escambia County', tag:'state', salary:172693, year:'FY2025-26', source:'FL General Appropriations Act Ch. 2025-198 — county court judge salary', url:'https://www.flsenate.gov/Session/Bill/2025/2500/BillText/er/PDF' },
  { name:'Kristina Lightel', title:'County Court Judge, Group 4', employer:'Escambia County', tag:'state', salary:172693, year:'FY2025-26', source:'FL General Appropriations Act Ch. 2025-198 — county court judge salary', url:'https://www.flsenate.gov/Session/Bill/2025/2500/BillText/er/PDF' },
  { name:'Kerra A. Smith', title:'County Court Judge, Group 5', employer:'Escambia County', tag:'state', salary:172693, year:'FY2025-26', source:'FL General Appropriations Act Ch. 2025-198 — county court judge salary', url:'https://www.flsenate.gov/Session/Bill/2025/2500/BillText/er/PDF' },
];
window.PAY_DATA = PAY_CONFIRMED;

const PAY_DB_LINKS = []; // Replaced by static callouts in UI

function _payTagHtml(tag) {
  const m = {city:'City',county:'County',school:'ECSD',state:'State'};
  const cls = {city:'tag-city',county:'tag-county',school:'tag-school',state:'tag-state'};
  return m[tag] ? '<span class="pay-emp-tag '+cls[tag]+'">'+m[tag]+'</span>' : '';
}

// Live-as-you-type pay search — instant results from local index, no AI call
window.livePaySearch = function(q) {
  const resultsBox = document.getElementById('payTopResults');
  const noDBBox    = document.getElementById('payNoDB');
  if (!resultsBox) return;

  const qLow = q.trim().toLowerCase();

  // Clear if empty
  if (!qLow) {
    resultsBox.style.display = 'none';
    resultsBox.innerHTML = '';
    if (noDBBox) noDBBox.style.display = 'none';
    return;
  }

  // Search local confirmed index
  const hits = PAY_CONFIRMED.filter(r =>
    r.name.toLowerCase().includes(qLow) ||
    r.title.toLowerCase().includes(qLow) ||
    r.employer.toLowerCase().includes(qLow)
  );

  if (hits.length) {
    const encQ = encodeURIComponent(q.trim());
    const rowsHtml = hits.map(r => `
      <a href="${r.url}" target="_blank" rel="noopener"
         style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-decoration:none;">
        <div>
          <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:14px;color:white;margin-bottom:2px;">
            ${r.name} ${payEmpTag(r.tag)}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.55);">${r.title} · ${r.employer}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-family:'DM Sans',sans-serif;font-weight:900;font-size:18px;color:var(--gold);">$${Number(r.salary).toLocaleString()}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.4);">${r.year}</div>
        </div>
      </a>`).join('');
    resultsBox.innerHTML = rowsHtml;
    resultsBox.style.display = '';
    if (noDBBox) noDBBox.style.display = 'none';
  } else {
    // Not in index — show DB links inline
    const encQ = encodeURIComponent(q.trim());
    resultsBox.innerHTML = `<div style="font-size:12px;color:rgba(255,255,255,0.5);padding:8px 0 4px;font-style:italic;">Not in our elected-official index. Search the full public databases:</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
        <a href="https://myescambia.com/open-government/employee-wages" target="_blank" rel="noopener" style="font-size:11px;font-weight:700;color:var(--gold);text-decoration:none;background:rgba(212,149,43,0.12);border:1px solid rgba(212,149,43,0.3);border-radius:999px;padding:4px 12px;">Escambia County wages ↗</a>
        <a href="https://govsalaries.com/salaries/FL/city-of-pensacola?search=${encQ}" target="_blank" rel="noopener" style="font-size:11px;font-weight:700;color:var(--gold);text-decoration:none;background:rgba(212,149,43,0.12);border:1px solid rgba(212,149,43,0.3);border-radius:999px;padding:4px 12px;">City of Pensacola ↗</a>
        <a href="https://govsalaries.com/salaries/FL/escambia-county-school-district?search=${encQ}" target="_blank" rel="noopener" style="font-size:11px;font-weight:700;color:var(--gold);text-decoration:none;background:rgba(212,149,43,0.12);border:1px solid rgba(212,149,43,0.3);border-radius:999px;padding:4px 12px;">ECSD Salaries ↗</a>
        <a href="https://salaries.myflorida.com/employees?search=${encQ}" target="_blank" rel="noopener" style="font-size:11px;font-weight:700;color:var(--gold);text-decoration:none;background:rgba(212,149,43,0.12);border:1px solid rgba(212,149,43,0.3);border-radius:999px;padding:4px 12px;">FL State Employees ↗</a>
      </div>`;
    resultsBox.style.display = '';
    if (noDBBox) noDBBox.style.display = 'none';
  }
};

window.payChip = function(term) {
  const inp = document.getElementById('paySearchInput');
  if (inp) { inp.value = term; livePaySearch(term); }
};

window.runPaySearch = async function() {
  const inp = document.getElementById('paySearchInput');
  const q = inp ? inp.value.trim() : '';
  if (!q) return;

  const resultsBox = document.getElementById('payTopResults');
  const noDBBox    = document.getElementById('payNoDB');
  if (!resultsBox) return;

  // Show loading state
  resultsBox.style.display = '';
  resultsBox.innerHTML = `<div style="font-size:13px;color:rgba(255,255,255,0.5);padding:8px 0;font-style:italic;">Searching…</div>`;
  if (noDBBox) noDBBox.style.display = 'none';

  const qLow = q.toLowerCase();

  // Local confirmed index — elected/appointed officials only
  const localHits = PAY_CONFIRMED.filter(r =>
    r.name.toLowerCase().includes(qLow) ||
    r.title.toLowerCase().includes(qLow) ||
    r.employer.toLowerCase().includes(qLow)
  );

  // Build confirmed officials context for Claude
  const confirmedContext = PAY_CONFIRMED.map(r =>
    `${r.name} | ${r.title} | ${r.employer} | $${Number(r.salary).toLocaleString()} | ${r.year} | ${r.source}`
  ).join('\n');

  // Deep-link URLs for the real databases — pre-filled with the search query
  const encQ = encodeURIComponent(q);
  const dbLinks = [
    { label:'Escambia County BCC wages', url:`https://myescambia.com/open-government/employee-wages`, note:'1,500+ BCC employees · official county database' },
    { label:'GovSalaries — Escambia County', url:`https://govsalaries.com/salaries/FL/escambia-county?search=${encQ}`, note:'1,494 employees · 2023 payroll data' },
    { label:'GovSalaries — City of Pensacola', url:`https://govsalaries.com/salaries/FL/city-of-pensacola?search=${encQ}`, note:'836 employees · 2023 payroll data' },
    { label:'GovSalaries — Escambia School District', url:`https://govsalaries.com/salaries/FL/escambia-county-school-district?search=${encQ}`, note:'6,998 employees · 2024 payroll data' },
    { label:'Florida state employees', url:`https://salaries.myflorida.com/employees?search=${encQ}`, note:'State attorneys, judges, state agency staff' },
    { label:'OpenPayrolls — Florida', url:`https://openpayrolls.com/search?name=${encQ}&state=florida`, note:'Multi-year Florida government payroll records' },
  ];

  let aiText = '';
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are the salary research assistant for The Flightline, a local news site covering Pensacola and Escambia County, Florida. A reader searched for: "${q}"

Here is The Flightline's confirmed elected/appointed officials index:
${confirmedContext}

Answer directly in 2-3 sentences. If the query matches someone in the confirmed index, state their exact salary, year, and source. If the query is for a non-elected employee (teacher, deputy, clerk, etc.), explain that individual employee salaries for all city and county workers are public record in Florida and are searchable in the databases listed below — be specific about which database covers which employer (Escambia County BCC, City of Pensacola, ECSD, Sheriff's Office, or state agencies). Never fabricate a specific salary for someone not in the confirmed index. Plain language, no bullet points.`
        }]
      })
    });
    const data = await resp.json();
    aiText = data.content?.[0]?.text || '';
  } catch(e) {
    aiText = '';
  }

  let html = '';

  // Confirmed officials hits first
  if (localHits.length) {
    html += localHits.map(r => `
      <a href="${r.url}" target="_blank" rel="noopener"
         style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-decoration:none;cursor:pointer;">
        <div>
          <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:14px;color:white;margin-bottom:2px;">
            ${r.name} <span style="font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.6);padding:2px 5px;border-radius:2px;margin-left:4px;">${r.tag.toUpperCase()}</span>
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.55);">${r.title} · ${r.employer}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:2px;">Source: ${r.source}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--gold);line-height:1;">$${Number(r.salary).toLocaleString()}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.45);">${r.year}</div>
          <div style="font-size:10px;color:var(--gold);margin-top:2px;">Source ↗</div>
        </div>
      </a>`).join('');
  }

  // AI context paragraph
  if (aiText) {
    html += `<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);">${aiText}</div>`;
  }

  // Always show deep-links to real databases, pre-filled with query
  html += `<div style="padding-top:12px;">
    <div style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;">Search live databases for "${q}"</div>
    ${dbLinks.map(d => `
      <a href="${d.url}" target="_blank" rel="noopener"
         style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-decoration:none;gap:12px;">
        <div>
          <div style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;color:var(--gold);">${d.label} ↗</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:1px;">${d.note}</div>
        </div>
      </a>`).join('')}
    <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:10px;">All Florida government employee salaries are public record under FL Statute 119.07.</div>
  </div>`;

  resultsBox.innerHTML = html;
};

window.resetPaySearch = function() {
  const inp = document.getElementById('paySearchInput');
  if (inp) inp.value = '';
  const r = document.getElementById('payTopResults');
  const n = document.getElementById('payNoDB');
  if (r) r.style.display = 'none';
  if (n) n.style.display = 'none';
};

// Keyboard trigger on pay search input
document.addEventListener('DOMContentLoaded', function() {
  const inp = document.getElementById('paySearchInput');
  if (inp) {
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') runPaySearch();
    });
  }
});
// ─────────────────────────────────────────────────────────────────────────────
// RIGHT NOW IN PENSACOLA strip
// ─────────────────────────────────────────────────────────────────────────────
(function() {
  const strip = document.getElementById('right-now-strip');
  const elTemp    = document.getElementById('rn-temp');
  const elFlag    = document.getElementById('rn-flag');
  const elTraffic = document.getElementById('rn-traffic');

  let _rnData = {};

  window.updateRightNow = function(beachUpdate) {
    if (beachUpdate) Object.assign(_rnData, beachUpdate);
    renderStrip();
  };

  function renderStrip() {
    // Temp — pulled from topbar text
    const topbar = document.getElementById('topbar-weather');
    const tempTxt = topbar ? topbar.textContent.split('·')[0].trim() : '';
    if (elTemp && tempTxt) elTemp.innerHTML = '🌡 ' + tempTxt;

    // Beach flag
    if (elFlag && _rnData.flag) {
      const f = _rnData.flag;
      const dot = `<span class="rn-pill-dot" style="background:${f.color};"></span>`;
      elFlag.innerHTML = dot + ' ' + f.label + ' Flag';
    }

    // Next tide
    if (elTraffic && window._trafficState) {
      const avg = window._trafficState.avgRatio;
      if (avg != null) {
        const dot   = avg < 1.15 ? '<span style="color:#22c55e;font-size:10px;">●</span>'
                    : avg < 1.4  ? '<span style="color:#f59e0b;font-size:10px;">●</span>'
                    :              '<span style="color:#ef4444;font-size:10px;">●</span>';
        const label = avg < 1.15 ? 'Traffic: Clear'
                    : avg < 1.4  ? 'Traffic: Moderate'
                    :              'Traffic: Heavy';
        elTraffic.innerHTML = dot + ' ' + label;
      }
    }



    // Hide any pills that have no content (avoids empty bubbles)
    [elTemp, elFlag, elTraffic].forEach(el => {
      if (el) el.style.display = el.innerHTML.trim() ? '' : 'none';
    });
    // Show strip if we have at least temp
    if (strip && tempTxt) strip.style.display = 'block';
  }

  // Run after page settles
  setTimeout(renderStrip, 4000);
  setInterval(renderStrip, 60000);
})();

// ─────────────────────────────────────────────────────────────────────────────
// LAST UPDATED TIMESTAMP
// ─────────────────────────────────────────────────────────────────────────────
(function() {
  const el = document.getElementById('last-updated-stamp');
  if (!el) return;
  const now = new Date();
  const t = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  el.textContent = 'Updated ' + t;
})();

// ─────────────────────────────────────────────────────────────────────────────
// NEIGHBORHOOD FILTER
// ─────────────────────────────────────────────────────────────────────────────
function filterTag(sectionId, tag, btn) {
  // Update button state within this section's filter bar
  var filterBar = btn.parentElement;
  filterBar.querySelectorAll('.nbhd-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');

  // Get the section element and find its cards
  var section = document.getElementById(sectionId);
  if (!section) return;

  // Rebuild cards for this section with the selected tag filter
  var cat = '';
  for (var i = 0; i < HOME_SECTION_CATS.length; i++) {
    if (HOME_SECTION_CATS[i].id === sectionId) { cat = HOME_SECTION_CATS[i].cat; break; }
  }
  if (!cat) return;

  var articles = Object.entries(A)
    .filter(function(e) { return e[1].cat === cat; })
    .filter(function(e) { return tag === 'all' || autoTag(e[0], e[1]) === tag; })
    .sort(function(a, b) { return pubDate(b[0]) - pubDate(a[0]); })
    .slice(0, 6);

  var cards = '';
  for (var j = 0; j < articles.length; j++) {
    var id = articles[j][0];
    var art = articles[j][1];
    var artTag = autoTag(id, art);
    var cls = 'story-card' + (j === 0 ? ' gold-top' : '');
    cards += '<div class="' + cls + '" data-tag="' + artTag + '" onclick="openArticle(\'' + id + '\')">';
    cards += '<div class="story-card-img">' + homeCardImg(id, art) + '</div>';
    cards += '<span class="cat-badge cat-' + art.cat + '">' + catDisplay(art.cat) + '</span>';
    cards += '<div class="headline-md">' + art.headline + '</div>';
    cards += '<div class="dek-sm">' + (art.dek || '') + '</div>';
    cards += '<div class="byline">' + art.date + '</div>';
    cards += '</div>';
  }

  var threeCol = section.querySelector('.three-col');
  if (threeCol) threeCol.innerHTML = cards;
}

// Keep old name as alias for any remaining references
function filterNeighborhood(nbhd, btn) { filterTag('news', nbhd, btn); }


// ─────────────────────────────────────────────────────────────────────────────
// PENSACOLA NOTEBOOK (formerly On This Day in Pensacola)
// ─────────────────────────────────────────────────────────────────────────────
(function() {
  // Keyed by MM-DD, entries: { text, articleId (optional) }
  const ON_THIS_DAY = {
    // ─── JANUARY ───
    '01-01': { text: 'Pensacola, founded 1559, was the first multi-year European settlement in what is now the continental United States — predating St. Augustine by six years.', articleId: 'history-galvez' },
    '01-08': { text: 'NAS Pensacola was commissioned in 1914 — the first naval air station in the United States. Today the base trains every Navy, Marine, and Coast Guard aviator.', articleId: null },
    '01-10': { text: 'In 1861, Florida became the third state to secede from the Union. Fort Pickens, on Santa Rosa Island, remained in Union hands throughout the Civil War.', articleId: null },
    '01-21': { text: 'In 1985, Pensacola recorded its all-time low temperature of 5°F — one of only three occasions in city history when single-digit temperatures have been observed.', articleId: null },

    // ─── FEBRUARY ───
    '02-14': { text: 'Pensacola hosts Pensacon each February — a four-day comic and pop-culture convention drawing nearly 25,000 attendees from around the world.', articleId: null },
    '02-19': { text: 'In 2009, King Juan Carlos I and Queen Sofia of Spain visited Pensacola to celebrate the city\'s 450th anniversary, praising the shared history between Spain and the United States.', articleId: null },
    '02-22': { text: 'In 1819, Spain and the United States signed the Adams-Onís Treaty, transferring Florida — and Pensacola — to American control.', articleId: null },
    '02-27': { text: 'In 1880, the Louisville & Nashville Railroad bought the Pensacola Railroad, accelerating the city\'s late-19th-century lumber boom.', articleId: null },

    // ─── MARCH ───
    '03-05': { text: 'In 1822, the Florida Territorial Legislative Council convened in Pensacola — making the city the temporary capital of Florida Territory before the seat of government was relocated to Tallahassee in 1824.', articleId: null },
    '03-09': { text: 'In 1822, Pensacola was officially incorporated as a city under U.S. territorial rule — making it one of Florida\'s oldest municipal governments.', articleId: null },
    '03-16': { text: 'In 1561, Spanish explorer Villafane arrived at Pensacola Bay leading a relief expedition for Tristán de Luna\'s storm-shattered settlement — too late to save it.', articleId: null },
    '03-18': { text: 'In 1781, Bernardo de Gálvez sailed alone into Pensacola Bay under British cannon fire — forcing the rest of his fleet to follow. Pensacola surrendered to Spain 61 days later.', articleId: 'history-galvez' },
    '03-21': { text: 'In 1898, the Pensacola Electric Railway Company began operations — bringing streetcar service to a city of about 18,000 residents.', articleId: null },
    '03-24': { text: 'In 1824, contractor Winslow Lewis bid $4,927 to build the Pensacola Lighthouse — the structure that would mark the harbor entrance for the next two centuries.', articleId: null },

    // ─── APRIL ───
    '04-04': { text: 'The Blue Wahoos play their home opener around this time each spring at Blue Wahoos Stadium — consistently ranked one of the best minor-league ballparks in the country.', articleId: 'wahoos' },
    '04-07': { text: 'Bands on the Beach returns to Gulfside Pavilion on Pensacola Beach each spring — a free Tuesday-night concert series that runs through October.', articleId: null },
    '04-09': { text: 'In 1561, Villafane was named governor of Spanish Florida after the disaster of Luna\'s Pensacola colony.', articleId: null },
    '04-15': { text: 'In 1781, Spanish forces under Bernardo de Gálvez began the formal Siege of Pensacola — a 61-day campaign that would end British rule of West Florida and return the colony to Spain.', articleId: 'history-galvez' },
    '04-20': { text: 'In 2010, the Deepwater Horizon oil rig exploded in the Gulf of Mexico, leaking millions of barrels of crude. Pensacola Beach was among the shores most heavily impacted by tar and sheen.', articleId: null },
    '04-26': { text: 'The Flora-Bama Mullet Toss takes place each spring at the Florida-Alabama state line — contestants compete to throw a dead mullet from one state into the other for distance.', articleId: null },

    // ─── MAY ───
    '05-09': { text: 'In 1862, Confederate forces evacuated the Pensacola Lighthouse during the Civil War, and the tower returned to Union control. Six artillery rounds had struck the structure but none penetrated the wall.', articleId: null },
    '05-10': { text: 'In 1781, Pensacola surrendered to Spain after a 61-day siege — ending British West Florida for good and returning the colony to Spanish control until 1821.', articleId: 'history-galvez' },
    '05-12': { text: 'In 1862, Confederate General Braxton Bragg evacuated Pensacola, abandoning the city to Union forces. Most of Pensacola was burned in the days that followed; residents had already fled inland to Greenville, Alabama.', articleId: null },
    '05-14': { text: 'In 1719, French forces under Bienville captured Pensacola from Spain. France held the city only until a 1722 hurricane forced them out.', articleId: null },
    '05-25': { text: 'In 1868, Florida was readmitted to the Union three years after the end of the Civil War. Pensacola began rebuilding around the lumber and railroad economy.', articleId: null },

    // ─── JUNE ───
    '06-01': { text: 'Atlantic hurricane season opens June 1 — the start of a six-month window that historically brings most of the Gulf Coast\'s named storms.', articleId: 'hurricane-prep' },
    '06-11': { text: 'In 1559, members of Tristán de Luna\'s expedition embarked from Vera Cruz, Mexico, bound for Pensacola Bay — beginning what would become the first multi-year European colony in the continental U.S.', articleId: null },
    '06-13': { text: 'In 1694, the Spanish Crown formally endorsed the establishment of a permanent settlement at Pensacola Bay — though King William\'s War in Europe would delay actual settlement until 1698.', articleId: null },
    '06-17': { text: 'In 1891, Pensacola dedicated Lee Square — formerly Florida Park — in memory of Confederate dead. The square still anchors the city\'s North Hill historic district.', articleId: null },
    '06-20': { text: 'In 1899, gunpowder stored at Fort Pickens exploded, destroying an entire bastion of the historic Civil War-era fort on Santa Rosa Island.', articleId: null },
    '06-30': { text: 'Each summer the city ramps up Pensacola Beach lifeguard staffing as visitor counts climb. The beach attracts more than 4 million visitors annually.', articleId: null },

    // ─── JULY ───
    '07-04': { text: 'Pensacola\'s Independence Day fireworks light up Pensacola Bay each July 4 — a tradition that draws crowds to Plaza de Luna and the downtown waterfront.', articleId: null },
    '07-14': { text: 'In 1756, the Spanish viceroy issued the decree that formally established Presidio San Miguel de Panzacola — the foundation of the modern city of Pensacola.', articleId: null },
    '07-22': { text: 'The Blue Angels perform their annual Pensacola Beach Air Show in July, attracting tens of thousands to the Casino Beach pier.', articleId: 'blue-angels-2026-practice-season' },

    // ─── AUGUST ───
    '08-10': { text: 'In 1876, the first burial took place at St. Johns Cemetery — one of Pensacola\'s oldest active cemeteries, still located off East Romana Street downtown.', articleId: null },
    '08-14': { text: 'In 1559, Tristán de Luna\'s expedition entered Pensacola Bay on this day — beginning the first attempt at a permanent European settlement in what is now the U.S.', articleId: null },
    '08-15': { text: 'In 1559, Don Tristán de Luna y Arellano formally established the Pensacola colony with 1,500 people on 11 ships from Vera Cruz, Mexico.', articleId: null },
    '08-22': { text: 'In 1881, construction began on railroad bridges spanning Pensacola Bay and the Choctawhatchee and Apalachicola Rivers — the infrastructure that connected Pensacola to the broader Florida economy.', articleId: null },

    // ─── SEPTEMBER ───
    '09-05': { text: 'In 2006, Pensacola voters approved Community Maritime Park by a margin of about 2,000 votes — 56 to 44 percent. The vote authorized the bond financing that built Blue Wahoos Stadium.', articleId: 'op-reverb-rebate' },
    '09-16': { text: 'In 2020, Hurricane Sally made landfall near Gulf Shores at 2 mph — dropping 30 inches of rain on Pensacola in 24 hours and damaging both Pensacola Bay bridges.', articleId: null },
    '09-19': { text: 'In 1559, a hurricane struck Tristán de Luna\'s Pensacola colony, sinking five ships and ruining supplies. Survivors abandoned the settlement two years later.', articleId: null },

    // ─── OCTOBER ───
    '10-05': { text: 'In 1995, Hurricane Opal made landfall near Pensacola Beach as a strong Category 3 storm — destroying piers, dunes and beachfront property along Santa Rosa Island.', articleId: null },
    '10-12': { text: 'The Pensacola Interstate Fair runs each October at the fairgrounds off Mobile Highway — a regional tradition since 1935.', articleId: null },
    '10-22': { text: 'In 1774, the British colony of West Florida received a letter from the Continental Congress in Philadelphia inviting representatives to join the cause for independence — but Loyalist Governor Peter Chester suppressed the letter, keeping Pensacola in British hands during the Revolutionary War.', articleId: null },
    '10-25': { text: 'The Great Gulfcoast Arts Festival takes place in early November in Seville Square, drawing more than 200 regional and international artists to historic downtown.', articleId: null },
    '10-31': { text: 'In 1905, the Great Halloween Night Fire destroyed multiple downtown Pensacola buildings — leading to the construction of the larger Blount Building and Brent Building that still anchor Palafox Place today.', articleId: null },

    // ─── NOVEMBER ───
    '11-05': { text: 'In 1915, a military aircraft was test-launched by catapult from the deck of the USS North Carolina in Pensacola Bay — an early test of what would become standard naval aviation practice. NAS Pensacola has been called the Cradle of Naval Aviation ever since.', articleId: null },
    '11-07': { text: 'In 1814, Andrew Jackson attacked Spanish-held Pensacola during the War of 1812 — dislodging British forces who had been allowed to occupy the city.', articleId: null },
    '11-09': { text: 'In 1873, U.S. Senator Stephen R. Mallory — Confederate Secretary of the Navy and longtime Pensacola statesman — died in the city.', articleId: null },
    '11-22': { text: 'In 1861, a two-day Civil War artillery battle erupted across Pensacola Bay between Union-held Fort Pickens and the Confederate-held mainland forts.', articleId: null },

    // ─── DECEMBER ───
    '12-06': { text: 'In 2019, a Saudi military trainee opened fire at NAS Pensacola, killing three U.S. sailors and wounding eight others. The FBI later classified the attack as an act of terrorism, prompting a national review of foreign military training programs.', articleId: null },
    '12-07': { text: 'In 1941, the attack on Pearl Harbor brought the U.S. into World War II — and transformed NAS Pensacola from a regional training base into the central pilot pipeline for the entire war effort.', articleId: null },
    '12-15': { text: 'The Winterfest carriage tours run through downtown Pensacola each December — a holiday tradition pairing actors and music in front of historic North Hill homes.', articleId: null },
    '12-20': { text: 'In 1698, the Spanish established Presidio Santa Maria de Galve at Pensacola Bay near present-day Fort Barrancas — beginning the permanent European-dominated settlement of modern Pensacola, after a 137-year gap since Luna\'s 1559 colony was abandoned.', articleId: null },
    '12-31': { text: 'The Pelican Drop ran each New Year\'s Eve from 2008 to 2018 in downtown Pensacola — an aluminum pelican lowered in place of the traditional ball, drawing crowds of up to 50,000.', articleId: null },
  };

  const body = document.getElementById('on-this-day-body');
  if (!body) return;

  const now = new Date();
  const key = String(now.getMonth() + 1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');

  // Hybrid mode: dated entry today if available, otherwise random fact from archive
  let entry = ON_THIS_DAY[key];
  let isFromArchive = false;
  if (!entry) {
    const allKeys = Object.keys(ON_THIS_DAY);
    // Daily-stable random: same fact appears all day, rotates by date
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const randomKey = allKeys[dayOfYear % allKeys.length];
    entry = ON_THIS_DAY[randomKey];
    isFromArchive = true;
  }

  const eyebrow = isFromArchive
    ? `<div style="font-family:'DM Sans';font-size:8px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold);margin-bottom:6px;opacity:0.85;">From the archive</div>`
    : '';
  const linkHtml = entry.articleId
    ? `<a href="javascript:void(0)" onclick="openArticle('${entry.articleId}')" style="font-family:'DM Sans';font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold);text-decoration:none;display:block;margin-top:7px;">Read the story →</a>`
    : '';
  body.innerHTML = `${eyebrow}<div style="font-size:11px;line-height:1.55;color:rgba(255,255,255,0.75);">${entry.text}</div>${linkHtml}`;
})();

// ─────────────────────────────────────────────────────────────────────────────
// STORIES PUBLISHED COUNTER — live count of articles since Jan 1, 2026
// ─────────────────────────────────────────────────────────────────────────────
(function() {
  function update() {
    const el = document.getElementById('about-stat-stories-2026');
    if (!el) return;
    const cutoff = new Date('2026-01-01');
    const today = new Date();
    let n = 0;
    for (const id of Object.keys(A)) {
      const d = pubDate(id);
      if (d >= cutoff && d <= today) n++;
    }
    el.textContent = n;
  }
  onArticlesReady(update);
})();

// ─────────────────────────────────────────────────────────────────────────────
// PENSACOLA TIDES SIDEBAR WIDGET
// ─────────────────────────────────────────────────────────────────────────────
(function() {
  const body = document.getElementById('tides-sidebar-body');
  if (!body) return;

  async function loadTides() {
    try {
      const now = new Date();
      const pad = n => String(n).padStart(2,'0');
      const dateStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
      const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&range=24&station=8729840&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&application=theflightline&format=json`;
      const res = await fetch(url);
      const data = await res.json();
      const preds = data.predictions || [];
      if (!preds.length) throw new Error('no data');

      // All hi/lo today
      const items = preds.map(p => {
        const t = new Date(p.t);
        const timeStr = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const ht = parseFloat(p.v).toFixed(1);
        const isHigh = p.type === 'H';
        const isPast = t < now;
        return { timeStr, ht, isHigh, isPast, t };
      });

      // Next tide highlight
      const next = items.find(i => !i.isPast);

      // Build bar chart — normalize heights to % bar
      const heights = items.map(i => parseFloat(i.ht));
      const maxH = Math.max(...heights);
      const minH = Math.min(...heights);
      const range = maxH - minH || 1;

      const barsHtml = items.map(i => {
        const pct = Math.max(15, Math.round(((parseFloat(i.ht) - minH) / range) * 80 + 15));
        const isNext = next && i.t.getTime() === next.t.getTime();
        const barColor = isNext ? 'var(--gold)' : i.isHigh ? '#2a5a8a' : '#9ca3af';
        const labelColor = i.isPast ? 'var(--g2)' : 'var(--ink)';
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;">
          <div style="font-size:9px;font-weight:700;color:${isNext ? 'var(--gold)' : labelColor};">${i.ht}ft</div>
          <div style="width:100%;background:${barColor};border-radius:3px 3px 0 0;height:${pct}%;min-height:8px;opacity:${i.isPast ? 0.35 : 1};transition:height 0.3s;"></div>
          <div style="font-size:8px;color:${i.isPast ? 'var(--g2)' : 'var(--g1)'};">${i.timeStr.replace(' AM','a').replace(' PM','p')}</div>
          <div style="font-size:7px;letter-spacing:0.05em;text-transform:uppercase;color:${i.isHigh ? '#2a5a8a' : '#9ca3af'};font-weight:700;">${i.isHigh ? 'HI' : 'LO'}</div>
        </div>`;
      }).join('');

      const nextStr = next
        ? `<div style="font-size:10px;color:var(--g1);margin-top:6px;padding-top:6px;border-top:1px solid var(--bd);">Next: <strong style="color:var(--navy);">${next.isHigh ? '↑ High' : '↓ Low'} ${next.ht} ft</strong> at ${next.timeStr} · Station 8729840</div>`
        : '';

      body.innerHTML = `
        <div style="display:flex;align-items:flex-end;gap:3px;height:72px;padding:0 2px;">
          ${barsHtml}
        </div>
        ${nextStr}`;
    } catch(e) {
      body.innerHTML = '<div style="font-size:11px;color:var(--g2);text-align:center;padding:8px 0;">Tide data unavailable</div>';
    }
  }

  loadTides();
  setInterval(loadTides, 1800000);
})();



// ── URL ROUTING ─────────────────────────────────────────────────────────────

// ─── DYNAMIC TICKER ──────────────────────────────────────────────────────────
function buildTicker() {
  var track = document.getElementById('ticker-track');
  if (!track) return;
  var sorted = Object.entries(A)
    .filter(function(e) { return e[1].cat !== 'events' && e[1].cat !== 'opinion'; })
    .sort(function(a,b) { return pubDate(b[0]) - pubDate(a[0]); })
    .slice(0, 15);
  var html = '';
  sorted.forEach(function(entry) {
    var id = entry[0], a = entry[1];
    var text = a.headline || '';
    if (text.length > 80) text = text.substring(0, 77) + '...';
    html += '<span class="ticker-item" onclick="openArticle(\'' + id + '\')">' + text + '</span><span class="ticker-sep">\u00b7</span>';
  });
  // Duplicate for seamless scroll
  track.innerHTML = html + html;
}
buildTicker();

window.addEventListener('popstate', function(e) {
  if (e.state && e.state.articleId) {
    onArticlesReady(function() { openArticle(e.state.articleId); });
  } else {
    var modal = document.getElementById('modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }
});
// On load — check if URL is /story/slug and open that article
(function() {
  var storyMatch = location.pathname.match(/^\/story\/(.+)$/);
  if (storyMatch) {
    onArticlesReady(function() { openArticle(storyMatch[1]); });
    return;
  }
  if (location.pathname === '/all') {
    onArticlesReady(function() { goAllArticles(); });
    return;
  }
  var catMatch = location.pathname.match(/^\/category\/(.+)$/);
  if (catMatch) {
    onArticlesReady(function() { goCategory(catMatch[1]); });
  }
})();
