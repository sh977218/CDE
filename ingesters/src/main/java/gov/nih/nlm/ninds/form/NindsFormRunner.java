package gov.nih.nlm.ninds.form;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.data.mongodb.core.MongoOperations;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class NindsFormRunner {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringMongoConfig.class);
        MongoOperations mongoOperation = (MongoOperations) ctx.getBean("mongoTemplate");

        Map<String, String> diseaseMap = new HashMap<String, String>();


        diseaseMap.put("Amyotrophic Lateral Sclerosis", "ALS.aspx");
        diseaseMap.put("Congenital Muscular Dystrophy", "CMD.aspx");
        diseaseMap.put("Duchenne/Becker Muscular Dystrophy", "DMD.aspx");
        diseaseMap.put("Epilepsy", "Epilepsy.aspx");
        diseaseMap.put("Facioscapulohumeral muscular dystrophy (FSHD)", "FSHD.aspx");
        diseaseMap.put("Friedreich's Ataxia", "FA.aspx");
        diseaseMap.put("General (For all diseases)", "General.aspx");
        diseaseMap.put("Headache", "Headache.aspx");
        diseaseMap.put("Huntington’s Disease", "HD.aspx");
        diseaseMap.put("Mitochondrial Disease", "MITO.aspx");
        diseaseMap.put("Multiple Sclerosis", "MS.aspx");
        diseaseMap.put("Myasthenia Gravis", "MG.aspx");
        diseaseMap.put("Myotonic Dystrophy", "MMD.aspx");
        diseaseMap.put("Neuromuscular Diseases", "NMD.aspx");
        diseaseMap.put("Parkinson's Disease", "PD.aspx");
        diseaseMap.put("Spinal Cord Injury", "SCI.aspx");
        diseaseMap.put("Spinal Muscular Atrophy", "SMA.aspx");
        diseaseMap.put("Stroke", "Stroke.aspx");
        diseaseMap.put("Traumatic Brain Injury", "TBI.aspx");

        int nbOfThread = 1;
        int startingPage = 3;
        int endingPages = 3;
        ExecutorService executor = Executors.newFixedThreadPool(nbOfThread);

        for (int i = startingPage; i <= endingPages; i++) {
            Runnable worker = new NindsFormLoader(i, i, mongoOperation, diseaseMap);
            executor.execute(worker);
        }

/*
        Iterator it = diseaseMap.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();
            Runnable worker = new FindMissingForms("https://commondataelements.ninds.nih.gov/" + pair.getValue(), mongoOperation);
            executor.execute(worker);
        }
*/

        while (!executor.isTerminated()) {
        }
        executor.shutdown();
        System.out.println("Finished all forms.");
        System.exit(0);
    }
}
