package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RecursiveForm extends NlmCdeBaseTest {

    @Test
    public void recursiveForm () {
        goToFormByName("Recursive Form");
        findElement(By.xpath("//h4[. = 'Recursive Form']"));
        Assert.assertEquals(findElements(By.xpath("//h4[. = 'Recursive Form']")).size(), 1);
    }
}
