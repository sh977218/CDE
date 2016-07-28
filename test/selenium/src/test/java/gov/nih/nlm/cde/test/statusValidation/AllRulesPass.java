package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AllRulesPass extends NlmCdeBaseTest {

    @Test
    public void allRulesPass() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        findElement(By.id("pinAll"));
        clickElement(By.id("export"));
        findElement(By.id("exportValidRule")).click();
        findElement(By.id("selectStatus")).click();
        findElement(By.id("recorded")).click();
        findElement(By.id("exportVR")).click();
        textPresent("All CDEs pass validation rules.");
    }

}
