import { t } from 'i18next';
import { Claim } from '../../../../../common/models/claim';
import { ClaimSummarySection, ClaimSummaryType } from '../../../../../common/form/models/claimSummarySection';
import { CITIZEN_CONTACT_THEM_URL } from '../../../../../routes/urls';
import { formatDateToFullDate } from '../../../../../common/utils/dateUtils';

const getSubtitleIfClaimantRejectOwe = (claimantName: string, partialAmount: number, lang: string) => {
  return {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OWE', { claimantName, partialAmount, lng: lang }),
    },
  };
};

const getParagraphAskMediation = (lang: string) => {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.WE_WILL_ASK_MEDIATION', { lng: lang }),
    },
  };
};

const getParagraphDontWantMediation = (claimAmount: number, partialAmount: number, lang: string) => {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.IF_DONT_WANT_MEDIATION', { claimAmount, partialAmount, lng: lang }),
    },
  };
};

const getSubtitleRejectOffer = (claimantName: string, paymentDate: string, lang: string) => {
  return {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.REJECT_OFFER_TO_PAY_BY', { claimantName, paymentDate, lng: lang }),
    },
  };
};

const getParagraphCourtDecideHowToPay = (lang: string) => {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY', { lng: lang }),
    },
  };
};

const getSubtitleIfClaimantAccepstOffer = (claimantName: string, lang: string) => {
  return {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER', { claimantName, lng: lang }),
    },
  };
};

export const getPAPayImmediatelyStatus = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_HAVE_SAID_YOU_OWW', { claimantName, partialAmount, lng: lang }),
      },
    },
  ];
};

export const getPAPayByDateStatus = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
  // TODO : submission day + 5 days
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const paymentDate = formatDateToFullDate(today, lang);

  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.YOU_BELIEVE_YOU_OWE', { claimantName, partialAmount, paymentDate, lng: lang }),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.SENT_EXPLANATION', { lng: lang }),
      },
    },
  ];
};

export const getPAPayInstallmentsStatus = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;

  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.YOU_BELIEVE_YOU_OWE', { claimantName, partialAmount, lng: lang }),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.WE_SENT_EXPLANATION', { lng: lang }),
      },
    },
  ];
};

export const getPAPayInstallmentsNextSteps = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
  // TODO : submission day + 5 days
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const paymentDate = formatDateToFullDate(today, lang);
  const claimAmount = claim.totalClaimAmount;

  return [
    { ...getSubtitleIfClaimantAccepstOffer(claimantName, lang) },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD', { lng: lang })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN', { lng: lang })}</li>
          <li>
            <p class="govuk-body govuk-!-margin-bottom-1">
            <a href="${CITIZEN_CONTACT_THEM_URL.replace(':id', claimId)}">${t('PAGES.SUBMIT_CONFIRMATION.CONTACT_CLAIMANT', { claimantName, lng: lang })}</a>
            ${t('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS', { lng: lang })}</p>
          </li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.RECEIPT_FOR_PAYMENTS', { lng: lang })}</li>
        </ul>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.BECAUSE_YOU_WONT_PAY_IMMEDIATELY', { claimantName, lng: lang })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.ASK_SIGN_SETTLEMENT', { lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU', { partialAmount, lng: lang })}</li>
        </ul>`,
      },
    },
    { ...getSubtitleIfClaimantRejectOwe(claimantName, partialAmount, lang) },
    { ...getParagraphAskMediation(lang) },
    { ...getParagraphDontWantMediation(claimAmount, partialAmount, lang) },
    { ...getSubtitleRejectOffer(claimantName, paymentDate, lang) },
    { ...getParagraphCourtDecideHowToPay(lang) },
  ];
};

export const getPAPayByDateNextSteps = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
  // TODO : submission day + 5 days
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const paymentDate = formatDateToFullDate(today, lang);
  const claimAmount = claim.totalClaimAmount;

  return [
    { ...getSubtitleIfClaimantAccepstOffer(claimantName, lang) },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.YOU_SHOULD', { lng: lang })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.PAY_BY', { claimantName, paymentDate, lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CHEQUES_OR_BANK_TRANSFERS', { lng: lang })}</li>
          <li>
            <p class="govuk-body govuk-!-margin-bottom-1">
            <a href="${CITIZEN_CONTACT_THEM_URL.replace(':id', claimId)}">${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.CONTACT_THEM', { lng: lang })}</a>
            ${t('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS', { lng: lang })}</p>
          </li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.MAKE_SURE_GET_RECEIPT', { lng: lang })}</li>
        </ul>
        <p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.BECAUSE_YOU_WONT_PAY_IMMEDIATELY', { claimantName, lng: lang })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.ASK_SIGN_SETTLEMENT', { lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.REQUEST_COURT_AGAINST_YOU', { partialAmount, lng: lang })}</li>
        </ul>`,
      },
    },
    { ...getSubtitleIfClaimantRejectOwe(claimantName, partialAmount, lang) },
    { ...getParagraphAskMediation(lang) },
    { ...getParagraphDontWantMediation(claimAmount, partialAmount, lang) },
    { ...getSubtitleRejectOffer(claimantName, paymentDate, lang) },
    { ...getParagraphCourtDecideHowToPay(lang) },
  ];
};

export const getPAPayImmediatelyNextSteps = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {

  const claimantName = claim.getClaimantName();
  const claimAmount = claim.totalClaimAmount;
  // TODO : submission day + 5 days
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const paymentDate = formatDateToFullDate(today, lang);
  const partialAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;

  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_NEED_PAY_IMMEDIATELY', { claimantName, partialAmount, lng: lang }),
      },
    },
    {
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body">${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.MAKE_SURE_THAT', { lng: lang })}</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.THEY_GET_MONEY_BY', { paymentDate, lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CHEQUES_OR_BANK_TRANSFERS', { lng: lang })}</li>
          <li>${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.RECEIPT_FOR_PAYMENTS', { lng: lang })}</li>
        </ul>`,
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.CONTACT_CLAIMANT', { claimantName, lng: lang })}`,
        textAfter: t('PAGES.SUBMIT_CONFIRMATION.IF_NEED_PAYMENT_DETAILS', { lng: lang }),
        href: CITIZEN_CONTACT_THEM_URL.replace(':id', claimId),
      },
    },
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.IF_CLAIMANT_ACCEPTS_OFFER_OF', { claimantName, partialAmount, lng: lang })}`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.CLAIM_SETTLED', { lng: lang }),
      },
    },
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: `${t('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER', { claimantName, lng: lang })}`,
      },
    },
    { ...getParagraphAskMediation(lang) },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.IF_DONT_WANT_MEDIATION', { lng: lang, claimAmount }),
      },
    },
  ];
};
