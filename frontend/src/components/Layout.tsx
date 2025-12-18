import { Link, useLocation, Outlet } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Urgent Queue', icon: '🚨', role: 'PM' },
    { path: '/trends', label: 'Volume Analysis', icon: '📊', role: 'Support' },
    { path: '/bugs', label: 'Bug Search', icon: '🔍', role: 'Engineering' },
    { path: '/summary', label: 'Executive Summary', icon: '📈', role: 'Executive' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Feedback Triage System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered feedback prioritization
              </p>
            </div>
          </div>
        </div>

        <nav className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      ${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.role}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Built with NestJS • Supabase • OpenAI GPT-4 • React • Tailwind CSS • Recharts
          </p>
        </div>
      </footer>
    </div>
  );
}
