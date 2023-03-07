package gov.nih.nlm.form.test.render;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NativeTableTest extends BaseFormTest {

    @Test
    public void nativeTableTest() {
        String formName = "Form Table Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);

        textPresent("Patient Family Member Order Name", By.xpath("//thead//th[@rowspan='4']"));
        textPresent("Condition", By.xpath("//thead//th[@colspan='3']"));
        scrollTo(400);
        Assert.assertEquals(driver.findElements(By.xpath("//div[contains(@class,'native-table-cell')]/label/span[contains(text(),'1st Grade')]")).size(), 10);
        Assert.assertEquals(driver.findElements(By.xpath("//div[contains(@class,'native-table-cell')]/label[text()=' year']")).size(), 10);
        Assert.assertEquals(driver.findElements(By.xpath("//thead//th[@colspan='3']")).size(), 2);
        Assert.assertEquals(driver.findElements(By.xpath("//thead//th[text()='Education level']")).size(), 2);
        scrollTo(800);
        findElement(By.xpath("//div[contains(@class, 'native-table-cell')]/label[text()='2.']"));

        goToFormDescription();
        textPresent("Repeats: 5 times", By.cssSelector("#section_0 > .card > .card-header"));
        startEditSectionById("section_0");
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_label')]//mat-icon[normalize-space() = 'edit']"));
        setRepeat("section_0", "F");
        saveEditSectionById("section_0");
        textPresent("Repeats: over First Question", By.cssSelector("#section_0 > .card > .card-header"));

        startEditQuestionById("question_0-1-0");
        clickElement(By.xpath("//div[@id='question_0-1-0']//*[contains(@class,'multipleSelection')]/input"));
        saveFormEdit();
        findElement(By.xpath("//div[contains(@class,'native-table-cell')]/label[text()='Mother']"));
        findElement(By.xpath("//div[contains(@class,'native-table-cell')]//input[@type='checkbox']"));

        goToFormDescription();
        textPresent("Repeats: over First Question", By.cssSelector("#section_0 > .card > .card-header"));
        startEditSectionById("section_0");
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_label')]//mat-icon[normalize-space() = 'edit']"));
        setRepeat("section_0", "");
        saveEditSectionById("section_0");
        textNotPresent("Repeats:", By.cssSelector("#section_0 > .card > .card-header"));

        textPresent("Repeats: 2 times", By.cssSelector("#section_0-1 > .card > .card-header"));
        startEditSectionById("section_0-1");
        clickElement(By.xpath("//*[@id='section_0-1']//*[contains(@class,'section_label')]//mat-icon[normalize-space() = 'edit']"));
        setRepeat("section_0-1", "");
        saveEditSectionById("section_0-1");
        textNotPresent("Repeats:", By.cssSelector("#section_0-1 > .card > .card-header"));

        startEditSectionById("form_0-2");
        clickElement(By.xpath("//*[@id='form_0-2']//*[contains(@class,'section_label')]//mat-icon[normalize-space() = 'edit']"));
        setRepeat("form_0-2", "=");
        selectMatSelectByPlaceholder("//*[@id='form_0-2']", "Question Label", "Family history relative age at onset value");
        saveEditSectionById("form_0-2");
        textPresent("Repeats: over Question Answer \"Family history relative age at onset value\"", By.cssSelector("#form_0-2 > .card > .card-header"));

        saveFormEdit();
        findElement(By.cssSelector("input[name='0-1-2']")).sendKeys("2" + Keys.ENTER);
        Assert.assertEquals(driver.findElements(By.cssSelector("#preview-div tr td:first-child")).size(), 2);
        textPresent("2.");
        textNotPresent("3.");
        textPresent("Education level");
        textPresent("1st Grade");
    }
}
