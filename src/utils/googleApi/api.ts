import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import errors from './errors';

const SHEET_ID = '1PVhT9uuAUUnTEP-ZrnaZMlMYSpW8luyvoY_aKILEATo';

const serviceAccountAuth = new JWT({
  email: 'telegatest@my-project-to-tg-bot.iam.gserviceaccount.com',
  key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDozmieDIdoVqv2\nc5obi1jDAgNw+0T7xvwRReKBMBPrFnkHsN4TdVxtRXWLUFVHWHZVhyR5LCfRTMkl\npwc/XvsOMHGhnmTh9hHwovfD2TshyP+O+MzR6I1kmfcKT0UGEb4oRH3cYwk3Dzyz\ngJxiEqDjDStnQCehShuICfQFSlRCAmZ7oZFf1hiqhEn782z8nePK35H8jP4F6gwq\n6VQyYfZlpsbk5aTGJlM/9Y+9KukHeDYyaKbc2Wx4b9VHHKRsa3puspuf2eBYhuHL\npugXTYliGKxHZucMUj9rtwmgRE4U62yfO8BuEM3ef7LE9vE+YcL3bvB6TgJyMwTY\ndS16qrtnAgMBAAECggEAA2c980dPf6leCEw7xqqHNu6Vb71UnMcyEc89VrXNDL3M\no3ozCx8ACS0ftmKZwP3AA8VJmSen7SKi8z+SVtRSIHPO9I6cDQuWWTfSc4ao8LD/\nW9mk7VG/CoO6WfaezocS34QoXN1bxKDJc2/gCybDHpBgcarLe0toGfXYLW9mH5g3\nP1La1sbSltU0jrIyKi3RFQwR99GoywrAgr6WnqKywP751DjdP7Pe0x5PHcpYNwdp\neT5gt0v2aFdrO7SwOuTrQ55UMtYYVhsW8uxswn7KroFY7B1+XXWkwqMLrypVj5Ze\nIyL9hZMzucP17519haE5umZfGNNZB1kv8sJF/QstmQKBgQD7tMYAx+M+wqwbpHu7\nMnI50pAWqXdxxt0nBjDo7IsV1wgVAo6AyLm1yLCJ/0FZv0woovIAIeCc0FVwNRc8\nV2mj6dCLKowYNzRXoESF5vBax1FxEf9UwYVsaYRPCii13+4vUUqHFSjx8N3FUKhg\nKAw6O6EbU0eI8uk8pLEV7IWbiQKBgQDsxxj6q20t3w1EFgmvwnxhSABp8OzqyLl/\nTvjeBfdIjZBbX+f5mtKIY5+xDg4yB8zpU7U/gwS06fyNLXm0I9eIQv3QUFnGWr9S\nwAAe7un7pt57nZ+OiLsKbH6ttDketS3TfSye3muOiSRrbC0/c+yiNB/4XwjytnBI\n3MKhaMAzbwKBgQCFra5y/7XqwQ0S6TplYxdTKkcoIfyzyn/tl9Yl/mqnwLokHmV8\ndB5dMya/Q3d7qKNT+aY498UIw4R8wVWD0JDkYutE3eXlfnwoBZAe5VXFgJH6USqf\n4t9vgmKob6bLYRBoxO2l7FEAnYHKp1mlJ9/GlaCsmIAndYr1kCoUkLcssQKBgGpE\nDPTrnQt6UPTewygrrDDo5K6nX10cCwyU/+J9YPch+cjYqT7/+j8WHySSf1J6579M\nP0sq3SDo5tzhrP5pG6FfF5S3iyMXtUhJPYSki0TTJoTqQCLzQKaz/MKu4PfkLpX9\nVtpSTolhCYRgv4n72BcQN8z7sgNkV86LrZpNbf1nAoGBALGqz76WExvDtkyaLAwk\nx0Z6QztNb5tZMYBKttssGh1WwdNzq9djG5YNVquoqaCoj5vHo9SgM5KkcBHbwGZq\npbsRQ4+ro90hYm7DcTJ4Wcih32bJebJapLfKG38yOaYX2UeEXGrcxqsgsR6KNlO7\ndl9VAaggINLX8H57r8+p/Pfy\n-----END PRIVATE KEY-----\n',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

class GoogleApiService {
  private readonly SHEET_ID: string;
  private readonly serviceAccountAuth: JWT;
  private readonly doc: GoogleSpreadsheet;

  constructor(sheetId: string, serviceAccountAuth: JWT) {
    this.SHEET_ID = sheetId;
    this.serviceAccountAuth = serviceAccountAuth;
    this.doc = new GoogleSpreadsheet(this.SHEET_ID, this.serviceAccountAuth);
  }

  init = async () => {
    try {
      await this.doc.loadInfo(); // loads document properties and worksheets
    } catch {
      throw new Error(JSON.stringify(errors.wrongCreds));
    }
  };

  getButtons = async (pageNumber: number): Promise<string[][]> => {
    try {
      const sheet = this.doc.sheetsByIndex[pageNumber];
      const rows = await sheet.getRows();
      const result = [];
      for (const row of rows) {
        // @ts-ignore
        result.push(row._rawData);
      }
      return result;
    } catch {
      throw new Error(JSON.stringify(errors.wrongLang));
    }
  };

  getPageNames = async (): Promise<string[]> => {
    const res: string[] = [];
    const totalSheets = this.doc.sheetCount;
    for (let i = 0; i < totalSheets; i++) {
      const cur = this.doc.sheetsByIndex[i];
      res.push(cur.a1SheetName);
    }
    return res;
  };

  getPageHeaders = async (pageNumber: number): Promise<string[]> => {
    try {
      const sheet = this.doc.sheetsByIndex[pageNumber];
      await sheet.loadHeaderRow();
      return sheet.headerValues;
    } catch {
      throw new Error(JSON.stringify(errors.wrongCreds));
    }
  };
}

export const googleApiService = new GoogleApiService(SHEET_ID, serviceAccountAuth);
