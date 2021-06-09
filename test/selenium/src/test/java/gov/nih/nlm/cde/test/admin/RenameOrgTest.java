package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RenameOrgTest extends NlmCdeBaseTest {

    @Test
    public void renameOrg() {
        mustBeLoggedInAs(theOrgAuth_username, password);
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

        clickElement(By.xpath("//*[@id = 'orgLongName-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgLongName-" + testOrg + "']//input")).sendKeys(testOrgRenamed);
        clickElement(By.xpath("//*[@id = 'orgLongName-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        clickElement(By.xpath("//*[@id = 'orgMailAddress-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgMailAddress-" + testOrg + "']//input")).sendKeys(testOrgMailingAddress);
        clickElement(By.xpath("//*[@id = 'orgMailAddress-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        clickElement(By.xpath("//*[@id = 'orgEmailAddress-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgEmailAddress-" + testOrg + "']//input")).sendKeys(testOrgEmailingAddress);
        clickElement(By.xpath("//*[@id = 'orgEmailAddress-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        clickElement(By.xpath("//*[@id = 'orgPhoneNumber-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgPhoneNumber-" + testOrg + "']//input")).sendKeys(testOrgPhoneNumber);
        clickElement(By.xpath("//*[@id = 'orgPhoneNumber-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        clickElement(By.xpath("//*[@id = 'orgUri-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgUri-" + testOrg + "']//input")).sendKeys(testOrgUri);
        clickElement(By.xpath("//*[@id = 'orgUri-" + testOrg + "']//button[contains(text(),'Confirm')]"));
        closeAlert();

        driver.navigate().refresh();
        textPresent(testOrgRenamed);
        textPresent(testOrgMailingAddress);
        textPresent(testOrgEmailingAddress);
        textPresent(testOrgPhoneNumber);
        textPresent(testOrgUri);

        clickElement(By.xpath("//*[@id = 'orgLongName-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgLongName-" + testOrg + "']//input")).sendKeys(testOrgNotRenamed);
        clickElement(By.xpath("//*[@id = 'orgLongName-" + testOrg + "']//button[text() = 'Discard']"));

        clickElement(By.xpath("//*[@id = 'orgMailAddress-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgMailAddress-" + testOrg + "']//input")).sendKeys(testOrgMailingAddressNotRenamed);
        clickElement(By.xpath("//*[@id = 'orgMailAddress-" + testOrg + "']//button[text() = 'Discard']"));

        clickElement(By.xpath("//*[@id = 'orgEmailAddress-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgEmailAddress-" + testOrg + "']//input")).sendKeys(testOrgEmailingAddressNotRenamed);
        clickElement(By.xpath("//*[@id = 'orgEmailAddress-" + testOrg + "']//button[text() = 'Discard']"));

        clickElement(By.xpath("//*[@id = 'orgPhoneNumber-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgPhoneNumber-" + testOrg + "']//input")).sendKeys(testOrgPhoneNumberNotRenamed);
        clickElement(By.xpath("//*[@id = 'orgPhoneNumber-" + testOrg + "']//button[text() = 'Discard']"));

        clickElement(By.xpath("//*[@id = 'orgUri-" + testOrg + "']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'orgUri-" + testOrg + "']//input")).sendKeys(testOrgUriNotRenamed);
        clickElement(By.xpath("//*[@id = 'orgUri-" + testOrg + "']//button[text() = 'Discard']"));

        textNotPresent(testOrgNotRenamed);
        textNotPresent(testOrgMailingAddressNotRenamed);
        textNotPresent(testOrgEmailingAddressNotRenamed);
        textNotPresent(testOrgPhoneNumberNotRenamed);
        textNotPresent(testOrgUriNotRenamed);

        driver.navigate().refresh();
        textNotPresent(testOrgNotRenamed);
        textNotPresent(testOrgMailingAddressNotRenamed);
        textNotPresent(testOrgEmailingAddressNotRenamed);
        textNotPresent(testOrgPhoneNumberNotRenamed);
        textNotPresent(testOrgUriNotRenamed);
    }
}
