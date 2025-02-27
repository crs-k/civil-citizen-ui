import {NextFunction, Request, Response, Router} from 'express';
import {DQ_PHONE_OR_VIDEO_HEARING_URL, DQ_UNAVAILABLE_FOR_HEARING_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {
  WhyUnavailableForHearing,
} from '../../../../common/models/directionsQuestionnaire/hearing/whyUnavailableForHearing';
import {getCalculatedDays} from '../../../../services/features/directionsQuestionnaire/whyUnavailableForHearingService';

const whyUnavailableForHearingController = Router();
const whyUnavailableForHearingViewPath = 'features/directionsQuestionnaire/hearing/why-unavailable-for-hearing';
const dqPropertyName = 'whyUnavailableForHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<WhyUnavailableForHearing>, res: Response, days: number): void {
  res.render(whyUnavailableForHearingViewPath, {form, days});
}

whyUnavailableForHearingController.get(DQ_UNAVAILABLE_FOR_HEARING_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {

    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    const whyUnavailableForHearing = directionQuestionnaire.hearing?.whyUnavailableForHearing ?
      directionQuestionnaire.hearing.whyUnavailableForHearing : new WhyUnavailableForHearing();
    const days = await getCalculatedDays();
    renderView(new GenericForm(whyUnavailableForHearing), res, days);
  } catch (error) {
    next(error);
  }
});

whyUnavailableForHearingController.post(DQ_UNAVAILABLE_FOR_HEARING_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const whyUnavailableForHearing = new GenericForm(new WhyUnavailableForHearing(req.body.reason));
    const days = await getCalculatedDays();
    whyUnavailableForHearing.validateSync();

    if (whyUnavailableForHearing.hasErrors()) {
      renderView(whyUnavailableForHearing, res, days);
    } else {
      await saveDirectionQuestionnaire(claimId, whyUnavailableForHearing.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default whyUnavailableForHearingController;
