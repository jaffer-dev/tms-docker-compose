const axios = require('axios');

async function getGraphToken() {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const form = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const { data } = await axios.post(tokenUrl, form);
  console.log(data, "data")
  return data.access_token;
}

module.exports = getGraphToken;