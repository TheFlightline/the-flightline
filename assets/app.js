// ── ARTICLE DATA LOADER ─────────────────────────────────────────────────────
let A = {};
let articlesReady = false;
const articleReadyCallbacks = [];
function onArticlesReady(fn) {
  if (articlesReady) { fn(); } else { articleReadyCallbacks.push(fn); }
}
fetch('/articles.json')
  .then(r => r.json())
  .then(data => {
    data.forEach(art => { A[art.id] = art; });
    articlesReady = true;
    articleReadyCallbacks.forEach(fn => fn());
  })
  .catch(e => console.error('Failed to load articles.json', e));
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
  news:      { label:'Local News',              color:'var(--cat-news)' },
  govt:      { label:'Government',              color:'var(--cat-govt)' },
  dev:       { label:'Development & Infrastructure', color:'var(--cat-dev)' },
  opinion:   { label:'Opinion & Analysis',      color:'var(--cat-opinion)' },
  events:    { label:'Arts & Events',           color:'var(--cat-events)' },
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

function goCategory(cat) {
  const meta = CAT_META[cat] || { label: cat, color:'var(--navy)' };
  const matches = Object.entries(A).filter(([id, a]) => a.cat === cat);
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
        <span style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold);">☀ Government in the Sunshine</span>
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

  const cards = regularMatches.map(([id, a]) => `
    <div class="cat-card" onclick="openArticle('${id}')">
      <div class="cat-card-img" style="overflow:hidden;">${a.thumbnail ? `<img src="${a.thumbnail}" alt="${a.cat}" style="width:100%;height:100%;object-fit:cover;">` : catImg(a.cat, id)}</div>
      <div class="cat-card-body">
        <span class="cat-badge cat-${a.cat}" style="cursor:default">${a.label}</span>
        <div class="cat-card-headline">${a.headline}</div>
        <div class="cat-card-dek">${a.dek||''}</div>
        <div class="cat-card-meta">${a.byline} · ${a.date}</div>
      </div>
    </div>`).join('');

  document.getElementById('cat-card-grid').innerHTML = spotlightHtml + cards;
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

