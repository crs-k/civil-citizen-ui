
const I = actor();

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

class ContactNumberDetailsPage {
  enterContactNumber (claimRef) {
    I.amOnPage('/case/'+claimRef+'/response/your-phone');
    I.see('Enter a phone number (optional)', 'h1');
    I.fillField(fields.contactNumber, '02088908876');
    I.click(buttons.saveAndContinue);
  }
}

module.exports = ContactNumberDetailsPage;
