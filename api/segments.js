module.exports = async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Geen token' });

  // Haal gestarrde segmenten op
  const r = await fetch('https://www.strava.com/api/v3/segments/starred?per_page=50', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return res.status(r.status).json({ error: 'Strava API fout' });
  const segments = await r.json();

  // Haal details op per segment (inclusief KOM tijd)
  const detailed = await Promise.all(segments.map(async s => {
    try {
      const dr = await fetch(`https://www.strava.com/api/v3/segments/${s.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await dr.json();
      return {
        id:        s.id,
        name:      s.name,
        distance:  s.distance,
        elevation: s.total_elevation_gain,
        avgGrade:  s.average_grade,
        type:      s.activity_type,
        startLat:  s.start_latlng?.[0],
        startLng:  s.start_latlng?.[1],
        endLat:    s.end_latlng?.[0],
        endLng:    s.end_latlng?.[1],
        prTime:    s.athlete_pr_effort?.elapsed_time,
        komTime:   d.xoms?.kom,        // KOM tijd als string bv "4:32"
        komName:   d.kom_summary?.overall?.athlete_name,
      };
    } catch {
      return {
        id: s.id, name: s.name, distance: s.distance,
        elevation: s.total_elevation_gain, avgGrade: s.average_grade,
        type: s.activity_type,
        startLat: s.start_latlng?.[0], startLng: s.start_latlng?.[1],
        endLat: s.end_latlng?.[0], endLng: s.end_latlng?.[1],
        prTime: s.athlete_pr_effort?.elapsed_time,
        komTime: null, komName: null,
      };
    }
  }));

  res.status(200).json(detailed);
};
