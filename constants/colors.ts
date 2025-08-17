// colors? for filters and priitoritys....
// utils/priorityColor.ts
// HELPER picks a dot color based on the priority text

/**
 * helps give cosnistent colors for my tasks based on priority labesl
 */

// which I need to go bakc and add PRIORITY TASKS!!

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
