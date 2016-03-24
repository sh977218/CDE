package gov.nih.nlm.ninds.form;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.data.mongodb.core.MongoOperations;

import java.util.HashMap;
import java.util.Map;

public class NindsFormRunner {
    public static void main(String[] args) {
        ApplicationContext ctx = new AnnotationConfigApplicationContext(SpringMongoConfig.class);
        MongoOperations mongoOperation = (MongoOperations) ctx.getBean("mongoTemplate");

        Map<String, String> diseaseMap1 = new HashMap<String, String>();
        Map<String, String> diseaseMap2 = new HashMap<String, String>();
        Map<String, String> diseaseMap3 = new HashMap<String, String>();
        Map<String, String> diseaseMap4 = new HashMap<String, String>();
        Map<String, String> diseaseMap5 = new HashMap<String, String>();
        Map<String, String> diseaseMap6 = new HashMap<String, String>();
        diseaseMap1.put("General (For all diseases)", "General.aspx");
        diseaseMap1.put("Amyotrophic Lateral Sclerosis", "ALS.aspx");
        diseaseMap1.put("Epilepsy", "Epilepsy.aspx");
        diseaseMap2.put("Friedreich's Ataxia", "FA.aspx");
        diseaseMap2.put("Headache", "Headache.aspx");
        diseaseMap2.put("Huntington's Disease", "HD.aspx");
        diseaseMap3.put("Mitochondrial Disease", "MITO.aspx");
        diseaseMap3.put("Multiple Sclerosis", "MS.aspx");
        diseaseMap3.put("Neuromuscular Diseases", "NMD.aspx");
        diseaseMap4.put("Congenital Muscular Dystrophy", "CMD.aspx");
        diseaseMap4.put("Duchenne Muscular Dystrophy/Becker Muscular Dystrophy", "DMD.aspx");
        diseaseMap4.put("Facioscapulohumeral Muscular Dystrophy", "FSHD.aspx");
        diseaseMap5.put("Myasthenia Gravis", "MG.aspx");
        diseaseMap5.put("Myotonic Muscular Dystrophy", "MMD.aspx");
        diseaseMap5.put("Spinal Muscular Atrophy", "SMA.aspx");
        diseaseMap6.put("Parkinson's Disease", "PD.aspx");
        diseaseMap6.put("Spinal Cord Injury", "SCI.aspx");
        diseaseMap6.put("Stroke", "Stroke.aspx");
        diseaseMap6.put("Traumatic Brain Injury", "TBI.aspx");

        int startingPage = 11;

        int nbOfThreads = 4;
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
/*

        int nbOfDisease = diseaseMap1.size();
        Thread[] t1 = new Thread[nbOfDisease];

        int i = 0;
        Iterator it = diseaseMap1.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();
            System.out.println(pair.getKey() + " = " + pair.getValue());
            it.remove(); // avoids a ConcurrentModificationException
            FindMissingForms loader = new FindMissingForms("https://commondataelements.ninds.nih.gov/" + pair.getValue(), mongoOperation);
            t1[i] = new Thread(loader);
            i++;
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
*/

        System.exit(0);
    }
}
