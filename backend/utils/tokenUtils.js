function decodeWithoutVerify(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decodedPayload = Buffer.from(base64Payload, 'base64').toString();
    return JSON.parse(decodedPayload);
  } catch (err) {
    return null;
  }
}

module.exports = { decodeWithoutVerify };
