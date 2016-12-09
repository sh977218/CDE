package gov.nih.nlm.ninds.form;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.data.mongodb.core.MongoOperations;

import java.awt.*;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class NindsFormRunner {
    public static void main(String[] args) throws IOException, AWTException {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringMongoConfig.class);
        MongoOperations mongoOperation = (MongoOperations) ctx.getBean("mongoTemplate");


        Map<String, String> diseaseMap = Consts.diseaseMap;

        int nbOfThread = 3;
        int startingPage = 1;
        int endingPages = 3;
        ExecutorService executor1 = Executors.newFixedThreadPool(nbOfThread);

        for (int i = startingPage; i <= endingPages; i++) {
            Runnable worker = new NindsFormLoader(i, i, mongoOperation, diseaseMap);
            executor1.execute(worker);
        }
        executor1.shutdown();
        while (!executor1.isTerminated()) {
        }
        System.out.println("Finished all forms. from " + startingPage + " to " + endingPages);
/*
        ExecutorService executor2 = Executors.newFixedThreadPool(nbOfThread);
        Iterator it = diseaseMap.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();
            Runnable worker = new FindMissingForms("https://commondataelements.ninds.nih.gov/" + pair.getValue(), mongoOperation);
            executor2.execute(worker);
        }
        executor2.shutdown();
        while (!executor2.isTerminated()) {
        }
        System.out.println("Finished all forms in the map: " + diseaseMap);
        System.exit(0);*/
    }
}
