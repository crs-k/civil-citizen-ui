
const I = actor();

const fields ={
  yesButton: 'input[id="declared"]',
  noButton: 'input[id="declared-2"]',
  claimNumber: 'input[id="rows[0][claimNumber]"]',
  amountYouOwe: 'input[id="rows[0][amount]"]',
  installment: 'input[id="rows[0][instalmentAmount]"]',
};
const buttons = {
  saveAndContinue: 'Save and continue',
};

class CourtOrders {

  clickYesButton(claimref) {
    I.see('Are you paying money as a result of any court orders?', 'h1');
    I.click(fields.yesButton);
    I.fillField(fields.claimNumber, claimref);
    I.fillField(fields.amountYouOwe, '1000');
    I.fillField(fields.installment, '120');
    I.click(buttons.saveAndContinue);
  }
  clickNoButton() {
    I.see('Are you paying money as a result of any court orders?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.saveAndContinue);
  }
}

module.exports = CourtOrders;