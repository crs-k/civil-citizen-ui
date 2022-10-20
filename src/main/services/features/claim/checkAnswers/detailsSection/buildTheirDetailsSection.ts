import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  DOB_URL
} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {PrimaryAddress} from '../../../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../../../common/models/correspondenceAddress';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

const addressToString = (address: PrimaryAddress | CorrespondenceAddress) => {
  return address?.AddressLine1 + '<br>' + address?.PostTown + '<br>' + address?.PostCode;
};

const getDefendantFullName = (claim: Claim): string => {
  if (claim.respondent1?.individualFirstName && claim.respondent1?.individualLastName) {
    return claim.respondent1.individualTitle + ' ' + claim.respondent1.individualFirstName + ' ' + claim.respondent1.individualLastName;
  }
  return claim.respondent1?.partyName;
};

export const buildTheirDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const theirDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL);
  const phoneNumberHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng: getLng(lang)}), getDefendantFullName(claim), theirDetailsHref, changeLabel(lang)),
    ],
  });
  if (claim.respondent1?.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng: getLng(lang)}), claim.respondent1.contactPerson, theirDetailsHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.ADDRESS', {lng: getLng(lang)}), addressToString(claim.respondent1?.primaryAddress), theirDetailsHref, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng: getLng(lang)}), claim.respondent1?.correspondenceAddress ? addressToString(claim.respondent1?.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng: getLng(lang)}), theirDetailsHref, changeLabel(lang))]);
  if (claim.respondent1?.dateOfBirth) {
    const yourDOBHref = DOB_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng: getLng(lang)}), formatDateToFullDate(claim.respondent1.dateOfBirth, getLng(lang)), yourDOBHref, changeLabel(lang)));
  }
  if (claim.respondent1?.emailAddress) {
    const yourEmailHref = CLAIM_DEFENDANT_EMAIL_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMAIL', {lng: getLng(lang)}), claim.respondent1?.emailAddress, yourEmailHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng: getLng(lang)}), claim.applicant1?.phoneNumber, phoneNumberHref, changeLabel(lang)));
  return yourDetailsSection;
};

