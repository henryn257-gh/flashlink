import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg text-lg font-bold tracking-tight transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Go to FlashLink home"
        >
          FlashLink
        </button>

        <nav
          className="flex items-center gap-2"
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/create")}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Create
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
