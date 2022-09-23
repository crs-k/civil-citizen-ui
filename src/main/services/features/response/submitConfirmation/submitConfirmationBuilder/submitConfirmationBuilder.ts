import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection} from '../../../../../common/form/models/claimSummarySection';

import {
  getContactYouStatement,
  getFAPayByDateNextSteps,
  getFAPayByDateStatus,
  getFAPayByInstallmentsNextSteps,
  getFAPayByInstallmentsStatus,
  getFAPayImmediatelyNextSteps,
  getFAPAyImmediatelyStatus,
  getfinancialDetails,
} from './admissionSubmitConfirmationContent';

import {
  getRC_PaidLessStatus,
  getRC_PaidFullStatus,
  getRC_PaidLessNextSteps,
  getRC_PaidFullNextSteps,
} from './rejectClaimConfirmationContent';

import {ClaimResponseStatus} from '../../../../../common/models/claimResponseStatus';
import {getRCDisputeNextSteps, getRCDisputeStatus} from './fullDefenceConfirmationContent';

export function buildSubmitStatus(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  const FAPAyImmediatelyStatus = getFAPAyImmediatelyStatus(claim, lang);
  const FAPayByDateStatus = getFAPayByDateStatus(claim, lang);
  const FAPayByInstallmentsStatus = getFAPayByInstallmentsStatus(claim, lang);
  const RCDisputeStatus = getRCDisputeStatus(claim,lang);
  const contactYouStatement = getContactYouStatement(lang);
  const financialDetails = getfinancialDetails(claimId, claim, lang);
  const RC_PaidLessStatus = getRC_PaidLessStatus(claim, lang);
  const RC_PaidFullStatus = getRC_PaidFullStatus(claim, lang);

  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      return FAPAyImmediatelyStatus;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return [...FAPayByDateStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return [...FAPayByInstallmentsStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.RC_DISPUTE:
      return RCDisputeStatus;
    case ClaimResponseStatus.RC_PAID_LESS:
      return RC_PaidLessStatus;
    case ClaimResponseStatus.RC_PAID_FULL:
      return RC_PaidFullStatus;
  }
}

export function buildNextStepsSection(claimId: string, claim: Claim, lang:string): ClaimSummarySection[] {
  const FAPayImmediatelyNextSteps = getFAPayImmediatelyNextSteps(claimId, claim, lang);
  const FAPayByDateNextSteps = getFAPayByDateNextSteps(claimId, claim, lang);
  const FAPayByInstallmentsNextSteps = getFAPayByInstallmentsNextSteps(claimId, claim, lang);
  const RC_PaidLessNextSteps = getRC_PaidLessNextSteps(claim, lang);
  const RC_PaidFullNextSteps = getRC_PaidFullNextSteps(claim,lang);
  const RCDisputeNextSteps = getRCDisputeNextSteps(claimId, claim, lang);

  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      return FAPayImmediatelyNextSteps;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return FAPayByDateNextSteps;
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return FAPayByInstallmentsNextSteps;
    case ClaimResponseStatus.RC_DISPUTE:
      return RCDisputeNextSteps;
    case ClaimResponseStatus.RC_PAID_LESS:
      return RC_PaidLessNextSteps;
    case ClaimResponseStatus.RC_PAID_FULL:
      return RC_PaidFullNextSteps;
  }
}
