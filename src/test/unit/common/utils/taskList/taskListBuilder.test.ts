import {HowMuchDoYouOwe} from '../../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from '../../../../../main/common/form/models/admission/partialAdmission/paymentIntention';
import {WhyDoYouDisagree} from '../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {PaymentOptionType} from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from '../../../../../main/common/form/models/responseType';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {Claim} from '../../../../../main/common/models/claim';
import {PartialAdmission} from '../../../../../main/common/models/partialAdmission';
import {Party} from '../../../../../main/common/models/party';
import {constructResponseUrlWithIdParams} from '../../../../../main/common/utils/urlFormatter';
import {
  buildResolvingTheClaimSection,
  buildRespondToClaimSection,
  buildYourHearingRequirementsSection,
} from '../../../../../main/common/utils/taskList/taskListBuilder';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
  CITIZEN_OWED_AMOUNT_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_REPAYMENT_PLAN_FULL_URL,
  CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_URL,
  DETERMINATION_WITHOUT_HEARING_URL,
  FINANCIAL_DETAILS_URL,
  RESPONSE_YOUR_DEFENCE_URL,
} from '../../../../../main/routes/urls';
import {RejectAllOfClaim} from '../../../../../main/common/form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from '../../../../../main/common/form/models/rejectAllOfClaimType';
import {HowMuchHaveYouPaid} from '../../../../../main/common/form/models/admission/howMuchHaveYouPaid';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';

