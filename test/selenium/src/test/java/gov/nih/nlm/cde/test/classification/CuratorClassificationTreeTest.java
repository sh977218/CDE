package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.kohsuke.rngom.parse.host.Base;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CuratorClassificationTreeTest extends BaseClassificationTest {

    @Test
    public void curatorCantEditClassificationTree() {
        String org = "CTEP";
        mustBeLoggedInAs(ctepOnlyEditor, password);
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        textPresent("CRF_TTU");

        assertNoElt(By.xpath("//mat-icon[normalize-space() = 'subdirectory_arrow_left']"));
        assertNoElt(By.xpath("//mat-icon[normalize-space() = 'edit']"));
        assertNoElt(By.xpath("//mat-icon[normalize-space() = 'delete_outline']"));
        assertNoElt(By.xpath("//mat-icon[normalize-space() = 'transform']"));
    }

}
