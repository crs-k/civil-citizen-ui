import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_BANK_ACCOUNT_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');

describe('Bank Accounts and Savings', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should return accounts page successfully', async () => {
      await request(app).get(CITIZEN_BANK_ACCOUNT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your bank and savings accounts');
        });
    });
  });
  describe('on Post', () => {
    it('should return error when type of account is not specified', async () => {
      const data = {
        accounts: [
          {
            typeOfAccount: '',
            joint: 'true',
            balance: '-234.33',
          },
          {
            typeOfAccount: '',
            joint: '',
            balance: '',
          },
        ],
      };
      await request(app).post(CITIZEN_BANK_ACCOUNT_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.TYPE_OF_ACCOUNT_REQUIRED);
        });
    });
    it('should return error when joint is not specified', async () => {
      const data = {
        accounts: [
          {
            typeOfAccount: 'CURRENT_ACCOUNT',
            joint: '',
            balance: '-234.33',
          },
          {
            typeOfAccount: '',
            joint: '',
            balance: '',
          },
        ],
      };
      await request(app).post(CITIZEN_BANK_ACCOUNT_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_OPTION_SELECTION);
        });
    });
    it('should return error when balance is not specified', async () => {
      const data = {
        accounts: [
          {
            typeOfAccount: 'CURRENT_ACCOUNT',
            joint: 'No',
            balance: '',
          },
          {
            typeOfAccount: '',
            joint: '',
            balance: '',
          },
        ],
      };
      await request(app).post(CITIZEN_BANK_ACCOUNT_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_NUMBER);
        });
    });
    it('should return error when balance has more than two decimal places', async () => {
      const data = {
        accounts: [
          {
            typeOfAccount: 'CURRENT_ACCOUNT',
            joint: 'No',
            balance: '456.9090',
          },
          {
            typeOfAccount: '',
            joint: '',
            balance: '',
          },
        ],
      };
      await request(app).post(CITIZEN_BANK_ACCOUNT_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TWO_DECIMAL_NUMBER);
        });
    });
    it('should return error when balance for input is 00', async () => {
      const data = {
        accounts: [
          {
            typeOfAccount: 'CURRENT_ACCOUNT',
            joint: 'No',
            balance: '00.0',
          },
          {
            typeOfAccount: '',
            joint: '',
            balance: '',
          },
        ],
      };
      await request(app).post(CITIZEN_BANK_ACCOUNT_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_NUMBER);
        });
    });
    it('should should redirect when no validation errors', async () => {
      const data = {
        accounts: [
          {
            typeOfAccount: 'CURRENT_ACCOUNT',
            joint: 'No',
            balance: '456.90',
          },
          {
            typeOfAccount: '',
            joint: '',
            balance: '',
          },
        ],
      };
      await request(app).post(CITIZEN_BANK_ACCOUNT_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });
});
