import { useEffect, useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import CalendarLeft from "@/components/CalendarPage/CalendarLeft";
import CalendarRight from "@/components/CalendarPage/CalendarRight";

// GraphQL queries and mutations
const GET_USER_BY_OAUTH_ID = gql`
  query GetUserByOauthId($oauthId: String!) {
    getUserByOauthId(oauthId: $oauthId) {
      _id
    }
  }
`;

const GET_TASKS_BY_USER_AND_DATE = gql`
  query GetTasksByUserAndDate($userId: ID!, $dateId: String!) {
    getTasksByUserAndDate(userId: $userId, dateId: $dateId) {
      _id
      userId
      description
      type
      completed
      dateId
      createdAt
      updatedAt
    }
  }
`;

const GET_TASKS_BY_USER_AND_MONTH = gql`
  query GetTasksByUserAndMonth($userId: ID!, $month: Int!, $year: Int!) {
    getTasksByUserAndMonth(userId: $userId, month: $month, year: $year) {
      _id
      userId
      description
      type
      completed
      dateId
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask(
    $userId: ID!
    $description: String!
    $type: String
    $completed: Boolean
    $dateId: String!
  ) {
    createTask(
      userId: $userId
      description: $description
      type: $type
      completed: $completed
      dateId: $dateId
    ) {
      _id
      userId
      description
      type
      completed
      dateId
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask(
    $taskId: ID!
    $description: String
    $type: String
    $completed: Boolean
    $dateId: String
  ) {
    updateTask(
      taskId: $taskId
      description: $description
      type: $type
      completed: $completed
      dateId: $dateId
    ) {
      _id
      userId
      description
      type
      completed
      dateId
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId) {
      _id
    }
  }
`;

const TOGGLE_TASK_COMPLETE = gql`
  mutation ToggleTaskComplete($taskId: ID!) {
    toggleTaskComplete(taskId: $taskId) {
      _id
      completed
    }
  }
`;

// Define the task type
type Task = {
  _id?: string;
  id: string;
  description: string;
  type: string;
  completed: boolean;
};

export default function Calendar() {
  const { data: session } = useSession();
  const oauthId = session?.user?.oauthId;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const now = new Date();
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [events, setEvents] = useState<Task[]>([]);
  const [allMonthTasks, setAllMonthTasks] = useState<Task[]>([]);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Social");
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from oauthId
  const { data: userData } = useQuery(GET_USER_BY_OAUTH_ID, {
    variables: { oauthId },
    skip: !oauthId,
    onCompleted: (data) => {
      if (data?.getUserByOauthId?._id) {
        setUserId(data.getUserByOauthId._id);
      }
    }
  });

  // Query to get all tasks for the current month (for indicators)
  const { data: monthTasksData, refetch: refetchMonthTasks } = useQuery(GET_TASKS_BY_USER_AND_MONTH, {
    variables: { 
      userId, 
      month: monthIndex, 
      year: now.getFullYear() 
    },
    skip: !userId,
    fetchPolicy: 'cache-and-network', // Always refetch from network
    onCompleted: (data) => {
      if (data?.getTasksByUserAndMonth) {
        const monthTasks = data.getTasksByUserAndMonth.map((task: any) => ({
          _id: task._id,
          id: task.dateId,
          description: task.description,
          type: task.type || "Social",
          completed: task.completed
        }));
        setAllMonthTasks(monthTasks);
      }
    }
  });

  // GraphQL hooks for selected date tasks
  const { data: tasksData, loading, error, refetch } = useQuery(GET_TASKS_BY_USER_AND_DATE, {
    variables: { userId, dateId: selectedDateId },
    skip: !userId || !selectedDateId,
  });

  const [createTaskMutation] = useMutation(CREATE_TASK, {
    onCompleted: (data) => {
      refetch(); // Refetch tasks after creating
      refetchMonthTasks(); // Refetch month tasks to update indicators
      // Add the new task to allMonthTasks as well
      if (data.createTask) {
        const newTask: Task = {
          _id: data.createTask._id,
          id: data.createTask.dateId,
          description: data.createTask.description,
          type: data.createTask.type || "Social",
          completed: data.createTask.completed
        };
        setAllMonthTasks(prev => [...prev, newTask]);
      }
    },
    onError: (error) => {
      console.error("Error creating task:", error);
    }
  });

  const [updateTaskMutation] = useMutation(UPDATE_TASK, {
    onCompleted: (data) => {
      refetch(); // Refetch tasks after updating
      refetchMonthTasks(); // Refetch month tasks to update indicators
      // Update the task in allMonthTasks as well
      if (data.updateTask) {
        setAllMonthTasks(prev => prev.map(task => 
          task._id === data.updateTask._id 
            ? {
                ...task,
                description: data.updateTask.description,
                type: data.updateTask.type || task.type,
                completed: data.updateTask.completed
              }
            : task
        ));
      }
    },
    onError: (error) => {
      console.error("Error updating task:", error);
    }
  });

  const [deleteTaskMutation] = useMutation(DELETE_TASK, {
    onCompleted: (data) => {
      refetch(); // Refetch tasks after deleting
      refetchMonthTasks(); // Refetch month tasks to update indicators
      // Remove the task from allMonthTasks as well
      if (data.deleteTask) {
        setAllMonthTasks(prev => prev.filter(task => task._id !== data.deleteTask._id));
      }
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
    }
  });

  const [toggleTaskCompleteMutation] = useMutation(TOGGLE_TASK_COMPLETE, {
    onCompleted: (data) => {
      refetch(); // Refetch tasks after toggling
      refetchMonthTasks(); // Refetch month tasks to update indicators
      // Update the task completion in allMonthTasks as well
      if (data.toggleTaskComplete) {
        setAllMonthTasks(prev => prev.map(task => 
          task._id === data.toggleTaskComplete._id 
            ? { ...task, completed: data.toggleTaskComplete.completed }
            : task
        ));
      }
    },
    onError: (error) => {
      console.error("Error toggling task:", error);
    }
  });

  // Set initial selected date and refetch month tasks when component mounts
  useEffect(() => {
    const today = new Date();
    const todayId = `${today.getDate()}${today.getMonth()}`;
    setSelectedDateId(todayId);
    
    // Refetch month tasks when navigating back to calendar
    if (userId) {
      refetchMonthTasks();
    }
  }, [userId, refetchMonthTasks]);

  // Update local events when tasksData changes
  useEffect(() => {
    if (tasksData?.getTasksByUserAndDate) {
      const dbTasks = tasksData.getTasksByUserAndDate.map((task: any) => ({
        _id: task._id,
        id: task.dateId,
        description: task.description,
        type: task.type || "Social",
        completed: task.completed
      }));
      setEvents(dbTasks);
      
      // Also add these tasks to allMonthTasks if they're not already there
      setAllMonthTasks(prev => {
        const newTasks = [...prev];
        dbTasks.forEach((task: Task) => { // Fixed: Added explicit type annotation
          if (!newTasks.find(t => t._id === task._id)) {
            newTasks.push(task);
          }
        });
        return newTasks;
      });
    }
  }, [tasksData]);

  // Create default tasks for today if none exist and user is logged in
  useEffect(() => {
    if (userId && selectedDateId && tasksData?.getTasksByUserAndDate?.length === 0) {
      const today = new Date();
      const todayId = `${today.getDate()}${today.getMonth()}`;
      
      if (selectedDateId === todayId) {
        // Create default tasks
        createTaskMutation({
          variables: {
            userId,
            description: "Brush Teeth",
            type: "default",
            completed: false,
            dateId: selectedDateId
          }
        });
        
        createTaskMutation({
          variables: {
            userId,
            description: "Floss Teeth",
            type: "default",
            completed: false,
            dateId: selectedDateId
          }
        });
      }
    }
  }, [userId, selectedDateId, tasksData, createTaskMutation]);

  const daysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const handleAddEvent = async () => {
    if (selectedDateId && description.trim() && userId) {
      try {
        await createTaskMutation({
          variables: {
            userId,
            description: description.trim(),
            type,
            completed: false,
            dateId: selectedDateId
          }
        });
        setDescription("");
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    }
  };

  const handleToggleComplete = async (index: number) => {
    const task = events[index];
    if (task._id) {
      try {
        await toggleTaskCompleteMutation({
          variables: { taskId: task._id }
        });
      } catch (error) {
        console.error("Failed to toggle task:", error);
      }
    }
  };

  const handleDateClick = (id: string) => {
    setSelectedDateId(id);
  };

  const handleNext = () => {
    if (monthIndex < 11) setMonthIndex(monthIndex + 1);
  };

  const handlePrev = () => {
    if (monthIndex > 0) setMonthIndex(monthIndex - 1);
  };

  const handleDeleteTask = async (index: number) => {
    const task = events[index];
    if (task._id) {
      try {
        await deleteTaskMutation({
          variables: { taskId: task._id }
        });
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleEditTask = async (index: number, newDescription: string) => {
    const task = events[index];
    if (task._id && newDescription.trim()) {
      try {
        await updateTaskMutation({
          variables: {
            taskId: task._id,
            description: newDescription.trim()
          }
        });
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    }
  };

  const daysCount = daysInMonth(monthIndex, now.getFullYear());

  // Show loading state
  if (!oauthId) {
    return <div className="flex items-center justify-center">Please log in to view your calendar.</div>;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex rounded-lg overflow-hidden">
        <CalendarLeft
          month={months[monthIndex]}
          daysCount={daysCount}
          monthIndex={monthIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          selectedDateId={selectedDateId}
          onDateClick={handleDateClick}
          events={allMonthTasks} // Pass all accumulated month tasks
        />
        <CalendarRight
          events={events}
          selectedDateId={selectedDateId}
          description={description}
          setDescription={setDescription}
          type={type}
          setType={setType}
          onAddEvent={handleAddEvent}
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          loading={loading}
        />
      </div>
    </div>
  );
}