describe('Task List Builder', () => {
  const claimId = '5129';
  const lang = 'en';
  const chooseAResponseUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  const whyDisagreeWithAmountClaimedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_URL);
  const whyDisagreeWithAmountClaimedFullDefenceUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL);
  const repaymentFAPlanUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_FULL_URL);
  const repaymentPAPlanUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_PARTIAL_URL);
  const shareFinancialDetailsUrl = constructResponseUrlWithIdParams(claimId, FINANCIAL_DETAILS_URL);
  const decideHowYouPayUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
  const howMuchHaveYouPaidUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL);
  const howMuchMoneyAdmitOweUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_OWED_AMOUNT_URL);
  const freeTelephoneMediationUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
  const giveUsDetailsHearingUrl = constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL);
  const whenWillYouPayUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL);

  const tellUsHowMuchYouHavePaidUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_FR_AMOUNT_YOU_PAID_URL);
  const tellUsWhyDisagreeWithClaimUrl = constructResponseUrlWithIdParams(claimId, RESPONSE_YOUR_DEFENCE_URL);

  describe('test buildRespondToClaimSection', () => {

    describe('test FULL_ADMISSION', () => {
      it('should have chooseAResponseTask', () => {
        const claim = new Claim();
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(1);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
      });
      it('should have chooseAResponseTask and whyDisagreeWithAmountClaimedTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(2);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(decideHowYouPayUrl);
      });
      it('should have chooseAResponseTask, whyDisagreeWithAmountClaimedTask and shareFinancialDetailsTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.paymentOption = PaymentOptionType.BY_SET_DATE;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(3);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(decideHowYouPayUrl);
        expect(respondToClaimSection.tasks[2].url).toEqual(shareFinancialDetailsUrl);
      });
      it('should have chooseAResponseTask, whyDisagreeWithAmountClaimedTask, shareFinancialDetailsTask and repaymentPlanTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.paymentOption = PaymentOptionType.INSTALMENTS;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(4);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(decideHowYouPayUrl);
        expect(respondToClaimSection.tasks[2].url).toEqual(shareFinancialDetailsUrl);
        expect(respondToClaimSection.tasks[3].url).toEqual(repaymentFAPlanUrl);
      });
    });

    describe('test PART_ADMISSION', () => {
      it('should have chooseAResponseTask and whyDisagreeWithAmountClaimedTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(2);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(whyDisagreeWithAmountClaimedUrl);
      });
      it('should have chooseAResponseTask, whyDisagreeWithAmountClaimedTask and howMuchHaveYouPaidTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.YES);
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(3);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(howMuchHaveYouPaidUrl);
        expect(respondToClaimSection.tasks[2].url).toEqual(whyDisagreeWithAmountClaimedUrl);
      });
      it('should have chooseAResponseTask, whyDisagreeWithAmountClaimedTask, whenWillYouPayTask and howMuchMoneyAdmitOweTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.NO);
        claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
        claim.partialAdmission.howMuchDoYouOwe.amount = 1;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(4);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(howMuchMoneyAdmitOweUrl);
        expect(respondToClaimSection.tasks[2].url).toEqual(whyDisagreeWithAmountClaimedUrl);
        expect(respondToClaimSection.tasks[3].url).toEqual(whenWillYouPayUrl);
      });
      it('should have chooseAResponseTask, shareFinancialDetailsTask and whyDisagreeWithAmountClaimedTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.paymentIntention = new PaymentIntention();
        claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
        claim.partialAdmission.paymentIntention.paymentDate = new Date();
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(3);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(shareFinancialDetailsUrl);
        expect(respondToClaimSection.tasks[2].url).toEqual(whyDisagreeWithAmountClaimedUrl);
      });
      it('should have chooseAResponseTask, shareFinancialDetailsTask, repaymentPlanTask and whyDisagreeWithAmountClaimedTask', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.paymentIntention = new PaymentIntention();
        claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
        claim.partialAdmission.paymentIntention.paymentDate = new Date();
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(4);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(shareFinancialDetailsUrl);
        expect(respondToClaimSection.tasks[2].url).toEqual(whyDisagreeWithAmountClaimedUrl);
        expect(respondToClaimSection.tasks[3].url).toEqual(repaymentPAPlanUrl);
      });
    });

    describe('test FULL_DEFENCE', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;

      it('should have tellUsHowMuchYouHavePaidTask', () => {
        claim.rejectAllOfClaim = new RejectAllOfClaim();
        claim.rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(2);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(tellUsHowMuchYouHavePaidUrl);
      });

      it('should have tellUsHowMuchYouHavePaidTask and whyDisagreeWithAmountClaimedTask', () => {
        claim.rejectAllOfClaim = new RejectAllOfClaim();
        claim.rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;
        claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
        claim.totalClaimAmount = 1000;
        claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = 500;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(3);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(tellUsHowMuchYouHavePaidUrl);
        expect(respondToClaimSection.tasks[2].url).toEqual(whyDisagreeWithAmountClaimedFullDefenceUrl);
      });

      it('should have tellUsWhyDisagreeWithClaimTask', () => {
        claim.rejectAllOfClaim = new RejectAllOfClaim();
        claim.rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;
        const respondToClaimSection = buildRespondToClaimSection(claim, claimId, lang);
        expect(respondToClaimSection.tasks.length).toBe(2);
        expect(respondToClaimSection.tasks[0].url).toEqual(chooseAResponseUrl);
        expect(respondToClaimSection.tasks[1].url).toEqual(tellUsWhyDisagreeWithClaimUrl);
      });
    });
  });

  describe('test buildResolvingTheClaimSection', () => {
    it('should be empty', () => {
      const claim = new Claim();
      const respondToClaimSection = buildResolvingTheClaimSection(claim, claimId, lang);
      expect(respondToClaimSection.tasks.length).toBe(0);
    });

    it('should have freeTelephoneMediationTask if full defence', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      const resolvingTheClaimSection = buildResolvingTheClaimSection(claim, claimId, lang);
      expect(resolvingTheClaimSection.tasks.length).toBe(1);
      expect(resolvingTheClaimSection.tasks[0].url).toEqual(freeTelephoneMediationUrl);
    });

    it('should have freeTelephoneMediationTask', () => {
      const claim = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree();
      claim.partialAdmission.whyDoYouDisagree.text = 'test';
      const resolvingTheClaimSection = buildResolvingTheClaimSection(claim, claimId, lang);
      expect(resolvingTheClaimSection.tasks.length).toBe(1);
      expect(resolvingTheClaimSection.tasks[0].url).toEqual(freeTelephoneMediationUrl);
    });
  });

  describe('test buildYourHearingRequirementsSection', () => {
    it('should be empty', () => {
      const claim = new Claim();
      const respondToClaimSection = buildYourHearingRequirementsSection(claim, claimId, lang);
      expect(respondToClaimSection.tasks.length).toBe(0);
    });
    it('should have freeTelephoneMediationTask', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      const yourHearingRequirementsSection = buildYourHearingRequirementsSection(claim, claimId, lang);
      expect(yourHearingRequirementsSection.tasks.length).toBe(1);
      expect(yourHearingRequirementsSection.tasks[0].url).toEqual(giveUsDetailsHearingUrl);
    });
  });

});
