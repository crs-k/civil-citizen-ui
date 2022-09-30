import * as express from 'express';
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
import {AppRequest} from 'models/AppRequest';
import {AllResponseTasksCompletedGuard} from '../../../routes/guards/allResponseTasksCompletedGuard';
import {submitResponse} from '../../../services/features/response/submission/submitResponse';
import {compareAddress} from '../../../../main/services/features/response/compareAddress';

const checkAnswersViewPath = 'features/response/check-answers';
const checkAnswersController = express.Router();

function renderView(req: express.Request, res: express.Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim) {
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
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(req, res, form, claim);
    } catch (error) {
      next(error);
    }
  });

checkAnswersController.post(RESPONSE_CHECK_ANSWERS_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {

    // TODO: compare original address with redis address
    // TODO: up and run civil-service
    // TODO: ask about correspondence address
    const addressHasChange = await compareAddress(<AppRequest>req);
    console.log(addressHasChange);
    

    // When: I update /change the fields in the address
    // Then: the changes are saved and specAoSApplicantCorrespondenceAddressRequired field is set to No in redis

    // When: I do not change any of the address fields
    // Then: the changes are saved and specAoSApplicantCorrespondenceAddressRequired field is set to Yes in redis

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

