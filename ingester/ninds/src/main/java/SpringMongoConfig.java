import com.mongodb.MongoClientURI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;

@Configuration
class SpringMongoConfig {

    @Bean
    protected MongoDbFactory mongoDbFactory() throws Exception {
        return new SimpleMongoDbFactory(new MongoClientURI(MyConstants.MONGO_URL));
    }

    @Bean
    protected MongoTemplate mongoTemplate() throws Exception {

        return new MongoTemplate(mongoDbFactory());

    }
}