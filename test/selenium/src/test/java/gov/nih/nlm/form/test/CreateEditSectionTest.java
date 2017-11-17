package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateEditSectionTest extends QuestionTest {

    @Test
    public void createEditSection() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Section Test Form";

        goToFormByName(formName);
        goToFormDescription();

        addSectionTop("Section 1", null);
        addSectionBottom("Section 2", "2");
        addSectionBottom("Section 3", "F");
        closeAlert();
        String cdeName = "Race Category Text";
        addQuestionToSection(cdeName, 2);
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        scrollToInfiniteById("section_2");
        Assert.assertEquals("Section 1", findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[1]//*[contains(@class,'section_title')]")).getText());
        Assert.assertEquals("Section 2", findElement(By.xpath("//*[@id='section_1']/div/div[1]/div[1]//*[contains(@class,'section_title')]")).getText());
        Assert.assertEquals("Section 3", findElement(By.xpath("//*[@id='section_2']/div/div[1]/div[1]//*[contains(@class,'section_title')]")).getText());


        textNotPresent("Repeats", By.xpath("//*[@id='section_0']"));
        textPresent("Repeats: 2 times", By.xpath("//*[@id='section_1']"));
        textPresent("Repeats: over First Question", By.xpath("//*[@id='section_2']"));
    }

}
