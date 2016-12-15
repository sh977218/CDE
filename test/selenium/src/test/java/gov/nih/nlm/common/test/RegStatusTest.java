package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

public abstract class RegStatusTest extends CommonTest {

    public void cancelRegStatus(String eltName, String user) {
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName);
        textPresent("Qualified");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Recorded");
        clickElement(By.id("cancelRegStatus"));
        modalGone();
        textPresent("Qualified", By.id("eltCurStatus"));
    }

    public void cantEditStatusIfPendingChanges(String eltName, String user) {
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName);
        textPresent("Qualified");
        clickElement(By.id("naming_tab"));
        clickElement(By.cssSelector("#dd_name_0 i.fa-edit"));
        findElement(By.cssSelector("#dd_name_0 input")).sendKeys("[name change number 1]");
        clickElement(By.cssSelector("#dd_name_0 .fa-check"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("editStatus")));
        clickElement(By.id("discardChanges"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("discardChanges")));
    }

    public void changeRegistrationStatus(String eltName, String user) {
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName);
        textPresent("Qualified");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Recorded");
        textPresent("Recorded elements are not visible by default");
        findElement(By.name("effectiveDate")).sendKeys("15-September-2013");
        findElement(By.name("untilDate")).sendKeys("31-October-2014");
        findElement(By.name("administrativeNote")).sendKeys("Admin Note 1");
        findElement(By.name("unresolvedIssue")).sendKeys("Unresolved Issue 1");
        clickElement(By.id("saveRegStatus"));
        textPresent("Saved");
        closeAlert();
        setLowStatusesVisible();
        try {
            goToEltByName(eltName);
        } catch (TimeoutException e) {
            goToEltByName(eltName);
        }
        textPresent("Recorded");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Recorded");
        textPresent("09/15/2013");
        textPresent("10/31/2014");
        textPresent("Admin Note 1");
        textPresent("Unresolved Issue 1");
    }

    public void retire(String eltName, String user) {
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName);
        textPresent("Qualified");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        textPresent("Retired elements are not returned in searches");
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        waitForESUpdate();
        goToEltSearch();
        findElement(By.name("q")).sendKeys("Alkaline");
        clickElement(By.id("search.submit"));
        hangon(3);
        Assert.assertTrue(!driver.findElement(By.id("resultList")).getText().contains(eltName));
    }

    public void nlmPromotesToStandard(String eltName) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToEltByName(eltName);
        textPresent("Qualified");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        textPresent("Standard elements cannot be edited by their stewards");
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        goToEltByName(eltName);
        textPresent("Standard");
    }


}
