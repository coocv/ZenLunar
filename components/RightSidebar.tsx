
import React, { useState, useEffect, useRef } from 'react';
import { NotebookPen, ListTodo, ChevronRight, Eraser, Plus, Check, Trash2, X } from 'lucide-react';

interface RightSidebarProps {
  currentDate: Date;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ currentDate }) => {
  // 'none' means closed
  const [activePanel, setActivePanel] = useState<'none' | 'todo' | 'summary'>('none');
  
  // Data States
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [summaryContent, setSummaryContent] = useState('');
  
  // Input States
  const [newTodoText, setNewTodoText] = useState('');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Date Logic
  const offset = currentDate.getTimezoneOffset() * 60000;
  const localDate = new Date(currentDate.getTime() - offset);
  const dateKey = localDate.toISOString().split('T')[0];
  const dateLabel = `${localDate.getMonth() + 1}月${localDate.getDate()}日`;

  // === Load Data ===
  useEffect(() => {
    // Load Todos for specific date
    const todoKey = `zenlunar_todo_${dateKey}`;
    try {
        const savedTodos = localStorage.getItem(todoKey);
        setTodos(savedTodos ? JSON.parse(savedTodos) : []);
    } catch(e) { setTodos([]); }

    // Load Summary for specific date
    const summaryKey = `zenlunar_summary_${dateKey}`;
    const savedSummary = localStorage.getItem(summaryKey);
    setSummaryContent(savedSummary || '');
  }, [dateKey]);

  // === Auto-resize Summary Textarea ===
  useEffect(() => {
    if (activePanel === 'summary' && textareaRef.current) {
        // Reset height to allow shrinking if content was deleted
        textareaRef.current.style.height = 'auto';
        // Set height based on content
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [summaryContent, activePanel]);

  // === Click Outside Logic ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If panel is open AND click target is not inside the panel
      if (activePanel !== 'none' && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActivePanel('none');
      }
    };

    // Use mousedown to ensure we capture the start of the interaction
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePanel]);

  // === Save Handlers ===
  const saveTodos = (newTodos: TodoItem[]) => {
      setTodos(newTodos);
      localStorage.setItem(`zenlunar_todo_${dateKey}`, JSON.stringify(newTodos));
      setLastSaved(Date.now());
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSummaryContent(val);
    localStorage.setItem(`zenlunar_summary_${dateKey}`, val);
    setLastSaved(Date.now());
  };

  // === Todo Logic ===
  const addTodo = () => {
      if (!newTodoText.trim()) return;
      const newItem: TodoItem = {
          id: Date.now().toString(),
          text: newTodoText.trim(),
          completed: false
      };
      saveTodos([...todos, newItem]);
      setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
      const newTodos = todos.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
      );
      saveTodos(newTodos);
  };

  const deleteTodo = (id: string) => {
      const newTodos = todos.filter(t => t.id !== id);
      saveTodos(newTodos);
  };

  const clearCurrent = () => {
      if (activePanel === 'todo') {
          if(window.confirm(`确定清空 ${dateLabel} 的所有日程吗？`)) {
              saveTodos([]);
          }
      } else {
          if(window.confirm(`确定清空 ${dateLabel} 的随笔吗？`)) {
              setSummaryContent('');
              localStorage.setItem(`zenlunar_summary_${dateKey}`, '');
          }
      }
  };

  const closePanel = () => setActivePanel('none');

  const isOpen = activePanel !== 'none';

  return (
    <>
      {/* Trigger Buttons (Floating on the right) */}
      <div 
        className={`
            fixed right-0 top-1/2 -translate-y-1/2 z-[45] flex flex-col gap-3
            transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isOpen ? 'translate-x-[150%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
        `}
      >
        {/* Toggle Button for Todo */}
        <button 
            onClick={() => setActivePanel('todo')}
            className={`
                shadow-lg p-3 rounded-l-2xl transition-all duration-300 group relative border-y border-l
                bg-white/90 backdrop-blur-sm text-gray-500 border-gray-100 hover:text-primary hover:pl-4 hover:shadow-xl
            `}
            title="今日日程"
        >
            <ListTodo size={22} />
            {/* Tooltip */}
            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-gray-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl font-medium">
                今日日程
            </span>
        </button>

        {/* Toggle Button for Summary */}
        <button 
            onClick={() => setActivePanel('summary')}
            className={`
                shadow-lg p-3 rounded-l-2xl transition-all duration-300 group relative border-y border-l
                bg-white/90 backdrop-blur-sm text-gray-500 border-gray-100 hover:text-primary hover:pl-4 hover:shadow-xl
            `}
            title="今日随笔"
        >
            <NotebookPen size={22} />
            {/* Tooltip */}
            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-gray-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl font-medium">
                今日随笔
            </span>
        </button>
      </div>

      {/* Expanded Floating Panel (Card Style) */}
      <div 
        ref={panelRef}
        className={`
            fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 w-[90vw] sm:w-96 
            max-h-[85vh] h-auto min-h-[350px]
            bg-surface/95 backdrop-blur-xl shadow-2xl border border-white/40 rounded-2xl z-50
            transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col overflow-hidden
            ${isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[120%] opacity-0 scale-95 pointer-events-none'}
        `}
      >
        {/* Header Area (Fixed) */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-gray-100/50 bg-white/40">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shadow-sm ${activePanel === 'todo' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {activePanel === 'todo' ? <ListTodo size={20} /> : <NotebookPen size={20} />}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-lg tracking-tight">
                        {activePanel === 'todo' ? '今日日程' : '今日随笔'}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium font-mono">{dateLabel}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                <button 
                    onClick={clearCurrent}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="清空"
                >
                    <Eraser size={18} />
                </button>
                <button 
                    onClick={closePanel}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>

        {/* Content Area (Flexible) */}
        <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
            
            {/* === TODO LIST VIEW === */}
            {activePanel === 'todo' && (
                <div className="flex flex-col p-6 animate-in slide-in-from-right-8 fade-in duration-300 min-h-0">
                    
                    {/* Add Input (Fixed at top of content) */}
                    <div className="relative mb-6 group flex-shrink-0">
                        <input
                            type="text"
                            placeholder="添加新事项..."
                            value={newTodoText}
                            onChange={(e) => setNewTodoText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                            className="w-full pl-4 pr-12 py-3.5 bg-gray-50/50 hover:bg-white border border-gray-200/60 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/10 focus:border-primary/50 focus:bg-white focus:outline-none transition-all"
                        />
                        <button 
                            onClick={addTodo}
                            disabled={!newTodoText.trim()}
                            className="absolute right-2 top-2 p-1.5 bg-white text-gray-400 border border-gray-100 shadow-sm rounded-lg hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all scale-90"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* List (Scrollable, Auto-Height up to limit) */}
                    <div className="overflow-y-auto pr-1 space-y-2.5 pb-2 scrollbar-thin min-h-[180px] max-h-[55vh]">
                        {todos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-gray-300">
                                <ListTodo size={48} className="mb-3 opacity-10" />
                                <p className="text-sm font-medium opacity-60">今日暂无安排</p>
                            </div>
                        ) : (
                            todos.map((todo) => (
                                <div 
                                    key={todo.id}
                                    className={`
                                        group flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-300 ease-out
                                        ${todo.completed 
                                            ? 'bg-gray-50/50 border-transparent opacity-50 grayscale' 
                                            : 'bg-white border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'}
                                    `}
                                >
                                    <button 
                                        onClick={() => toggleTodo(todo.id)}
                                        className={`
                                            mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0
                                            ${todo.completed 
                                                ? 'bg-blue-500 border-blue-500 text-white scale-90' 
                                                : 'bg-white border-gray-300 hover:border-blue-400 text-transparent'}
                                        `}
                                    >
                                        <Check size={12} strokeWidth={3} />
                                    </button>
                                    
                                    <span className={`flex-1 text-sm leading-relaxed break-all pt-0.5 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                                        {todo.text}
                                    </span>

                                    <button 
                                        onClick={() => deleteTodo(todo.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all scale-90"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                        <div className="text-[10px] text-center text-gray-300 pt-2 font-medium tracking-wide">
                            {todos.filter(t => t.completed).length} / {todos.length} 已完成
                        </div>
                    </div>
                </div>
            )}

            {/* === SUMMARY VIEW === */}
            {activePanel === 'summary' && (
                <div className="flex flex-col p-6 animate-in slide-in-from-right-8 fade-in duration-300 min-h-0">
                    <div className="flex-1 relative w-full">
                        <textarea
                            ref={textareaRef}
                            className="w-full resize-none bg-white border border-gray-100 rounded-2xl p-5 text-gray-700 leading-relaxed focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none text-sm placeholder-gray-400/50 shadow-sm overflow-hidden block min-h-[230px] max-h-[60vh]"
                            placeholder={`在此记录 ${dateLabel} 的感悟、总结或心情...`}
                            value={summaryContent}
                            onChange={handleSummaryChange}
                            spellCheck={false}
                            rows={1}
                        />
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400 font-medium flex-shrink-0">
                         <span>自动保存</span>
                         <span className={`transition-opacity duration-500 flex items-center gap-1 ${lastSaved ? 'opacity-100' : 'opacity-0'}`}>
                            <Check size={10} /> 已同步
                         </span>
                    </div>
                </div>
            )}

        </div>
      </div>
    </>
  );
};
