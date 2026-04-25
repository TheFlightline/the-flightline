/**
 * The Flightline — Bridge Status Proxy
 * URL: /.netlify/functions/bridge-status
 *
 * Proxies FL511 traffic events for Pensacola-area bridges (Three Mile Bridge
 * on US-98, and Bob Sikes Bridge on FL-399). Returns a small JSON response
 * the client uses to flag closures/incidents on each bridge.
 *
 * Source: fl511.com — undocumented but stable JSON endpoint that powers
 * fl511.com/list/events/traffic. Cached 60s by their CloudFront.
 *
 * Response shape:
 *   {
 *     ok: true,
 *     updated: "2026-04-25T05:14:00Z",
 *     bridges: {
 *       '3mb':   { status: 'open' | 'warn' | 'alert', text: '...', incidents: [...] },
 *       'sikes': { status: 'open' | 'warn' | 'alert', text: '...', incidents: [...] }
 *     }
 *   }
 */

const FL511_URL = "https://fl511.com/List/GetData/traffic";

// Match bridge mentions in roadwayName + description.
// Three Mile Bridge = the US-98 span over Pensacola Bay (also known as
// General Daniel "Chappie" James Memorial Bridge / Pensacola Bay Bridge).
// Bob Sikes = FL-399 from Gulf Breeze to Pensacola Beach.
function matchesBridge(row, key) {
  const road = (row.roadwayName || "").toUpperCase();
  const desc = (row.description || "").toUpperCase();
  const loc  = (row.locationDescription || "").toUpperCase();
  const blob = `${road} ${desc} ${loc}`;
  const county = (row.county || "").toUpperCase();

  // Only consider Escambia / Santa Rosa rows
  if (county !== "ESCAMBIA" && county !== "SANTA ROSA") return false;

  if (key === "3mb") {
    // Three Mile Bridge corridor: US-98 between Pensacola and Gulf Breeze.
    // Match explicit names AND US-98 within bridge mile markers (~MM 0–4 of US-98 in Escambia/SR).
    if (blob.includes("THREE MILE BRIDGE")) return true;
    if (blob.includes("CHAPPIE JAMES")) return true;
    if (blob.includes("PENSACOLA BAY BRIDGE")) return true;
    // US-98 incidents over the bay — narrow to bridge area words
    if ((road.includes("US-98") || road.includes("US 98") || road.includes("SR-30")) &&
        (blob.includes("BRIDGE") || blob.includes("BAY"))) return true;
    return false;
  }

  if (key === "sikes") {
    if (blob.includes("BOB SIKES")) return true;
    if (blob.includes("SIKES BRIDGE")) return true;
    if (blob.includes("PENSACOLA BEACH BRIDGE")) return true;
    if ((road.includes("FL-399") || road.includes("SR-399") || road.includes("399")) &&
        (blob.includes("BRIDGE") || blob.includes("PENSACOLA BEACH") || blob.includes("GULF BREEZE"))) return true;
    return false;
  }

  return false;
}

function statusFromIncidents(incidents) {
  if (!incidents.length) return { status: "open", text: "Open · Normal flow" };

  // Check severity: any full-closure or "Major"+ → alert; else warn.
  const fullClosure = incidents.some(i => i.isFullClosure);
  const major       = incidents.some(i => /^(major|critical)$/i.test(i.severity || ""));
  const closure     = incidents.some(i => /clos/i.test(i.type || ""));

  if (fullClosure || closure) {
    return { status: "alert", text: incidents.length === 1
      ? "Closed — see details"
      : `${incidents.length} active incidents — closures reported` };
  }
  if (major) {
    return { status: "alert", text: incidents.length === 1
      ? "Major delay reported"
      : `${incidents.length} active incidents — major delays` };
  }
  return { status: "warn", text: incidents.length === 1
    ? "Incident reported · expect delays"
    : `${incidents.length} incidents reported` };
}

async function fetchFL511() {
  const query = JSON.stringify({
    columns: [
      { data: null, name: "" },
      { name: "region" },
      { name: "county" },
      { name: "roadwayName" },
      { name: "direction" },
      { name: "type" },
      { name: "severity" },
      { name: "description" },
      { name: "startDate" },
      { name: "lastUpdated" },
      { data: 10, name: "" }
    ],
    order: [{ column: 9, dir: "desc" }],
    start: 0,
    length: 500,
    search: { value: "" }
  });

  const url = `${FL511_URL}?query=${encodeURIComponent(query)}&lang=en-US`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "TheFlightline-BridgeStatus/1.0 (+https://theflightline.com)"
    }
  });
  if (!res.ok) throw new Error(`FL511 ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

exports.handler = async function () {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const rows = await fetchFL511();

    const buildBridge = (key) => {
      const matches = rows.filter(r => matchesBridge(r, key));
      const incidents = matches.map(r => ({
        type: r.type,
        severity: r.severity,
        direction: r.direction,
        description: r.description,
        roadway: r.roadwayName,
        isFullClosure: r.isFullClosure || false,
        lastUpdated: r.lastUpdated
      }));
      const status = statusFromIncidents(incidents);
      return { ...status, incidents };
    };

    const body = {
      ok: true,
      updated: new Date().toISOString(),
      bridges: {
        "3mb":   buildBridge("3mb"),
        "sikes": buildBridge("sikes")
      }
    };

    return { statusCode: 200, headers, body: JSON.stringify(body) };

  } catch (err) {
    // Fail-open: report bridges as "Status unavailable" rather than implying a problem.
    const body = {
      ok: false,
      error: String(err.message || err),
      updated: new Date().toISOString(),
      bridges: {
        "3mb":   { status: "open", text: "Status unavailable", incidents: [] },
        "sikes": { status: "open", text: "Status unavailable", incidents: [] }
      }
    };
    return { statusCode: 200, headers, body: JSON.stringify(body) };
  }
};
