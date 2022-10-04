import * as express from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {CLAIM_TASK_LIST_URL, SUPPORT_REQUIRED_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Support, SupportRequired, SupportRequiredList} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {
  // getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {getSupportRequired} from '../../../services/features/directionsQuestionnaire/supportRequiredService';

const supportRequiredController = express.Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required-list';
const dqPropertyName = 'supportRequiredList';
const dqParentName = 'hearing';

supportRequiredController.get(SUPPORT_REQUIRED_URL, async (req, res, next: express.NextFunction) => {
  debugger;
  try {
    //TODO change naming
    const data = await getSupportRequired(req.params.id)
    const form = new GenericForm(data[0]);
    res.render(supportRequiredViewPath, {form, nameList : data[1]});
  } catch (error) {
    next(error);
  }
});

supportRequiredController.post(SUPPORT_REQUIRED_URL, async (req, res, next: express.NextFunction) => {
  try {
    debugger;
    const claimId = req.params.id;
    if (req.body.declared?.length) {
      // TODO : fxi any type
      req.body.declared?.forEach((declared: any, index: number) => {
        if (declared) {
          // tODO : cover scenario with single decalred not array
          declared.forEach((supportName: keyof SupportRequired) => {
            if (req.body.model.items[index][supportName]) {
              req.body.model.items[index][supportName] = new Support(supportName.toString(), true, req.body.model.items[index][supportName].content);
            } else {
              req.body.model.items[index][supportName] = new Support(undefined, true);
            }
          });
        }
      });
    }

    const form = new GenericForm(new SupportRequiredList(req.body.model.items.map((item:any)=> new SupportRequired(item))));
    form.validateSync();
    if (form.hasErrors()) {
      res.render(supportRequiredViewPath, {form});
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default supportRequiredController;
