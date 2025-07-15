import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, BookOpen, Calendar, Link as LinkIcon, Clock, Edit, Trash2, Search } from 'lucide-react';

const StudiesManager = () => {
  const { user } = useAuth();
  const [disciplines, setDisciplines] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  
  // Search state
  const [searchText, setSearchText] = useState('');
  
  // Form state
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [subject, setSubject] = useState('');
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [link, setLink] = useState('');
  const [selectedReviews, setSelectedReviews] = useState([]);

  const reviewOptions = [
    { days: 7, label: '7 dias' },
    { days: 15, label: '15 dias' },
    { days: 30, label: '30 dias' },
    { days: 60, label: '60 dias' },
    { days: 90, label: '90 dias' },
    { days: 120, label: '120 dias' }
  ];

  useEffect(() => {
    if (user) {
      loadDisciplines();
      loadStudies();
    }
  }, [user]);

  const loadDisciplines = async () => {
    try {
      const disciplinesRef = collection(db, 'users', user.uid, 'disciplines');
      const q = query(disciplinesRef, orderBy('name'));
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
    }
  };

  const loadStudies = async () => {
    try {
      setLoading(true);
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
      
      setStudies(studiesList);
    } catch (error) {
      console.error('Erro ao carregar estudos:', error);
      setError('Erro ao carregar estudos. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDiscipline('');
    setSubject('');
    setStudyDate(new Date().toISOString().split('T')[0]);
    setLink('');
    setSelectedReviews([]);
  };

  const handleReviewChange = (days, checked) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, days]);
    } else {
      setSelectedReviews(selectedReviews.filter(d => d !== days));
    }
  };

  const calculateReviewDates = (baseDate, reviewDays) => {
    return reviewDays.map(days => {
      const reviewDate = new Date(baseDate);
      reviewDate.setDate(reviewDate.getDate() + days);
      return {
        date: Timestamp.fromDate(reviewDate),
        days: days,
        completed: false
      };
    });
  };

  const handleAddStudy = async (e) => {
    e.preventDefault();
    if (!selectedDiscipline || !subject.trim()) return;

    try {
      setLoading(true);
      setError('');

      const [year, month, day] = studyDate.split('-').map(Number);
      const studyDateObj = new Date(year, month - 1, day);
      const reviews = calculateReviewDates(studyDateObj, selectedReviews);

      const studiesRef = collection(db, 'users', user.uid, 'studies');
      await addDoc(studiesRef, {
        disciplineId: selectedDiscipline,
        subject: subject.trim(),
        studyDate: Timestamp.fromDate(studyDateObj),
        link: link.trim() || null,
        reviews: reviews,
        createdAt: serverTimestamp(),
        userId: user.uid
      });

      resetForm();
      setIsDialogOpen(false);
      
      await loadStudies();
    } catch (error) {
      console.error('Erro ao adicionar estudo:', error);
      setError('Erro ao adicionar estudo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudy = async (e) => {
    e.preventDefault();
    if (!selectedDiscipline || !subject.trim() || !editingStudy) return;

    try {
      setLoading(true);
      setError('');

      const studyDateObj = new Date(studyDate);
      const reviews = calculateReviewDates(studyDateObj, selectedReviews);

      const studyRef = doc(db, 'users', user.uid, 'studies', editingStudy.id);
      await updateDoc(studyRef, {
        disciplineId: selectedDiscipline,
        subject: subject.trim(),
        studyDate: Timestamp.fromDate(studyDateObj),
        link: link.trim() || null,
        reviews: reviews,
        updatedAt: serverTimestamp()
      });

      resetForm();
      setIsEditDialogOpen(false);
      setEditingStudy(null);
      
      await loadStudies();
    } catch (error) {
      console.error('Erro ao editar estudo:', error);
      setError('Erro ao editar estudo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudy = async (studyId) => {
    try {
      setLoading(true);
      setError('');

      const studyRef = doc(db, 'users', user.uid, 'studies', studyId);
      await deleteDoc(studyRef);
      
      await loadStudies();
    } catch (error) {
      console.error('Erro ao excluir estudo:', error);
      setError('Erro ao excluir estudo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (study) => {
    setEditingStudy(study);
    setSelectedDiscipline(study.disciplineId);
    setSubject(study.subject);
    setStudyDate(study.studyDate?.toDate?.()?.toISOString().split('T')[0] || '');
    setLink(study.link || '');
    setSelectedReviews(study.reviews?.map(r => r.days) || []);
    setIsEditDialogOpen(true);
  };

  const getDisciplineName = (disciplineId) => {
    const discipline = disciplines.find(d => d.id === disciplineId);
    return discipline ? discipline.name : 'Disciplina não encontrada';
  };

const displayedStudies = studies.filter(study => {
  const subjectMatch = study.subject.toLowerCase().includes(searchText.toLowerCase());
  const disciplineName = getDisciplineName(study.disciplineId).toLowerCase();
  const disciplineMatch = disciplineName.includes(searchText.toLowerCase());
  const studyDate = study.studyDate?.toDate?.()?.toLocaleDateString('pt-BR') || '';
  const dateMatch = studyDate.includes(searchText);
  return subjectMatch || disciplineMatch || dateMatch;
});


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registros de Estudo</h2>
          <p className="text-gray-600">Registre seus estudos e programe revisões</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={disciplines.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Estudo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Novo Estudo</DialogTitle>
              <DialogDescription>
                Registre um novo estudo e programe suas revisões espaçadas.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudy} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discipline">Disciplina</Label>
                  <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplines.map((discipline) => (
                        <SelectItem key={discipline.id} value={discipline.id}>
                          {discipline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studyDate">Data do Estudo</Label>
                  <Input
                    id="studyDate"
                    type="date"
                    value={studyDate}
                    onChange={(e) => setStudyDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto Estudado</Label>
                <Textarea
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Descreva o que você estudou..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link (Opcional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://exemplo.com/material-de-estudo"
                />
              </div>

              <div className="space-y-3">
                <Label>Programar Revisões</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reviewOptions.map((option) => (
                    <div key={option.days} className="flex items-center space-x-2">
                      <Checkbox
                        id={`review-${option.days}`}
                        checked={selectedReviews.includes(option.days)}
                        onCheckedChange={(checked) => handleReviewChange(option.days, checked)}
                      />
                      <Label 
                        htmlFor={`review-${option.days}`}
                        className="text-sm font-normal"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  As revisões serão calculadas automaticamente a partir da data do estudo.
                </p>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Estudo'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Pesquisar Estudo</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Pesquisar por assunto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Digite para pesquisar nos assuntos estudados..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Results Counter */}
          {studies.length > 0 && (
            <div className="text-sm text-gray-600">
              Mostrando {displayedStudies.length} de {studies.length} estudos
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Estudo</DialogTitle>
            <DialogDescription>
              Edite as informações do estudo e suas revisões.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStudy} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discipline">Disciplina</Label>
                <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map((discipline) => (
                      <SelectItem key={discipline.id} value={discipline.id}>
                        {discipline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-studyDate">Data do Estudo</Label>
                <Input
                  id="edit-studyDate"
                  type="date"
                  value={studyDate}
                  onChange={(e) => setStudyDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subject">Assunto Estudado</Label>
              <Textarea
                id="edit-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Descreva o que você estudou..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-link">Link (Opcional)</Label>
              <Input
                id="edit-link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://exemplo.com/material-de-estudo"
              />
            </div>

            <div className="space-y-3">
              <Label>Programar Revisões</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {reviewOptions.map((option) => (
                  <div key={option.days} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-review-${option.days}`}
                      checked={selectedReviews.includes(option.days)}
                      onCheckedChange={(checked) => handleReviewChange(option.days, checked)}
                    />
                    <Label 
                      htmlFor={`edit-review-${option.days}`}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                As revisões serão recalculadas automaticamente a partir da nova data do estudo.
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingStudy(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {disciplines.length === 0 && (
        <Alert>
          <AlertDescription>
            Você precisa criar pelo menos uma disciplina antes de registrar estudos.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && studies.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estudos...</p>
        </div>
      ) : displayedStudies.length === 0 && studies.length > 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum estudo encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os termos de pesquisa.
            </p>
            <Button onClick={() => setSearchText('')} variant="outline">
              Limpar Pesquisa
            </Button>
          </CardContent>
        </Card>
      ) : studies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum estudo registrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece registrando seu primeiro estudo para acompanhar seu progresso.
            </p>
            {disciplines.length > 0 && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeiro Estudo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedStudies.map((study) => (
            <Card key={study.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{study.subject}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {getDisciplineName(study.disciplineId)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {study.studyDate?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não disponível'}
                      </div>
                      {study.link && (
                        <a 
                          href={study.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Material
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(study)}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este registro de estudo? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteStudy(study.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {study.reviews && study.reviews.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4" />
                      Revisões Programadas:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {study.reviews.map((review, index) => (
                        <span 
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${
                            review.completed 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {review.date?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data inválida'} 
                          ({review.days} dias)
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
    </div>
  );
};

export default StudiesManager;

