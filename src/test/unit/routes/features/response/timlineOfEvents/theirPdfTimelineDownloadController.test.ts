import config from 'config';
import nock from 'nock';
import {mockCivilClaimPDFTimeline, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as documentUtils from '../../../../../../main/common/utils/downloadUtils';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/client/dmStoreClient');

describe('Their PDF timeline controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should display the pdf successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaimPDFTimeline;
      const mockDisplayPDFDocument = jest.spyOn(documentUtils, 'displayPDF');
      await request(app)
        .get('/case/1111/documents/timeline')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(mockDisplayPDFDocument).toBeCalled();
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get('/case/1111/documents/timeline')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

