// definin the filter values and types I need for my app

export type Priority = "High" | "Medium" | "Low";
export type Category = "Personal" | "Work" | "Health";
export type TaskFilter = "All" | "Open" | "Done";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: number;
}
