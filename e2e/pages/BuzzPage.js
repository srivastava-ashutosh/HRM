class BuzzPage {

    constructor(page) {
        this.page = page
        this.selectEmp =  page.locator('#selectEmployee');
        this.new_Post =  page.locator('#newPost');
        this.saveButton = page.getByRole('button', { name: ' Post' });
    }

    async addBuzz(employee, postData){
        await this.selectEmp.selectOption(employee);
        await this.new_Post.fill(postData);
    }

    async saveBuzz(){
        await this.saveButton.click()
    }
}

module.exports = {BuzzPage}