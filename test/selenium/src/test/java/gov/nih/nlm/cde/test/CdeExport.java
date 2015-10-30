package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;
import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.RestAssured.get;

public class CdeExport extends NlmCdeBaseTest {

    @Test
    public void exportJson() {
        String cdeName = "Spinal column injury number";
        goToCdeByName(cdeName);
        findElement(By.id("export")).click();
        findElement(By.id("jsonExport")).click();
        switchTab(1);
        String response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.contains("\"naming\":[{\"designation\":\"Spinal column injury number\",\"definition\":\"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.\""));
        switchTabAndClose(0);
    }

    @Test
    public void exportXml() {
        String cdeName = "Spinal column injury number";
        goToCdeByName(cdeName);
        findElement(By.id("export")).click();
        String url = findElement(By.id("xmlExport")).getAttribute("href");
        String response = get(url).asString();
        Assert.assertTrue(response.replaceAll("\\s+", "").contains("<naming>\n" +
                "<designation>Spinal column injury number</designation>\n" +
                "<definition>\n" +
                "Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.\n" +
                "</definition>\n" +
                "<languageCode>EN-US</languageCode>\n" +
                "<context>\n" +
                "<contextName>Health</contextName>\n" +
                "<acceptability>preferred</acceptability>\n" +
                "</context>\n" +
                "</naming>"));
        findElement(By.id("xmlExport")).click();

    }
}
