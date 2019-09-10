package gov.nih.nlm.quickBoard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PersistentQuickBoardTest extends NlmCdeBaseTest {

    @Test
    public void quickBoardSurvivesPageRefresh() {
        String eltName = "Concomitant Agent Usage End Date";
        openCdeInList(eltName);
        clickElement(By.id("addToCompare_0"));
        closeAlert();
        clickElement(By.id("boardsMenu"));
        clickElement(By.linkText("Quick Board (1)"));
        driver.get(baseUrl);
        clickElement(By.id("boardsMenu"));
        clickElement(By.linkText("Quick Board (1)"));
        textPresent(eltName);
    }

}
