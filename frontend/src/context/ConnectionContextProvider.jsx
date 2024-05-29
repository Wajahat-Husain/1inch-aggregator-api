import React, { useState } from "react";
import ConnectContext from "./ConnectionContext";

const ConnectionContextProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [signer, setSigner] = useState({});
    const [userInfo, setUserInfo] = useState({});

    return (
        <ConnectContext.Provider value={{ signer, setSigner, userInfo, setUserInfo, isConnected, setIsConnected }}>
            {children}
        </ConnectContext.Provider>
    );
};

export default ConnectionContextProvider;
