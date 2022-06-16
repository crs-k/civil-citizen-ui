import I = CodeceptJS.I
import { TaskListPage } from '../pages/taskList';
import { NameAndAddressDetailsPage } from '../pages/enterNameAndAddressDetails';
import { DateOfBirthDetailsPage } from '../pages/enterDateOfBirthDetails';
import { ContactNumberDetailsPage } from '../pages/enterContactNumberDetails';
import { RespondTypePage } from '../pages/respondType';
import { PaymentOptionPage } from '../pages/paymentOption';
import { CheckYourAnswersPage } from '../pages/checkYourAnswers';
import { DateToPayOn } from '../pages/dateToPayOn';
import { ShareYouFinancialDetailsIntro } from '../pages/shareYouFinancialDetailsIntro';
import { BankAccountsDetails } from '../pages/bankAccountsDetails';
import { DisabilityDetails } from '../pages/disabilityDetails';
import { SevereDisabilityDetails } from '../pages/severeDisabilityDetails';
import { ResidenceDetails } from '../pages/residenceDetails';
import { PartnerDetails } from '../pages/partnerDetails';
import { PartnerAgeDetails } from '../pages/partnerAgeDetails';
import { PartnerPensionDetails } from '../pages/partnerPensionDetails';
import { PartnerDisabilityDetails } from '../pages/partnerDisabilityDetails';
import { DependantDetails } from '../pages/dependantDetails';
import { OtherDependantDetails } from '../pages/otherDependantDetails';
import { EmploymentDetails } from '../pages/employment';
import { EmployerDetails } from '../pages/employerDetails';
import { SelfEmploymentDetails } from '../pages/selfEmploymentDetails';
import { SelfEmploymentTaxDetails } from '../pages/selfEmploymentTaxDetails';
import { CourtOrders } from '../pages/courtOrders';

const I: I = actor();
const taskListPage: TaskListPage = new TaskListPage();
const nameAndAddressDetailsPage: NameAndAddressDetailsPage  = new NameAndAddressDetailsPage();
const dateOfBirthDetailsPage: DateOfBirthDetailsPage = new DateOfBirthDetailsPage();
const contactNumberDetailsPage: ContactNumberDetailsPage = new ContactNumberDetailsPage();
const respondTypePage: RespondTypePage = new RespondTypePage();
const paymentOptionPage: PaymentOptionPage = new PaymentOptionPage();
const checkYourAnswersPage: CheckYourAnswersPage = new CheckYourAnswersPage();
const dateToPayOn: DateToPayOn = new DateToPayOn();
const shareYourFinancialDetailsIntro: ShareYouFinancialDetailsIntro = new ShareYouFinancialDetailsIntro();
const bankAccountDetails: BankAccountsDetails = new BankAccountsDetails();
const disabilityDetails: DisabilityDetails = new DisabilityDetails();
const severeDisabilityDetails: SevereDisabilityDetails = new SevereDisabilityDetails();
const selectResidenceDetails: ResidenceDetails = new ResidenceDetails();
const selectPartnerDetails: PartnerDetails = new PartnerDetails();
const selectPartnerAge: PartnerAgeDetails = new PartnerAgeDetails();
const selectPartnerPension: PartnerPensionDetails = new PartnerPensionDetails();
const selectPartnerDisability: PartnerDisabilityDetails = new PartnerDisabilityDetails();
const selectDependantDetails: DependantDetails = new DependantDetails();
const selectOtherDependantsDetails: OtherDependantDetails = new OtherDependantDetails();
const selectEmploymentDetails: EmploymentDetails = new EmploymentDetails();
const enterEmployerDetails: EmployerDetails = new EmployerDetails();
const enterSelfEmploymentDetails: SelfEmploymentDetails = new SelfEmploymentDetails();
const enterSelfEmploymentTaxDetails: SelfEmploymentTaxDetails = new SelfEmploymentTaxDetails();
const courtOrders: CourtOrders = new CourtOrders();

export class ResponseSteps {

