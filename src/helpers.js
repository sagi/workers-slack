import '@sagi.io/globalthis';

// https://jameshfisher.com/2017/10/31/web-cryptography-api-hmac/
/* istanbul ignore next */
export const buf2hex = (buf) => {
  return Array.prototype.map
    .call(new Uint8Array(buf), (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
};

// https://jameshfisher.com/2017/10/31/web-cryptography-api-hmac/
/* istanbul ignore next */
export const hmacSha256 = async (key, str) => {
  const buf = new TextEncoder('utf-8').encode(str);
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, buf);
  return buf2hex(sig);
};

export const verifyRequestSignature = async (request, signingSecret) => {
  const requestSignature =
    request.headers.get('X-Slack-Signature') ||
    request.headers.get('x-slack-signature');
  const requestTimestamp =
    request.headers.get('X-Slack-Request-Timestamp') ||
    request.headers.get('x-slack-request-timestamp');

  const clonedRequest = request.clone();
  const body = await clonedRequest.text();

  // convert the current time to seconds (to match the API's `ts` format), then subtract 5 minutes' worth of seconds.
  const fiveMinutesAgo = (Math.floor(Date.now() / 1000) - 60 * 5) * 1000;

  if (requestTimestamp < fiveMinutesAgo) {
    throw new Error(
      'Slack request signing verification outdated (request is older than 5 minutes).'
    );
  }
  const enc = new TextEncoder('utf-8');

  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign']
  );
  const [version, hash] = requestSignature.split('=');
  const data = `${version}:${requestTimestamp}:${body}`;

  const signature = await hmacSha256(key, data);

  if (hash !== signature) {
    throw new Error(
      'Slack request signing verification failed (request signature is not valid).'
    );
  }

  return true;
};
