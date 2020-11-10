package gov.nih.nlm.form.test.render;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NativeRequiredAndDefault extends BaseFormTest {
    @Test
    public void nativeRequiredAndDefault() {
        loginAs(nlm_username, nlm_password);
        String formName = "Required and Default Test";
        goToFormByName(formName);
        checkDefault();

        clickElement(By.cssSelector(".toggle-switch"));
        textPresent("Published", By.tagName("h1"));
        checkRequired();

        clickElement(By.id("selectRenderButton"));
        clickElement(By.id("button_print_follow"));
        switchTab(1);
        checkRequired();
        switchTabAndClose(0);

        clickElement(By.cssSelector(".toggle-switch"));
        textPresent("DRAFT", By.tagName("h1"));
        newFormVersion();
        checkDefault();

        clickElement(By.id("selectRenderButton"));
        clickElement(By.id("button_print_follow"));
        switchTab(1);
        checkDefault();
        switchTabAndClose(0);
    }

    private void checkDefault() {
        textNotPresent("Please fill out this field.");
        findElement(By.cssSelector("input[name='0-0'][value='0']:checked"));
        findElement(By.cssSelector("input[name='0-1'][value='0']:checked"));
        Assert.assertEquals(findElement(By.cssSelector("input[name='0-2']")).getAttribute("value"), "2019-09-03");
        Assert.assertEquals(findElement(By.cssSelector("input[name='0-3']")).getAttribute("value"), "0");
        Assert.assertEquals(findElement(By.cssSelector("input[name='0-4']")).getAttribute("value"), "a");
        Assert.assertEquals(findElement(By.cssSelector("textarea[name='0-5']")).getAttribute("value"), "a");
        findElement(By.cssSelector("input[name='0_0-6-0'][value='0']:checked"));
        findElement(By.cssSelector("input[name='0_0-6-1'][value='0']:checked"));
        findElement(By.cssSelector("input[name='1_0-6-0'][value='0']:checked"));
        findElement(By.cssSelector("input[name='1_0-6-1'][value='0']:checked"));
        Assert.assertEquals(findElement(By.cssSelector("input[name='0_0-6-2']")).getAttribute("value"), "0");
        Assert.assertEquals(findElement(By.cssSelector("input[name='1_0-6-2']")).getAttribute("value"), "0");
        Assert.assertEquals(findElement(By.cssSelector("input[name='0_0-6-3']")).getAttribute("value"), "2019-09-03");
        Assert.assertEquals(findElement(By.cssSelector("input[name='1_0-6-3']")).getAttribute("value"), "2019-09-03");
        Assert.assertEquals(findElement(By.cssSelector("input[name='0_0-6-4']")).getAttribute("value"), "a");
        Assert.assertEquals(findElement(By.cssSelector("input[name='1_0-6-4']")).getAttribute("value"), "a");
        Assert.assertEquals(findElement(By.cssSelector("textarea[name='0_0-6-5']")).getAttribute("value"), "a");
        Assert.assertEquals(findElement(By.cssSelector("textarea[name='1_0-6-5']")).getAttribute("value"), "a");
        findElement(By.cssSelector("input[name='0-7-0'][value='0']:checked"));
        findElement(By.cssSelector("input[name='0-7-1'][value='1']:checked"));
    }

    private void checkRequired() {
        textPresent("Please fill out this field.", By.xpath("//*[@id='Over the last 2 weeks how often have you been bothered by having little interest or pleasure in doing things?_0-0']"));
        textPresent("Please fill out this field.", By.xpath("//*[@id='Over the last 2 weeks how often have you been bothered by feeling down depressed or hopeless?_0-1']"));
        textPresent("Please fill out this field.", By.xpath("//*[@id='Date of admission to acute care unit_0-2']"));
        textPresent("Please fill out this field.", By.xpath("//*[@id='If yes Number of aborted procedures_0-3']"));
        textPresent("Please fill out this field.", By.xpath("//*[@id='AIS grade_0-4']"));
        textPresent("Please fill out this field.", By.xpath("//*[@id='Activity descriptor_0-5']"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(1) td:nth-child(2)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(1) td:nth-child(3)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(1) td:nth-child(4)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(1) td:nth-child(5)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(1) td:nth-child(6)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(1) td:nth-child(7)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(2) td:nth-child(2)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(2) td:nth-child(3)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(2) td:nth-child(4)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(2) td:nth-child(5)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(2) td:nth-child(6)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-table tbody tr:nth-child(2) td:nth-child(7)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-section-matrix tbody tr:nth-child(2) td:nth-child(1)"));
        textPresent("Please fill out this field.", By.cssSelector("cde-native-section-matrix tbody tr:nth-child(4) td:nth-child(1)"));
    }
}
