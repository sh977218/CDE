package gov.nih.nlm.quickBoard.cde;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ElasticShowPermissibleValueLessThanTen extends NlmCdeBaseTest {
    @Test
    public void elasticShowPermissibleValueLessThanTen() {
        String tinyId = "ymKeneM5_DB";
        goToSearch("cde");
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys(tinyId);
        hangon(0.5);
        clickElement(By.id("search.submit"));
        textPresent("(11 total) See full list in Detailed View");
    }

    @Test
    public void undefinedVersion() {
        driver.get(baseUrl + "/deView?tinyId=ymKeneM5_DB&version=");
        textPresent("Surgical Procedure Hand Laparoscopic Port Anatomic Site");
    }
}