function selectTier(el) {
  el.closest('.newsletter-tiers').querySelectorAll('.newsletter-tier').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

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
  const briefHTML = bullets.length ? `
    <div class="flightline-brief">
      <div class="brief-header">
        <span class="brief-plane">✈</span>
        <span class="brief-label">Flightline Brief</span>
      </div>
      <ul class="brief-items">
        ${bullets.map(b=>`<li class="brief-item"><span class="brief-bullet"></span><span class="brief-text">${b}</span></li>`).join('')}
      </ul>
    </div>` : '';
  const siteUrl = window.location.origin + window.location.pathname;
  const shareUrl = encodeURIComponent(siteUrl);
  const shareTitle = encodeURIComponent(a.headline);
  const shareBody = encodeURIComponent(a.headline + ' — ' + siteUrl);
  document.getElementById('modal-content').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--bd);padding-right:48px;">
      <span class="cat-badge cat-${a.cat}" style="font-size:11px;">${a.label}</span>
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

  positionDropdown(inputEl);

  if (!results.length) {
    dd.innerHTML = `<div class="search-drop-empty">No results for "<strong>${q}</strong>"</div>`;
    dd.classList.add('open');
    return;
  }

  const topResults = results.slice(0, 5);
  const itemsHtml = topResults.map(a => {
    const color = CAT_COLORS_MAP[a.cat] || 'var(--navy)';
    return `<div class="search-drop-item" onmousedown="closeDropdown();(inputEl||document.getElementById('search-input')).value='';openArticle('${a.id}')">
      <div class="search-drop-cat" style="color:${color}">${a.label}</div>
      <div class="search-drop-text">
        <div class="search-drop-headline">${a.headline}</div>
        <div class="search-drop-dek">${a.dek}</div>
      </div>
    </div>`;
  }).join('');

  const footerHtml = results.length > 5
    ? `<div class="search-drop-footer" onmousedown="closeDropdown();runSearch('${q.replace(/'/g,"\\'")}')">See all ${results.length} results for "${q}" →</div>`
    : `<div class="search-drop-footer" onmousedown="closeDropdown();runSearch('${q.replace(/'/g,"\\'")}')">See all results →</div>`;

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
      <span class="cat-badge cat-${a.cat}" style="margin-bottom:8px;">${a.label}</span>
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
  { id:'santana',        day:1,  month:3, year:2026, title:'Santana: Oneness Tour',               time:'8:00 PM',                    venue:'Pensacola Bay Center',           cat:'entertainment', color:'#5a3d7a', key:'santana-bay-center' },
  { id:'zztop',          day:2,  month:3, year:2026, title:'ZZ Top',                              time:'7:30 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#1e2d4a', key:'zz-top-saenger' },
  { id:'fantasia',       day:3,  month:3, year:2026, title:'Fantasia & Anthony Hamilton',         time:'8:00 PM',                    venue:'Pensacola Bay Center',           cat:'entertainment', color:'#8a6e3a', key:'fantasia' },
  { id:'gary-owen',      day:3,  month:3, year:2026, title:'Gary Owen',                           time:'8:00 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#1e2d4a' , key:'zz-top-saenger' },
  { id:'wahoos-open',    day:3,  month:3, year:2026, title:'Blue Wahoos Home Opener',             time:'6:05 PM',                    venue:'Blue Wahoos Stadium',            cat:'sports',        color:'#1a6a9a', key:'wahoos-opening-home' },
  { id:'egghunt',        day:4,  month:3, year:2026, title:'Egga-Wahooza Easter Egg Hunt',        time:'11:00 AM · Free',            venue:'Community Maritime Park',        cat:'family',        color:'#1a8a6e' , url:'https://pensacolachurch.org/eggawahooza/' },
  { id:'bandsbeach',     day:7,  month:3, year:2026, title:'Bands on the Beach — Season Opener', time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a', key:'bands-beach-guide' },
  { id:'escambia-apr8',  day:8,  month:3, year:2026, title:'Escambia County Commission Meeting', time:'9:00 AM',                    venue:'County Center',                  cat:'government',    color:'#c2553f' , url:'https://myescambia.com/our-services/boards-committees/board-of-county-commissioners' },
  { id:'mrs-doubtfire1', day:7,  month:3, year:2026, title:'Mrs. Doubtfire the Musical',         time:'7:30 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#8a6e3a', key:'mrs-doubtfire-saenger' },
  { id:'mrs-doubtfire2', day:8,  month:3, year:2026, title:'Mrs. Doubtfire the Musical',         time:'7:30 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#8a6e3a', key:'mrs-doubtfire-saenger' },
  { id:'iglesias',       day:11, month:3, year:2026, title:'Gabriel Iglesias: The 1976 Tour',    time:'Doors 7PM · Show 8PM',       venue:'Pensacola Bay Center',           cat:'entertainment', color:'#5a3d7a', key:'gabriel-iglesias' },
  { id:'pso-candlelight',day:11, month:3, year:2026, title:'Candlelight Concert',                time:'TBD',                        venue:'First United Methodist Church',  cat:'entertainment', color:'#8a6e3a' , url:'https://www.eventbrite.com/e/candlelight-pensacola' },
  { id:'citycouncil',    day:14, month:3, year:2026, title:'Pensacola City Council Meeting',     time:'5:30 PM',                    venue:'City Hall, 222 W Main St',       cat:'government',    color:'#c2553f' , url:'https://www.cityofpensacola.com/193/City-Council' },
  { id:'bandsbeach2',    day:14, month:3, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'gaffigan',       day:16, month:3, year:2026, title:'Jim Gaffigan',                       time:'7:00 PM',                    venue:'Pensacola Bay Center',           cat:'entertainment', color:'#1e2d4a', key:'gaffigan' },
  { id:'gallery-apr',    day:17, month:3, year:2026, title:'Gallery Night — Navy Days Theme',    time:'6:00–10:00 PM · Free',       venue:'Govt St & Jefferson, Downtown',  cat:'arts',          color:'#d4952b', key:'gallery-night-april' },
  { id:'panchiko',       day:20, month:3, year:2026, title:'Panchiko',                           time:'7:00 PM',                    venue:'Vinyl Music Hall',               cat:'entertainment', color:'#5a3d7a', key:'panchiko-vinyl' },
  { id:'bandsbeach3',    day:21, month:3, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'sesame',         day:22, month:3, year:2026, title:'Sesame Street Live',                 time:'6:00 PM',                    venue:'Saenger Theatre',                cat:'family',        color:'#1a8a6e' , url:'https://www.ticketmaster.com/sesame-street-live-pensacola' },
  { id:'escambia-apr22', day:22, month:3, year:2026, title:'Escambia County Commission Meeting', time:'9:00 AM',                    venue:'County Center',                  cat:'government',    color:'#c2553f' , url:'https://myescambia.com/our-services/boards-committees/board-of-county-commissioners' },
  { id:'crawfishfest',   day:24, month:3, year:2026, title:'Pensacola Crawfish Festival',        time:'All day',                    venue:'Palafox St, Downtown',           cat:'festival',      color:'#8a6e3a', key:'crawfish' },
  { id:'pso-gala',       day:25, month:3, year:2026, title:'PSO 100th Anniversary Gala',        time:'7:30 PM',                    venue:'Saenger Theatre',                cat:'entertainment', color:'#1e2d4a', key:'pso-100th' },
  { id:'mullettoss',     day:26, month:3, year:2026, title:'Flora-Bama Mullet Toss',             time:'All day',                    venue:'Flora-Bama, Perdido Key',        cat:'festival',      color:'#1a8a6e', key:'mullet-toss' },
  { id:'mullettoss2',    day:27, month:3, year:2026, title:'Flora-Bama Mullet Toss — Day 2',    time:'All day',                    venue:'Flora-Bama, Perdido Key',        cat:'festival',      color:'#1a8a6e' , key:'mullet-toss' },
  { id:'bandsbeach4',    day:28, month:3, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'bavarian1',      day:30, month:3, year:2026, title:'Great Bavarian Circus — Opens',      time:'Multiple shows daily',       venue:'Pensacola Fairgrounds',          cat:'family',        color:'#1a8a6e', key:'bavarian-circus' },

  // ── MAY 2026 ───────────────────────────────────────────────────
  { id:'clutch',         day:1,  month:4, year:2026, title:'Clutch',                             time:'7:30 PM',                    venue:'Vinyl Music Hall',               cat:'entertainment', color:'#5a3d7a', key:'clutch-vinyl' },
  { id:'krewe-sirens',   day:2,  month:4, year:2026, title:'Krewe of Sirens Beach Day',          time:'3:00–7:00 PM · Free',        venue:'Bounce Beach, Pensacola Beach',  cat:'festival',      color:'#1a8a6e', key:'krewe-sirens-beach' },
  { id:'comedy-may',     day:2,  month:4, year:2026, title:'Pensacola Comedy Club',              time:'7:30 PM',                    venue:"Genie's Coffee Shop",            cat:'entertainment', color:'#8a6e3a', key:'pensacola-comedy-club' },
  { id:'bavarian-may',   day:3,  month:4, year:2026, title:'Great Bavarian Circus',              time:'Multiple shows daily',       venue:'Pensacola Fairgrounds',          cat:'family',        color:'#1a8a6e', key:'bavarian-circus' },
  { id:'bandsbeach-may1',day:5,  month:4, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'alice-cooper',   day:8,  month:4, year:2026, title:'Alice Cooper',                       time:'7:00 PM',                    venue:'Pensacola Bay Center',           cat:'entertainment', color:'#5a3d7a', key:'alice-cooper-bay-center' },
  { id:'beach-art-wine', day:9,  month:4, year:2026, title:'Pensacola Beach Art & Wine Festival',time:'11:00 AM–4:00 PM · Free',    venue:'Pensacola Beach Boardwalk',      cat:'arts',          color:'#d4952b', key:'beach-art-wine' },
  { id:'disney-ice1',    day:9,  month:4, year:2026, title:'Disney on Ice: Jump In! (Noon)',     time:'12:00 PM',                   venue:'Pensacola Bay Center',           cat:'family',        color:'#1a8a6e', key:'disney-on-ice' },
  { id:'disney-ice2',    day:9,  month:4, year:2026, title:'Disney on Ice: Jump In! (Evening)',  time:'6:00 PM',                    venue:'Pensacola Bay Center',           cat:'family',        color:'#1a8a6e', key:'disney-on-ice' },
  { id:'disney-ice3',    day:10, month:4, year:2026, title:'Disney on Ice: Jump In! (Noon)',     time:'12:00 PM',                   venue:'Pensacola Bay Center',           cat:'family',        color:'#1a8a6e', key:'disney-on-ice' },
  { id:'citycouncil-may',day:12, month:4, year:2026, title:'Pensacola City Council Meeting',     time:'5:30 PM',                    venue:'City Hall, 222 W Main St',       cat:'government',    color:'#c2553f' , url:'https://www.cityofpensacola.com/193/City-Council' },
  { id:'escambia-may',   day:13, month:4, year:2026, title:'Escambia County Commission Meeting', time:'9:00 AM',                    venue:'County Center',                  cat:'government',    color:'#c2553f' , url:'https://myescambia.com/our-services/boards-committees/board-of-county-commissioners' },
  { id:'bandsbeach-may2',day:12, month:4, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'gallery-may',    day:15, month:4, year:2026, title:'Gallery Night — Festa Italiana',     time:'6:00–10:00 PM · Free',       venue:'Govt St & Jefferson, Downtown',  cat:'arts',          color:'#d4952b' , url:'https://gallerynightpensacola.org' },
  { id:'pickles-wings',  day:16, month:4, year:2026, title:'Pickles & Wings Family Festival',    time:'10:00 AM–8:00 PM · Free',    venue:'Seville Square',                 cat:'festival',      color:'#8a6e3a', key:'pickles-wings-festival' },
  { id:'iration',        day:19, month:4, year:2026, title:'Iration',                            time:'7:00 PM',                    venue:'Vinyl Music Hall',               cat:'entertainment', color:'#1a8a6e', key:'iration-vinyl' },
  { id:'bandsbeach-may3',day:19, month:4, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'bandsbeach-may4',day:26, month:4, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'fiesta-parade',  day:29, month:4, year:2026, title:'Grand Fiesta Parade',                time:'6:00 PM',                    venue:'Palafox St, Downtown',           cat:'festival',      color:'#8a6e3a', key:'fiesta-parade' },
  { id:'pride-may',      day:23, month:4, year:2026, title:'Pensacola Pride — Weekend',          time:'All day',                    venue:'Park East, Pensacola Beach',     cat:'festival',      color:'#d4952b', key:'pensacola-pride' },
  { id:'pride-may2',     day:24, month:4, year:2026, title:'Pensacola Pride — Weekend',          time:'All day',                    venue:'Park East, Pensacola Beach',     cat:'festival',      color:'#d4952b', key:'pensacola-pride' },

  // ── JUNE 2026 ──────────────────────────────────────────────────
  { id:'gallery-jun',    day:19, month:5, year:2026, title:'Gallery Night — Journey to Juneteenth', time:'6:00–10:00 PM · Free',  venue:'Govt St & Jefferson, Downtown',  cat:'arts',          color:'#d4952b' , url:'https://gallerynightpensacola.org' },
  { id:'bandsbeach-jun1',day:2,  month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'bandsbeach-jun2',day:9,  month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'bandsbeach-jun3',day:16, month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'bandsbeach-jun4',day:23, month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },
  { id:'bandsbeach-jun5',day:30, month:5, year:2026, title:'Bands on the Beach',                 time:'Gates 6PM · Music 7PM · Free', venue:'Gulfside Pavilion, Pensacola Beach', cat:'music', color:'#1e2d4a' , key:'bands-beach-guide' },

  // ── JULY 2026 ──────────────────────────────────────────────────
  { id:'4th-july',       day:4,  month:6, year:2026, title:'4th of July Fireworks',              time:'5:00 PM',                    venue:'Bayfront Pkwy, Downtown',        cat:'festival',      color:'#c2553f' , url:'https://www.visitpensacola.com/events/signature-events/' },
  { id:'airshow1',       day:18, month:6, year:2026, title:'Pensacola Beach Air Show',           time:'All day',                    venue:'Pensacola Beach',                cat:'entertainment', color:'#1e2d4a' , key:'blue-angels-schedule' },
  { id:'airshow2',       day:19, month:6, year:2026, title:'Pensacola Beach Air Show — Blue Angels', time:'All day',              venue:'Pensacola Beach',                cat:'entertainment', color:'#1e2d4a' , key:'blue-angels-schedule' },
  { id:'gallery-jul',    day:17, month:6, year:2026, title:'Gallery Night — Future Makers',      time:'6:00–10:00 PM · Free',       venue:'Govt St & Jefferson, Downtown',  cat:'arts',          color:'#d4952b' , url:'https://gallerynightpensacola.org' },
];

