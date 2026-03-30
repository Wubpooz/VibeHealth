/**
 * Localized Content Seed
 * Seeds first-aid categories, cards, emergency numbers, helplines, wiki conditions,
 * and onboarding reference data with EN/FR translations
 */

import { prisma } from '../lib/prisma';
import { COMMON_MEDICATIONS_EN, COMMON_MEDICATIONS_FR } from '../lib/medications.reference';

// =============== FIRST AID DATA ===============

const firstAidCategoriesData = [
  { key: 'CPR', en: 'CPR & Choking', fr: 'RCP et Étouffement', icon: '❤️', color: '#ef4444' },
  { key: 'BURNS', en: 'Burns', fr: 'Brûlures', icon: '🔥', color: '#eab308' },
  { key: 'BLEEDING', en: 'Bleeding', fr: 'Saignements', icon: '🩸', color: '#dc2626' },
  { key: 'ALLERGIC_REACTIONS', en: 'Allergic Reactions', fr: 'Réactions Allergiques', icon: '🤧', color: '#84cc16' },
  { key: 'FRACTURES', en: 'Fractures', fr: 'Fractures', icon: '🦴', color: '#06b6d4' },
  { key: 'HEART_ATTACK', en: 'Heart Attack & Stroke', fr: 'Crise Cardiaque et AVC', icon: '💔', color: '#be123c' },
  { key: 'SHOCK', en: 'Shock', fr: 'Choc', icon: '😰', color: '#6366f1' },
  { key: 'SEIZURES', en: 'Seizures', fr: 'Convulsions', icon: '⚡', color: '#f59e0b' },
  { key: 'POISONING', en: 'Poisoning', fr: 'Empoisonnement', icon: '☠️', color: '#65a30d' },
  { key: 'HYPOTHERMIA', en: 'Hypothermia', fr: 'Hypothermie', icon: '🥶', color: '#0ea5e9' },
  { key: 'HEAT_STROKE', en: 'Heat-Related', fr: 'Chaleur Extrême', icon: '🥵', color: '#f43f5e' },
  { key: 'BITES_STINGS', en: 'Bites & Stings', fr: 'Morsures et Piqûres', icon: '🐝', color: '#fbbf24' },
  { key: 'DROWNING', en: 'Drowning', fr: 'Noyade', icon: '🌊', color: '#3b82f6' },
  { key: 'choking', en: 'Choking', fr: 'Étouffement', icon: '🫁', color: '#f97316' },
  { key: 'stroke', en: 'Stroke', fr: 'AVC', icon: '🧠', color: '#7c3aed' },
];

type FirstAidStepSeed = {
  order: number;
  instruction: string;
  warning?: string;
  tip?: string;
};

type FirstAidCardContentSeed = {
  titleKey: string;
  descriptionKey: string;
  steps: FirstAidStepSeed[];
  warnings: string[];
  whenToCallEmergency: string[];
  doNot: string[];
  relatedCards: string[];
};

const buildFirstAidContent = (
  prefix: string,
  stepCount: number,
  config: {
    stepWarnings?: number[];
    stepTips?: number[];
    warnings?: number[];
    call?: number[];
    doNot?: number[];
    related?: string[];
  } = {},
): FirstAidCardContentSeed => ({
  titleKey: `FIRST_AID.${prefix}.TITLE`,
  descriptionKey: `FIRST_AID.${prefix}.DESC`,
  steps: Array.from({ length: stepCount }, (_, index) => {
    const order = index + 1;
    return {
      order,
      instruction: `FIRST_AID.${prefix}.STEP_${order}`,
      warning: config.stepWarnings?.includes(order) ? `FIRST_AID.${prefix}.STEP_${order}_WARN` : undefined,
      tip: config.stepTips?.includes(order) ? `FIRST_AID.${prefix}.STEP_${order}_TIP` : undefined,
    };
  }),
  warnings: (config.warnings ?? []).map((order) => `FIRST_AID.${prefix}.WARN_${order}`),
  whenToCallEmergency: (config.call ?? []).map((order) => `FIRST_AID.${prefix}.CALL_${order}`),
  doNot: (config.doNot ?? []).map((order) => `FIRST_AID.${prefix}.DONOT_${order}`),
  relatedCards: config.related ?? [],
});

const firstAidCardsData = [
  {
    key: 'cpr-adult',
    category: 'CPR',
    severity: 'critical',
    icon: '❤️',
    content: buildFirstAidContent('CPR_ADULT', 6, {
      stepWarnings: [1],
      stepTips: [3],
      warnings: [1, 2],
      call: [1],
      doNot: [1, 2],
      related: ['choking-adult', 'heart-attack'],
    }),
  },
  {
    key: 'choking-adult',
    category: 'CPR',
    severity: 'critical',
    icon: '🫁',
    content: buildFirstAidContent('CHOKING_ADULT', 5, {
      stepTips: [3],
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['cpr-adult', 'choking-infant'],
    }),
  },
  {
    key: 'choking-infant',
    category: 'CPR',
    severity: 'critical',
    icon: '🍼',
    content: buildFirstAidContent('CHOKING_INFANT', 5, {
      warnings: [1, 2],
      call: [1],
      doNot: [1],
      related: ['choking-adult', 'cpr-adult'],
    }),
  },
  {
    key: 'burns-minor',
    category: 'BURNS',
    severity: 'minor',
    icon: '🔥',
    content: buildFirstAidContent('BURNS_MINOR', 5, {
      warnings: [1],
      doNot: [1, 2, 3],
      related: ['burns-severe'],
    }),
  },
  {
    key: 'burns-severe',
    category: 'BURNS',
    severity: 'critical',
    icon: '🚨',
    content: buildFirstAidContent('BURNS_SEVERE', 5, {
      warnings: [1],
      call: [1],
      doNot: [1, 2, 3],
      related: ['burns-minor', 'shock'],
    }),
  },
  {
    key: 'allergic-mild',
    category: 'ALLERGIC_REACTIONS',
    severity: 'moderate',
    icon: '🌼',
    content: buildFirstAidContent('ALLERGIC_MILD', 4, {
      warnings: [1],
      related: ['anaphylaxis'],
    }),
  },
  {
    key: 'anaphylaxis',
    category: 'ALLERGIC_REACTIONS',
    severity: 'critical',
    icon: '💉',
    content: buildFirstAidContent('ANAPHYLAXIS', 5, {
      stepTips: [2],
      warnings: [1, 2],
      call: [1],
      doNot: [1],
      related: ['allergic-mild'],
    }),
  },
  {
    key: 'fracture-limb',
    category: 'FRACTURES',
    severity: 'serious',
    icon: '🦴',
    content: buildFirstAidContent('FRACTURE_LIMB', 5, {
      stepTips: [4],
      warnings: [1],
      call: [1],
      doNot: [1, 2],
      related: ['fracture-spine'],
    }),
  },
  {
    key: 'fracture-spine',
    category: 'FRACTURES',
    severity: 'critical',
    icon: '🧍',
    content: buildFirstAidContent('FRACTURE_SPINE', 5, {
      warnings: [1, 2],
      call: [1],
      doNot: [1, 2, 3],
      related: ['fracture-limb'],
    }),
  },
  {
    key: 'bleeding-minor',
    category: 'BLEEDING',
    severity: 'minor',
    icon: '🩹',
    content: buildFirstAidContent('BLEEDING_MINOR', 5, {
      doNot: [1],
      related: ['bleeding-severe'],
    }),
  },
  {
    key: 'bleeding-severe',
    category: 'BLEEDING',
    severity: 'critical',
    icon: '🩸',
    content: buildFirstAidContent('BLEEDING_SEVERE', 5, {
      warnings: [1],
      call: [1],
      doNot: [1, 2],
      related: ['bleeding-minor', 'shock'],
    }),
  },
  {
    key: 'heart-attack',
    category: 'HEART_ATTACK',
    severity: 'critical',
    icon: '❤️‍🩹',
    content: buildFirstAidContent('HEART_ATTACK', 5, {
      stepTips: [3],
      warnings: [1, 2],
      call: [1],
      doNot: [1],
      related: ['stroke', 'cpr-adult'],
    }),
  },
  {
    key: 'stroke',
    category: 'HEART_ATTACK',
    severity: 'critical',
    icon: '🧠',
    content: buildFirstAidContent('STROKE', 5, {
      warnings: [1],
      call: [1],
      doNot: [1, 2],
      related: ['heart-attack'],
    }),
  },
  {
    key: 'shock',
    category: 'SHOCK',
    severity: 'critical',
    icon: '⚠️',
    content: buildFirstAidContent('SHOCK', 5, {
      warnings: [1],
      call: [1],
      doNot: [1, 2],
      related: ['bleeding-severe'],
    }),
  },
  {
    key: 'seizures',
    category: 'SEIZURES',
    severity: 'serious',
    icon: '🫨',
    content: buildFirstAidContent('SEIZURES', 5, {
      warnings: [1],
      call: [1, 2],
      doNot: [1, 2, 3],
      related: ['shock'],
    }),
  },
  {
    key: 'poisoning',
    category: 'POISONING',
    severity: 'serious',
    icon: '☠️',
    content: buildFirstAidContent('POISONING', 5, {
      warnings: [1],
      call: [1],
      doNot: [1, 2, 3],
      related: ['anaphylaxis'],
    }),
  },
  {
    key: 'hypothermia',
    category: 'HYPOTHERMIA',
    severity: 'serious',
    icon: '🥶',
    content: buildFirstAidContent('HYPOTHERMIA', 5, {
      stepTips: [4],
      warnings: [1],
      call: [1],
      doNot: [1, 2],
      related: ['heat-stroke'],
    }),
  },
  {
    key: 'heat-stroke',
    category: 'HEAT_STROKE',
    severity: 'critical',
    icon: '☀️',
    content: buildFirstAidContent('HEAT_STROKE', 5, {
      warnings: [1, 2],
      call: [1],
      doNot: [1, 2],
      related: ['hypothermia'],
    }),
  },
  {
    key: 'bee-sting',
    category: 'BITES_STINGS',
    severity: 'moderate',
    icon: '🐝',
    content: buildFirstAidContent('BEE_STING', 5, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['anaphylaxis', 'snake-bite'],
    }),
  },
  {
    key: 'snake-bite',
    category: 'BITES_STINGS',
    severity: 'critical',
    icon: '🐍',
    content: buildFirstAidContent('SNAKE_BITE', 5, {
      warnings: [1],
      call: [1],
      doNot: [1, 2, 3],
      related: ['bee-sting'],
    }),
  },
  {
    key: 'drowning',
    category: 'DROWNING',
    severity: 'critical',
    icon: '🌊',
    content: buildFirstAidContent('DROWNING', 5, {
      stepWarnings: [1],
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['cpr-adult'],
    }),
  },  {
    key: 'nosebleed',
    category: 'BLEEDING',
    severity: 'minor',
    icon: '👃',
    content: buildFirstAidContent('NOSEBLEED', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bleeding-severe'],
    }),
  },
  {
    key: 'fainting',
    category: 'SHOCK',
    severity: 'moderate',
    icon: '😵',
    content: buildFirstAidContent('FAINTING', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['shock'],
    }),
  },
  {
    key: 'asthma-attack',
    category: 'CPR',
    severity: 'serious',
    icon: '🫁',
    content: buildFirstAidContent('ASTHMA_ATTACK', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['choking-adult'],
    }),
  },
  {
    key: 'hypoglycemia',
    category: 'SHOCK',
    severity: 'serious',
    icon: '🍬',
    content: buildFirstAidContent('HYPOGLYCEMIA', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['shock'],
    }),
  },
  {
    key: 'hyperglycemia',
    category: 'SHOCK',
    severity: 'serious',
    icon: '🩸',
    content: buildFirstAidContent('HYPERGLYCEMIA', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['shock'],
    }),
  },
  {
    key: 'dehydration-severe',
    category: 'HEAT_STROKE',
    severity: 'serious',
    icon: '💧',
    content: buildFirstAidContent('DEHYDRATION_SEVERE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['heat-stroke'],
    }),
  },
  {
    key: 'heat-exhaustion',
    category: 'HEAT_STROKE',
    severity: 'moderate',
    icon: '🌡️',
    content: buildFirstAidContent('HEAT_EXHAUSTION', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['heat-stroke'],
    }),
  },
  {
    key: 'sunburn',
    category: 'BURNS',
    severity: 'minor',
    icon: '☀️',
    content: buildFirstAidContent('SUNBURN', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['burns-minor'],
    }),
  },
  {
    key: 'chemical-burn-skin',
    category: 'BURNS',
    severity: 'critical',
    icon: '🧪',
    content: buildFirstAidContent('CHEMICAL_BURN_SKIN', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['burns-severe'],
    }),
  },
  {
    key: 'electrical-burn',
    category: 'BURNS',
    severity: 'critical',
    icon: '⚡',
    content: buildFirstAidContent('ELECTRICAL_BURN', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['burns-severe'],
    }),
  },
  {
    key: 'eye-chemical-splash',
    category: 'BURNS',
    severity: 'critical',
    icon: '👁️',
    content: buildFirstAidContent('EYE_CHEMICAL_SPLASH', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['burns-severe'],
    }),
  },
  {
    key: 'eye-foreign-object',
    category: 'BURNS',
    severity: 'moderate',
    icon: '👀',
    content: buildFirstAidContent('EYE_FOREIGN_OBJECT', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['burns-severe'],
    }),
  },
  {
    key: 'splinter-removal',
    category: 'BITES_STINGS',
    severity: 'minor',
    icon: '🪵',
    content: buildFirstAidContent('SPLINTER_REMOVAL', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bee-sting'],
    }),
  },
  {
    key: 'tick-bite',
    category: 'BITES_STINGS',
    severity: 'moderate',
    icon: '🕷️',
    content: buildFirstAidContent('TICK_BITE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bee-sting'],
    }),
  },
  {
    key: 'dog-bite',
    category: 'BITES_STINGS',
    severity: 'serious',
    icon: '🐶',
    content: buildFirstAidContent('DOG_BITE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bite-sting'],
    }),
  },
  {
    key: 'cat-bite',
    category: 'BITES_STINGS',
    severity: 'serious',
    icon: '🐱',
    content: buildFirstAidContent('CAT_BITE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bite-sting'],
    }),
  },
  {
    key: 'spider-bite',
    category: 'BITES_STINGS',
    severity: 'moderate',
    icon: '🕸️',
    content: buildFirstAidContent('SPIDER_BITE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bite-sting'],
    }),
  },
  {
    key: 'jellyfish-sting',
    category: 'BITES_STINGS',
    severity: 'moderate',
    icon: '🪼',
    content: buildFirstAidContent('JELLYFISH_STING', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bite-sting'],
    }),
  },
  {
    key: 'scorpion-sting',
    category: 'BITES_STINGS',
    severity: 'serious',
    icon: '🦂',
    content: buildFirstAidContent('SCORPION_STING', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bite-sting'],
    }),
  },
  {
    key: 'stingray-injury',
    category: 'BITES_STINGS',
    severity: 'serious',
    icon: '🐟',
    content: buildFirstAidContent('STINGRAY_INJURY', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bite-sting'],
    }),
  },
  {
    key: 'choking-self',
    category: 'CPR',
    severity: 'critical',
    icon: '🧍',
    content: buildFirstAidContent('CHOKING_SELF', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['choking-adult'],
    }),
  },
  {
    key: 'choking-child',
    category: 'CPR',
    severity: 'critical',
    icon: '🧒',
    content: buildFirstAidContent('CHOKING_CHILD', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['choking-infant', 'choking-adult'],
    }),
  },
  {
    key: 'cpr-child',
    category: 'CPR',
    severity: 'critical',
    icon: '🫀',
    content: buildFirstAidContent('CPR_CHILD', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['cpr-adult'],
    }),
  },
  {
    key: 'aed-use',
    category: 'CPR',
    severity: 'critical',
    icon: '📟',
    content: buildFirstAidContent('AED_USE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['cpr-adult'],
    }),
  },
  {
    key: 'seizure-child-fever',
    category: 'SEIZURES',
    severity: 'serious',
    icon: '🌡️',
    content: buildFirstAidContent('SEIZURE_CHILD_FEVER', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['seizures'],
    }),
  },
  {
    key: 'seizure-aftercare',
    category: 'SEIZURES',
    severity: 'moderate',
    icon: '🛌',
    content: buildFirstAidContent('SEIZURE_AFTERCARE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['seizures'],
    }),
  },
  {
    key: 'concussion-suspected',
    category: 'HEART_ATTACK',
    severity: 'serious',
    icon: '🧠',
    content: buildFirstAidContent('CONCUSSION_SUSPECTED', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['stroke'],
    }),
  },
  {
    key: 'head-injury-cut',
    category: 'BLEEDING',
    severity: 'moderate',
    icon: '🩹',
    content: buildFirstAidContent('HEAD_INJURY_CUT', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bleeding-severe'],
    }),
  },
  {
    key: 'knocked-out-tooth',
    category: 'FRACTURES',
    severity: 'serious',
    icon: '🦷',
    content: buildFirstAidContent('KNOCKED_OUT_TOOTH', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['fracture-limb'],
    }),
  },
  {
    key: 'broken-nose',
    category: 'FRACTURES',
    severity: 'moderate',
    icon: '👃',
    content: buildFirstAidContent('BROKEN_NOSE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['fracture-limb'],
    }),
  },
  {
    key: 'ankle-sprain',
    category: 'FRACTURES',
    severity: 'minor',
    icon: '🦶',
    content: buildFirstAidContent('ANKLE_SPRAIN', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['fracture-limb'],
    }),
  },
  {
    key: 'wrist-sprain',
    category: 'FRACTURES',
    severity: 'minor',
    icon: '✋',
    content: buildFirstAidContent('WRIST_SPRAIN', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['fracture-limb'],
    }),
  },
  {
    key: 'shoulder-dislocation',
    category: 'FRACTURES',
    severity: 'serious',
    icon: '💪',
    content: buildFirstAidContent('SHOULDER_DISLOCATION', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['fracture-limb'],
    }),
  },
  {
    key: 'knee-twist-injury',
    category: 'FRACTURES',
    severity: 'moderate',
    icon: '🦵',
    content: buildFirstAidContent('KNEE_TWIST_INJURY', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['fracture-limb'],
    }),
  },
  {
    key: 'lower-back-strain',
    category: 'FRACTURES',
    severity: 'minor',
    icon: '🧍‍♂️',
    content: buildFirstAidContent('LOWER_BACK_STRAIN', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['fracture-limb'],
    }),
  },
  {
    key: 'blisters-foot',
    category: 'BURNS',
    severity: 'minor',
    icon: '👟',
    content: buildFirstAidContent('BLISTERS_FOOT', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['burns-minor'],
    }),
  },
  {
    key: 'deep-cut-glass',
    category: 'BLEEDING',
    severity: 'serious',
    icon: '🪟',
    content: buildFirstAidContent('DEEP_CUT_GLASS', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bleeding-severe'],
    }),
  },
  {
    key: 'embedded-object-wound',
    category: 'BLEEDING',
    severity: 'critical',
    icon: '📌',
    content: buildFirstAidContent('EMBEDDED_OBJECT_WOUND', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bleeding-severe'],
    }),
  },
  {
    key: 'amputated-finger',
    category: 'BLEEDING',
    severity: 'critical',
    icon: '🖐️',
    content: buildFirstAidContent('AMPUTATED_FINGER', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['bleeding-severe'],
    }),
  },
  {
    key: 'chest-pain-unknown',
    category: 'HEART_ATTACK',
    severity: 'critical',
    icon: '🚑',
    content: buildFirstAidContent('CHEST_PAIN_UNKNOWN', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['heart-attack'],
    }),
  },
  {
    key: 'angina-episode',
    category: 'HEART_ATTACK',
    severity: 'serious',
    icon: '💊',
    content: buildFirstAidContent('ANGINA_EPISODE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['heart-attack'],
    }),
  },
  {
    key: 'mini-stroke-warning',
    category: 'HEART_ATTACK',
    severity: 'critical',
    icon: '⏱️',
    content: buildFirstAidContent('MINI_STROKE_WARNING', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['stroke'],
    }),
  },
  {
    key: 'confusion-possible-stroke',
    category: 'HEART_ATTACK',
    severity: 'critical',
    icon: '🗣️',
    content: buildFirstAidContent('CONFUSION_POSSIBLE_STROKE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['stroke'],
    }),
  },
  {
    key: 'carbon-monoxide-exposure',
    category: 'POISONING',
    severity: 'critical',
    icon: '🏠',
    content: buildFirstAidContent('CARBON_MONOXIDE_EXPOSURE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['poisoning'],
    }),
  },
  {
    key: 'alcohol-poisoning',
    category: 'POISONING',
    severity: 'critical',
    icon: '🍺',
    content: buildFirstAidContent('ALCOHOL_POISONING', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['poisoning'],
    }),
  },
  {
    key: 'overdose-suspected',
    category: 'POISONING',
    severity: 'critical',
    icon: '💉',
    content: buildFirstAidContent('OVERDOSE_SUSPECTED', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['poisoning'],
    }),
  },
  {
    key: 'household-cleaner-ingestion',
    category: 'POISONING',
    severity: 'critical',
    icon: '🧴',
    content: buildFirstAidContent('HOUSEHOLD_CLEANER_INGESTION', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['poisoning'],
    }),
  },
  {
    key: 'frostbite',
    category: 'HYPOTHERMIA',
    severity: 'serious',
    icon: '🧤',
    content: buildFirstAidContent('FROSTBITE', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['hypothermia'],
    }),
  },
  {
    key: 'cold-water-immersion',
    category: 'HYPOTHERMIA',
    severity: 'critical',
    icon: '🧊',
    content: buildFirstAidContent('COLD_WATER_IMMERSION', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['hypothermia', 'drowning'],
    }),
  },
  {
    key: 'near-drowning-recovery',
    category: 'DROWNING',
    severity: 'critical',
    icon: '🏊',
    content: buildFirstAidContent('NEAR_DROWNING_RECOVERY', 3, {
      warnings: [1],
      call: [1],
      doNot: [1],
      related: ['drowning'],
    }),
  },
];

