import { useEffect, useState } from "react";
import {
  defaultCopy,
  fetchForgeState,
  isValidLines,
  normalizeOutput,
  saveForgeState,
  seedLines,
  seedOutput,
} from "../services/storageService";

function useForgeStorage() {
  const [lines, setLines] = useState(seedLines);
  const [output, setOutput] = useState(() => normalizeOutput(seedOutput, seedLines));
  const [copy, setCopy] = useState(defaultCopy);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchForgeState()
      .then((state) => {
        if (!active) return;
        if (!isValidLines(state.lines)) {
          setLoaded(true);
          return;
        }
        setLines(state.lines);
        setOutput(normalizeOutput(state.output, state.lines));
        setCopy({ ...defaultCopy, ...state.copy });
        setLoaded(true);
      })
      .catch((error) => {
        console.error(error);
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveForgeState({ lines, output, copy }).catch((error) => console.error(error));
  }, [copy, lines, loaded, output]);

  return { lines, setLines, output, setOutput, copy, setCopy };
}

export default useForgeStorage;
