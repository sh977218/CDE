import org.testng.annotations.*;
import org.testng.Assert;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.util.concurrent.TimeUnit;

public class NlmCdeBaseTest {
    
    public static String baseUrl = "http://localhost:3001";
    public static WebDriver driver;
    
    private static String nlm_username = "nlm";
    private static String nlm_password = "nlm";
    private static String test_username = "testuser";
    private static String test_password = "Test123";
    private static String test_reg_auth = "RegAuthTest1";
    
    public static WebDriverWait wait;

    
    @BeforeTest
    public void setBaseUrl() {
        driver = new FirefoxDriver();
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(3, TimeUnit.SECONDS);
        wait = new WebDriverWait(driver, 3);
    }
    
    @Test
    public void testLoginAsNlm() {
        loginAs("nlm", "nlm");
        logout();
    }
    
    @Test
    public void testCdeFullDetail() {
        driver.get(baseUrl + "/");
        driver.findElement(By.name("search.name")).sendKeys("genotype");
        driver.findElement(By.id("search.submit")).click();
        getElementByLinkText("caBIG -- Genotype Therapy Basis Mutation Analysis Indicator").click();
        getElementByLinkText("View Full Detail").click();
        Assert.assertTrue(textPresent("Genotype Therapy Basis Mutation Analysis Indicator"));
        Assert.assertTrue(textPresent("3157849v1"));
        Assert.assertTrue(textPresent("Text descriptor to indicate whether "
                + "genotype directed therapy was based on mutation testing"));
        Assert.assertTrue(textPresent("Qualified"));
        getElementByLinkText("Permissible Values").click();
        Assert.assertTrue(textPresent("Unknown"));
        getElementByLinkText("DE Concepts").click();
        Assert.assertTrue(textPresent("Mutation Analysis"));
        Assert.assertTrue(textPresent("C18302"));
        getElementByLinkText("History").click();
        Assert.assertTrue(textPresent("This Data Element has no history"));
    } 

    
    @Test(priority=0)
    public void testSelfRegister() {
        driver.get(baseUrl + "/");
        getElementByLinkText("Log In").click();
        getElementByLinkText("Sign up").click();
        driver.findElement(By.name("username")).sendKeys(test_username);
        driver.findElement(By.name("uPassword")).sendKeys(test_password);
        driver.findElement(By.name("ucPassword")).sendKeys(test_password);
        driver.findElement(By.cssSelector("input.btn")).click();
        loginAs(test_username, test_password);
        logout();
    }
    
    @Test (dependsOnMethods = {"testSelfRegister"})
    public void testComments() {
        loginAs(test_username, test_password);
        driver.findElement(By.name("search.name")).sendKeys("hospital");
        driver.findElement(By.id("search.submit")).click();
        getElementByLinkText("PS&CC -- Hospital Confidential Institution Referred From Facility Number Code").click();
        getElementByLinkText("View Full Detail").click();
        getElementByLinkText("Discussions").click();
        driver.findElement(By.name("comment")).sendKeys("My First Comment!");
        driver.findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("My First Comment!"));
        driver.findElement(By.name("comment")).sendKeys("another comment");
        driver.findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        driver.findElement(By.xpath("//div[3]/div[2]/div[2]/i")).click();
        Assert.assertTrue(textPresent("Comment removed"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("another comment") < 0);
        logout();        
    }

    @Test(priority=0)
    public void testAddRegistrationAuthority() {
        loginAs(nlm_username, nlm_password);
        getElementByLinkText("Account").click();
        getElementByLinkText("Site Management").click();
        getElementByLinkText("Registration Authorities").click();
        driver.findElement(By.name("newRegAuth.name")).sendKeys(test_reg_auth);
        driver.findElement(By.id("addRegAuth")).click();
        logout();
    }
    
