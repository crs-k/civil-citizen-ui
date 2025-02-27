import {Claim} from '../../../../../main/common/models/claim';
import {getDescription, getTaskLists, getTitle} from '../../../../../main/services/features/response/taskListService';
import {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildSubmitSection,
} from '../../../../../main/common/utils/taskList/taskListBuilder';
import {ResponseType} from '../../../../../main/common/form/models/responseType';
import {TaskStatus} from '../../../../../main/common/models/taskList/TaskStatus';
import {deepCopy} from '../../../../utils/deepCopy';
import {PartyType} from '../../../../../main/common/models/partyType';
import {Party} from '../../../../../main/common/models/party';
import {PaymentOptionType} from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {StatementOfMeans} from '../../../../../main/common/models/statementOfMeans';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {PartyDetails} from '../../../../../main/common/form/models/partyDetails';
import {Address} from '../../../../../main/common/form/models/address';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Response Task List service', () => {
  const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
  const mockClaimId = '5129';
  const lang = 'en';

  describe('none of the tasks completed', () => {
    const caseData = Object.assign(new Claim(), deepCopy(mockClaim.case_data));
    const actualTaskLists = getTaskLists(caseData, mockClaimId, lang);

    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(caseData, mockClaimId, lang);
      const taskListRespondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId, lang);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actualTaskLists).toMatchObject(filteredTaskGroups);
    });

    it('should return title', () => {
      //When
      const title = getTitle(actualTaskLists, lang);
      //Then
      expect(title).toEqual('TASK_LIST.APPLICATION_INCOMPLETE');
    });

    it('should return description', () => {
      //When
      const description = getDescription(actualTaskLists, lang);
      //Then
      expect(description).toEqual('TASK_LIST.COMPLETED_SECTIONS');
    });
  });

  describe('when primary address and dob is provided, expect confirm your details completed', () => {
    const PRIMARY_ADDRESS_LINE_1 = 'Berry House';
    const PRIMARY_ADDRESS_LINE_2 = '12 Berry street';
    const PRIMARY_ADDRESS_TOWN = 'London';
    const PRIMARY_ADDRESS_POSTCODE = 'E1 6AN';
    const caseData = Object.assign(new Claim(), deepCopy(mockClaim.case_data));
    caseData.respondent1.primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
    caseData.respondent1.dateOfBirth = '15 May 1978';
    const actualTaskLists = getTaskLists(caseData, mockClaimId, lang);

    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(caseData, mockClaimId, lang);
      const taskListRespondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId, lang);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actualTaskLists).toMatchObject(filteredTaskGroups);
    });

    it('should return description', () => {
      //When
      const description = getDescription(actualTaskLists, lang);
      //Then
      expect(actualTaskLists[0].tasks[0].description).toEqual('COMMON.CONFIRM_YOUR_DETAILS');
      expect(actualTaskLists[0].tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      expect(description).toEqual('TASK_LIST.COMPLETED_SECTIONS');
    });
  });

  describe('when correspondence address and dob is provided, expect confirm your details completed', () => {
    const CORRESPONDENCE_ADDRESS_LINE_1 = 'PO Box';
    const CORRESPONDENCE_ADDRESS_LINE_2 = 'Dean close';
    const CORRESPONDENCE_TOWN = 'Bristol';
    const CORRESPONDENCE_POSTCODE = 'BS1 4HK';
    const caseData = Object.assign(new Claim(), deepCopy(mockClaim.case_data));
    caseData.respondent1.partyDetails.correspondenceAddress = buildAddress(CORRESPONDENCE_ADDRESS_LINE_1, CORRESPONDENCE_ADDRESS_LINE_2, CORRESPONDENCE_TOWN, CORRESPONDENCE_POSTCODE);
    caseData.respondent1.partyDetails.primaryAddress = {};
    caseData.respondent1.responseType = ResponseType.FULL_ADMISSION;
    caseData.respondent1.dateOfBirth = '15 May 1978';
    const actualTaskLists = getTaskLists(caseData, mockClaimId, lang);

    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(caseData, mockClaimId, lang);
      const taskListRespondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId, lang);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actualTaskLists).toMatchObject(filteredTaskGroups);
    });

    it('should return description', () => {
      //When

      const description = getDescription(actualTaskLists, lang);
      //Then
      expect(actualTaskLists[0].tasks[0].description).toEqual('COMMON.CONFIRM_YOUR_DETAILS');
      expect(actualTaskLists[0].tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(description).toEqual('TASK_LIST.COMPLETED_SECTIONS');
    });
  });

  describe('Respond to claim task list', () => {
    const caseData = new Claim();
    caseData.respondent1 = new Party();
    caseData.respondent1.partyDetails = new PartyDetails({});
    caseData.respondent1.partyDetails.individualFirstName = 'Joe';
    caseData.respondent1.type = PartyType.INDIVIDUAL;
    caseData.respondent1.responseType = ResponseType.FULL_ADMISSION;
    delete caseData.paymentOption;

    it('should display choose a response task as incomplete', () => {
      const respondToClaim = buildRespondToClaimSection(new Claim(), mockClaimId, lang);

      expect(respondToClaim.tasks[0].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.CHOOSE_A_RESPONSE');
      expect(respondToClaim.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display choose a response task as complete', () => {
      const respondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);

      expect(respondToClaim.tasks[0].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.CHOOSE_A_RESPONSE');
      expect(respondToClaim.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should display decide how you\'ll pay task as incomplete', () => {
      const respondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);

      expect(respondToClaim.tasks[1].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.DECIDE_HOW_YOU_WILL_PAYS');
      expect(respondToClaim.tasks[1].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display decide how you\'ll pay task as complete', () => {
      caseData.paymentOption = PaymentOptionType.IMMEDIATELY;

      const respondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      expect(respondToClaim.tasks[1].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.DECIDE_HOW_YOU_WILL_PAYS');
      expect(respondToClaim.tasks[1].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should have all respond to claim tasks marked as complete if payment option is immediately', () => {
      expect(buildRespondToClaimSection(caseData, mockClaimId, lang).tasks.every(task => task.status === TaskStatus.COMPLETE)).toEqual(true);
    });

    it('should display share your financial details task as incomplete if payment option is by set date', () => {
      caseData.paymentOption = PaymentOptionType.BY_SET_DATE;

      const respondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      expect(respondToClaim.tasks[2].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.SHARE_YOUR_FINANCIAL_DETAILS');
      expect(respondToClaim.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display share your financial details task as incomplete if taskSharedFinancialDetails is not set', () => {
      caseData.taskSharedFinancialDetails = undefined;

      const respondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      expect(respondToClaim.tasks[2].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.SHARE_YOUR_FINANCIAL_DETAILS');
      expect(respondToClaim.tasks[2].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display share your financial details task as complete if payment option is by set date', () => {
      caseData.taskSharedFinancialDetails = true;
      caseData.statementOfMeans = new StatementOfMeans();
      caseData.statementOfMeans.disability = new GenericYesNo();
      caseData.statementOfMeans.severeDisability = new GenericYesNo();
      caseData.statementOfMeans.disability.option = YesNo.YES;
      caseData.statementOfMeans.severeDisability.option = YesNo.NO;

      const respondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      expect(respondToClaim.tasks[2].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.SHARE_YOUR_FINANCIAL_DETAILS');
      expect(respondToClaim.tasks[2].status).toEqual(TaskStatus.COMPLETE);
      // all tasks completed check
      expect(respondToClaim.tasks.every(task => task.status === TaskStatus.COMPLETE)).toEqual(true);
    });

    it('should display your repayment plan as incomplete if payment option is installments', () => {
      caseData.paymentOption = PaymentOptionType.INSTALMENTS;

      const respondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      expect(respondToClaim.tasks[3].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.YOUR_REPAYMENT_PLAN');
      expect(respondToClaim.tasks[3].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display your repayment plan as complete if payment option is installments', () => {
      caseData.paymentOption = PaymentOptionType.INSTALMENTS;
      caseData.repaymentPlan = {
        paymentAmount: 5,
        repaymentFrequency: 'monthly',
      };

      const respondToClaim = buildRespondToClaimSection(caseData, mockClaimId, lang);
      expect(respondToClaim.tasks[3].description).toEqual('TASK_LIST.RESPOND_TO_CLAIM.YOUR_REPAYMENT_PLAN');
      expect(respondToClaim.tasks[3].status).toEqual(TaskStatus.COMPLETE);
      // all tasks completed check
      expect(respondToClaim.tasks.every(task => task.status === TaskStatus.COMPLETE)).toEqual(true);
    });
  });
});

function buildAddress(line1: string, line2: string, postcode: string, postTown: string): Address {
  return new Address(line1, line2, '', postcode, postTown);
}
