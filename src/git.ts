import simpleGit, { SimpleGit } from 'simple-git'

const git: SimpleGit = simpleGit()

// Создаёт коммит с переданным сообщением.

export async function commitWithMessage(message: string) {
  await git.commit(message);
}