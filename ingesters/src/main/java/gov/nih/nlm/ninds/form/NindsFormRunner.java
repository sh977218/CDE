package gov.nih.nlm.ninds.form;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.data.mongodb.core.MongoOperations;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class NindsFormRunner {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringMongoConfig.class);
        MongoOperations mongoOperation = (MongoOperations) ctx.getBean("mongoTemplate");

        Map<String, String> diseaseMap = new HashMap<String, String>();

        diseaseMap.put("General (For all diseases)", "General.aspx");
        diseaseMap.put("Amyotrophic Lateral Sclerosis", "ALS.aspx");
        diseaseMap.put("Epilepsy", "Epilepsy.aspx");
        diseaseMap.put("Friedreich's Ataxia", "FA.aspx");
        diseaseMap.put("Headache", "Headache.aspx");
        diseaseMap.put("Huntington's Disease", "HD.aspx");
        diseaseMap.put("Mitochondrial Disease", "MITO.aspx");
        diseaseMap.put("Multiple Sclerosis", "MS.aspx");
        diseaseMap.put("Neuromuscular Diseases", "NMD.aspx");
        diseaseMap.put("Congenital Muscular Dystrophy", "CMD.aspx");
        diseaseMap.put("Duchenne Muscular Dystrophy/Becker Muscular Dystrophy", "DMD.aspx");
        diseaseMap.put("Facioscapulohumeral Muscular Dystrophy", "FSHD.aspx");
        diseaseMap.put("Myasthenia Gravis", "MG.aspx");
        diseaseMap.put("Myotonic Muscular Dystrophy", "MMD.aspx");
        diseaseMap.put("Spinal Muscular Atrophy", "SMA.aspx");
        diseaseMap.put("Parkinson's Disease", "PD.aspx");
        diseaseMap.put("Spinal Cord Injury", "SCI.aspx");
        diseaseMap.put("Stroke", "Stroke.aspx");
        diseaseMap.put("Traumatic Brain Injury", "TBI.aspx");


        int nbOfThread = 5;
        ExecutorService executor = Executors.newFixedThreadPool(nbOfThread);

        for (int i = 0; i < 27; i++) {
            executor.execute(new Thread(new NindsFormLoader(i + 1, i + 1, mongoOperation)));
        }

        Iterator it = diseaseMap.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();
            System.out.println(pair.getKey() + " = " + pair.getValue());
            executor.execute(new Thread(new FindMissingForms("https://commondataelements.ninds.nih.gov/" + pair.getValue(), mongoOperation)));
        }
        executor.shutdown();
        while (!executor.isTerminated()) {
        }
        System.exit(0);
    }
}
