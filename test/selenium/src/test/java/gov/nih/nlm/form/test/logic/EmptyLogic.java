package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EmptyLogic extends NlmCdeBaseTest {

    @Test
    public void emptyLogic() {
        goToFormByName("Empty Logic");

        textPresent("If empty:", By.xpath("//div[label[text()='Birth date']]"));
        textPresent("If none:", By.xpath("//div[label[text()='Image Acquisition Event Yes No Not Done Indicator']]"));
        textPresent("If empty:", By.xpath("//div[label[text()='Head injury prior number']]"));
        textPresent("If empty:", By.xpath("//div[label[text()='Noncompliant Reason Text']]"));

        clickElement(By.xpath("//label[contains(., 'Printable Logic:')]"));

        // Dates
        textPresent("Data unknown indicator");
        findElement(By.xpath("//div[@id='Birth date_0']//input")).sendKeys("1");
        textPresent("Data unknown indicator");
        findElement(By.xpath("//div[@id='Birth date_0']//input")).sendKeys("995");
        textNotPresent("Data unknown indicator");
        findElement(By.xpath("//div[@id='Birth date_0']//input")).clear();
        textPresent("Data unknown indicator");

        // Value Lists
        textPresent("Pulmonary function test not done reason");
        findElement(By.xpath("//div[@id='Image Acquisition Event Yes No Not Done Indicator_2']//input[@value='No']")).click();
        textNotPresent("Pulmonary function test not done reason");

        // Numbers
        textPresent("Pulmonary function test not done other text");
        findElement(By.xpath("//div[@id='Head injury prior number_4']//input")).sendKeys("0");
        textNotPresent("Pulmonary function test not done other text");
        findElement(By.xpath("//div[@id='Head injury prior number_4']//input")).clear();
        textPresent("Pulmonary function test not done other text");

        // Text
        textPresent("Perianal problem other text");
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_6']//input")).sendKeys("abc");
        textNotPresent("Perianal problem other text");
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_6']//input")).clear();
        textPresent("Perianal problem other text");

    }

}
