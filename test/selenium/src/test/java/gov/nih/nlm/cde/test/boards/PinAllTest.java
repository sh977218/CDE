package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllTest extends BoardTest {

    @Test
    public void pinAll() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeSearch();
        createBoard("Cerebral Palsy > Public Review", "CDEs to be use for Cerebral Palsy");
        goToCdeSearch();
        findElement(By.id("classifications-text-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-General (For all diseases)")).click();
        findElement(By.id("li-blank-Classification")).click();
        findElement(By.id("li-blank-Core")).click();
        hangon(2);
        int expectedSize = driver.findElements(By.cssSelector(".accordion-toggle")).size();
        findElement(By.id("pinAll")).click();
        findElement(By.linkText("Cerebral Palsy > Public Review")).click();
        modalGone();
        gotoMyBoards();
        findElement(By.xpath("//a[../dl/dd/div/div/span[contains(text(),'CDEs to be use for Cerebral Palsy')]]")).click();
        Assert.assertEquals(driver.findElements(By.xpath("//h4[@class=\"panel-title\"]")).size(), expectedSize);
        textPresent("Birth date");
        textPresent("Race USA category");
        textPresent("Ethnicity USA category");
        textPresent("Medical history condition text");
        textPresent("Medical history condition SNOMED CT code");
        textPresent("Gender Type");
    }

}
