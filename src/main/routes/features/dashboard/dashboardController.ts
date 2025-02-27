import {Response, Router} from 'express';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest, UserDetails} from 'models/AppRequest';
import {getOcmcDraftClaims} from '../../../app/client/legacyDraftStoreClient';
import {DashboardClaimantItem, DashboardDefendantItem} from '../../../common/models/dashboard/dashboardItem';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const ocmcBaseUrl = config.get<string>('services.cmc.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: Response, claimsAsClaimant: DashboardClaimantItem[], claimDraftSaved: DashboardClaimantItem,
  claimsAsDefendant: DashboardDefendantItem[], responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object): void {
  res.render('features/dashboard/dashboard', {
    claimsAsClaimant,
    claimDraftSaved,
    claimsAsDefendant,
    responseDraftSaved,
    paginationArgumentClaimant,
    paginationArgumentDefendant,
    newOcmcClaimUrl: `${ocmcBaseUrl}/eligibility`,
  });
}

const dashboardController = Router();

dashboardController.get(DASHBOARD_URL, async function (req: AppRequest, res) {
  const user: UserDetails = req.session.user;
  /*This is a call to validate integration with legacy draft-store. This will have to be refined in the future
  to display the draft claims on the dashboard*/
  const claimsAsClaimant : DashboardClaimantItem[] = await civilServiceClient.getClaimsForClaimant(req);
  const claimsAsDefendant : DashboardDefendantItem[] = await civilServiceClient.getClaimsForDefendant(<AppRequest>req);
  const claimDraftSaved = await getOcmcDraftClaims(user?.accessToken);
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = {};
  const paginationArgumentDefendant: object = {};
  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);
});

export default dashboardController;
