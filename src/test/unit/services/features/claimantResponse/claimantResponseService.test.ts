import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {
  getClaimantResponse,
  saveClaimantResponse,
} from '../../../../../main/services/features/claimantResponse/claimantResponseService';
import {DebtRespiteScheme} from '../../../../../main/common/models/claimantResponse/debtRespiteScheme';
import {ClaimantResponse} from '../../../../../main/common/models/claimantResponse';
import {CCJRequest} from '../../../../../main/common/models/claimantResponse/ccj/ccjRequest';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Claimant Response Service', () => {
  describe('getClaimantResponse', () => {
    it('should return undefined if direction claimant response is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const claimantResponse = await getClaimantResponse('validClaimId');
      expect(claimantResponse?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Response object', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Response object with hasDefendantPaidYou no', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasDefendantPaidYou = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou.option).toBe(YesNo.NO);
    });

    it('should return Claimant Response object with hasDefendantPaidYou yes', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasDefendantPaidYou = {
        option: YesNo.YES,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou.option).toBe(YesNo.YES);
    });

    it('should return Claimant Response object with DebtRespiteReferenceNumber', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.debtRespiteScheme = new DebtRespiteScheme('1234');

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.debtRespiteScheme.referenceNumber).toBe('1234');
    });

    it('should return Claimant Response object with DebtRespiteReferenceNumber empty', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.debtRespiteScheme = new DebtRespiteScheme();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.debtRespiteScheme.referenceNumber).toBeUndefined();
    });

    describe('intentionToProceed', () => {
      it('should return undefined if intention to proceed is not set', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return new Claim();
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed).toBeUndefined();
      });

      it('should return Claimant Response object', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        expect(claimantResponse).toBeDefined();
        //Then
        expect(claimantResponse?.intentionToProceed).toBeUndefined();
      });

      it('should return Claimant Response object with intentionToProceed no', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.intentionToProceed = {
          option: YesNo.NO,
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed.option).toBe(YesNo.NO);
      });

      it('should return Claimant Response object with intentionToProceed yes', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.intentionToProceed = {
          option: YesNo.YES,
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed.option).toBe(YesNo.YES);
      });
    });

    describe('CCJ-Defendant date of birth', () => {
      it('should return undefined if defendant dob is not set', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return new Claim();
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest?.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse).toBeDefined();
        expect(claimantResponse.ccjRequest?.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object with ccj request', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse).toBeDefined();
        expect(claimantResponse.ccjRequest).toBeDefined();
        expect(claimantResponse.ccjRequest.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object with "no" option', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.defendantDOB = { option: YesNo.NO };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.defendantDOB.option).toBe(YesNo.NO);
        expect(claimantResponse?.ccjRequest.defendantDOB.dob).toBeUndefined();
      });

      it('should return Claimant Response object with dob details with option yes', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.defendantDOB = {
          option: YesNo.NO,
          dob: { dateOfBirth: new Date('2000-11-11T00:00:00.000Z') },
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.defendantDOB.option).toBe(YesNo.NO);
        expect(claimantResponse?.ccjRequest.defendantDOB.dob.dateOfBirth.toDateString()).toBe('Sat Nov 11 2000');
      });
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getClaimantResponse('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimantResponse', () => {
    const claimantResponse = new ClaimantResponse();
    claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);

    it('should save claimant response successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claimantResponseToSave = {
        hasDefendantPaidYou: {option: YesNo.NO},
      };
      await saveClaimantResponse('validClaimId',  YesNo.NO, 'option', 'hasDefendantPaidYou');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToSave});
    });

    it('should update claim determination successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = claimantResponse;
        return claim;
      });
      const claimantResponseToUpdate = {
        hasDefendantPaidYou: {option: YesNo.NO},
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveClaimantResponse('validClaimId', claimantResponse?.hasDefendantPaidYou.option, 'hasDefendantPaidYou');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToUpdate});
    });

    describe('intentionToProceed', () => {
      claimantResponse.intentionToProceed = new GenericYesNo(YesNo.YES);
      it('should save claimant response successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = new ClaimantResponse();
          return claim;
        });
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        const claimantResponseToSave = {
          intentionToProceed: {option: YesNo.NO},
        };
        //When
        await saveClaimantResponse('validClaimId', YesNo.NO, 'option', 'intentionToProceed');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToSave});
      });

      it('should update claim intentionToProceed successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = claimantResponse;
          return claim;
        });
        const claimantResponseToUpdate = {
          intentionToProceed: {option: YesNo.NO},
        };
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveClaimantResponse('validClaimId', claimantResponse?.intentionToProceed.option, 'intentionToProceed');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToUpdate});
      });
    });

    describe('CCJ-Defendant date of birth', () => {

      it('should save claimant response successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = new ClaimantResponse();
          return claim;
        });
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        const claimantResponseToSave = {
          ccjRequest: { defendantDOB: 'no' },
        };
        //When
        await saveClaimantResponse('validClaimId', YesNo.NO, 'defendantDOB', 'ccjRequest');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToSave});
      });

      it('should update claim defendant dob successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = { ccjRequest: new CCJRequest()};
          claim.claimantResponse.ccjRequest.defendantDOB = { option : YesNo.YES };
          return claim;
        });
        const claimantResponseToUpdate = {
          ccjRequest: { defendantDOB: 'no' },
        };
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveClaimantResponse('validClaimId', YesNo.NO, 'defendantDOB', 'ccjRequest');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToUpdate});
      });
    });

    describe('debtRespiteScheme', () => {
      claimantResponse.debtRespiteScheme = new DebtRespiteScheme('0000');
      it('should save debt respite scheme successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = new ClaimantResponse();
          return claim;
        });
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        const debtRespiteSchemeValue = new DebtRespiteScheme('1234');
        const claimantResponseToSave = {
          debtRespiteScheme: {referenceNumber: '1234'},
        };
        //When
        await saveClaimantResponse('validClaimId', debtRespiteSchemeValue, 'debtRespiteScheme');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToSave});
      });

      it('should update debt respite scheme successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = claimantResponse;
          return claim;
        });
        const claimantResponseToUpdate = {
          debtRespiteScheme: {referenceNumber: '1234'},
        };
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveClaimantResponse('validClaimId', claimantResponse?.debtRespiteScheme, 'debtRespiteScheme');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToUpdate});
      });
    });

    it('should return an error on redis failure', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveClaimantResponse('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
