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
        textPresent("TEST", By.xpath("//div[h2[contains(.,'Forms')]]//table"));
        textNotPresent("nindsCurator", By.xpath("//div[h2[contains(.,'Forms')]]//table"));
        clickElement(By.xpath("//div[h2[contains(.,'Forms')]]//mat-chip[contains(.,'CTEP')]/mat-icon"));
        clickElement(By.xpath("//div[h2[contains(.,'Forms')]]//mat-chip[contains(.,'PROMIS / Neuro-QOL')]/mat-icon"));
        clickElement(By.xpath("//div[h2[contains(.,'Forms')]]//mat-chip[contains(.,'TEST')]/mat-icon"));
        findElement(By.xpath("//div[h2[contains(.,'Forms')]]//mat-chip[contains(.,'NINDS')]"));
        textNotPresent("TEST", By.xpath("//div[h2[contains(.,'Forms')]]//table"));
        findElement(By.linkText("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)"));
        textPresent("nindsCurator");
    }


}
