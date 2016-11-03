package gov.nih.nlm.common.test;

import gov.nih.nlm.system.EltIdMaps;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LiveCommentTest extends NlmCdeBaseTest {

    @Test
    public void cdeLiveComment() {
        String cdeName = "Sensory system abnormality stocking glove present text";

/*
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));
        textPresent("Post Comment");

*/

        _driver.get(baseUrl + "/home");
        _driver.findElement(By.id("login_link")).click();
        _driver.findElement(By.id("uname")).sendKeys(ninds_username);
        _driver.findElement(By.id("passwd")).sendKeys(password);
        String tinyId = EltIdMaps.eltMap.get(cdeName);
        _driver.get(baseUrl + "/deview" + "/?tinyId=" + tinyId);
        _driver.findElement(By.id("discussBtn")).click();
        _driver.findElement(By.id("commentTextArea")).sendKeys("newComment");
        _driver.findElement(By.id("postComment")).click();

//        textPresent("newComment");

        _driver.findElement(By.id("replyTextarea_0")).sendKeys("newReply");
        _driver.findElement(By.id("replyBtn_0")).click();

//        textPresent("newReply");

        _driver.findElement(By.id("removeComment-0")).click();

//        textNotPresent("newReply");


    }
}
