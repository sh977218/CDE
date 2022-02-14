package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UpdateUserAvatar extends NlmCdeBaseTest {
    @Test
    void updateUserAvatar() {
        String avatarUrl = "/cde/public/assets/img/min/nih-cde-logo-simple.png";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToUsers();
        searchUsername(empty_avatar_username);
        clickElement(By.xpath("//button[text()='Search']"));
        clickElement(By.xpath("//*[@itemprop='user_avatar_0']//mat-icon"));
        findElement(By.xpath("//*[@itemprop='user_avatar_0']//input")).sendKeys(avatarUrl);
        clickElement(By.xpath("//*[@itemprop='user_avatar_0']//button/mat-icon[normalize-space() = 'check']"));
        findElement(By.xpath("//*[@itemprop='user_avatar_0']//img"));
    }
}
