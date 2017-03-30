package gov.nih.nlm.form.test;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NativeTableTest extends BaseFormTest {

    @Test
    public void nativeTableMainTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String formName = "Form Table Test";
        goToFormByName(formName);

        textPresent("Patient Family Member Order Name", By.xpath("//thead//th[@rowspan='3']"));
        textPresent("Condition", By.xpath("//thead//th[@colspan='3']"));
        Assert.assertEquals(driver.findElements(By.xpath("//thead//th[@colspan='3']")).size(), 2);
        Assert.assertEquals(driver.findElements(By.xpath("//thead//th[@ng-reflect-text-content='Education level']")).size(), 2);
        findElement(By.xpath("//div[@class='native-table-cell']/label[@ng-reflect-text-content='2.']"));
        findElement(By.xpath("//div[contains(@class,'native-table-cell')]/label/span[contains(@ng-reflect-text-content,'1st Grade')]"));
        findElement(By.xpath("//div[contains(@class,'native-table-cell')]/label[text()=' year']"));

        clickElement(By.id("description_tab"));
        textPresent("Repeats: 5 times", By.xpath("//div[@id='section_0']//span[contains(@class,'label-primary')]"));
        startEditQuestionSectionById("section_0");
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_title')]//i[contains(@class,'fa-edit')]"));
        setRepeat("section_0", "F");
        saveEditQuestionSectionById("section_0");
        textPresent("Repeats: over First Question", By.xpath("//div[@id='section_0']//span[contains(@class,'label-primary')]"));

        clickElement(By.id("general_tab"));
        findElement(By.xpath("//div[@class='native-table-cell']/label[@ng-reflect-text-content='Mother']"));
    }
}
