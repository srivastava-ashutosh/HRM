class PimPage {
    constructor(page) {
        this.page = page;
        this.firstNameInput = page.getByLabel('First Name*');
        this.middleNameInput = page.getByLabel('Middle Name');
        this.lastNameInput = page.getByLabel('Last Name*');
        this.department = page.getByLabel('Department');
        this.workEmail = page.getByLabel('Work Email')
        this.employeeIdInput = page.getByLabel('Employee ID');
        this.jobTitle = page.getByLabel('Job Title');
        this.supervisor = page.getByLabel('Supervisor');
        this.saveBtn = page.getByRole('button', { name: 'Save Employee' });
        this.employeeListHeader = page.locator('h3:has-text("Employee List")');
        this.cardBody = page.locator('.card-body');
    }

    async gotoAddEmployee() {
        await this.page.goto('/pim/add', { waitUntil: 'domcontentloaded' });
        await this.page.waitForLoadState('networkidle');
    }

    async fillEmployeeDetails(firstName, middleName, lastName, department, workEmail, jobTitle, supervisor) {
        await this.firstNameInput.fill(firstName);
        if (middleName) {
            await this.middleNameInput.fill(middleName);
        }
        await this.lastNameInput.fill(lastName);
        await this.department.fill(department);
        await this.workEmail.fill(workEmail);
        await this.jobTitle.selectOption(jobTitle);
        await this.supervisor.selectOption(supervisor)                    
  
    }

    async save() {
        await this.saveBtn.click();
    }
}

module.exports = { PimPage };