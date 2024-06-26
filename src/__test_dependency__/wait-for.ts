/* istanbul ignore file */

import { sleep } from './sleep.js';

export const waitFor = async (checker: () => Promise<void> | void) => {
  while (true) {
    try {
      await checker();
      return;
    } catch (e) {
      // Ignoring
      await sleep(10);
    }
  }
};
