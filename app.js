import { noTasks } from './utils/constants.js';
import { getTasks, addOnLoad, updateDom } from './utils/functions.js';

window.onload = onLoad;

function onLoad() {
    const tasks = getTasks();

    // add tasks to ul / show no-tasks message
    tasks.length > 0 ? updateDom(tasks) : noTasks.style.display = 'block';
    
    addOnLoad();
}