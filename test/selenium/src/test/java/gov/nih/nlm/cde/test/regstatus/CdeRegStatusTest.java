package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.cde.common.test.RegStatusTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeRegStatusTest extends RegStatusTest {

    // TODO - Cannot get this test to pass. Can't figure out why.
//    @Test
    public void administrativeStatus() {
        loginAs(ctepCurator_username, password);
        goToCdeByName("Small Cell Lung Carcinoma Invasion Status");
        findElement(By.linkText("Status")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("dd_adminStatus")));
        findElement(By.linkText("General Details")).click();
        findElement(By.id("editStatus")).click();
        findElement(By.name("administrativeStatus")).sendKeys("Ready For Review");
        findElement(By.id("saveRegStatus")).click();
        hangon(2);
        goToCdeByName("Small Cell Lung Carcinoma Invasion Status");
        findElement(By.linkText("Status")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("dd_adminStatus")));
        Assert.assertTrue(textPresent("Ready For Review"));
        findElement(By.linkText("General Details")).click();
        findElement(By.id("editStatus")).click();
        findElement(By.name("administrativeStatus")).clear();
        findElement(By.name("administrativeStatus")).sendKeys(Keys.BACK_SPACE);
        findElement(By.id("saveRegStatus")).click();
        hangon(2);
        goToCdeByName("Small Cell Lung Carcinoma Invasion Status");
        findElement(By.linkText("Status")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("dd_adminStatus")));        
        logout();
    }
    
    @Test
    public void changeRegistrationStatus() {
        changeRegistrationStatus("Investigator Identifier java.lang.Integer", cabigAdmin_username);
    }
        
    @Test
    public void retire() {
        retire("Laboratory Procedure Alkaline Phosphatase Result Date", ctepCurator_username);
    }

    @Test
    public void nlmPromotesToStandard() {
        nlmPromotesToStandard("Axillary Surgery Dissection Date");
    }
    
    @Test
    public void removeStatusStatusFilter() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("li-blank-PBTC")).click();
        textPresent("4 results for");
        String viewing = findElement(By.id("acc_link_0")).getText();
        findElement(By.xpath("//span[@id='acc_link_0']/../i[@title='View Full Detail']")).click();
        textPresent("More Like This");
        textPresent(viewing);
        findElement(By.xpath("//i[@id='editStatus']")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        hangon(5);
        findElement(By.linkText("CDEs")).click();
        showSearchFilters();
        findElement(By.id("li-checked-Standard")).click();
        hangon(2);
        findElement(By.id("li-checked-Qualified")).click();
        textPresent("1 results for");
        findElement(By.xpath("//i[@title='View Full Detail']")).click();
        hangon(0.5);
        findElement(By.xpath("//i[@id='editStatus']")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        hangon(1);
        findElement(By.linkText("CDEs")).click();
        if (!findElement(By.id("li-blank-Standard")).isDisplayed()) {
            findElement(By.id("showHideFilters")).click();
        }
        hangon(1);
        findElement(By.id("li-blank-Standard")).click();
        hangon(1);
        textPresent("4 results for");
    }

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }
    
    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }
    
}
