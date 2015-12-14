package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SiteAdminTest extends NlmCdeBaseTest {

    private void refreshOrganizationsTabScreen() {
        driver.navigate().refresh();
        findElement(By.linkText("Organizations")).click();
    }

//    private void removeOrg(String orgName) {
//        findElement(By.linkText("Account")).click();
//        findElement(By.linkText("Site Management")).click();
//        findElement(By.linkText("Organizations")).click();
//
//        int length = driver.findElements(By.xpath("//i[contains(@id,'removeOrg-')]")).size();
//        for (int i = 0; i < length; i++) {
//            String name = findElement(By.id("orgName-" + i)).getText();
//            if (orgName.equals(name)) {
//                findElement(By.id("removeOrg-" + i)).click();
//                i = length;
//            }
//        }
//
//        Assert.assertTrue(textPresent("Org Removed"));
//        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(orgName) < 0);
//    }

    @Test
    public void addOrg() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String testOrg = "New Test Org";
        addOrg(testOrg, null, null);

        String testOrgName = "New Test Org 2";
        String testOrgLongName = "New Test Org 2 Long Name 2";
        addOrg(testOrgName, testOrgLongName, null);
    }

    @Test
    public void renameOrg() {
        mustBeLoggedInAs(nlm_username, nlm_password);
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
        findElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//input")).sendKeys(testOrgRenamed);
        findElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//button[contains(text(),'Confirm')]")).click();
        closeAlert();

        scrollToViewById("orgMailAddress-" + testOrg);
        clickElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//input")).sendKeys(testOrgMailingAddress);
        findElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//button[contains(text(),'Confirm')]")).click();
        closeAlert();

        scrollToViewById("orgEmailAddress-" + testOrg);
        clickElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//input")).sendKeys(testOrgEmailingAddress);
        findElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//button[contains(text(),'Confirm')]")).click();
        closeAlert();

        scrollToViewById("orgPhoneNumber-" + testOrg);
        clickElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//i[@class='fa fa-edit']"));
        findElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//input")).sendKeys(testOrgPhoneNumber);
        findElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//button[contains(text(),'Confirm')]")).click();
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
        findElement(By.xpath("//div[@id = 'orgLongName-" + testOrg + "']//button[text() = ' Discard']")).click();

        findElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//input")).sendKeys(testOrgMailingAddressNotRenamed);
        findElement(By.xpath("//div[@id = 'orgMailAddress-" + testOrg + "']//button[text() = ' Discard']")).click();

        findElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//input")).sendKeys(testOrgEmailingAddressNotRenamed);
        findElement(By.xpath("//div[@id = 'orgEmailAddress-" + testOrg + "']//button[text() = ' Discard']")).click();

        findElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//input")).sendKeys(testOrgPhoneNumberNotRenamed);
        findElement(By.xpath("//div[@id = 'orgPhoneNumber-" + testOrg + "']//button[text() = ' Discard']")).click();

        findElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//input")).sendKeys(testOrgUriNotRenamed);
        findElement(By.xpath("//div[@id = 'orgUri-" + testOrg + "']//button[text() = ' Discard']")).click();

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
        mustBeLoggedInAs(nlm_username, nlm_password);
        String testOrg = "Promote Org Test";

        addOrg(testOrg, null, null);

        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Org Admins")).click();
        new Select(driver.findElement(By.id("newOrgAdminOrgName"))).selectByVisibleText(testOrg);
        findElement(By.id("newOrgAdminUsername")).sendKeys(test_username);
        findElement(By.id("newOrgAdminSubmit")).click();

        logout();
        loginAs(test_username, test_password);

        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText(testOrg);
        mustBeLoggedInAs(nlm_username, nlm_password);

        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Org Admins")).click();

        findElement(By.xpath("//span[text() = '" + test_username + "' ]/..//i[@title=\"Remove\"]")).click();
        textNotPresent(test_username);

    }

    @Test
    public void browseUsers() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Users")).click();
        findElement(By.name("searchUsers")).sendKeys("cabig");
        findElement(By.id("searchUsersSubmit")).click();

        Assert.assertEquals("cabigAdmin", findElement(By.id("user_username")).getText());
        Assert.assertEquals("[\"caBIG\"]", findElement(By.id("user_orgadmin")).getText());
        Assert.assertEquals(findElement(By.id("user_siteadmin")).getText(), "No");

        findElement(By.name("searchUsers")).clear();
        findElement(By.name("searchUsers")).sendKeys("nlm");
        findElement(By.id("searchUsersSubmit")).click();

        textPresent("nlm", By.id("user_username"));
        Assert.assertEquals("nlm", findElement(By.id("user_username")).getText());
        Assert.assertEquals("[\"caBIG\",\"CTEP\",\"NINDS\",\"ACRIN\",\"PS&CC\",\"org / or Org\"]", findElement(By.id("user_orgadmin")).getText());
        Assert.assertEquals(findElement(By.id("user_siteadmin")).getText(), "Yes");
    }

}
