import {NextFunction, Response, Router} from 'express';
import {CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from '../../../urls';
import {SevereDisabilityService} from '../../../../services/features/response/statementOfMeans/severeDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';

const citizenSevereDisabilityViewPath = 'features/response/statementOfMeans/are-you-severely-disabled';
const severeDisabilityController = Router();
const severeDisabilityService = new SevereDisabilityService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(citizenSevereDisabilityViewPath, {form});
}

severeDisabilityController.get(CITIZEN_SEVERELY_DISABLED_URL, async (req, res, next: NextFunction) => {
  try {
    const severeDisability = await severeDisabilityService.getSevereDisability(req.params.id);
    renderView(severeDisability, res);
  } catch (error) {
    next(error);
  }
});

severeDisabilityController.post(CITIZEN_SEVERELY_DISABLED_URL, async (req, res, next: NextFunction) => {
  try {
    const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await severeDisabilityService.saveSevereDisability(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_RESIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default severeDisabilityController;
