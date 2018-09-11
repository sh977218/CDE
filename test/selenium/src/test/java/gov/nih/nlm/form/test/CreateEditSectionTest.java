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

        System.out.println("1");

        goToFormByName(formName);
        System.out.println("2");
        goToFormDescription();
        System.out.println("3");

        addSectionTop("Section 1", null);
        System.out.println("4");
        addSectionBottom("Section 2", "2");
        System.out.println("5");
        addSectionBottom("Section 3", "F");
        System.out.println("6");
        closeAlert();
        System.out.println("7");

        addQuestionToSection(cdeName, 2);
        System.out.println("8");
        newFormVersion();
        System.out.println("9");

        goToFormByName(formName);
        goToFormDescription();
        scrollToInfiniteById("section_2");
        System.out.println("10");
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 1"));
        System.out.println("11");
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_1']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 2"));
        System.out.println("12");
        Assert.assertTrue(findElement(By.xpath("//*[@id='section_2']/div/div[1]/div[1]//*[contains(@class,'sectionTitle')]")).getText().contains("Section 3"));
        System.out.println("13");

        textNotPresent("Repeats", By.xpath("//*[@id='section_0']"));
        System.out.println("14");
        textPresent("Repeats: 2 times", By.xpath("//*[@id='section_1']"));
        textPresent("Repeats: over First Question", By.xpath("//*[@id='section_2']"));
    }

}
