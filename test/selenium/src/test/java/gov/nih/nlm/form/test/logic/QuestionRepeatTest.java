package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuestionRepeatTest extends BaseFormTest {

    @Test
    public void questionRepeat() {
        mustBeLoggedInAs(testEditor_username, password);
        String formName = "Question Repeat";
        goToFormByName(formName);
        textNotPresent("If 1: DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number_0-0-0']"));
        textPresent("If 1: DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number_0-0-1']"));
        textNotPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='Neoadjuvant Therapy_1-0']"));
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='Neoadjuvant Therapy_1-1']"));

        togglePrintableLogic();
        textNotPresent("DCE-MRI Kinetics T1 Mapping Quality Type");
        textNotPresent("Tumor T1 Signal Intensity Category");

        findElement(By.xpath("//input[@id='Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number_0-0-0_box']")).sendKeys("1");
        textNotPresent("DCE-MRI Kinetics T1 Mapping Quality Type");
        findElement(By.xpath("//input[@id='Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number_0-0-1_box']")).sendKeys("1");
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type");

        clickElement(By.xpath("//*[@id='Neoadjuvant Therapy_1-0']//label[contains(., 'Yes')]"));
        textNotPresent("Tumor T1 Signal Intensity Category");
        clickElement(By.xpath("//*[@id='Neoadjuvant Therapy_1-1']//label[contains(., 'Yes')]"));
        textPresent("Tumor T1 Signal Intensity Category");
    }

}
