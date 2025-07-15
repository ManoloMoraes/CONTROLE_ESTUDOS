import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, GraduationCap, BookOpen } from 'lucide-react';

const DisciplinesManager = () => {
  const { user } = useAuth();
  const [disciplines, setDisciplines] = useState([]);
  const [newDisciplineName, setNewDisciplineName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [disciplineStudies, setDisciplineStudies] = useState([]);
  const [isStudiesDialogOpen, setIsStudiesDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadDisciplines();
    }
  }, [user]);

  const loadDisciplines = async () => {
    try {
      setLoading(true);
      const disciplinesRef = collection(db, 'users', user.uid, 'disciplines');
      const q = query(disciplinesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const disciplinesList = [];
      querySnapshot.forEach((doc) => {
        disciplinesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setDisciplines(disciplinesList);
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
      setError('Erro ao carregar disciplinas. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiscipline = async (e) => {
    e.preventDefault();
    if (!newDisciplineName.trim()) return;

    try {
      setLoading(true);
      setError('');

      const disciplinesRef = collection(db, 'users', user.uid, 'disciplines');
      await addDoc(disciplinesRef, {
        name: newDisciplineName.trim(),
        createdAt: serverTimestamp(),
        userId: user.uid
      });

      setNewDisciplineName('');
      setIsDialogOpen(false);
      await loadDisciplines();
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      setError('Erro ao adicionar disciplina. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscipline = async (disciplineId) => {
    if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', user.uid, 'disciplines', disciplineId));
      await loadDisciplines();
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      setError('Erro ao excluir disciplina. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

const loadDisciplineStudies = async (disciplineId) => {
  try {
    setLoading(true);
    const studiesRef = collection(db, 'users', user.uid, 'studies');
    const q = query(
      studiesRef,
      where('disciplineId', '==', disciplineId) // Removido orderBy
    );
    const querySnapshot = await getDocs(q);
    
    const studiesList = [];
    querySnapshot.forEach((doc) => {
      studiesList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Se quiser ordenar manualmente por data depois de carregar:
    studiesList.sort((a, b) => {
      const dateA = a.studyDate?.toDate?.()?.getTime?.() || 0;
      const dateB = b.studyDate?.toDate?.()?.getTime?.() || 0;
      return dateB - dateA;
    });

    setDisciplineStudies(studiesList);
  } catch (error) {
    console.error('Erro ao carregar estudos da disciplina:', error);
    setError('Erro ao carregar estudos da disciplina.');
  } finally {
    setLoading(false);
  }
};


  const handleViewDisciplineStudies = async (discipline) => {
    setSelectedDiscipline(discipline);
    setIsStudiesDialogOpen(true);
    await loadDisciplineStudies(discipline.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Disciplinas</h2>
          <p className="text-gray-600">Gerencie suas disciplinas de estudo</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Disciplina
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Disciplina</DialogTitle>
              <DialogDescription>
                Digite o nome da disciplina que você deseja estudar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDiscipline} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disciplineName">Nome da Disciplina</Label>
                <Input
                  id="disciplineName"
                  value={newDisciplineName}
                  onChange={(e) => setNewDisciplineName(e.target.value)}
                  placeholder="Ex: Matemática, História, Programação..."
                  required
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Disciplina'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isStudiesDialogOpen} onOpenChange={setIsStudiesDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Assuntos Estudados - {selectedDiscipline?.name}
              </DialogTitle>
              <DialogDescription>
                Lista de todos os assuntos estudados nesta disciplina
              </DialogDescription>
            </DialogHeader>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando estudos...</p>
              </div>
            ) : disciplineStudies.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum estudo registrado
                </h3>
                <p className="text-gray-600">
                  Ainda não há estudos registrados para esta disciplina.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disciplineStudies.map((study) => (
                  <Card key={study.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{study.subject}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>📅 {study.studyDate?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não disponível'}</span>
                            {study.link && (
                              <a 
                                href={study.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                🔗 Material
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {study.reviews && study.reviews.length > 0 && (
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">
                            🔄 Revisões Programadas:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {study.reviews.map((review, index) => (
                              <span 
                                key={index}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  review.completed 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {review.date?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data inválida'} 
                                ({review.days} dias) {review.completed ? '✓' : '⏳'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsStudiesDialogOpen(false);
                  setSelectedDiscipline(null);
                  setDisciplineStudies([]);
                }}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && disciplines.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando disciplinas...</p>
        </div>
      ) : disciplines.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma disciplina cadastrada
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando sua primeira disciplina para organizar seus estudos.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Disciplina
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((discipline) => (
            <Card 
              key={discipline.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDisciplineStudies(discipline)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{discipline.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDiscipline(discipline.id);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Criada em {discipline.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não disponível'}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Clique para ver os assuntos estudados
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisciplinesManager;

