package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ValueDomainId extends NlmCdeBaseTest {

    @Test
    public void valueDomainIdVisible() {
        mustBeLoggedInAs(testAdmin_username, password);
        String cdeName = "Gender Self-Identified";
        goToCdeByName(cdeName);
        findElement(By.id("pvs_tab")).click();
        textPresent("LOINC: LL3322-6, version: 2.52");
        textPresent("UMLS: C0563024, version: 2016_03_01");
    }
}