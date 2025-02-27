import {NextFunction, Request, Response, Router} from 'express';
import {CLAIM_TASK_LIST_URL, REQUEST_MORE_TIME_URL} from '../../urls';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Claim} from '../../../common/models/claim';
import {AdditionalTime, AdditionalTimeOptions} from '../../../common/form/models/additionalTime';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {ResponseDeadlineService} from '../../../services/features/response/responseDeadlineService';
import {deadLineGuard} from '../../../routes/guards/deadLineGuard';

const requestMoreTimeController = Router();
const requestMoreTimeViewPath = 'features/response/request-more-time';
const responseDeadlineService = new ResponseDeadlineService();

function renderView(res: Response, form: GenericForm<AdditionalTime>, claim: Claim, language: string): void {
  res.render(requestMoreTimeViewPath, {
    additionalTimeOptions: AdditionalTimeOptions,
    form,
    responseDate: claim.formattedResponseDeadline(language),
    claimantName: claim.getClaimantName(),
  });
}

requestMoreTimeController.get(REQUEST_MORE_TIME_URL, deadLineGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const language = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(req.params.id);
      renderView(res, new GenericForm(new AdditionalTime(claim.responseDeadline?.additionalTime)), claim, language);
    } catch (error) {
      next(error);
    }
  });

requestMoreTimeController.post(REQUEST_MORE_TIME_URL, deadLineGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const language = req.query.lang ? req.query.lang : req.cookies.lang;
      const selectedOption = responseDeadlineService.getAdditionalTime(req.body.option);
      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(claimId);
      const form = new GenericForm(new AdditionalTime(selectedOption));
      await form.validate();
      if (form.hasErrors()) {
        renderView(res, form, claim, language);
      } else {
        await responseDeadlineService.saveAdditionalTime(claimId, selectedOption);
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default requestMoreTimeController;
