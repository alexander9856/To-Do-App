import { createForm, editForm, cancelEditBtn, noTasks, noMatches, search, searchForm, sortType, sortBy, filterBy, ulTasks, dateCreateForm, dateEditForm } from './constants.js';
import { taskTemplate } from './templates.js';

let editData = {
    task: "",
    description: "",
    deadline: "",
    status: "incomplete",
    priority: ""
}

const setDate = () => {
    // set today`s date to create form
    dateCreateForm.valueAsDate = new Date();
    // add minDate to create/edit form
    dateCreateForm.min = new Date().toISOString().split("T")[0];
    dateEditForm.min = new Date().toISOString().split("T")[0];
}
const resetSearchForm = () => {
    filterBy.value = 'default';
    sortBy.value = 'deadline';
    sortType.value = 'desc';
    search.value = '';
}
export const addOnLoad = () => {
    setDate();

    createForm.addEventListener('submit', (e) => onFormSubmitCreate(e));
    editForm.addEventListener('submit', (e) => onFormSubmitEdit(e));
    cancelEditBtn.addEventListener('click', () => onCancelEdit());
    search.addEventListener('input', (e) => onSearch(e));
    sortBy.addEventListener('input', () => onSortBy());
    sortType.addEventListener('input', () => onSortType());
    filterBy.addEventListener('input', () => onFilter());
}


const createLiElement = (data) => {
    const liElement = document.createElement('li');
    liElement.classList.add('task');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = data.task;
    liElement.appendChild(checkbox);

    // create label
    const taskLabel = document.createElement('label');
    taskLabel.setAttribute('for', data.task);
    taskLabel.classList.add(data.priority);
    data.status == 'completed' && taskLabel.classList.add("completed-task");

    // create thumbtack (fontAwesome icon)
    const thumbtack = document.createElement('i');
    thumbtack.classList.add('fa-solid', 'fa-thumbtack');
    data.status == 'completed' && thumbtack.classList.add("completed-task");

    // add thumbtack to label
    data.status == 'incomplete' && taskLabel.appendChild(thumbtack);

    // add text to label
    const taskText = document.createTextNode(data.task);
    taskLabel.appendChild(taskText);

    // create span
    const labelSpan = document.createElement('span');
    labelSpan.className = 'label-deadline';

    data.status == 'completed'
        ? labelSpan.innerHTML = `Completed on: <i class="fa-solid fa-calendar-days"></i>${data.completedOn}`
        : labelSpan.innerHTML = `Due to: <i class="fa-solid fa-calendar-days"></i>${new Date(data.deadline).toLocaleDateString("en-US")}`;
    taskLabel.appendChild(labelSpan);

    liElement.appendChild(taskLabel);
    liElement.innerHTML += taskTemplate(data);

    // add description text
    liElement.querySelector('.task-wrapper>.task-info>.task-description').textContent = `Description: ${data.description}`;

    return liElement
}
export const getTasks = () => {
    let tasks = JSON.parse(localStorage.getItem('tasks'))
    if (!tasks) {
        tasks = [];
        localStorage.setItem('tasks', JSON.stringify([]));
    }
    const search = searchForm.querySelector('#search').value
    const sortingBy = sortBy.value;
    const sortingType = sortType.value
    const filtering = filterBy.value;

    // search
    if (search) {
        tasks = tasks.filter(x => {
            if (x.task.toLowerCase().includes(search.toLowerCase())) {
                return x
            }
        })
    }

    // sort
    const order = { 'high': 1, 'medium': 2, 'low': 3 };
    const sortingValues = {
        'deadline': {
            'desc': () => tasks = tasks.sort((a, b) => new Date(b.deadline) - new Date(a.deadline)),
            'asc': () => tasks = tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        },
        'priority': {
            'desc': () => tasks.sort((a, b) => order[a.priority] - order[b.priority]),
            'asc': () => tasks = tasks.sort((a, b) => order[b.priority] - order[a.priority])
        }
    }
    sortingValues[sortingBy][sortingType]();

    // filter
    const filterStatus = ['completed', 'incomplete'];
    const filterPrio = ['high', 'medium', 'low'];

    const indexOfFilterStatus = filterStatus.indexOf(filtering);
    const indexOfFilterPrio = filterPrio.indexOf(filtering);


    filtering !== 'default' ?

        filterStatus.includes(filtering)
            ? tasks = tasks.filter(x => x.status == filterStatus[indexOfFilterStatus])
            : tasks = tasks.filter(x => x.priority == filterPrio[indexOfFilterPrio])

        : "";
    return tasks
}
export const updateDom = (tasks) => {
    tasks.map(x => {
        const liElement = createLiElement(x);
        liElement.querySelector('.task-wrapper>.task-actions>.edit-button').addEventListener('click', (e) => onEdit(e));
        liElement.querySelector('.task-wrapper>.task-actions>.delete-button').addEventListener('click', (e) => onDelete(e));
        liElement.querySelector('.task-wrapper>.task-actions>.status-button').addEventListener('click', (e) => onComplete(e));
        ulTasks.appendChild(liElement);
    })
}
const onSortBy = () => {
    ulTasks.innerHTML = "";
    let tasks = getTasks();
    if (tasks.length > 0) {
        noMatches.style.display = 'none';
        updateDom(tasks);
    }
    else {
        noMatches.style.display = 'block';
    }
}
const onSortType = () => {
    let tasks = getTasks();
    ulTasks.innerHTML = "";
    if (tasks.length > 0) {
        noMatches.style.display = 'none';
        updateDom(tasks);
    }
    else {
        noMatches.style.display = 'block';
    }
}
const onFilter = () => {
    let tasks = getTasks();
    ulTasks.innerHTML = "";
    if (tasks.length > 0) {
        noMatches.style.display = 'none';
        updateDom(tasks);
    }
    else {
        noTasks.style.display = 'none';
        noMatches.style.display = 'block';
    }
}
const onSearch = () => {
    let tasks = getTasks();
    ulTasks.innerHTML = '';
    if (tasks && tasks.length > 0) {
        noMatches.style.display = 'none';
        updateDom(tasks);
    }
    else {
        noMatches.style.display = 'block';
        noTasks.style.display = 'none';
    }
}

