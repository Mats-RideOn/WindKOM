module.exports = async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/?error=access_denied');
  }

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const data = await tokenRes.json();

  if (!data.access_token) {
    return res.redirect('/?error=token_failed');
  }

  const athlete = encodeURIComponent(JSON.stringify({
    id:        data.athlete.id,
    firstname: data.athlete.firstname,
    lastname:  data.athlete.lastname,
    profile:   data.athlete.profile_medium,
    token:     data.access_token,
  }));

  res.redirect(`/?athlete=${athlete}`);
};