const CAL_CATS = {
  entertainment: { label:'Entertainment',  color:'#5a3d7a' },
  music:         { label:'Music',          color:'#1e2d4a' },
  festival:      { label:'Festival',       color:'#d4952b' },
  arts:          { label:'Arts',           color:'#c2553f' },
  family:        { label:'Family',         color:'#1a8a6e' },
  sports:        { label:'Sports',         color:'#1a6a9a' },
  government:    { label:'Government',     color:'#8a3030' },
};

let calYear = 2026, calMonth = 3; // 0-indexed month (3 = April)
let calView = 'grid';
let calActiveFilters = new Set(Object.keys(CAL_CATS));
let calSelectedDay = null;

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TODAY = new Date(2026, 3, 3); // April 3, 2026

// ── SIDEBAR CALENDAR ─────────────────────────────────────────────────────
let sideCalYear = 2026, sideCalMonth = 3;
let sideCalSelectedDay = null;

function sideCalNav(dir) {
  sideCalMonth += dir;
  if (sideCalMonth > 11) { sideCalMonth = 0; sideCalYear++; }
  if (sideCalMonth < 0)  { sideCalMonth = 11; sideCalYear--; }
  sideCalSelectedDay = null;
  renderSideCal();
}

function renderSideCal() {
  const label = document.getElementById('side-cal-label');
  const grid  = document.getElementById('side-cal-grid');
  const list  = document.getElementById('side-cal-list');
  const popup = document.getElementById('side-cal-popup');
  if (!label || !grid || !list) return;

  label.textContent = MONTH_NAMES[sideCalMonth] + ' ' + sideCalYear;

  const firstDay    = new Date(sideCalYear, sideCalMonth, 1).getDay();
  const daysInMonth = new Date(sideCalYear, sideCalMonth + 1, 0).getDate();
  const daysInPrev  = new Date(sideCalYear, sideCalMonth, 0).getDate();

  let cells = '<div class="cal-day-header">Su</div><div class="cal-day-header">Mo</div><div class="cal-day-header">Tu</div><div class="cal-day-header">We</div><div class="cal-day-header">Th</div><div class="cal-day-header">Fr</div><div class="cal-day-header">Sa</div>';

  for (let i = firstDay - 1; i >= 0; i--)
    cells += `<div class="cal-day other-month">${daysInPrev - i}</div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const evs = CAL_EVENTS.filter(e => e.day === d && e.month === sideCalMonth && e.year === sideCalYear);
    const isToday = d === TODAY.getDate() && sideCalMonth === TODAY.getMonth() && sideCalYear === TODAY.getFullYear();
    const isSel   = sideCalSelectedDay === d;
    let cls = 'cal-day';
    if (evs.length) cls += ' has-event';
    if (isToday)    cls += ' today';
    if (isSel)      cls += ' selected';
    const dotBar = evs.length > 1
      ? `<span style="display:block;width:${Math.min(evs.length,5)*5}px;height:3px;background:${evs[0].color};border-radius:2px;margin:1px auto 0;"></span>`
      : '';
    cells += `<div class="${cls}" onclick="sideCalSelectDay(${d})" title="${evs.map(e=>e.title).join(', ')}">${d}${dotBar}</div>`;
  }

  const total    = firstDay + daysInMonth;
  const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= trailing; d++)
    cells += `<div class="cal-day other-month">${d}</div>`;

  grid.innerHTML = cells;

  // Day popup
  if (sideCalSelectedDay !== null) {
    const evs = CAL_EVENTS.filter(e => e.day === sideCalSelectedDay && e.month === sideCalMonth && e.year === sideCalYear);
    if (evs.length > 0) {
      popup.style.display = 'block';
      popup.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-family:'DM Sans',sans-serif;font-weight:800;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);">${MONTH_NAMES[sideCalMonth]} ${sideCalSelectedDay}</span>
          <button onclick="sideCalSelectedDay=null;renderSideCal();" style="background:none;border:none;cursor:pointer;font-size:14px;color:var(--g2);line-height:1;padding:0;">&#10005;</button>
        </div>
        ${evs.map(e => `
          <div onclick="${e.key ? "openArticle('"+e.key+"')" : ''}" style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;border-bottom:1px solid var(--bd);cursor:${e.key?'pointer':'default'};">
            <span style="display:block;width:3px;min-height:32px;background:${e.color};border-radius:2px;flex-shrink:0;margin-top:3px;"></span>
            <div>
              <div style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;color:var(--navy);line-height:1.3;">${e.title}</div>
              <div style="font-size:11px;color:var(--g1);margin-top:2px;">${e.time} · ${e.venue}</div>
            </div>
          </div>`).join('')}`;
    } else {
      popup.style.display = 'none';
    }
  } else {
    popup.style.display = 'none';
  }

  // Upcoming events list — next 6 from today in this month
  const upcoming = CAL_EVENTS
    .filter(e => e.month === sideCalMonth && e.year === sideCalYear)
    .filter(e => {
      const eDate = new Date(e.year, e.month, e.day);
      const tDate = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
      return sideCalMonth !== TODAY.getMonth() || sideCalYear !== TODAY.getFullYear() || eDate >= tDate;
    })
    .sort((a,b) => a.day - b.day)
    .slice(0, 5);

  if (upcoming.length) {
    list.innerHTML = upcoming.map(e => `
      <div class="event-item" onclick="${e.key ? "openArticle('"+e.key+"')" : e.url ? "window.open('"+e.url+"','_blank')" : ''}" style="cursor:${e.key||e.url?'pointer':'default'}">
        <div class="event-date-box" style="border-left:3px solid ${e.color};">
          <span class="event-date-month">${MONTH_NAMES[e.month].slice(0,3)}</span>
          <span class="event-date-num">${e.day}</span>
        </div>
        <div>
          <div class="event-title">${e.title}</div>
          <div class="event-meta">${e.time} · ${e.venue}</div>
        </div>
      </div>`).join('');
  } else {
    list.innerHTML = '<div style="padding:12px 0;font-size:13px;color:var(--g2);text-align:center;">No upcoming events this month.</div>';
  }
}

