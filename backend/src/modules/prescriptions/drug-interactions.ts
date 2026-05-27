// Known drug interactions (simplified for demo)
export const KNOWN_INTERACTIONS: { drugs: string[]; severity: 'mild' | 'moderate' | 'severe'; message: string }[] = [
  { drugs: ['warfarin', 'aspirin'], severity: 'severe', message: 'Warfarin + Aspirin: Increased bleeding risk' },
  { drugs: ['metformin', 'alcohol'], severity: 'moderate', message: 'Metformin + Alcohol: Risk of lactic acidosis' },
  { drugs: ['ssri', 'maoi'], severity: 'severe', message: 'SSRIs + MAOIs: Risk of serotonin syndrome' },
  { drugs: ['lisinopril', 'potassium'], severity: 'moderate', message: 'ACE inhibitors + Potassium: Risk of hyperkalemia' },
  { drugs: ['simvastatin', 'amiodarone'], severity: 'severe', message: 'Simvastatin + Amiodarone: Risk of myopathy' },
  { drugs: ['methotrexate', 'nsaid'], severity: 'severe', message: 'Methotrexate + NSAIDs: Increased methotrexate toxicity' },
  { drugs: ['digoxin', 'amiodarone'], severity: 'severe', message: 'Digoxin + Amiodarone: Increased digoxin levels' },
  { drugs: ['clopidogrel', 'omeprazole'], severity: 'moderate', message: 'Clopidogrel + Omeprazole: Reduced antiplatelet effect' },
  { drugs: ['tramadol', 'ssri'], severity: 'moderate', message: 'Tramadol + SSRIs: Risk of serotonin syndrome and seizures' },
  { drugs: ['fluconazole', 'warfarin'], severity: 'severe', message: 'Fluconazole + Warfarin: Significantly increased INR' },
];

export function checkInteractions(medications: string[]): { severity: 'mild' | 'moderate' | 'severe'; message: string }[] {
  const meds = medications.map(m => m.toLowerCase());
  const found: { severity: 'mild' | 'moderate' | 'severe'; message: string }[] = [];
  for (const interaction of KNOWN_INTERACTIONS) {
    const hasAll = interaction.drugs.every(d => meds.some(m => m.includes(d)));
    if (hasAll) found.push({ severity: interaction.severity, message: interaction.message });
  }
  return found;
}
