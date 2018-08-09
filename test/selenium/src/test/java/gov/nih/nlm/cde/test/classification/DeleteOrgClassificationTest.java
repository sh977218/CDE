package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class DeleteOrgClassificationTest extends NlmCdeBaseTest {

    @Test
    public void deleteOrgClassification() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        deleteOrgClassification(org, new String[]{"_a", "_a_a"});
        textNotPresent("_a_a_a");
    }

}
