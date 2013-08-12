import org.testng.annotations.*;
import org.testng.Assert;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.Select;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class NlmCdeBaseTest {
    
    public static String baseUrl = "http://localhost:3001";
    public static WebDriver driver;
    
    private static String nlm_username = "nlm";
    private static String nlm_password = "nlm";
    private static String test_username = "testuser";
    private static String test_password = "Test123";
    private static String test_reg_auth = "RegAuthTest1";
    
    @BeforeTest
    public void setBaseUrl() {
        driver = new FirefoxDriver();
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(3, TimeUnit.SECONDS);
    }
    
    @Test
    public void testLoginAsNlm() {
        loginAs("nlm", "nlm");
        logout();
    }
    
    @Test(priority=0)
    public void testSelfRegister() {
        driver.get(baseUrl + "/");
        driver.findElement(By.linkText("Log In")).click();
        driver.findElement(By.linkText("Sign up")).click();
        driver.findElement(By.name("username")).sendKeys(test_username);
        driver.findElement(By.name("uPassword")).sendKeys(test_password);
        driver.findElement(By.name("ucPassword")).sendKeys(test_password);
        driver.findElement(By.cssSelector("input.btn")).click();
        loginAs(test_username, test_password);
        logout();
    }

    @Test(priority=0)
    public void testAddRegistrationAuthority() {
        loginAs(nlm_username, nlm_password);
        driver.findElement(By.linkText("Account")).click();
        driver.findElement(By.linkText("Site Management")).click();
        driver.findElement(By.linkText("Registration Authorities")).click();
        driver.findElement(By.name("newRegAuth.name")).sendKeys(test_reg_auth);
        driver.findElement(By.id("addRegAuth")).click();
        logout();
    }
    
    @Test(priority=1)
    public void testPromoteRegAuthAdmin() {
        loginAs(nlm_username, nlm_password);
        driver.findElement(By.linkText("Account")).click();
        driver.findElement(By.linkText("Site Management")).click();
        driver.findElement(By.linkText("Registration Authorities Admins")).click();
        new Select(driver.findElement(By.name("admin.regAuthName"))).selectByVisibleText(test_reg_auth);
        driver.findElement(By.name("regAuthAdmin.username")).sendKeys(test_username);
        driver.findElement(By.id("addRegAuthAdmin")).click();
        logout();
        loginAs(test_username, test_password);
        driver.findElement(By.linkText("Create")).click();
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.name("cde.registeringAuthority.name"))).selectByVisibleText(test_reg_auth);                
        logout();
    }
    
    @Test(priority=2) 
    public void testCreateCde() {
        loginAs(test_username, test_password);
        driver.findElement(By.linkText("Create")).click();
        driver.findElement(By.name("cde.name")).sendKeys("name of testuser CDE 1");
        driver.findElement(By.name("cde.definition")).sendKeys("Definition for testUser CDE 1");
        driver.findElement(By.name("cde.version")).sendKeys("1.0alpha1");
        new Select(driver.findElement(By.name("cde.registeringAuthority.name"))).selectByVisibleText(test_reg_auth);
        driver.findElement(By.id("cde.submit")).click();
        driver.get(baseUrl + "/");
        driver.findElement(By.name("search.name")).sendKeys("testUser CDE 1");
        driver.findElement(By.id("search.submit")).click();
        driver.findElement(By.linkText(test_reg_auth + " -- name of testuser CDE 1")).click();
        driver.findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Definition for testUser CDE 1") > 0);
    }

    @Test
    public void testCdeFullDetail() {
        driver.get(baseUrl + "/");
        driver.findElement(By.name("search.name")).sendKeys("genotype");
        driver.findElement(By.id("search.submit")).click();
        driver.findElement(By.linkText("caBIG -- Genotype Therapy Basis Mutation Analysis Indicator")).click();
        driver.findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Genotype Therapy Basis Mutation Analysis Indicator") > 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("3157849v1") > 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Text descriptor to indicate whether "
                + "genotype directed therapy was based on mutation testing") > 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Qualified") > 0);
        driver.findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Unknown") > 0);
        driver.findElement(By.linkText("DE Concepts")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Mutation Analysis") > 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("C18302") > 0);
        driver.findElement(By.linkText("History")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("This Data Element has no history") > 0);
    }
    
    
    @AfterTest
    public void endSession() {
        driver.quit();
    }
    
    private void logout() {
        driver.findElement(By.linkText("Account")).click();
        driver.findElement(By.linkText("Log Out")).click();
    }
    
    private void loginAs(String username, String password) {
        driver.get(baseUrl + "/");
        driver.findElement(By.linkText("Log In")).click();
        driver.findElement(By.name("username")).clear();
        driver.findElement(By.name("username")).sendKeys(username);
        driver.findElement(By.name("password")).clear();
        driver.findElement(By.name("password")).sendKeys(password);
        driver.findElement(By.cssSelector("input.btn")).click();
    }
    
}
