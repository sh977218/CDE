package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class InfoBarTest extends NlmCdeBaseTest {

    public void infoBarClassification() {
        goToCdeSearch();
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Amyotrophic Lateral Sclerosis")).click();
        findElement(By.id("li-blank-Classification"));
        findElement(By.id("li-blank-Core"));
        textPresent( "NINDS > Disease > Amyotrophic Lateral Sclerosis > Classification > Core" );
        findElement(By.id("resetSearch")).click();
        textPresent( "All Classifications" );
    }
    
    @Test
    public void infoBarStatus() {
        setLowStatusesVisible();
        findElement(By.id("browseOrg-caBIG")).click();
        textPresent("| All Statuses");
        findElement(By.id("li-blank-Standard")).click();
        hangon(1);
        findElement(By.id("li-blank-Qualified")).click();
        textPresent("| Standard, Qualified");
        hangon(1);
        findElement(By.id("li-checked-Qualified")).click();
        hangon(1);
        textNotPresent(", Qualified");
        textPresent("| Standard");
        findElement(By.id("li-blank-Candidate")).click();
        textPresent( "| Standard, Candidate" );
        scrollToTop();
        findElement(By.id("menu_cdes_link")).click();
        textPresent( "Browse by organization" );
    }
    
}
