export class TimeConverter {
  static getYYYYMMDDhhmmssuuuUTC(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    const millisecond = date.getUTCMilliseconds();
    const YYYY = year.toString();
    const MM = `${month < 10 ? '0' : ''}${month.toString()}`;
    const DD = `${day < 10 ? '0' : ''}${day.toString()}`;
    const hh = `${hour < 10 ? '0' : ''}${hour.toString()}`;
    const mm = `${minute < 10 ? '0' : ''}${minute.toString()}`;
    const ss = `${second < 10 ? '0' : ''}${second.toString()}`;
    const uuu = `${millisecond < 100 ? '0' : ''}${millisecond < 10 ? '0' : ''}${millisecond.toString()}`;
    return `${YYYY}${MM}${DD}${hh}${mm}${ss}${uuu}`;
  }
}
