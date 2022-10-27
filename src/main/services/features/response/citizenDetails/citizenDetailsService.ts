import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Party} from '../../../../common/models/party';
import {Address} from '../../../../common/form/models/address';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {convertToPrimaryAddress} from '../../../../common/models/primaryAddress';
import {convertToCorrespondenceAddress} from '../../../../common/models/correspondenceAddress';
import {YesNo} from '../../../../common/form/models/yesNo';

export const getRespondentInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (responseData.respondent1) {
    return responseData.respondent1;
  }
  return new Party();
};

export const getCorrespondenceAddressForm = (value?: Record<string, string>): CitizenCorrespondenceAddress => {
  let citizenCorrespondenceAddress = CitizenCorrespondenceAddress.fromObject(value);
  if (value.postToThisAddress === YesNo.NO) {
    citizenCorrespondenceAddress = undefined;
  }
  if (citizenCorrespondenceAddress) {
    return citizenCorrespondenceAddress;
  }
  return new CitizenCorrespondenceAddress();
};

export const saveRespondent = async (claimId: string, citizenAddress: Address, citizenCorrespondenceAddress: CitizenCorrespondenceAddress, party: Party): Promise<void> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (!responseData.respondent1) {
    responseData.respondent1 = new Party();
  }
  responseData.respondent1.primaryAddress = convertToPrimaryAddress(citizenAddress);
  responseData.respondent1.correspondenceAddress = citizenCorrespondenceAddress.isEmpty()
    ? undefined
    : convertToCorrespondenceAddress(citizenCorrespondenceAddress);
  responseData.respondent1.partyPhone = party?.partyPhone;
  responseData.respondent1.contactPerson = party?.contactPerson;
  responseData.respondent1.postToThisAddress = party?.postToThisAddress;

  await saveDraftClaim(claimId, responseData);
};
