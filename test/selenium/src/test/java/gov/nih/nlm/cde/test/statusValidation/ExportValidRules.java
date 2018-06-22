package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ExportValidRules extends BaseClassificationTest {

    private void doTheThing() {
        goToCdeSearch();
        findElement(By.id("browseOrg-TEST")).click();
        textPresent("Incomplete");
        findElement(By.id("export")).click();
        findElement(By.id("exportValidRule")).click();
        findElement(By.id("selectStatus")).click();
        findElement(By.id("recorded")).click();
        findElement(By.id("exportVR")).click();
    }

    @Test
    public void exportValidRules(){
        mustBeLoggedInAs(testAdmin_username, password);

        doTheThing();
        
        // if it fails here, it's because there is another export in progress and we see :
        // "the server is too busy ...". Where's docker when you need it?
        try {
            textPresent("Distance from Closest Margin");
            textPresent("Neoadjuvant Therapy Specify");
        } catch (Exception e) {
            doTheThing();
            textPresent("Distance from Closest Margin");
            textPresent("Neoadjuvant Therapy Specify");
        }
    }

}
