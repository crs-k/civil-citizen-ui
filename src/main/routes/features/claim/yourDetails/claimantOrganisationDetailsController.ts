import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_ORGANISATION_DETAILS_URL, CLAIMANT_PHONE_NUMBER_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {Address} from '../../../../common/form/models/address';
import {CitizenCorrespondenceAddress} from '../../../../common/form/models/citizenCorrespondenceAddress';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getClaimantPartyInformation,
  getCorrespondenceAddressForm,
  saveClaimantParty,
} from '../../../../services/features/claim/yourDetails/claimantDetailsService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {Party} from '../../../../common/models/party';
import {AppRequest} from '../../../../common/models/AppRequest';

const claimantOrganisationDetailsController = Router();
const claimantOrganisationDetailsPath = 'features/claim/yourDetails/claimant-organisation-details';

function renderPage(res: Response, req: Request, party: GenericForm<Party>, claimantIndividualAddress: GenericForm<Address>, claimantIndividualCorrespondenceAddress: GenericForm<CitizenCorrespondenceAddress>): void {

  res.render(claimantOrganisationDetailsPath, {
    party,
    claimantIndividualAddress,
    claimantIndividualCorrespondenceAddress,
  });
}

claimantOrganisationDetailsController.get(CLAIMANT_ORGANISATION_DETAILS_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claimant: Party = await getClaimantPartyInformation(caseId);
    const claimantIndividualAddress = new GenericForm<Address>(Address.fromJson(claimant.primaryAddress));
    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(CitizenCorrespondenceAddress.fromJson(claimant.correspondenceAddress));
    const party = new GenericForm(claimant);

    renderPage(res, req, party, claimantIndividualAddress, claimantIndividualCorrespondenceAddress);
  } catch (error) {
    next(error);
  }
});

claimantOrganisationDetailsController.post(CLAIMANT_ORGANISATION_DETAILS_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  const caseId = (<AppRequest>req).session?.user?.id;
  const claimant: Party = await getClaimantPartyInformation(caseId);
  try {
    const claimantIndividualAddress = new GenericForm<Address>(Address.fromObject(req.body));
    const claimantIndividualCorrespondenceAddress = new GenericForm<CitizenCorrespondenceAddress>(getCorrespondenceAddressForm(req.body));
    const party = new GenericForm(new Party(req.body.partyName, req.body.contactPerson));

    party.validateSync();
    claimantIndividualAddress.validateSync();

    if (req.body.provideCorrespondenceAddress === YesNo.YES) {
      claimantIndividualCorrespondenceAddress.validateSync();
      claimant.provideCorrespondenceAddress = YesNo.YES;
    }

    if (party.hasErrors() || claimantIndividualAddress.hasErrors() || claimantIndividualCorrespondenceAddress.hasErrors()) {
      renderPage(res, req, party, claimantIndividualAddress, claimantIndividualCorrespondenceAddress);
    } else {
      await saveClaimantParty(caseId, claimantIndividualAddress.model, claimantIndividualCorrespondenceAddress.model, req.body.provideCorrespondenceAddress, party.model);
      res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_PHONE_NUMBER_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantOrganisationDetailsController;
