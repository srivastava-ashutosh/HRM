class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Enter username');
    this.passwordInput = page.getByPlaceholder('Enter password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMsg = page.locator('.error-msg');
  }

  async goto() {
    await this.page.goto('/login', { waitUntil: 'load' });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
