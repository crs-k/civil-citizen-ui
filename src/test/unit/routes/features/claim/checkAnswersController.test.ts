import nock from 'nock';
import config from 'config';
import {getSummarySections} from '../../../../../main/services/features/claim/checkAnswers/checkAnswersService';
import {CLAIM_CHECK_ANSWERS_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {createClaimWithBasicDetails, createClaimWithYourDetails} from '../../../../utils/mocks/claimDetailsMock';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {Claim} from '../../../../../main/common/models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {STATEMENT_OF_TRUTH_REQUIRED_MESSAGE} from 'form/validationErrors/errorMessageConstants';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../utils/mocks/defendantClaimsMock.json');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/claim/checkAnswers/checkAnswersService');

const mockGetSummarySections = getSummarySections as jest.Mock;
const mockGetClaim = getCaseDataFromStore as jest.Mock;
const PARTY_NAME = 'Mrs. Mary Richards';

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';
  const checkYourAnswerCy = 'Gwiriwch eich ateb';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .get('/cases/defendant/123')
      .reply(200, {data: data});
    nock(civilServiceUrl)
      .get('/cases/claimant/123')
      .reply(200, {data: data});
  });

  describe('on GET', () => {
    mockGetClaim.mockImplementation(() => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.helpWithFees = new HelpWithFees();
      claim.claimDetails.helpWithFees.option = YesNo.YES;
      return claim;
    });

    it('should return check answers page', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithBasicDetails();
      });

      const response = await session(app).get(CLAIM_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);

    });
    it('should return check answers page with Your details and their details sections', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithBasicDetails();
      });

      const response = await session(app).get(CLAIM_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
      const fullName = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Full name')]]",
        htmlDocument);
      const address = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Address')]]",
        htmlDocument);
      const correspondence = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Correspondence address')]]",
        htmlDocument);
      const contact = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Contact number (optional)')]]",
        htmlDocument);
      const email = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Email')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(fullName.length).toBe(2);
      expect(fullName[0].textContent?.trim()).toBe(PARTY_NAME);
      expect(fullName[1].textContent?.trim()).toBe(PARTY_NAME);
      expect(address.length).toBe(2);
      expect(address[0].textContent?.trim()).toBe('54 avenue');
      expect(address[1].textContent?.trim()).toBe('Simon street');
      expect(correspondence.length).toBe(1);
      expect(correspondence[0].textContent?.trim()).toBe('Same as address');
      expect(contact.length).toBe(2);
      expect(contact[0].textContent?.trim()).toBe('12345');
      expect(contact[1].textContent?.trim()).toBe('98765');
      expect(email.length).toBe(1);
      expect(email[0].textContent?.trim()).toBe('contact@gmail.com');
    });

    it('should pass english translation via query', async () => {
      await session(app).get(CLAIM_CHECK_ANSWERS_URL)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });
    it('should pass cy translation via query', async () => {
      await session(app).get(CLAIM_CHECK_ANSWERS_URL)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerCy);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await session(app)
        .get(CLAIM_CHECK_ANSWERS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    it('should return errors when form is incomplete', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithYourDetails();
      });
      const data = {signed: ''};
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(STATEMENT_OF_TRUTH_REQUIRED_MESSAGE);
        });
    });
    it('should return payment button when Fee is no', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithYourDetails();
      });
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.helpWithFees = new HelpWithFees();
        claim.claimDetails.helpWithFees.option = YesNo.NO;
        return claim;
      });
      const data = {signed: ''};
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Submit and continue to payment');
        });
    });
    it('should return submit button when Fee is yes', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithYourDetails();
      });
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.helpWithFees = new HelpWithFees();
        claim.claimDetails.helpWithFees.option = YesNo.YES;
        return claim;
      });
      const data = {signed: ''};
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Submit Response');
        });
    });
    it('should return 500 when error in service', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

