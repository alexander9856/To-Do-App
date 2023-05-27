function capitalize(value) {
    return value[0].toUpperCase() + value.slice(1);
}
export const taskTemplate = ({ deadline, priority, status }) => {
    return `
                    <div class="task-wrapper">
                        <div class="task-info">
                                <p class="task-description"></p>
                                <p class="task-status">Status: ${status == 'incomplete' ? 'Incomplete' : 'Completed<i class="fa-solid fa-check"></i>'}</p>
                                <p class="task-deadline">Deadline: ${deadline}</p>
                                <p class="task-priority">Priority: ${capitalize(priority)}</p>
                        </div>
                        <div class="task-actions">
                                <button class="status-button ${status}">${status == 'completed' ? 'Mark as Incomplete' : 'Mark as Completed'}</button>
                                <button class="edit-button"><i class="fa-solid fa-pen-to-square"></i>Edit</button>
                                <button class="delete-button"><i class="fa-solid fa-trash"></i>Delete</button>
                        </div>
                    </div>
    `
}
