package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IntegerDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void integerDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Tobacco product fail control indicator";
        goToCdeByName(cdeName);
        clickElement(By.linkText("Permissible Values"));
        clickElement(By.xpath("//div[@id='listDatatype']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='listDatatype']//input")).sendKeys("Custom Datatype");
        clickElement(By.cssSelector("#listDatatype .fa-check"));

        newCdeVersion();

        showAllTabs();
        checkInHistory("Permissible Values - Value List", "", "Custom Datatype");

        clickElement(By.linkText("Permissible Values"));
        clickElement(By.xpath("//div[@id='listDatatype']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='listDatatype']//input")).sendKeys("Other Datatype");
        clickElement(By.cssSelector("#listDatatype .fa-check"));

        newCdeVersion();
        checkInHistory("Permissible Values - Value List", "Custom Datatype", "Other Datatype");
    }

}