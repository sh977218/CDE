package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CompareTest extends NlmCdeBaseTest {

    @Test
    public void noElementCompareList() {
        mustBeLoggedOut();
        goToCdeSearch();
        findElement(By.linkText("Quick Board ( empty )")).click();
        textPresent("The quick board is empty.");
    }
    
    @Test
    public void emptyList() {
        goToCdeSearch();
        openCdeInList("Sedation status");
        findElement(By.id("compare_0")).click();
        textPresent("Quick Board ( 1 )");      
    }
    
    @Test
    public void compare2Elements() {
        goToCdeSearch();
        addToCompare("Person Gender Text Type", "Patient Gender Category");
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-valid")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-warning")));
        textNotPresent("VSAC Value Set");
    }
    
    @Test
    public void compare3Then2Elements() {
        resizeWindow(1524, 1150);

        String cde1 = "Assessment of Motor and Process Skills Assessment Complete Indicator";
        String cde2 = "EuroQOL Complete Indicator";
        String cde3 = "Administration Route of Administration java.lang.String";
        
        goToCdeSearch();
        addToQuickBoard(cde1);
        addToQuickBoard(cde2);
        addToQuickBoard(cde3);
        findElement(By.linkText("Quick Board ( 3 )")).click();
        textPresent(cde1);
        textPresent(cde2);
        textPresent(cde3);
        findElement(By.id("qb.compare")).click();
        textPresent("You may only compare 2 CDEs side by side.");
        closeAlert();
        findElement(By.id("remove_2")).click();
        
        findElement(By.id("qb.compare")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-warning")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-valid")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-6-valid")));
        textPresent("an observational assessment that is used to measure");        
        textPresent("pain/discomfort, and anxiety/depression");
    }
    
}
