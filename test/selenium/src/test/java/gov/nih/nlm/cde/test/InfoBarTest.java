package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class InfoBarTest extends NlmCdeBaseTest {

    @Test
    public void infoBarStatus() {
        setLowStatusesVisible();
        clickElement(By.id("browseOrg-caBIG"));
        textPresent("All Statuses", By.id("status_crumb"));
        clickElement(By.id("li-blank-Standard"));
        hangon(1);
        clickElement(By.id("li-blank-Qualified"));
        textPresent("Standard, Qualified", By.id("status_crumb"));
        hangon(1);
        clickElement(By.id("li-checked-Qualified"));
        hangon(1);
        textNotPresent("Qualified", By.id("status_crumb"));
        textPresent("Standard", By.id("status_crumb"));
        clickElement(By.id("li-blank-Candidate"));
        textPresent("Standard, Candidate", By.id("status_crumb"));
        scrollToTop();
        clickElement(By.id("menu_cdes_link"));
        textPresent("Browse by Classification");
    }

}
