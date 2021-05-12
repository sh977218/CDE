package gov.nih.nlm.cde.test.drafts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DraftsViewCde extends NlmCdeBaseTest {

    @Test
    public void draftsViewCde() {
        mustBeLoggedInAs(ctepOnlyCurator, password);
        goToMyDrafts();
        findElement(By.linkText("Person Elevated Urine Protein Measurement Clinical Trial Eligibility Criteria Yes No Indicator"));
        textPresent("HrVtaZ7EtxQ");
        logout();

        mustBeLoggedInAs("ctepAdmin", password);
        goToMyDrafts();
        textNotPresent("Person Elevated Urine");

        goToMyOrgDrafts();
        findElement(By.linkText("Person Elevated Urine Protein Measurement Clinical Trial Eligibility Criteria Yes No Indicator"));
        textPresent(ctepOnlyCurator);
        logout();

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToMyDrafts();
        textNotPresent("Person Elevated Uring");
        goToAllDrafts();
        findElement(By.linkText("Person Elevated Urine Protein Measurement Clinical Trial Eligibility Criteria Yes No Indicator"));
        textPresent(ctepOnlyCurator);
    }

}
