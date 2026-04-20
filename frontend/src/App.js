import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditorPage from "./EditorPage";
import HomePage from "./HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<EditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;