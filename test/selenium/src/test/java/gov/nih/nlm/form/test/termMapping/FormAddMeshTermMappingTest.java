package gov.nih.nlm.form.test.termMapping;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddMeshTermMappingTest extends NlmCdeBaseTest {

    @Test
    public void formAddMeshTermMapping() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Written Verbal Fluency Test");
        goToGeneralDetail();
        clickElement(By.id("addTermMap"));
        findElement(By.id("mesh.search")).sendKeys("fingers");
        textPresent("D005385 -- Fingers");
        clickElement(By.id("addMeshDescButton"));
        clickElement(By.id("closeModal"));
        checkAlert("Saved");
        textPresent("D005385 - Fingers");

        // check can't add dups
        clickElement(By.id("addTermMap"));
        findElement(By.id("mesh.search")).sendKeys("toes");
        textPresent("D014034 -- Toes");
        findElement(By.id("mesh.search")).clear();
        findElement(By.id("mesh.search")).sendKeys("fingers");
        textPresent("D005385 -- Fingers");

        // verify it's disabled
        findElement(By.xpath("//button[@disabled and @id='addMeshDescButton']"));
        clickElement(By.id("closeModal"));
    }

}
