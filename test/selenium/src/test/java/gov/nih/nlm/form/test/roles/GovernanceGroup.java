package gov.nih.nlm.form.test.roles;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class GovernanceGroup extends NlmCdeBaseTest {

    @Test()
    public void governanceGroup() {
        mustBeLoggedInAs(governanceUser, password);

        goToCdeSearch();
        clickElement(By.id("browseOrg-ACRIN"));
        textPresent("Incomplete (");
        clickElement(By.xpath("//a[contains(.,'DCE-MRI Kinetics T1 Mapping Quality Type')]"));
        findElement(By.xpath("//h2[contains(.,'General Details')]"));
        assertNoElt(By.xpath("//cde-registration//button[contains(.,'Edit')]"));
        assertNoElt(By.xpath("//button[contains(.,'Add Name')]"));
        assertNoElt(By.xpath("//button[contains(.,'Upload more files')]"));
        goToDiscussArea();
        findElement(By.xpath("//cde-discuss-area//textarea"));
        findElement(By.xpath("//cde-discuss-area//button[contains(.,'Comment')]"));

        goToFormSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("Incomplete (");
        clickElement(By.xpath("//a[contains(.,'ALS Score Form')]"));
        findElement(By.xpath("//h2[contains(.,'General Details')]"));
        assertNoElt(By.xpath("//cde-registration//button[contains(.,'Edit')]"));
        assertNoElt(By.xpath("//button[contains(.,'Add Name')]"));
        assertNoElt(By.xpath("//button[contains(.,'Upload more files')]"));
        goToDiscussArea();
        findElement(By.xpath("//cde-discuss-area//textarea"));
        findElement(By.xpath("//cde-discuss-area//button[contains(.,'Comment')]"));
    }
}
