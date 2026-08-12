import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import Navbar from "../components/common/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center px-4 py-16 sm:px-6">
        <section className="w-full max-w-2xl text-center">
          <div className="mx-auto mb-6 inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            Study from a link
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            FlashLink
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Create flashcards, share one simple link,
            and start studying without an account.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => navigate("/create")}
              className="w-full sm:w-auto"
            >
              Create Set
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                const path = window.prompt(
                  "Paste a FlashLink study URL:"
                );

                if (!path) {
                  return;
                }

                try {
                  const url = new URL(
                    path,
                    window.location.origin
                  );

                  if (
                    url.pathname.startsWith("/study/")
                  ) {
                    navigate(
                      `${url.pathname}${url.search}${url.hash}`
                    );
                    return;
                  }

                  throw new Error("Invalid path");
                } catch {
                  window.alert(
                    "That doesn't look like a valid FlashLink."
                  );
                }
              }}
              className="w-full sm:w-auto"
            >
              Open Link
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
