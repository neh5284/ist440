import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { Search, Home, TrendingUp, User, Menu, X, LogOut, SlidersHorizontal } from "lucide-react";
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
                    <div className="relative">
                      <User className="w-4 h-4" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-neutral-900"></div>
                    </div>
                    <span>{user.user_metadata?.username || user.email?.split('@')[0] || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors font-semibold"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search albums, artists..."
                  className="pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
                />
              </div>
            </form>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-800">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search albums, artists..."
                    className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </form>
              <nav className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isActive("/")
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Discover</span>
                </Link>
                <Link
                  to="/charts"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isActive("/charts")
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Charts</span>
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isActive("/profile")
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 rounded-lg flex items-center gap-2 text-neutral-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-violet-600 text-white"
                  >
                    Sign In
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-neutral-800 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="font-bold text-xl text-white">RateMusic</span>
              </div>
              <p className="text-neutral-400 text-sm">
                A better way to discover, rate, and share music with the community.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Discover</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link to="/charts" className="hover:text-white">Top Albums</Link></li>
                <li><Link to="/charts" className="hover:text-white">New Releases</Link></li>
                <li><Link to="/" className="hover:text-white">Genres</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">Reviews</a></li>
                <li><a href="#" className="hover:text-white">Lists</a></li>
                <li><a href="#" className="hover:text-white">Forums</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">About</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
            © 2026 RateMusic. A better music rating experience.
          </div>
        </div>
      </footer>
    </div>
  );
}