// =============== EMERGENCY NUMBERS ===============

const emergencyNumbersData = [
  // US
  { countryCode: 'US', category: 'AMBULANCE', en: '911', fr: '911' },
  { countryCode: 'US', category: 'POISON', en: '1-800-222-1222', fr: '1-800-222-1222' },
  { countryCode: 'US', category: 'MENTAL_HEALTH', en: '988', fr: '988' },

  // Canada
  { countryCode: 'CA', category: 'AMBULANCE', en: '911', fr: '911' },
  { countryCode: 'CA', category: 'POISON', en: '1-800-268-9017', fr: '1-800-268-9017' },

  // UK
  { countryCode: 'GB', category: 'AMBULANCE', en: '999', fr: '999' },
  { countryCode: 'GB', category: 'POLICE', en: '999', fr: '999' },
  { countryCode: 'GB', category: 'FIRE', en: '999', fr: '999' },
  { countryCode: 'GB', category: 'POISON', en: '111', fr: '111' },
  { countryCode: 'GB', category: 'MENTAL_HEALTH', en: '116 123', fr: '116 123' },

  // France
  { countryCode: 'FR', category: 'AMBULANCE', en: '15', fr: '15' },
  { countryCode: 'FR', category: 'POLICE', en: '17', fr: '17' },
  { countryCode: 'FR', category: 'FIRE', en: '18', fr: '18' },
  { countryCode: 'FR', category: 'POISON', en: '01 40 05 48 48', fr: '01 40 05 48 48' },

  // Germany
  { countryCode: 'DE', category: 'AMBULANCE', en: '112', fr: '112' },
  { countryCode: 'DE', category: 'POLICE', en: '110', fr: '110' },
  { countryCode: 'DE', category: 'POISON', en: '030 19240', fr: '030 19240' },

  // Australia
  { countryCode: 'AU', category: 'AMBULANCE', en: '000', fr: '000' },
  { countryCode: 'AU', category: 'POISON', en: '13 11 26', fr: '13 11 26' },

  // Japan
  { countryCode: 'JP', category: 'AMBULANCE', en: '119', fr: '119' },
  { countryCode: 'JP', category: 'POLICE', en: '110', fr: '110' },
  { countryCode: 'JP', category: 'FIRE', en: '119', fr: '119' },

  // India
  { countryCode: 'IN', category: 'AMBULANCE', en: '108', fr: '108' },
  { countryCode: 'IN', category: 'POLICE', en: '100', fr: '100' },
  { countryCode: 'IN', category: 'FIRE', en: '101', fr: '101' },
  { countryCode: 'IN', category: 'GENERAL', en: '112', fr: '112' },

  // Brazil
  { countryCode: 'BR', category: 'AMBULANCE', en: '192', fr: '192' },
  { countryCode: 'BR', category: 'POLICE', en: '190', fr: '190' },
  { countryCode: 'BR', category: 'FIRE', en: '193', fr: '193' },

  // Mexico
  { countryCode: 'MX', category: 'GENERAL', en: '911', fr: '911' },

  // Spain
  { countryCode: 'ES', category: 'GENERAL', en: '112', fr: '112' },
  { countryCode: 'ES', category: 'POLICE', en: '091', fr: '091' },
  { countryCode: 'ES', category: 'AMBULANCE', en: '061', fr: '061' },

  // Italy
  { countryCode: 'IT', category: 'GENERAL', en: '112', fr: '112' },
  { countryCode: 'IT', category: 'AMBULANCE', en: '118', fr: '118' },
  { countryCode: 'IT', category: 'POLICE', en: '113', fr: '113' },
  { countryCode: 'IT', category: 'FIRE', en: '115', fr: '115' },

  // Netherlands
  { countryCode: 'NL', category: 'GENERAL', en: '112', fr: '112' },

  // Belgium
  { countryCode: 'BE', category: 'GENERAL', en: '112', fr: '112' },
  { countryCode: 'BE', category: 'POISON', en: '070 245 245', fr: '070 245 245' },

  // Switzerland
  { countryCode: 'CH', category: 'GENERAL', en: '112', fr: '112' },
  { countryCode: 'CH', category: 'AMBULANCE', en: '144', fr: '144' },
  { countryCode: 'CH', category: 'POLICE', en: '117', fr: '117' },
  { countryCode: 'CH', category: 'FIRE', en: '118', fr: '118' },
  { countryCode: 'CH', category: 'POISON', en: '145', fr: '145' },

  // European Union
  { countryCode: 'EU', category: 'GENERAL', en: '112', fr: '112' },
];

// =============== HELPLINES ===============

const helplinesData = [
  {
    countryCode: 'US',
    category: 'SUICIDE',
    en: 'Suicide & Crisis Lifeline',
    fr: 'Ligne d\'écoute Prévention du Suicide',
    number: '988',
    url: 'https://988lifeline.org',
    hoursOperating: '24/7',
    icon: '💙'
  },
  {
    countryCode: 'US',
    category: 'DOMESTIC_VIOLENCE',
    en: 'National DV Hotline',
    fr: 'Ligne DV Nationale',
    number: '1-800-799-7233',
    url: 'https://www.thehotline.org',
    hoursOperating: '24/7',
    icon: '💜'
  },
  {
    countryCode: 'FR',
    category: 'SUICIDE',
    en: 'SOS Amitié',
    fr: 'SOS Amitié',
    number: '09 72 39 40 50',
    url: 'https://www.sos-amitie.com',
    hoursOperating: '24/7',
    icon: '💜'
  },
  {
    countryCode: 'GB',
    category: 'SUICIDE',
    en: 'Samaritans',
    fr: 'Samaritans',
    number: '116 123',
    url: 'https://www.samaritans.org',
    hoursOperating: '24/7',
    icon: '💚'
  },
  {
    countryCode: 'US',
    category: 'MENTAL_HEALTH',
    en: 'Crisis Text Line',
    fr: 'Ligne Texte Crise',
    number: 'Text HOME to 741741',
    url: 'https://www.crisistextline.org',
    hoursOperating: '24/7',
    icon: '💬'
  },
  {
    countryCode: 'CA',
    category: 'MENTAL_HEALTH',
    en: 'Crisis Text Line',
    fr: 'Ligne Texte Crise',
    number: 'Text HOME to 741741',
    url: 'https://www.crisistextline.org',
    hoursOperating: '24/7',
    icon: '💬'
  },
  {
    countryCode: 'IE',
    category: 'SUICIDE',
    en: 'Samaritans',
    fr: 'Samaritans',
    number: '116 123',
    url: 'https://www.samaritans.org',
    hoursOperating: '24/7',
    icon: '💚'
  },
  {
    countryCode: 'DE',
    category: 'MENTAL_HEALTH',
    en: 'Telefonseelsorge',
    fr: 'Telefonseelsorge',
    number: '0800 111 0 111',
    url: 'https://www.telefonseelsorge.de',
    hoursOperating: '24/7',
    icon: '🤝'
  },
  {
    countryCode: 'AU',
    category: 'MENTAL_HEALTH',
    en: 'Kids Helpline',
    fr: 'Kids Helpline',
    number: '1800 55 1800',
    url: 'https://kidshelpline.com.au',
    hoursOperating: '24/7',
    icon: '🧒'
  },
  {
    countryCode: 'GB',
    category: 'ABUSE',
    en: 'Childline UK',
    fr: 'Childline UK',
    number: '0800 1111',
    url: 'https://www.childline.org.uk',
    hoursOperating: '24/7',
    icon: '🛡️'
  },
  {
    countryCode: 'INT',
    category: 'GENERAL',
    en: 'Find A Helpline',
    fr: 'Find A Helpline',
    number: '',
    url: 'https://findahelpline.com',
    hoursOperating: 'Varies',
    icon: '🌍'
  },
];

