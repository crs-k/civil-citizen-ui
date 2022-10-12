import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIMANT_ORGANISATION_DETAILS_URL} from '../../../../../../main/routes/urls';
import {t} from 'i18next';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'PAGES.ORGANISATION_DETAILS.PAGE_TITLE';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claimant Organisation Details View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeAll(async () => {
      const response = await request(app).get(CLAIMANT_ORGANISATION_DETAILS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display correct header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.ORGANISATION_DETAILS.TITLE'));
    });

    it('should display These details are shared paragraph', () => {
      const paragraph = mainWrapper.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toEqual(t('PAGES.CLAIM_JOURNEY.CLAIMANT_INDIVIDUAL_DETAILS.THESE_DETAILS_ARE'));
    });

    it('should display Company name and Contact person labels', () => {
      const labels = mainWrapper.getElementsByClassName('govuk-label');
      expect(labels[0].innerHTML).toContain('Company name');
      expect(labels[1].innerHTML).toContain('Contact person');
    });

    it('should display all inputs', () => {
      const inputs = mainWrapper.getElementsByClassName('govuk-input');
      expect(inputs).toBeDefined();
      expect(inputs.length).toEqual(14);
    });

    describe('Your postal address section', () => {
      it('should display Your postal address heading', () => {
        const header = mainWrapper.getElementsByClassName('govuk-heading-m')[0];
        expect(header.innerHTML).toContain(t('PAGES.ORGANISATION_DETAILS.ADDRESS'));
      });

      it('should display If your address is paragraph', () => {
        const paragraph = mainWrapper.getElementsByClassName('govuk-body')[1];
        expect(paragraph.innerHTML).toEqual('If your address is not correct you can change it here. Any changes will be shared with the claimant when you submit your response.');
      });

      it('should display primary address labels', () => {
        const labels = mainWrapper.getElementsByClassName('govuk-label');
        expect(labels[3].innerHTML).toContain('Building and street');
        expect(labels[6].innerHTML).toContain('Town or city');
        expect(labels[7].innerHTML).toContain('Postcode');
      });

      it('should display Enter address manually text', () => {
        const paragraph = mainWrapper.getElementsByClassName('govuk-body')[3];
        expect(paragraph.innerHTML).toContain('Enter address manually');
      });
    });

    describe('Correspondence address section', () => {
      it('should display Correspondence address heading', () => {
        const header = mainWrapper.getElementsByClassName('govuk-heading-m')[1];
        expect(header.innerHTML).toContain(t('PAGES.CITIZEN_DETAILS.CORRESPONDENCE_ADDRESS'));
      });

      it('should display Would you like correspondence paragraph', () => {
        const paragraph = mainWrapper.getElementsByClassName('govuk-fieldset__legend')[0];
        expect(paragraph.innerHTML).toContain('Would you like correspondence sent to a different address?');
      });

      it('should display yes and no radios', () => {
        const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
        expect(radios[0].getAttribute('value')).toBe('no');
        expect(radios[1].getAttribute('value')).toBe('yes');
        const labels = mainWrapper.getElementsByClassName('govuk-label');
        expect(labels[8].innerHTML).toContain('No');
        expect(labels[9].innerHTML).toContain('Yes, add a correspondence address');
      });

      it('should display correspondence address labels', () => {
        const labels = mainWrapper.getElementsByClassName('govuk-label');
        expect(labels[13].innerHTML).toContain('Building and street');
        expect(labels[15].innerHTML).toContain('Town or city');
        expect(labels[16].innerHTML).toContain('Postcode');
      });

      it('should display Enter address manually text', () => {
        const paragraph = mainWrapper.getElementsByClassName('govuk-body')[3];
        expect(paragraph.innerHTML).toContain('Enter address manually');
      });
    });

    it('should display Save and continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[2];
      expect(button.innerHTML).toContain(t('COMMON.BUTTONS.SAVE_AND_CONTINUE'));
    });
  });
});
