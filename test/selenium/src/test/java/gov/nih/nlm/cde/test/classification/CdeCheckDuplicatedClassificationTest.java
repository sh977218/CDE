package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeCheckDuplicatedClassificationTest extends NlmCdeBaseTest {

    @Test
    public void checkDuplicatesClassification() {
        String cdeName = "Product Problem Discover Performed Observation Outcome Identifier ISO21090.II.v1.0";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("classification_tab"));
        textNotPresent("Disease");
        addClassificationByTree("NINDS", new String[]{"Disease"});
        addExistingClassification("NINDS", new String[]{"Disease"});
    }
}
