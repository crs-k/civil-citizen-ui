import {request} from 'express';
import {
  getSupportRequired,
  getSupportRequiredForm,
  NameListType,
} from '../../../../../main/services/features/directionsQuestionnaire/supportRequiredService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  SupportRequired,
  SupportRequiredList,
  Support,
} from '../../../../../main/common/models/directionsQuestionnaire/supportRequired';
import {GenericForm} from '../../../../../main/common/form/models/genericForm';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import civilClaimResponseExpertAndWitnessMock from '../../../../utils/mocks/civilClaimResponseExpertAndWitnessMock.json';
import {Claim} from '../../../../../main/common/models/claim';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('Support Required service', () => {
  describe('convert to support required form', () => {
    it('should convert request body successfully when option "yes" and declared is empty', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.YES,
        model: {
          items: [
            {
              fullName: '',
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('yes');
      expect(form.items[0].fullName).toBeFalsy();
      expect(form.items[0].disabledAccess?.selected).toBeFalsy();
    });

    it('should convert request body successfully when option "yes" and declared is not empty', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.YES,
        model: {
          items: [
            {
              fullName: 'johdoe',
              declared: 'disabledAccess',
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('yes');
      expect(form.items[0].fullName).toBe('johdoe');
      expect(form.items[0].disabledAccess?.selected).toBe(true);
    });

    it('should convert request body successfully when option "yes" and multiple declaration in one row with support text', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.YES,
        model: {
          items: [
            {
              fullName: 'johdoe',
              declared: ['disabledAccess', 'otherSupport'],
              otherSupport: {content: 'test'},
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('yes');
      expect(form.items[0].fullName).toBe('johdoe');
      expect(form.items[0].disabledAccess?.selected).toBe(true);
      expect(form.items[0].otherSupport?.selected).toBe(true);
      expect(form.items[0].otherSupport?.content).toBe('test');
    });

    it('should convert request body successfully when option "yes" and multiple declaration in two rows with support text', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.YES,
        model: {
          items: [
            {
              fullName: 'johdoe',
              declared: ['disabledAccess', 'otherSupport'],
              otherSupport: {content: 'test'},
            },
            {
              fullName: 'mikebrown',
              declared: 'signLanguageInterpreter',
              signLanguageInterpreter: {content: 'sign language support'},
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('yes');
      expect(form.items[0].fullName).toBe('johdoe');
      expect(form.items[0].disabledAccess?.selected).toBe(true);
      expect(form.items[0].otherSupport?.selected).toBe(true);
      expect(form.items[0].otherSupport?.content).toBe('test');
      expect(form.items[1].fullName).toBe('mikebrown');
      expect(form.items[1].signLanguageInterpreter?.selected).toBe(true);
      expect(form.items[1].signLanguageInterpreter?.content).toBe('sign language support');
    });

    it('should convert request body successfully when option "no" and declared is empty', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.NO,
        model: {
          items: [
            {
              fullName: '',
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('no');
      expect(form.items[0].fullName).toBeUndefined();
      expect(form.items[0].disabledAccess?.selected).toBeFalsy();
    });

    it('should removed the devlared values when option changed from "no" to "yes"', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.NO,
        model: {
          items: [
            {
              fullName: 'johndoe',
              declared: 'disabledAccess',
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('no');
      expect(form.items[0].fullName).toBeUndefined();
      expect(form.items[0].disabledAccess?.selected).toBeFalsy();
    });
  });

  describe('Validation', () => {

    it('should not raise any error if option is "no" and support required list unspecified', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.NO, undefined);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(0);
    });

    it('should raise at enter person name if option "yes" and when no name is selected', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: '',
        disabledAccess: {selected: true},
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBe('ERRORS.ENTER_PERSON_NAME');
    });

    it('should raise at least error if option "yes" and name selected but no support provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: 'johndoe',
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBe('ERRORS.SELECT_SUPPORT');
    });

    it('should raise error if option "yes" and sign language selected but no content provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: 'johndoe',
        signLanguageInterpreter: new Support(
          'signLanguageInterpreter',
          true,
        ),
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][languageInterpreter][content]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][signLanguageInterpreter][content]', 'model')).toBe('ERRORS.NO_SIGN_LANGUAGE_ENTERED');
    });

    it('should raise error if option "yes" and language selected but no content provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: 'johndoe',
        languageInterpreter: new Support(
          'languageInterpreter',
          true,
        ),
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][signLanguageInterpreter][content]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][languageInterpreter][content]', 'model')).toBe('ERRORS.NO_LANGUAGE_ENTERED');
    });

    it('should raise error if option "yes" and other support selected but no content provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: 'johndoe',
        otherSupport: new Support(
          'otherSupport',
          true,
        ),
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][signLanguageInterpreter][content]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][languageInterpreter][content]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][otherSupport][content]', 'model')).toBe('ERRORS.NO_OTHER_SUPPORT');
    });

    it('should raise error if option "yes", name and support not provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired()]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBe('ERRORS.ENTER_PERSON_NAME');
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBe('ERRORS.SELECT_SUPPORT');
    });
  });

  describe('Get Support Required List', () => {
    it('should return support required details from draft store if present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return civilClaimResponseExpertAndWitnessMock.case_data;
      });
      //When
      const [supportRequiredList, peopleLists] = await getSupportRequired('1234');
      //Then
      if (supportRequiredList.items) {
        expect(supportRequiredList.items).toBeTruthy();
        expect(supportRequiredList.items.length).toBe(2);
        expect(supportRequiredList.items[0]?.fullName).toEqual('johndoe');
        expect(supportRequiredList.items[0].disabledAccess?.selected).toBe(true);
        expect(supportRequiredList.items[0].otherSupport?.selected).toBe(true);
        expect(supportRequiredList.items[0].otherSupport?.content).toEqual('other support text');
      }
      if (peopleLists.length) {
        const firstRow = peopleLists[0] as NameListType[];
        const secondRow = peopleLists[1] as NameListType[];
        expect(peopleLists.length).toBe(2);
        expect(firstRow[0].text).toBe('Choose the name of the person');
        expect(firstRow[1].text).toBe('John Doe');
        expect(firstRow[1].value).toBe('johndoe');
        expect(firstRow[1].selected).toBe(true);
        expect(secondRow[0].text).toBe('Choose the name of the person');
        expect(secondRow[3].text).toBe('Mike Brown');
        expect(secondRow[3].value).toBe('mikebrown');
        expect(secondRow[3].selected).toBe(true);
      }
    });

    it('should return empty support required details with empty dropdown from draft store if non-present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return new Claim();
      });
      //Whensuppo
      const [supportRequiredList, peopleLists] = await getSupportRequired('1234');
      //Then
      if (supportRequiredList.items) {
        expect(supportRequiredList.items).toBeTruthy();
        expect(supportRequiredList.items.length).toBe(1);
        expect(supportRequiredList.items[0]?.fullName).toBeUndefined();
        expect(supportRequiredList.items[0].disabledAccess).toBeUndefined();
        expect(supportRequiredList.items[0].hearingLoop).toBeUndefined();
        expect(supportRequiredList.items[0].signLanguageInterpreter).toBeUndefined();
        expect(supportRequiredList.items[0].languageInterpreter).toBeUndefined();
        expect(supportRequiredList.items[0].otherSupport).toBeUndefined();
      }
      if (peopleLists.length) {
        const firstRow = peopleLists[0] as NameListType[];
        expect(peopleLists.length).toBe(1);
        expect(firstRow[0].text).toBe('Choose the name of the person');
        expect(firstRow[0].value).toBe('');
        expect(firstRow[0].selected).toBeUndefined();
      }
    });
  });
});
