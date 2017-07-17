package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class ExportPreviousVersion extends NlmCdeBaseTest {

    @Test
    public void exportPreviousVersion() {
        String cdeName = "ExportLatest";
        goToCdeByName(cdeName);
        clickElement(By.id("export"));

        // Current version
        Assert.assertTrue(findElement(By.id("jsonExport")).getAttribute("href").endsWith("dataElement/id/585adda729f8ae801d0f045a"));
        Assert.assertTrue(findElement(By.id("xmlExport")).getAttribute("href").endsWith("dataElement/id/585adda729f8ae801d0f045a/xml"));
        Assert.assertFalse(get(baseUrl + "/dataElement/id/585adda729f8ae801d0f045a").asString().contains("designation: \"This name will be removed\""));
        Assert.assertFalse(get(baseUrl + "/dataElement/id/585adda729f8ae801d0f045a").asString().contains("<designation>This name will be removed</designation>"));

        clickElement(By.id("history_tab"));
        clickElement(By.xpath("//*[@id='prior-1']//span"));
        switchTab(1);

        clickElement(By.id("export"));

        // Previous version
        Assert.assertTrue(findElement(By.id("jsonExport")).getAttribute("href").endsWith("dataElement/id/585adda229f8ae801d0f0456"));
        Assert.assertTrue(findElement(By.id("xmlExport")).getAttribute("href").endsWith("dataElement/id/585adda229f8ae801d0f0456/xml"));
        Assert.assertTrue(get(baseUrl + "/dataElement/id/585adda229f8ae801d0f0456").asString().contains("This name will be removed"));
        Assert.assertTrue(get(baseUrl + "/dataElement/id/585adda229f8ae801d0f0456/xml").asString().contains("<designation>This name will be removed</designation>"));

        switchTabAndClose(0);
    }

}
