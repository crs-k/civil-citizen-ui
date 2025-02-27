import {NextFunction, Request, Response, Router} from 'express';
import {CONFIRMATION_URL, RESPONSE_CHECK_ANSWERS_URL, RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../urls';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from '../../../services/features/response/checkAnswers/checkAnswersService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {StatementOfTruthForm} from '../../../common/form/models/statementOfTruth/statementOfTruthForm';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {QualifiedStatementOfTruth} from '../../../common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {isFullAmountReject} from '../../../modules/claimDetailsService';
import {AppRequest} from '../../../common/models/AppRequest';
import {AllResponseTasksCompletedGuard} from '../../../routes/guards/allResponseTasksCompletedGuard';
import {submitResponse} from '../../../services/features/response/submission/submitResponse';

const checkAnswersViewPath = 'features/response/check-answers';
const checkAnswersController = Router();

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(req.params.id, claim, lang);
  const signatureType = form.model?.type;
  const isFullAmountRejected = isFullAmountReject(claim);
  res.render(checkAnswersViewPath, {
    form,
    summarySections,
    signatureType,
    isFullAmountRejected,
  });
}

checkAnswersController.get(RESPONSE_CHECK_ANSWERS_URL,
  AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(req, res, form, claim);
    } catch (error) {
      next(error);
    }
  });

checkAnswersController.post(RESPONSE_CHECK_ANSWERS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isFullAmountRejected = (req.body?.isFullAmountRejected === 'true');
    const form = new GenericForm((req.body.type === 'qualified')
      ? new QualifiedStatementOfTruth(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
      : new StatementOfTruthForm(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(req.params.id);
      renderView(req, res, form, claim);
    } else {
      await saveStatementOfTruth(req.params.id, form.model);
      await submitResponse(<AppRequest>req);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default checkAnswersController;

