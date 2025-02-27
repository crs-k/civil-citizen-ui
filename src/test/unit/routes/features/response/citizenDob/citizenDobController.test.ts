import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  AGE_ELIGIBILITY_URL,
  DOB_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../../../../main/routes/urls';
import {
  mockCivilClaim,
  mockCivilClaimUndefined,
  mockRedisFailure,
  mockNoStatementOfMeans,
  mockCivilClaimRespondentIndividualTypeWithPhoneNumber,
  mockCivilClaimApplicantIndividualType,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Citizen date of birth', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should return citizen date of birth page empty when dont have information on redis ', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
        });
    });
    it('should return citizen date of birth page with all information from redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(DOB_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });
    it('should return error on year less than 1872', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=1871')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });
    it('should return error on empty year', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });
    it('should return error on future date', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2400')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DATE'));
        });
    });
    it('should return error 4 digit year', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=22')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should accept a valid input', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect to under 18 contact court page', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${AGE_ELIGIBILITY_URL}`);
        });
    });
    it('should redirect to under 18 contact court page when has information on redis', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${AGE_ELIGIBILITY_URL}`);
        });
    });
    it('should redirect to phone number page on valid DOB', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_TASK_LIST_URL}`);
        });
    });
    it('should redirect to phone number page on valid DOB when has undefined on redis', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CITIZEN_PHONE_NUMBER_URL}`);
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    describe('Redirect to phone-number or task-list screen', () => {
      it('should redirect to task-list screen if phone-number provided', async () => {
        app.locals.draftStoreClient = mockCivilClaimRespondentIndividualTypeWithPhoneNumber;
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
          });
      });
      it('should redirect to phone-number screen if phone-number NOT provided', async () => {
        app.locals.draftStoreClient = mockCivilClaimApplicantIndividualType;
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });
    });
  });
});
