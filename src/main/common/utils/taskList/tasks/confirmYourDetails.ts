import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_DETAILS_URL} from '../../../../routes/urls';
import {hasCorrespondenceAndPrimaryAddress, hasDateOfBirthIfIndividual} from './taskListHelpers';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getConfirmYourDetailsTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const confirmYourDetailsTask = {
    description: t('COMMON.CONFIRM_YOUR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (hasCorrespondenceAndPrimaryAddress(caseData?.respondent1) && hasDateOfBirthIfIndividual(caseData?.respondent1)) {
    confirmYourDetailsTask.status = TaskStatus.COMPLETE;
  }

  return confirmYourDetailsTask;
};