const onEdit = (e) => {
    // scroll to edit form
    window.scroll({
        top: 0,
        behavior: 'auto'
    });

    let target = e.target;
    if (e.target.classList.contains('fa-pen-to-square')) {
        target = e.target.parentNode;
    }
    document.getElementById('deadline-edit').min = new Date().toISOString().split("T")[0];

    createForm.style.display = 'none';
    editForm.style.display = 'flex';

    const parent = target.parentNode.parentNode.parentNode;
    let taskName = parent.children[1].textContent;
    if (taskName.includes('Due to')) {
        taskName = taskName.split('Due to')[0].trim();
    }
    else {
        taskName = taskName.split('Completed on')[0].trim();
    }
    const taskDescription = parent.querySelector('.task-wrapper>.task-info').children[0].textContent.split('Description: ')[1];
    const taskPriority = parent.querySelector('.task-wrapper>.task-info').children[3].textContent.split('Priority: ')[1].toLowerCase();
    const taskDeadline = parent.querySelector('.task-wrapper>.task-info').children[2].textContent.split('Deadline: ')[1];
    editForm.querySelector('#edit-task').value = taskName;
    editForm.querySelector("#edit-description").value = taskDescription;
    editForm.querySelector("#deadline-edit").valueAsDate = new Date(taskDeadline);
    editForm.querySelector('#edit-priority').value = taskPriority;

    editData.task = taskName;
    editData.description = taskDescription;
    editData.deadline = new Date(taskDeadline);
    editData.priority = taskPriority;
}
const onCancelEdit = () => {
    createForm.style.display = 'flex';
    editForm.style.display = 'none';
}

const onFormSubmitEdit = (e) => {
    e.preventDefault();
    const taskName = editData.task;
    const data = Object.fromEntries(new FormData(e.target));

    // reset search form values
    resetSearchForm();

    if (data.task.trim() == "") {
        editForm.querySelector('#edit-task').value = "";
        alert('Task name is required!');
    }
    else {
        let tasks = getTasks();
        const selectedTask = tasks.find(x => x.task.trim() == taskName);
        data.status = 'incomplete';

        //update localStorage
        const taskIndex = tasks.indexOf(selectedTask);

        tasks[taskIndex] = data;
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // update DOM
        ulTasks.innerHTML = "";

        // get them again so to apply the original sorting of the new array with edited task
        tasks = getTasks();
        updateDom(tasks);

        //hide edit form & show create form
        createForm.style.display = 'flex';
        editForm.style.display = 'none';
        editForm.reset();
    }

}


