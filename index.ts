import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { DateTime } from 'luxon';

import { MONGODB_URI } from './environment';

import getActive from './datadog/get-active';

import Profile from './schema/profile';
import SheetHandler from './sheet';

const TIMEZONE = 'Asia/Saigon';

interface RangeDates {
  from: Date;
  to: Date;
}
type DateTypes = '1day' | '1week' | '1month';

const SubtractMap: Record<DateTypes, number> = {
  '1day': 0,
  '1week': 6,
  '1month': 29,
};

const getRangeDates = (date: string, type: DateTypes): RangeDates => {
  const subtract = SubtractMap[type];
  const from = moment.tz(date, TIMEZONE).subtract(subtract, 'days').startOf('days').toDate();
  const to = moment.tz(date, TIMEZONE).endOf('day').toDate();

  return {
    from,
    to,
  };
};

const getTotalActive = async (targetDay: string, dateType: DateTypes, isTrainer: boolean) => {
  const range = getRangeDates(targetDay, dateType);
  return getActive(range.from, range.to, isTrainer);
};

const getTotalCreated = async (
  targetDay: string, dateType: DateTypes, isTrainer: boolean,
): Promise<number> => {
  const range = getRangeDates(targetDay, dateType);

  return Profile.countDocuments({
    is_demo: false,
    is_trainer: isTrainer,
    createdAt: { $gte: range.from, $lte: range.to },
  });
};

const report = async (targetDate: string) => {
  const [
    atd, atw, atm, acd, acw, acm,
    tctd, tctw, tctm, tccd, tccw, tccm,
  ] = await Promise.all([
    getTotalActive(targetDate, '1day', true),
    getTotalActive(targetDate, '1week', true),
    getTotalActive(targetDate, '1month', true),
    getTotalActive(targetDate, '1day', false),
    getTotalActive(targetDate, '1week', false),
    getTotalActive(targetDate, '1month', false),
    getTotalCreated(targetDate, '1day', true),
    getTotalCreated(targetDate, '1week', true),
    getTotalCreated(targetDate, '1month', true),
    getTotalCreated(targetDate, '1day', false),
    getTotalCreated(targetDate, '1week', false),
    getTotalCreated(targetDate, '1month', false),
  ]);
  console.log('Get total active&created success');
  const activeData = `${acd}\t${acw}\t${acm}\t${atd}\t${atw}\t${atm}`;
  const createdData = `${tccd}\t${tccw}\t${tccm}\t${tctd}\t${tctw}\t${tctm}`;

  console.log(targetDate, 'activeData :', activeData);
  console.log(targetDate, 'createdData:', createdData);

  return {
    acd, acw, acm, atd, atw, atm, tccd, tccw, tccm, tctd, tctw, tctm,
  };
};

(async () => {
  console.time('Finish');
  console.time('Connect mongodb');
  await mongoose.connect(MONGODB_URI);
  console.timeEnd('Connect mongodb');

  DateTime.now();
  const yesterday = DateTime.local({ zone: TIMEZONE }).minus({ day: 1 });
  const target = yesterday.toFormat('yyyy-MM-dd');
  console.time('Get report data');
  const result = await report(target);
  console.timeEnd('Get report data');

  console.time(`Push data to google sheet: ${target}`);
  await SheetHandler(target, result);

  console.timeEnd(`Push data to google sheet: ${target}`);

  mongoose.connection.close();
  console.timeEnd('Finish');
})();
