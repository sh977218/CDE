package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class InfoBarTest extends NlmCdeBaseTest {
    
    @Test
    public void infoBarStatus() {
        setLowStatusesVisible();
        findElement(By.id("browseOrg-caBIG")).click();
        textPresent("| All Statuses");
        clickElement(By.id("li-blank-Standard"));
        hangon(1);
        clickElement(By.id("li-blank-Qualified"));
        textPresent("| Standard, Qualified");
        hangon(1);
        clickElement(By.id("li-checked-Qualified"));
        hangon(1);
        textNotPresent(", Qualified");
        textPresent("| Standard");
        clickElement(By.id("li-blank-Candidate"));
        textPresent( "| Standard, Candidate" );
        scrollToTop();
        findElement(By.id("menu_cdes_link")).click();
        textPresent( "Browse by Classification" );
    }
    
}
