import {NextFunction, Response, Router} from 'express';
import {SelfEmployedAsForm} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/selfEmployedAsForm';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {
  getSelfEmployedAsForm,
  saveSelfEmployedAsData,
} from '../../../../../../services/features/response/statementOfMeans/employment/selfEmployed/selfEmployedAsService';
import {
  CITIZEN_SELF_EMPLOYED_URL,
  ON_TAX_PAYMENTS_URL,
} from '../../../../../urls';
import {GenericForm} from '../../../../../../common/form/models/genericForm';

const selfEmployedAsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/self-employed-as';
const selfEmployedAsController = Router();

function renderView(form: GenericForm<SelfEmployedAsForm>, res: Response): void {
  res.render(selfEmployedAsViewPath, {form});
}

selfEmployedAsController.get(CITIZEN_SELF_EMPLOYED_URL, async (req, res, next: NextFunction) => {
  try {
    const form = await getSelfEmployedAsForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

selfEmployedAsController.post(CITIZEN_SELF_EMPLOYED_URL,
  async (req, res, next: NextFunction) => {
    try{
      const annualTurnover = req.body.annualTurnover ? Number(req.body.annualTurnover) : undefined;
      const form: GenericForm<SelfEmployedAsForm> = new GenericForm(new SelfEmployedAsForm(req.body.jobTitle, annualTurnover));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveSelfEmployedAsData(req.params.id, form);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, ON_TAX_PAYMENTS_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default selfEmployedAsController;
