const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const apiRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(apiRoot, '..', '..');
const audioEngineRoot = path.join(projectRoot, 'backend', 'audio-engine');
const extractorScript = path.join(audioEngineRoot, 'scripts', 'extract_pitch_file.py');
const storageRoot = path.join(apiRoot, 'storage', 'reference-audio');

const recordings = [
  { taamId: 'seed-taam-maarich', slug: 'maarich', fileName: 'maarich.ogg' },
  { taamId: 'seed-taam-tarha', slug: 'tarha', fileName: 'tarha.ogg' },
  { taamId: 'seed-taam-atnah', slug: 'atnah', fileName: 'atnah.ogg' },
  { taamId: 'seed-taam-sof-pasuk', slug: 'sof-pasuk', fileName: 'sof-pasuk.ogg' },
];

function findPythonExecutable() {
  if (process.env.AUDIO_ENGINE_PYTHON) return process.env.AUDIO_ENGINE_PYTHON;

  const candidates = process.platform === 'win32'
    ? [path.join(audioEngineRoot, '.venv', 'Scripts', 'python.exe')]
    : [path.join(audioEngineRoot, '.venv', 'bin', 'python')];

  const executable = candidates.find((candidate) => fs.existsSync(candidate));
  if (!executable) {
    throw new Error(
      'Audio Engine Python was not found. Set AUDIO_ENGINE_PYTHON or create backend/audio-engine/.venv.',
    );
  }
  return executable;
}

function extractPitch(pythonExecutable, audioPath) {
  const rawOutput = execFileSync(
    pythonExecutable,
    [extractorScript, audioPath],
    {
      cwd: audioEngineRoot,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  const contour = JSON.parse(rawOutput.trim());

  if (!contour.points?.length || !contour.tonicF0Hz || !contour.durationMs) {
    throw new Error(`No usable voiced pitch was extracted from ${audioPath}`);
  }
  return contour;
}

async function main() {
  const pythonExecutable = findPythonExecutable();
  const cantor = await prisma.cantor.findUnique({
    where: { id: 'seed-cantor-moroccan-001' },
  });
  if (!cantor) {
    throw new Error('Seed cantor is missing. Run `npx prisma db seed` first.');
  }

  for (const input of recordings) {
    const taam = await prisma.taam.findUnique({ where: { id: input.taamId } });
    if (!taam) {
      throw new Error(`Taam is missing: ${input.taamId}. Run the seed first.`);
    }

    const audioPath = path.join(storageRoot, input.fileName);
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Recording is missing: ${audioPath}`);
    }

    const contour = extractPitch(pythonExecutable, audioPath);
    const recordingId = `taam-sound-${input.slug}`;
    const storagePath = path.relative(apiRoot, audioPath);

    await prisma.$transaction(async (tx) => {
      const recording = await tx.referenceRecording.upsert({
        where: { id: recordingId },
        update: {
          taamId: taam.id,
          cantorId: cantor.id,
          audioUrl: `/audio/reference-recordings/${recordingId}/file`,
          storagePath,
          recordingType: 'TAAM_SOUND',
          durationMs: contour.durationMs,
          sampleRate: contour.sampleRate,
          tonicF0: contour.tonicF0Hz,
          pitchDataJson: JSON.stringify(contour),
          isVerified: true,
        },
        create: {
          id: recordingId,
          taamId: taam.id,
          cantorId: cantor.id,
          audioUrl: `/audio/reference-recordings/${recordingId}/file`,
          storagePath,
          recordingType: 'TAAM_SOUND',
          durationMs: contour.durationMs,
          sampleRate: contour.sampleRate,
          tonicF0: contour.tonicF0Hz,
          pitchDataJson: JSON.stringify(contour),
          isVerified: true,
        },
      });

      await tx.taam.update({
        where: { id: taam.id },
        data: { taamSoundId: recording.id },
      });
    });

    console.log(
      `${taam.nameHebrew}: ${contour.points.length} voiced frames, ` +
      `${contour.durationMs}ms, tonic ${contour.tonicF0Hz}Hz`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
