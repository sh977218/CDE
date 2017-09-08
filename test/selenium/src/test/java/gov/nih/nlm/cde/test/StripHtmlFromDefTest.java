package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class StripHtmlFromDefTest extends BaseClassificationTest {

    @Test
    public void stripHtmlFromDef() {
        goToFormSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("Form Def HTML");
        textNotPresent("<uvwxyz>");
        textNotPresent("</uvwxyz>");
    }

}
