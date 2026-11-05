// ---------- Curriculum ----------

export interface CurriculumLesson {
  id: number;
  unitId: number;
  title: string;
}

export interface CurriculumUnit {
  id: number;
  title: string;
  tropes: string[];
  lessons: CurriculumLesson[];
}

const LESSONS_PER_UNIT = 8;

const createLessons = (unitId: number): CurriculumLesson[] =>
  Array.from({ length: LESSONS_PER_UNIT }, (_, index) => ({
    id: index + 1,
    unitId,
    title: `שיעור ${index + 1}`,
  }));

const createUnit = (id: number, title: string, tropes: string[]): CurriculumUnit => ({
  id,
  title,
  tropes,
  lessons: createLessons(id),
});

export const CURRICULUM_UNITS: CurriculumUnit[] = [
  createUnit(1, 'טעמי סוף פסוק', ['מאריך', 'תרחא', 'אתנח', 'סוף פסוק']),
  createUnit(2, 'שופר מהפך ופשטא', ['שופר מהפך', 'פשטא', 'זקף קטן']),
  createUnit(3, 'זקפים ויתיב', ['זקף גדול', 'יתיב', 'תרי קדמין']),
  createUnit(4, 'שופר הולך ורביע', ['שופר הולך', 'רביע']),
  createUnit(5, 'דרגא ותביר', ['דרגא', 'תביר']),
  createUnit(6, 'משפחת האזלא', ['אזלא גריש', 'אזלא', 'שני גרשיים']),
  createUnit(7, 'תלשא ותרי טעמי', ['תלשא', 'תרי טעמי']),
  createUnit(8, 'זרקא וסגולתא', ['זרקא', 'מקף שופר הולך', 'סגולתא']),
  createUnit(9, 'פזר ופסיק', ['פזר גדול', 'פסיק']),
  createUnit(10, 'טעמים נדירים', ['שלשלת', 'קרני פרה', 'ירח בן יומו']),
];

const MAX_OPTIONS = 4;
const EXERCISES_PER_LESSON = 8;

// ---------- Trope signs (Unicode cantillation marks) ----------
// NOTE: draft mapping - verify Moroccan-tradition sign assignments with the content owner.
const DOTTED_CIRCLE = '\u25CC';
const COMBINING_MARK = /^[\u0591-\u05AF\u05BD]/;

const TROPE_MARKS: Record<string, string> = {
  'מאריך': '\u05BD',
  'תרחא': '\u0596',
  'אתנח': '\u0591',
  'סוף פסוק': '\u05C3',
  'שופר מהפך': '\u05A4',
  'פשטא': '\u0599',
  'זקף קטן': '\u0594',
  'זקף גדול': '\u0595',
  'יתיב': '\u059A',
  'תרי קדמין': '\u05A8\u05A8',
  'שופר הולך': '\u05A3',
  'רביע': '\u0597',
  'דרגא': '\u05A7',
  'תביר': '\u059B',
  'אזלא גריש': '\u05A8\u059C',
  'אזלא': '\u05A8',
  'שני גרשיים': '\u059E',
  'תלשא': '\u05A0',
  'תרי טעמי': '\u05A9',
  'זרקא': '\u0598',
  'מקף שופר הולך': '\u05A3\u05BE',
  'סגולתא': '\u0592',
  'פזר גדול': '\u05A1',
  'פסיק': '\u05C0',
  'שלשלת': '\u0593',
  'קרני פרה': '\u059F',
  'ירח בן יומו': '\u05AA',
};

/** Returns the NFC-normalized display sign for a trope (combining marks sit on a dotted circle). */
export const getTropeSign = (name: string): string => {
  const marks = TROPE_MARKS[name] ?? '';
  return (COMBINING_MARK.test(marks) ? DOTTED_CIRCLE + marks : marks).normalize('NFC');
};

// ---------- Exercise model ----------

