import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_REJECT_REASON_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {saveClaimantResponse} from "../../../services/features/claimantResponse/claimantResponseService";
import {YesNo} from '../../../common/form/models/yesNo';

const settleClaimController = Router();
const settleClaimViewPath = 'features/claimantResponse/settle-claim';

function renderView(form: GenericForm<GenericYesNo>, res: Response, paidAmount: number): void {
  res.render(settleClaimViewPath, {form, paidAmount});
}

let paidAmount: number;

settleClaimController.get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  const claimId = req.params.id;
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    paidAmount = claim.isRejectAllOfClaimAlreadyPaid();
    renderView(new GenericForm(claim.hasPartPaymentBeenAccepted), res, paidAmount);
  } catch (error) {
    next(error);
  }
});

settleClaimController.post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  const genericYesNoForm = new GenericForm(new GenericYesNo(req.body.option));
  await genericYesNoForm.validate();

  const claimId = req.params.id;
  try {
    if (genericYesNoForm.hasErrors()) {
      renderView(genericYesNoForm, res, paidAmount);
    } else {
      if (genericYesNoForm.model.option === YesNo.YES) {
        await saveClaimantResponse(claimId, genericYesNoForm.model, "hasPartPaymentBeenAccepted");
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
      } else {
        await saveClaimantResponse(claimId, genericYesNoForm.model, "hasPartPaymentBeenAccepted");
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECT_REASON_URL));
      }
    }
  } catch (error) {
    next(error);
  }

});

export default settleClaimController;
