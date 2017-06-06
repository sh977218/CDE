package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeTruncateRichPropertiesTest extends NlmCdeBaseTest {

    @Test
    public void cdeTruncateRichPropertiesTest() {
        String cdeName = "Skull fracture morphology findings type";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("properties_tab"));

        clickElement(By.xpath("//*[@id='value_2']//*[contains(@class,'fa-edit')]"));
        clickElement(By.xpath("//*[@id='value_2']//button[contains(text(),'Rich Text')]"));
        hangon(2);
        clickElement(By.xpath("//*[@id='value_2']//*[contains(@class,'fa-check')]"));
        textNotPresent("Confirm");

        scrollToViewById("openNewPropertyModalBtn");
        clickElement(By.xpath("//*[@id='value_2']/descendant::span[text()='More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
        textNotPresent("More", By.xpath("//*[@id='value_2']"));
    }
}
