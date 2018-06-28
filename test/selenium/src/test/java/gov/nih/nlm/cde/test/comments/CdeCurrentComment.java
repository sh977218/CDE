package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeCurrentComment extends NlmCdeBaseTest {

    @Test()
    public void cdeCurrentCommentTest() {
        String cdeName = "Hospital Confidential Institution Referred From Facility Number Code";
        goToCdeByName(cdeName);
        goToDiscussArea();
        Assert.assertEquals(true, findElement(By.id("currentComment_0")).getAttribute("class").contains("currentTabComment"));
        goToNaming();
        findElement(By.xpath("//*[@id='comment_0' and not(contains(@class, 'currentTabComment'))]"));
        findElement(By.xpath("//*[@id='comment_1' and contains(@class, 'currentTabComment')]"));

    }
}
