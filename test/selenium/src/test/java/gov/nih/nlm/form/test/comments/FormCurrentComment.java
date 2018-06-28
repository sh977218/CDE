package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormCurrentComment extends NlmCdeBaseTest {

    @Test()
    public void formCurrentCommentTest() {
        String formName = "Activities of Daily Living and Gait";
        goToFormByName(formName);
        goToDiscussArea();
        Assert.assertEquals(true, findElement(By.id("currentComment_0")).getAttribute("class").contains("currentComment"));
        goToNaming();
        findElement(By.xpath("//*[@id='comment_0' and not(contains(@class, 'currentComment'))]"));
    }
}
