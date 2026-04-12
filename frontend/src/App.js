import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditorPage from "./EditorPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/room/:roomId" element={<EditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;