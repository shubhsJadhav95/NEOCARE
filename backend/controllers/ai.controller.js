// ADVANCED MEDICAL KNOWLEDGE GRAPH (Strictly Preserved)
const DISEASE_DB = [
  {
    id: "migraine", name: "Migraine", specialist: "Neurologist", severity: "Moderate",
    symptoms: ["headache", "sensitivity to light", "nausea", "throbbing", "aura"],
    exclude: ["fever", "stiff neck"],
    causes: "Neurological vascular dilation often triggered by stress or diet.",
    tips: ["Rest in a dark room", "Hydrate with electrolytes", "Apply cold compress"]
  },
  {
    id: "vertigo", name: "Vertigo / BPPV", specialist: "Neurologist", severity: "Moderate",
    symptoms: ["dizzy", "spinning", "loss of balance", "tinnitus"],
    exclude: ["fever", "chest pain"],
    causes: "Inner ear crystal displacement or vestibular nerve inflammation.",
    tips: ["Avoid sudden head movements", "Sit down immediately", "Epley maneuver"]
  },
  {
    id: "stroke", name: "Acute Stroke", specialist: "Neurologist (EMERGENCY)", severity: "High",
    symptoms: ["slurred speech", "facial droop", "arm weakness", "confusion", "numbness"],
    causes: "Interruption of blood supply to the brain.",
    tips: ["CALL EMERGENCY SERVICES IMMEDIATELY", "Do not give any food or drink", "Note the time symptoms started"]
  },
  {
    id: "heart_attack", name: "Myocardial Infarction (Heart Attack)", specialist: "Cardiologist", severity: "High",
    symptoms: ["chest pain", "left arm pain", "jaw pain", "sweating", "shortness of breath"],
    causes: "Blockage of coronary arteries.",
    tips: ["Call for an ambulance", "Sit upright", "Loosen tight clothing"]
  },
  {
    id: "hypertension", name: "Hypertension (High BP)", specialist: "Cardiologist", severity: "Moderate",
    symptoms: ["blurred vision", "nosebleed", "headache", "palpitations"],
    causes: "Chronic high pressure against artery walls.",
    tips: ["Reduce salt intake", "Practice deep breathing", "Check BP every 4 hours"]
  },
  {
    id: "loose_motion", name: "Gastroenteritis (Loose Motion)", specialist: "Gastroenterologist", severity: "Moderate",
    symptoms: ["diarrhea", "loose motion", "stomach cramps", "vomit", "dehydration"],
    causes: "Viral or bacterial infection of the digestive tract.",
    tips: ["Drink ORS (Oral Rehydration Solution)", "Eat BRAT diet (Banana, Rice, Apple, Toast)", "Avoid dairy"]
  },
  {
    id: "acid_reflux", name: "GERD (Acid Reflux)", specialist: "Gastroenterologist", severity: "Low",
    symptoms: ["heartburn", "acid taste", "bloating", "chest burning"],
    exclude: ["shortness of breath"],
    causes: "Stomach acid flowing back into the esophagus.",
    tips: ["Do not lie down after eating", "Avoid spicy/fatty foods", "Eat small portions"]
  },
  {
    id: "eczema", name: "Eczema / Dermatitis", specialist: "Dermatologist", severity: "Low",
    symptoms: ["itchy skin", "red rash", "dry skin", "flaky skin"],
    causes: "Immune system overreaction to environmental triggers.",
    tips: ["Use fragrance-free moisturizers", "Avoid hot showers", "Wear cotton clothes"]
  },
  {
    id: "fungal_infection", name: "Fungal Infection (Ringworm)", specialist: "Dermatologist", severity: "Low",
    symptoms: ["circular rash", "itching", "skin peeling"],
    causes: "Fungal growth on the skin surface.",
    tips: ["Keep the area dry", "Do not share towels", "Wear loose clothing"]
  },
  {
    id: "arthritis", name: "Rheumatoid Arthritis", specialist: "Orthopedic", severity: "Moderate",
    symptoms: ["joint pain", "stiffness", "swelling", "morning stiffness"],
    causes: "Autoimmune inflammation of the joints.",
    tips: ["Apply warm compress", "Perform low-impact exercises", "Maintain a healthy weight"]
  },
  {
    id: "measles", name: "Measles", specialist: "Pediatrician", severity: "Moderate",
    symptoms: ["child", "fever", "red spots", "cough", "runny nose"],
    causes: "Highly contagious viral infection.",
    tips: ["Isolate the child", "Ensure plenty of fluids", "Consult doctor for vitamin A"]
  },
  {
    id: "anxiety", name: "Generalized Anxiety Disorder", specialist: "Psychiatrist", severity: "Moderate",
    symptoms: ["panic", "restless", "racing heart", "worry", "insomnia"],
    causes: "Biological and environmental stress factors.",
    tips: ["4-7-8 Breathing exercise", "Reduce caffeine", "Journal your thoughts"]
  }
];

const performInference = (input) => {
  const text = input.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;
  DISEASE_DB.forEach(disease => {
    let score = 0;
    disease.symptoms.forEach(s => { if (text.includes(s)) score += 10; });
    if (disease.exclude) {
      disease.exclude.forEach(e => {
        if (text.includes(`no ${e}`) || text.includes(`don't have ${e}`) || text.includes(`not having ${e}`)) { score += 15; }
        if (text.includes(e) && !text.includes(`no ${e}`)) { score -= 25; }
      });
    }
    if (score > highestScore) { highestScore = score; bestMatch = disease; }
  });
  if (bestMatch && highestScore >= 10) {
    return {
      causes: `Clinical indicators suggest ${bestMatch.name}. ${bestMatch.causes}`,
      severity: bestMatch.severity,
      specialist: bestMatch.specialist,
      tips: bestMatch.tips,
      redFlags: bestMatch.severity === "High" ? ["Seek Urgent Clinical Evaluation"] : []
    };
  }
  return {
    causes: "Symptoms are broad. Further clinical examination required.",
    severity: "Moderate",
    specialist: "General Physician",
    tips: ["Keep a log of symptoms", "Monitor temperature", "Stay hydrated"],
    redFlags: []
  };
};

exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ message: "No symptoms provided." });
    const result = performInference(symptoms);
    res.json(result);
  } catch (err) { res.status(500).json({ message: "AI Engine Processing Error" }); }
};

// FIXED LOGIC: Strict destructing and validation to fix 400 Bad Request
exports.translateText = async (req, res) => {
  try {
    const text = req.body.text;
    const targetLang = req.body.targetLang || 'en';
    
    if (!text) {
      return res.status(400).json({ message: "Missing 'text' field in request body." });
    }

    // Logic: Return translated simulation
    const translatedText = `[AI ${targetLang.toUpperCase()}]: ${text}`;
    res.json({ translatedText });
  } catch (err) {
    console.error("Translate Controller Error:", err);
    res.status(500).json({ message: "Translation Error" });
  }
};