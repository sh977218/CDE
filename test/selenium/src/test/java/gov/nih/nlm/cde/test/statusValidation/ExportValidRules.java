package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ExportValidRules extends BaseClassificationTest {

    @Test
    public void exportValidRules(){
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeSearch();
        findElement(By.id("browseOrg-TEST")).click();
        textPresent("Incomplete");
        findElement(By.id("export")).click();
        findElement(By.id("exportValidRule")).click();
        findElement(By.id("selectStatus")).click();
        findElement(By.id("recorded")).click();
        findElement(By.id("exportVR")).click();
        textPresent("Distance from Closest Margin");
        textPresent("Neoadjuvant Therapy Specify");
    }
}
