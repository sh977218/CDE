package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateEditSectionTest extends QuestionTest {

    @Test
    public void createEditSection() {
        mustBeLoggedInAs(testAdmin_username, password);
        String cdeName = "Race Category Text";
        String formName = "Section Test Form";

        goToFormByName(formName);
        goToFormDescription();

        addSectionTop("Section 1", null);
        addSectionBottom("Section 2", "2");
        addSectionBottom("Section 3", "F");
        closeAlert();

        addQuestionToSection(cdeName, 2);
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        scrollToInfiniteById("section_2");
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 1"));
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_1']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 2"));
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_2']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 3"));

        textNotPresent("Repeats", By.xpath("//*[@id='section_0']"));
        textPresent("Repeats: 2 times", By.xpath("//*[@id='section_1']"));
        textPresent("Repeats: over First Question", By.xpath("//*[@id='section_2']"));
    }

}
