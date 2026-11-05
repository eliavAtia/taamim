const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ids = {
  cantor: 'seed-cantor-moroccan-001',
  recording: 'seed-recording-zarqa-001',
  unit: 'seed-unit-zarqa-001',
  lesson: 'seed-lesson-zarqa-001',
  lessonItem: 'seed-item-zarqa-pitch-001',
  demoUser: 'seed-user-david-001',
};

const taamim = [
  ['zarqa', 'זרקא', 'Zarqa', 'MAFSIK', '\u0598', 'U+0598'],
  ['maqaf-shofar-holekh', 'מקף שופר הולך', 'Maqaf Shofar Holekh', 'MESHART', '\u05BE\u05A3', 'U+05BE U+05A3'],
  ['segolta', 'סגולתא', 'Segolta', 'MAFSIK', '\u0592', 'U+0592'],
  ['pazer-gadol', 'פזר גדול', 'Pazer Gadol', 'MAFSIK', '\u05A1', 'U+05A1'],
  ['talsha', 'תלשא', 'Talsha', 'MAFSIK', '\u05A0', 'U+05A0'],
  ['azla-gerish', 'אזלא גריש', 'Azla Gerish', 'MAFSIK', '\u05A8\u059C', 'U+05A8 U+059C'],
  ['paseq', 'פסק', 'Paseq', 'MAFSIK', '\u05C0', 'U+05C0'],
  ['revia', 'רביע', 'Revia', 'MAFSIK', '\u0597', 'U+0597'],
  ['qadma-mahpakh', 'קדמא שופר מהופך', 'Qadma Shofar Mehupakh', 'MESHART', '\u05A8\u05A4', 'U+05A8 U+05A4'],
  ['pashta', 'פשטא', 'Pashta', 'MAFSIK', '\u0599', 'U+0599'],
  ['trei-qadmin', 'תרי קדמין', 'Trei Qadmin', 'MESHART', '\u05A8\u05A8', 'U+05A8 U+05A8'],
  ['zaqef-qaton', 'זקף קטון', 'Zaqef Qaton', 'MAFSIK', '\u0594', 'U+0594'],
  ['zaqef-gadol', 'זקף גדול', 'Zaqef Gadol', 'MAFSIK', '\u0595', 'U+0595'],
  ['shalshelet', 'שלשלת', 'Shalshelet', 'MAFSIK', '\u0593', 'U+0593'],
  ['shnei-gerishin', 'שני גרישין', 'Shnei Gerishin', 'MAFSIK', '\u059E', 'U+059E'],
  ['trei-taamei', 'תרי טעמי', 'Trei Taamei', 'MESHART', '\u05A9', 'U+05A9'],
  ['darga-tevir', 'דרגא תביר', 'Darga Tevir', 'MAFSIK', '\u05A7\u059B', 'U+05A7 U+059B'],
  ['maarikh-tarha-etnah', 'מאריך תרחא אתנח', 'Maarikh Tarha Etnah', 'MAFSIK', '\u05BD\u0596\u0591', 'U+05BD U+0596 U+0591'],
  ['yetiv', 'יתיב', 'Yetiv', 'MAFSIK', '\u059A', 'U+059A'],
  ['maarikh-tarha-sof-pasuq', 'מאריך תרחא סוף פסוק', 'Maarikh Tarha Sof Pasuq', 'MAFSIK', '\u05BD\u0596\u05C3', 'U+05BD U+0596 U+05C3'],
  ['yareah-ben-yomo', 'ירח בן יומו', 'Yareah Ben Yomo', 'MESHART', '\u05AA', 'U+05AA'],
  ['qarnei-farah', 'קרני פרה', 'Qarnei Farah', 'MAFSIK', '\u059F', 'U+059F'],
  ['tarsa', 'תרסא', 'Tarsa', 'MESHART', '\u059C', 'U+059C'],
].map(([slug, nameHebrew, nameEnglish, category, unicodeSymbol, unicodeHex], index) => ({
  id: `seed-taam-${slug}`,
  nameHebrew,
  nameEnglish,
  category,
  unicodeSymbol,
  unicodeHex,
  descriptionHebrew: `טעם ${nameHebrew} במסורת המרוקאית.`,
  orderIndex: index + 1,
  isActive: true,
}));

const atomicVoiceTaamim = [
  ['maarich', 'מאריך', 'Maarich', 'MESHART', '\u05BD', 'U+05BD'],
  ['tarha', 'תרחא', 'Tarha', 'MESHART', '\u0596', 'U+0596'],
  ['atnah', 'אתנח', 'Atnah', 'MAFSIK', '\u0591', 'U+0591'],
  ['sof-pasuk', 'סוף פסוק', 'Sof Pasuk', 'MAFSIK', '\u05C3', 'U+05C3'],
].map(([slug, nameHebrew, nameEnglish, category, unicodeSymbol, unicodeHex], index) => ({
  id: `seed-taam-${slug}`,
  nameHebrew,
  nameEnglish,
  category,
  unicodeSymbol,
  unicodeHex,
  descriptionHebrew: `טעם ${nameHebrew} במסורת המרוקאית.`,
  orderIndex: taamim.length + index + 1,
  isActive: true,
}));

