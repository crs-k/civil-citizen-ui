import {t} from 'i18next';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CLAIM_INTEREST,
  CLAIM_INTEREST_TYPE,
  CLAIM_HELP_WITH_FEES,
} from '../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claim Interest page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return on claim interest page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIM_INTEREST).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.CLAIM_JOURNEY.CLAIM_INTEREST.TITLE'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_INTEREST)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error message when no option selected', async () => {
      await request(app).post(CLAIM_INTEREST).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_YES_NO_SELECTION);
      });
    });

    it('should redirect to the How do you want to claim interest screen when option is Yes', async () => {
      await request(app).post(CLAIM_INTEREST).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_INTEREST_TYPE);
        });
    });

    it('should redirect to the Help with fees screen when option is Yes', async () => {
      await request(app).post(CLAIM_INTEREST).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_HELP_WITH_FEES);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIM_INTEREST)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

