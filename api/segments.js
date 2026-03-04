module.exports = async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Geen token' });

  const r = await fetch('https://www.strava.com/api/v3/segments/starred?per_page=50', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) {
    const txt = await r.text();
    return res.status(r.status).json({ error: 'Strava starred fout', detail: txt });
  }
  const segments = await r.json();
  if (!Array.isArray(segments)) {
    return res.status(500).json({ error: 'Onverwacht antwoord van Strava', raw: segments });
  }

  const detailed = await Promise.all(segments.map(async s => {
    try {
      const dr = await fetch(`https://www.strava.com/api/v3/segments/${s.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await dr.json();

      // KOM tijd: probeer meerdere velden
      const komTime = d.xoms?.kom ?? d.xoms?.overall ?? null;

      return {
        id:        s.id,
        name:      s.name,
        distance:  s.distance,
        elevation: s.total_elevation_gain,
        elevHigh:  d.elevation_high  ?? null,
        elevLow:   d.elevation_low   ?? null,
        avgGrade:  s.average_grade,
        type:      s.activity_type,
        startLat:  s.start_latlng?.[0] ?? null,
        startLng:  s.start_latlng?.[1] ?? null,
        endLat:    s.end_latlng?.[0]   ?? null,
        endLng:    s.end_latlng?.[1]   ?? null,
        prTime:    s.athlete_pr_effort?.elapsed_time ?? null,
        komTime,
        komName:   d.kom_summary?.overall?.athlete_name ?? null,
        polyline:  d.map?.polyline ?? d.map?.summary_polyline ?? null,
      };
    } catch(e) {
      return {
        id: s.id, name: s.name, distance: s.distance,
        elevation: s.total_elevation_gain, elevHigh: null, elevLow: null,
        avgGrade: s.average_grade, type: s.activity_type,
        startLat: s.start_latlng?.[0] ?? null,
        startLng: s.start_latlng?.[1] ?? null,
        endLat:   s.end_latlng?.[0]   ?? null,
        endLng:   s.end_latlng?.[1]   ?? null,
        prTime:   s.athlete_pr_effort?.elapsed_time ?? null,
        komTime: null, komName: null, polyline: null,
      };
    }
  }));

  res.status(200).json(detailed);
};
