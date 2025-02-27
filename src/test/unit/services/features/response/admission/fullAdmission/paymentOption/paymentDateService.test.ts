import {paymentDateService} from 'services/features/response/admission/fullAdmission/paymentOption/paymentDateService';
import * as draftStoreService from '../../../../../../../../main/modules/draft-store/draftStoreService';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {GenericForm} from 'form/models/genericForm';
import {mockClaim} from '../../../../../../../../../src/test/utils/mockClaim';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

let paymentDate = new PaymentDate(undefined, undefined, undefined);
let form = new GenericForm<PaymentDate>(new PaymentDate());

const DRAFT_STORE_GET_ERROR = 'draft store get error';
const DRAFT_STORE_SAVE_ERROR = 'draft store save error';

describe('Payment Date service', () => {
  describe('Serialisation', () => {
    it('should keep the form input values unchanged after validation', async () => {
      //Given
      const paymentDate = new PaymentDate('2040', '1', '1');
      //Then
      expect(paymentDate.day).toBe(1);
      expect(paymentDate.month).toBe(1);
      expect(paymentDate.year).toBe(2040);
    });
    it('should keep the form input values unchanged after validation', async () => {
      //Given
      const paymentDate = new PaymentDate('--', '-', '&');
      //Then
      expect(isNaN(paymentDate.day)).toBeTruthy();
      expect(isNaN(paymentDate.month)).toBeTruthy();
      expect(isNaN(paymentDate.year)).toBeTruthy();
    });
  });

  describe('get and save PaymentDate', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should return empty PaymentDate when nothing retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return undefined;
      });
      //When
      const paymentDate = await (paymentDateService.getPaymentDate('claimId', ResponseType.FULL_ADMISSION));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(paymentDate).toBeUndefined();
    });
    it('should return undefined when case_data, but no paymentDate, retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {}};
      });
      //When
      const paymentDate = await (paymentDateService.getPaymentDate('claimId', ResponseType.FULL_ADMISSION));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(paymentDate).toBeUndefined();
    });
    it('should return PaymentDate when date retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      //When
      const paymentDate = await (paymentDateService.getPaymentDate('claimId', ResponseType.FULL_ADMISSION));
      let mockPaymentDate;
      if (mockClaim?.paymentDate) {
        const year = mockClaim.paymentDate.getFullYear();
        const month = mockClaim.paymentDate.getMonth() + 1;
        const day = mockClaim.paymentDate.getDate();
        mockPaymentDate = new PaymentDate(year.toString(), month.toString(), day.toString());
      }

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(paymentDate).not.toBeNull();
      expect(paymentDate).toEqual(mockPaymentDate);
    });

    it('should save paymentDate when nothing in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await paymentDateService.savePaymentDate('claimId', new Date(), ResponseType.FULL_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    it('should return empty PaymentDate when nothing retrieved partAdmission', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return undefined;
      });
      //When
      const paymentDate = await (paymentDateService.getPaymentDate('claimId', ResponseType.PART_ADMISSION));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(paymentDate).toBeUndefined();
    });
    it('should return undefined when case_data, but no paymentDate, retrieved partAdmission', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {}};
      });
      //When
      const paymentDate = await (paymentDateService.getPaymentDate('claimId', ResponseType.PART_ADMISSION));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(paymentDate).toBeUndefined();
    });
    it('should return PaymentDate when date retrieved partAdmission', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      //When
      const paymentDate = await (paymentDateService.getPaymentDate('claimId', ResponseType.PART_ADMISSION));
      let mockPaymentDate;
      if (mockClaim?.paymentDate) {
        const year = mockClaim.paymentDate.getFullYear();
        const month = mockClaim.paymentDate.getMonth() + 1;
        const day = mockClaim.paymentDate.getDate();
        mockPaymentDate = new PaymentDate(year.toString(), month.toString(), day.toString());
      }

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(paymentDate).not.toBeNull();
      expect(paymentDate).toEqual(mockPaymentDate);
    });

    it('should save paymentDate when case_data, but no paymentDate, in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {}};
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await paymentDateService.savePaymentDate('claimId', new Date(), ResponseType.FULL_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    it('should add payment intention to the partial admission object if partial admission is already defined', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {partialAdmission: {foo: 'blah'}};
      });
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const dateNow = new Date();
      await paymentDateService.savePaymentDate('claimId', dateNow, ResponseType.PART_ADMISSION);
      const expectedParam = {partialAdmission: {foo: 'blah', paymentIntention: {paymentDate: dateNow}}};
      expect(spySaveDraftClaim).toHaveBeenCalledWith('claimId', expectedParam);
    });

    it('should initialise partial admission object if partial admission is not defined', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {};
      });
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const dateNow = new Date();
      await paymentDateService.savePaymentDate('claimId', dateNow, ResponseType.PART_ADMISSION);
      const expectedParam = {partialAdmission: {paymentIntention: {paymentDate: dateNow}}};
      expect(spySaveDraftClaim).toHaveBeenCalledWith('claimId', expectedParam);
    });

    it('should save paymentDate when case_data, but no paymentDate, in Redis draft store partAdmission', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {}};
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await paymentDateService.savePaymentDate('claimId', new Date(), ResponseType.PART_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    it('should save paymentDate when claim in Redis draft store fullAdmission', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await paymentDateService.savePaymentDate('claimId', new Date(), ResponseType.FULL_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith('claimId', mockClaim);
    });

    it('should save paymentDate when claim in Redis draft store partAdmission', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await paymentDateService.savePaymentDate('claimId', new Date(), ResponseType.PART_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith('claimId', mockClaim);
    });
  });

  describe('Validation', () => {
    it('should raise an error if nothing specified for date', async () => {
      //Given
      paymentDate = new PaymentDate(undefined, undefined, undefined);
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(3);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY', max: 'ERRORS.VALID_DAY'});
      expect(form.getErrors()[1].property).toBe('month');
      expect(form.getErrors()[1].constraints).toEqual({min: 'ERRORS.VALID_MONTH', max: 'ERRORS.VALID_MONTH'});
      expect(form.getErrors()[2].property).toBe('year');
      expect(form.getErrors()[2].constraints).toEqual({max: 'ERRORS.VALID_YEAR'});

    });
    it('should raise an error if no year', async () => {
      //Given
      paymentDate = new PaymentDate(undefined, '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_YEAR'});
    });
    it('should raise an error if no month', async () => {
      //Given
      paymentDate = new PaymentDate('9999', undefined, '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_MONTH', max: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if no day', async () => {
      //Given
      paymentDate = new PaymentDate('9999', '12', undefined);
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY', max: 'ERRORS.VALID_DAY'});
    });
    it('should raise an error asking for 4 digits, if year is only 1 digit', async () => {
      //Given
      paymentDate = new PaymentDate('2', '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR'});
    });
    it('should raise an error asking for 4 digits, if year is only 2 digits', async () => {
      //Given
      paymentDate = new PaymentDate('23', '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({
        OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR',
      });
    });
    it('should raise an error asking for 4 digits, if year is only 3 digits', async () => {
      //Given
      paymentDate = new PaymentDate('202', '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({
        OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR',
      });
    });
    it('should raise an error if date in the past', async () => {
      //Given
      paymentDate = new PaymentDate('1990', '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({
        customDate: 'ERRORS.VALID_DATE_NOT_IN_PAST',
      });
    });
    it('should raise an error if month greater than 12', async () => {
      //Given
      paymentDate = new PaymentDate('2040', '13', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if month less than 1', async () => {
      //Given
      paymentDate = new PaymentDate('2040', '0', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if day greater than 31', async () => {
      //Given
      paymentDate = new PaymentDate('2040', '12', '32');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_DAY'});
    });
    it('should raise an error if day less than 1', async () => {
      //Given
      paymentDate = new PaymentDate('2040', '12', '-1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY'});
    });
    it('should not raise an error if date in future', async () => {
      //Given
      paymentDate = new PaymentDate('9999', '12', '31');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    it('should raise an error if yesterday specified for date', async () => {
      //Given
      const yesterday: Date = new Date(Date.now() - 1000 * 60 * 60 * 24);
      paymentDate = new PaymentDate(yesterday.getFullYear().toString(), (yesterday.getMonth() + 1).toString(), yesterday.getDate().toString());
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({customDate: 'ERRORS.VALID_DATE_NOT_IN_PAST'});
    });
    it('should not raise an error if today specified for date', async () => {
      //Given
      const today: Date = new Date(Date.now());
      paymentDate = new PaymentDate(today.getFullYear().toString(), (today.getMonth() + 1).toString(), today.getDate().toString());
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
  });
  describe('Exception Handling', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when retrieving data from draft store fails', async () => {
      //When
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_GET_ERROR);
      });
      //Then
      await expect(
        paymentDateService.getPaymentDate('claimId', ResponseType.FULL_ADMISSION)).rejects.toThrow(DRAFT_STORE_GET_ERROR);
    });

    it('should throw error when saving data to draft store fails', async () => {
      //When
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {paymentDate: {}}};
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_SAVE_ERROR);
      });
      //Then
      await expect(
        paymentDateService.savePaymentDate('claimId', new Date(), ResponseType.FULL_ADMISSION)).rejects.toThrow(DRAFT_STORE_SAVE_ERROR);
    });
  });
});
