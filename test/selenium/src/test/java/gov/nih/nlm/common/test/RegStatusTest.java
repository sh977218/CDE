package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

public abstract class RegStatusTest extends CommonTest {

    public void retire(String eltName, String user) {
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName);
        goToGeneralDetail();
        textPresent("Qualified");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("newRegistrationStatus"))).selectByVisibleText("Retired");
        textPresent("Retired elements are not returned in searches");
        clickElement(By.id("saveRegStatus"));
        version();
        waitForESUpdate();
        goToEltSearch();
        findElement(By.name("q")).sendKeys("Alkaline");
        clickElement(By.id("search.submit"));
        hangon(3);
        Assert.assertTrue(!driver.findElement(By.id("resultList")).getText().contains(eltName));
    }


    public void retireForm(String eltName, String user) {
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName);
        goToGeneralDetailForm();
        textPresent("Qualified");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("newRegistrationStatus"))).selectByVisibleText("Retired");
        textPresent("Retired elements are not returned in searches");
        clickElement(By.id("saveRegStatus"));
        version();
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
        goToGeneralDetail();
        textPresent("Qualified");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("newRegistrationStatus"))).selectByVisibleText("Standard");
        textPresent("Standard elements cannot be edited by their stewards");
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        goToEltByName(eltName);
        goToGeneralDetail();
        textPresent("Standard");
    }

    public void nlmPromotesToStandardForm(String eltName) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToEltByName(eltName);
        goToGeneralDetailForm();
        textPresent("Qualified");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("newRegistrationStatus"))).selectByVisibleText("Standard");
        textPresent("Standard elements cannot be edited by their stewards");
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        goToEltByName(eltName);
        goToGeneralDetailForm();
        textPresent("Standard");
    }

    public void version() {
        newCdeVersion();
    }


}
