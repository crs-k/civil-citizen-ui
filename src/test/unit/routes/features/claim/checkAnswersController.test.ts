import nock from 'nock';
import config from 'config';
import {getSummarySections} from '../../../../../main/services/features/claim/checkAnswers/checkAnswersService';
import {CLAIM_CHECK_ANSWERS_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {
  claimAmountParticularDate,
  createClaimWithBasicDetails,
  createClaimWithClaimAmount,
} from '../../../../utils/mocks/claimDetailsMock';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../utils/mocks/defendantClaimsMock.json');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/services/features/claim/checkAnswers/checkAnswersService');

const mockGetSummarySections = getSummarySections as jest.Mock;
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

    it('should return claim amount', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithClaimAmount();
      });

      const response = await session(app).get(CLAIM_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
      const claimAmount = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Claim amount breakdown')]]",
        htmlDocument);
      const interest = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Claim Interest')]]",
        htmlDocument);
      const howClaim = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'How do you want to claim interest?')]]",
        htmlDocument);
      const rateOfInterest = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'What annual rate of interest do you want to claim?')]]",
        htmlDocument);
      const interestFrom = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'When are you claiming interest from?')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(claimAmount.length).toBe(1);
      expect(claimAmount[0].textContent?.trim()).toBe('');
      expect(interest.length).toBe(1);
      expect(interest[0].textContent?.trim()).toBe('yes');
      expect(howClaim.length).toBe(1);
      expect(howClaim[0].textContent?.trim()).toBe('SAME_RATE_INTEREST');
      expect(rateOfInterest.length).toBe(1);
      expect(rateOfInterest[0].textContent?.trim()).toBe('SAME_RATE_INTEREST_8_PC');
      expect(interestFrom.length).toBe(1);
      expect(interestFrom[0].textContent?.trim()).toBe('FROM_CLAIM_SUBMIT_DATE');

    });

    it('should return claim amount', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return claimAmountParticularDate();
      });

      const response = await session(app).get(CLAIM_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
      const rateOfInterest = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'What annual rate of interest do you want to claim?')]]",
        htmlDocument);
      const whyInterest = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Why you're claiming this rate')]]",
        htmlDocument);
      const whenInterest = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'When are you claiming interest from?')]]",
        htmlDocument);
      const interestFrom = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Date interest applied from')]]",
        htmlDocument);
      const interestReason = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Explain why you're claiming for this date')]]",
        htmlDocument);
      const interestUntil = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'When do you want to stop claiming interest?')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(rateOfInterest.length).toBe(1);
      expect(rateOfInterest[0].textContent?.trim()).toBe('SAME_RATE_INTEREST_DIFFERENT_RATE');
      expect(whyInterest.length).toBe(1);
      expect(whyInterest[0].textContent?.trim()).toBe('Reason');
      expect(whenInterest.length).toBe(1);
      expect(whenInterest[0].textContent?.trim()).toBe('FROM_A_SPECIFIC_DATE');
      expect(interestFrom.length).toBe(1);
      expect(interestFrom[0].textContent?.trim()).toBe('1985-02-01');
      expect(interestReason.length).toBe(1);
      expect(interestReason[0].textContent?.trim()).toBe('Reason');
      expect(interestUntil.length).toBe(1);
      expect(interestUntil[0].textContent?.trim()).toBe('UNTIL_SETTLED_OR_JUDGEMENT_MADE');

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
    it('should return 500 when error in service', async () => {
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