function createReferenceContour(tonicF0Hz) {
  const semitoneShape = [0, 1, 3, 5, 4, 2, 1, 3, 2, 0];
  const points = semitoneShape.map((semitoneRel, index) => ({
    timestampMs: index * 240,
    f0Hz: Number((tonicF0Hz * 2 ** (semitoneRel / 12)).toFixed(2)),
    semitoneRel,
    confidence: 0.98,
    isVoiced: true,
  }));

  return {
    tonicF0Hz,
    durationMs: points.at(-1).timestampMs + 240,
    sampleRate: 22050,
    points,
  };
}

async function main() {
  const demoPasswordHash = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'david@taamim.app' },
    update: {
      passwordHash: demoPasswordHash,
      displayName: 'דוד',
    },
    create: {
      id: ids.demoUser,
      email: 'david@taamim.app',
      username: 'david_demo',
      displayName: 'דוד',
      passwordHash: demoPasswordHash,
      totalXp: 0,
      hearts: 5,
      streakCount: 1,
    },
  });

  const cantor = await prisma.cantor.upsert({
    where: { id: ids.cantor },
    update: {
      nameHebrew: 'חזן מרוקאי לדוגמה',
      tradition: 'MOROCCAN_GENERAL',
      bioHebrew: 'הקלטת ייחוס ראשונית לצורך סגירת תרגול קולי מקצה לקצה.',
      isActive: true,
    },
    create: {
      id: ids.cantor,
      nameHebrew: 'חזן מרוקאי לדוגמה',
      tradition: 'MOROCCAN_GENERAL',
      bioHebrew: 'הקלטת ייחוס ראשונית לצורך סגירת תרגול קולי מקצה לקצה.',
      isActive: true,
    },
  });

  for (const taam of taamim) {
    await prisma.taam.upsert({
      where: { id: taam.id },
      update: taam,
      create: taam,
    });
  }

  for (const taam of atomicVoiceTaamim) {
    await prisma.taam.upsert({
      where: { id: taam.id },
      update: taam,
      create: taam,
    });
  }

  const zarqa = taamim[0];
  const tonicF0 = 110;
  const referenceContour = createReferenceContour(tonicF0);
  const referenceRecording = await prisma.referenceRecording.upsert({
    where: { id: ids.recording },
    update: {
      taamId: zarqa.id,
      cantorId: cantor.id,
      audioUrl: 'seed://references/zarqa-moroccan.wav',
      storagePath: null,
      recordingType: 'TAAM_SOUND',
      durationMs: referenceContour.durationMs,
      sampleRate: referenceContour.sampleRate,
      tonicF0,
      pitchDataJson: JSON.stringify(referenceContour),
      isVerified: true,
    },
    create: {
      id: ids.recording,
      taamId: zarqa.id,
      cantorId: cantor.id,
      audioUrl: 'seed://references/zarqa-moroccan.wav',
      storagePath: null,
      recordingType: 'TAAM_SOUND',
      durationMs: referenceContour.durationMs,
      sampleRate: referenceContour.sampleRate,
      tonicF0,
      pitchDataJson: JSON.stringify(referenceContour),
      isVerified: true,
    },
  });

  await prisma.taam.update({
    where: { id: zarqa.id },
    data: { taamSoundId: referenceRecording.id },
  });

  const unit = await prisma.courseUnit.upsert({
    where: { id: ids.unit },
    update: {
      titleHebrew: 'יחידה 1: זרקא',
      descriptionHebrew: 'תרגול קולי ראשון המבוסס על הקלטת ייחוס.',
      orderIndex: 1,
    },
    create: {
      id: ids.unit,
      titleHebrew: 'יחידה 1: זרקא',
      descriptionHebrew: 'תרגול קולי ראשון המבוסס על הקלטת ייחוס.',
      orderIndex: 1,
    },
  });

  const lesson = await prisma.lesson.upsert({
    where: { id: ids.lesson },
    update: { unitId: unit.id, titleHebrew: 'שיעור 1: תרגול זרקא', orderIndex: 1 },
    create: { id: ids.lesson, unitId: unit.id, titleHebrew: 'שיעור 1: תרגול זרקא', orderIndex: 1 },
  });

  await prisma.lessonItem.upsert({
    where: { id: ids.lessonItem },
    update: {
      lessonId: lesson.id,
      taamId: zarqa.id,
      referenceRecordingId: referenceRecording.id,
      type: 'PITCH_MATCH',
      promptHebrew: 'האזן לזרקא, הקלט את עצמך וחזור על המסלול המלודי.',
      orderIndex: 1,
    },
    create: {
      id: ids.lessonItem,
      lessonId: lesson.id,
      taamId: zarqa.id,
      referenceRecordingId: referenceRecording.id,
      type: 'PITCH_MATCH',
      promptHebrew: 'האזן לזרקא, הקלט את עצמך וחזור על המסלול המלודי.',
      orderIndex: 1,
    },
  });

  console.log(
    `Seeded ${taamim.length + atomicVoiceTaamim.length} taamim and one Zarqa voice-practice slice.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
