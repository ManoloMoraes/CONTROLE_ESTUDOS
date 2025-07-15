import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  updateDoc,
  doc,
  where,
  orderBy,
  addDoc,
  deleteDoc 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Plus,
  Trash2,
  X
} from 'lucide-react';

const StudyCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studies, setStudies] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStudies(), loadDisciplines(), loadCustomEvents()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudies = async () => {
    const studiesRef = collection(db, 'users', user.uid, 'studies');
    const q = query(studiesRef, orderBy('studyDate'));
    const querySnapshot = await getDocs(q);
    
    const studiesList = [];
    querySnapshot.forEach((doc) => {
      studiesList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    setStudies(studiesList);
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
  };

  const loadCustomEvents = async () => {
    const eventsRef = collection(db, 'users', user.uid, 'customEvents');
    const q = query(eventsRef, orderBy('date'));
    const querySnapshot = await getDocs(q);
    
    const eventsList = [];
    querySnapshot.forEach((doc) => {
      eventsList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    setCustomEvents(eventsList);
  };

  const getDisciplineName = (disciplineId) => {
    const discipline = disciplines.find(d => d.id === disciplineId);
    return discipline ? discipline.name : 'Disciplina não encontrada';
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const events = [];
    const dateStr = date.toDateString();

    studies.forEach(study => {
      // Evento de estudo
      if (study.studyDate?.toDate?.()?.toDateString() === dateStr) {
        events.push({
          type: 'study',
          study,
          title: study.subject,
          discipline: getDisciplineName(study.disciplineId)
        });
      }

      // Eventos de revisão
      if (study.reviews) {
        study.reviews.forEach((review, index) => {
          if (review.date?.toDate?.()?.toDateString() === dateStr) {
            events.push({
              type: 'review',
              study,
              review,
              reviewIndex: index,
              title: `Revisão: ${study.subject}`,
              discipline: getDisciplineName(study.disciplineId),
              completed: review.completed
            });
          }
        });
      }
    });

    // Eventos personalizados
    customEvents.forEach(event => {
      if (event.date?.toDate?.()?.toDateString() === dateStr) {
        events.push({
          type: 'custom',
          event,
          title: event.title,
          description: event.description
        });
      }
    });

    return events;
  };

  const handleDateClick = (date) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      setSelectedDate(date);
      setSelectedEvents(events);
      setIsDialogOpen(true);
    }
  };

  const handleReviewCheck = async (event) => {
    try {
      const studyRef = doc(db, 'users', user.uid, 'studies', event.study.id);
      const updatedReviews = [...event.study.reviews];
      updatedReviews[event.reviewIndex].completed = !event.review.completed;
      
      await updateDoc(studyRef, {
        reviews: updatedReviews
      });
      
      await loadStudies();
      
      // Atualizar eventos selecionados
      const updatedEvents = getEventsForDate(selectedDate);
      setSelectedEvents(updatedEvents);
    } catch (error) {
      console.error('Erro ao atualizar revisão:', error);
    }
  };

  const getEventBadgeColor = (event) => {
    if (event.type === 'study') return 'bg-green-100 text-green-700';
    if (event.type === 'review') {
      return event.completed ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';
    }
    if (event.type === 'custom') return 'bg-pink-100 text-pink-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleAddEvent = async () => {
    if (!newEventTitle || !newEventDate) {
      alert('Por favor, preencha o título e a data do evento.');
      return;
    }

    try {
      const eventsRef = collection(db, 'users', user.uid, 'customEvents');
      await addDoc(eventsRef, {
        title: newEventTitle,
        description: newEventDescription,
        date: new Date(newEventDate),
        createdAt: new Date()
      });

      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventDate('');
      setIsAddEventDialogOpen(false);
      await loadCustomEvents();
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      alert('Erro ao adicionar evento. Tente novamente.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

    try {
      const eventRef = doc(db, 'users', user.uid, 'customEvents', eventId);
      await deleteDoc(eventRef);
      await loadCustomEvents();
      
      // Atualizar eventos selecionados se necessário
      if (selectedDate) {
        const updatedEvents = getEventsForDate(selectedDate);
        setSelectedEvents(updatedEvents);
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento. Tente novamente.');
    }
  };

  const exportEventsToCSV = () => {
    if (!exportDateFrom || !exportDateTo) {
      alert('Por favor, selecione as datas de início e fim para exportação.');
      return;
    }

    setExporting(true);
    
    try {
      const fromDate = new Date(exportDateFrom);
      const toDate = new Date(exportDateTo);
      toDate.setHours(23, 59, 59, 999);

      const eventsToExport = [];

      studies.forEach(study => {
        // Evento de estudo
        const studyDate = study.studyDate?.toDate?.();
        if (studyDate && studyDate >= fromDate && studyDate <= toDate) {
          eventsToExport.push({
            data: studyDate.toLocaleDateString('pt-BR'),
            evento: study.subject,
            tipo: 'ESTUDO',
            disciplina: getDisciplineName(study.disciplineId)
          });
        }

        // Eventos de revisão
        if (study.reviews) {
          study.reviews.forEach(review => {
            const reviewDate = review.date?.toDate?.();
            if (reviewDate && reviewDate >= fromDate && reviewDate <= toDate) {
              eventsToExport.push({
                data: reviewDate.toLocaleDateString('pt-BR'),
                evento: `Revisão: ${study.subject}`,
                tipo: review.completed ? 'REVISÃO CONCLUÍDA' : 'REVISÃO PENDENTE',
                disciplina: getDisciplineName(study.disciplineId)
              });
            }
          });
        }
      });

      // Eventos personalizados
      customEvents.forEach(event => {
        const eventDate = event.date?.toDate?.();
        if (eventDate && eventDate >= fromDate && eventDate <= toDate) {
          eventsToExport.push({
            data: eventDate.toLocaleDateString('pt-BR'),
            evento: event.title,
            tipo: 'EVENTO PERSONALIZADO',
            disciplina: event.description || 'N/A'
          });
        }
      });

      // Ordenar por data
      eventsToExport.sort((a, b) => {
        const dateA = new Date(a.data.split('/').reverse().join('-'));
        const dateB = new Date(b.data.split('/').reverse().join('-'));
        return dateA - dateB;
      });

      if (eventsToExport.length === 0) {
        alert('Nenhum evento encontrado no período selecionado.');
        return;
      }

      // Criar CSV
      const csvHeader = 'DATA,EVENTO,TIPO,DISCIPLINA\n';
      const csvContent = eventsToExport.map(event => 
        `"${event.data}","${event.evento}","${event.tipo}","${event.disciplina}"`
      ).join('\n');

      const csvData = csvHeader + csvContent;
      
      // Download do arquivo
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `eventos_calendario_${exportDateFrom}_${exportDateTo}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExportDialogOpen(false);
      setExportDateFrom('');
      setExportDateTo('');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar arquivo. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const days = getDaysInMonth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendário de Estudos</h2>
          <p className="text-gray-600">Visualize seus estudos e revisões programadas</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsAddEventDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Evento
          </Button>
          <Button onClick={() => setIsExportDialogOpen(true)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando calendário...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Cabeçalho dos dias da semana */}
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                  {day}
                </div>
              ))}
              
              {/* Dias do calendário */}
              {days.map((day, index) => {
                const events = getEventsForDate(day.date);
                const hasEvents = events.length > 0;
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border border-gray-200 cursor-pointer transition-colors
                      ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                      ${hasEvents ? 'hover:bg-blue-50' : ''}
                    `}
                    onClick={() => handleDateClick(day.date)}
                  >
                    <div className="text-sm font-medium mb-1">
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getEventBadgeColor(event)}`}
                        >
                          {event.type === 'study' ? '📚' : 
                           event.type === 'review' ? (event.completed ? '✅' : '⏰') : 
                           '⚡'} 
                          {event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{events.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm text-gray-600">📚 Estudos realizados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span className="text-sm text-gray-600">⏰ Revisões pendentes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">✅ Revisões concluídas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-100 border border-pink-200 rounded"></div>
              <span className="text-sm text-gray-600">⚡ Eventos personalizados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para eventos do dia */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Eventos de {selectedDate?.toLocaleDateString('pt-BR')}
            </DialogTitle>
            <DialogDescription>
              Estudos e revisões programadas para este dia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedEvents.map((event, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {event.type === 'study' ? (
                          <BookOpen className="h-4 w-4 text-green-600" />
                        ) : event.type === 'review' ? (
                          event.completed ? (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )
                        ) : (
                          <CalendarIcon className="h-4 w-4 text-pink-600" />
                        )}
                        <h4 className="font-medium">{event.title}</h4>
                      </div>
                      {event.type === 'custom' ? (
                        <p className="text-sm text-gray-600">
                          {event.description || 'Sem descrição'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Disciplina: {event.discipline}
                        </p>
                      )}
                      {event.type === 'review' && (
                        <p className="text-xs text-gray-500">
                          Revisão de {event.review.days} dias
                        </p>
                      )}
                      {event.study?.link && (
                        <a 
                          href={event.study.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          📎 Material de estudo
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {event.type === 'review' && (
                        <Button
                          variant={event.completed ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleReviewCheck(event)}
                        >
                          {event.completed ? 'Concluída' : 'Marcar como concluída'}
                        </Button>
                      )}
                      {event.type === 'custom' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar evento */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Evento Personalizado</DialogTitle>
            <DialogDescription>
              Crie um novo evento personalizado para o calendário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Título do evento *</Label>
              <Input
                id="eventTitle"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Digite o título do evento"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDescription">Descrição (opcional)</Label>
              <Input
                id="eventDescription"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Digite uma descrição para o evento"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDate">Data do evento *</Label>
              <Input
                id="eventDate"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAddEvent} 
                disabled={!newEventTitle || !newEventDate}
                className="flex-1"
              >
                Adicionar Evento
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddEventDialogOpen(false);
                  setNewEventTitle('');
                  setNewEventDescription('');
                  setNewEventDate('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para exportação CSV */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Eventos para CSV</DialogTitle>
            <DialogDescription>
              Selecione o período para exportar os eventos do calendário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exportDateFrom">Data de início</Label>
                <Input
                  id="exportDateFrom"
                  type="date"
                  value={exportDateFrom}
                  onChange={(e) => setExportDateFrom(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exportDateTo">Data de fim</Label>
                <Input
                  id="exportDateTo"
                  type="date"
                  value={exportDateTo}
                  onChange={(e) => setExportDateTo(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2">O arquivo CSV conterá as seguintes colunas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>DATA:</strong> Data do evento</li>
                <li><strong>EVENTO:</strong> Descrição do evento</li>
                <li><strong>TIPO:</strong> ESTUDO, REVISÃO PENDENTE ou REVISÃO CONCLUÍDA</li>
                <li><strong>DISCIPLINA:</strong> Nome da disciplina</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={exportEventsToCSV} 
                disabled={exporting || !exportDateFrom || !exportDateTo}
                className="flex-1"
              >
                {exporting ? 'Exportando...' : 'Exportar CSV'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsExportDialogOpen(false);
                  setExportDateFrom('');
                  setExportDateTo('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyCalendar;

