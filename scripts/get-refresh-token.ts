#!/usr/bin/env node

/**
 * This script is used to get the refresh token for the Spotify API to faciliate testing.
 * It opens a browser window for user authorization and then saves the refresh token to the .env.local file.
 */

import fs from 'fs';
import http from 'http';

import dotenv from 'dotenv';
import open from 'open';

const envFilePath = '.env.local';

dotenv.config({ path: envFilePath });

const CLIENT_ID = process.env.TESTS_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.TESTS_SPOTIFY_CLIENT_SECRET;

const REDIRECT_URI = 'http://127.0.0.1:8081/callback';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-read-collaborative',
];

// Step 1: Open browser for user authorization
const authUrl =
  `https://accounts.spotify.com/authorize?` +
  `client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES.join(' '))}`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://127.0.0.1:8081`);

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');

    if (code) {
      // Exchange code for tokens
      const tokenResponse = await fetch(
        'https://accounts.spotify.com/api/token',
        {
          method: 'POST',
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
          }).toString(),
        }
      );

      const tokens = await tokenResponse.json();
      console.log('\n=== SAVE THIS REFRESH TOKEN ===');
      console.log('REFRESH_TOKEN:', tokens.refresh_token);
      console.log('================================\n');
      console.log(`SAVING TOKEN TO ${envFilePath} file...`);

      // save the refresh token to the .env.local file
      // fs.writeFileSync('.env.local', `TESTS_SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}\n`);
      // find the line that contains 'TESTS_SPOTIFY_REFRESH_TOKEN=' and replace the value with the new refresh token
      const envContent = fs.readFileSync(envFilePath, 'utf8');
      const newEnvContent = envContent.replace(
        /TESTS_SPOTIFY_REFRESH_TOKEN=.*/,
        `TESTS_SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}`
      );
      fs.writeFileSync(envFilePath, newEnvContent);
      console.log(`TOKEN SAVED TO ${envFilePath} file`);

      res.writeHead(200);
      res.end(
        'Success! Check your terminal for the refresh token. You can close this window and run the tests.'
      );

      // automatically close the browser
      setTimeout(() => {
        process.exit(0);
      }, 2000);
      server.close();
    }
  }
});

server.listen(8081, () => {
  console.log('Opening browser for authorization...');
  open(authUrl);
});
