package gov.nih.nlm.form.test.drafts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DraftsViewForm extends NlmCdeBaseTest {

    @Test
    public void draftsViewForm() {
        mustBeLoggedInAs("nindsCurator", password);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        findElement(By.linkText("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)"));
        textPresent("Q1MfMySSFe");

        logout();
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        textNotPresent("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)");

        clickElement(By.id("username_link"));
        clickElement(By.id("user_account_management"));
        clickElement(By.xpath("/div[. = 'Drafts']"));
        findElement(By.linkText("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)"));
        textPresent("nindsCurator");

        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        textNotPresent("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)");

        clickElement(By.id("username_link"));
        clickElement(By.id("user_site_management"));
        clickElement(By.xpath("/div[. = 'Drafts']"));
        findElement(By.linkText("Center for Neurologic Study - Lability Scale for pseudobulbar affect (PBA)"));
        textPresent("nindsCurator");
    }


}
