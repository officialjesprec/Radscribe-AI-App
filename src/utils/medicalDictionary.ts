/**
 * Comprehensive Medical & Radiological Terminology Database
 * Covers anatomical structures, radiological pathologies, modalities,
 * contrast media, and clinical abbreviations/acronyms.
 */

export interface MedicalTermEntry {
  term: string;
  category: "anatomy" | "pathology" | "procedure" | "radiology_finding" | "contrast" | "classification";
  definition?: string;
  commonMisspellings?: string[];
  confusedWith?: {
    term: string;
    dangerLevel: "critical" | "warning" | "advisory";
    explanation: string;
  };
}

export interface RadiologyAcronymEntry {
  acronym: string;
  expansion: string;
  category: "modality" | "anatomy" | "pathology" | "procedure" | "measurement" | "classification";
  clinicalContext: string;
}

// Extensive dictionary of standardized radiological terminology
export const MEDICAL_RADIOLOGY_LEXICON: MedicalTermEntry[] = [
  // Lungs & Thorax
  { term: "pneumothorax", category: "pathology", definition: "Presence of air in the pleural cavity causing lung collapse." },
  { term: "pneumoperitoneum", category: "pathology", definition: "Presence of free gas within the peritoneal cavity." },
  { term: "pneumomediastinum", category: "pathology", definition: "Air or gas in the mediastinum." },
  { term: "pneumonitis", category: "pathology", definition: "Inflammation of lung tissue, typically non-infectious." },
  { term: "atelectasis", category: "radiology_finding", definition: "Collapse or closure of a lung resulting in reduced or absent gas exchange." },
  { term: "bronchiectasis", category: "pathology", definition: "Permanent dilation and thickening of the bronchial walls." },
  { term: "consolidation", category: "radiology_finding", definition: "Alveolar airspace filling by fluid, pus, blood, cells or other substance." },
  { term: "cardiomegaly", category: "radiology_finding", definition: "Enlargement of the heart beyond standard cardiothoracic ratio." },
  { term: "cardiomediastinal", category: "anatomy", definition: "Relating to the heart and the mediastinum." },
  { term: "pleurodesis", category: "procedure", definition: "Medical procedure to obliterate the pleural space." },
  { term: "bronchovascular", category: "anatomy", definition: "Pertaining to bronchi and pulmonary blood vessels." },
  { term: "interstitial", category: "radiology_finding", definition: "Referring to the tissue framework of the lung parenchyma." },
  { term: "lymphadenopathy", category: "pathology", definition: "Enlargement or disease of the lymph nodes." },
  { term: "tracheobronchial", category: "anatomy", definition: "Relating to the trachea and bronchi." },

  // Abdomen, Pelvis & GI
  { term: "appendicitis", category: "pathology", definition: "Acute inflammation of the vermiform appendix." },
  { term: "appendicolith", category: "radiology_finding", definition: "Calcified fecal deposit in the appendix." },
  { term: "cholelithiasis", category: "pathology", definition: "Gallstones in the gallbladder." },
  { term: "choledocholithiasis", category: "pathology", definition: "Presence of gallstones within the common bile duct." },
  { term: "cholecystitis", category: "pathology", definition: "Inflammation of the gallbladder wall." },
  { term: "diverticulitis", category: "pathology", definition: "Inflammation or infection of colon diverticula." },
  { term: "intussusception", category: "pathology", definition: "Telescoping of a segment of intestine into an adjacent segment." },
  { term: "pancreatitis", category: "pathology", definition: "Inflammation of the pancreas, categorized by Balthazar criteria." },
  { term: "hydronephrosis", category: "pathology", definition: "Dilation and distension of the renal pelvis and calyces." },
  { term: "hydroureter", category: "pathology", definition: "Abnormal distension and dilation of the ureter." },
  { term: "nephrolithiasis", category: "pathology", definition: "Renal calculi or kidney stones." },
  { term: "peristalsis", category: "anatomy", definition: "Involuntary muscle contractions of the alimentary canal." },
  { term: "steatosis", category: "pathology", definition: "Hepatic fat accumulation (hepatic steatosis)." },
  { term: "splenomegaly", category: "pathology", definition: "Abnormal enlargement of the spleen." },
  { term: "hepatosplenomegaly", category: "pathology", definition: "Enlargement of both the liver and the spleen." },
  { term: "retroperitoneal", category: "anatomy", definition: "Anatomical space behind the peritoneum." },
  { term: "periappendiceal", category: "anatomy", definition: "Surrounding the appendix (e.g. fat stranding)." },
  { term: "pericholecystic", category: "anatomy", definition: "Surrounding the gallbladder (e.g. pericholecystic fluid)." },

  // Brain & Neuro
  { term: "parenchyma", category: "anatomy", definition: "The functional tissue of an organ (e.g. brain or liver parenchyma)." },
  { term: "encephalopathy", category: "pathology", definition: "Any diffuse disease of the brain that alters brain function or structure." },
  { term: "hydrocephalus", category: "pathology", definition: "Abnormal accumulation of cerebrospinal fluid within brain ventricles." },
  { term: "ischemia", category: "pathology", definition: "Inadequate blood supply to an organ or part of the body." },
  { term: "infarction", category: "pathology", definition: "Tissue death caused by lack of blood supply." },
  { term: "glioma", category: "pathology", definition: "Type of tumor that occurs in the brain and spinal cord." },
  { term: "meningioma", category: "pathology", definition: "Typically benign tumor arising from the meninges." },
  { term: "microangiopathy", category: "pathology", definition: "Disease of the small blood vessels (e.g. chronic small vessel ischemic disease)." },
  { term: "periventricular", category: "anatomy", definition: "Area around the lateral ventricles of the brain." },
  { term: "demyelination", category: "pathology", definition: "Loss of the myelin sheath covering nerves." },
  { term: "subarachnoid", category: "anatomy", definition: "Space between the arachnoid membrane and the pia mater." },
  { term: "cerebellopontine", category: "anatomy", definition: "Anatomical angle between the cerebellum and the pons." },

  // Musculoskeletal & Spine
  { term: "spondylolisthesis", category: "pathology", definition: "Forward or backward slippage of one vertebra relative to another." },
  { term: "spondylolysis", category: "pathology", definition: "Defect or stress fracture in the pars interarticularis of the vertebral arch." },
  { term: "spondylosis", category: "pathology", definition: "Degenerative osteoarthritis of the spine." },
  { term: "radiculopathy", category: "pathology", definition: "Nerve root compression or irritation causing pain, numbness, or weakness." },
  { term: "osteopenia", category: "pathology", definition: "Reduced bone mass below normal levels." },
  { term: "osteoporosis", category: "pathology", definition: "Systemic skeletal condition characterized by low bone mass and microarchitectural deterioration." },
  { term: "osteoarthritis", category: "pathology", definition: "Degenerative joint disease caused by cartilage loss." },
  { term: "acetabulum", category: "anatomy", definition: "The socket of the hip bone receiving the head of the femur." },
  { term: "glenohumeral", category: "anatomy", definition: "Relating to the glenoid cavity and humerus (shoulder joint)." },
  { term: "acromioclavicular", category: "anatomy", definition: "Joint between the acromion of the scapula and the clavicle." },
  { term: "metaphysis", category: "anatomy", definition: "Narrow portion of a long bone between the epiphysis and the diaphysis." },
  { term: "epiphysis", category: "anatomy", definition: "The end part of a long bone." },
  { term: "diaphysis", category: "anatomy", definition: "The shaft or central part of a long bone." },

  // Imaging Characteristics
  { term: "hyperattenuating", category: "radiology_finding", definition: "Having higher CT density/attenuation than surrounding tissue (appears whiter)." },
  { term: "hypoattenuating", category: "radiology_finding", definition: "Having lower CT density/attenuation than surrounding tissue (appears darker)." },
  { term: "isoattenuating", category: "radiology_finding", definition: "Having equal CT density/attenuation to adjacent structures." },
  { term: "hyperechoic", category: "radiology_finding", definition: "Ultrasound structure that reflects more sound waves (bright)." },
  { term: "hypoechoic", category: "radiology_finding", definition: "Ultrasound structure that reflects fewer sound waves (dark)." },
  { term: "anechoic", category: "radiology_finding", definition: "Ultrasound structure that produces no echoes (pure fluid, completely black)." },
  { term: "hyperintense", category: "radiology_finding", definition: "MRI signal higher than reference tissue (bright)." },
  { term: "hypointense", category: "radiology_finding", definition: "MRI signal lower than reference tissue (dark)." },
  { term: "isointense", category: "radiology_finding", definition: "MRI signal equal to reference tissue." },
  { term: "radiopaque", category: "radiology_finding", definition: "Opaque to X-rays (absorbs radiation, appearing white/light)." },
  { term: "radiolucent", category: "radiology_finding", definition: "Permitting the passage of radiant energy (appearing dark on radiograph)." },
  { term: "enhancement", category: "radiology_finding", definition: "Increased signal intensity or CT attenuation after contrast administration." },

  // Contrast & Safety
  { term: "gadolinium", category: "contrast", definition: "Paramagnetic rare-earth metal contrast agent used in MRI." },
  { term: "iodinated", category: "contrast", definition: "Containing iodine, used as contrast media in CT and fluoroscopy." },
  { term: "nephrotoxicity", category: "pathology", definition: "Toxic effect of substances on the kidneys." },
  { term: "extravasation", category: "pathology", definition: "Inadvertent leakage of intravenous contrast into surrounding soft tissue." },
];

