import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { Search, Home, TrendingUp, User, Menu, X, LogOut, ListMusic } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { Toaster } from "sonner";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Toaster position="top-center" theme="dark" />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl text-white">RateMusic</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isActive("/")
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Discover</span>
              </Link>

              <Link
                to="/charts"
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isActive("/charts")
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Charts</span>
              </Link>

              {/* ✅ NEW LISTS LINK */}
              <Link
                to="/lists"
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isActive("/lists")
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <ListMusic className="w-4 h-4" />
                <span>Lists</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isActive("/profile")
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{user.user_metadata?.username || user.email?.split('@')[0]}</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search albums, artists..."
                  className="pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                />
              </div>
            </form>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-800">
              <nav className="flex flex-col gap-2">

                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  Discover
                </Link>

                <Link to="/charts" onClick={() => setMobileMenuOpen(false)}>
                  Charts
                </Link>

                {/* ✅ NEW MOBILE LISTS */}
                <Link
                  to="/lists"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isActive("/lists")
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400"
                  }`}
                >
                  <ListMusic className="w-4 h-4" />
                  <span>Lists</span>
                </Link>

              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}