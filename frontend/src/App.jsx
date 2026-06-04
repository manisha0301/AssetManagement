import { Sidebar, TopNavbar } from "./components/Layout";
import { Toast } from "./components/Common";
import { AppProvider, useApp } from "./context/AppContext";
import { matchRoute } from "./routes/AppRoutes";

function AppContent() {
  const { currentPage, toast } = useApp();
  const matched = matchRoute(currentPage);
  const PageComponent = matched.component;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar title={matched.title} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 pt-2 ">
          <PageComponent />
        </main>
      </div>
      <Toast toast={toast} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        code, .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      <AppContent />
    </AppProvider>
  );
}


