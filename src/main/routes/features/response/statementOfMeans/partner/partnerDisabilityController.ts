import {NextFunction, Response, Router} from 'express';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
} from '../../../../urls';
import {PartnerDisabilityService} from '../../../../../services/features/response/statementOfMeans/partner/partnerDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner-disability';
const partnerDisabilityController = Router();
const partnerDisabilityService = new PartnerDisabilityService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(partnerViewPath, {form});
}

partnerDisabilityController.get(CITIZEN_PARTNER_DISABILITY_URL, async (req, res, next: NextFunction) => {
  try {
    const partnerDisability = await partnerDisabilityService.getPartnerDisability(req.params.id);
    renderView(partnerDisability, res);
  } catch (error) {
    next(error);
  }
});

partnerDisabilityController.post(CITIZEN_PARTNER_DISABILITY_URL,
  async (req, res, next: NextFunction) => {
    try {
      const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await partnerDisabilityService.savePartnerDisability(req.params.id, form);
        form.model.option == 'yes'
          ? res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_SEVERE_DISABILITY_URL))
          : res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default partnerDisabilityController;
