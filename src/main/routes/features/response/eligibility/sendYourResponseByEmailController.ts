import {NextFunction, Response, Router} from 'express';
import {SEND_RESPONSE_BY_EMAIL_URL} from '../../../urls';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../../common/models/claim';
import {ResponseType} from '../../../../common/form/models/responseType';
import {PartyType} from '../../../../common/models/partyType';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import config from 'config';
import {FeeRange, FeeRanges} from '../../../../common/models/feeRange';
import {TableItem} from '../../../../common/models/tableItem';
import {AppRequest} from '../../../../common/models/AppRequest';
import {RejectAllOfClaimType} from '../../../../common/form/models/rejectAllOfClaimType';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const sendYourResponseByEmailViewPath = 'features/response/eligibility/send-your-response-by-email';
const sendYourResponseByEmailController = Router();

function renderView(res: Response, form: Claim, fees: [TableItem[]]): void {
  res.render(sendYourResponseByEmailViewPath, {
    form,
    fees,
    ResponseType,
    RejectAllOfClaimType,
    partyType: PartyType,
  });
}

sendYourResponseByEmailController.get(SEND_RESPONSE_BY_EMAIL_URL, async (req, res, next: NextFunction) => {
  try {
    const form = await getCaseDataFromStore(req.params.id);
    const feesRanges: FeeRanges = await civilServiceClient.getFeeRanges(<AppRequest>req);
    const formattedFeesRanges = formatFeesRanges(feesRanges);
    renderView(res, form, formattedFeesRanges);
  } catch (error) {
    next(error);
  }
});

const formatFeesRanges = (feesRanges: FeeRanges): [TableItem[]] => {
  const tableFormatFeesRanges: [TableItem[]] = [[]];
  feesRanges.value.forEach((feeRange: FeeRange) => {
    tableFormatFeesRanges.push(feeRange.formatFeeRangeToTableItem());
  });
  return tableFormatFeesRanges;
};

export default sendYourResponseByEmailController;