// Common clinical acronyms and abbreviations in radiology
export const RADIOLOGY_ACRONYMS: RadiologyAcronymEntry[] = [
  // Modalities & Imaging Protocols
  { acronym: "CXR", expansion: "Chest X-Ray", category: "modality", clinicalContext: "Plain film radiograph of the chest (PA and lateral views)." },
  { acronym: "CTPA", expansion: "Computed Tomography Pulmonary Angiography", category: "procedure", clinicalContext: "Contrast-enhanced helical CT optimized for pulmonary embolism evaluation." },
  { acronym: "CTA", expansion: "Computed Tomography Angiography", category: "procedure", clinicalContext: "Vascular CT imaging with bolus arterial contrast." },
  { acronym: "MRA", expansion: "Magnetic Resonance Angiography", category: "procedure", clinicalContext: "MRI focused on blood vessels (time-of-flight or contrast-enhanced)." },
  { acronym: "MRCP", expansion: "Magnetic Resonance Cholangiopancreatography", category: "procedure", clinicalContext: "Non-invasive MRI evaluation of biliary and pancreatic ducts." },
  { acronym: "ERCP", expansion: "Endoscopic Retrograde Cholangiopancreatography", category: "procedure", clinicalContext: "Fluoroscopic and endoscopic study of biliary ducts." },
  { acronym: "FLAIR", expansion: "Fluid-Attenuated Inversion Recovery", category: "modality", clinicalContext: "MRI pulse sequence with CSF signal suppression, optimal for MS and periventricular lesions." },
  { acronym: "DWI", expansion: "Diffusion-Weighted Imaging", category: "modality", clinicalContext: "MRI sequence sensitive to Brownian motion of water molecules, diagnostic for acute stroke." },
  { acronym: "ADC", expansion: "Apparent Diffusion Coefficient", category: "modality", clinicalContext: "Quantitative map confirming true cytotoxic edema (low ADC) vs T2 shine-through." },
  { acronym: "STIR", expansion: "Short Tau Inversion Recovery", category: "modality", clinicalContext: "Fat-suppressed MRI sequence highlighting bone marrow edema and inflammation." },
  { acronym: "FDG-PET", expansion: "Fluorodeoxyglucose Positron Emission Tomography", category: "modality", clinicalContext: "Metabolic imaging using 18F-FDG radiotracer for oncology and infection." },

  // Clinical & Pathological
  { acronym: "PE", expansion: "Pulmonary Embolism", category: "pathology", clinicalContext: "Obstruction of one or more pulmonary arteries by a thrombus." },
  { acronym: "DVT", expansion: "Deep Vein Thrombosis", category: "pathology", clinicalContext: "Formation of a blood clot within deep veins, usually in lower extremities." },
  { acronym: "SAH", expansion: "Subarachnoid Hemorrhage", category: "pathology", clinicalContext: "Bleeding into the subarachnoid space, often from ruptured aneurysm." },
  { acronym: "SDH", expansion: "Subdural Hematoma", category: "pathology", clinicalContext: "Collection of blood beneath the dura mater, crescentic in shape." },
  { acronym: "EDH", expansion: "Epidural Hematoma", category: "pathology", clinicalContext: "Arterial hemorrhage between inner table of skull and dura, biconvex (lentiform)." },
  { acronym: "LVO", expansion: "Large Vessel Occlusion", category: "pathology", clinicalContext: "Acute occlusion of major cerebral arteries (ICA, MCA M1, basilar) requiring thrombectomy." },
  { acronym: "AAA", expansion: "Abdominal Aortic Aneurysm", category: "pathology", clinicalContext: "Focal dilation of abdominal aorta exceeding 3.0 cm." },
  { acronym: "COPD", expansion: "Chronic Obstructive Pulmonary Disease", category: "pathology", clinicalContext: "Chronic airflow limitation caused by emphysema and chronic bronchitis." },
  { acronym: "IPF", expansion: "Idiopathic Pulmonary Fibrosis", category: "pathology", clinicalContext: "Progressive fibrosing interstitial pneumonia characterized by UIP pattern." },
  { acronym: "UIP", expansion: "Usual Interstitial Pneumonia", category: "pathology", clinicalContext: "Histologic and CT pattern characterized by subpleural basilar honeycombing." },
  { acronym: "IVC", expansion: "Inferior Vena Cava", category: "anatomy", clinicalContext: "Large retroperitoneal vein returning deoxygenated blood to right atrium." },
  { acronym: "SMA", expansion: "Superior Mesenteric Artery", category: "anatomy", clinicalContext: "Anterior visceral branch of abdominal aorta supplying midgut." },
  { acronym: "SMV", expansion: "Superior Mesenteric Vein", category: "anatomy", clinicalContext: "Major mesenteric vein draining small intestine and ascending colon." },
  { acronym: "CBD", expansion: "Common Bile Duct", category: "anatomy", clinicalContext: "Duct formed by cystic duct and common hepatic duct, draining into duodenum." },

  // Classifications & Reporting Systems
  { acronym: "BI-RADS", expansion: "Breast Imaging Reporting and Data System", category: "classification", clinicalContext: "Standardized risk assessment tool for breast imaging (Categories 0-6)." },
  { acronym: "TI-RADS", expansion: "Thyroid Imaging Reporting and Data System", category: "classification", clinicalContext: "Ultrasound scoring system for thyroid nodules based on ACR guidelines." },
  { acronym: "LI-RADS", expansion: "Liver Imaging Reporting and Data System", category: "classification", clinicalContext: "Diagnostic algorithm for hepatic lesions in patients with cirrhosis/HCC risk." },
  { acronym: "PI-RADS", expansion: "Prostate Imaging Reporting and Data System", category: "classification", clinicalContext: "Multiparametric prostate MRI scoring for clinically significant prostate cancer." },
  { acronym: "LUNG-RADS", expansion: "Lung CT Screening Reporting and Data System", category: "classification", clinicalContext: "Quality assurance tool to standardize CT lung cancer screening findings." },

  // Projections & Quadrants
  { acronym: "PA", expansion: "Posteroanterior", category: "procedure", clinicalContext: "X-ray beam enters posterior aspect and exits anteriorly to image receptor." },
  { acronym: "AP", expansion: "Anteroposterior", category: "procedure", clinicalContext: "X-ray beam enters anterior aspect (standard for portable bed-bound radiography)." },
  { acronym: "RLQ", expansion: "Right Lower Quadrant", category: "anatomy", clinicalContext: "Abdominal anatomical division containing cecum and appendix." },
  { acronym: "RUQ", expansion: "Right Upper Quadrant", category: "anatomy", clinicalContext: "Abdominal anatomical division containing liver and gallbladder." },
  { acronym: "LLQ", expansion: "Left Lower Quadrant", category: "anatomy", clinicalContext: "Abdominal division containing sigmoid colon." },
  { acronym: "LUQ", expansion: "Left Upper Quadrant", category: "anatomy", clinicalContext: "Abdominal division containing stomach and spleen." },
];

