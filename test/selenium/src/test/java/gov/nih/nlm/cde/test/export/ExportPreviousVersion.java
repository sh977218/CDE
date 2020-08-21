package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class ExportPreviousVersion extends NlmCdeBaseTest {

    @Test
    public void exportPreviousVersion() {
        String cdeName = "ExportLatest";
        goToCdeByName(cdeName);
        downloadAsTab();
        clickElement(By.id("export"));

        // Current version
        Assert.assertTrue(findElement(By.xpath("//a[@mat-menu-item][contains(.,'JSON File, NIH/CDE Schema')]")).getAttribute("href").endsWith("byId/585adda729f8ae801d0f045a"));
        Assert.assertTrue(findElement(By.xpath("//a[@mat-menu-item][contains(.,'XML File, NIH/CDE Schema')]")).getAttribute("href").endsWith("byId/585adda729f8ae801d0f045a?type=xml"));
        Assert.assertFalse(get(baseUrl + "/server/de/byId/585adda729f8ae801d0f045a").asString().contains("designation: \"This name will be removed\""));
        Assert.assertFalse(get(baseUrl + "/server/de/byId/585adda729f8ae801d0f045a?type=xml").asString().contains("<designation>This name will be removed</designation>"));

        clickElement(By.cssSelector(".cdk-overlay-container"));

        goToHistory();
        clickElement(By.xpath("//*[@id='prior-1']//mat-icon[normalize-space() = 'visibility']"));
        switchTab(1);

        clickElement(By.id("export"));

        // Previous version
        Assert.assertTrue(findElement(By.xpath("//a[@mat-menu-item][contains(.,'JSON File, NIH/CDE Schema')]")).getAttribute("href").endsWith("byId/585adda229f8ae801d0f0456"));
        Assert.assertTrue(findElement(By.xpath("//a[@mat-menu-item][contains(.,'XML File, NIH/CDE Schema')]")).getAttribute("href").endsWith("byId/585adda229f8ae801d0f0456?type=xml"));
        Assert.assertTrue(get(baseUrl + "/server/de/byId/585adda229f8ae801d0f0456").asString().contains("This name will be removed"));
        Assert.assertTrue(get(baseUrl + "/server/de/byId/585adda229f8ae801d0f0456?type=xml").asString().contains("<designation>This name will be removed</designation>"));

        switchTabAndClose(0);
    }

}
