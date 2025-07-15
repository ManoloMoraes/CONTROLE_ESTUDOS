import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  orderBy 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus,
  Trash2,
  Edit,
  X,
  GripVertical,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TrelloBoard = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOverList, setDraggedOverList] = useState(null);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    try {
      setLoading(true);
      const listsRef = collection(db, 'users', user.uid, 'trelloLists');
      const q = query(listsRef, orderBy('createdAt'));
      const querySnapshot = await getDocs(q);
      
      const listsList = [];
      for (const listDoc of querySnapshot.docs) {
        const listData = {
          id: listDoc.id,
          ...listDoc.data()
        };
        
        // Carregar tarefas para cada lista
        const tasksRef = collection(db, 'users', user.uid, 'trelloLists', listDoc.id, 'tasks');
        const tasksQuery = query(tasksRef, orderBy('order'));
        const tasksSnapshot = await getDocs(tasksQuery);
        
        const tasks = [];
        tasksSnapshot.forEach((taskDoc) => {
          tasks.push({
            id: taskDoc.id,
            ...taskDoc.data()
          });
        });
        
        listData.tasks = tasks;
        listsList.push(listData);
      }
      
      setLists(listsList);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) {
      alert('Por favor, digite um título para a lista.');
      return;
    }

    try {
      const listsRef = collection(db, 'users', user.uid, 'trelloLists');
      await addDoc(listsRef, {
        title: newListTitle,
        createdAt: new Date(),
        order: lists.length
      });

      setNewListTitle('');
      setIsAddListDialogOpen(false);
      await loadLists();
    } catch (error) {
      console.error('Erro ao adicionar lista:', error);
      alert('Erro ao adicionar lista. Tente novamente.');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm('Tem certeza que deseja excluir esta lista e todas as suas tarefas?')) {
      return;
    }

    try {
      // Primeiro, excluir todas as tarefas da lista
      const tasksRef = collection(db, 'users', user.uid, 'trelloLists', listId, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      
      for (const taskDoc of tasksSnapshot.docs) {
        await deleteDoc(doc(db, 'users', user.uid, 'trelloLists', listId, 'tasks', taskDoc.id));
      }
      
      // Depois, excluir a lista
      const listRef = doc(db, 'users', user.uid, 'trelloLists', listId);
      await deleteDoc(listRef);
      
      await loadLists();
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      alert('Erro ao excluir lista. Tente novamente.');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedListId) {
      alert('Por favor, preencha o título da tarefa e selecione uma lista.');
      return;
    }

    try {
      const list = lists.find(l => l.id === selectedListId);
      const tasksRef = collection(db, 'users', user.uid, 'trelloLists', selectedListId, 'tasks');
      await addDoc(tasksRef, {
        title: newTaskTitle,
        description: newTaskDescription,
        createdAt: new Date(),
        order: list.tasks.length
      });

      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedListId('');
      setIsAddTaskDialogOpen(false);
      await loadLists();
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      alert('Erro ao adicionar tarefa. Tente novamente.');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.title.trim()) {
      alert('Por favor, preencha o título da tarefa.');
      return;
    }

    try {
      const taskRef = doc(db, 'users', user.uid, 'trelloLists', editingTask.listId, 'tasks', editingTask.id);
      await updateDoc(taskRef, {
        title: editingTask.title,
        description: editingTask.description
      });

      setEditingTask(null);
      setIsEditTaskDialogOpen(false);
      await loadLists();
    } catch (error) {
      console.error('Erro ao editar tarefa:', error);
      alert('Erro ao editar tarefa. Tente novamente.');
    }
  };

  const handleDeleteTask = async (listId, taskId) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      const taskRef = doc(db, 'users', user.uid, 'trelloLists', listId, 'tasks', taskId);
      await deleteDoc(taskRef);
      await loadLists();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      alert('Erro ao excluir tarefa. Tente novamente.');
    }
  };

  const handleDragStart = (e, task, listId) => {
    setDraggedTask({ ...task, listId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, listId) => {
    e.preventDefault();
    setDraggedOverList(listId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOverList(null);
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    setDraggedOverList(null);

    if (!draggedTask || draggedTask.listId === targetListId) {
      setDraggedTask(null);
      return;
    }

    try {
      // Remover tarefa da lista original
      const originalTaskRef = doc(db, 'users', user.uid, 'trelloLists', draggedTask.listId, 'tasks', draggedTask.id);
      await deleteDoc(originalTaskRef);

      // Adicionar tarefa na nova lista
      const targetList = lists.find(l => l.id === targetListId);
      const tasksRef = collection(db, 'users', user.uid, 'trelloLists', targetListId, 'tasks');
      await addDoc(tasksRef, {
        title: draggedTask.title,
        description: draggedTask.description,
        createdAt: draggedTask.createdAt,
        order: targetList.tasks.length
      });

      setDraggedTask(null);
      await loadLists();
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      alert('Erro ao mover tarefa. Tente novamente.');
    }
  };

  const openEditTaskDialog = (task, listId) => {
    setEditingTask({
      ...task,
      listId
    });
    setIsEditTaskDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trello</h2>
          <p className="text-gray-600">Organize suas tarefas em listas personalizadas</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsAddListDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nova Lista
          </Button>
          <Button onClick={() => setIsAddTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando quadro...</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`min-w-[300px] bg-gray-100 rounded-lg p-4 ${
                draggedOverList === list.id ? 'bg-blue-100 border-2 border-blue-300' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">{list.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteList(list.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {list.tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, list.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openEditTaskDialog(task, list.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(list.id, task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          
          {lists.length === 0 && (
            <div className="text-center py-8 w-full">
              <p className="text-gray-600 mb-4">Nenhuma lista criada ainda.</p>
              <Button onClick={() => setIsAddListDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira lista
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dialog para adicionar lista */}
      <Dialog open={isAddListDialogOpen} onOpenChange={setIsAddListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Lista</DialogTitle>
            <DialogDescription>
              Crie uma nova lista para organizar suas tarefas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listTitle">Título da lista *</Label>
              <Input
                id="listTitle"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Digite o título da lista"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAddList} 
                disabled={!newListTitle.trim()}
                className="flex-1"
              >
                Criar Lista
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddListDialogOpen(false);
                  setNewListTitle('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar tarefa */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Adicione uma nova tarefa a uma de suas listas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskList">Lista *</Label>
              <select
                id="taskList"
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione uma lista</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Título da tarefa *</Label>
              <Input
                id="taskTitle"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Digite o título da tarefa"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Descrição (opcional)</Label>
              <Input
                id="taskDescription"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Digite uma descrição para a tarefa"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAddTask} 
                disabled={!newTaskTitle.trim() || !selectedListId}
                className="flex-1"
              >
                Adicionar Tarefa
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddTaskDialogOpen(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  setSelectedListId('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar tarefa */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da tarefa
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTaskTitle">Título da tarefa *</Label>
                <Input
                  id="editTaskTitle"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  placeholder="Digite o título da tarefa"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editTaskDescription">Descrição (opcional)</Label>
                <Input
                  id="editTaskDescription"
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  placeholder="Digite uma descrição para a tarefa"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleEditTask} 
                  disabled={!editingTask.title.trim()}
                  className="flex-1"
                >
                  Salvar Alterações
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditTaskDialogOpen(false);
                    setEditingTask(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrelloBoard;

