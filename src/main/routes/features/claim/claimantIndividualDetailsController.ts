import * as express from 'express';
import {
  CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_CLAIMANT_DOB,
} from '../../urls';
import {Respondent} from 'models/respondent';
// import {getRespondentInformation} from '../../../services/features/response/citizenDetails/citizenDetailsService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {CitizenAddress} from '../../../common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../../common/form/models/citizenCorrespondenceAddress';
import {YesNo} from '../../../common/form/models/yesNo';
import {
  getRespondentInformation,
  saveRespondent,
} from '../../../services/features/response/citizenDetails/citizenDetailsService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
// import {CounterpartyType} from '../../../common/models/counterpartyType';

const claimantIndividualDetailsController = express.Router();
const claimantIndividualDetailsPath = 'features/claim/claimant-individual-details';

function renderPage(res: express.Response, req: express.Request, respondent: Respondent,  citizenAddress: GenericForm<CitizenAddress>, citizenCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>): void {
  const partyName = respondent?.partyName;
  const type = respondent?.type;
  const contactPerson = respondent?.contactPerson;

  res.render(claimantIndividualDetailsPath, {
    respondent,
    citizenAddress,
    citizenCorrespondenceAddress,
    partyName: partyName,
    contactPerson: contactPerson,
    type: type,
    urlNextView: CLAIM_CLAIMANT_DOB,
  });
}

claimantIndividualDetailsController.get(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req:express.Request, res:express.Response, next: express.NextFunction) => {
  try {
    // TODO : change the hard coded case id to the userID
    const respondent: Respondent = await getRespondentInformation('123456');
    console.log('get-saved-->', respondent);

    const claimantIndividualAddress = new GenericForm<CitizenAddress>(new CitizenAddress(
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine1 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine2 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.AddressLine3 : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.PostTown : undefined,
      respondent?.primaryAddress ? respondent.primaryAddress.PostCode : undefined));

    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine1 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine2 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.AddressLine3 : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.PostTown : undefined,
      respondent?.correspondenceAddress ? respondent.correspondenceAddress.PostCode : undefined));
    
    console.log('primary', claimantIndividualAddress);
    console.log('correspondance', claimantIndividualCorrespondenceAddress);


    renderPage(res, req, respondent, claimantIndividualAddress, claimantIndividualCorrespondenceAddress);
  } catch (error) {
    next(error);
  }
});

claimantIndividualDetailsController.post(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('req.body--->', req.body);
  const responseDataRedis: Respondent = await getRespondentInformation('123456');
  try {
    const citizenAddress = new GenericForm<CitizenAddress>(new CitizenAddress(
      req.body.primaryAddressLine1,
      req.body.primaryAddressLine2,
      req.body.primaryAddressLine3,
      req.body.primaryCity,
      req.body.primaryPostCode,
    ));

    let citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress(
      req.body.correspondenceAddressLine1,
      req.body.correspondenceAddressLine2,
      req.body.correspondenceAddressLine3,
      req.body.correspondenceCity,
      req.body.correspondencePostCode,
    ));

    // TODO : create a model to validate claimant name. lastname and title

    await citizenAddress.validate();
    if (req.body.postToThisAddress === YesNo.YES) {
      await citizenCorrespondenceAddress.validate();
      responseDataRedis.postToThisAddress = YesNo.YES;
    }

    if (citizenAddress.hasErrors() || citizenCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, responseDataRedis, citizenAddress, citizenCorrespondenceAddress);
    } else {
      if (req.body.postToThisAddress === YesNo.NO) {
        citizenCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(new CitizenCorrespondenceAddress());
      }
      await saveRespondent(req.params.id, citizenAddress, citizenCorrespondenceAddress, req.body.postToThisAddress, req.body.contactPerson);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_CLAIMANT_DOB));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantIndividualDetailsController;
