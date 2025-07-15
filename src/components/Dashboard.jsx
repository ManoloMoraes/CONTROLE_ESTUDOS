import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DisciplinesManager from './DisciplinesManager';
import StudiesManager from './StudiesManager';
import StudyCalendar from './StudyCalendar';
import TrelloBoard from './TrelloBoard';
import DynamicDashboard from './DynamicDashboard';
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  LogOut, 
  Brain,
  GraduationCap,
  Clock,
  Trello
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'disciplines', label: 'Disciplinas', icon: GraduationCap },
    { id: 'studies', label: 'Estudos', icon: BookOpen },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'trello', label: 'Trello', icon: Trello },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DynamicDashboard onNavigate={setActiveTab} />;
      case 'disciplines':
        return <DisciplinesManager />;
      case 'studies':
        return <StudiesManager />;
      case 'calendar':
        return <StudyCalendar />;
      case 'trello':
        return <TrelloBoard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Controle de Estudos
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.email?.split('@')[0] || 'Usuário'}!
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