const onDelete = (e) => {
    let target = e.target;

    // if we click on fontawesome icon 
    if (target.classList.contains('fa-trash')) {
        target = target.parentNode;
    }

    const parent = target.parentNode.parentNode.parentNode;
    const taskName = parent.children[1].textContent;

    const confirmation = confirm('Are you sure you want to delete this task?')
    if (confirmation) {

        // remove from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks'));
        const selectedTask = tasks.find(x => x.task == taskName);
        const taskIndex = tasks.indexOf(selectedTask);
        tasks.splice(taskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // remove from DOM
        parent.remove();
        if (tasks.length == 0) {
            noTasks.style.display = 'block';
        }

        // if we try to delete while editing
        if (editForm.style.display == 'flex') {
            editForm.style.display = 'none';
            editForm.reset();
            createForm.style.display = 'flex';
        }
    }
}
const onFormSubmitCreate = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    // reset search form values
    resetSearchForm();

    data.status = 'incomplete';

    let tasks = getTasks();
    data.task = data.task.trim();
    if (data.task == "") {
        createForm.querySelector('#task').value = "";
        alert('Task name is required!');
    }
    else if (tasks.some(x => x.task == data.task)) {
        alert('Such task exists');
    }
    else {
        const allTasks = [...tasks, data];
        localStorage.setItem('tasks', JSON.stringify(allTasks));
        ulTasks.innerHTML = "";
        // get them again so to apply the original sorting of the new array with the new task
        tasks = getTasks();

        updateDom(tasks);
        noTasks.style.display = 'none';
        noMatches.style.display = 'none';

        e.target.reset();
        dateCreateForm.valueAsDate = new Date();
    }
}

const onComplete = (e) => {
    const parent = e.target.parentNode.parentNode.parentNode;
    let taskLabel = parent.children[1];

    let tasks = getTasks();
    let taskName;
    if (taskLabel.textContent.includes('Due to')) {
        taskName = taskLabel.textContent.split('Due to:')[0].trim();
    }
    else {
        taskName = taskLabel.textContent.split('Completed on:')[0].trim();
    }
    let selectedTask = tasks.find(x => x.task == taskName);

    const status = parent.querySelector('.task-wrapper>.task-info').children[1].textContent.split('Status: ')[1];

    // update DOM
    if (status == 'Incomplete') {
        parent.querySelector('.task-wrapper>.task-info').children[1].innerHTML = 'Status: Completed<i class="fa-solid fa-check"></i>';
        parent.children[1].classList.add('completed-task');

        //set completed task with today's date
        taskLabel.querySelector('span').innerHTML = `Completed on: <i class="fa-solid fa-calendar-days"></i> ${new Date().toLocaleDateString("en-US")}`;
        taskLabel.querySelector('span>i').classList.add('completed-task');

        e.target.classList.add('completed');
        e.target.classList.remove('incomplete');
        e.target.textContent = 'Mark as incomplete';
        // remove fontawesome icon
        taskLabel.children[0].remove();
    }
    else {
        const taskText = document.createTextNode(taskName)

        taskLabel.innerHTML = `<i class="fa-solid fa-thumbtack"></i>`;
        taskLabel.appendChild(taskText);
        taskLabel.innerHTML += `
        <span class="label-deadline">
            Due to:
                <i class="fa-solid fa-calendar-days"></i>${new Date(selectedTask.deadline).toLocaleDateString("en-US")}
        </span>`;

        parent.children[1].classList.remove('completed-task');
        parent.querySelector('.task-wrapper>.task-info').children[1].textContent = 'Status: Incomplete';

        e.target.classList.add('incomplete');
        e.target.classList.remove('completed');
        e.target.textContent = 'Mark as complete';
    }

    // update localStorage
    if (selectedTask.status == 'incomplete') {
        selectedTask.status = 'completed';
        selectedTask.completedOn = new Date().toLocaleDateString();
    }
    else {
        selectedTask.status = 'incomplete';
    }
    const taskIndex = tasks.indexOf(selectedTask);
    tasks[taskIndex] = selectedTask;
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


