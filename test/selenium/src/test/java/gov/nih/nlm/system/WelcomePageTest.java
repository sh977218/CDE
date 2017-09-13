package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WelcomePageTest extends NlmCdeBaseTest {

    @Test
    public void editHtmlOverView() {
        String orgDetail = "The cancer Biomedical Informatics Grid (caBIG) was a US government program to develop an open source, open access information network called caGrid for secure data exchange on cancer research. The initiative was developed by the National Cancer Institute (part of the National Institutes of Health) and was maintained by the Center for Biomedical Informatics and Information Technology (CBIIT).";
        String script = "<head><script>I'm a bad hacker.</script></head>";
        String htmlString = "<html>" + script + "<body><h1>caBIG HTML over view</h1><span>" + orgDetail + "</span></body></html>";
        mustBeLoggedInAs(nlm_username, nlm_username);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("Organizations"));
        clickElement(By.xpath("//*[@id='orgHtmlOverview-caBIG']//i"));
        findElement(By.xpath("//*[@id='orgHtmlOverview-caBIG']//textarea")).sendKeys(htmlString);
        clickElement(By.xpath("//*[@id='orgHtmlOverview-caBIG']//button[contains(text(),'Confirm')]"));
        textPresent("Saved");
        closeAlert();

        mustBeLoggedOut();
        goToCdeSearch();
        clickElement(By.id("search_by_classification_info_caBIG"));
        textPresent(orgDetail);
        goToFormSearch();
        clickElement(By.id("search_by_classification_info_caBIG"));
        textPresent(orgDetail);
    }
}



