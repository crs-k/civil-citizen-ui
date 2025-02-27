import {NextFunction, Request, Response, Router} from 'express';
import {PaymentDate} from '../../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {CITIZEN_PA_PAYMENT_DATE_URL, CLAIM_TASK_LIST_URL} from '../../../../urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {paymentDateService}
  from '../../../../../services/features/response/admission/fullAdmission/paymentOption/paymentDateService';
import {ResponseType} from '../../../../../common/form/models/responseType';
import {PartAdmitGuard} from '../../../../../routes/guards/partAdmitGuard';

const paymentDatePath = 'features/response/admission/payment-date';
const paymentDateController = Router();
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);

paymentDateController
  .get(
    CITIZEN_PA_PAYMENT_DATE_URL, PartAdmitGuard.apply(CLAIM_TASK_LIST_URL), async (req: Request, res: Response, next: NextFunction) => {
      try {
        const paymentDate = await paymentDateService.getPaymentDate(req.params.id, ResponseType.PART_ADMISSION);
        res.render(paymentDatePath, {
          form: new GenericForm(paymentDate), nextMonth: nextMonth,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_PA_PAYMENT_DATE_URL, async (req, res, next: NextFunction) => {
      const paymentDate = new PaymentDate(req.body.year, req.body.month, req.body.day);
      const form: GenericForm<PaymentDate> = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();

      if (form.hasErrors()) {
        res.render(paymentDatePath, {
          form: form, nextMonth: nextMonth,
        });
      } else {
        try {
          await paymentDateService.savePaymentDate(req.params.id, paymentDate.date, ResponseType.PART_ADMISSION);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        } catch (error) {
          next(error);
        }
      }
    });

export default paymentDateController;
