/* istanbul ignore file */

import { sleep } from './sleep.js';

export const waitFor = async (checker: () => Promise<void> | void) => {
  while (true) {
    try {
      await checker();
      return;
    } catch (_e) {
      // Ignoring
      await sleep(10);
    }
  }
};