// =============== WIKI CONDITIONS ===============

const generatedWikiConditionsData = [
  {
    key: 'anxiety-disorders',
    en: {
      title: 'Anxiety Disorders',
      subtitle: 'Mental health condition',
      summary: 'Anxiety Disorders is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Anxiety Disorders',
      subtitle: 'Affection de sante mentale',
      summary: 'Anxiety Disorders est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'anemia',
    en: {
      title: 'Anemia',
      subtitle: 'Hematologic condition',
      summary: 'Anemia is a hematologic condition affecting blood cells or coagulation and often requires laboratory-guided treatment.',
      tags: ['hematology'],
    },
    fr: {
      title: 'Anemia',
      subtitle: 'Affection hematologique',
      summary: 'Anemia est une affection hematologique touchant les cellules sanguines ou la coagulation et necessitant un suivi biologique.',
      tags: ['hematology'],
    },
  },
  {
    key: 'rheumatoid-arthritis',
    en: {
      title: 'Rheumatoid Arthritis',
      subtitle: 'Rheumatologic condition',
      summary: 'Rheumatoid Arthritis is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Rheumatoid Arthritis',
      subtitle: 'Affection rhumatologique',
      summary: 'Rheumatoid Arthritis est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'hyperthyroidism',
    en: {
      title: 'Hyperthyroidism',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Hyperthyroidism is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine', 'general'],
    },
    fr: {
      title: 'Hyperthyroidism',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Hyperthyroidism est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine', 'general'],
    },
  },
  {
    key: 'sleep-apnea',
    en: {
      title: 'Sleep Apnea',
      subtitle: 'Respiratory system condition',
      summary: 'Sleep Apnea is a respiratory condition that may impair breathing capacity and often requires symptom tracking and trigger management.',
      tags: ['respiratory'],
    },
    fr: {
      title: 'Sleep Apnea',
      subtitle: 'Affection du systeme respiratoire',
      summary: 'Sleep Apnea est une affection respiratoire pouvant reduire la capacite ventilatoire et necessitant souvent un suivi des symptomes.',
      tags: ['respiratory'],
    },
  },
  {
    key: 'gerd',
    en: {
      title: 'GERD',
      subtitle: 'Gastrointestinal condition',
      summary: 'GERD is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'GERD',
      subtitle: 'Affection gastro-intestinale',
      summary: 'GERD est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'eczema',
    en: {
      title: 'Eczema',
      subtitle: 'Dermatologic condition',
      summary: 'Eczema is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['dermatological'],
    },
    fr: {
      title: 'Eczema',
      subtitle: 'Affection dermatologique',
      summary: 'Eczema est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['dermatological'],
    },
  },
  {
    key: 'psoriasis',
    en: {
      title: 'Psoriasis',
      subtitle: 'Dermatologic condition',
      summary: 'Psoriasis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['dermatological'],
    },
    fr: {
      title: 'Psoriasis',
      subtitle: 'Affection dermatologique',
      summary: 'Psoriasis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['dermatological'],
    },
  },
  {
    key: 'stroke',
    en: {
      title: 'Stroke',
      subtitle: 'Cardiovascular condition',
      summary: 'Stroke is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular'],
    },
    fr: {
      title: 'Stroke',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Stroke est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular'],
    },
  },
  {
    key: 'heart-failure',
    en: {
      title: 'Heart Failure',
      subtitle: 'Cardiovascular condition',
      summary: 'Heart Failure is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular'],
    },
    fr: {
      title: 'Heart Failure',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Heart Failure est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular'],
    },
  },
  {
    key: 'alzheimer-disease',
    en: {
      title: 'Alzheimer Disease',
      subtitle: 'Neurological condition',
      summary: 'Alzheimer Disease is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Alzheimer Disease',
      subtitle: 'Affection neurologique',
      summary: 'Alzheimer Disease est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'atrial-fibrillation',
    en: {
      title: 'Atrial Fibrillation',
      subtitle: 'Cardiovascular condition',
      summary: 'Atrial Fibrillation is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular'],
    },
    fr: {
      title: 'Atrial Fibrillation',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Atrial Fibrillation est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular'],
    },
  },
  {
    key: 'coronary-artery-disease',
    en: {
      title: 'Coronary Artery Disease',
      subtitle: 'Cardiovascular condition',
      summary: 'Coronary Artery Disease is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular'],
    },
    fr: {
      title: 'Coronary Artery Disease',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Coronary Artery Disease est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular'],
    },
  },
  {
    key: 'peripheral-artery-disease',
    en: {
      title: 'Peripheral Artery Disease',
      subtitle: 'Cardiovascular condition',
      summary: 'Peripheral Artery Disease is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular'],
    },
    fr: {
      title: 'Peripheral Artery Disease',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Peripheral Artery Disease est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular'],
    },
  },
  {
    key: 'deep-vein-thrombosis',
    en: {
      title: 'Deep Vein Thrombosis',
      subtitle: 'Cardiovascular condition',
      summary: 'Deep Vein Thrombosis is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular'],
    },
    fr: {
      title: 'Deep Vein Thrombosis',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Deep Vein Thrombosis est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular'],
    },
  },
  {
    key: 'pulmonary-embolism',
    en: {
      title: 'Pulmonary Embolism',
      subtitle: 'Cardiovascular condition',
      summary: 'Pulmonary Embolism is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular', 'respiratory'],
    },
    fr: {
      title: 'Pulmonary Embolism',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Pulmonary Embolism est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular', 'respiratory'],
    },
  },
  {
    key: 'hyperlipidemia',
    en: {
      title: 'Hyperlipidemia',
      subtitle: 'Clinical condition overview',
      summary: 'Hyperlipidemia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hyperlipidemia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hyperlipidemia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'metabolic-syndrome',
    en: {
      title: 'Metabolic Syndrome',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Metabolic Syndrome is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine', 'general'],
    },
    fr: {
      title: 'Metabolic Syndrome',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Metabolic Syndrome est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine', 'general'],
    },
  },
  {
    key: 'nonalcoholic-fatty-liver-disease',
    en: {
      title: 'Nonalcoholic Fatty Liver Disease',
      subtitle: 'Gastrointestinal condition',
      summary: 'Nonalcoholic Fatty Liver Disease is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Nonalcoholic Fatty Liver Disease',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Nonalcoholic Fatty Liver Disease est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'acute-myocardial-infarction',
    en: {
      title: 'Acute Myocardial Infarction',
      subtitle: 'Cardiovascular condition',
      summary: 'Acute Myocardial Infarction is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular', 'general'],
    },
    fr: {
      title: 'Acute Myocardial Infarction',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Acute Myocardial Infarction est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular', 'general'],
    },
  },
  {
    key: 'varicose-veins',
    en: {
      title: 'Varicose Veins',
      subtitle: 'Clinical condition overview',
      summary: 'Varicose Veins is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Varicose Veins',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Varicose Veins est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'parkinson-disease',
    en: {
      title: 'Parkinson Disease',
      subtitle: 'Neurological condition',
      summary: 'Parkinson Disease is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Parkinson Disease',
      subtitle: 'Affection neurologique',
      summary: 'Parkinson Disease est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'epilepsy',
    en: {
      title: 'Epilepsy',
      subtitle: 'Neurological condition',
      summary: 'Epilepsy is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Epilepsy',
      subtitle: 'Affection neurologique',
      summary: 'Epilepsy est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'multiple-sclerosis',
    en: {
      title: 'Multiple Sclerosis',
      subtitle: 'Neurological condition',
      summary: 'Multiple Sclerosis is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Multiple Sclerosis',
      subtitle: 'Affection neurologique',
      summary: 'Multiple Sclerosis est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'systemic-lupus-erythematosus',
    en: {
      title: 'Systemic Lupus Erythematosus',
      subtitle: 'Rheumatologic condition',
      summary: 'Systemic Lupus Erythematosus is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Systemic Lupus Erythematosus',
      subtitle: 'Affection rhumatologique',
      summary: 'Systemic Lupus Erythematosus est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'sjogren-syndrome',
    en: {
      title: 'Sjogren Syndrome',
      subtitle: 'Rheumatologic condition',
      summary: 'Sjogren Syndrome is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological', 'general'],
    },
    fr: {
      title: 'Sjogren Syndrome',
      subtitle: 'Affection rhumatologique',
      summary: 'Sjogren Syndrome est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological', 'general'],
    },
  },
  {
    key: 'psoriatic-arthritis',
    en: {
      title: 'Psoriatic Arthritis',
      subtitle: 'Rheumatologic condition',
      summary: 'Psoriatic Arthritis is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Psoriatic Arthritis',
      subtitle: 'Affection rhumatologique',
      summary: 'Psoriatic Arthritis est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'ulcerative-colitis',
    en: {
      title: 'Ulcerative Colitis',
      subtitle: 'Gastrointestinal condition',
      summary: 'Ulcerative Colitis is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Ulcerative Colitis',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Ulcerative Colitis est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'crohn-disease',
    en: {
      title: 'Crohn Disease',
      subtitle: 'Gastrointestinal condition',
      summary: 'Crohn Disease is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Crohn Disease',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Crohn Disease est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'irritable-bowel-syndrome',
    en: {
      title: 'Irritable Bowel Syndrome',
      subtitle: 'Gastrointestinal condition',
      summary: 'Irritable Bowel Syndrome is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal', 'general'],
    },
    fr: {
      title: 'Irritable Bowel Syndrome',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Irritable Bowel Syndrome est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal', 'general'],
    },
  },
  {
    key: 'celiac-disease',
    en: {
      title: 'Celiac Disease',
      subtitle: 'Gastrointestinal condition',
      summary: 'Celiac Disease is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Celiac Disease',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Celiac Disease est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'chronic-pancreatitis',
    en: {
      title: 'Chronic Pancreatitis',
      subtitle: 'Gastrointestinal condition',
      summary: 'Chronic Pancreatitis is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Chronic Pancreatitis',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Chronic Pancreatitis est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'gallstones',
    en: {
      title: 'Gallstones',
      subtitle: 'Kidney and urinary condition',
      summary: 'Gallstones is a kidney or urinary condition that may alter fluid, electrolyte, and filtration balance and warrants clinical follow-up.',
      tags: ['nephrology', 'gastrointestinal'],
    },
    fr: {
      title: 'Gallstones',
      subtitle: 'Affection renale et urinaire',
      summary: 'Gallstones est une affection renale ou urinaire pouvant perturber l equilibre hydrique et electrolytique et necessitant un suivi clinique.',
      tags: ['nephrology', 'gastrointestinal'],
    },
  },
  {
    key: 'peptic-ulcer-disease',
    en: {
      title: 'Peptic Ulcer Disease',
      subtitle: 'Gastrointestinal condition',
      summary: 'Peptic Ulcer Disease is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Peptic Ulcer Disease',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Peptic Ulcer Disease est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'hepatitis-b',
    en: {
      title: 'Hepatitis B',
      subtitle: 'Gastrointestinal condition',
      summary: 'Hepatitis B is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Hepatitis B',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Hepatitis B est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'hepatitis-c',
    en: {
      title: 'Hepatitis C',
      subtitle: 'Gastrointestinal condition',
      summary: 'Hepatitis C is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Hepatitis C',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Hepatitis C est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'cirrhosis',
    en: {
      title: 'Cirrhosis',
      subtitle: 'Gastrointestinal condition',
      summary: 'Cirrhosis is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Cirrhosis',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Cirrhosis est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'gout',
    en: {
      title: 'Gout',
      subtitle: 'Clinical condition overview',
      summary: 'Gout is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Gout',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Gout est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'osteoporosis',
    en: {
      title: 'Osteoporosis',
      subtitle: 'Clinical condition overview',
      summary: 'Osteoporosis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Osteoporosis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Osteoporosis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'sarcopenia',
    en: {
      title: 'Sarcopenia',
      subtitle: 'Clinical condition overview',
      summary: 'Sarcopenia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Sarcopenia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Sarcopenia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'fibromyalgia',
    en: {
      title: 'Fibromyalgia',
      subtitle: 'Rheumatologic condition',
      summary: 'Fibromyalgia is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Fibromyalgia',
      subtitle: 'Affection rhumatologique',
      summary: 'Fibromyalgia est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'chronic-fatigue-syndrome',
    en: {
      title: 'Chronic Fatigue Syndrome',
      subtitle: 'Clinical condition overview',
      summary: 'Chronic Fatigue Syndrome is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Chronic Fatigue Syndrome',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Chronic Fatigue Syndrome est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'lupus-nephritis',
    en: {
      title: 'Lupus Nephritis',
      subtitle: 'Rheumatologic condition',
      summary: 'Lupus Nephritis is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Lupus Nephritis',
      subtitle: 'Affection rhumatologique',
      summary: 'Lupus Nephritis est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'polycystic-ovary-syndrome',
    en: {
      title: 'Polycystic Ovary Syndrome',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Polycystic Ovary Syndrome is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric', 'general'],
    },
    fr: {
      title: 'Polycystic Ovary Syndrome',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Polycystic Ovary Syndrome est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric', 'general'],
    },
  },
  {
    key: 'endometriosis',
    en: {
      title: 'Endometriosis',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Endometriosis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric'],
    },
    fr: {
      title: 'Endometriosis',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Endometriosis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric'],
    },
  },
  {
    key: 'uterine-fibroids',
    en: {
      title: 'Uterine Fibroids',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Uterine Fibroids is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric'],
    },
    fr: {
      title: 'Uterine Fibroids',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Uterine Fibroids est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric'],
    },
  },
  {
    key: 'hpv-infection',
    en: {
      title: 'HPV Infection',
      subtitle: 'Infectious disease',
      summary: 'HPV Infection is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'HPV Infection',
      subtitle: 'Maladie infectieuse',
      summary: 'HPV Infection est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'pelvic-inflammatory-disease',
    en: {
      title: 'Pelvic Inflammatory Disease',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Pelvic Inflammatory Disease is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric'],
    },
    fr: {
      title: 'Pelvic Inflammatory Disease',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Pelvic Inflammatory Disease est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric'],
    },
  },
  {
    key: 'benign-prostatic-hyperplasia',
    en: {
      title: 'Benign Prostatic Hyperplasia',
      subtitle: 'Clinical condition overview',
      summary: 'Benign Prostatic Hyperplasia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Benign Prostatic Hyperplasia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Benign Prostatic Hyperplasia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'prostate-cancer',
    en: {
      title: 'Prostate Cancer',
      subtitle: 'Oncologic condition',
      summary: 'Prostate Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Prostate Cancer',
      subtitle: 'Affection oncologique',
      summary: 'Prostate Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'breast-cancer',
    en: {
      title: 'Breast Cancer',
      subtitle: 'Oncologic condition',
      summary: 'Breast Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Breast Cancer',
      subtitle: 'Affection oncologique',
      summary: 'Breast Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'lung-cancer',
    en: {
      title: 'Lung Cancer',
      subtitle: 'Respiratory system condition',
      summary: 'Lung Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['respiratory', 'oncology'],
    },
    fr: {
      title: 'Lung Cancer',
      subtitle: 'Affection du systeme respiratoire',
      summary: 'Lung Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['respiratory', 'oncology'],
    },
  },
  {
    key: 'colorectal-cancer',
    en: {
      title: 'Colorectal Cancer',
      subtitle: 'Oncologic condition',
      summary: 'Colorectal Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Colorectal Cancer',
      subtitle: 'Affection oncologique',
      summary: 'Colorectal Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'pancreatic-cancer',
    en: {
      title: 'Pancreatic Cancer',
      subtitle: 'Oncologic condition',
      summary: 'Pancreatic Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Pancreatic Cancer',
      subtitle: 'Affection oncologique',
      summary: 'Pancreatic Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'melanoma',
    en: {
      title: 'Melanoma',
      subtitle: 'Oncologic condition',
      summary: 'Melanoma is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Melanoma',
      subtitle: 'Affection oncologique',
      summary: 'Melanoma est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'non-hodgkin-lymphoma',
    en: {
      title: 'Non-Hodgkin Lymphoma',
      subtitle: 'Oncologic condition',
      summary: 'Non-Hodgkin Lymphoma is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Non-Hodgkin Lymphoma',
      subtitle: 'Affection oncologique',
      summary: 'Non-Hodgkin Lymphoma est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'hodgkin-lymphoma',
    en: {
      title: 'Hodgkin Lymphoma',
      subtitle: 'Oncologic condition',
      summary: 'Hodgkin Lymphoma is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Hodgkin Lymphoma',
      subtitle: 'Affection oncologique',
      summary: 'Hodgkin Lymphoma est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'leukemia',
    en: {
      title: 'Leukemia',
      subtitle: 'Oncologic condition',
      summary: 'Leukemia is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Leukemia',
      subtitle: 'Affection oncologique',
      summary: 'Leukemia est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'bone-metastasis',
    en: {
      title: 'Bone Metastasis',
      subtitle: 'Clinical condition overview',
      summary: 'Bone Metastasis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Bone Metastasis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Bone Metastasis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'sepsis',
    en: {
      title: 'Sepsis',
      subtitle: 'Clinical condition overview',
      summary: 'Sepsis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Sepsis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Sepsis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'meningitis',
    en: {
      title: 'Meningitis',
      subtitle: 'Infectious disease',
      summary: 'Meningitis is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Meningitis',
      subtitle: 'Maladie infectieuse',
      summary: 'Meningitis est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'encephalitis',
    en: {
      title: 'Encephalitis',
      subtitle: 'Infectious disease',
      summary: 'Encephalitis is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Encephalitis',
      subtitle: 'Maladie infectieuse',
      summary: 'Encephalitis est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'guillain-barre-syndrome',
    en: {
      title: 'Guillain-Barre Syndrome',
      subtitle: 'Neurological condition',
      summary: 'Guillain-Barre Syndrome is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology', 'general'],
    },
    fr: {
      title: 'Guillain-Barre Syndrome',
      subtitle: 'Affection neurologique',
      summary: 'Guillain-Barre Syndrome est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology', 'general'],
    },
  },
  {
    key: 'amyotrophic-lateral-sclerosis',
    en: {
      title: 'Amyotrophic Lateral Sclerosis',
      subtitle: 'Neurological condition',
      summary: 'Amyotrophic Lateral Sclerosis is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Amyotrophic Lateral Sclerosis',
      subtitle: 'Affection neurologique',
      summary: 'Amyotrophic Lateral Sclerosis est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'huntington-disease',
    en: {
      title: 'Huntington Disease',
      subtitle: 'Neurological condition',
      summary: 'Huntington Disease is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Huntington Disease',
      subtitle: 'Affection neurologique',
      summary: 'Huntington Disease est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'autism-spectrum-disorder',
    en: {
      title: 'Autism Spectrum Disorder',
      subtitle: 'Mental health condition',
      summary: 'Autism Spectrum Disorder is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Autism Spectrum Disorder',
      subtitle: 'Affection de sante mentale',
      summary: 'Autism Spectrum Disorder est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'attention-deficit-hyperactivity-disorder',
    en: {
      title: 'Attention Deficit Hyperactivity Disorder',
      subtitle: 'Clinical condition overview',
      summary: 'Attention Deficit Hyperactivity Disorder is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Attention Deficit Hyperactivity Disorder',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Attention Deficit Hyperactivity Disorder est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'schizophrenia',
    en: {
      title: 'Schizophrenia',
      subtitle: 'Mental health condition',
      summary: 'Schizophrenia is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Schizophrenia',
      subtitle: 'Affection de sante mentale',
      summary: 'Schizophrenia est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'bipolar-disorder',
    en: {
      title: 'Bipolar Disorder',
      subtitle: 'Mental health condition',
      summary: 'Bipolar Disorder is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Bipolar Disorder',
      subtitle: 'Affection de sante mentale',
      summary: 'Bipolar Disorder est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'obsessive-compulsive-disorder',
    en: {
      title: 'Obsessive Compulsive Disorder',
      subtitle: 'Mental health condition',
      summary: 'Obsessive Compulsive Disorder is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Obsessive Compulsive Disorder',
      subtitle: 'Affection de sante mentale',
      summary: 'Obsessive Compulsive Disorder est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'posttraumatic-stress-disorder',
    en: {
      title: 'Posttraumatic Stress Disorder',
      subtitle: 'Clinical condition overview',
      summary: 'Posttraumatic Stress Disorder is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Posttraumatic Stress Disorder',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Posttraumatic Stress Disorder est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'panic-disorder',
    en: {
      title: 'Panic Disorder',
      subtitle: 'Mental health condition',
      summary: 'Panic Disorder is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Panic Disorder',
      subtitle: 'Affection de sante mentale',
      summary: 'Panic Disorder est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'social-anxiety-disorder',
    en: {
      title: 'Social Anxiety Disorder',
      subtitle: 'Mental health condition',
      summary: 'Social Anxiety Disorder is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Social Anxiety Disorder',
      subtitle: 'Affection de sante mentale',
      summary: 'Social Anxiety Disorder est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'hypokalemia',
    en: {
      title: 'Hypokalemia',
      subtitle: 'Clinical condition overview',
      summary: 'Hypokalemia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hypokalemia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hypokalemia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'hyperkalemia',
    en: {
      title: 'Hyperkalemia',
      subtitle: 'Clinical condition overview',
      summary: 'Hyperkalemia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hyperkalemia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hyperkalemia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'hyponatremia',
    en: {
      title: 'Hyponatremia',
      subtitle: 'Clinical condition overview',
      summary: 'Hyponatremia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hyponatremia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hyponatremia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'hypernatremia',
    en: {
      title: 'Hypernatremia',
      subtitle: 'Clinical condition overview',
      summary: 'Hypernatremia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hypernatremia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hypernatremia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'hypercalcemia',
    en: {
      title: 'Hypercalcemia',
      subtitle: 'Clinical condition overview',
      summary: 'Hypercalcemia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hypercalcemia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hypercalcemia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'hypocalcemia',
    en: {
      title: 'Hypocalcemia',
      subtitle: 'Clinical condition overview',
      summary: 'Hypocalcemia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hypocalcemia',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hypocalcemia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'addison-disease',
    en: {
      title: 'Addison Disease',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Addison Disease is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine'],
    },
    fr: {
      title: 'Addison Disease',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Addison Disease est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine'],
    },
  },
  {
    key: 'cushing-syndrome',
    en: {
      title: 'Cushing Syndrome',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Cushing Syndrome is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine', 'general'],
    },
    fr: {
      title: 'Cushing Syndrome',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Cushing Syndrome est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine', 'general'],
    },
  },
  {
    key: 'diabetes-insipidus',
    en: {
      title: 'Diabetes Insipidus',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Diabetes Insipidus is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine'],
    },
    fr: {
      title: 'Diabetes Insipidus',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Diabetes Insipidus est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine'],
    },
  },
  {
    key: 'gestational-diabetes',
    en: {
      title: 'Gestational Diabetes',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Gestational Diabetes is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine', 'obstetric'],
    },
    fr: {
      title: 'Gestational Diabetes',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Gestational Diabetes est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine', 'obstetric'],
    },
  },
  {
    key: 'polymyalgia-rheumatica',
    en: {
      title: 'Polymyalgia Rheumatica',
      subtitle: 'Rheumatologic condition',
      summary: 'Polymyalgia Rheumatica is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Polymyalgia Rheumatica',
      subtitle: 'Affection rhumatologique',
      summary: 'Polymyalgia Rheumatica est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'giant-cell-arteritis',
    en: {
      title: 'Giant Cell Arteritis',
      subtitle: 'Clinical condition overview',
      summary: 'Giant Cell Arteritis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Giant Cell Arteritis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Giant Cell Arteritis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'takayasu-arteritis',
    en: {
      title: 'Takayasu Arteritis',
      subtitle: 'Clinical condition overview',
      summary: 'Takayasu Arteritis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Takayasu Arteritis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Takayasu Arteritis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'systemic-sclerosis',
    en: {
      title: 'Systemic Sclerosis',
      subtitle: 'Neurological condition',
      summary: 'Systemic Sclerosis is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Systemic Sclerosis',
      subtitle: 'Affection neurologique',
      summary: 'Systemic Sclerosis est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'dermatomyositis',
    en: {
      title: 'Dermatomyositis',
      subtitle: 'Clinical condition overview',
      summary: 'Dermatomyositis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Dermatomyositis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Dermatomyositis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'polymyositis',
    en: {
      title: 'Polymyositis',
      subtitle: 'Clinical condition overview',
      summary: 'Polymyositis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Polymyositis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Polymyositis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'myasthenia-gravis',
    en: {
      title: 'Myasthenia Gravis',
      subtitle: 'Neurological condition',
      summary: 'Myasthenia Gravis is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Myasthenia Gravis',
      subtitle: 'Affection neurologique',
      summary: 'Myasthenia Gravis est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'carpal-tunnel-syndrome',
    en: {
      title: 'Carpal Tunnel Syndrome',
      subtitle: 'Neurological condition',
      summary: 'Carpal Tunnel Syndrome is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology', 'general'],
    },
    fr: {
      title: 'Carpal Tunnel Syndrome',
      subtitle: 'Affection neurologique',
      summary: 'Carpal Tunnel Syndrome est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology', 'general'],
    },
  },
  {
    key: 'restless-leg-syndrome',
    en: {
      title: 'Restless Leg Syndrome',
      subtitle: 'Neurological condition',
      summary: 'Restless Leg Syndrome is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology', 'general'],
    },
    fr: {
      title: 'Restless Leg Syndrome',
      subtitle: 'Affection neurologique',
      summary: 'Restless Leg Syndrome est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology', 'general'],
    },
  },
  {
    key: 'peripheral-neuropathy',
    en: {
      title: 'Peripheral Neuropathy',
      subtitle: 'Neurological condition',
      summary: 'Peripheral Neuropathy is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Peripheral Neuropathy',
      subtitle: 'Affection neurologique',
      summary: 'Peripheral Neuropathy est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'tinnitus',
    en: {
      title: 'Tinnitus',
      subtitle: 'ENT and sensory condition',
      summary: 'Tinnitus is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Tinnitus',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Tinnitus est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'vertigo',
    en: {
      title: 'Vertigo',
      subtitle: 'ENT and sensory condition',
      summary: 'Vertigo is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Vertigo',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Vertigo est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'erectile-dysfunction',
    en: {
      title: 'Erectile Dysfunction',
      subtitle: 'Clinical condition overview',
      summary: 'Erectile Dysfunction is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Erectile Dysfunction',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Erectile Dysfunction est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'chronic-pelvic-pain',
    en: {
      title: 'Chronic Pelvic Pain',
      subtitle: 'Clinical condition overview',
      summary: 'Chronic Pelvic Pain is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Chronic Pelvic Pain',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Chronic Pelvic Pain est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'interstitial-cystitis',
    en: {
      title: 'Interstitial Cystitis',
      subtitle: 'Respiratory system condition',
      summary: 'Interstitial Cystitis is a respiratory condition that may impair breathing capacity and often requires symptom tracking and trigger management.',
      tags: ['respiratory', 'nephrology'],
    },
    fr: {
      title: 'Interstitial Cystitis',
      subtitle: 'Affection du systeme respiratoire',
      summary: 'Interstitial Cystitis est une affection respiratoire pouvant reduire la capacite ventilatoire et necessitant souvent un suivi des symptomes.',
      tags: ['respiratory', 'nephrology'],
    },
  },
  {
    key: 'kidney-stones',
    en: {
      title: 'Kidney Stones',
      subtitle: 'Kidney and urinary condition',
      summary: 'Kidney Stones is a kidney or urinary condition that may alter fluid, electrolyte, and filtration balance and warrants clinical follow-up.',
      tags: ['nephrology'],
    },
    fr: {
      title: 'Kidney Stones',
      subtitle: 'Affection renale et urinaire',
      summary: 'Kidney Stones est une affection renale ou urinaire pouvant perturber l equilibre hydrique et electrolytique et necessitant un suivi clinique.',
      tags: ['nephrology'],
    },
  },
  {
    key: 'urinary-tract-infection',
    en: {
      title: 'Urinary Tract Infection',
      subtitle: 'Infectious disease',
      summary: 'Urinary Tract Infection is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Urinary Tract Infection',
      subtitle: 'Maladie infectieuse',
      summary: 'Urinary Tract Infection est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'pyelonephritis',
    en: {
      title: 'Pyelonephritis',
      subtitle: 'Kidney and urinary condition',
      summary: 'Pyelonephritis is a kidney or urinary condition that may alter fluid, electrolyte, and filtration balance and warrants clinical follow-up.',
      tags: ['nephrology'],
    },
    fr: {
      title: 'Pyelonephritis',
      subtitle: 'Affection renale et urinaire',
      summary: 'Pyelonephritis est une affection renale ou urinaire pouvant perturber l equilibre hydrique et electrolytique et necessitant un suivi clinique.',
      tags: ['nephrology'],
    },
  },
  {
    key: 'acute-renal-failure',
    en: {
      title: 'Acute Renal Failure',
      subtitle: 'Kidney and urinary condition',
      summary: 'Acute Renal Failure is a kidney or urinary condition that may alter fluid, electrolyte, and filtration balance and warrants clinical follow-up.',
      tags: ['nephrology', 'general'],
    },
    fr: {
      title: 'Acute Renal Failure',
      subtitle: 'Affection renale et urinaire',
      summary: 'Acute Renal Failure est une affection renale ou urinaire pouvant perturber l equilibre hydrique et electrolytique et necessitant un suivi clinique.',
      tags: ['nephrology', 'general'],
    },
  },
  {
    key: 'nephrotic-syndrome',
    en: {
      title: 'Nephrotic Syndrome',
      subtitle: 'Kidney and urinary condition',
      summary: 'Nephrotic Syndrome is a kidney or urinary condition that may alter fluid, electrolyte, and filtration balance and warrants clinical follow-up.',
      tags: ['nephrology', 'general'],
    },
    fr: {
      title: 'Nephrotic Syndrome',
      subtitle: 'Affection renale et urinaire',
      summary: 'Nephrotic Syndrome est une affection renale ou urinaire pouvant perturber l equilibre hydrique et electrolytique et necessitant un suivi clinique.',
      tags: ['nephrology', 'general'],
    },
  },
  {
    key: 'nephritic-syndrome',
    en: {
      title: 'Nephritic Syndrome',
      subtitle: 'Kidney and urinary condition',
      summary: 'Nephritic Syndrome is a kidney or urinary condition that may alter fluid, electrolyte, and filtration balance and warrants clinical follow-up.',
      tags: ['nephrology', 'general'],
    },
    fr: {
      title: 'Nephritic Syndrome',
      subtitle: 'Affection renale et urinaire',
      summary: 'Nephritic Syndrome est une affection renale ou urinaire pouvant perturber l equilibre hydrique et electrolytique et necessitant un suivi clinique.',
      tags: ['nephrology', 'general'],
    },
  },
  {
    key: 'polycystic-kidney-disease',
    en: {
      title: 'Polycystic Kidney Disease',
      subtitle: 'Kidney and urinary condition',
      summary: 'Polycystic Kidney Disease is a kidney or urinary condition that may alter fluid, electrolyte, and filtration balance and warrants clinical follow-up.',
      tags: ['nephrology'],
    },
    fr: {
      title: 'Polycystic Kidney Disease',
      subtitle: 'Affection renale et urinaire',
      summary: 'Polycystic Kidney Disease est une affection renale ou urinaire pouvant perturber l equilibre hydrique et electrolytique et necessitant un suivi clinique.',
      tags: ['nephrology'],
    },
  },
  {
    key: 'renal-cell-carcinoma',
    en: {
      title: 'Renal Cell Carcinoma',
      subtitle: 'Oncologic condition',
      summary: 'Renal Cell Carcinoma is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology', 'nephrology'],
    },
    fr: {
      title: 'Renal Cell Carcinoma',
      subtitle: 'Affection oncologique',
      summary: 'Renal Cell Carcinoma est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology', 'nephrology'],
    },
  },
  {
    key: 'testicular-cancer',
    en: {
      title: 'Testicular Cancer',
      subtitle: 'Oncologic condition',
      summary: 'Testicular Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Testicular Cancer',
      subtitle: 'Affection oncologique',
      summary: 'Testicular Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'ovarian-cancer',
    en: {
      title: 'Ovarian Cancer',
      subtitle: 'Oncologic condition',
      summary: 'Ovarian Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology', 'obstetric'],
    },
    fr: {
      title: 'Ovarian Cancer',
      subtitle: 'Affection oncologique',
      summary: 'Ovarian Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology', 'obstetric'],
    },
  },
  {
    key: 'cervical-cancer',
    en: {
      title: 'Cervical Cancer',
      subtitle: 'Oncologic condition',
      summary: 'Cervical Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology', 'obstetric'],
    },
    fr: {
      title: 'Cervical Cancer',
      subtitle: 'Affection oncologique',
      summary: 'Cervical Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology', 'obstetric'],
    },
  },
  {
    key: 'endometrial-cancer',
    en: {
      title: 'Endometrial Cancer',
      subtitle: 'Oncologic condition',
      summary: 'Endometrial Cancer is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology', 'obstetric'],
    },
    fr: {
      title: 'Endometrial Cancer',
      subtitle: 'Affection oncologique',
      summary: 'Endometrial Cancer est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology', 'obstetric'],
    },
  },
  {
    key: 'cholecystitis',
    en: {
      title: 'Cholecystitis',
      subtitle: 'Kidney and urinary condition',
      summary: 'Cholecystitis is a kidney or urinary condition that may alter fluid, electrolyte, and filtration balance and warrants clinical follow-up.',
      tags: ['nephrology'],
    },
    fr: {
      title: 'Cholecystitis',
      subtitle: 'Affection renale et urinaire',
      summary: 'Cholecystitis est une affection renale ou urinaire pouvant perturber l equilibre hydrique et electrolytique et necessitant un suivi clinique.',
      tags: ['nephrology'],
    },
  },
  {
    key: 'appendicitis',
    en: {
      title: 'Appendicitis',
      subtitle: 'Gastrointestinal condition',
      summary: 'Appendicitis is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Appendicitis',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Appendicitis est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'diverticulitis',
    en: {
      title: 'Diverticulitis',
      subtitle: 'Gastrointestinal condition',
      summary: 'Diverticulitis is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Diverticulitis',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Diverticulitis est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'hemorrhoids',
    en: {
      title: 'Hemorrhoids',
      subtitle: 'Clinical condition overview',
      summary: 'Hemorrhoids is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hemorrhoids',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hemorrhoids est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'anal-fissure',
    en: {
      title: 'Anal Fissure',
      subtitle: 'Clinical condition overview',
      summary: 'Anal Fissure is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Anal Fissure',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Anal Fissure est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'cystic-fibrosis',
    en: {
      title: 'Cystic Fibrosis',
      subtitle: 'Clinical condition overview',
      summary: 'Cystic Fibrosis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Cystic Fibrosis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Cystic Fibrosis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'scurvy',
    en: {
      title: 'Scurvy',
      subtitle: 'Clinical condition overview',
      summary: 'Scurvy is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Scurvy',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Scurvy est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'rickets',
    en: {
      title: 'Rickets',
      subtitle: 'Clinical condition overview',
      summary: 'Rickets is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Rickets',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Rickets est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'beriberi',
    en: {
      title: 'Beriberi',
      subtitle: 'Clinical condition overview',
      summary: 'Beriberi is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Beriberi',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Beriberi est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'pellagra',
    en: {
      title: 'Pellagra',
      subtitle: 'Clinical condition overview',
      summary: 'Pellagra is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Pellagra',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Pellagra est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'night-blindness',
    en: {
      title: 'Night Blindness',
      subtitle: 'ENT and sensory condition',
      summary: 'Night Blindness is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Night Blindness',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Night Blindness est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'macular-degeneration',
    en: {
      title: 'Macular Degeneration',
      subtitle: 'ENT and sensory condition',
      summary: 'Macular Degeneration is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Macular Degeneration',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Macular Degeneration est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'glaucoma',
    en: {
      title: 'Glaucoma',
      subtitle: 'ENT and sensory condition',
      summary: 'Glaucoma is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Glaucoma',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Glaucoma est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'cataracts',
    en: {
      title: 'Cataracts',
      subtitle: 'ENT and sensory condition',
      summary: 'Cataracts is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Cataracts',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Cataracts est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'conjunctivitis',
    en: {
      title: 'Conjunctivitis',
      subtitle: 'ENT and sensory condition',
      summary: 'Conjunctivitis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Conjunctivitis',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Conjunctivitis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'otitis-media',
    en: {
      title: 'Otitis Media',
      subtitle: 'ENT and sensory condition',
      summary: 'Otitis Media is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Otitis Media',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Otitis Media est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'sinusitis',
    en: {
      title: 'Sinusitis',
      subtitle: 'ENT and sensory condition',
      summary: 'Sinusitis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Sinusitis',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Sinusitis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'pharyngitis',
    en: {
      title: 'Pharyngitis',
      subtitle: 'ENT and sensory condition',
      summary: 'Pharyngitis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Pharyngitis',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Pharyngitis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'tonsillitis',
    en: {
      title: 'Tonsillitis',
      subtitle: 'ENT and sensory condition',
      summary: 'Tonsillitis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Tonsillitis',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Tonsillitis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'laryngitis',
    en: {
      title: 'Laryngitis',
      subtitle: 'ENT and sensory condition',
      summary: 'Laryngitis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['otolaryngology'],
    },
    fr: {
      title: 'Laryngitis',
      subtitle: 'Affection ORL et sensorielle',
      summary: 'Laryngitis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['otolaryngology'],
    },
  },
  {
    key: 'influenza',
    en: {
      title: 'Influenza',
      subtitle: 'Infectious disease',
      summary: 'Influenza is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Influenza',
      subtitle: 'Maladie infectieuse',
      summary: 'Influenza est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'covid-19',
    en: {
      title: 'COVID-19',
      subtitle: 'Infectious disease',
      summary: 'COVID-19 is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'COVID-19',
      subtitle: 'Maladie infectieuse',
      summary: 'COVID-19 est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'viral-pneumonia',
    en: {
      title: 'Viral Pneumonia',
      subtitle: 'Respiratory system condition',
      summary: 'Viral Pneumonia is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['respiratory', 'infectious'],
    },
    fr: {
      title: 'Viral Pneumonia',
      subtitle: 'Affection du systeme respiratoire',
      summary: 'Viral Pneumonia est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['respiratory', 'infectious'],
    },
  },
  {
    key: 'bacterial-pneumonia',
    en: {
      title: 'Bacterial Pneumonia',
      subtitle: 'Respiratory system condition',
      summary: 'Bacterial Pneumonia is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['respiratory', 'infectious'],
    },
    fr: {
      title: 'Bacterial Pneumonia',
      subtitle: 'Affection du systeme respiratoire',
      summary: 'Bacterial Pneumonia est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['respiratory', 'infectious'],
    },
  },
  {
    key: 'tuberculosis',
    en: {
      title: 'Tuberculosis',
      subtitle: 'Respiratory system condition',
      summary: 'Tuberculosis is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['respiratory', 'infectious'],
    },
    fr: {
      title: 'Tuberculosis',
      subtitle: 'Affection du systeme respiratoire',
      summary: 'Tuberculosis est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['respiratory', 'infectious'],
    },
  },
  {
    key: 'hiv-aids',
    en: {
      title: 'HIV/AIDS',
      subtitle: 'Infectious disease',
      summary: 'HIV/AIDS is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'HIV/AIDS',
      subtitle: 'Maladie infectieuse',
      summary: 'HIV/AIDS est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'herpes-simplex',
    en: {
      title: 'Herpes Simplex',
      subtitle: 'Infectious disease',
      summary: 'Herpes Simplex is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Herpes Simplex',
      subtitle: 'Maladie infectieuse',
      summary: 'Herpes Simplex est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'varicella-zoster',
    en: {
      title: 'Varicella Zoster',
      subtitle: 'Infectious disease',
      summary: 'Varicella Zoster is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Varicella Zoster',
      subtitle: 'Maladie infectieuse',
      summary: 'Varicella Zoster est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'epstein-barr-virus',
    en: {
      title: 'Epstein-Barr Virus',
      subtitle: 'Infectious disease',
      summary: 'Epstein-Barr Virus is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Epstein-Barr Virus',
      subtitle: 'Maladie infectieuse',
      summary: 'Epstein-Barr Virus est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'cytomegalovirus',
    en: {
      title: 'Cytomegalovirus',
      subtitle: 'Infectious disease',
      summary: 'Cytomegalovirus is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Cytomegalovirus',
      subtitle: 'Maladie infectieuse',
      summary: 'Cytomegalovirus est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'dengue-fever',
    en: {
      title: 'Dengue Fever',
      subtitle: 'Infectious disease',
      summary: 'Dengue Fever is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Dengue Fever',
      subtitle: 'Maladie infectieuse',
      summary: 'Dengue Fever est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'malaria',
    en: {
      title: 'Malaria',
      subtitle: 'Infectious disease',
      summary: 'Malaria is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Malaria',
      subtitle: 'Maladie infectieuse',
      summary: 'Malaria est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'lyme-disease',
    en: {
      title: 'Lyme Disease',
      subtitle: 'Clinical condition overview',
      summary: 'Lyme Disease is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Lyme Disease',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Lyme Disease est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'rocky-mountain-spotted-fever',
    en: {
      title: 'Rocky Mountain Spotted Fever',
      subtitle: 'Clinical condition overview',
      summary: 'Rocky Mountain Spotted Fever is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Rocky Mountain Spotted Fever',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Rocky Mountain Spotted Fever est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'zika-virus',
    en: {
      title: 'Zika Virus',
      subtitle: 'Infectious disease',
      summary: 'Zika Virus is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Zika Virus',
      subtitle: 'Maladie infectieuse',
      summary: 'Zika Virus est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'yellow-fever',
    en: {
      title: 'Yellow Fever',
      subtitle: 'Infectious disease',
      summary: 'Yellow Fever is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Yellow Fever',
      subtitle: 'Maladie infectieuse',
      summary: 'Yellow Fever est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'chikungunya',
    en: {
      title: 'Chikungunya',
      subtitle: 'Infectious disease',
      summary: 'Chikungunya is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Chikungunya',
      subtitle: 'Maladie infectieuse',
      summary: 'Chikungunya est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'syphilis',
    en: {
      title: 'Syphilis',
      subtitle: 'Infectious disease',
      summary: 'Syphilis is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Syphilis',
      subtitle: 'Maladie infectieuse',
      summary: 'Syphilis est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'gonorrhea',
    en: {
      title: 'Gonorrhea',
      subtitle: 'Infectious disease',
      summary: 'Gonorrhea is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Gonorrhea',
      subtitle: 'Maladie infectieuse',
      summary: 'Gonorrhea est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'chlamydia',
    en: {
      title: 'Chlamydia',
      subtitle: 'Infectious disease',
      summary: 'Chlamydia is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Chlamydia',
      subtitle: 'Maladie infectieuse',
      summary: 'Chlamydia est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'genital-herpes',
    en: {
      title: 'Genital Herpes',
      subtitle: 'Infectious disease',
      summary: 'Genital Herpes is an infectious condition that should be evaluated promptly to guide testing, transmission prevention, and targeted treatment.',
      tags: ['infectious'],
    },
    fr: {
      title: 'Genital Herpes',
      subtitle: 'Maladie infectieuse',
      summary: 'Genital Herpes est une affection infectieuse qui doit etre evaluee rapidement pour orienter le depistage, la prevention de transmission et le traitement.',
      tags: ['infectious'],
    },
  },
  {
    key: 'toxic-shock-syndrome',
    en: {
      title: 'Toxic Shock Syndrome',
      subtitle: 'Clinical condition overview',
      summary: 'Toxic Shock Syndrome is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Toxic Shock Syndrome',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Toxic Shock Syndrome est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'vitamin-d-deficiency',
    en: {
      title: 'Vitamin D Deficiency',
      subtitle: 'Clinical condition overview',
      summary: 'Vitamin D Deficiency is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Vitamin D Deficiency',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Vitamin D Deficiency est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'hyperparathyroidism',
    en: {
      title: 'Hyperparathyroidism',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Hyperparathyroidism is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine', 'general'],
    },
    fr: {
      title: 'Hyperparathyroidism',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Hyperparathyroidism est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine', 'general'],
    },
  },
  {
    key: 'hypoparathyroidism',
    en: {
      title: 'Hypoparathyroidism',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Hypoparathyroidism is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine', 'general'],
    },
    fr: {
      title: 'Hypoparathyroidism',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Hypoparathyroidism est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine', 'general'],
    },
  },
  {
    key: 'bipolar-ii-disorder',
    en: {
      title: 'Bipolar II Disorder',
      subtitle: 'Mental health condition',
      summary: 'Bipolar II Disorder is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Bipolar II Disorder',
      subtitle: 'Affection de sante mentale',
      summary: 'Bipolar II Disorder est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'cyclothymic-disorder',
    en: {
      title: 'Cyclothymic Disorder',
      subtitle: 'Clinical condition overview',
      summary: 'Cyclothymic Disorder is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Cyclothymic Disorder',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Cyclothymic Disorder est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'agoraphobia',
    en: {
      title: 'Agoraphobia',
      subtitle: 'Mental health condition',
      summary: 'Agoraphobia is a mental health condition that can significantly affect daily functioning and often responds best to multimodal care.',
      tags: ['mental-health'],
    },
    fr: {
      title: 'Agoraphobia',
      subtitle: 'Affection de sante mentale',
      summary: 'Agoraphobia est une affection de sante mentale pouvant alterer le fonctionnement quotidien et beneficiant d une prise en charge multimodale.',
      tags: ['mental-health'],
    },
  },
  {
    key: 'preeclampsia',
    en: {
      title: 'Preeclampsia',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Preeclampsia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric'],
    },
    fr: {
      title: 'Preeclampsia',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Preeclampsia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric'],
    },
  },
  {
    key: 'eclampsia',
    en: {
      title: 'Eclampsia',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Eclampsia is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric'],
    },
    fr: {
      title: 'Eclampsia',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Eclampsia est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric'],
    },
  },
  {
    key: 'placenta-previa',
    en: {
      title: 'Placenta Previa',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Placenta Previa is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric'],
    },
    fr: {
      title: 'Placenta Previa',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Placenta Previa est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric'],
    },
  },
  {
    key: 'placental-abruption',
    en: {
      title: 'Placental Abruption',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Placental Abruption is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric'],
    },
    fr: {
      title: 'Placental Abruption',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Placental Abruption est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric'],
    },
  },
  {
    key: 'gestational-hypertension',
    en: {
      title: 'Gestational Hypertension',
      subtitle: 'Cardiovascular condition',
      summary: 'Gestational Hypertension is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular', 'obstetric', 'general'],
    },
    fr: {
      title: 'Gestational Hypertension',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Gestational Hypertension est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular', 'obstetric', 'general'],
    },
  },
  {
    key: 'hyperemesis-gravidarum',
    en: {
      title: 'Hyperemesis Gravidarum',
      subtitle: 'Clinical condition overview',
      summary: 'Hyperemesis Gravidarum is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hyperemesis Gravidarum',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hyperemesis Gravidarum est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'premature-labor',
    en: {
      title: 'Premature Labor',
      subtitle: 'Reproductive and obstetric condition',
      summary: 'Premature Labor is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['obstetric'],
    },
    fr: {
      title: 'Premature Labor',
      subtitle: 'Affection gynecologique et obstetricale',
      summary: 'Premature Labor est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['obstetric'],
    },
  },
  {
    key: 'reactive-arthritis',
    en: {
      title: 'Reactive Arthritis',
      subtitle: 'Rheumatologic condition',
      summary: 'Reactive Arthritis is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Reactive Arthritis',
      subtitle: 'Affection rhumatologique',
      summary: 'Reactive Arthritis est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'ankylosing-spondylitis',
    en: {
      title: 'Ankylosing Spondylitis',
      subtitle: 'Rheumatologic condition',
      summary: 'Ankylosing Spondylitis is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Ankylosing Spondylitis',
      subtitle: 'Affection rhumatologique',
      summary: 'Ankylosing Spondylitis est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'juvenile-idiopathic-arthritis',
    en: {
      title: 'Juvenile Idiopathic Arthritis',
      subtitle: 'Rheumatologic condition',
      summary: 'Juvenile Idiopathic Arthritis is an inflammatory or autoimmune rheumatologic condition that may involve pain, stiffness, and systemic manifestations.',
      tags: ['rheumatological'],
    },
    fr: {
      title: 'Juvenile Idiopathic Arthritis',
      subtitle: 'Affection rhumatologique',
      summary: 'Juvenile Idiopathic Arthritis est une affection rhumatologique inflammatoire ou auto-immune pouvant associer douleur, raideur et atteinte systemique.',
      tags: ['rheumatological'],
    },
  },
  {
    key: 'trigeminal-neuralgia',
    en: {
      title: 'Trigeminal Neuralgia',
      subtitle: 'Neurological condition',
      summary: 'Trigeminal Neuralgia is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Trigeminal Neuralgia',
      subtitle: 'Affection neurologique',
      summary: 'Trigeminal Neuralgia est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'cluster-headache',
    en: {
      title: 'Cluster Headache',
      subtitle: 'Neurological condition',
      summary: 'Cluster Headache is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Cluster Headache',
      subtitle: 'Affection neurologique',
      summary: 'Cluster Headache est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'tension-headache',
    en: {
      title: 'Tension Headache',
      subtitle: 'Neurological condition',
      summary: 'Tension Headache is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Tension Headache',
      subtitle: 'Affection neurologique',
      summary: 'Tension Headache est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'temporomandibular-disorder',
    en: {
      title: 'Temporomandibular Disorder',
      subtitle: 'Clinical condition overview',
      summary: 'Temporomandibular Disorder is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Temporomandibular Disorder',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Temporomandibular Disorder est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'primary-biliary-cholangitis',
    en: {
      title: 'Primary Biliary Cholangitis',
      subtitle: 'Clinical condition overview',
      summary: 'Primary Biliary Cholangitis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Primary Biliary Cholangitis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Primary Biliary Cholangitis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'autoimmune-hepatitis',
    en: {
      title: 'Autoimmune Hepatitis',
      subtitle: 'Gastrointestinal condition',
      summary: 'Autoimmune Hepatitis is a gastrointestinal condition that may affect digestion, absorption, or hepatobiliary function and requires individualized management.',
      tags: ['gastrointestinal'],
    },
    fr: {
      title: 'Autoimmune Hepatitis',
      subtitle: 'Affection gastro-intestinale',
      summary: 'Autoimmune Hepatitis est une affection gastro-intestinale pouvant affecter la digestion, l absorption ou la fonction hepatobiliaire.',
      tags: ['gastrointestinal'],
    },
  },
  {
    key: 'acute-lymphoblastic-leukemia',
    en: {
      title: 'Acute Lymphoblastic Leukemia',
      subtitle: 'Oncologic condition',
      summary: 'Acute Lymphoblastic Leukemia is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology', 'general'],
    },
    fr: {
      title: 'Acute Lymphoblastic Leukemia',
      subtitle: 'Affection oncologique',
      summary: 'Acute Lymphoblastic Leukemia est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology', 'general'],
    },
  },
  {
    key: 'chronic-lymphocytic-leukemia',
    en: {
      title: 'Chronic Lymphocytic Leukemia',
      subtitle: 'Oncologic condition',
      summary: 'Chronic Lymphocytic Leukemia is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Chronic Lymphocytic Leukemia',
      subtitle: 'Affection oncologique',
      summary: 'Chronic Lymphocytic Leukemia est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'multiple-myeloma',
    en: {
      title: 'Multiple Myeloma',
      subtitle: 'Oncologic condition',
      summary: 'Multiple Myeloma is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Multiple Myeloma',
      subtitle: 'Affection oncologique',
      summary: 'Multiple Myeloma est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'myelodysplastic-syndrome',
    en: {
      title: 'Myelodysplastic Syndrome',
      subtitle: 'Hematologic condition',
      summary: 'Myelodysplastic Syndrome is a hematologic condition affecting blood cells or coagulation and often requires laboratory-guided treatment.',
      tags: ['hematology', 'general'],
    },
    fr: {
      title: 'Myelodysplastic Syndrome',
      subtitle: 'Affection hematologique',
      summary: 'Myelodysplastic Syndrome est une affection hematologique touchant les cellules sanguines ou la coagulation et necessitant un suivi biologique.',
      tags: ['hematology', 'general'],
    },
  },
  {
    key: 'hemophilia',
    en: {
      title: 'Hemophilia',
      subtitle: 'Hematologic condition',
      summary: 'Hemophilia is a hematologic condition affecting blood cells or coagulation and often requires laboratory-guided treatment.',
      tags: ['hematology'],
    },
    fr: {
      title: 'Hemophilia',
      subtitle: 'Affection hematologique',
      summary: 'Hemophilia est une affection hematologique touchant les cellules sanguines ou la coagulation et necessitant un suivi biologique.',
      tags: ['hematology'],
    },
  },
  {
    key: 'sickle-cell-disease',
    en: {
      title: 'Sickle Cell Disease',
      subtitle: 'Hematologic condition',
      summary: 'Sickle Cell Disease is a hematologic condition affecting blood cells or coagulation and often requires laboratory-guided treatment.',
      tags: ['hematology'],
    },
    fr: {
      title: 'Sickle Cell Disease',
      subtitle: 'Affection hematologique',
      summary: 'Sickle Cell Disease est une affection hematologique touchant les cellules sanguines ou la coagulation et necessitant un suivi biologique.',
      tags: ['hematology'],
    },
  },
  {
    key: 'thalassemia',
    en: {
      title: 'Thalassemia',
      subtitle: 'Hematologic condition',
      summary: 'Thalassemia is a hematologic condition affecting blood cells or coagulation and often requires laboratory-guided treatment.',
      tags: ['hematology'],
    },
    fr: {
      title: 'Thalassemia',
      subtitle: 'Affection hematologique',
      summary: 'Thalassemia est une affection hematologique touchant les cellules sanguines ou la coagulation et necessitant un suivi biologique.',
      tags: ['hematology'],
    },
  },
  {
    key: 'aplastic-anemia',
    en: {
      title: 'Aplastic Anemia',
      subtitle: 'Hematologic condition',
      summary: 'Aplastic Anemia is a hematologic condition affecting blood cells or coagulation and often requires laboratory-guided treatment.',
      tags: ['hematology'],
    },
    fr: {
      title: 'Aplastic Anemia',
      subtitle: 'Affection hematologique',
      summary: 'Aplastic Anemia est une affection hematologique touchant les cellules sanguines ou la coagulation et necessitant un suivi biologique.',
      tags: ['hematology'],
    },
  },
  {
    key: 'pulmonary-hypertension',
    en: {
      title: 'Pulmonary Hypertension',
      subtitle: 'Cardiovascular condition',
      summary: 'Pulmonary Hypertension is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular', 'respiratory', 'general'],
    },
    fr: {
      title: 'Pulmonary Hypertension',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Pulmonary Hypertension est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular', 'respiratory', 'general'],
    },
  },
  {
    key: 'bronchiectasis',
    en: {
      title: 'Bronchiectasis',
      subtitle: 'Respiratory system condition',
      summary: 'Bronchiectasis is a respiratory condition that may impair breathing capacity and often requires symptom tracking and trigger management.',
      tags: ['respiratory'],
    },
    fr: {
      title: 'Bronchiectasis',
      subtitle: 'Affection du systeme respiratoire',
      summary: 'Bronchiectasis est une affection respiratoire pouvant reduire la capacite ventilatoire et necessitant souvent un suivi des symptomes.',
      tags: ['respiratory'],
    },
  },
  {
    key: 'interstitial-lung-disease',
    en: {
      title: 'Interstitial Lung Disease',
      subtitle: 'Respiratory system condition',
      summary: 'Interstitial Lung Disease is a respiratory condition that may impair breathing capacity and often requires symptom tracking and trigger management.',
      tags: ['respiratory'],
    },
    fr: {
      title: 'Interstitial Lung Disease',
      subtitle: 'Affection du systeme respiratoire',
      summary: 'Interstitial Lung Disease est une affection respiratoire pouvant reduire la capacite ventilatoire et necessitant souvent un suivi des symptomes.',
      tags: ['respiratory'],
    },
  },
  {
    key: 'amyloidosis',
    en: {
      title: 'Amyloidosis',
      subtitle: 'Clinical condition overview',
      summary: 'Amyloidosis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Amyloidosis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Amyloidosis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'polyarteritis-nodosa',
    en: {
      title: 'Polyarteritis Nodosa',
      subtitle: 'Clinical condition overview',
      summary: 'Polyarteritis Nodosa is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Polyarteritis Nodosa',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Polyarteritis Nodosa est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'henoch-schonlein-purpura',
    en: {
      title: 'Henoch-Schonlein Purpura',
      subtitle: 'Clinical condition overview',
      summary: 'Henoch-Schonlein Purpura is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Henoch-Schonlein Purpura',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Henoch-Schonlein Purpura est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'superior-vena-cava-syndrome',
    en: {
      title: 'Superior Vena Cava Syndrome',
      subtitle: 'Clinical condition overview',
      summary: 'Superior Vena Cava Syndrome is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Superior Vena Cava Syndrome',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Superior Vena Cava Syndrome est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'aortic-aneurysm',
    en: {
      title: 'Aortic Aneurysm',
      subtitle: 'Cardiovascular condition',
      summary: 'Aortic Aneurysm is a cardiovascular condition associated with vascular risk and typically benefits from structured follow-up and risk-factor control.',
      tags: ['cardiovascular'],
    },
    fr: {
      title: 'Aortic Aneurysm',
      subtitle: 'Affection cardiovasculaire',
      summary: 'Aortic Aneurysm est une affection cardiovasculaire associee a un risque vasculaire potentiel et necessitant souvent un suivi structure.',
      tags: ['cardiovascular'],
    },
  },
  {
    key: 'transient-ischemic-attack',
    en: {
      title: 'Transient Ischemic Attack',
      subtitle: 'Clinical condition overview',
      summary: 'Transient Ischemic Attack is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Transient Ischemic Attack',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Transient Ischemic Attack est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'dementia-with-lewy-bodies',
    en: {
      title: 'Dementia with Lewy Bodies',
      subtitle: 'Neurological condition',
      summary: 'Dementia with Lewy Bodies is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Dementia with Lewy Bodies',
      subtitle: 'Affection neurologique',
      summary: 'Dementia with Lewy Bodies est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'normal-pressure-hydrocephalus',
    en: {
      title: 'Normal Pressure Hydrocephalus',
      subtitle: 'Neurological condition',
      summary: 'Normal Pressure Hydrocephalus is a neurological condition that can impact cognition, sensation, or movement and often needs specialist-guided management.',
      tags: ['neurology'],
    },
    fr: {
      title: 'Normal Pressure Hydrocephalus',
      subtitle: 'Affection neurologique',
      summary: 'Normal Pressure Hydrocephalus est une affection neurologique pouvant affecter la cognition, la sensibilite ou la motricite et necessitant souvent un suivi specialise.',
      tags: ['neurology'],
    },
  },
  {
    key: 'carcinoid-syndrome',
    en: {
      title: 'Carcinoid Syndrome',
      subtitle: 'Clinical condition overview',
      summary: 'Carcinoid Syndrome is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Carcinoid Syndrome',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Carcinoid Syndrome est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'pheochromocytoma',
    en: {
      title: 'Pheochromocytoma',
      subtitle: 'Clinical condition overview',
      summary: 'Pheochromocytoma is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Pheochromocytoma',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Pheochromocytoma est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'pituitary-adenoma',
    en: {
      title: 'Pituitary Adenoma',
      subtitle: 'Endocrine and metabolic condition',
      summary: 'Pituitary Adenoma is an endocrine or metabolic condition that may affect multiple body systems and often requires long-term monitoring.',
      tags: ['endocrine'],
    },
    fr: {
      title: 'Pituitary Adenoma',
      subtitle: 'Affection endocrine et metabolique',
      summary: 'Pituitary Adenoma est une affection endocrine ou metabolique pouvant toucher plusieurs systemes et necessitant generalement un suivi au long cours.',
      tags: ['endocrine'],
    },
  },
  {
    key: 'macrophage-activation-syndrome',
    en: {
      title: 'Macrophage Activation Syndrome',
      subtitle: 'Clinical condition overview',
      summary: 'Macrophage Activation Syndrome is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Macrophage Activation Syndrome',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Macrophage Activation Syndrome est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'bisphosphonate-related-osteonecrosis',
    en: {
      title: 'Bisphosphonate-related Osteonecrosis',
      subtitle: 'Clinical condition overview',
      summary: 'Bisphosphonate-related Osteonecrosis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Bisphosphonate-related Osteonecrosis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Bisphosphonate-related Osteonecrosis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'hemophagocytic-lymphohistiocytosis',
    en: {
      title: 'Hemophagocytic Lymphohistiocytosis',
      subtitle: 'Clinical condition overview',
      summary: 'Hemophagocytic Lymphohistiocytosis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Hemophagocytic Lymphohistiocytosis',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Hemophagocytic Lymphohistiocytosis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'ehlers-danlos-syndrome',
    en: {
      title: 'Ehlers-Danlos Syndrome',
      subtitle: 'Clinical condition overview',
      summary: 'Ehlers-Danlos Syndrome is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Ehlers-Danlos Syndrome',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Ehlers-Danlos Syndrome est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'marfan-syndrome',
    en: {
      title: 'Marfan Syndrome',
      subtitle: 'Clinical condition overview',
      summary: 'Marfan Syndrome is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Marfan Syndrome',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Marfan Syndrome est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'neuromyelitis-optica',
    en: {
      title: 'Neuromyelitis Optica',
      subtitle: 'Clinical condition overview',
      summary: 'Neuromyelitis Optica is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Neuromyelitis Optica',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Neuromyelitis Optica est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'adenosine-deaminase-deficiency',
    en: {
      title: 'Adenosine Deaminase Deficiency',
      subtitle: 'Clinical condition overview',
      summary: 'Adenosine Deaminase Deficiency is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Adenosine Deaminase Deficiency',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Adenosine Deaminase Deficiency est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'epidermolysis-bullosa',
    en: {
      title: 'Epidermolysis Bullosa',
      subtitle: 'Dermatologic condition',
      summary: 'Epidermolysis Bullosa is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['dermatological'],
    },
    fr: {
      title: 'Epidermolysis Bullosa',
      subtitle: 'Affection dermatologique',
      summary: 'Epidermolysis Bullosa est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['dermatological'],
    },
  },
  {
    key: 'sleep-wake-circadian-disorder',
    en: {
      title: 'Sleep Wake Circadian Disorder',
      subtitle: 'Clinical condition overview',
      summary: 'Sleep Wake Circadian Disorder is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['general'],
    },
    fr: {
      title: 'Sleep Wake Circadian Disorder',
      subtitle: 'Apercu d une affection clinique',
      summary: 'Sleep Wake Circadian Disorder est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['general'],
    },
  },
  {
    key: 'metastatic-melanoma',
    en: {
      title: 'Metastatic Melanoma',
      subtitle: 'Oncologic condition',
      summary: 'Metastatic Melanoma is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Metastatic Melanoma',
      subtitle: 'Affection oncologique',
      summary: 'Metastatic Melanoma est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'chronic-eosinophilic-leukemia',
    en: {
      title: 'Chronic Eosinophilic Leukemia',
      subtitle: 'Oncologic condition',
      summary: 'Chronic Eosinophilic Leukemia is an oncologic condition that may require timely diagnosis, staging, and multidisciplinary treatment planning.',
      tags: ['oncology'],
    },
    fr: {
      title: 'Chronic Eosinophilic Leukemia',
      subtitle: 'Affection oncologique',
      summary: 'Chronic Eosinophilic Leukemia est une affection oncologique pouvant necessiter un diagnostic rapide, une stadification et une prise en charge pluridisciplinaire.',
      tags: ['oncology'],
    },
  },
  {
    key: 'severe-atopic-dermatitis',
    en: {
      title: 'Severe Atopic Dermatitis',
      subtitle: 'Dermatologic condition',
      summary: 'Severe Atopic Dermatitis is a clinical condition that often requires specialized diagnosis, evidence-based management, and regular follow-up.',
      tags: ['dermatological'],
    },
    fr: {
      title: 'Severe Atopic Dermatitis',
      subtitle: 'Affection dermatologique',
      summary: 'Severe Atopic Dermatitis est une affection clinique necessitant souvent un diagnostic specialise, une prise en charge fondee sur les preuves et un suivi regulier.',
      tags: ['dermatological'],
    },
  },
];

const wikiConditionsData = [
  {
    key: 'hypertension',
    en: {
      title: 'Hypertension',
      subtitle: 'High blood pressure',
      summary: 'Hypertension is a condition characterized by high blood pressure. Chronic arterial pressure elevation requiring tailored management, monitoring, and patient education.',
      tags: ['cardiovascular', 'chronic'],
    },
    fr: {
      title: 'Hypertension',
      subtitle: 'Tension artérielle élevée',
      summary: 'L\'hypertension est caractérisée par une tension artérielle élevée. Une élévation chronique de la pression artérielle nécessitant une gestion, une surveillance et une éducation adaptées.',
      tags: ['cardiovascular', 'chronic'],
    },
  },
  {
    key: 'type-2-diabetes',
    en: {
      title: 'Type 2 Diabetes',
      subtitle: 'Insulin resistance and hyperglycemia',
      summary: 'Type 2 Diabetes is a condition characterized by insulin resistance and hyperglycemia. A long-term metabolic disorder with risk for microvascular and macrovascular complications.',
      tags: ['endocrine', 'metabolic', 'chronic'],
    },
    fr: {
      title: 'Diabète de Type 2',
      subtitle: 'Insulinorésistance et hyperglycémie',
      summary: 'Le diabète de type 2 est caractérisé par une insulinorésistance et une hyperglycémie. Un trouble métabolique à long terme avec risque de complications microvasculaires et macrovasculaires.',
      tags: ['endocrine', 'metabolic', 'chronic'],
    },
  },
  {
    key: 'asthma',
    en: {
      title: 'Asthma',
      subtitle: 'Inflammatory airway disease',
      summary: 'Asthma is a condition characterized by inflammatory airway disease. Reversible airway obstruction with wheeze, cough, and dyspnea.',
      tags: ['respiratory', 'chronic', 'inflammatory'],
    },
    fr: {
      title: 'Asthme',
      subtitle: 'Maladie inflammatoire des voies respiratoires',
      summary: 'L\'asthme est caractérisé par une maladie inflammatoire des voies respiratoires. Une obstruction réversible des voies respiratoires avec respiration sifflante, toux et dyspnée.',
      tags: ['respiratory', 'chronic', 'inflammatory'],
    },
  },
  {
    key: 'copd',
    en: {
      title: 'Chronic Obstructive Pulmonary Disease',
      subtitle: 'Progressive airflow limitation',
      summary: 'COPD is a chronic respiratory disease with persistent airflow obstruction, often linked to smoking exposure and recurrent exacerbations.',
      tags: ['respiratory', 'chronic'],
    },
    fr: {
      title: 'Bronchopneumopathie chronique obstructive',
      subtitle: 'Limitation progressive du flux respiratoire',
      summary: 'La BPCO est une maladie respiratoire chronique avec obstruction persistante du débit aérien, souvent liée au tabagisme et aux exacerbations répétées.',
      tags: ['respiratory', 'chronic'],
    },
  },
  {
    key: 'chronic-kidney-disease',
    en: {
      title: 'Chronic Kidney Disease',
      subtitle: 'Progressive kidney function decline',
      summary: 'Chronic kidney disease involves gradual loss of renal function with increased cardiovascular risk, requiring staging, monitoring, and risk-factor control.',
      tags: ['renal', 'chronic'],
    },
    fr: {
      title: 'Maladie rénale chronique',
      subtitle: 'Déclin progressif de la fonction rénale',
      summary: 'La maladie rénale chronique correspond à une perte progressive de la fonction rénale avec un risque cardiovasculaire accru, nécessitant suivi et contrôle des facteurs de risque.',
      tags: ['renal', 'chronic'],
    },
  },
  {
    key: 'osteoarthritis',
    en: {
      title: 'Osteoarthritis',
      subtitle: 'Degenerative joint disease',
      summary: 'Osteoarthritis is characterized by cartilage degeneration causing joint pain, stiffness, and functional limitation that evolves over time.',
      tags: ['musculoskeletal', 'chronic', 'pain'],
    },
    fr: {
      title: 'Arthrose',
      subtitle: 'Maladie dégénérative des articulations',
      summary: 'L’arthrose se caractérise par une dégradation du cartilage entraînant douleur articulaire, raideur et limitation fonctionnelle progressive.',
      tags: ['musculoskeletal', 'chronic', 'pain'],
    },
  },
  {
    key: 'migraine',
    en: {
      title: 'Migraine',
      subtitle: 'Recurrent neurovascular headache',
      summary: 'Migraine is a recurrent headache disorder often associated with nausea, photophobia, and functional impairment during attacks.',
      tags: ['neurology', 'pain', 'episodic'],
    },
    fr: {
      title: 'Migraine',
      subtitle: 'Céphalée neurovasculaire récurrente',
      summary: 'La migraine est un trouble céphalalgique récurrent souvent associé à des nausées, une photophobie et une limitation des activités lors des crises.',
      tags: ['neurology', 'pain', 'episodic'],
    },
  },
  {
    key: 'depression',
    en: {
      title: 'Major Depressive Disorder',
      subtitle: 'Persistent low mood and anhedonia',
      summary: 'Major depressive disorder is marked by persistent low mood and loss of interest, affecting sleep, concentration, and day-to-day functioning.',
      tags: ['mental-health', 'chronic'],
    },
    fr: {
      title: 'Trouble dépressif majeur',
      subtitle: 'Humeur basse persistante et anhédonie',
      summary: 'Le trouble dépressif majeur se manifeste par une humeur basse persistante et une perte d’intérêt, avec impact sur le sommeil, la concentration et le fonctionnement quotidien.',
      tags: ['mental-health', 'chronic'],
    },
  },
  {
    key: 'generalized-anxiety-disorder',
    en: {
      title: 'Generalized Anxiety Disorder',
      subtitle: 'Excessive persistent worry',
      summary: 'Generalized anxiety disorder involves difficult-to-control worry accompanied by somatic symptoms such as restlessness, fatigue, and sleep disturbance.',
      tags: ['mental-health', 'chronic'],
    },
    fr: {
      title: 'Trouble anxieux généralisé',
      subtitle: 'Inquiétude excessive et persistante',
      summary: 'Le trouble anxieux généralisé associe une inquiétude difficile à contrôler à des symptômes physiques comme l’agitation, la fatigue et les troubles du sommeil.',
      tags: ['mental-health', 'chronic'],
    },
  },
  {
    key: 'hypothyroidism',
    en: {
      title: 'Hypothyroidism',
      subtitle: 'Reduced thyroid hormone production',
      summary: 'Hypothyroidism causes slowed metabolism, fatigue, cold intolerance, and weight changes, and is typically managed with hormone replacement.',
      tags: ['endocrine', 'chronic', 'metabolic'],
    },
    fr: {
      title: 'Hypothyroïdie',
      subtitle: 'Diminution de la production d’hormones thyroïdiennes',
      summary: 'L’hypothyroïdie entraîne un ralentissement métabolique, fatigue, frilosité et variations pondérales, et se traite généralement par substitution hormonale.',
      tags: ['endocrine', 'chronic', 'metabolic'],
    },
  },
  {
    key: 'obesity',
    en: {
      title: 'Obesity',
      subtitle: 'Chronic excess adiposity',
      summary: 'Obesity is a chronic multifactorial condition associated with cardiometabolic risk, requiring long-term lifestyle, behavioral, and sometimes pharmacologic strategies.',
      tags: ['metabolic', 'chronic', 'cardiovascular'],
    },
    fr: {
      title: 'Obésité',
      subtitle: 'Excès chronique de masse grasse',
      summary: 'L’obésité est une maladie chronique multifactorielle associée à un risque cardiométabolique, nécessitant une prise en charge durable du mode de vie et parfois médicamenteuse.',
      tags: ['metabolic', 'chronic', 'cardiovascular'],
    },
  },
  {
    key: 'dyslipidemia',
    en: {
      title: 'Dyslipidemia',
      subtitle: 'Abnormal blood lipid profile',
      summary: 'Dyslipidemia includes elevated LDL and/or triglycerides or low HDL, increasing atherosclerotic cardiovascular risk and guiding preventive treatment.',
      tags: ['cardiovascular', 'metabolic', 'chronic'],
    },
    fr: {
      title: 'Dyslipidémie',
      subtitle: 'Anomalie du profil lipidique sanguin',
      summary: 'La dyslipidémie regroupe l’élévation du LDL et/ou des triglycérides ou un HDL bas, augmentant le risque cardiovasculaire athéroscléreux et orientant la prévention.',
      tags: ['cardiovascular', 'metabolic', 'chronic'],
    },
  },
  ...generatedWikiConditionsData,
];

// =============== ONBOARDING DATA ===============

const onboardingGoalsData = [
  { key: 'weight_loss', en: 'Lose Weight', emoji: '⚖️', en_desc: 'Reach your ideal weight', fr: 'Perdre du Poids', fr_desc: 'Atteindre votre poids idéal' },
  { key: 'muscle_gain', en: 'Build Muscle', emoji: '💪', en_desc: 'Grow stronger', fr: 'Développer la Masse Musculaire', fr_desc: 'Devenir plus fort' },
  { key: 'maintenance', en: 'Maintain', emoji: '✨', en_desc: 'Keep up the good work', fr: 'Maintenir', fr_desc: 'Continuer le bon travail' },
  { key: 'better_sleep', en: 'Sleep Better', emoji: '😴', en_desc: 'Improve rest quality', fr: 'Mieux Dormir', fr_desc: 'Améliorer la qualité du sommeil' },
  { key: 'stress_reduction', en: 'Less Stress', emoji: '🧘', en_desc: 'Find your calm', fr: 'Réduire le Stress', fr_desc: 'Trouver votre calme' },
  { key: 'nutrition', en: 'Eat Better', emoji: '🥗', en_desc: 'Healthier food choices', fr: 'Mieux Manger', fr_desc: 'Choix alimentaires plus sains' },
  { key: 'hydration', en: 'Stay Hydrated', emoji: '💧', en_desc: 'Drink more water', fr: 'Rester Hydraté', fr_desc: 'Boire plus d\'eau' },
  { key: 'general_wellness', en: 'Feel Great', emoji: '🌟', en_desc: 'Overall wellness', fr: 'Se Sentir Bien', fr_desc: 'Bien-être général' },
];

const onboardingFitnessLevelsData = [
  { key: 'sedentary', en: 'Sedentary', en_desc: 'Little to no exercise', fr: 'Sédentaire', fr_desc: 'Peu ou pas d\'exercice' },
  { key: 'light', en: 'Lightly Active', en_desc: 'Light exercise 1-3 days/week', fr: 'Légèrement Actif', fr_desc: 'Exercice léger 1-3 jours/semaine' },
  { key: 'moderate', en: 'Moderately Active', en_desc: 'Moderate exercise 3-5 days/week', fr: 'Modérément Actif', fr_desc: 'Exercice modéré 3-5 jours/semaine' },
  { key: 'active', en: 'Active', en_desc: 'Hard exercise 6-7 days/week', fr: 'Actif', fr_desc: 'Exercice intensif 6-7 jours/semaine' },
  { key: 'very_active', en: 'Very Active', en_desc: 'Intense daily training', fr: 'Très Actif', fr_desc: 'Entraînement intensif quotidien' },
];

const onboardingConditionsData = [
  { key: 'diabetes', en: 'Diabetes', fr: 'Diabète' },
  { key: 'hypertension', en: 'Hypertension', fr: 'Hypertension' },
  { key: 'asthma', en: 'Asthma', fr: 'Asthme' },
  { key: 'heart_disease', en: 'Heart Disease', fr: 'Maladie Cardiaque' },
  { key: 'arthritis', en: 'Arthritis', fr: 'Arthrite' },
  { key: 'thyroid_disorder', en: 'Thyroid Disorder', fr: 'Trouble de la Thyroïde' },
  { key: 'depression', en: 'Depression', fr: 'Dépression' },
  { key: 'anxiety', en: 'Anxiety', fr: 'Anxiété' },
  { key: 'migraine', en: 'Migraine', fr: 'Migraine' },
  { key: 'epilepsy', en: 'Epilepsy', fr: 'Épilepsie' },
  { key: 'celiac_disease', en: 'Celiac Disease', fr: 'Maladie Célliaque' },
  { key: 'crohns_disease', en: 'Crohn\'s Disease', fr: 'Maladie de Crohn' },
  { key: 'lupus', en: 'Lupus', fr: 'Lupus' },
  { key: 'eczema', en: 'Eczema', fr: 'Eczéma' },
  { key: 'psoriasis', en: 'Psoriasis', fr: 'Psoriasis' },
  { key: 'insomnia', en: 'Insomnia', fr: 'Insomnie' },
  { key: 'sleep_apnea', en: 'Sleep Apnea', fr: 'Apnée du Sommeil' },
  { key: 'gerd', en: 'Gastroesophageal Reflux Disease (GERD)', fr: 'Maladie du Reflux Gastro-œsophagien (MRO)' },
  { key: 'high_cholesterol', en: 'High Cholesterol', fr: 'Cholestérol Élevé' }
];

const onboardingAllergiesData = [
  { key: 'peanuts', en: 'Peanuts', fr: 'Arachides', category: 'FOOD' },
  { key: 'tree_nuts', en: 'Tree Nuts', fr: 'Noix et Fruits Secs', category: 'FOOD' },
  { key: 'shellfish', en: 'Shellfish', fr: 'Fruits de Mer', category: 'FOOD' },
  { key: 'fish', en: 'Fish', fr: 'Poisson', category: 'FOOD' },
  { key: 'milk', en: 'Milk', fr: 'Lait', category: 'FOOD' },
  { key: 'eggs', en: 'Eggs', fr: 'Œufs', category: 'FOOD' },
  { key: 'wheat', en: 'Wheat', fr: 'Blé', category: 'FOOD' },
  { key: 'soy', en: 'Soy', fr: 'Soja', category: 'FOOD' },
  { key: 'penicillin', en: 'Penicillin', fr: 'Pénicilline', category: 'DRUG' },
  { key: 'latex', en: 'Latex', fr: 'Latex', category: 'ENVIRONMENTAL' },
  { key: 'pollen', en: 'Pollen', fr: 'Pollen', category: 'ENVIRONMENTAL' },
  { key: 'dust_mites', en: 'Dust Mites', fr: 'Acariens', category: 'ENVIRONMENTAL' },
  { key: 'mold', en: 'Mold', fr: 'Moisissure', category: 'ENVIRONMENTAL' },
  { key: 'pet_dander', en: 'Pet Dander', fr: 'Fourrure d\'Animaux', category: 'ENVIRONMENTAL' },
  { key: 'insect_stings', en: 'Insect Stings', fr: 'Piqûres d\'Insectes', category: 'ENVIRONMENTAL' },
  { key: 'sesame', en: 'Sesame', fr: 'Sésame', category: 'FOOD' },
  { key: 'sulfites', en: 'Sulfites', fr: 'Sulfites', category: 'FOOD' },
  { key: 'aspirin', en: 'Aspirin', fr: 'Aspirine', category: 'DRUG' },
  { key: 'ibuprofen', en: 'Ibuprofen', fr: 'Ibuprofène', category: 'DRUG' },
  { key: 'sunscreen', en: 'Sunscreen', fr: 'Écran Solaire', category: 'ENVIRONMENTAL' }
];

const createMedicationSeedRows = (names: readonly string[]) => {
  const keyCounts = new Map<string, number>();

  return names.map((name) => {
    const normalized = name
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '_')
      .replaceAll(/^_+|_+$/g, '') || 'medication';

    const nextCount = (keyCounts.get(normalized) ?? 0) + 1;
    keyCounts.set(normalized, nextCount);

    return {
      key: nextCount > 1 ? `${normalized}_${nextCount}` : normalized,
      name,
    };
  });
};

const onboardingMedicationsEnData = createMedicationSeedRows(COMMON_MEDICATIONS_EN);
const onboardingMedicationsFrData = createMedicationSeedRows(COMMON_MEDICATIONS_FR);

// =============== SEED FUNCTION ===============
export async function seedLocalizedContent() {
  console.log('🌍 Seeding localized content (EN/FR)...');

  try {
    // Clear existing data
    await prisma.firstAidCard.deleteMany({});
    await prisma.firstAidCategory.deleteMany({});
    await prisma.emergencyNumber.deleteMany({});
    await prisma.helpline.deleteMany({});
    await prisma.wikiCondition.deleteMany({});
    await prisma.onboardingGoal.deleteMany({});
    await prisma.onboardingFitnessLevel.deleteMany({});
    await prisma.onboardingCondition.deleteMany({});
    await prisma.onboardingAllergy.deleteMany({});
    await prisma.onboardingMedication.deleteMany({});

    // Seed First Aid Categories
    console.log('  → First Aid Categories...');
    for (const catData of firstAidCategoriesData) {
      const order = firstAidCategoriesData.indexOf(catData);
      // EN
      await prisma.firstAidCategory.create({
        data: {
          key: catData.key,
          locale: 'en',
          name: catData.en,
          icon: catData.icon,
          order,
        },
      });
      // FR
      await prisma.firstAidCategory.create({
        data: {
          key: catData.key,
          locale: 'fr',
          name: catData.fr,
          icon: catData.icon,
          order,
        },
      });
    }

    // Seed First Aid Cards
    console.log('  → First Aid Cards...');
    for (const cardData of firstAidCardsData) {
      const content = cardData.content;
      const category = await prisma.firstAidCategory.findFirst({
        where: { key: cardData.category, locale: 'en' },
      });
      if (!category) continue;

      // EN
      await prisma.firstAidCard.create({
        data: {
          key: cardData.key,
          locale: 'en',
          categoryId: category.id,
          titleKey: content.titleKey,
          descriptionKey: content.descriptionKey,
          icon: cardData.icon,
          severity: cardData.severity,
          stepsJson: JSON.stringify(content.steps),
          warningsJson: JSON.stringify(content.warnings),
          doNotJson: JSON.stringify(content.doNot),
          whenToCallEmergencyJson: JSON.stringify(content.whenToCallEmergency),
          relatedCardsJson: content.relatedCards.length > 0 ? JSON.stringify(content.relatedCards) : null,
        },
      });

      // FR (same category ID as en)
      const categoryFr = await prisma.firstAidCategory.findFirst({
        where: { key: cardData.category, locale: 'fr' },
      });
      if (categoryFr) {
        await prisma.firstAidCard.create({
          data: {
            key: cardData.key,
            locale: 'fr',
            categoryId: categoryFr.id,
            titleKey: content.titleKey,
            descriptionKey: content.descriptionKey,
            icon: cardData.icon,
            severity: cardData.severity,
            stepsJson: JSON.stringify(content.steps),
            warningsJson: JSON.stringify(content.warnings),
            doNotJson: JSON.stringify(content.doNot),
            whenToCallEmergencyJson: JSON.stringify(content.whenToCallEmergency),
            relatedCardsJson: content.relatedCards.length > 0 ? JSON.stringify(content.relatedCards) : null,
          },
        });
      }
    }

    // Seed Emergency Numbers
    console.log('  → Emergency Numbers...');
    for (const numData of emergencyNumbersData) {
      // EN
      await prisma.emergencyNumber.create({
        data: {
          countryCode: numData.countryCode,
          locale: 'en',
          category: numData.category,
          number: numData.en,
        },
      });
      // FR
      await prisma.emergencyNumber.create({
        data: {
          countryCode: numData.countryCode,
          locale: 'fr',
          category: numData.category,
          number: numData.fr,
        },
      });
    }

    // Seed Helplines
    console.log('  → Helplines...');
    for (const helpData of helplinesData) {
      await prisma.helpline.create({
        data: {
          countryCode: helpData.countryCode,
          locale: 'en',
          category: helpData.category,
          name: helpData.en,
          number: helpData.number,
          url: helpData.url ?? null,
          hoursOperating: helpData.hoursOperating ?? null,
        },
      });
      await prisma.helpline.create({
        data: {
          countryCode: helpData.countryCode,
          locale: 'fr',
          category: helpData.category,
          name: helpData.fr,
          number: helpData.number,
          url: helpData.url ?? null,
          hoursOperating: helpData.hoursOperating ?? null,
        },
      });
    }

    // Seed Wiki Conditions
    console.log('  → Wiki Conditions...');
    for (const condData of wikiConditionsData) {
      // EN
      await prisma.wikiCondition.create({
        data: {
          key: condData.key,
          locale: 'en',
          title: condData.en.title,
          subtitle: condData.en.subtitle,
          summary: condData.en.summary,
          tagsJson: JSON.stringify(condData.en.tags),
          sourceUrl: 'https://medlineplus.gov',
          sourceName: 'MedlinePlus',
        },
      });
      // FR
      await prisma.wikiCondition.create({
        data: {
          key: condData.key,
          locale: 'fr',
          title: condData.fr.title,
          subtitle: condData.fr.subtitle,
          summary: condData.fr.summary,
          tagsJson: JSON.stringify(condData.fr.tags),
          sourceUrl: 'https://www.ameli.fr',
          sourceName: 'Ameli',
        },
      });
    }

    // Seed Onboarding Goals
    console.log('  → Onboarding Goals...');
    for (const goalData of onboardingGoalsData) {
      await prisma.onboardingGoal.create({
        data: {
          key: goalData.key,
          locale: 'en',
          label: goalData.en,
          emoji: goalData.emoji,
          description: goalData.en_desc,
        },
      });
      await prisma.onboardingGoal.create({
        data: {
          key: goalData.key,
          locale: 'fr',
          label: goalData.fr,
          emoji: goalData.emoji,
          description: goalData.fr_desc,
        },
      });
    }

    // Seed Fitness Levels
    console.log('  → Fitness Levels...');
    for (let i = 0; i < onboardingFitnessLevelsData.length; i++) {
      const fitData = onboardingFitnessLevelsData[i];
      await prisma.onboardingFitnessLevel.create({
        data: {
          key: fitData.key,
          locale: 'en',
          label: fitData.en,
          description: fitData.en_desc,
          order: i,
        },
      });
      await prisma.onboardingFitnessLevel.create({
        data: {
          key: fitData.key,
          locale: 'fr',
          label: fitData.fr,
          description: fitData.fr_desc,
          order: i,
        },
      });
    }

    // Seed Onboarding Conditions
    console.log('  → Onboarding Conditions...');
    for (const condData of onboardingConditionsData) {
      await prisma.onboardingCondition.create({
        data: {
          key: condData.key,
          locale: 'en',
          name: condData.en,
        },
      });
      await prisma.onboardingCondition.create({
        data: {
          key: condData.key,
          locale: 'fr',
          name: condData.fr,
        },
      });
    }

    // Seed Onboarding Allergies
    console.log('  → Onboarding Allergies...');
    for (const allergyData of onboardingAllergiesData) {
      await prisma.onboardingAllergy.create({
        data: {
          key: allergyData.key,
          locale: 'en',
          name: allergyData.en,
          category: allergyData.category,
        },
      });
      await prisma.onboardingAllergy.create({
        data: {
          key: allergyData.key,
          locale: 'fr',
          name: allergyData.fr,
          category: allergyData.category,
        },
      });
    }

    // Seed Onboarding Medications
    console.log('  → Onboarding Medications...');
    for (const medicationData of onboardingMedicationsEnData) {
      await prisma.onboardingMedication.create({
        data: {
          key: medicationData.key,
          locale: 'en',
          name: medicationData.name,
        },
      });
    }

    for (const medicationData of onboardingMedicationsFrData) {
      await prisma.onboardingMedication.create({
        data: {
          key: medicationData.key,
          locale: 'fr',
          name: medicationData.name,
        },
      });
    }

    console.log('✅ Localized content seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding localized content:', error);
    throw error;
  }
}
