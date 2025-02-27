import {NextFunction, Request, Response, Router} from 'express';
import {HowMuchDoYouOwe} from '../../../../../common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {CITIZEN_OWED_AMOUNT_URL, CLAIM_TASK_LIST_URL} from '../../../../urls';
import {
  getHowMuchDoYouOweForm,
  saveHowMuchDoYouOweData,
} from '../../../../../services/features/response/admission/partialAdmission/howMuchDoYouOweService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {toNumberOrUndefined} from '../../../../../common/utils/numberConverter';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {PartAdmitHowMuchHaveYouPaidGuard} from '../../../../../routes/guards/partAdmitHowMuchHaveYouPaidGuard';

const howMuchDoYouOweViewPath = 'features/response/admission/partialAdmission/how-much-do-you-owe';
const howMuchDoYouOweController = Router();

function renderView(form: GenericForm<HowMuchDoYouOwe>, res: Response) {
  res.render(howMuchDoYouOweViewPath, {form: form});
}

howMuchDoYouOweController.get(CITIZEN_OWED_AMOUNT_URL, PartAdmitHowMuchHaveYouPaidGuard.apply(CLAIM_TASK_LIST_URL), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const howMuchDoYouOweForm = await getHowMuchDoYouOweForm(req.params.id);
    renderView(new GenericForm(howMuchDoYouOweForm), res);
  } catch (error) {
    next(error);
  }
});

howMuchDoYouOweController.post(CITIZEN_OWED_AMOUNT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedValues = await getHowMuchDoYouOweForm(req.params.id);
    const howMuchDoYouOwe = new HowMuchDoYouOwe(toNumberOrUndefined(req.body.amount), savedValues.totalAmount);
    const form = new GenericForm(howMuchDoYouOwe);
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveHowMuchDoYouOweData(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default howMuchDoYouOweController;
