import {
  cleanEnv, str, email,
} from 'envalid';

import { config } from 'dotenv';

config();

export const {
  MONGODB_URI,
  GOOGLE_SHEET_EMAIL,
  GOOGLE_SHEET_ID,
  DATA_DOG_API_KEY,
  DATA_DOG_APP_KEY,
} = cleanEnv(process.env, {
  MONGODB_URI: str(),
  GOOGLE_SHEET_EMAIL: email(),
  GOOGLE_SHEET_ID: str(),
  DATA_DOG_API_KEY: str(),
  DATA_DOG_APP_KEY: str(),
});
