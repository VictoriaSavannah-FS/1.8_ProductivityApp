// colors? for filters and priitoritys....
// utils/priorityColor.ts
// This helper picks a dot color based on the priority text

export function priorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
      return "#EF4444"; // red - uh oh!
    case "medium":
      return "#F59E0B"; // orange -meh..
    case "low":
      return "#10B981"; // green - yay!
    default:
      return "#6B7280"; // gray ==> unknown priority
  }
}
