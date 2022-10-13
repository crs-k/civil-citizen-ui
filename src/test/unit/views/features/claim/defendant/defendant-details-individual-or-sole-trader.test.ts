import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import request from 'supertest';
import {
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

describe('Defendant details sole trader or individual view', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    describe('Sole trader', () => {
      let htmlDocument: Document;
      let mainWrapper: Element;

      beforeAll(async () => {
        const response = await request(app).get(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
        mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
      });

      it('should have correct page title', () => {
        expect(htmlDocument.title).toEqual("Your money claims account - Enter the defendant's details");
      });

      it('should display correct header', () => {
        const header = mainWrapper.getElementsByClassName('govuk-heading-l');
        expect(header[0].innerHTML).toContain("Enter the defendant's details");
      });

      it('should display correct paragraph', () => {
        const paragraph = mainWrapper.getElementsByClassName('govuk-body');
        expect(paragraph[0].innerHTML).toContain('You’ll have to pay extra fee if you later want to change the name of anyone involved with the claim.');
        expect(paragraph[1].innerHTML).toContain('If your address is not correct you can change it here. Any changes will be shared with the claimant when you submit your response.');
        expect(paragraph[2].innerHTML).toContain('Enter the organisation’s main office or address that has a connection with the claim. The address must be in England or Wales.');
      });

      it('should display input fields for address', () => {
        const inputs = mainWrapper.getElementsByClassName('govuk-input');
        expect(inputs.length).toBe(10);
        expect(inputs[0].getAttribute('id')).toBe('individualTitle');
        expect(inputs[1].getAttribute('id')).toBe('individualFirstName');
        expect(inputs[2].getAttribute('id')).toBe('individualLastName');
        expect(inputs[3].getAttribute('id')).toBe('soleTraderTradingAs');
        expect(inputs[4].getAttribute('id')).toBe('primaryPostcode');
        expect(inputs[5].getAttribute('id')).toBe('primaryAddressLine1');
        expect(inputs[6].getAttribute('id')).toBe('primaryAddressLine2');
        expect(inputs[7].getAttribute('id')).toBe('primaryAddressLine3');
        expect(inputs[8].getAttribute('id')).toBe('primaryCity');
        expect(inputs[9].getAttribute('id')).toBe('primaryPostCode');
      });

      it('should display correct address header', () => {
        const header = mainWrapper.getElementsByClassName('govuk-heading-m');
        expect(header[0].innerHTML).toContain('Their address');
      });

      it('should display save and continue button', () => {
        expect(mainWrapper.getElementsByClassName('govuk-button')[1].innerHTML).toContain('Save and continue');
      });
      it('should display contact us for help', () => {
        const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
        expect(contactUs[0].innerHTML).toContain('Contact us for help');
      });
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;
    describe('Sole Trader', () => {
      beforeAll(async () => {
        const response = await request(app).post(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL).send({individualFirstName: '', individualLastName: ''});
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display error summary with errors', () => {
        const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary')[0]
          .getElementsByClassName('govuk-error-summary__title')[0];
        const errorSummaryMessages = htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
          .getElementsByTagName('li');
        expect(errorSummary.innerHTML).toContain('There was a problem');
        expect(errorSummaryMessages[0].innerHTML).toContain(TestMessages.ENTER_FIRST_NAME);
        expect(errorSummaryMessages[0].getElementsByTagName('a')[0].getAttribute('href'))
          .toContain('#individualFirstName');
        expect(errorSummaryMessages[1].innerHTML).toContain(TestMessages.ENTER_LAST_NAME);
        expect(errorSummaryMessages[1].getElementsByTagName('a')[0].getAttribute('href'))
          .toContain('#individualLastName');
        expect(errorSummaryMessages[2].innerHTML).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(errorSummaryMessages[2].getElementsByTagName('a')[0].getAttribute('href'))
          .toContain('#primaryAddressLine1');
        expect(errorSummaryMessages[3].innerHTML).toContain(TestMessages.ENTER_POSTCODE);
        expect(errorSummaryMessages[3].getElementsByTagName('a')[0].getAttribute('href'))
          .toContain('#primaryPostCode');
        expect(errorSummaryMessages[4].innerHTML).toContain(TestMessages.ENTER_TOWN);
        expect(errorSummaryMessages[4].getElementsByTagName('a')[0].getAttribute('href'))
          .toContain('#primaryCity');
      });

      it('should display correct error message for input fields', () => {
        const errorMessages = htmlDocument.getElementsByClassName('govuk-error-message');
        expect(errorMessages[0].innerHTML).toContain(TestMessages.ENTER_FIRST_NAME);
        expect(errorMessages[1].innerHTML).toContain(TestMessages.ENTER_LAST_NAME);
        expect(errorMessages[2].innerHTML).toContain(TestMessages.CANT_FIND_ADDRESS);
        expect(errorMessages[3].innerHTML).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(errorMessages[4].innerHTML).toContain(TestMessages.ENTER_TOWN);
        expect(errorMessages[5].innerHTML).toContain(TestMessages.ENTER_POSTCODE);
      });
    });
  });
});
