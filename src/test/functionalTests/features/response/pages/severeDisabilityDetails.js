const I = actor();

const fields ={
  yesButton: 'input[id="severeDisability"]',
  noButton: 'input[id="severeDisability-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class SevereDisabilityDetails {

  clickYesButton() {
    I.see('Are you severely disabled?', 'h1');
    I.click(fields.yesButton);
    I.click(buttons.continue);
  }
  clickNoButton() {
    I.see('Are you severely disabled?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}

module.exports = SevereDisabilityDetails;