import {DateTime} from 'luxon';
import dayjs from 'dayjs';
import {getLng} from '../../common/utils/languageToggleUtils';

export const currentDateTime = () => {
  return DateTime.now();
};

// set deadline time 4pm
export const setTimeFourPM = (deadlineDay: Date | string) => {
  return convertDateToLuxonDate(deadlineDay).set({hour: 16, minute: 0, second: 0, millisecond: 1});
};

export const convertDateToLuxonDate = (date: Date | string) => {
  return DateTime.fromJSDate(new Date(date));
};

export const isPastDeadline = (deadline: Date | string) => {
  return currentDateTime() >= setTimeFourPM(deadline);
};

export const formatDateToFullDate = (date: Date, isDays?: boolean, lng?: string): string => {
  if (isDays) {
    return dayjs(date).locale(getLng(lng)).format('DD MMMM YYYY');
  }
  const dateTime = convertDateToLuxonDate(date);
  return dateTime.toLocaleString(DateTime.DATE_FULL, {locale: 'en-gb'});
};

export const getNumberOfDaysBetweenTwoDays = (startDay: Date | string, endDay: Date | string) => {
  return convertDateToLuxonDate(endDay).startOf('day').diff(convertDateToLuxonDate(startDay).startOf('day'), 'days').days;
};

