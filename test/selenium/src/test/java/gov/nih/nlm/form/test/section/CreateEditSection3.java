package gov.nih.nlm.form.test.section;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateEditSection3 extends BaseFormTest {

    @Test
    public void createEditSection3() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Section Test Form3";

        goToFormByName(formName);
        goToFormDescription();

        addSectionBottom("Section 3", "F");

        goToFormByName(formName);
        goToFormDescription();
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 1"));
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_1']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 2"));
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_2']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 3"));

        textNotPresent("Repeats", By.xpath("//*[@id='section_0']"));
        textPresent("Repeats: 2 times", By.xpath("//*[@id='section_1']"));
        textPresent("Repeats: over First Question", By.xpath("//*[@id='section_2']"));
    }


}
