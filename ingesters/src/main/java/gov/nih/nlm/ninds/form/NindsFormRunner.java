package gov.nih.nlm.ninds.form;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.data.mongodb.core.MongoOperations;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class NindsFormRunner {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringMongoConfig.class);
        MongoOperations mongoOperation = (MongoOperations) ctx.getBean("mongoTemplate");

        Map<String, String> diseaseMap1 = new HashMap<String, String>();
        Map<String, String> diseaseMap2 = new HashMap<String, String>();
//        diseaseMap1.put("General (For all diseases)", "General.aspx");
        diseaseMap1.put("Amyotrophic Lateral Sclerosis", "ALS.aspx");
/*
        diseaseMap1.put("Epilepsy", "Epilepsy.aspx");
        diseaseMap1.put("Friedreich's Ataxia", "FA.aspx");
        diseaseMap1.put("Headache", "Headache.aspx");
        diseaseMap1.put("Huntington's Disease", "HD.aspx");
        diseaseMap1.put("Mitochondrial Disease", "MITO.aspx");
        diseaseMap1.put("Multiple Sclerosis", "MS.aspx");
        diseaseMap1.put("Neuromuscular Diseases", "NMD.aspx");
*/
        diseaseMap2.put("Congenital Muscular Dystrophy", "CMD.aspx");
        diseaseMap2.put("Duchenne Muscular Dystrophy/Becker Muscular Dystrophy", "DMD.aspx");
        diseaseMap2.put("Facioscapulohumeral Muscular Dystrophy", "FSHD.aspx");
        diseaseMap2.put("Myasthenia Gravis", "MG.aspx");
        diseaseMap2.put("Myotonic Muscular Dystrophy", "MMD.aspx");
        diseaseMap2.put("Spinal Muscular Atrophy", "SMA.aspx");
        diseaseMap2.put("Parkinson's Disease", "PD.aspx");
        diseaseMap2.put("Spinal Cord Injury", "SCI.aspx");
        diseaseMap2.put("Stroke", "Stroke.aspx");
        diseaseMap2.put("Traumatic Brain Injury", "TBI.aspx");
/*

        int startingPage = 11;

        int nbOfThreads = 0;
        Thread[] t = new Thread[nbOfThreads];

        for (int i = 0; i < nbOfThreads; i++) {
            NindsFormLoader loader = new NindsFormLoader(i + startingPage, i + startingPage, mongoOperation);
            t[i] = new Thread(loader);
        }

        for (Thread aT : t) {
            aT.start();
        }
        for (Thread aT : t) {
            try {
                aT.join();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
*/

        int nbOfDisease1 = diseaseMap1.size();
        Thread[] t1 = new Thread[nbOfDisease1];

        int i1 = 0;
        Iterator it1 = diseaseMap1.entrySet().iterator();
        while (it1.hasNext()) {
            Map.Entry pair = (Map.Entry) it1.next();
            System.out.println(pair.getKey() + " = " + pair.getValue());
            FindMissingForms loader = new FindMissingForms("https://commondataelements.ninds.nih.gov/" + pair.getValue(), mongoOperation);
            t1[i1] = new Thread(loader);
            i1++;
        }
        for (Thread aT : t1) {
            aT.start();
        }
        for (Thread aT : t1) {
            try {
                aT.join();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

/*

        int nbOfDisease2 = diseaseMap1.size();
        Thread[] t2 = new Thread[nbOfDisease2];

        int i2 = 0;
        Iterator it2 = diseaseMap2.entrySet().iterator();
        while (it2.hasNext()) {
            Map.Entry pair = (Map.Entry) it2.next();
            System.out.println(pair.getKey() + " = " + pair.getValue());
            FindMissingForms loader = new FindMissingForms("https://commondataelements.ninds.nih.gov/" + pair.getValue(), mongoOperation);
            t2[i2] = new Thread(loader);
            i2++;
        }
        for (Thread aT : t2) {
            aT.start();
        }
        for (Thread aT : t2) {
            try {
                aT.join();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
*/

        System.exit(0);
    }
}