// Dangerous medical confusions, acoustic near-misses, and homophones
export const HIGH_RISK_CONFUSIONS: Array<{
  tokenPattern: RegExp;
  targetTerm: string;
  confusedWith: string;
  dangerLevel: "critical" | "warning";
  explanation: string;
}> = [
  {
    tokenPattern: /\bdysphasia\b/i,
    targetTerm: "dysphasia",
    confusedWith: "dysphagia",
    dangerLevel: "critical",
    explanation: "'dysphasia' indicates speech impairment (neurological); 'dysphagia' indicates difficulty swallowing (GI/swallow study).",
  },
  {
    tokenPattern: /\bdysphagia\b/i,
    targetTerm: "dysphagia",
    confusedWith: "dysphasia",
    dangerLevel: "critical",
    explanation: "'dysphagia' indicates swallowing difficulty; verify if neurology/stroke patient has speech impairment ('dysphasia') instead.",
  },
  {
    tokenPattern: /\bilium\b/i,
    targetTerm: "ilium",
    confusedWith: "ileum",
    dangerLevel: "critical",
    explanation: "'ilium' is the pelvic bone (skeletal); 'ileum' is the distal small bowel (GI).",
  },
  {
    tokenPattern: /\bileum\b/i,
    targetTerm: "ileum",
    confusedWith: "ilium",
    dangerLevel: "critical",
    explanation: "'ileum' is the distal small bowel; 'ilium' is the pelvic bone.",
  },
  {
    tokenPattern: /\bperoneal\b/i,
    targetTerm: "peroneal",
    confusedWith: "perineal",
    dangerLevel: "warning",
    explanation: "'peroneal' refers to the fibular/lateral lower leg; 'perineal' refers to pelvic floor/perineum.",
  },
  {
    tokenPattern: /\bperineal\b/i,
    targetTerm: "perineal",
    confusedWith: "peroneal",
    dangerLevel: "warning",
    explanation: "'perineal' refers to pelvic floor/perineum; 'peroneal' refers to the lateral lower leg.",
  },
  {
    tokenPattern: /\bhypoattenuating\b/i,
    targetTerm: "hypoattenuating",
    confusedWith: "hyperattenuating",
    dangerLevel: "critical",
    explanation: "Confirm lesion density: 'hypoattenuating' (low density/fluid/fat) vs 'hyperattenuating' (high density/calcification/hemorrhage).",
  },
  {
    tokenPattern: /\bhyperattenuating\b/i,
    targetTerm: "hyperattenuating",
    confusedWith: "hypoattenuating",
    dangerLevel: "critical",
    explanation: "Confirm lesion density: 'hyperattenuating' (high density/acute blood/contrast) vs 'hypoattenuating' (low density/edema/cysts).",
  },
  {
    tokenPattern: /\bextravasation\b/i,
    targetTerm: "extravasation",
    confusedWith: "enhancement",
    dangerLevel: "critical",
    explanation: "'extravasation' is active bleeding or contrast leakage outside vessels; verify clinical distinction from standard enhancement.",
  },
  {
    tokenPattern: /\bhemiplegia\b/i,
    targetTerm: "hemiplegia",
    confusedWith: "hemiparesis",
    dangerLevel: "warning",
    explanation: "'hemiplegia' denotes total paralysis of one side of the body; 'hemiparesis' denotes weakness.",
  },
  {
    tokenPattern: /\bmicrocalcification\b/i,
    targetTerm: "microcalcification",
    confusedWith: "macrocalcification",
    dangerLevel: "critical",
    explanation: "In mammography: 'microcalcifications' may herald DCIS malignancy; 'macrocalcifications' are almost always benign.",
  },
];
