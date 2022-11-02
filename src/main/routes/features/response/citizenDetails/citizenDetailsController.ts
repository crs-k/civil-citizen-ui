import {NextFunction, Request, Response, Router} from 'express';
import {CITIZEN_DETAILS_URL, CITIZEN_PHONE_NUMBER_URL, CLAIM_TASK_LIST_URL, DOB_URL} from '../../../urls';
import {Party} from '../../../../common/models/party';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getRespondentInformation,
  saveDefendantProperty,
} from '../../../../services/features/response/citizenDetails/citizenDetailsService';
import {PartyType} from '../../../../common/models/partyType';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {PartyDetails} from '../../../../common/form/models/partyDetails';

const citizenDetailsController = Router();

const CITIZEN_DETAILS_COMPANY_VIEW_PATH = 'features/response/citizenDetails/citizen-details-company';
const CITIZEN_DETAILS_VIEW_PATH = 'features/response/citizenDetails/citizen-details';

const getViewPathWithType = (type: PartyType) => {
  if (type === PartyType.ORGANISATION || type === PartyType.COMPANY) {
    return CITIZEN_DETAILS_COMPANY_VIEW_PATH;
  }
  return CITIZEN_DETAILS_VIEW_PATH;
};

function renderPage(res: Response, req: Request, partyDetails: GenericForm<PartyDetails>, type: PartyType): void {

  res.render(getViewPathWithType(type), {
    partyDetails,
  });
}

const redirect = (respondent: Party, req: Request, res: Response) => {
  if (respondent?.type === PartyType.INDIVIDUAL) {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DOB_URL));
  } else {
    if (respondent?.partyPhone) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    } else {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PHONE_NUMBER_URL));
    }
  }
};

citizenDetailsController.get(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const respondent: Party = await getRespondentInformation(req.params.id);
    const partyDetails = new GenericForm(new PartyDetails(respondent.partyDetails));
    renderPage(res, req, partyDetails, respondent.type);
  } catch (error) {
    next(error);
  }
});

citizenDetailsController.post(CITIZEN_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const respondent = await getRespondentInformation(req.params.id);
    const partyDetails = new GenericForm(new PartyDetails(req.body));
    partyDetails.validateSync();

    if (partyDetails.hasErrors()) {
      renderPage(res, req, partyDetails, respondent.type);
    } else {
      await saveDefendantProperty(req.params.id, 'partyDetails', partyDetails.model);
      redirect(respondent, req, res);
    }
  } catch (error) {
    next(error);
  }
});

export default citizenDetailsController;