export type ExerciseStage = 1 | 2 | 3;
export type ExerciseKind = 'INTRO' | 'CHOOSE_TROPE' | 'COMPLETE_SEQUENCE';

export interface Exercise {
  id: string;
  unitId: number;
  stage: ExerciseStage;
  kind: ExerciseKind;
  instruction: string;
  prompt?: string;
  /** Name of the correct trope. */
  answer: string;
  /** COMPLETE_SEQUENCE only: full ordered sequence; `answer` is the hidden member. */
  sequence?: string[];
}

export interface SessionExercise extends Exercise {
  lessonId: number;
  /** Shuffled answer options (empty for INTRO). */
  options: string[];
}

/** Generates the default exercise bank directly from the curriculum. */
export const buildExerciseBank = (): Exercise[] => {
  const bank: Exercise[] = [];
  CURRICULUM_UNITS.forEach((unit) => {
    unit.tropes.forEach((trope, i) => {
      const base = { unitId: unit.id, answer: trope };
      bank.push({ ...base, id: `u${unit.id}-intro-${i}`, stage: 1, kind: 'INTRO', instruction: 'טעם חדש' });
      bank.push({
        ...base,
        id: `u${unit.id}-choose-${i}`,
        stage: 2,
        kind: 'CHOOSE_TROPE',
        instruction: 'בחר את התשובה',
        prompt: 'איזה טעם זה?',
      });
      if (unit.tropes.length > 1) {
        bank.push({
          ...base,
          id: `u${unit.id}-seq-${i}`,
          stage: 3,
          kind: 'COMPLETE_SEQUENCE',
          instruction: 'השלם את הרצף',
          sequence: unit.tropes,
        });
      }
    });
  });
  return bank;
};

export const DEFAULT_EXERCISE_BANK: Exercise[] = buildExerciseBank();

// ---------- Session engine ----------

const shuffle = <T>(items: T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/** Options = answer + distractors drawn only from the lesson's unit. */
const buildOptions = (exercise: Exercise, unitTropes: string[]): string[] => {
  if (exercise.kind === 'INTRO') return [];
  const distractors = shuffle(unitTropes)
    .filter((trope) => trope !== exercise.answer)
    .slice(0, MAX_OPTIONS - 1);
  return shuffle([exercise.answer, ...distractors]);
};

const takeShuffled = <T>(items: T[], count: number): T[] => {
  if (items.length === 0 || count <= 0) return [];

  const result: T[] = [];
  while (result.length < count) {
    result.push(...shuffle(items).slice(0, count - result.length));
  }
  return result;
};

/**
 * Builds one lesson session from the exercise pool of its unit.
 * Lesson 1 introduces the unit's tropes; every lesson dynamically mixes practice
 * exercises and answer options without pulling tropes from other units.
 */
export const buildSessionExercises = (
  exercises: Exercise[],
  unitId: number,
  lessonId: number,
): SessionExercise[] => {
  const unit = CURRICULUM_UNITS.find((candidate) => candidate.id === unitId);
  if (!unit || !unit.lessons.some((lesson) => lesson.id === lessonId)) return [];

  const allowed = new Set(unit.tropes);
  const isValidForUnit = (exercise: Exercise) =>
    exercise.unitId === unitId &&
    allowed.has(exercise.answer) &&
    (exercise.sequence ?? []).every((trope) => allowed.has(trope));

  const introductions = lessonId === 1
    ? shuffle(exercises.filter((exercise) => exercise.stage === 1 && isValidForUnit(exercise)))
    : [];
  const practicePool = exercises.filter((exercise) => exercise.stage > 1 && isValidForUnit(exercise));
  const practice = takeShuffled(
    practicePool,
    Math.max(0, EXERCISES_PER_LESSON - introductions.length),
  );

  return [...introductions, ...practice].map((exercise, index) => ({
    ...exercise,
    id: `${exercise.id}-lesson-${lessonId}-${index}`,
    lessonId,
    options: buildOptions(exercise, unit.tropes),
  }));
};
