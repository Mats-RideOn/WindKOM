module.exports = function handler(req, res) {
  const clientId = '207772';
  const redirectUri = 'https://wind-kom.vercel.app/api/callback';

  const url =
    `https://www.strava.com/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&approval_prompt=auto` +
    `&scope=read,activity:read`;

  res.redirect(url);
};
