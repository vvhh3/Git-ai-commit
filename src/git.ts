import simpleGit, { SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

/**
 * Возвращает diff застейдженных файлов (git add ...).
 * Бросает ошибку, если нечего коммитить.
 */
export async function getStagedDiff(): Promise<string> {
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error('Текущая директория не является git-репозиторием.');
  }

  const diff = await git.diff(['--cached']);

  if (!diff || diff.trim().length === 0) {
    throw new Error('Нет застейдженных изменений. Сделай "git add <файлы>" перед генерацией.');
  }

  return diff;
}

/**
 * Создаёт коммит с переданным сообщением.
 */
export async function commitWithMessage(message: string): Promise<void> {
  await git.commit(message);
}