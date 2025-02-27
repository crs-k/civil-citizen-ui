import {NextFunction, Request, Response, Router} from 'express';
import {NoMediationReason} from '../../../common/form/models/mediation/noMediationReason';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Mediation} from '../../../common/models/mediation/mediation';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {getMediation, saveMediation} from '../../../services/features/response/mediation/mediationService';
import {CLAIM_TASK_LIST_URL, DONT_WANT_FREE_MEDIATION_URL} from '../../urls';
import {NoMediationReasonOptions} from '../../../common/form/models/mediation/noMediationReasonOptions';

const iDontWantFreeMediationViewPath = 'features/mediation/i-dont-want-free-mediation';
const iDontWantFreeMediationController = Router();

function renderView(form: GenericForm<NoMediationReason>, res: Response): void {
  res.render(iDontWantFreeMediationViewPath, {form, NoMediationReasonOptions: NoMediationReasonOptions});
}

iDontWantFreeMediationController.get(DONT_WANT_FREE_MEDIATION_URL, async (req, res, next: NextFunction) => {
  try {
    const mediation: Mediation = await getMediation(req.params.id);
    renderView(new GenericForm(mediation?.noMediationReason), res);
  } catch (error) {
    next(error);
  }
});

iDontWantFreeMediationController.post(DONT_WANT_FREE_MEDIATION_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const noMediationReasonForm = new GenericForm(new NoMediationReason(req.body.disagreeMediationOption, req.body.otherReason));
      await noMediationReasonForm.validate();
      if (noMediationReasonForm.hasErrors()) {
        renderView(noMediationReasonForm, res);
      } else {
        if (req.body.disagreeMediationOption !== NoMediationReasonOptions.OTHER) {
          noMediationReasonForm.model.otherReason = '';
        }
        await saveMediation(req.params.id, noMediationReasonForm.model, 'noMediationReason');
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default iDontWantFreeMediationController;