function sideCalSelectDay(d) {
  sideCalSelectedDay = (sideCalSelectedDay === d) ? null : d;
  renderSideCal();
}

// Init sidebar cal on page load
document.addEventListener('DOMContentLoaded', renderSideCal);

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
    const pips = evs.slice(0, maxShow).map(e => `
      <div class="comm-cal-event-pip" style="background:${e.color};" 
           onclick="event.stopPropagation();calSelectDay(${d})" title="${e.title}">${e.title}</div>`).join('');
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
        const action = e.key ? `openArticle('${e.key}')` : e.url ? `window.open('${e.url}','_blank')` : '';
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
    : `<div class="comm-cal-day-panel-empty">No events listed for this day. <a href="#" onclick="document.querySelector('.comm-cal-submit-section').scrollIntoView({behavior:'smooth'});return false;" style="color:var(--gold);font-weight:700;">Submit one →</a></div>`;

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
      const action = e.key ? `openArticle('${e.key}')` : e.url ? `window.open('${e.url}','_blank')` : '';
      const clickable = action ? `onclick="${action}"` : '';
      return `
        <div class="comm-cal-list-item" ${clickable} style="cursor:${action?'pointer':'default'}">
          <div class="comm-cal-list-bar" style="background:${e.color};"></div>
          <div>
            <div class="comm-cal-list-tag" style="background:${e.color};">${CAL_CATS[e.cat]?.label || e.cat}</div>
            <div class="comm-cal-list-title">${e.title}</div>
            <div class="comm-cal-list-meta">🕐 ${e.time} &nbsp;·&nbsp; 📍 ${e.venue}${e.key ? ' &nbsp;· <span style="color:var(--gold);font-weight:700;">Details →</span>' : ''}</div>
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
    downtown: { label:'Downtown Pensacola', coords:[-87.2169, 30.4101] },
    nas:      { label:'NAS Main Gate',      coords:[-87.3014, 30.3527] },
    airport:  { label:'PNS Airport',        coords:[-87.1865, 30.4735] },
    beulah:   { label:'Beulah / Nine Mile', coords:[-87.3445, 30.4713] }
  };

  // Route destinations: [lng, lat] for ORS
  const DESTINATIONS = {
    '98':    { coords:[-87.1605, 30.3353], label:'Via US-98 · Beach Blvd',      via:'Main route',           miles:'11.2' },
    'alt':   { coords:[-87.1240, 30.3571], label:'Via Gulf Breeze Pkwy',         via:'Alt route',             miles:'13.8' },
    'sikes': { coords:[-86.9830, 30.3267], label:'Bob Sikes Bridge',             via:'Via Navarre / Hwy 98',  miles:'18.4' }
  };

  // Baseline drive times in seconds per origin (used for traffic ratio coloring)
  const BASELINES = {
    downtown: { '98': 840,  alt: 1080, sikes: 1320 },
    nas:      { '98': 960,  alt: 1140, sikes: 1560 },
    airport:  { '98': 900,  alt: 1020, sikes: 1500 },
    beulah:   { '98': 1140, alt: 1200, sikes: 1680 }
  };

  // Route label/via overrides per origin
  const ROUTE_LABELS = {
    downtown: {
      '98':    { name:'Via US-98 · Beach Blvd',     via:'Main route',              miles:'11.2' },
      'alt':   { name:'Via Gulf Breeze Pkwy',        via:'Alt route',               miles:'13.8' },
      'sikes': { name:'Bob Sikes Bridge',            via:'Via Navarre · Hwy 98',    miles:'18.4' }
    },
    nas: {
      '98':    { name:'Via Blue Angel Pkwy → US-98', via:'Main route',              miles:'14.1' },
      'alt':   { name:'Via Navy Blvd → Hwy 98',      via:'Navy Blvd alt',           miles:'16.2' },
      'sikes': { name:'Bob Sikes Bridge',             via:'Via US-98 East',          miles:'24.1' }
    },
    airport: {
      '98':    { name:'Via Airport Blvd → US-98',    via:'Main route',              miles:'12.8' },
      'alt':   { name:'Via Cervantes → Hwy 98',      via:'Surface route',           miles:'14.3' },
      'sikes': { name:'Bob Sikes Bridge',             via:'Via US-98 E to Navarre',  miles:'22.6' }
    },
    beulah: {
      '98':    { name:'Via Nine Mile → US-98',        via:'Main route',             miles:'19.4' },
      'alt':   { name:'Via I-10 → Gulf Breeze Pkwy',  via:'Freeway alt',            miles:'21.2' },
      'sikes': { name:'Bob Sikes Bridge',              via:'I-10 E → Navarre',       miles:'28.8' }
    }
  };

  // Google Maps destination coords for click-through
  const GMAPS_DEST = {
    '98':    '30.3353,-87.1605',
    'alt':   '30.3571,-87.1240',
    'sikes': '30.3267,-86.9830'
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
    const keys = ['98','alt','sikes'];
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
      DESTINATIONS['98'].coords,
      DESTINATIONS['alt'].coords,
      DESTINATIONS['sikes'].coords
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
    const keys     = ['98','alt','sikes'];
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

    ['98','alt','sikes'].forEach(id => {
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
    const keys    = ['98','alt','sikes'];
    const destStr = GMAPS_DEST[keys[idx]];
    const origStr = orig[1] + ',' + orig[0];
    window.open(`https://www.google.com/maps/dir/${origStr}/${destStr}`, '_blank');
  };

  // ── Traffic detail modal ──────────────────────────────────────────
  window.openTrafficModal = function() {
    const overlay = document.getElementById('traffic-modal-overlay');
    const body    = document.getElementById('traffic-modal-body');
    if (!overlay || !body) return;

    const keys     = ['98','alt','sikes'];
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
    ['98','alt','sikes'].forEach(id => {
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
function filterNeighborhood(nbhd, btn) {
  // Update button state
  document.querySelectorAll('.nbhd-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Filter cards
  const cards = document.querySelectorAll('#news-article-list .article-card');
  cards.forEach(card => {
    if (nbhd === 'all') {
      card.style.display = '';
    } else {
      const cardNbhd = card.dataset.nbhd || '';
      card.style.display = cardNbhd === nbhd ? '' : 'none';
    }
  });

  // Show empty state if needed
  const list = document.getElementById('news-article-list');
  if (!list) return;
  const visible = [...cards].filter(c => c.style.display !== 'none');
  let emptyEl = list.querySelector('.nbhd-empty');
  if (visible.length === 0 && nbhd !== 'all') {
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.className = 'nbhd-empty';
      emptyEl.style.cssText = 'padding:20px 0;font-size:13px;color:var(--g2);text-align:center;';
      emptyEl.textContent = 'No stories tagged for this neighborhood yet.';
      list.appendChild(emptyEl);
    }
    emptyEl.style.display = '';
  } else if (emptyEl) {
    emptyEl.style.display = 'none';
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// ON THIS DAY IN PENSACOLA
// ─────────────────────────────────────────────────────────────────────────────
(function() {
  // Keyed by MM-DD, entries: { text, articleId (optional) }
  const ON_THIS_DAY = {
    '01-01': { text: 'Pensacola, founded 1559, is the oldest European settlement site in the continental U.S. — older than St. Augustine by six years.', articleId: 'history-galvez' },
    '01-08': { text: 'NAS Pensacola commissioned in 1914 — the first naval air station in the United States.', articleId: 'history-naval-aviation' },
    '03-18': { text: 'In 1781, Bernardo de Gálvez sailed alone into Pensacola Bay under British cannon fire — forcing the rest of his fleet to follow.', articleId: 'history-galvez' },
    '05-10': { text: 'On May 10, 1781, Pensacola surrendered to Spain after a 61-day siege — ending British West Florida for good.', articleId: 'history-galvez' },
    '09-16': { text: 'Hurricane Sally made landfall near Gulf Shores in 2020 at 2 mph — dropping 30 inches of rain on Pensacola in 24 hours and damaging both bay bridges.', articleId: null },
    '04-04': { text: 'The Blue Wahoos open their 2026 season at Blue Wahoos Stadium this week — one of the best minor league ballparks in the country.', articleId: 'wahoos' },
    '04-07': { text: 'Bands on the Beach returns tonight at Gulfside Pavilion on Pensacola Beach — free admission, gates at 6 PM.', articleId: null },
  };

  const body = document.getElementById('on-this-day-body');
  if (!body) return;

  const now = new Date();
  const key = String(now.getMonth() + 1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  const entry = ON_THIS_DAY[key];

  if (entry) {
    const linkHtml = entry.articleId
      ? `<a href="javascript:void(0)" onclick="openArticle('${entry.articleId}')" style="font-family:'DM Sans';font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold);text-decoration:none;display:block;margin-top:7px;">Read the story →</a>`
      : '';
    body.innerHTML = `<div style="font-size:11px;line-height:1.55;color:rgba(255,255,255,0.75);">${entry.text}</div>${linkHtml}`;
  } else {
    // Fallback — always show something
    body.innerHTML = `<div style="font-size:11px;line-height:1.55;color:rgba(255,255,255,0.75);">Pensacola was first settled by Spanish colonists in 1559 — making it the oldest European settlement site in the continental United States.</div><a href="javascript:void(0)" onclick="openArticle('history-galvez')" style="font-family:'DM Sans';font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold);text-decoration:none;display:block;margin-top:7px;">Read the story →</a>`;
  }
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
  var match = location.pathname.match(/^\/story\/(.+)$/);
  if (match) {
    var slug = match[1];
    onArticlesReady(function() { openArticle(slug); });
  }
})();
