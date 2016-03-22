package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class StripHtmlFromDefTest extends BaseClassificationTest {

    @Test
    public void stripHtmlFromDef() {
        goToFormSearch();
        findElement(By.id("browseOrg-TEST")).click();
        textPresent("Single-Question Screening Test - Self-Administered");
        textNotPresent("<b>");
        textNotPresent("<p>");
    }

}
