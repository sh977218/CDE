package gov.nih.nlm.form.test.termMapping;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTermMappingAdd extends NlmCdeBaseTest{

    @Test
    public void addMapping() {
        mustBeLoggedInAs(nlm_username, nlm_password);

        goToFormByName("Written Verbal Fluency Test");
        clickElement(By.id("addTermMap"));
        findElement(By.id("mesh.search")).sendKeys("fingers");
        textPresent("D005385 -- Fingers");
        clickElement(By.id("addMeshDescButton"));
        clickElement(By.id("closeModal"));
        textPresent("Saved");
        closeAlert();
        textPresent("D005385 - Fingers");

        // check can't add dups
        clickElement(By.id("addTermMap"));
        findElement(By.id("mesh.search")).sendKeys("toes");
        textPresent("D014034 -- Toes");

        // verify it's disabled
        findElement(By.xpath("//button[@disabled and @id='addMeshDescButton']"));
        clickElement(By.id("closeModal"));
    }

}
