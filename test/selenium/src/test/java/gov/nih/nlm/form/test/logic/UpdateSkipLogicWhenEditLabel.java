package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UpdateSkipLogicWhenEditLabel extends BaseFormTest {

    @Test
    public void updateSkipLogicWhenEditLabelTest() {
        String formName = "Study Discontinuation/Completion";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
                clickElement(By.id("dropdownMenuButton"));                clickElement(By.xpath("(//*[@id='dropdownMenuButton']/following-sibling::div)/button[normalize-space(text()) = 'Printable Logic:']/input"));
        textNotPresent("Reason for premature intervention discontinuation");
        findElement(By.xpath("//*[@id='Off study date_0']//input")).sendKeys("10/15/2016");
        clickElement(By.xpath("//*[@id='Did participant subject discontinue intervention before planned end of study?_2']//label/span[text()[contains(., 'No')]]"));
        textPresent("Reason for premature intervention discontinuation");
        goToFormDescription();

        startEditQuestionSectionById("question_0_0");
        clickElement(By.xpath("//*[@id='question_0_0']//i[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("There is skip logic using this label. It will be updated.");
        clickElement(By.xpath("//*[@id='q_select_name_0']//button"));
        String cssClass = findElement(By.xpath("//*[@id='question_0_4']//i[contains(@class,'updatedSkipLogicIcon')]")).getAttribute("class");
        Assert.assertEquals(cssClass.contains("fa-spin"), true);
        saveEditQuestionSectionById("question_0_0");

        newFormVersion();
        goToFormByName(formName);
                clickElement(By.id("dropdownMenuButton"));                clickElement(By.xpath("(//*[@id='dropdownMenuButton']/following-sibling::div)/button[normalize-space(text()) = 'Printable Logic:']/input"));
        textNotPresent("Reason for premature intervention discontinuation");
        findElement(By.xpath("//*[@id='Off study date and time_0']//input")).sendKeys("10/15/2016");
        clickElement(By.xpath("//*[@id='Did participant subject discontinue intervention before planned end of study?_2']//label/span[text()[contains(., 'No')]]"));
        textPresent("Reason for premature intervention discontinuation");
    }
}
