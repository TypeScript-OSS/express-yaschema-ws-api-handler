import { DoubleLinkedList } from 'doublell';

let globalBlockedShutdownCount = 0;
let globalIsShuttingDown = false;
let globalShutdownResolver: (() => void) | undefined;
const globalOnDidShutdownHandlers = new DoubleLinkedList<() => void>();

/** Returns `true` if either currently shutting down or if already shut down.  That is, if `shutdownWsHandlers` has previously been
 * called. */
export const isShuttingDown = () => globalIsShuttingDown;

/**
 * Stops accepting incoming messages and waits until current handlers are finished then disconnects WebSockets.
 *
 * The correct procedure for shutdown, with Express for example, is to call `shutdownWsHandlers` and not await the result (though you may
 * wish to keep a reference to the promise), then immediately call `close` on your Express server reference, and then you may await for the
 * promised result of `shutdownWsHandlers` inside of the Express server `close` callback if you like.  This is the correct procedure because
 * calling `close` on an Express instance only stop incoming connections and while `keep-alive` connections are open, the callback will
 * never be triggered.
 */
export const shutdownWsHandlers = async () => {
  globalIsShuttingDown = true;

  if (globalBlockedShutdownCount === 0) {
    triggerOnDidShutdownHandlers();
  } else {
    return new Promise<void>((resolve) => {
      globalShutdownResolver = () => {
        triggerOnDidShutdownHandlers();
        resolve();
      };
    });
  }
};

/** Begins allowing incoming messages again.  This throws if previous shutdowns weren't completed. */
export const unshutdownWsHandlers = () => {
  if (globalBlockedShutdownCount !== 0) {
    throw new Error('unshutdownWsHandlers called before previous shutdown was complete');
  }

  globalIsShuttingDown = false;
};

/** Prevents shutdown from being completed until the specified promise is complete.  If shutdown was already complete, this does nothing. */
export const blockWsHandlerShutdownUntilComplete = async <ReturnT>(p: () => Promise<ReturnT>): Promise<ReturnT> => {
  globalBlockedShutdownCount += 1;

  try {
    return await p();
  } finally {
    globalBlockedShutdownCount -= 1;

    if (globalIsShuttingDown && globalBlockedShutdownCount === 0) {
      globalShutdownResolver?.();
      globalShutdownResolver = undefined;
    }
  }
};

/** Registers a callback that will be called once the WebSocket connects are shutdown. */
export const onDidShutdown = (handler: () => void): (() => void) => {
  const node = globalOnDidShutdownHandlers.append(handler);
  return () => {
    globalOnDidShutdownHandlers.remove(node);
  };
};

// Helpers

const triggerOnDidShutdownHandlers = () => {
  const handlers = globalOnDidShutdownHandlers.toArray();
  globalOnDidShutdownHandlers.clear();
  for (const handler of handlers) {
    handler();
  }
};
