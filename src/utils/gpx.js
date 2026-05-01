// Minimal GPX/KML parser. No external deps.
// Returns: { name, path: [[lng, lat, ele?], ...], waypoints: [{ name, latitude, longitude, altitudeM, type }] }

const decodeXml = (s) =>
  String(s || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const matchAll = (text, regex) => {
  const out = [];
  let m;
  const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  while ((m = re.exec(text)) !== null) out.push(m);
  return out;
};

const parseGpx = (xml) => {
  if (typeof xml !== "string" || !xml.includes("<gpx")) {
    const err = new Error("Invalid GPX: missing <gpx> root element");
    err.statusCode = 400;
    throw err;
  }

  const docNameMatch = xml.match(/<metadata[\s\S]*?<name>([\s\S]*?)<\/name>/i);
  const trkNameMatch = xml.match(/<trk>[\s\S]*?<name>([\s\S]*?)<\/name>/i);
  const name = decodeXml((docNameMatch && docNameMatch[1]) || (trkNameMatch && trkNameMatch[1]) || "");

  const path = [];
  matchAll(xml, /<trkpt\s+[^>]*lat="([\-\d.]+)"[^>]*lon="([\-\d.]+)"[^>]*>([\s\S]*?)<\/trkpt>/gi).forEach((m) => {
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    const eleMatch = m[3].match(/<ele>([\-\d.]+)<\/ele>/i);
    const ele = eleMatch ? Number(eleMatch[1]) : null;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      path.push(ele !== null && Number.isFinite(ele) ? [lng, lat, ele] : [lng, lat]);
    }
  });

  const waypoints = [];
  matchAll(xml, /<wpt\s+[^>]*lat="([\-\d.]+)"[^>]*lon="([\-\d.]+)"[^>]*>([\s\S]*?)<\/wpt>/gi).forEach((m, i) => {
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    const inner = m[3];
    const wptName = decodeXml((inner.match(/<name>([\s\S]*?)<\/name>/i) || [])[1] || `Waypoint ${i + 1}`);
    const eleMatch = inner.match(/<ele>([\-\d.]+)<\/ele>/i);
    const ele = eleMatch ? Number(eleMatch[1]) : null;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      waypoints.push({
        name: wptName,
        latitude: lat,
        longitude: lng,
        altitudeM: ele !== null && Number.isFinite(ele) ? ele : null,
        type: "checkpoint"
      });
    }
  });

  return { name, path, waypoints };
};

const parseKmlCoords = (raw) => {
  // KML coordinates are space/newline-separated triples "lng,lat[,alt]"
  return String(raw)
    .trim()
    .split(/\s+/)
    .map((tuple) => tuple.split(",").map(Number))
    .filter((c) => c.length >= 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]))
    .map(([lng, lat, alt]) =>
      Number.isFinite(alt) ? [lng, lat, alt] : [lng, lat]
    );
};

const parseKml = (xml) => {
  if (typeof xml !== "string" || !xml.includes("<kml")) {
    const err = new Error("Invalid KML: missing <kml> root element");
    err.statusCode = 400;
    throw err;
  }

  const docNameMatch = xml.match(/<Document>[\s\S]*?<name>([\s\S]*?)<\/name>/i);
  const name = decodeXml((docNameMatch && docNameMatch[1]) || "");

  const placemarks = matchAll(xml, /<Placemark>([\s\S]*?)<\/Placemark>/gi).map((m) => m[1]);

  let path = [];
  const waypoints = [];

  placemarks.forEach((pm, i) => {
    const pmName = decodeXml((pm.match(/<name>([\s\S]*?)<\/name>/i) || [])[1] || `Placemark ${i + 1}`);

    const lineMatch = pm.match(/<LineString>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>[\s\S]*?<\/LineString>/i);
    if (lineMatch) {
      const coords = parseKmlCoords(lineMatch[1]);
      if (coords.length > path.length) path = coords;
      return;
    }

    const pointMatch = pm.match(/<Point>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>[\s\S]*?<\/Point>/i);
    if (pointMatch) {
      const coords = parseKmlCoords(pointMatch[1]);
      if (coords[0]) {
        const [lng, lat, alt] = coords[0];
        waypoints.push({
          name: pmName,
          latitude: lat,
          longitude: lng,
          altitudeM: Number.isFinite(alt) ? alt : null,
          type: "checkpoint"
        });
      }
    }
  });

  return { name, path, waypoints };
};

// Haversine distance in km between [lng, lat] points
const haversineKm = (a, b) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

// From a path of [lng, lat, ele?] derive: distanceKm, elevationGainM, maxAltitudeM, elevationProfile
const summarizePath = (path) => {
  if (!Array.isArray(path) || path.length < 2) {
    return {
      distanceKm: 0,
      elevationGainM: 0,
      maxAltitudeM: 0,
      elevationProfile: []
    };
  }

  let cumulativeKm = 0;
  let elevationGainM = 0;
  let maxAltitudeM = -Infinity;
  const elevationProfile = [];

  for (let i = 0; i < path.length; i += 1) {
    const point = path[i];
    if (i > 0) cumulativeKm += haversineKm(path[i - 1], point);

    const alt = point[2];
    if (Number.isFinite(alt)) {
      if (alt > maxAltitudeM) maxAltitudeM = alt;
      if (i > 0 && Number.isFinite(path[i - 1][2])) {
        const delta = alt - path[i - 1][2];
        if (delta > 0) elevationGainM += delta;
      }
      elevationProfile.push({
        distanceKm: Math.round(cumulativeKm * 1000) / 1000,
        altitudeM: Math.round(alt * 10) / 10
      });
    }
  }

  return {
    distanceKm: Math.round(cumulativeKm * 100) / 100,
    elevationGainM: Math.round(elevationGainM),
    maxAltitudeM: maxAltitudeM === -Infinity ? 0 : Math.round(maxAltitudeM),
    elevationProfile
  };
};

module.exports = {
  parseGpx,
  parseKml,
  summarizePath,
  haversineKm
};
