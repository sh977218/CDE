package gov.nih.nlm.cde.test.statusValidation;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class ExportValidRules extends BaseClassificationTest {

    private void doTheThing() {
        goToCdeSearch();
        findElement(By.id("browseOrg-TEST")).click();
        textPresent("Incomplete");
        findElement(By.id("export")).click();

        // this ugly hack because cdk overlay prevents click()
        Actions builder = new Actions(driver);
        builder.moveToElement(findElement(By.id("exportValidRule")), 5, 5).click().perform();

        findElement(By.id("selectStatus")).click();
        findElement(By.xpath("//span[. = 'Recorded']")).click();
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
