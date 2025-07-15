import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Clock, Calendar, CheckCircle } from 'lucide-react';

const DynamicDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDisciplines: 0,
    totalStudies: 0,
    pendingReviews: 0,
    completedReviews: 0,
    todayStudies: 0,
    todayReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentStudies, setRecentStudies] = useState([]);
  const [disciplines, setDisciplines] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const loadedDisciplines = await loadDisciplines();
      await loadStudies(loadedDisciplines);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDisciplines = async () => {
    const disciplinesRef = collection(db, 'users', user.uid, 'disciplines');
    const querySnapshot = await getDocs(disciplinesRef);

    const disciplinesList = [];
    querySnapshot.forEach((doc) => {
      disciplinesList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setDisciplines(disciplinesList);
    return disciplinesList;
  };

  const loadStudies = async (disciplinesList) => {
    const studiesRef = collection(db, 'users', user.uid, 'studies');
    const q = query(studiesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const studiesList = [];
    querySnapshot.forEach((doc) => {
      studiesList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    calculateStats(studiesList, disciplinesList);
    setRecentStudies(studiesList.slice(0, 5));
  };

  const calculateStats = (studies, disciplinesList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let pendingReviews = 0;
    let completedReviews = 0;
    let todayStudies = 0;
    let todayReviews = 0;

    studies.forEach(study => {
      const studyDate = study.studyDate?.toDate?.();
      if (studyDate && studyDate >= today && studyDate < tomorrow) {
        todayStudies++;
      }

      if (study.reviews) {
        study.reviews.forEach(review => {
          const reviewDate = review.date?.toDate?.();

          if (review.completed) {
            completedReviews++;
          } else {
            pendingReviews++;
          }

          if (reviewDate && reviewDate >= today && reviewDate < tomorrow) {
            todayReviews++;
          }
        });
      }
    });

    setStats({
      totalDisciplines: disciplinesList.length,
      totalStudies: studies.length,
      pendingReviews,
      completedReviews,
      todayStudies,
      todayReviews
    });
  };

  const getDisciplineName = (disciplineId) => {
    const discipline = disciplines.find(d => d.id === disciplineId);
    return discipline ? discipline.name : 'Disciplina não encontrada';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Disciplinas Ativas
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDisciplines}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDisciplines === 0 ? 'Nenhuma disciplina' : 'Disciplinas cadastradas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Estudos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudies}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayStudies} estudos hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revisões Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayReviews} para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revisões Concluídas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedReviews}</div>
            <p className="text-xs text-muted-foreground">
              Total de revisões feitas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => onNavigate('disciplines')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <GraduationCap className="h-6 w-6" />
              <span>Gerenciar Disciplinas</span>
            </Button>
            <Button 
              onClick={() => onNavigate('studies')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <BookOpen className="h-6 w-6" />
              <span>Registrar Estudo</span>
            </Button>
            <Button 
              onClick={() => onNavigate('calendar')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Calendar className="h-6 w-6" />
              <span>Ver Calendário</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estudos recentes */}
      {recentStudies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estudos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudies.map((study) => (
                <div key={study.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{study.subject}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📚 {getDisciplineName(study.disciplineId)}</span>
                      <span>📅 {study.studyDate?.toDate?.()?.toLocaleDateString('pt-BR')}</span>
                      {study.reviews && study.reviews.length > 0 && (
                        <span>🔄 {study.reviews.length} revisões programadas</span>
                      )}
                    </div>
                  </div>
                  {study.link && (
                    <a 
                      href={study.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      📎 Material
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalDisciplines === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comece criando sua primeira disciplina!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => onNavigate('disciplines')}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Criar Primeira Disciplina
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DynamicDashboard;

