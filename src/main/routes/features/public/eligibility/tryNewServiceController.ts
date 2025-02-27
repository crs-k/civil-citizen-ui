import {Request, Response, Router} from 'express';
import {BASE_ELIGIBILITY_URL, ELIGIBILITY_CLAIM_VALUE_URL} from '../../../urls';

const tryNewServiceController = Router();

tryNewServiceController.get(BASE_ELIGIBILITY_URL, async (req: Request, res: Response) => {
  res.render('features/public/eligibility/try-new-service', {urlNextView: ELIGIBILITY_CLAIM_VALUE_URL});
});

export default tryNewServiceController;
