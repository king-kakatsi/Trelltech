import { useState, useRef, useCallback } from 'react';

const SCROLL_END_DELAY_MS = 60;

/**
 * Hook that manages automation log state and provides a `runWithLogs`
 * wrapper around async operations. Errors are captured into log state and
 * re-thrown so callers can react without monkey-patching `console`.
 */
export default function useAutomationLogs() {
  const [logs, setLogs] = useState([]);
  const logsRef = useRef([]);
  const logsScrollRef = useRef(null);
  const abortedRef = useRef(false);

  const clearLogs = useCallback(() => {
    logsRef.current = [];
    setLogs([]);
  }, []);

  const addLog = useCallback((message, type = 'info') => {
    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      message: String(message),
      type,
      time: new Date().toLocaleTimeString('en-GB'),
    };
    logsRef.current = [...logsRef.current, entry];
    setLogs([...logsRef.current]);
    setTimeout(() => logsScrollRef.current?.scrollToEnd({ animated: true }), SCROLL_END_DELAY_MS);
  }, []);

  const runWithLogs = useCallback(
    async (fn) => {
      clearLogs();
      abortedRef.current = false;
      try {
        return await fn();
      } catch (err) {
        addLog(`Error: ${err.message}`, 'error');
        throw err;
      }
    },
    [clearLogs, addLog],
  );

  const stop = useCallback(() => {
    abortedRef.current = true;
    addLog('Process stopped by user', 'warn');
  }, [addLog]);

  return {
    logs,
    logsRef,
    logsScrollRef,
    abortedRef,
    clearLogs,
    addLog,
    runWithLogs,
    stop,
  };
}
