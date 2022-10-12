import * as express from 'express';
import {DEFENDANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getTelephone,saveTelephone} from '../../../../../main/services/features/claim/yourDetails/claimantAndDefendantPhoneService';
import {AppRequest} from 'common/models/AppRequest';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from '../../../../common/models/partyType';

const defendantPhoneViewPath = 'features/public/claim/defendant-phone';
const defendantPhoneController = express.Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: express.Response): void {
  res.render(defendantPhoneViewPath, {form});
}

defendantPhoneController.get(DEFENDANT_PHONE_NUMBER_URL, async (req: AppRequest,res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.session.user?.id;
    const form: CitizenTelephoneNumber = await getTelephone(claimId, ClaimantOrDefendant.DEFENDANT);
    renderView(new GenericForm<CitizenTelephoneNumber>(form),res);
  } catch (error) {
    next(error);
  }
});

defendantPhoneController.post(DEFENDANT_PHONE_NUMBER_URL, async (req: AppRequest | express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session.user?.id;
    const form: GenericForm<CitizenTelephoneNumber> = new GenericForm(new CitizenTelephoneNumber(req.body.telephoneNumber));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveTelephone(claimId,form.model,ClaimantOrDefendant.DEFENDANT);
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default defendantPhoneController;
