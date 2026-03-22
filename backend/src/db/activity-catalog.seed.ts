/**
 * Activity Catalog Seed
 * 65 activities with real MET values from the Compendium of Physical Activities
 * (Ainsworth et al., 2011 — https://sites.google.com/site/compendiumofphysicalactivities/)
 *
 * Calories burned formula: MET × weight_kg × duration_hours
 * Default reference weight used in calorie estimates: 70 kg
 */

import { prisma } from '../lib/prisma';
import type { ActivityType } from '@prisma/client';

export interface ActivityCatalogEntry {
  key: string;
  name: string;
  category: ActivityType;
  metValue: number;
  emoji: string;
  description: string;
  tags: string[];
}

export const ACTIVITY_CATALOG: ActivityCatalogEntry[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // WALK
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'WALK_LEISURELY',
    name: 'Leisurely Walk',
    category: 'WALK',
    metValue: 2.5,
    emoji: '🚶',
    description: 'Easy-paced walking at ~2 mph / 3 km/h. Great for active recovery or a gentle warm-up.',
    tags: ['cardio', 'low-impact', 'outdoor', 'indoor', 'beginner'],
  },
  {
    key: 'WALK_MODERATE',
    name: 'Moderate Walk',
    category: 'WALK',
    metValue: 3.5,
    emoji: '🚶',
    description: 'Comfortable walking pace at ~3 mph / 5 km/h. The everyday default for most adults.',
    tags: ['cardio', 'low-impact', 'outdoor', 'beginner'],
  },
  {
    key: 'WALK_BRISK',
    name: 'Brisk Walk',
    category: 'WALK',
    metValue: 5,
    emoji: '🚶‍♂️',
    description: 'Fast-paced walking at ~4 mph / 6.5 km/h. Noticeably raises heart rate.',
    tags: ['cardio', 'low-impact', 'outdoor', 'intermediate'],
  },
  {
    key: 'WALK_NORDIC',
    name: 'Nordic Walking',
    category: 'WALK',
    metValue: 6.8,
    emoji: '🥢',
    description: 'Walking with poles engaging upper body. Burns significantly more calories than regular walking.',
    tags: ['cardio', 'full-body', 'outdoor', 'intermediate'],
  },
  {
    key: 'WALK_HIKING',
    name: 'Hiking',
    category: 'WALK',
    metValue: 6,
    emoji: '🥾',
    description: 'Hiking on trails or hills with moderate elevation gain.',
    tags: ['cardio', 'outdoor', 'nature', 'intermediate'],
  },
  {
    key: 'WALK_TREKKING',
    name: 'Trekking / Backpacking',
    category: 'WALK',
    metValue: 7,
    emoji: '🎒',
    description: 'Multi-hour hiking carrying a loaded pack. High calorie demand.',
    tags: ['cardio', 'outdoor', 'endurance', 'advanced'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RUN
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'RUN_JOGGING',
    name: 'Jogging',
    category: 'RUN',
    metValue: 7,
    emoji: '🏃',
    description: 'Easy running pace, ~5 mph / 8 km/h. Ideal for base aerobic conditioning.',
    tags: ['cardio', 'outdoor', 'endurance', 'beginner'],
  },
  {
    key: 'RUN_5MPH',
    name: 'Running (5 mph / 8 km/h)',
    category: 'RUN',
    metValue: 8.3,
    emoji: '🏃',
    description: 'Moderate running pace. Comfortable for most recreational runners.',
    tags: ['cardio', 'outdoor', 'endurance', 'intermediate'],
  },
  {
    key: 'RUN_6MPH',
    name: 'Running (6 mph / 10 km/h)',
    category: 'RUN',
    metValue: 9.8,
    emoji: '🏃',
    description: 'Steady aerobic running. A solid 10 km/h tempo.',
    tags: ['cardio', 'outdoor', 'endurance', 'intermediate'],
  },
  {
    key: 'RUN_8MPH',
    name: 'Running (8 mph / 13 km/h)',
    category: 'RUN',
    metValue: 11.8,
    emoji: '🏃‍♂️',
    description: 'Fast running, near race pace for many athletes.',
    tags: ['cardio', 'outdoor', 'endurance', 'advanced'],
  },
  {
    key: 'RUN_TRAIL',
    name: 'Trail Running',
    category: 'RUN',
    metValue: 9,
    emoji: '🏔️',
    description: 'Running on trails with varied terrain and elevation changes.',
    tags: ['cardio', 'outdoor', 'nature', 'intermediate'],
  },
  {
    key: 'RUN_SPRINT',
    name: 'Sprint Intervals',
    category: 'RUN',
    metValue: 14,
    emoji: '⚡',
    description: 'Short explosive sprints at maximum effort with rest periods. Highest calorie burn per minute.',
    tags: ['cardio', 'high-intensity', 'speed', 'advanced'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CYCLE
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'CYCLE_LEISURELY',
    name: 'Cycling (Leisure, <16 km/h)',
    category: 'CYCLE',
    metValue: 4,
    emoji: '🚴',
    description: 'Easy recreational cycling on flat roads at under 16 km/h.',
    tags: ['cardio', 'low-impact', 'outdoor', 'beginner'],
  },
  {
    key: 'CYCLE_MODERATE',
    name: 'Cycling (Moderate, 16–19 km/h)',
    category: 'CYCLE',
    metValue: 6.8,
    emoji: '🚴',
    description: 'Moderate road cycling. Good aerobic conditioning.',
    tags: ['cardio', 'low-impact', 'outdoor', 'intermediate'],
  },
  {
    key: 'CYCLE_VIGOROUS',
    name: 'Cycling (Vigorous, >20 km/h)',
    category: 'CYCLE',
    metValue: 10,
    emoji: '🚴‍♂️',
    description: 'Fast road cycling at 20+ km/h. Significant cardiovascular demand.',
    tags: ['cardio', 'outdoor', 'endurance', 'advanced'],
  },
  {
    key: 'CYCLE_MTB',
    name: 'Mountain Biking',
    category: 'CYCLE',
    metValue: 8.5,
    emoji: '🚵',
    description: 'Off-road cycling on rough trails. Requires balance and power.',
    tags: ['cardio', 'outdoor', 'nature', 'advanced'],
  },
  {
    key: 'CYCLE_STATIONARY',
    name: 'Stationary Bike (Moderate)',
    category: 'CYCLE',
    metValue: 5.5,
    emoji: '🚲',
    description: 'Indoor bike at moderate resistance. Low-impact and joint-friendly.',
    tags: ['cardio', 'low-impact', 'indoor', 'intermediate'],
  },
  {
    key: 'CYCLE_SPINNING',
    name: 'Spinning / Indoor Cycling Class',
    category: 'CYCLE',
    metValue: 8.5,
    emoji: '🎯',
    description: 'High-intensity instructor-led cycling class with intervals and sprints.',
    tags: ['cardio', 'high-intensity', 'indoor', 'intermediate'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SWIM
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'SWIM_LEISURELY',
    name: 'Swimming (Leisure)',
    category: 'SWIM',
    metValue: 5.8,
    emoji: '🏊',
    description: 'Casual laps or recreational swimming. Easy on joints.',
    tags: ['cardio', 'low-impact', 'full-body', 'beginner'],
  },
  {
    key: 'SWIM_FREESTYLE_MOD',
    name: 'Freestyle Swimming (Moderate)',
    category: 'SWIM',
    metValue: 7,
    emoji: '🏊',
    description: 'Front crawl at a steady, controlled pace.',
    tags: ['cardio', 'full-body', 'intermediate'],
  },
  {
    key: 'SWIM_FREESTYLE_VIG',
    name: 'Freestyle Swimming (Vigorous)',
    category: 'SWIM',
    metValue: 10,
    emoji: '🏊‍♂️',
    description: 'Hard effort freestyle. Close to competitive training pace.',
    tags: ['cardio', 'full-body', 'high-intensity', 'advanced'],
  },
  {
    key: 'SWIM_BREASTSTROKE',
    name: 'Breaststroke',
    category: 'SWIM',
    metValue: 10.3,
    emoji: '🏊',
    description: 'Breaststroke is one of the highest-MET swim strokes due to the leg kick.',
    tags: ['cardio', 'full-body', 'advanced'],
  },
  {
    key: 'SWIM_BACKSTROKE',
    name: 'Backstroke',
    category: 'SWIM',
    metValue: 7,
    emoji: '🏊',
    description: 'Good for posture and shoulder mobility while keeping the head above water.',
    tags: ['cardio', 'full-body', 'intermediate'],
  },
  {
    key: 'SWIM_WATER_POLO',
    name: 'Water Polo',
    category: 'WATER_SPORTS',
    metValue: 10,
    emoji: '🤽',
    description: 'Highly demanding team sport played in water. Combines swimming and ball skills.',
    tags: ['cardio', 'team', 'high-intensity', 'advanced'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // YOGA & MINDFULNESS
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'YOGA_HATHA',
    name: 'Hatha Yoga',
    category: 'YOGA',
    metValue: 2.5,
    emoji: '🧘',
    description: 'Gentle yoga focusing on basic postures and breathing. Perfect for beginners.',
    tags: ['flexibility', 'mindfulness', 'low-impact', 'beginner'],
  },
  {
    key: 'YOGA_VINYASA',
    name: 'Vinyasa Flow Yoga',
    category: 'YOGA',
    metValue: 4,
    emoji: '🧘',
    description: 'Dynamic yoga linking breath to movement. Raises heart rate more than Hatha.',
    tags: ['flexibility', 'cardio', 'mindfulness', 'intermediate'],
  },
  {
    key: 'YOGA_HOT',
    name: 'Hot Yoga / Bikram',
    category: 'YOGA',
    metValue: 5,
    emoji: '🔥',
    description: 'Yoga practiced in a heated room (~40°C). Increases sweat and calorie burn.',
    tags: ['flexibility', 'high-intensity', 'indoor', 'intermediate'],
  },
  {
    key: 'YOGA_POWER',
    name: 'Power Yoga / Ashtanga',
    category: 'YOGA',
    metValue: 4,
    emoji: '💪',
    description: 'Strength-focused yoga with challenging sequences and holds.',
    tags: ['flexibility', 'strength', 'intermediate'],
  },
  {
    key: 'MINDFULNESS_PILATES',
    name: 'Pilates',
    category: 'MINDFULNESS',
    metValue: 3,
    emoji: '🧘‍♀️',
    description: 'Core-focused exercises on mat or reformer. Builds stability and posture.',
    tags: ['core', 'flexibility', 'low-impact', 'indoor', 'beginner'],
  },
  {
    key: 'MINDFULNESS_TAICHI',
    name: 'Tai Chi',
    category: 'MINDFULNESS',
    metValue: 3,
    emoji: '☯️',
    description: 'Ancient Chinese martial art practiced as slow, flowing movement meditation.',
    tags: ['mindfulness', 'flexibility', 'balance', 'low-impact', 'beginner'],
  },
  {
    key: 'MINDFULNESS_STRETCH',
    name: 'Stretching / Flexibility',
    category: 'MINDFULNESS',
    metValue: 2.3,
    emoji: '🤸',
    description: 'General stretching, foam rolling, or flexibility work.',
    tags: ['flexibility', 'recovery', 'low-impact', 'beginner'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STRENGTH
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'STRENGTH_MODERATE',
    name: 'Weight Training (Moderate)',
    category: 'STRENGTH',
    metValue: 3.5,
    emoji: '🏋️',
    description: 'Gym-based resistance training with moderate weights. Standard workout.',
    tags: ['strength', 'muscle', 'indoor', 'beginner'],
  },
  {
    key: 'STRENGTH_VIGOROUS',
    name: 'Weight Training (Vigorous)',
    category: 'STRENGTH',
    metValue: 6,
    emoji: '🏋️‍♂️',
    description: 'Heavy compound lifting — squats, deadlifts, bench press at high intensity.',
    tags: ['strength', 'muscle', 'indoor', 'advanced'],
  },
  {
    key: 'STRENGTH_BODYWEIGHT',
    name: 'Bodyweight Exercises',
    category: 'STRENGTH',
    metValue: 3.8,
    emoji: '🤸‍♂️',
    description: 'Push-ups, pull-ups, dips, lunges — no equipment needed.',
    tags: ['strength', 'calisthenics', 'beginner', 'outdoor', 'indoor'],
  },
  {
    key: 'STRENGTH_CROSSFIT',
    name: 'CrossFit / Functional Fitness',
    category: 'STRENGTH',
    metValue: 10,
    emoji: '🔥',
    description: 'High-intensity functional movements: Olympic lifts, gymnastics, metabolic conditioning.',
    tags: ['strength', 'cardio', 'high-intensity', 'advanced'],
  },
  {
    key: 'STRENGTH_CALISTHENICS',
    name: 'Calisthenics (Vigorous)',
    category: 'STRENGTH',
    metValue: 8,
    emoji: '💪',
    description: 'Advanced bodyweight skills: muscle-ups, handstands, planche progressions.',
    tags: ['strength', 'skill', 'outdoor', 'advanced'],
  },
  {
    key: 'STRENGTH_POWERLIFTING',
    name: 'Powerlifting',
    category: 'STRENGTH',
    metValue: 6,
    emoji: '🏋️',
    description: 'Competition-style squat, bench and deadlift training at maximal loads.',
    tags: ['strength', 'muscle', 'indoor', 'advanced'],
  },
  {
    key: 'STRENGTH_BANDS',
    name: 'Resistance Bands',
    category: 'STRENGTH',
    metValue: 3,
    emoji: '🪢',
    description: 'Full-body strength work using elastic resistance bands. Great for travel.',
    tags: ['strength', 'low-impact', 'indoor', 'beginner'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HIIT
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'HIIT_GENERAL',
    name: 'HIIT (General)',
    category: 'HIIT',
    metValue: 8,
    emoji: '⚡',
    description: 'High-Intensity Interval Training alternating hard efforts with rest periods.',
    tags: ['cardio', 'high-intensity', 'fat-burn', 'intermediate'],
  },
  {
    key: 'HIIT_TABATA',
    name: 'Tabata',
    category: 'HIIT',
    metValue: 10,
    emoji: '⏱️',
    description: '20 seconds max effort / 10 seconds rest, 8 rounds. 4-minute protocol.',
    tags: ['cardio', 'high-intensity', 'fat-burn', 'advanced'],
  },
  {
    key: 'HIIT_CIRCUIT',
    name: 'Circuit Training',
    category: 'HIIT',
    metValue: 8,
    emoji: '🔄',
    description: 'Multiple exercise stations performed back-to-back with minimal rest.',
    tags: ['cardio', 'strength', 'full-body', 'intermediate'],
  },
  {
    key: 'HIIT_JUMP_ROPE',
    name: 'Jump Rope',
    category: 'HIIT',
    metValue: 10,
    emoji: '🪅',
    description: 'Skipping rope at moderate to fast pace. Excellent cardio and coordination.',
    tags: ['cardio', 'high-intensity', 'coordination', 'intermediate'],
  },
  {
    key: 'HIIT_PLYOMETRICS',
    name: 'Plyometrics',
    category: 'HIIT',
    metValue: 9.5,
    emoji: '🦘',
    description: 'Explosive jump training: box jumps, broad jumps, depth jumps.',
    tags: ['cardio', 'power', 'high-intensity', 'advanced'],
  },
  {
    key: 'HIIT_BURPEES',
    name: 'Burpees',
    category: 'HIIT',
    metValue: 10,
    emoji: '🔥',
    description: 'Full-body compound exercise combining a squat, plank, push-up and jump.',
    tags: ['cardio', 'strength', 'high-intensity', 'intermediate'],
  },
  {
    key: 'HIIT_STAIR_CLIMBING',
    name: 'Stair Climbing',
    category: 'HIIT',
    metValue: 9,
    emoji: '🪜',
    description: 'Climbing stairs rapidly — machine or real stairs. Excellent glutes and cardio.',
    tags: ['cardio', 'legs', 'high-intensity', 'intermediate'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TEAM_SPORTS / SPORTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'SPORTS_BASKETBALL',
    name: 'Basketball',
    category: 'TEAM_SPORTS',
    metValue: 8,
    emoji: '🏀',
    description: 'Full-court basketball game. Mix of sprinting, jumping and lateral movement.',
    tags: ['cardio', 'team', 'outdoor', 'intermediate'],
  },
  {
    key: 'SPORTS_SOCCER',
    name: 'Soccer / Football',
    category: 'TEAM_SPORTS',
    metValue: 7,
    emoji: '⚽',
    description: 'Recreational or competitive 11-a-side soccer.',
    tags: ['cardio', 'team', 'outdoor', 'intermediate'],
  },
  {
    key: 'SPORTS_AMERICAN_FOOTBALL',
    name: 'American Football',
    category: 'TEAM_SPORTS',
    metValue: 8,
    emoji: '🏈',
    description: 'Flag or tackle football with explosive sprint bursts and strength demands.',
    tags: ['cardio', 'team', 'strength', 'intermediate'],
  },
  {
    key: 'SPORTS_RUGBY',
    name: 'Rugby',
    category: 'TEAM_SPORTS',
    metValue: 8.3,
    emoji: '🏉',
    description: 'Contact sport requiring sustained running, tackling and scrumming.',
    tags: ['cardio', 'team', 'strength', 'advanced'],
  },
  {
    key: 'SPORTS_VOLLEYBALL',
    name: 'Volleyball',
    category: 'TEAM_SPORTS',
    metValue: 4,
    emoji: '🏐',
    description: 'Recreational volleyball. Moderate activity with jumps and lateral movement.',
    tags: ['cardio', 'team', 'outdoor', 'beginner'],
  },
  {
    key: 'SPORTS_BASEBALL',
    name: 'Baseball / Softball',
    category: 'TEAM_SPORTS',
    metValue: 5,
    emoji: '⚾',
    description: 'Diamond sport combining explosive running, throwing and batting.',
    tags: ['cardio', 'team', 'outdoor', 'beginner'],
  },
  {
    key: 'SPORTS_CRICKET',
    name: 'Cricket',
    category: 'TEAM_SPORTS',
    metValue: 5,
    emoji: '🏏',
    description: 'Batting, bowling and fielding across a match lasting several hours.',
    tags: ['cardio', 'team', 'outdoor', 'intermediate'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RACKET_SPORTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'RACKET_TENNIS_SINGLES',
    name: 'Tennis (Singles)',
    category: 'RACKET_SPORTS',
    metValue: 8,
    emoji: '🎾',
    description: 'Singles tennis — highly demanding with explosive lateral movement.',
    tags: ['cardio', 'skill', 'outdoor', 'intermediate'],
  },
  {
    key: 'RACKET_TENNIS_DOUBLES',
    name: 'Tennis (Doubles)',
    category: 'RACKET_SPORTS',
    metValue: 6,
    emoji: '🎾',
    description: 'Doubles tennis — less running but still great cardio.',
    tags: ['cardio', 'skill', 'outdoor', 'beginner'],
  },
  {
    key: 'RACKET_BADMINTON',
    name: 'Badminton',
    category: 'RACKET_SPORTS',
    metValue: 5.5,
    emoji: '🏸',
    description: 'Fast rallies and quick direction changes. Great for agility.',
    tags: ['cardio', 'agility', 'skill', 'intermediate'],
  },
  {
    key: 'RACKET_SQUASH',
    name: 'Squash',
    category: 'RACKET_SPORTS',
    metValue: 12,
    emoji: '🎯',
    description: 'One of the highest-MET racket sports. Intense rallies in a confined court.',
    tags: ['cardio', 'high-intensity', 'skill', 'advanced'],
  },
  {
    key: 'RACKET_TABLE_TENNIS',
    name: 'Table Tennis / Ping-Pong',
    category: 'RACKET_SPORTS',
    metValue: 4,
    emoji: '🏓',
    description: 'Fast reflexes and hand-eye coordination. Surprisingly good cardio.',
    tags: ['cardio', 'skill', 'coordination', 'beginner'],
  },
  {
    key: 'SPORTS_GOLF_WALK',
    name: 'Golf (Walking, Carrying Clubs)',
    category: 'SPORTS',
    metValue: 4.5,
    emoji: '⛳',
    description: 'Playing golf while walking the course and carrying your own bag.',
    tags: ['cardio', 'outdoor', 'low-impact', 'beginner'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DANCE
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'DANCE_GENERAL',
    name: 'Dance (General)',
    category: 'DANCE',
    metValue: 4.8,
    emoji: '💃',
    description: 'General social dancing — any style at a moderate pace.',
    tags: ['cardio', 'social', 'fun', 'beginner'],
  },
  {
    key: 'DANCE_ZUMBA',
    name: 'Zumba',
    category: 'DANCE',
    metValue: 7.5,
    emoji: '🪘',
    description: 'Latin-inspired dance fitness class with high energy intervals.',
    tags: ['cardio', 'fun', 'social', 'intermediate'],
  },
  {
    key: 'DANCE_SALSA',
    name: 'Salsa / Latin Dance',
    category: 'DANCE',
    metValue: 5.5,
    emoji: '🌶️',
    description: 'Structured partner or solo Latin dance. Great footwork and hip workout.',
    tags: ['cardio', 'skill', 'social', 'intermediate'],
  },
  {
    key: 'DANCE_HIPHOP',
    name: 'Hip-Hop Dance',
    category: 'DANCE',
    metValue: 7,
    emoji: '🎤',
    description: 'Urban dance styles — breaking, popping, locking. High energy.',
    tags: ['cardio', 'fun', 'skill', 'intermediate'],
  },
  {
    key: 'DANCE_BALLET',
    name: 'Ballet / Barre',
    category: 'DANCE',
    metValue: 4.8,
    emoji: '🩰',
    description: 'Classical ballet or barre fitness class. Builds strength, balance and flexibility.',
    tags: ['flexibility', 'strength', 'skill', 'intermediate'],
  },
  {
    key: 'DANCE_BALLROOM',
    name: 'Ballroom Dancing',
    category: 'DANCE',
    metValue: 5,
    emoji: '🕺',
    description: 'Waltz, foxtrot, tango and other ballroom styles.',
    tags: ['cardio', 'social', 'skill', 'beginner'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ROWING
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'ROWING_MODERATE',
    name: 'Rowing Machine (Moderate)',
    category: 'ROWING',
    metValue: 7,
    emoji: '🚣',
    description: 'Indoor rower at moderate pace. Excellent full-body, low-impact cardio.',
    tags: ['cardio', 'full-body', 'low-impact', 'intermediate'],
  },
  {
    key: 'ROWING_VIGOROUS',
    name: 'Rowing Machine (Vigorous)',
    category: 'ROWING',
    metValue: 8.5,
    emoji: '🚣‍♂️',
    description: 'High-effort rowing. Close to competitive split times.',
    tags: ['cardio', 'full-body', 'high-intensity', 'advanced'],
  },
  {
    key: 'ROWING_WATER',
    name: 'Rowing on Water',
    category: 'ROWING',
    metValue: 7,
    emoji: '🛶',
    description: 'Sculling or sweep rowing on open water.',
    tags: ['cardio', 'full-body', 'outdoor', 'intermediate'],
  },
  {
    key: 'ROWING_KAYAKING',
    name: 'Kayaking',
    category: 'WATER_SPORTS',
    metValue: 5,
    emoji: '🛶',
    description: 'Recreational kayaking on calm water. Good upper body and core work.',
    tags: ['cardio', 'outdoor', 'upper-body', 'beginner'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CLIMB
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'CLIMB_ROCK',
    name: 'Rock Climbing',
    category: 'CLIMB',
    metValue: 7.5,
    emoji: '🧗',
    description: 'Climbing on natural rock or indoor wall. Upper body, grip and problem-solving.',
    tags: ['strength', 'skill', 'outdoor', 'intermediate'],
  },
  {
    key: 'CLIMB_BOULDERING',
    name: 'Bouldering',
    category: 'CLIMB',
    metValue: 8,
    emoji: '🧗‍♂️',
    description: 'Short high-intensity climbing routes without rope. Pure power and technique.',
    tags: ['strength', 'power', 'skill', 'intermediate'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MARTIAL_ARTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'MARTIAL_GENERAL',
    name: 'Martial Arts (General)',
    category: 'MARTIAL_ARTS',
    metValue: 10,
    emoji: '🥋',
    description: 'General martial arts training — forms, drills, sparring.',
    tags: ['cardio', 'strength', 'skill', 'intermediate'],
  },
  {
    key: 'MARTIAL_BOXING',
    name: 'Boxing / Sparring',
    category: 'MARTIAL_ARTS',
    metValue: 9,
    emoji: '🥊',
    description: 'Boxing bag work or partner sparring. Full-body high-intensity.',
    tags: ['cardio', 'high-intensity', 'skill', 'advanced'],
  },
  {
    key: 'MARTIAL_KICKBOXING',
    name: 'Kickboxing',
    category: 'MARTIAL_ARTS',
    metValue: 10,
    emoji: '🥊',
    description: 'Combines punching and kicking. One of the highest calorie-burn workouts.',
    tags: ['cardio', 'strength', 'high-intensity', 'intermediate'],
  },
  {
    key: 'MARTIAL_MMA',
    name: 'MMA Training',
    category: 'MARTIAL_ARTS',
    metValue: 10.3,
    emoji: '🥋',
    description: 'Mixed Martial Arts — grappling, striking, wrestling.',
    tags: ['cardio', 'strength', 'skill', 'advanced'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WINTER_SPORTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'WINTER_SKIING',
    name: 'Skiing (Downhill)',
    category: 'WINTER_SPORTS',
    metValue: 7,
    emoji: '⛷️',
    description: 'Downhill alpine skiing. Good leg and core workout.',
    tags: ['cardio', 'legs', 'outdoor', 'intermediate'],
  },
  {
    key: 'WINTER_SNOWBOARD',
    name: 'Snowboarding',
    category: 'WINTER_SPORTS',
    metValue: 5.3,
    emoji: '🏂',
    description: 'Riding a snowboard down slopes. Balance and core demand.',
    tags: ['balance', 'outdoor', 'intermediate'],
  },
  {
    key: 'WINTER_ICE_SKATING',
    name: 'Ice Skating',
    category: 'WINTER_SPORTS',
    metValue: 5.5,
    emoji: '⛸️',
    description: 'Recreational ice skating. Good for balance and lower-body strength.',
    tags: ['cardio', 'balance', 'outdoor', 'beginner'],
  },
  {
    key: 'WINTER_ICE_HOCKEY',
    name: 'Ice Hockey',
    category: 'WINTER_SPORTS',
    metValue: 10,
    emoji: '🏒',
    description: 'High-speed team sport on ice with explosive skating and physical contact.',
    tags: ['cardio', 'team', 'high-intensity', 'advanced'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WATER_SPORTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'WATER_SURFING',
    name: 'Surfing',
    category: 'WATER_SPORTS',
    metValue: 3,
    emoji: '🏄',
    description: 'Ocean surfing including paddling and riding waves.',
    tags: ['balance', 'outdoor', 'nature', 'intermediate'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OTHER
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'OTHER_ELLIPTICAL',
    name: 'Elliptical Trainer',
    category: 'OTHER',
    metValue: 5,
    emoji: '🔄',
    description: 'Low-impact cross-trainer machine. Mimics running without the joint stress.',
    tags: ['cardio', 'low-impact', 'indoor', 'beginner'],
  },
  {
    key: 'OTHER_SKATEBOARD',
    name: 'Skateboarding',
    category: 'OTHER',
    metValue: 5,
    emoji: '🛹',
    description: 'Street or park skating. Builds balance, core and lower-body strength.',
    tags: ['balance', 'skill', 'outdoor', 'intermediate'],
  },
  {
    key: 'OTHER_HULA_HOOP',
    name: 'Hula Hooping',
    category: 'OTHER',
    metValue: 4.5,
    emoji: '⭕',
    description: 'Core-focused rhythmic exercise. Fun and surprisingly effective.',
    tags: ['core', 'fun', 'coordination', 'beginner'],
  },
  {
    key: 'OTHER_TRAMPOLINE',
    name: 'Trampoline / Rebounding',
    category: 'OTHER',
    metValue: 3.5,
    emoji: '🤸',
    description: 'Jumping on a trampoline. Low-impact cardio that feels like play.',
    tags: ['cardio', 'low-impact', 'fun', 'beginner'],
  },
  {
    key: 'OTHER_FRISBEE',
    name: 'Frisbee / Ultimate Frisbee',
    category: 'OTHER',
    metValue: 3.5,
    emoji: '🥏',
    description: 'Casual throw and catch or ultimate frisbee team sport.',
    tags: ['cardio', 'social', 'outdoor', 'beginner'],
  },
  {
    key: 'RUN_INTERVALS',
    name: 'Running Intervals',
    category: 'RUN',
    metValue: 12,
    emoji: '🏁',
    description: 'Structured run/walk or speed intervals with work and recovery blocks.',
    tags: ['cardio', 'intervals', 'outdoor', 'advanced'],
  },
  {
    key: 'RUN_INCLINE_TREADMILL',
    name: 'Incline Treadmill Run',
    category: 'RUN',
    metValue: 10.3,
    emoji: '⛰️',
    description: 'Running on an incline treadmill to increase cardiovascular and leg demand.',
    tags: ['cardio', 'indoor', 'legs', 'intermediate'],
  },
  {
    key: 'CYCLE_COMMUTE',
    name: 'Cycling (Commute / Leisure)',
    category: 'CYCLE',
    metValue: 4,
    emoji: '🚲',
    description: 'Easy cycling for transportation or relaxed outdoor riding.',
    tags: ['cardio', 'low-impact', 'commute', 'beginner'],
  },
  {
    key: 'CYCLE_SPIN_CLASS',
    name: 'Spin Bike Class',
    category: 'CYCLE',
    metValue: 9,
    emoji: '🎧',
    description: 'Instructor-led indoor cycling class with cadence changes and resistance blocks.',
    tags: ['cardio', 'indoor', 'high-intensity', 'intermediate'],
  },
  {
    key: 'COND_AEROBIC_GENERAL',
    name: 'Aerobic Exercise',
    category: 'HIIT',
    metValue: 7.3,
    emoji: '💃',
    description: 'General aerobic exercise with continuous movement and moderate intensity.',
    tags: ['cardio', 'indoor', 'fitness-class', 'intermediate'],
  },
  {
    key: 'COND_AEROBIC_HIGH_IMPACT',
    name: 'High-Impact Aerobic Dance',
    category: 'HIIT',
    metValue: 8,
    emoji: '🪩',
    description: 'Vigorous dance-cardio class with jumps, fast footwork, and large arm movements.',
    tags: ['cardio', 'indoor', 'high-intensity', 'advanced'],
  },
  {
    key: 'COND_JUMP_ROPE_SPEED',
    name: 'Jump Rope',
    category: 'HIIT',
    metValue: 11,
    emoji: '🪢',
    description: 'Continuous rope skipping for a high-output cardio session.',
    tags: ['cardio', 'coordination', 'high-intensity', 'intermediate'],
  },
  {
    key: 'COND_KETTLEBELL_SWINGS',
    name: 'Kettlebell Swings',
    category: 'STRENGTH',
    metValue: 9.8,
    emoji: '🛎️',
    description: 'Explosive hip-hinge conditioning focused on posterior chain power.',
    tags: ['strength', 'power', 'conditioning', 'advanced'],
  },
  {
    key: 'COND_BODYWEIGHT_HIGH',
    name: 'Bodyweight Conditioning',
    category: 'STRENGTH',
    metValue: 6.5,
    emoji: '🤸',
    description: 'High-intensity bodyweight work such as lunges, push-ups, crunches, and squats.',
    tags: ['strength', 'conditioning', 'indoor', 'intermediate'],
  },
  {
    key: 'DANCE_AEROBIC',
    name: 'Aerobic Dance',
    category: 'DANCE',
    metValue: 6.5,
    emoji: '🕺',
    description: 'Dance fitness class built around sustained rhythmic aerobic movement.',
    tags: ['cardio', 'fitness-class', 'fun', 'intermediate'],
  },
  {
    key: 'DANCE_SQUARE',
    name: 'Square Dancing',
    category: 'DANCE',
    metValue: 5.5,
    emoji: '💫',
    description: 'Social group dance with coordinated steps and partner changes.',
    tags: ['cardio', 'social', 'skill', 'beginner'],
  },
  {
    key: 'DANCE_ZUMBA_GROUP',
    name: 'Zumba (Group Class)',
    category: 'DANCE',
    metValue: 6.5,
    emoji: '🪘',
    description: 'Dance fitness class mixing Latin and global rhythms with continuous movement.',
    tags: ['cardio', 'fitness-class', 'fun', 'intermediate'],
  },
  {
    key: 'WATER_AEROBICS',
    name: 'Water Aerobics',
    category: 'WATER_SPORTS',
    metValue: 5.3,
    emoji: '🏊',
    description: 'Pool-based cardio and resistance work with low joint impact.',
    tags: ['cardio', 'low-impact', 'indoor', 'beginner'],
  },
  {
    key: 'WATER_KAYAKING',
    name: 'Recreational Kayaking',
    category: 'WATER_SPORTS',
    metValue: 5,
    emoji: '🛶',
    description: 'Paddling on calm water for a steady upper-body and core workout.',
    tags: ['cardio', 'outdoor', 'core', 'beginner'],
  },
  {
    key: 'WINTER_SKI_ERG',
    name: 'Ski Ergometer',
    category: 'WINTER_SPORTS',
    metValue: 10.5,
    emoji: '🎿',
    description: 'Indoor ski-machine training that simulates cross-country double poling.',
    tags: ['cardio', 'indoor', 'full-body', 'advanced'],
  },
  {
    key: 'MARTIAL_TAE_KWON_DO',
    name: 'Taekwondo',
    category: 'MARTIAL_ARTS',
    metValue: 10,
    emoji: '🥋',
    description: 'Kicking-focused martial arts training with forms, drills, and sparring.',
    tags: ['cardio', 'skill', 'high-intensity', 'intermediate'],
  },
  {
    key: 'RACKET_SQUASH_LEISURE',
    name: 'Squash (Recreational)',
    category: 'RACKET_SPORTS',
    metValue: 9,
    emoji: '🎾',
    description: 'Casual squash play with fast movement but lower competitive intensity.',
    tags: ['cardio', 'skill', 'indoor', 'intermediate'],
  },
  {
    key: 'SPORTS_HIKING_PACK',
    name: 'Hiking with Backpack',
    category: 'WALK',
    metValue: 8,
    emoji: '🎒',
    description: 'Trail hiking while carrying a light pack for extra load and endurance work.',
    tags: ['cardio', 'outdoor', 'endurance', 'intermediate'],
  },
];

/**
 * Upserts all activity catalog entries into the database.
 * Safe to run multiple times — uses upsert on the unique `key` field.
 */
export async function seedActivityCatalog(): Promise<void> {
  console.log(`   Seeding ${ACTIVITY_CATALOG.length} activity catalog entries...`);

  let created = 0;
  let updated = 0;

  for (const entry of ACTIVITY_CATALOG) {
    const existing = await prisma.activityCatalog.findUnique({
      where: { key: entry.key },
    });

    await prisma.activityCatalog.upsert({
      where: { key: entry.key },
      update: {
        name: entry.name,
        category: entry.category,
        metValue: entry.metValue,
        emoji: entry.emoji,
        description: entry.description,
        tags: entry.tags,
        isActive: true,
      },
      create: {
        key: entry.key,
        name: entry.name,
        category: entry.category,
        metValue: entry.metValue,
        emoji: entry.emoji,
        description: entry.description,
        tags: entry.tags,
        isActive: true,
      },
    });

    if (existing) updated++;
    else created++;
  }

  console.log(`   ✓ Activity catalog: ${created} created, ${updated} updated`);
}
