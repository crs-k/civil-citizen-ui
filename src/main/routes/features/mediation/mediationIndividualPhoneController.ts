import {NextFunction, Request, Response, Router} from 'express';
import {MediationIndividualPhoneNumber} from '../../../common/form/models/mediation/mediationIndividualPhoneNumber';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Mediation} from '../../../common/models/mediation/mediation';
import {Claim} from '../../../common/models/claim';
import {YesNo} from '../../../common/form/models/yesNo';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {getMediation, saveMediation} from '../../../services/features/response/mediation/mediationService';
import {CAN_WE_USE_URL, CLAIM_TASK_LIST_URL} from '../../urls';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';

const mediationIndividualPhoneViewPath = 'features/mediation/can-we-use';
const mediationIndividualPhoneController = Router();

async function renderView(form: GenericForm<MediationIndividualPhoneNumber>, res: Response, claimId: string): Promise<void> {
  const claim: Claim = await getCaseDataFromStore(claimId);
  res.render(mediationIndividualPhoneViewPath, {form, respondentTelNumber: claim.respondent1?.partyPhone});
}

const getGenericForm = (mediationIndividualPhoneNumber: MediationIndividualPhoneNumber) => {
  return new GenericForm<MediationIndividualPhoneNumber>(mediationIndividualPhoneNumber);
};

const isTelephoneNumberSaved = (telephoneNumber: string, req: Request) => {
  if (!telephoneNumber) {
    return getGenericForm(new MediationIndividualPhoneNumber(YesNo.NO, req.body.telephoneNumber));
  }
  return getGenericForm(new MediationIndividualPhoneNumber(req.body.option, req.body.telephoneNumber));
};

mediationIndividualPhoneController.get(CAN_WE_USE_URL, async (req, res, next: NextFunction) => {
  try {
    const mediation: Mediation = await getMediation(req.params.id);
    await renderView(getGenericForm(mediation.canWeUse), res, req.params.id);
  } catch (error) {
    next(error);
  }
});

mediationIndividualPhoneController.post(CAN_WE_USE_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim: Claim = await getCaseDataFromStore(req.params.id);
      const mediationIndividualPhoneForm: GenericForm<MediationIndividualPhoneNumber> = isTelephoneNumberSaved(claim.respondent1.partyPhone.phone, req);
      await mediationIndividualPhoneForm.validate();
      if (mediationIndividualPhoneForm.hasErrors()) {
        await renderView(mediationIndividualPhoneForm, res, req.params.id);
      } else {
        if (req.body.option === YesNo.YES) {
          mediationIndividualPhoneForm.model.mediationPhoneNumber = undefined;
        }
        if (claim.mediation?.mediationDisagreement) {
          await saveMediation(req.params.id, new GenericYesNo(), 'mediationDisagreement');
        }
        await saveMediation(req.params.id, mediationIndividualPhoneForm.model, 'canWeUse');
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default mediationIndividualPhoneController;
