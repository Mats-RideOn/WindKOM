// ═══════════════════════════════════════════════════
// VERSIE 2 — api/explore.js
// Proxy voor Strava /segments/explore endpoint
// Wordt aangeroepen vanuit de frontend per grid-cel
// ═══════════════════════════════════════════════════
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Geen token' });

  const { url } = req.body;
  if (!url || !url.includes('strava.com/api/v3/segments/explore')) {
    return res.status(400).json({ error: 'Ongeldige URL' });
  }

  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: 'Strava explore fout', detail: txt });
    }
    const data = await r.json();
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: 'Server fout', detail: e.message });
  }
};
