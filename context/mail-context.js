import { createContext, useReducer } from "react";

export const MailContext = createContext();

export const ACTION_TYPES = {
  SET_WALLET_ADDRESS: "SET_WALLET_ADDRESS",
};

const mailReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_WALLET_ADDRESS: {
      return { ...state, walletAddress: action.payload.walletAddress };
    }
    default: {
      throw new Error(`Unhandled Action Type: ${action.type}`);
    }
  }
};

const MailProvider = ({ children }) => {
  const initalState = {
    walletAddress: "",
  };

  const [state, dispatch] = useReducer(mailReducer, initalState);
  return (
    <MailContext.Provider value={{ state, dispatch }}>
      {children}
    </MailContext.Provider>
  );
};

export default MailProvider;
