import  dotenv  from 'dotenv';
import { getStagedDiff, commitWithMessage } from './git';
import { generateCommitMessage } from './ai';

dotenv.config()

export async function run(){
  const args = process.argv.slice(2);
  const shouldCommit = args.includes('--commit') || args.includes('-c');
  try {
    console.log('🔍 Читаю staged diff...');
    const diff = await getStagedDiff();

    console.log('🤖 Генерирую commit message...');
    const message = await generateCommitMessage(diff);

    console.log(`\n📝 Предложенное сообщение:\n\n  ${message}\n`);

    if (shouldCommit) {
      await commitWithMessage(message);
      console.log('✅ Закоммичено!');
    } else {
      console.log('Чтобы сразу закоммитить с этим сообщением, запусти с флагом --commit (или -c)');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ ${msg}`);
    process.exit(1);
  }
}

// node bin/cli.js -c 