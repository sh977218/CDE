package gov.nih.nlm.cde.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeMergeMineMineTest extends NlmCdeBaseTest {
    @Test
    public void cdeMergeMineMine() {
        String cdeName1 = "Common Toxicity Criteria Adverse Event Colitis Grade";
        String cdeName2 = "Common Toxicity Criteria Adverse Event Hypophosphatemia Grade";
        mustBeLoggedInAs(ctepCurator_username, password);
        addToCompare(cdeName1, cdeName2);
        clickElement(By.id("openMergeDataElementModalBtn"));
        clickElement(By.id("selectAllMergeFieldsBtn"));
        clickElement(By.id("doMergeBtn"));
        textPresent("Retired", By.xpath("//*[@id='Status']//*[contains(@class,'noLeftPadding')]"));

        goToCdeByName(cdeName2);
        goToNaming();
        textPresent("Common Toxicity Criteria Adverse Event Colitis Grade");
        textPresent("CTC Adverse Event Colitis Gra");
        textPresent("Colitis Grade");
        goToIdentifiers();
        textPresent("2005490");
        goToProperties();
        textPresent("MyKey2");
        goToReferenceDocuments();
        textPresent("Colitis ref doc");
        goToClassification();
        textPresent("TEST");
        textPresent("NLM CDE Dev Team Test");
        textPresent("All Candidates");
        textPresent("caBIG");
    }
}
