import { Hono } from 'hono';

const app = new Hono();

// Static reference data
// In a real app, these might come from a database or external medical API
const COMMON_CONDITIONS = [
  'Diabetes Type 1',
  'Diabetes Type 2',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Arthritis',
  'Thyroid Disorder',
  'Depression',
  'Anxiety',
  'Migraine',
  'Epilepsy',
  'Celiac Disease',
  'Crohn\'s Disease',
  'Lupus',
  'Eczema',
  'Psoriasis',
  'Insomnia',
  'Sleep Apnea',
  'Gastroesophageal Reflux Disease (GERD)',
  'High Cholesterol'
];

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Fish',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Penicillin',
  'Latex',
  'Pollen',
  'Dust Mites',
  'Mold',
  'Pet Dander',
  'Insect Stings',
  'Sesame',
  'Sulfites',
  'Aspirin',
  'Ibuprofen',
  'Sunscreen'
];

// Top 50 most common prescribed medications (simplified list)
const COMMON_MEDICATIONS = [
  'Atorvastatin (Lipitor)',
  'Levothyroxine (Synthroid)',
  'Lisinopril (Prinivil)',
  'Metformin (Glucophage)',
  'Amlodipine (Norvasc)',
  'Metoprolol (Lopressor)',
  'Albuterol (ProAir HFA)',
  'Omeprazole (Prilosec)',
  'Losartan (Cozaar)',
  'Gabapentin (Neurontin)',
  'Hydrochlorothiazide',
  'Sertraline (Zoloft)',
  'Simvastatin (Zocor)',
  'Montelukast (Singulair)',
  'Escitalopram (Lexapro)',
  'Acetaminophen (Tylenol)',
  'Rosuvastatin (Crestor)',
  'Bupropion (Wellbutrin)',
  'Furosemide (Lasix)',
  'Pantoprazole (Protonix)',
  'Trazodone (Desyrel)',
  'Dextroamphetamine/Amphetamine (Adderall)',
  'Fluticasone (Flonase)',
  'Tramadol (Ultram)',
  'Insulin Glargine (Lantus)',
  'Duloxetine (Cymbalta)',
  'Prednisone',
  'Tamsulosin (Flomax)',
  'Ibuprofen (Advil)',
  'Citalopram (Celexa)',
  'Meloxicam (Mobic)',
  'Pravastatin (Pravachol)',
  'Carvedilol (Coreg)',
  'Potassium Chloride',
  'Tramadol',
  'Clopidogrel (Plavix)',
  'Aspirin',
  'Ranitidine (Zantac)',
  'Atenolol (Tenormin)',
  'Cyclobenzaprine (Flexeril)',
  'Glipizide (Glucotrol)',
  'Methylphenidate (Ritalin)',
  'Azithromycin (Zithromax)',
  'Clonazepam (Klonopin)',
  'Oxycodone',
  'Allopurinol (Zyloprim)',
  'Venlafaxine (Effexor)',
  'Hydrochlorothiazide/Lisinopril',
  'Warfarin (Coumadin)'
];

app.get('/conditions', (c) => {
  const query = c.req.query('q')?.toLowerCase();
  if (query) {
    const filtered = COMMON_CONDITIONS.filter(item => 
      item.toLowerCase().includes(query)
    );
    return c.json(filtered);
  }
  return c.json(COMMON_CONDITIONS);
});

app.get('/allergies', (c) => {
  const query = c.req.query('q')?.toLowerCase();
  if (query) {
    const filtered = COMMON_ALLERGIES.filter(item => 
      item.toLowerCase().includes(query)
    );
    return c.json(filtered);
  }
  return c.json(COMMON_ALLERGIES);
});

app.get('/medications', (c) => {
  const query = c.req.query('q')?.toLowerCase();
  if (query) {
    const filtered = COMMON_MEDICATIONS.filter(item => 
      item.toLowerCase().includes(query)
    );
    return c.json(filtered);
  }
  return c.json(COMMON_MEDICATIONS);
});

export default app;
