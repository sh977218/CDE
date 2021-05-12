package gov.nih.nlm.form.test.section;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateEditSection3 extends BaseFormTest {

    @Test
    public void createEditSection3() {
        mustBeLoggedInAs(testEditor_username, password);
        String formName = "Section Test Form3";

        goToFormByName(formName);
        goToFormDescription();
        String section1 = findElement(By.xpath("//*[@id='innerForm_label_edit_icon_Section 1']")).getText();
        Assert.assertEquals(section1, "Section 1");
        String section2 = findElement(By.xpath("//*[@id='innerForm_label_edit_icon_Section 2']")).getText();
        Assert.assertEquals(section2, "Section 2");

        addSectionBottom("Section 3", "F");
        String section3 = findElement(By.xpath("//*[@id='innerForm_label_edit_icon_Section 3']")).getText();
        Assert.assertEquals(section3, "Section 3");

        textPresent("Repeats: over First Question", By.xpath("//*[@id='section_2']"));
    }


}
