package gov.nih.nlm.form.test.section;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateEditSection extends BaseFormTest {

    @Test
    public void createEditSection() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Section Test Form";

        goToFormByName(formName);
        goToFormDescription();

        addSectionTop("Section 1");
        saveFormEdit();
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 1"));

        textNotPresent("Repeats", By.xpath("//*[@id='section_0']"));
    }

}
