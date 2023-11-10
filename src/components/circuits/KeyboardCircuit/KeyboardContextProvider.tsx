import { useContext, useState, createContext } from "react";

interface Props {
  children: React.ReactNode;
}

interface KeyboardContext {
  isKeyPressed: boolean;
  setIsKeyPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

const KeyboardContext = createContext<KeyboardContext | null>(null);

export default ({ children }: Props) => {
  const [isKeyPressed, setIsKeyPressed] = useState<boolean>(false);
  const keyboardState = { isKeyPressed, setIsKeyPressed };
  return (
    <KeyboardContext.Provider value={keyboardState}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboardContext = () => useContext(KeyboardContext);
