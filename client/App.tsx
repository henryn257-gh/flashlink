import { useEffect, useState } from "react";

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            FlashLink
          </h1>

          <p className="mt-3 text-muted-foreground">
            {path === "/" ? "Create and share flashcards." : "Loading..."}
          </p>
        </div>
      </div>
    </main>
  );
}

export default App;
