package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RenameOrg extends NlmCdeBaseTest {

    private void refreshOrganizationsTabScreen() {
        driver.navigate().refresh();
        scrollToTop();
        clickElement(By.linkText("Organizations"));
    }

    @Test
    public void renameOrg() {
        mustBeLoggedInAs("theOrgAuth", password);
        String testOrg = "New Test Org 3";
        String testOrgRenamed = "New Test Org 3 Renamed";
        String testOrgNotRenamed = "New Test Org 3 Not Renamed";
        String testOrgMailingAddress = "123 Sunshine Street, City, State 12345";
        String testOrgMailingAddressNotRenamed = "Address Not Renamed";
        String testOrgEmailingAddress = "abc123@abc.com";
        String testOrgEmailingAddressNotRenamed = "Email Not Renamed";
        String testOrgPhoneNumber = "111-222-3333";
        String testOrgPhoneNumberNotRenamed = "Phone Number Not Renamed";
        String testOrgUri = "www.google.com";
        String testOrgUriNotRenamed = "Website Not Renamed";
        addOrg(testOrg, null, null);
        closeAlert();

        scrollToTop();
        clickElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//input")).sendKeys(testOrgRenamed);
        clickElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        scrollToViewById("orgMailAddress-" + testOrg);
        clickElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//input")).sendKeys(testOrgMailingAddress);
        clickElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        scrollToViewById("orgEmailAddress-" + testOrg);
        clickElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//input")).sendKeys(testOrgEmailingAddress);
        clickElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        scrollToViewById("orgPhoneNumber-" + testOrg);
        clickElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//input")).sendKeys(testOrgPhoneNumber);
        clickElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        scrollToViewById("orgUri-" + testOrg);
        clickElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//input")).sendKeys(testOrgUri);
        clickElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        refreshOrganizationsTabScreen();
        textPresent(testOrgRenamed);
        textPresent(testOrgMailingAddress);
        textPresent(testOrgEmailingAddress);
        textPresent(testOrgPhoneNumber);
        textPresent(testOrgUri);

        clickElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//input")).sendKeys(testOrgNotRenamed);
        clickElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//button[text() = ' Discard']"));

        clickElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//input")).sendKeys(testOrgMailingAddressNotRenamed);
        clickElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//button[text() = ' Discard']"));

        clickElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//input")).sendKeys(testOrgEmailingAddressNotRenamed);
        clickElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//button[text() = ' Discard']"));

        clickElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//input")).sendKeys(testOrgPhoneNumberNotRenamed);
        clickElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//button[text() = ' Discard']"));

        clickElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//input")).sendKeys(testOrgUriNotRenamed);
        clickElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//button[text() = ' Discard']"));

        textNotPresent(testOrgNotRenamed);
        textNotPresent(testOrgMailingAddressNotRenamed);
        textNotPresent(testOrgEmailingAddressNotRenamed);
        textNotPresent(testOrgPhoneNumberNotRenamed);
        textNotPresent(testOrgUriNotRenamed);

        refreshOrganizationsTabScreen();

        textNotPresent(testOrgNotRenamed);
        textNotPresent(testOrgMailingAddressNotRenamed);
        textNotPresent(testOrgEmailingAddressNotRenamed);
        textNotPresent(testOrgPhoneNumberNotRenamed);
        textNotPresent(testOrgUriNotRenamed);
    }
}
