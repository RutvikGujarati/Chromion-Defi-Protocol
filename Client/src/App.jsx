import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./Components/Header";
import Home from "./Components/Home";

function About() {
  return (
    <div className="main-content container mt-5 pt-5">
      <h1>About NovaDapp</h1>
      <p>This is the About page for our decentralized application.</p>
    </div>
  );
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
