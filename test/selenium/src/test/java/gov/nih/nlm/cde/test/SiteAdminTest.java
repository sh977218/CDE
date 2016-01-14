package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SiteAdminTest extends NlmCdeBaseTest {

    private void refreshOrganizationsTabScreen() {
        driver.navigate().refresh();
        scrollToTop();
        clickElement(By.linkText("Organizations"));
    }

//    private void removeOrg(String orgName) {
//        clickElement(By.linkText("Account"));
//        clickElement(By.linkText("Site Management"));
//        clickElement(By.linkText("Organizations"));
//
//        int length = driver.findElements(By.xpath("//i[contains(@id,'removeOrg-')]")).size();
//        for (int i = 0; i < length; i++) {
//            String name = findElement(By.id("orgName-" + i)).getText();
//            if (orgName.equals(name)) {
//                clickElement(By.id("removeOrg-" + i))();
//                i = length;
//            }
//        }
//
//        Assert.assertTrue(textPresent("Org Removed"));
//        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(orgName) < 0);
//    }

    @Test
    public void addOrg() {
        mustBeLoggedInAs("theOrgAuth", password);
        String testOrg = "New Test Org";
        addOrg(testOrg, null, null);

        String testOrgName = "New Test Org 2";
        String testOrgLongName = "New Test Org 2 Long Name 2";
        addOrg(testOrgName, testOrgLongName, null);
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

    @Test
    public void promoteOrgAdmin() {
        mustBeLoggedInAs("theOrgAuth", password);
        String testOrg = "Promote Org Test";

        addOrg(testOrg, null, null);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("Org Admins"));
        new Select(driver.findElement(By.id("newOrgAdminOrgName"))).selectByVisibleText(testOrg);
        findElement(By.id("newOrgAdminUsername")).sendKeys(test_username);
        clickElement(By.id("newOrgAdminSubmit"));

        logout();
        loginAs(test_username, test_password);

        clickElement(By.linkText("Create"));
        clickElement(By.linkText("CDE"));
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText(testOrg);
        mustBeLoggedInAs(nlm_username, nlm_password);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("Org Admins"));

        clickElement(By.xpath("//span[contains(text(),'" + test_username + "')]/..//i[@title=\"Remove\"]"));
        textNotPresent(test_username);

    }

    @Test
    public void browseUsers() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.linkText("Users"));
        findElement(By.name("searchUsers")).sendKeys("cabig");
        clickElement(By.id("searchUsersSubmit"));

        Assert.assertEquals("cabigAdmin", findElement(By.id("user_username")).getText());
        Assert.assertEquals("[\"caBIG\"]", findElement(By.id("user_orgadmin")).getText());
        Assert.assertEquals(findElement(By.id("user_siteadmin")).getText(), "No");

        findElement(By.name("searchUsers")).clear();
        findElement(By.name("searchUsers")).sendKeys("nlm");
        clickElement(By.id("searchUsersSubmit"));

        textPresent("nlm", By.id("user_username"));
        Assert.assertEquals("nlm", findElement(By.id("user_username")).getText());
        Assert.assertEquals("[\"caBIG\",\"CTEP\",\"NINDS\",\"ACRIN\",\"PS&CC\",\"org / or Org\"]", findElement(By.id("user_orgadmin")).getText());
        Assert.assertEquals(findElement(By.id("user_siteadmin")).getText(), "Yes");
    }

}
