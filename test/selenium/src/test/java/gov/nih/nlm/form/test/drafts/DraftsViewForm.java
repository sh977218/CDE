package gov.nih.nlm.form.test.drafts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DraftsViewForm extends NlmCdeBaseTest {

    @Test
    public void draftsViewForm() {
        mustBeLoggedInAs("nindsCurator", password);
        goToMyDrafts();
        findElement(By.linkText("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)"));
        textPresent("Q1MfMySSFe");

        logout();
        mustBeLoggedInAs(ninds_username, password);
        goToMyDrafts();
        textNotPresent("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)");

        goToMyOrgDrafts();
        findElement(By.linkText("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)"));
        textPresent("nindsCurator");

        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToMyDrafts();
        textNotPresent("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)");

        goToAllDrafts();
        textPresent("TEST", By.id("settingsContent"));
        textNotPresent("nindsCurator", By.id("settingsContent"));
        clickElement(By.id("organizationFilter"));
        selectMatSelectDropdownByText("CTEP");

        textNotPresent("TEST", By.xpath("NINDS"));
        findElement(By.linkText("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)"));
        textPresent("nindsCurator");
    }


}
