import PlusIcon from "@/icons/PlusIcon"
import { Column, Id, Task } from "@/types"
import { useMemo, useState } from "react"
import ColumnContainer from "./ColumnContainer"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import TaskCard from "./TaskCard"

const KanBanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([])
  const columnsId = useMemo(() => 
    columns.map((col) => col.id), 
  [columns])

  const [tasks, setTasks] = useState<Task[]>([]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null)

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      }
    })
  )

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext sensors={sensors}  onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map(col => 
                <ColumnContainer key={col.id} column={col} deleteColumn={deleteColumn} updateColumn={updateColumn} createTask={createTask} tasks={tasks.filter(task  => task.columnId === col.id)} deleteTask={deleteTask} updateTask={updateTask} />
              )}
            </SortableContext>
          </div>
          <button onClick={createColumn} className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2">
            <PlusIcon/> Add Column
          </button>
        </div>

      {createPortal(
        <DragOverlay>
          {activeColumn && <ColumnContainer tasks={tasks.filter(task  => task.columnId === activeColumn.id)} column={activeColumn} deleteColumn={deleteColumn} updateColumn={updateColumn} createTask={createTask} deleteTask={deleteTask}  updateTask={updateTask} />}
          { activeTask &&  <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />}
        </DragOverlay>,
        document.body
      )}

      </DndContext>
    </div>
  )

  function createTask(columnId: Id){
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`
    }

    setTasks([...tasks, newTask])
  }

  function deleteTask(id: Id){
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(id: Id, content: string){
    const newTasks = tasks.map((task) => {
      if(task.id !== id) return task;
      return {...task, content}
    });

    setTasks(newTasks)
  }

  function createColumn(){
    const columnToAdd:Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    }
    
    setColumns([...columns, columnToAdd])
  }

  function deleteColumn(columnId: Id){
    setColumns(columns.filter(col => col.id!== columnId))

    const newTasks = tasks.filter(task => task.columnId!== columnId);
    setTasks(newTasks);
  }

  function updateColumn(id: Id, title: string){
    const newColumns = columns.map((col) => {
      if(col.id !== id) return col;
      return {...col, title}
    });

    setColumns(newColumns)
  }

  function onDragStart(event: DragStartEvent){
    if(event.active.data.current?.type === "Column"){
      setActiveColumn(event.active.data.current.column)
      return;
    }
  
    if(event.active.data.current?.type === "Task"){
      setActiveTask(event.active.data.current.task)
      return;
    }
  }

  function onDragEnd(event: DragEndEvent){
    setActiveColumn(null);
    setActiveTask(null);

    const {active , over} = event;
    if(!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if(activeColumnId === overColumnId) return;

    setColumns(columns => {
      const activeColumnIndex = columns.findIndex(col => col.id === activeColumnId);
      const overColumnIndex = columns.findIndex(col => col.id === overColumnId);
   
      return arrayMove(columns, activeColumnIndex, overColumnIndex) ;
    })
  }

  function onDragOver(event: DragEndEvent){
    const {active , over} = event;
    if(!over) return;
  
    const activeId = active.id;
    const overId = over.id;
  
    if(activeId === overId) return;
  
    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if(!isActiveTask) return;

    if(isActiveTask && isOverTask){
      setTasks((tasks: Task[]) => {
        const activeIndex = tasks.findIndex((task: Task) => task.id === activeId);
        const overIndex = tasks.findIndex((task: Task) => task.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex) ;
      })
    }

    const isOverColumn = over.data.current?.type == "Column";

    if(isActiveTask && isOverColumn){
      setTasks((tasks: Task[]) => {
        const activeIndex = tasks.findIndex((task: Task) => task.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex) ;
      })
    }
  }
}

function generateId() {
  return Math.floor(Math.random() * 10001);
}

export default KanBanBoard
