import { useState } from "react";

/**
 * A custom hook for managing undo/redo history in React applications.
 * This hook initializes with a given state and provides functionality to update the state,
 * undo to a previous state, and redo to a subsequent state.
 */
const useHistory = (initialState) => {
  const [index, setIndex] = useState(0); // Current index in the history array
  const [history, setHistory] = useState([initialState]); // The history array containing all past states
  // each element in the history array is an array of elements on the canvas at that point in time

  /**
   * Updates the current state and optionally overwrites the latest state in the history.
   * When not overwriting, it appends the new state to the history and advances the index.
   */
  const setState = (action, overwrite = false) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prevState) => prevState + 1);
    }
  };

  /**
   * Reverts to the previous state in the history, if available.
   */
  const undo = () => index > 0 && setIndex((prevState) => prevState - 1);

  /**
   * Advances to the next state in the history, if available.
   */
  const redo = () =>
    index < history.length - 1 && setIndex((prevState) => prevState + 1);

  return [history[index], setState, undo, redo, history, index];
};

export default useHistory;
