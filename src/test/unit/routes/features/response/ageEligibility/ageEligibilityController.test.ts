import request from 'supertest';
import {app} from '../../../../../../main/app';
import config from 'config';
import {AGE_ELIGIBILITY_URL} from '../../../../../../main/routes/urls';
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const nock = require('nock');

describe('Under 18 Contact court', ()=> {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    test('should return under 18 contact cort page', async () => {
      await request(app)
        .get(AGE_ELIGIBILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Contact the court');
        });
    });
  });
});
