import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import errors from './errors';

const SHEET_ID = '1kqzyUyQbVi7i00AE8XhlN81kTIHlGUHswFN_S6UlqZk';

const serviceAccountAuth = new JWT({
  email: 'tgbots-1line-support@test-project-tgbots.iam.gserviceaccount.com',
  key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC4dJzlf++Xe1dz\ns9DVcjQiCioeyby812LLU4WWjSsHTtw+MDQQR7sR0BxTn8EyGG5Z5XRMKE2vgxkB\nI7hZYkfJJYbTY4VRgUB6/FNMy2cyOVQC4JMvPEB/NIVP5+ExgOj5RZAXnxl4/222\nb/MzEkw1e8tpjCbNXY5nJzklMKYIcmdxvmMGAtivwDMmxmi0ZtPv9bgGjDTWSmG/\nuFwZUKq0E/ZQ8+rsLcToZhDE3vdaT9XInpmGqA4PDvC3vG5ZxFlP2tNJNuVBpVO1\nuwCp8K8BS7Z0xPcFFN3h7ta5KydoeYduvndircyX+pgTVWA+kVR+A8R387hEGdfW\nvjF5O3vXAgMBAAECggEAGJFI6mpWpjBCjsG27A7zcaCKnqIpALqWnn/dLZcCJvgy\nbm1WKeBGmBHwtpSdvfHcv3LHwXL8HIcorUBYMpOGqHxWj6Ypi22x1w+aJVgmwlzk\nsHi/3Hfjxpg0tKwCOukxXoNiNJCMwH2+MPaKh6qwECQ7t1mi5hHIFeYhVC+SwFIJ\nS3awWwsAjvN3bDCrxP5yOBcgi42yOHMriXya5+96aZ31HLAzImFv8iFGYD8stnYb\nXBlSXTsrUhHjm/EjI5e28RrlMhHZj0XtF8H5N8zHPcqFVrC+LYvkBFZK3na1Rhjg\ntMZS13NAKWDnszf0FkGswd2+pDQ6uZDqT/2koY98MQKBgQDbK16bZqtK16YplclK\ndKBp2heobxNcy6Wm71d+/Bk6GebtO2Vg1evQNwiM9LX2fCDQfYV+uphZB7lAsJiX\nj0TpVd3zEWrE938QQVcFxl78GOgcA3wOvZCbdZC20qqMsquy8jdbuKDygPcacfxZ\nWR85IKQ8ZiAEHrZ9Fu1LrsAFxwKBgQDXc9uLcvVHDqp3nYxWkuJw37F0LAWCD985\nmX8YJ7+tnJWqn7oYyQjg8XrUAVjGb/5Z39mFwA4veedUngBYQ0yy5NKUsHsqwtSA\nLs7GKyd7KG3Vwdx/+u3guYpUpjQBzxrWMVlm1rqVVg/rLUR/gvvRCBAF2XtSGTU8\nGCsNsNOZcQKBgQCDAma4D+Qehc+ulfnQBu0IuTRhG5yAYL8xjWpI3tsZjvgqINIV\n02n1eaAj2feXUlWvKwkMWu/McEB9edKM7jgsHobg0C15ddQ/XD9vlUeb/Ctq625R\nxWDWfK03i7AlEHxwKDeNHU0gCJUs+qv0oMB4PpnN/OHwdIdzOKw6DEh+awKBgC0I\nOEEjXAToGdU6htSpis7Q0oRXlyciLiQZ4yinVjbxXY72J616h3KMxoF9bpK7Ycxj\nL1H3XH+r2SAkjinklyllDmappHTBmCzam7lr16q0PpDJHk9ZoVKxNSqQOpqOMSvH\n0Mnf48vG2zjqk0CbngqIxuCSHmaAglH3Mzh/VxrhAoGBAMp6BbV48Ss5Sqmu1NJY\nmfQVCpNZXCaFAOrOV8WDHsVgY6JOGELF1bvSB/rQAN2jw3oSjZMueKSYWM/f307T\nF2nW8orBW2Vs9NCI2FlxcQyKXRdT3fZRcdn/miMDU8iOJnO++pUmuzLPqrX/sv1S\nk2jCi9t/QD64OR7wGLyTI9zT\n-----END PRIVATE KEY-----\n',
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
