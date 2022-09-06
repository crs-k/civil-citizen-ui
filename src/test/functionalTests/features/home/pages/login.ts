import I = CodeceptJS.I

const I: I = actor();

const fields = {
  username: 'input[id="username"]',
  password: 'input[id="password"]',
  hmctsUsername: 'input[type="email"]',
  hmctsPassword: 'input[type="password"]',
};
const buttons = {
  submit: 'input.button',
  hmctsSignIn: 'input[type="submit"]',
};

export class LoginPage {

  open (): void {
    I.amOnPage('/');
  }

  login (email: string, password: string): void {
    I.waitForVisible(fields.username);
    I.fillField(fields.username, email);
    I.fillField(fields.password, password);
    I.click(buttons.submit);
    I.seeInCurrentUrl('/dashboard');
  }
}
