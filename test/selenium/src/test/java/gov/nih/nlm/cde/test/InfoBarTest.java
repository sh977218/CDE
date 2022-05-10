package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class InfoBarTest extends NlmCdeBaseTest {

    @Test
    public void infoBarStatus() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSearch("cde");
        clickElement(By.id("browseOrg-caBIG"));
        Assert.assertEquals(driver.findElements(By.id("status_crumb")).size(), 0);
        clickElement(By.id("regstatus-Standard"));
        hangon(1);
        clickElement(By.id("regstatus-Qualified"));
        findElement(By.xpath("//*[contains(@class,'status_crumb')][contains(.,'Standard')]"));
        findElement(By.xpath("//*[contains(@class,'status_crumb')][contains(.,'Qualified')]"));
        hangon(1);
        assertSearchFilterSelected("regstatus-Qualified", true);
        clickElement(By.id("regstatus-Qualified"));
        hangon(1);
        assertNoElt(By.xpath("//*[contains(@class,'status_crumb')][contains(.,'Qualified')]"));
        findElement(By.xpath("//*[contains(@class,'status_crumb')][contains(.,'Standard')]"));
        clickElement(By.id("regstatus-Candidate"));
        findElement(By.xpath("//*[contains(@class,'status_crumb')][contains(.,'Standard')]"));
        findElement(By.xpath("//*[contains(@class,'status_crumb')][contains(.,'Candidate')]"));
        scrollToTop();
        clickElement(By.id("menu_cdes_link"));
        isSearchWelcome();
    }

}
