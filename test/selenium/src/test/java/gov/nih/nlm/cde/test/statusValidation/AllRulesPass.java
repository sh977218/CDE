package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AllRulesPass extends NlmCdeBaseTest {

    @Test
    public void allRulesPass() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-caBIG"));
        findElement(By.id("pinAll"));
        clickElement(By.id("export"));
        clickElement(By.id("exportValidRule"));
        findElement(By.id("selectStatus")).click();
        clickElement(By.xpath("//span[. = 'Recorded']"));
        textPresent("Recorded");
        clickElement(By.id("exportVR"));
        textPresent("All CDEs pass validation rules.");
    }

}
