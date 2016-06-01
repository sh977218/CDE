package gov.nih.nlm.ninds.form;

import com.mongodb.MongoClientURI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;

@Configuration
public class SpringMongoConfig {

    public
    @Bean
    MongoDbFactory mongoDbFactory() throws Exception {
        String mongoUri = "mongodb://miguser:password@localhost:27017/migration";
        return new SimpleMongoDbFactory(new MongoClientURI(mongoUri));
    }

    public
    @Bean
    MongoTemplate mongoTemplate() throws Exception {

        MongoTemplate mongoTemplate = new MongoTemplate(mongoDbFactory());

        return mongoTemplate;

    }
}