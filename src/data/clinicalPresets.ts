export interface ClinicalPreset {
  id: string;
  title: string;
  modality: "XR" | "CT" | "MR" | "US" | "MG";
  clinicalIndication: string;
  rawSpokenDictation: string;
  expectedSections: string[];
  isEmergencyAlert?: boolean;
}

export const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: "chest-xr-pneumonia",
    title: "Chest X-Ray 2 Views (Pneumonia vs Effusion)",
    modality: "XR",
    clinicalIndication: "Fever, cough, left pleuritic chest pain. Rule out pneumonia.",
    rawSpokenDictation: `Exam chest x-ray two views PA and lateral period Clinical indication fever, leukocytosis, and pleuritic left lower chest pain period Technique upright PA and lateral radiographs period Comparison prior chest radiograph dated 6 months ago period Findings the cardiomediastinal silhouette and hilar contours are within normal limits period There is dense airspace consolidation in the left lower lobe with air bronchograms period Small associated left pleural effusion is noted period Right lung is clear without focal infiltrate or effusion period Osseous structures intact no acute fracture period Impression number one left lower lobe consolidation consistent with acute bacterial pneumonia period Number two small left-sided reactive pleural effusion period Recommend clinical follow-up after antibiotic completion period`,
    expectedSections: ["EXAMINATION", "CLINICAL INDICATION", "TECHNIQUE", "COMPARISON", "FINDINGS", "IMPRESSION"],
  },
  {
    id: "ct-abdomen-appendicitis",
    title: "CT Abdomen & Pelvis (Acute Appendicitis)",
    modality: "CT",
    clinicalIndication: "28-year-old male with 24 hours of periumbilical pain radiating to RLQ, rebound tenderness.",
    rawSpokenDictation: `Exam CT abdomen and pelvis with IV contrast period Clinical indication right lower quadrant pain, fever, suspected appendicitis period Technique axial helical CT images of abdomen and pelvis obtained following administration of 100 cc Omnipaque IV contrast period Comparison none period Findings liver, spleen, pancreas, adrenals, and kidneys enhance symmetrically without focal lesion period In the right lower quadrant the appendix is dilated measuring 11 millimeters in outer diameter with mucosal hyperenhancement and marked periappendiceal fat stranding period A 4 millimeter calcified appendicolith is identified at the appendiceal base period No appendiceal wall discontinuity or loculated fluid collection to suggest perforation period No free intra-abdominal air period Impression number one findings compatible with acute non-perforated appendicitis with appendicolith period Number two no evidence of perforation or phlegmon period General surgery consultation recommended period`,
    expectedSections: ["EXAMINATION", "CLINICAL INDICATION", "TECHNIQUE", "FINDINGS", "IMPRESSION"],
  },
  {
    id: "cta-pulmonary-embolism",
    title: "CTA Chest (Acute Pulmonary Embolism - Critical Alert)",
    modality: "CT",
    clinicalIndication: "Sudden onset dyspnea, tachycardia, hypoxia, elevated D-dimer. Rule out PE.",
    rawSpokenDictation: `Exam CTA chest for pulmonary embolism period Clinical indication acute shortness of breath and hypoxia in postoperative orthopedic patient period Technique CT angiogram of the chest following bolus injection of iodinated contrast timed for peak pulmonary arterial enhancement period Comparison chest x-ray from yesterday period Findings high attenuation pulmonary arterial enhancement achieved period There is a large saddle pulmonary embolism extending across the bifurcation of the main pulmonary artery with occlusive filling defects in the right and left main pulmonary arteries period Right ventricular to left ventricular diameter ratio is 1.4 indicating right heart strain period Flattening of the interventricular septum noted period No pulmonary infarction or pleural effusion period Impression number one acute saddle pulmonary embolism with extensive bilateral main pulmonary arterial clot burden period Number two imaging signs of acute right ventricular strain period CRITICAL FINDING directly communicated to emergency department attending physician Dr Smith at 1435 hours period`,
    expectedSections: ["EXAMINATION", "CLINICAL INDICATION", "TECHNIQUE", "FINDINGS", "IMPRESSION", "CRITICAL FINDINGS"],
    isEmergencyAlert: true,
  },
  {
    id: "mri-brain-ms",
    title: "MRI Brain (Demyelinating Disease / MS)",
    modality: "MR",
    clinicalIndication: "34-year-old female with optic neuritis, right upper extremity paresthesias.",
    rawSpokenDictation: `Exam MRI brain with and without IV gadolinium contrast period Clinical indication optic neuritis and parasthesias, evaluate for multiple sclerosis period Technique multiplanar multisequence MRI of the brain including axial T1, T2, FLAIR, diffusion weighted imaging, and post-contrast T1 weighted images period Comparison none period Findings there are numerous punctate and ovoid hyperintense lesions on T2 and FLAIR located in the periventricular and subcortical white matter, callososeptal interface, and right middle cerebellar peduncle period Several periventricular lesions demonstrate typical Dawson finger orientation perpendicular to the lateral ventricles period Following gadolinium administration, two left centrum semiovale lesions demonstrate avid nodular enhancement indicating active demyelination period No diffusion restriction to suggest acute territorial infarction period Normal intracranial flow voids period Impression number one extensive demyelinating plaque burden demonstrating dissemination in space and dissemination in time meeting McDonald criteria for multiple sclerosis period Number two two active enhancing lesions in the left centrum semiovale period Recommend neurology consultation period`,
    expectedSections: ["EXAMINATION", "CLINICAL INDICATION", "TECHNIQUE", "FINDINGS", "IMPRESSION"],
  },
  {
    id: "mri-lumbar-spine",
    title: "MRI Lumbar Spine (Radiculopathy & Disc Herniation)",
    modality: "MR",
    clinicalIndication: "Severe low back pain radiating down right leg to L5 dermatome. Positive straight leg raise.",
    rawSpokenDictation: `Exam MRI lumbar spine without contrast period Clinical indication right L5 radiculopathy and intractable back pain period Technique sagittal T1 and T2, axial T1 and T2 weighted MR images of the lumbar spine period Comparison lumbar spine radiographs from last week period Findings alignment of the lumbar spine is anatomic period Normal vertebral body heights and bone marrow signal period Conus medullaris terminates normally at L1-L2 period At L4-L5 there is moderate disc space narrowing and disc desiccation with a 6 millimeter right paracentral extruded disc fragment with superior migration period This causes severe right subarticular recess stenosis with impingement of the exiting right L5 nerve root and moderate thecal sac compression period L1-L2 through L3-L4 are unremarkable without canal stenosis period L5-S1 demonstrates mild broad based disc bulge without nerve root contact period Impression number one L4-L5 right paracentral disc extrusion with superior migration causing severe right lateral recess stenosis and impingement of the traversing right L5 nerve root corresponding to the patient's symptoms period Number two mild spondylosis at L5-S1 period`,
    expectedSections: ["EXAMINATION", "CLINICAL INDICATION", "TECHNIQUE", "FINDINGS", "IMPRESSION"],
  },
  {
    id: "mammogram-screening",
    title: "Screening Mammography (BI-RADS 2 Benign)",
    modality: "MG",
    clinicalIndication: "Annual screening examination in an asymptomatic 52-year-old female.",
    rawSpokenDictation: `Exam bilateral screening digital mammography with 3D digital breast tomosynthesis period Clinical indication routine screening period Technique standard bilateral craniocaudal and mediolateral oblique 2D and tomosynthesis synthesized images period Comparison prior mammograms dated one year and two years ago period Findings the breasts are heterogeneously dense, which may obscure small masses period No suspicious dominant masses, architectural distortion, or grouped pleomorphic microcalcifications are identified in either breast period Stable scattered round benign punctate calcifications bilaterally period Normal bilateral axillary nodes period Impression number one negative screening mammogram without evidence of malignancy period BI-RADS Category 2 Benign findings period Recommendation routine annual screening mammography in one year period`,
    expectedSections: ["EXAMINATION", "CLINICAL INDICATION", "FINDINGS", "IMPRESSION", "BI-RADS CATEGORY"],
  },
];
