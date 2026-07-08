export interface HookRegistry {
  register: (event: string, handler: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
}

export function createHookRegistry(): HookRegistry {
  const handlers = new Map<string, Array<(...args: unknown[]) => void>>();

  return {
    register(event, handler) {
      const existing = handlers.get(event);
      if (existing) {
        existing.push(handler);
      } else {
        handlers.set(event, [handler]);
      }
    },
    emit(event, ...args) {
      for (const handler of handlers.get(event) ?? []) {
        handler(...args);
      }
    },
  };
}
