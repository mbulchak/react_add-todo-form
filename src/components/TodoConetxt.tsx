/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { Todo } from '../types';
import * as todoService from '../services/todo';

interface TodoMethods {
  addTodo: (todo: Todo) => void,
  updateTodo: (todo: Todo) => void,
  deleteTodo: (todoId: number) => Promise<void>,
}

export const TodoMethodsContext = React.createContext<TodoMethods>({
  addTodo: () => { },
  updateTodo: () => { },
  deleteTodo: async () => { },
});

export const TodosContext = React.createContext({
  todos: [] as Todo[],
  loading: false,
});

export const TodoProvider: React.FC = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  // #region methods
  const loadTodos = () => {
    setLoading(true);

    todoService.getTodos()
      .then(setTodos)
      .finally(() => setLoading(false));
  };

  const addTodo = (todo: Todo) => {
    setLoading(true);

    return todoService.createTodo(todo)
      .then(loadTodos)
      .finally(() => setLoading(false));
  };

  const deleteTodo = (todoId: number) => {
    let prevTodos: Todo[];

    setTodos(currentTodos => {
      prevTodos = currentTodos;

      return currentTodos.filter(todo => todo.id !== todoId);
    });

    todoService.deleteTodo(todoId)
      .catch(() => setTodos(prevTodos));
  };

  const updateTodo = async (updatedTodo: Todo) => {
    const todoFromServer = await todoService.updateTodo(updatedTodo);

    setTodos(currentTodos => currentTodos.map(
      todo => (todo.id === updatedTodo.id ? todoFromServer : todo),
    ));
  };
  // #endregion

  useEffect(loadTodos, []);

  const value = useMemo(() => ({ addTodo, deleteTodo, updateTodo }), []);

  return (
    <TodoMethodsContext.Provider value={value}>
      <TodosContext.Provider value={{ todos, loading }}>
        {children}
      </TodosContext.Provider>
    </TodoMethodsContext.Provider>
  );
};
