import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { signUp } from "../lib/api";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RATE_LIMIT_KEY = 'signup_last_attempt';
const RATE_LIMIT_DURATION = 60000; // 1 minute cooldown

/**
 * SIGNUP_DISABLED - Controls new account creation
 *
 * Set to `true` to disable signup (prevents rate limit errors)
 * Set to `false` to re-enable signup
 *
 * Authentication is now fully enabled with proper error handling
 */
const SIGNUP_DISABLED = false;

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<"guest" | "signin" | "signup">("guest");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showError, setShowError] = useState(false);

  // Check cooldown on mount and when mode changes
  useEffect(() => {
    const checkCooldown = () => {
      const lastAttempt = localStorage.getItem(RATE_LIMIT_KEY);
      if (lastAttempt) {
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt, 10);
        const remaining = RATE_LIMIT_DURATION - timeSinceLastAttempt;

        if (remaining > 0) {
          setCooldownRemaining(Math.ceil(remaining / 1000));
        } else {
          setCooldownRemaining(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  // Reset form when modal opens (start with signin mode by default)
  useEffect(() => {
    if (isOpen) {
      setMode("signin");
      setShowError(false);
      setEmail("");
      setPassword("");
      setUsername("");
    }
  }, [isOpen]);

  // Reset error state when user types or changes mode
  useEffect(() => {
    setShowError(false);
  }, [email, password, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for client-side rate limit
    if (mode === "signup" && cooldownRemaining > 0) {
      toast.error(`Please wait ${cooldownRemaining} seconds before trying again.`);
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        if (SIGNUP_DISABLED) {
          toast.error("Signup is temporarily disabled. Please continue as guest or sign in with an existing account.");
          return;
        }

        // Record attempt timestamp
        localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
        console.log('📝 [UI] Submitting signup form...');
        const result = await signUp(email, password, username);

        // Check if email confirmation is required
        if (result.user && !result.session) {
          toast.success("Account created! Please check your email to confirm your account.", {
            duration: 5000,
          });
          console.log('📧 [UI] Email confirmation required');
        } else if (result.session) {
          toast.success("Account created and you're now signed in!", {
            duration: 3000,
          });
          console.log('✅ [UI] Auto-signed in after signup');
          setShowError(false);
          onClose();
          return;
        } else {
          toast.success("Account created! You can now sign in.", {
            duration: 3000,
          });
        }

        setShowError(false);
        setMode("signin");
        setPassword("");
      } else {
        console.log('📝 [UI] Submitting signin form...');
        await signIn(email, password);
        toast.success("Welcome back!", { duration: 2000 });
        setShowError(false);
        onClose();
      }
    } catch (error: any) {
      console.error("❌ [UI] Auth error:", error);

      // More user-friendly error messages
      let errorMessage = error?.message || error?.toString() || "Authentication failed";

      // Handle different error types
      if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("invalid_credentials")) {
        if (mode === "signin") {
          errorMessage = "Incorrect email or password. Please check your credentials and try again.";
        } else {
          errorMessage = "Unable to create account. Please try a different email.";
        }
      } else if (errorMessage.includes("already registered") || errorMessage.includes("User already registered")) {
        errorMessage = "This email is already registered. Please sign in instead.";
        toast.info("Switching to sign in mode...");
        setTimeout(() => setMode("signin"), 1000);
      } else if (errorMessage.includes("Email not confirmed") || errorMessage.includes("email_not_confirmed")) {
        errorMessage = "Please confirm your email address before signing in. Check your inbox for a confirmation link.";
      } else if (errorMessage.includes("Rate limit exceeded") || errorMessage.includes("rate limit")) {
        // Set a longer cooldown for rate limit errors (5 minutes)
        localStorage.setItem(RATE_LIMIT_KEY, (Date.now() + 240000).toString()); // Add 4 more minutes
        setCooldownRemaining(300); // 5 minutes

        // Show error with helpful suggestion
        toast.error("Rate limit exceeded. Please try again in a few minutes or continue as guest.", {
          duration: 5000,
        });
        return; // Don't show duplicate error
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (errorMessage.includes("Password")) {
        errorMessage = "Password must be at least 6 characters long.";
      }

      toast.error(errorMessage, { duration: 4000 });
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Guest mode view
  if (mode === "guest") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 w-full max-w-md p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Welcome to Music Discovery</h2>
            <p className="text-neutral-400 mb-8">
              Explore millions of songs and albums from iTunes and Last.fm
            </p>

            <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">✨ Full Access Features</h3>
              <ul className="text-sm text-neutral-300 space-y-2 text-left">
                <li>🎵 Search millions of albums from iTunes</li>
                <li>📊 View global music charts from Last.fm</li>
                <li>🔍 Discover trending albums and artists</li>
                <li>💿 Browse album details and track listings</li>
              </ul>
            </div>

            <button
              onClick={() => {
                onClose();
                toast.success("Exploring music as guest. Enjoy!");
              }}
              className="w-full mb-4 px-6 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Start Exploring →
            </button>

            <div className="pt-4 border-t border-neutral-800">
              <button
                onClick={() => setMode("signin")}
                className="text-sm text-neutral-400 hover:text-white"
              >
                Have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign in/Sign up view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={() => setMode("guest")}
          className="mb-4 text-sm text-neutral-400 hover:text-white flex items-center gap-1"
        >
          ← Back to guest access
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-neutral-400 mb-6">
          {mode === "signin"
            ? "Sign in to rate and review albums"
            : "Join the community of music lovers"}
        </p>

        {showError && mode === "signin" && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-900/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-300 mb-1">Having trouble signing in?</p>
                <p className="text-sm text-yellow-400">
                  You can continue as guest to explore music, or try resetting your password.
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === "signup" && cooldownRemaining > 0 && (
          <div className="mb-4 p-3 bg-orange-900/20 border border-orange-900/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-300 mb-1">Rate Limit Active</p>
                <p className="text-sm text-orange-400 mb-2">
                  Please wait {cooldownRemaining} seconds, or continue as guest below.
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem(RATE_LIMIT_KEY);
                    setCooldownRemaining(0);
                    toast.info("Cooldown cleared. You can try with a different email.");
                  }}
                  className="text-xs text-orange-300 hover:text-orange-200 underline"
                >
                  Clear cooldown and try different email
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter your username"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (mode === "signup" && cooldownRemaining > 0)}
            className="w-full px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === "signup" ? "Creating account..." : "Signing in..."
              : mode === "signup" && cooldownRemaining > 0
                ? `Wait ${cooldownRemaining}s`
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {mode !== "guest" && (
            <div className="text-center">
              <button
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  // Reset form when switching modes
                  setEmail("");
                  setPassword("");
                  setUsername("");
                  setShowError(false);
                }}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {mode === "signin"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-800 mt-4">
            <div className="text-center">
              <button
                onClick={() => setMode("guest")}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                ← Continue as guest instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}