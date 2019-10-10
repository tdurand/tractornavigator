export const loadHistoryState = () => {
  try {
    const serializedState = localStorage.getItem('history');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
}; 

// localStorage.js
export const persistHistoryState = (state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('history', serializedState);
    } catch {
      // ignore write errors
    }
  };