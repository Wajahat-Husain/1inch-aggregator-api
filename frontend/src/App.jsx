import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Tokens from "./components/Tokens";
import { Routes, Route } from "react-router-dom";
import ConnectionContextProvider from "../src/context/ConnectionContextProvider";

function App() {
  return (
    <ConnectionContextProvider>
      <div className="App">
        <Header/>
        <div className="mainWindow">
          <Routes>
            <Route
              path="/"
              element={<Swap/>}
            />
            <Route path="/tokens" element={<Tokens />} />
          </Routes>
        </div>
      </div>
    </ConnectionContextProvider>
  );
}

export default App;
