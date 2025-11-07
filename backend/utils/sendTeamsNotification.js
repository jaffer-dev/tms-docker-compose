// utils/sendTeamsNotification.js
const axios = require('axios');
const getGraphToken = require('./msGraphToken');

exports.sendTeamsNotification = async (title, message) => {
  try {
    const token = await getGraphToken();

    console.log(token, "data")

    const url = `https://graph.microsoft.com/v1.0/teams/${process.env.TEAM_ID}/channels/${encodeURIComponent(
      process.env.CHANNEL_ID
    )}/messages`;

    // Graph expects a simple body, not MessageCard
    const payload = {
      body: {
        contentType: 'html',
        content: `<b>${title}</b><br/>${message}`,
      },
    };

    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Teams notification sent');
  } catch (err) {
    console.error(
      '❌ Teams notification error:',
      err.response?.data || err.message
    );
  }
};
