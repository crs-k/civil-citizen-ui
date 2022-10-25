import {app} from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CLAIM_TASK_LIST_URL,
  DOB_URL,
} from '../../../../../../main/routes/urls';
import {
  VALID_ADDRESS_LINE_1,
  VALID_CITY,
  VALID_CORRESPONDENCE_ADDRESS_LINE_1,
  VALID_CORRESPONDENCE_CITY,
  VALID_CORRESPONDENCE_POSTCODE,
  VALID_POSTCODE,
  NOT_TO_REMOVE_PHONE_NUMBER,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  getCorrespondenceAddressForm,
  getRespondentInformation,
  saveRespondent,
} from '../../../../../../main/services/features/response/citizenDetails/citizenDetailsService';
import {Claim} from '../../../../../../main/common/models/claim';
import {Party} from '../../../../../../main/common/models/party';
import {buildCorrespondenceAddress, buildPrimaryAddress} from '../../../../../utils/mockClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {CitizenCorrespondenceAddress} from '../../../../../../main/common/form/models/citizenCorrespondenceAddress';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/response/citizenDetails/citizenDetailsService');

const mockGetRespondentInformation = getRespondentInformation as jest.Mock;
const mockGetCorrespondenceAddressForm = getCorrespondenceAddressForm as jest.Mock;
const mockSaveRespondent = saveRespondent as jest.Mock;

const claim = new Claim();

const buildClaimOfRespondent = (): Party => {
  claim.respondent1 = new Party();
  claim.respondent1.individualTitle = 'individualTitle';
  claim.respondent1.individualFirstName = 'individualFirstName';
  claim.respondent1.individualLastName = 'individualLastName';
  claim.respondent1.primaryAddress = buildPrimaryAddress();
  claim.respondent1.correspondenceAddress = buildCorrespondenceAddress();
  return claim.respondent1;
};

const buildClaimOfRespondentType = (type: PartyType): Party => {
  claim.respondent1 = new Party();
  claim.respondent1.type = type;
  claim.respondent1.primaryAddress = buildPrimaryAddress();
  claim.respondent1.correspondenceAddress = buildCorrespondenceAddress();
  return claim.respondent1;
};

const nock = require('nock');

const validDataForPost = {
  primaryAddressLine1: 'Flat 3A Middle Road',
  primaryAddressLine2: '',
  primaryAddressLine3: '',
  primaryCity: 'London',
  primaryPostCode: 'SW1H 9AJ',
  postToThisAddress: 'no',
  correspondenceAddressLine1: '',
  correspondenceAddressLine2: '',
  correspondenceAddressLine3: '',
  correspondenceCity: '',
  correspondencePostCode: '',
};

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('on Exception', () => {
    it('should return http 500 when has error in the get method', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  it('should return http 500 when has error in the post method', async () => {
    mockSaveRespondent.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send(validDataForPost)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  it('should return your details page with empty information', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return new Party();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  it('should return your details page with information', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondent();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  it('should return your details page with information without correspondent address', async () => {
    const buildClaimOfRespondentWithoutCorrespondent = (): Party => {
      claim.respondent1 = new Party();
      claim.respondent1.individualTitle = 'individualTitle';
      claim.respondent1.individualFirstName = 'individualFirstName';
      claim.respondent1.individualLastName = 'individualLastName';
      claim.respondent1.primaryAddress = buildPrimaryAddress();
      return claim.respondent1;
    };
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentWithoutCorrespondent();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  it('should return your details company page', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.COMPANY);
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('Company name');
      });
  });

  it('should return your details organisation page', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('Organisation name');
      });
  });

  it('POST/Citizen details - should redirect on correct primary address', async () => {
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('POST/Citizen details - should redirect on correct correspondence address', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: 'Flat 3B Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: 'London',
        correspondencePostCode: 'SW1H 9AJ',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3B Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: 'London',
        correspondencePostCode: 'SW1H 9AJ',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('POST/Citizen details - should return error on empty primary address line', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
      });
  });

  it('POST/Citizen details - should return error on empty primary city', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CITY);
      });
  });

  it('POST/Citizen details - should return error on empty primary postcode', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: '',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_POSTCODE);
      });
  });

  it('POST/Citizen details - should return error on empty correspondence address line', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
      });
  });

  it('POST/Citizen details - should return error on empty correspondence city', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: 'Flat 3B Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: 'SW1H 9AJ',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3B Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: 'SW1H 9AJ',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
      });
  });

  it('POST/Citizen details - should return error on empty correspondence postcode', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: 'Flat 3B Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3B Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: 'London',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('POST/Citizen details - should return error on no input', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CITY);
        expect(res.text).toContain(VALID_POSTCODE);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('POST/Citizen details - should return error on input for primary address when postToThisAddress is set to NO', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CITY);
        expect(res.text).toContain(VALID_POSTCODE);
      });
  });

  it('POST/Citizen details - should return error on input for correspondence address when postToThisAddress is set to YES', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('POST/Citizen details - should display organisation details and return errors when postToThisAddress is set to YES', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('Organisation name');
      });
  });

  it('POST/Citizen details - should display company details and return errors when postToThisAddress is set to YES', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.COMPANY);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('Company name');
      });
  });

  it('POST/Citizen details - should display company details with telephone number and return errors when postToThisAddress is set to YES', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return {...buildClaimOfRespondentType(PartyType.COMPANY), partyPhone: '123456'};
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
        partyPhone: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
        expect(res.text).toContain(NOT_TO_REMOVE_PHONE_NUMBER);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('Your phone number');
      });
  });

  it('POST/Citizen details - should display Sole trader details and return errors when postToThisAddress is set to YES', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.SOLE_TRADER);
    });
    mockGetCorrespondenceAddressForm.mockImplementation(() => {
      return CitizenCorrespondenceAddress.fromObject({
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      });
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('Your full name');
      });
  });

  it('get/Citizen details - should return test variable when there is no data on redis and civil-service', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      const party = new Party();
      party.type = PartyType.INDIVIDUAL;
      return party;
    });
    await request(app)
      .get('/case/1111/response/your-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('individualTitle Test');
      });
  });

  describe('Redirect to Phone or DOB screen (phone number not provided)', () => {
    it('should redirect to confirm phone screen if respondent type is COMPANY', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return buildClaimOfRespondentType(PartyType.COMPANY);
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
        });
    });
    it('should redirect to confirm phone screen if respondent type is ORGANISATION', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return buildClaimOfRespondentType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
        });
    });
    it('should redirect to confirm DOB screen if respondent type is INDIVIDUAL', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return buildClaimOfRespondentType(PartyType.INDIVIDUAL);
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DOB_URL);
        });
    });
    it('should redirect to confirm your phone screen if respondent type is SOLE TRADER', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return buildClaimOfRespondentType(PartyType.SOLE_TRADER);
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
        });
    });
  });

  describe('Redirect to Phone or DOB screen (phone number provided)', () => {
    it('should redirect to task-list screen if respondent type is COMPANY', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentType(PartyType.COMPANY), partyPhone: '123456'};
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    it('should redirect to task-list screen if respondent type is ORGANISATION', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentType(PartyType.ORGANISATION), partyPhone: '123456'};
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    it('should redirect to confirm DOB screen if respondent type is INDIVIDUAL', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentType(PartyType.INDIVIDUAL), partyPhone: '123456'};
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DOB_URL);
        });
    });
    it('should redirect to task-list  screen if respondent type is SOLE TRADER', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentType(PartyType.SOLE_TRADER), partyPhone: '123456'};
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
  });
});
