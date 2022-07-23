import {SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import PaymentOptionType from '../../../../common/form/models/admission/paymentOption/paymentOptionType';
import {StatementOfTruthForm} from '../../../../common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {SignatureType} from '../../../../common/models/signatureType';
import {isCounterpartyIndividual} from '../../../../common/utils/taskList/tasks/taskListHelpers';
import {QualifiedStatementOfTruth} from '../../../../common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {isFullAmountReject} from '../../../../modules/claimDetailsService';
import {ResponseType} from '../../../../common/form/models/responseType';


import {buildYourDetailsSection} from './detailsSection/buildYourDetailsSection';
import {buildYourResponseToClaimSection} from './responseSection/buildYourResponseToClaimSection';
import {buildYourResponsePaymentSection} from './responseSection/buildYourResponsePaymentSection';
import {buildYourFinancialSection} from './financialSection/buildYourFinancialSection';
import {buildYourResponseDetailsSection} from './responseSection/buildYourResponseDetailsSection';
import {buildFreeTelephoneMediationSection} from './responseSection/buildFreeTelephoneMediationSection';
import {YesNo} from '../../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {
  const responseType: string = claim.respondent1?.responseType;
  const paymentOption: string = claim.paymentOption;
  const alreadyPaidPartAdmit: string = claim.partialAdmission?.alreadyPaid?.option;
  const paidResponse: string = claim.partialAdmission?.paymentIntention?.paymentOption;

  const getResponseToClaim = (responseType:string) => {
    return responseType === ResponseType.FULL_DEFENCE
      || responseType === ResponseType.FULL_ADMISSION && paymentOption !== PaymentOptionType.IMMEDIATELY
      ? buildYourResponseToClaimSection(claim, claimId, lang)
      : null;
  }

  const getResponseToClaimPA = (responseType:string) => {
    return responseType === ResponseType.PART_ADMISSION
      ? buildYourResponseToClaimSection(claim, claimId, lang)
      : null;
  }

  const getResponseDetailsSection = () => {
    return responseType === ResponseType.FULL_DEFENCE || responseType === ResponseType.PART_ADMISSION
      ? buildYourResponseDetailsSection(claim, claimId, lang)
      : null;
  }

  const getFinancialSectionFA = (responseType:string) => {
    return responseType === ResponseType.FULL_ADMISSION && paymentOption !== PaymentOptionType.IMMEDIATELY
      ? buildYourFinancialSection(claim, claimId, lang)
      : null;
  }

  const getFinancialSection = (responseType:string) => {
    return responseType === ResponseType.PART_ADMISSION && alreadyPaidPartAdmit === YesNo.NO && paidResponse !== PaymentOptionType.IMMEDIATELY
      ? buildYourFinancialSection(claim, claimId, lang)
      : null;
  }

  const getResponsePaymentSection = () => {
    return responseType === ResponseType.FULL_ADMISSION
      || responseType === ResponseType.PART_ADMISSION && alreadyPaidPartAdmit === YesNo.NO
      ? buildYourResponsePaymentSection(claim, claimId, lang)
      : null
  }

  const getFreeTelephoneMediationSection = () => {
    return responseType === ResponseType.FULL_DEFENCE
      || responseType === ResponseType.PART_ADMISSION && paidResponse
      ? buildFreeTelephoneMediationSection(claim, claimId, lang)
      : null
  }

  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      getResponseToClaim(responseType),
      getFinancialSectionFA(responseType),
      getResponseToClaimPA(responseType),
      getResponseDetailsSection(),
      getFinancialSection(responseType),
      getResponsePaymentSection(),
      getFreeTelephoneMediationSection(),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};


export const resetCheckboxFields = (statementOfTruth: StatementOfTruthForm | QualifiedStatementOfTruth): StatementOfTruthForm | QualifiedStatementOfTruth => {
  statementOfTruth.directionsQuestionnaireSigned = '';
  statementOfTruth.signed = '';
  return statementOfTruth;
};

export const getStatementOfTruth = (claim: Claim): StatementOfTruthForm | QualifiedStatementOfTruth => {
  if (claim.defendantStatementOfTruth) {
    return resetCheckboxFields(claim.defendantStatementOfTruth);
  }

  switch (getSignatureType(claim)) {
    case SignatureType.BASIC:
      return new StatementOfTruthForm(isFullAmountReject(claim));
    case SignatureType.QUALIFIED:
      return new QualifiedStatementOfTruth(isFullAmountReject(claim));
    default:
      return new StatementOfTruthForm(isFullAmountReject(claim));
  }
};

export const getSignatureType = (claim: Claim): SignatureType => {
  return isCounterpartyIndividual(claim.respondent1) ? SignatureType.BASIC : SignatureType.QUALIFIED;
};

export const saveStatementOfTruth = async (claimId: string, defendantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.defendantStatementOfTruth = defendantStatementOfTruth;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
