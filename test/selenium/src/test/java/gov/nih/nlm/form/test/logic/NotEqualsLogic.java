package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class NotEqualsLogic extends BaseFormTest {

    @Test
    public void notEqualsLogic() {
        goToFormByName("Not Equals Test");
        clickElement(By.id("dropdownMenuButton"));
        clickElement(By.xpath("(//*[@id='dropdownMenuButton']/following-sibling::div)/button[normalize-space(text()) = 'Printable Logic:']/input"));

        // test numbers
        textPresent("Spinal surgery indicator");
        findElement(By.name("q1")).sendKeys("1");
        textPresent("Spinal surgery indicator");
        findElement(By.name("q1")).sendKeys("11");
        textNotPresent("Spinal surgery indicator");

        scrollDownBy(500);

        // test date
        textPresent("Diagnosis age type");
        findElement(By.name("q3_date")).sendKeys("01/01/2016");
        textPresent("Diagnosis age type");
        findElement(By.name("q3_date")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("q3_date")).sendKeys("5" + Keys.TAB);
        textNotPresent("Diagnosis age type");

        // text and empty logic
        textPresent("Birth Weight");
        textPresent("Scale for the Assessment of Positive Symptoms (SAPS) - incoherence word salad schizophasia scale");
        findElement(By.name("q5")).sendKeys("Swe");
        textPresent("Scale for the Assessment of Positive Symptoms (SAPS) - incoherence word salad schizophasia scale");
        textPresent("Birth Weight");
        findElement(By.name("q5")).sendKeys("den");
        textNotPresent("Birth Weight");
        findElement(By.name("q5")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("q5")).clear();
        textPresent("Scale for the Assessment of Positive Symptoms (SAPS) - incoherence word salad schizophasia scale");

        // value list
        textPresent("Quality of Life - Stigma illness recent assessment scale");
        clickElement(By.xpath("//div[contains(@id, 'Quality of Life - Write task list difficulty scale_')]//label[@title = 'None']"));
        textNotPresent("Quality of Life - Stigma illness recent assessment scale");

    }

}
