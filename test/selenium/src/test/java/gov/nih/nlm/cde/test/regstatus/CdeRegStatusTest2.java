
package gov.nih.nlm.cde.test.regstatus;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CdeRegStatusTest2 extends CdeRegStatusTest {


    @Test
    public void nlmPromotesToStandard() {
        nlmPromotesToStandard("Axillary Surgery Dissection Date");
    }
    
    @Test
    public void removeStatusStatusFilter() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("browseOrg-PBTC")).click();
        textPresent("4 results for");
        String viewing = findElement(By.id("acc_link_0")).getText();
        findElement(By.id("eyeLink_0")).click();
        textPresent("More Like This");
        textPresent(viewing);
        findElement(By.xpath("//i[@id='editStatus']")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        waitForESUpdate();
        driver.navigate().back();
        showSearchFilters();
        hangon(1);
        findElement(By.id("li-blank-Preferred Standard")).click();
        textPresent("1 results for");
        clickElement(By.id("eyeLink_0"));
        textPresent("More Like This");
        textPresent(viewing);
        findElement(By.xpath("//i[@id='editStatus']")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        waitForESUpdate();
        driver.navigate().back();
        if (!findElement(By.id("li-blank-Standard")).isDisplayed()) {
            findElement(By.id("showHideFilters")).click();
        }
        goToCdeSearch();
        findElement(By.id("browseOrg-PBTC")).click();
        textPresent("4 results for");
    }
    
}
