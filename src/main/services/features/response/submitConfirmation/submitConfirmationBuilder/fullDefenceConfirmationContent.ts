import { t } from 'i18next';
import { Claim } from '../../../../../common/models/claim';
import { ClaimSummarySection, ClaimSummaryType } from '../../../../../common/form/models/claimSummarySection';

export const getRCDisputeStatus = (claim: Claim, lng: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_HAVE_MAILED', { claimantName, lng }),
      },
    },
  ];
};

export const getRCDisputeWithMediationNextSteps = (claimId: string, claim: Claim, lng: string): ClaimSummarySection[] => {

  const claimantName = claim.getClaimantName();

  return [
    { ...getParagraphWeWillContact(claimantName, lng) },
    { ...getParagraphIfClaimantAccepts(claimantName, lng) },
    { ...getParagraphIfClaimantRejects(claimantName, lng) },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_THEY_REJECT', { lng }),
      },
    },
  ];
};

export const getRCDisputeNoMediationNextSteps = (claimId: string, claim: Claim, lng: string): ClaimSummarySection[] => {

  const claimantName = claim.getClaimantName();

  return [
    { ...getParagraphWeWillContact(claimantName, lng) },
    { ...getParagraphIfClaimantAccepts(claimantName, lng) },
    { ...getParagraphIfClaimantRejects(claimantName, lng) },
  ];
};

const getParagraphWeWillContact = (claimantName: string, lng: string) => {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_WILL_CONTACT', { claimantName, lng }),
    },
  };
};

const getParagraphIfClaimantAccepts = (claimantName: string, lng: string) => {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_ACCEPTS', {  claimantName, lng }),
    },
  };
};

const getParagraphIfClaimantRejects = (claimantName: string, lng: string) => {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_REJECTS', {  claimantName, lng }),
    },
  };
};
