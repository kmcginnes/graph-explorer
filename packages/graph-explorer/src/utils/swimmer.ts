type Task<T> = () => Promise<T>;
type ErrorCallback<T> = (error: Error, task: Task<T>) => void;
type SuccessCallback<T> = (result: T, task: Task<T>) => void;
type SettledCallback = () => void;

type Config<T> = {
  concurrency: number;
  started?: boolean;
  tasks?: Task<T>[];
};

export function createPool<T>(config?: Config<T>) {
  const defaultConfig: Config<T> = {
    concurrency: 5,
    started: true,
    tasks: [],
  };

  const { concurrency, started, tasks } = {
    ...defaultConfig,
    ...config,
  };

  let onSettles: SettledCallback[] = [];
  let onErrors: ErrorCallback<T>[] = [];
  let onSuccesses: SuccessCallback<T>[] = [];
  let running = started;
  let active: Task<T>[] = [];
  let pending = tasks ?? [];
  let currentConcurrency = concurrency;

  const tick = () => {
    if (!running) {
      return;
    }
    if (!pending.length && !active.length) {
      onSettles.forEach(d => d());
      return;
    }
    while (active.length < currentConcurrency && pending.length) {
      const nextFn = pending.shift();
      if (!nextFn) {
        continue;
      }
      active.push(nextFn);
      (async () => {
        let success = false;
        let res: T;
        let error: Error;
        try {
          res = await nextFn();
          success = true;
        } catch (e) {
          error = e;
        }
        active = active.filter(d => d !== nextFn);
        if (success) {
          nextFn.resolve(res);
          onSuccesses.forEach(d => d(res, nextFn));
        } else {
          nextFn.reject(error);
          onErrors.forEach(d => d(error ?? new Error(), nextFn));
        }
        tick();
      })();
    }
  };

  type Options = {
    priority?: boolean;
  };
  const defaultOptions: Options = {
    priority: false,
  };

  const api = {
    add: (fn: Task<T>, options: Options = defaultOptions) =>
      new Promise<T>((resolve, reject) => {
        if (options.priority) {
          pending.unshift(fn);
        } else {
          pending.push(fn);
        }
        fn.resolve = resolve;
        fn.reject = reject;
        tick();
      }),
    throttle: (n: number) => {
      currentConcurrency = n;
    },
    onSettled: (cb: SettledCallback) => {
      onSettles.push(cb);
      return () => {
        onSettles = onSettles.filter(d => d !== cb);
      };
    },
    onError: (cb: ErrorCallback<T>) => {
      onErrors.push(cb);
      return () => {
        onErrors = onErrors.filter(d => d !== cb);
      };
    },
    onSuccess: (cb: SuccessCallback<T>) => {
      onSuccesses.push(cb);
      return () => {
        onSuccesses = onSuccesses.filter(d => d !== cb);
      };
    },
    stop: () => {
      running = false;
    },
    start: () => {
      running = true;
      tick();
    },
    clear: () => {
      pending = [];
    },
    getActive: () => active,
    getPending: () => pending,
    getAll: () => [...active, ...pending],
    isRunning: () => running,
    isSettled: () => !running && !active.length && !pending.length,
  };

  return api;
}

export function poolAll<T>(tasks: Task<T>[], concurrency: number) {
  return new Promise((resolve, reject) => {
    const pool = createPool({
      concurrency,
    });
    const results: any[] = [];
    pool.onSettled(() => {
      resolve(results);
    });
    pool.onError(err => {
      reject(err);
    });
    tasks.forEach((task, i) => {
      pool.add(async () => {
        const res = await task();
        results[i] = res;
        return res;
      });
    });
    pool.start();
  });
}
