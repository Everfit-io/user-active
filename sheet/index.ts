import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { DateTime } from 'luxon';

import ServiceAccount from './service-account.json';
import { GOOGLE_SHEET_EMAIL } from '../environment';

export interface SheetRowData {
  acd: number;
  acw: number;
  acm: number;
  atd: number;
  atw: number;
  atm: number;
  tccd: number;
  tccw: number;
  tccm: number;
  tctd: number;
  tctw: number;
  tctm: number;
}

async function main(targetDate: string, data: SheetRowData) {
  const serviceAccountAuth = new JWT({
    email: GOOGLE_SHEET_EMAIL,
    key: ServiceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const day = DateTime.fromFormat(targetDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy');
  const document = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);

  await document.loadInfo(); // loads document properties and worksheets

  const sheet = document.sheetsByTitle.Users;
  const rows = await sheet.getRows();
  const row = rows.find((r) => r.get('date') === day);
  if (row) {
    row.assign({
      ...data,
      tad: data.acd + data.atd,
      taw: data.acw + data.atw,
      tam: data.acm + data.atm,
      tcd: data.tccd + data.tctd,
      tcw: data.tccw + data.tctw,
      tcm: data.tccm + data.tctm,
    });
    await row.save();
  }
}

export default main;
