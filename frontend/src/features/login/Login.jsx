import { useState } from "react";
import { Shield, Mail, Lock, Eye, EyeOff, Building2, Loader2, AlertCircle } from "lucide-react";

const DEFAULT_EMAIL = "admin@assetflow.com";
const DEFAULT_PASSWORD = "Admin@12345";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email address";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!onLogin) {
      setErrors({ form: "Login is unavailable right now." });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await onLogin({
        email: email.trim(),
        password,
        remember,
      });
    } catch (error) {
      setErrors({
        form: error.message || "Unable to sign in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>

      <div className="w-full max-w-md fade-in">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <Shield size={22} className="text-white" />
          </div>

          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sign in to AssetFlow</h1>
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                <Building2 size={10} /> Enterprise
              </span>
            </div>
            <p className="text-sm text-slate-400">Manage your company assets securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-600">Work email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border transition-all outline-none
                    ${errors.email
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200"
                      : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    } bg-white text-slate-800 placeholder-slate-400`}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-600">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border transition-all outline-none
                    ${errors.password
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200"
                      : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    } bg-white text-slate-800 placeholder-slate-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                />
                <span className="text-sm text-slate-500">Remember me for 30 days</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:underline font-medium">
                Forgot password?
              </button>
            </div>

            {errors.form && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-sm shadow-blue-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Signing in...
                </>
              ) : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
