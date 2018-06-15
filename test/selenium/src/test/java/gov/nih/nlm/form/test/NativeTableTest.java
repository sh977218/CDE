package gov.nih.nlm.form.test;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NativeTableTest extends BaseFormTest {

    @Test
    public void nativeTableMainTest() {
        String formName = "Form Table Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);

        textPresent("Patient Family Member Order Name", By.xpath("//thead//th[@rowspan='3']"));
        textPresent("Condition", By.xpath("//thead//th[@colspan='3']"));
        scrollTo(400);
        Assert.assertEquals(10, driver.findElements(By.xpath("//div[contains(@class,'native-table-cell')]/label/span[contains(text(),'1st Grade')]")).size());
        Assert.assertEquals(10, driver.findElements(By.xpath("//div[contains(@class,'native-table-cell')]/label[text()=' year']")).size());
        Assert.assertEquals(2, driver.findElements(By.xpath("//thead//th[@colspan='3']")).size());
        Assert.assertEquals(2, driver.findElements(By.xpath("//thead//th[text()='Education level']")).size());
        scrollTo(800);
        findElement(By.xpath("//div[contains(@class, 'native-table-cell')]/label[text()='2.']"));

        goToFormDescription();
        textPresent("Repeats: 5 times", By.xpath("//div[@id='section_0']//span[contains(@class,'badge-primary')]"));
        startEditSectionById("section_0");
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_label')]//i[contains(@class,'fa-edit')]"));
        setRepeat("section_0", "F");
        saveEditSectionById("section_0");
        textPresent("Repeats: over First Question", By.xpath("//div[@id='section_0']//span[contains(@class,'badge-primary')]"));

        startEditQuestionById("question_0-1-0");
        clickElement(By.xpath("//div[@id='question_0-1-0']//*[contains(@class,'multipleSelection')]/input"));

        goToPreview();
        findElement(By.xpath("//div[contains(@class,'native-table-cell')]/label[text()='Mother']"));
        findElement(By.xpath("//div[contains(@class,'native-table-cell')]//input[@type='checkbox']"));
    }
}
