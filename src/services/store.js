import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const initialState = () => ({ version: 1, guilds: {} });

export class JsonStore {
  #state = initialState();
  #queue = Promise.resolve();
  constructor(file) { this.file = file; }

  async init() {
    await mkdir(path.dirname(this.file), { recursive: true });
    try {
      const parsed = JSON.parse(await readFile(this.file, 'utf8'));
      if (parsed?.version !== 1 || typeof parsed.guilds !== 'object') throw new Error('unsupported data schema');
      this.#state = parsed;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await this.#persist(this.#state);
    }
    return this;
  }

  snapshot() { return structuredClone(this.#state); }
  guild(id) { return structuredClone(this.#state.guilds[id] || {}); }

  async updateGuild(id, updater) {
    const operation = this.#queue.then(async () => {
      const draft = structuredClone(this.#state);
      draft.guilds[id] ??= {};
      const result = await updater(draft.guilds[id]);
      await this.#persist(draft);
      this.#state = draft;
      return result;
    });
    this.#queue = operation.catch(() => {});
    return operation;
  }

  async #persist(state) {
    const temporary = `${this.file}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    await rename(temporary, this.file);
  }
}
