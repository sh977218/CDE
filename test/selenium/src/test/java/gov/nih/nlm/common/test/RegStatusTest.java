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
        editRegistrationStatus("Retired", null, null, null, null);
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
        goToGeneralDetail();
        textPresent("Qualified");
        editRegistrationStatus("Retired", null, null, null, null);
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
        editRegistrationStatus("Standard", null, null, null, null);
        closeAlert();
        goToEltByName(eltName);
        goToGeneralDetail();
        textPresent("Standard");
    }

    public void nlmPromotesToStandardForm(String eltName) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToEltByName(eltName);
        goToGeneralDetail();
        textPresent("Qualified");
        editRegistrationStatus("Standard", null, null, null, null);
        closeAlert();
        goToEltByName(eltName);
        goToGeneralDetail();
        textPresent("Standard");
    }

    public void version() {
        newCdeVersion();
    }


}
