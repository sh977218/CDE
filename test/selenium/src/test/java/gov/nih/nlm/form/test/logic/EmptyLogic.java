package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class EmptyLogic extends BaseFormTest {

    @Test
    public void emptyLogic() {
        goToFormByName("Empty Logic");

        textPresent("If empty:", By.xpath("//*[*[normalize-space()='Birth date']]"));
        textPresent("If none:", By.xpath("//*[*[normalize-space()='Image Acquisition Event Yes No Not Done Indicator']]"));
        textPresent("If empty:", By.xpath("//*[*[normalize-space()='Head injury prior number']]"));
        textPresent("If empty:", By.xpath("//*[*[normalize-space()='Noncompliant Reason Text']]"));
        togglePrintableLogic();

        // Dates
        textPresent("Data unknown indicator");
        findElement(By.xpath("//div[@id='Birth date_0-0']//input")).sendKeys("01011995");
        findElement(By.xpath("//div[@id='Birth date_0-0']//input")).sendKeys(Keys.TAB);
        textNotPresent("Data unknown indicator");

        // Value Lists
        textPresent("Pulmonary function test not done reason");
        findElement(By.xpath("//div[@id='Image Acquisition Event Yes No Not Done Indicator_0-2']//" + byValueListValueXPath("No: C49487"))).click();
        textNotPresent("Pulmonary function test not done reason");

        // Numbers
        findElement(By.xpath("//div[@id='Head injury prior number_0-4']//input")).sendKeys(Keys.BACK_SPACE);
        textPresent("Pulmonary function test not done other text");
        findElement(By.xpath("//div[@id='Head injury prior number_0-4']//input")).sendKeys("0");
        textNotPresent("Pulmonary function test not done other text");
        findElement(By.xpath("//div[@id='Head injury prior number_0-4']//input")).sendKeys(Keys.BACK_SPACE);
        textPresent("Pulmonary function test not done other text");

        // Text
        textPresent("Perianal problem other text");
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_0-6']//input")).sendKeys("abc");
        textNotPresent("Perianal problem other text");
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_0-6']//input")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_0-6']//input")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_0-6']//input")).sendKeys(Keys.BACK_SPACE);
        textPresent("Perianal problem other text");

    }

}