  VerifyResponsePageContent (claimRef: string): void {
    taskListPage.open(claimRef);
    taskListPage.verifyResponsePageContent();
  }
  EnterNameAndAddressDetails (claimRef: string): void {
    nameAndAddressDetailsPage.enterNameAndAddressDetails(claimRef);
  }
  EnterDateOfBirth (claimRef: string): void {
    dateOfBirthDetailsPage.enterDateOfBirth(claimRef);
  }
  EnterContactNumber (claimRef: string): void {
    contactNumberDetailsPage.enterContactNumber(claimRef);
  }
  EnterResponseToClaim(claimRef: string, responseType: string): void {
    respondTypePage.enterResponseToClaim(claimRef, responseType);
  }
  EnterPaymentOption(claimRef: string, paymentOption: string): void {
    paymentOptionPage.enterPaymentOption(claimRef, paymentOption);
  }
  CheckAndSubmit(claimRef: string): void {
    checkYourAnswersPage.checkAndSubmit(claimRef);
  }
  EnterDateToPayOn(): void {
    dateToPayOn.enterDateToPayOn();
  }
  ShareYourFinancialDetailsIntro(claimRef: string): void {
    shareYourFinancialDetailsIntro.open(claimRef);
    shareYourFinancialDetailsIntro.clickContinue();
  }
  EnterBankAccountDetails(): void {
    bankAccountDetails.enterBankAccountDetails();
    bankAccountDetails.enterAdditionalBankAccountDetails();
    bankAccountDetails.clickContinue();
  }
  SelectDisabilityDetails(disability: string, severeDisability: string): void {
    if(disability == 'yes'){
      disabilityDetails.clickYesButton();
      if(severeDisability == 'yes'){
        severeDisabilityDetails.clickYesButton();
      }else{
        severeDisabilityDetails.clickNoButton();
      }
    }else{
      disabilityDetails.clickNoButton();
    }
  }
  SelectResidenceDetails(residenceType: string): void {
    selectResidenceDetails.selectResidenceType(residenceType);
  }
  SelectPartnerDetails(partner: string): void {
    if(partner == 'yes'){
      selectPartnerDetails.clickYesButton();
    }else{
      selectPartnerDetails.clickNoButton();
    }
  }
  SelectPartnerAge(partnerAge: string): void {
    if(partnerAge == 'yes'){
      selectPartnerAge.clickYesButton();
    }else{
      selectPartnerAge.clickNoButton();
    }
  }
  SelectPartnerPension(partnerPension: string): void {
    if(partnerPension == 'yes'){
      selectPartnerPension.clickYesButton();
    }else{
      selectPartnerPension.clickNoButton();
    }
  }
  SelectPartnerDisability(partnerDisability: string): void {
    if(partnerDisability == 'yes'){
      selectPartnerDisability.clickYesButton();
    }else{
      selectPartnerDisability.clickNoButton();
    }
  }
  SelectDependantDetails(dependant: string): void {
    if(dependant == 'yes'){
      selectDependantDetails.clickYesButton();
    }else{
      selectDependantDetails.clickNoButton();
    }
  }
  SelectOtherDependantDetails(dependant: string): void {
    if(dependant == 'yes'){
      selectOtherDependantsDetails.clickYesButton();
    }else{
      selectOtherDependantsDetails.clickNoButton();
    }
  }
  SelectEmploymentDetails(employment: string): void {
    if(employment == 'yes'){
      selectEmploymentDetails.clickYesButton();
    }else{
      selectEmploymentDetails.clickNoButton();
    }
  }
  EnterEmployerDetails(): void {
    enterEmployerDetails.enterEmployerDetails();
  }
  EnterSelfEmploymentDetails(): void {
    enterSelfEmploymentDetails.enterSelfEmployerDetails();
  }
  EnterSelfEmploymentTaxDetails(): void {
    enterSelfEmploymentTaxDetails.clickYesButton();
  }
  EnterCourtOrderDetails(claimRef: string): void {
    courtOrders.clickYesButton(claimRef);
  }

}