    @Test(dependsOnMethods = {"testSelfRegister", "testAddRegistrationAuthority"})
    public void testPromoteRegAuthAdmin() {
        loginAs(nlm_username, nlm_password);
        getElementByLinkText("Account").click();
        getElementByLinkText("Site Management").click();
        getElementByLinkText("Registration Authorities Admins").click();
        new Select(driver.findElement(By.name("admin.regAuthName"))).selectByVisibleText(test_reg_auth);
        driver.findElement(By.name("regAuthAdmin.username")).sendKeys(test_username);
        driver.findElement(By.id("addRegAuthAdmin")).click();
        logout();
        loginAs(test_username, test_password);
        getElementByLinkText("Create").click();
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.name("cde.registeringAuthority.name"))).selectByVisibleText(test_reg_auth);                
        logout();
    }
    
    @Test(dependsOnMethods = {"testPromoteRegAuthAdmin"}) 
    public void testCreateCde() {
        loginAs(test_username, test_password);
        getElementByLinkText("Create").click();
        driver.findElement(By.name("cde.designation")).sendKeys("name of testuser CDE 1");
        driver.findElement(By.name("cde.definition")).sendKeys("Definition for testUser CDE 1");
        driver.findElement(By.name("cde.version")).sendKeys("1.0alpha1");
        new Select(driver.findElement(By.name("cde.registeringAuthority.name"))).selectByVisibleText(test_reg_auth);
        driver.findElement(By.id("cde.submit")).click();
        driver.get(baseUrl + "/");
        driver.findElement(By.name("search.name")).sendKeys("testUser CDE 1");
        driver.findElement(By.id("search.submit")).click();
        getElementByLinkText(test_reg_auth + " -- name of testuser CDE 1").click();
        getElementByLinkText("View Full Detail").click();
        Assert.assertTrue(textPresent("Definition for testUser CDE 1"));
        logout();
    }

    @Test(dependsOnMethods = {"testCreateCde"})
    public void testEditCde() {
        loginAs(test_username, test_password);
        driver.findElement(By.name("search.name")).sendKeys("testUser CDE 1");
        driver.findElement(By.id("search.submit")).click();
        getElementByLinkText(test_reg_auth + " -- name of testuser CDE 1").click();
        getElementByLinkText("View Full Detail").click();
        driver.findElement(By.cssSelector("i.icon-pencil")).click();
        driver.findElement(By.xpath("//inline-edit/div/div[2]/input")).sendKeys("[name change number 1]");
        driver.findElement(By.cssSelector("button.icon-ok")).click();
        driver.findElement(By.cssSelector("inline-area-edit.ng-isolate-scope.ng-scope > div > div.ng-binding > i.icon-pencil")).click();
        driver.findElement(By.xpath("//inline-area-edit/div/div[2]/textarea")).sendKeys("[def change number 1]");
        driver.findElement(By.xpath("//inline-area-edit/div/div[2]/button")).click();
        driver.findElement(By.cssSelector("button.btn.btn-primary")).click();
        driver.findElement(By.name("changeNote")).sendKeys("Change note for change number 1");
        driver.findElement(By.cssSelector("button.btn.btn-warning")).click();
        getElementByLinkText("CDEs").click();
        driver.findElement(By.name("search.name")).sendKeys("testUser CDE 1");
        driver.findElement(By.id("search.submit")).click();
        driver.findElement(By.linkText(test_reg_auth + " -- name of testuser CDE 1[name change number 1]")).click();
        driver.findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("[name change number 1]"));
        Assert.assertTrue(textPresent("[def change number 1]"));
        logout();
    }
        
    @Test(dependsOnMethods = {"testEditCde"})
    public void testEditHistory() {
        driver.get(baseUrl + "/");
        driver.findElement(By.name("search.name")).sendKeys("testUser CDE 1");
        driver.findElement(By.id("search.submit")).click();
        driver.findElement(By.linkText(test_reg_auth + " -- name of testuser CDE 1[name change number 1]")).click();
        driver.findElement(By.linkText("View Full Detail")).click();
        getElementByLinkText("History").click();
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("Change note for change number 1"));
        driver.findElement(By.xpath("//tr[2]//td[4]/i")).click();
        Assert.assertTrue(textPresent("name of testuser CDE 1[name change number 1]"));
        Assert.assertTrue(textPresent("Definition for testUser CDE 1[def change number 1]"));
    }
    
        
    @AfterTest
    public void endSession() {
        driver.quit();
    }
    
    public boolean textPresent(String text) {
        wait.until(ExpectedConditions.textToBePresentInElement(By.cssSelector("BODY"), text));
        return driver.findElement(By.cssSelector("BODY")).getText().indexOf(text) > 0;
    }
    
    public WebElement getElementByLinkText(String linkText) {
        wait.until(ExpectedConditions.presenceOfElementLocated(By.linkText(linkText)));
        return driver.findElement(By.linkText(linkText));
    }   
    
    private void logout() {
        getElementByLinkText("Account").click();
        getElementByLinkText("Log Out").click();
    }
    
    private void loginAs(String username, String password) {
        driver.get(baseUrl + "/");
        getElementByLinkText("Log In").click();
        driver.findElement(By.name("username")).clear();
        driver.findElement(By.name("username")).sendKeys(username);
        driver.findElement(By.name("password")).clear();
        driver.findElement(By.name("password")).sendKeys(password);
        driver.findElement(By.cssSelector("input.btn")).click();
    }
    
}
