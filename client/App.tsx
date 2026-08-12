import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";

function RoutePlaceholder({
  name,
}: {
  name: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          FlashLink
        </h1>

        <p className="mt-2 text-muted-foreground">
          {name}
        </p>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/create"
          element={<RoutePlaceholder name="Create" />}
        />

        <Route
          path="/study/:strategy/:data"
          element={<RoutePlaceholder name="Study" />}
        />

        <Route
          path="/test"
          element={<RoutePlaceholder name="Test" />}
        />

        <Route
          path="/review"
          element={<RoutePlaceholder name="Review" />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
