package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CodesFromNCI extends NlmCdeBaseTest {

    @Test
    public void codesFromNCI() {
        goToCdeByName("Race Category Text");
        clickElement(By.id("pvs_tab"));
        clickElement(By.id("displayNCICodes"));
        textPresent("American Indian or Alaska Native", By.id("nameAsNCI-0"));
        textPresent("C41259", By.id("codeAsNCI-0"));
        clickElement(By.id("displayUMLSCodes"));
        textPresent("American Indian or Alaska Native", By.id("nameAsUMLS-0"));
        textPresent("C1515945", By.id("codeAsUMLS-0"));
        Assert.assBy.id("displayLNCCodes");

    }

}
