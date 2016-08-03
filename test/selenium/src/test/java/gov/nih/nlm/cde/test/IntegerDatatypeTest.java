package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IntegerDatatypeTest extends NlmCdeBaseTest {

    @Test
    @RecordVideo
    public void integerDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Tobacco product fail control indicator";
        String newDatatype = "Custom Datatype";
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//div[@id='listDatatype']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='listDatatype']//input")).sendKeys("Custom Datatype");
        clickElement(By.cssSelector("#listDatatype .fa-check"));

        newCdeVersion();

        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newDatatype, By.xpath("//*[@id='historyCompare_pvs_0']//*[@id='listDatatype']/span/span"));
        textPresent("N/A", By.xpath("//*[@id='historyCompare_pvs_1']//*[@id='listDatatype']/span/span"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//div[@id='listDatatype']//i[@title='Edit']"));
        findElement(By.xpath("//div[@id='listDatatype']//input")).sendKeys("Other Datatype");
        clickElement(By.cssSelector("#listDatatype .fa-check"));

        newCdeVersion();
        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newDatatype, By.xpath("//*[@id='historyCompare_pvs_0']//*[@id='listDatatype']/span/span/i"));
        textPresent("N/A", By.xpath("//*[@id='historyCompare_pvs_1']//*[@id='listDatatype']/span/span/i"));
    }

}