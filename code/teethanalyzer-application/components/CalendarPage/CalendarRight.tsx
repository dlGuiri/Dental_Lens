import { useState } from "react";
import Image from "next/image";
import EditLogo from "/public/assets/Edit Button.png";
import DeleteLogo from "/public/assets/Delete Button.png";
import Swal from 'sweetalert2';

type Event = { 
  _id?: string; // Database ID
  id: string; // Date ID
  description: string; 
  type: string; 
  completed: boolean;
};

type Props = {
  events: Event[];
  selectedDateId: string | null;
  description: string;
  setDescription: (val: string) => void;
  type: string;
  setType: (val: string) => void;
  onAddEvent: () => void;
  onToggleComplete: (index: number) => void;
  onDeleteTask: (index: number) => void;
  onEditTask: (index: number, newDescription: string) => void;
  loading?: boolean;
};

export default function CalendarRight({
  events,
  selectedDateId,
  description,
  setDescription,
  type,
  setType,
  onAddEvent,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  loading = false
}: Props) {
  const formatDateId = (id: string) => {
    const day = id.slice(0, -1);
    const monthIndex = parseInt(id.slice(-1));
    const year = new Date().getFullYear();
    const date = new Date(year, monthIndex, parseInt(day));
    return date.toLocaleDateString("en-GB"); // Format: DD/MM/YY
  };

  const tasksForDate = events
    .map((e, i) => ({ ...e, index: i }))
    .filter((e) => e.id === selectedDateId);

  const [showTaskControls, setShowTaskControls] = useState<"edit" | "delete" | null>(null);

  return (
    <div className="bg-[#4fa1f2] w-[520px] h-[680px] p-4 pb-8 relative text-white flex flex-col justify-between rounded-tr-lg rounded-br-lg translate-y-6">
      <div>
        <div className="text-right text-2xl mb-4">
          {selectedDateId ? formatDateId(selectedDateId) : ""}
        </div>
        <h2 className="text-2xl mb-2">Tasks</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <ul className="pl-2">
            {tasksForDate.map((e, idx) => (
              <li key={e._id || idx} className="mb-2 flex items-center">
                <label className="inline-flex items-center cursor-pointer text-xl">
                  <input
                    type="checkbox"
                    checked={e.completed}
                    onChange={() => onToggleComplete(e.index)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 rounded border-2 border-white peer-checked:bg-blue-300 flex items-center justify-center mr-2 transition-colors duration-200">
                    <svg
                      className="w-3 h-3 text-white peer-checked:visible invisible"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={e.completed ? "opacity-50 line-through" : ""}>
                    {e.description}
                  </span>
                </label>

                {showTaskControls && (
                  <div className="flex space-x-2 ml-4">
                    {showTaskControls === "edit" && (
                      <button
                        onClick={async () => {
                          const { value: newDescription } = await Swal.fire({
                            title: 'Edit Task',
                            input: 'text',
                            inputValue: e.description,
                            inputPlaceholder: 'Enter task description',
                            showCancelButton: true,
                            confirmButtonText: 'Save',
                            cancelButtonText: 'Cancel',
                            confirmButtonColor: '#60acf4',
                            cancelButtonColor: '#6c757d',
                            inputValidator: (value) => {
                              if (!value || !value.trim()) {
                                return 'Please enter a task description';
                              }
                            }
                          });
                          
                          if (newDescription && newDescription.trim() !== e.description) {
                            onEditTask(e.index, newDescription.trim());
                          }
                        }}
                        className="p-1 bg-[#60acf4] text-white rounded hover:bg-[#3a94dd] transition-colors"
                        disabled={loading}
                      >
                        Edit
                      </button>
                    )}
                    {showTaskControls === "delete" && (
                      <button
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: 'Delete Task',
                            text: 'Are you sure you want to delete this task?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, delete it!',
                            cancelButtonText: 'Cancel',
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#6c757d'
                          });
                          
                          if (result.isConfirmed) {
                            onDeleteTask(e.index);
                            Swal.fire({
                              title: 'Deleted!',
                              text: 'Task has been deleted.',
                              icon: 'success',
                              timer: 1500,
                              showConfirmButton: false
                            });
                          }
                        }}
                        className="p-1 bg-[#60acf4] text-white rounded hover:bg-[#3a94dd] transition-colors"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col space-y-2 mt-4">
        <div className="flex items-center justify-end -space-x-1">
          <button
            onClick={() => setShowTaskControls(showTaskControls === "edit" ? null : "edit")}
            className="rounded transition transform active:-translate-y-1 duration-100"
            disabled={loading}
          >
            <Image src={EditLogo} alt="Edit Tasks" width={32} height={32} />
          </button>
          <button
            onClick={() => setShowTaskControls(showTaskControls === "delete" ? null : "delete")}
            className="rounded transition transform active:-translate-y-1 duration-100"
            disabled={loading}
          >
            <Image src={DeleteLogo} alt="Delete Tasks" width={32} height={32}/>
          </button>
        </div>
        
        <div className="flex justify-end space-x-2">
          <input
            type="text"
            placeholder="Enter task"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                onAddEvent();
              }
            }}
            className="flex-1 p-2 rounded bg-[#60acf4] text-white outline-none placeholder-blue-200"
            disabled={loading}
          />
          <button
            onClick={onAddEvent}
            className="p-2 rounded bg-[#60acf4] hover:bg-[#3a94dd] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !description.trim()}
          >
            {loading ? "..." : "Enter"}
          </button>
        </div>
      </div>
    </div>
  );
}