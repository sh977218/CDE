package gov.nih.nlm.form.test.drafts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DraftsViewForm extends NlmCdeBaseTest {

    @Test
    public void draftsViewForm() {
        String nindsDraftName = "Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)";
        String ctepDraftName = "Draft Form Test";

        mustBeLoggedInAs(ninds_username, password);
        goToMyDrafts();
        textNotPresent(nindsDraftName);

        mustBeLoggedInAs(nindsCurator_username, password);
        goToMyDrafts();
        findElement(By.linkText(nindsDraftName));
        textPresent("Q1MfMySSFe");

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToMyDrafts();
        textNotPresent(nindsDraftName);

        goToAllDrafts();
        textPresent(nindsDraftName, By.id("settingsContent"));
        textPresent(ctepDraftName, By.id("settingsContent"));

        nonNativeSelect("", "Filter by Organization", "CTEP");
        textNotPresent(nindsDraftName, By.id("settingsContent"));

        nonNativeSelect("", "Filter by Organization", "NINDS");
        textNotPresent(ctepDraftName, By.id("settingsContent"));

        nonNativeSelect("", "Filter by Organization", "All Organizations");
        textPresent(ctepDraftName, By.id("settingsContent"));
        textPresent(nindsDraftName, By.id("settingsContent"));
    }


}
