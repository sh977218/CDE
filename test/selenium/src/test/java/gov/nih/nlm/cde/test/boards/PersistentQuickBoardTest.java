package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PersistentQuickBoardTest extends NlmCdeBaseTest {

    @Test
    public void quickBoardSurvivesPageRefresh() {
        String eltName = "Concomitant Agent Usage End Date";
        openCdeInList(eltName);
        clickElement(By.id("addToCompare_0"));
        driver.get(baseUrl);
        clickElement(By.linkText("Quick Board ( 1 )"));
        textPresent(eltName);
    }

}
