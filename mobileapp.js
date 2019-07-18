// DOM Elements
const HEADER = document.querySelector("header");
const header_COLOR = getComputedStyle(document.documentElement).getPropertyValue("--header-color");
const highlight_COLOR = getComputedStyle(document.documentElement).getPropertyValue("--highlight-color");
const secondaryHighlight_COLOR = getComputedStyle(document.documentElement).getPropertyValue("--secondary-highlight-color");
const task_LIST = document.getElementById("task-list");
const task_INPUT = document.getElementById("task-input");
const task_FORM = document.getElementById("task-form");

const xImage = "https://img.icons8.com/ios-filled/20/000000/x.png";
//Variables
let headerHighlight = false;
let draggedTask = null;
let cloneTask = null;
let isDragging = false;

// Add event listeners to DOM elements
function main(){
    addFormInputEventListeners();    
}

// Adds event listeners to handle the text box
function addFormInputEventListeners(){
    task_FORM.addEventListener("submit", addTask);
    task_FORM.addEventListener("keypress", function(event){
        submitOnEnter(event)});
    task_INPUT.addEventListener("focus", function(event){
        if(!headerHighlight){
            changeHeaderColor();}
    })
    task_INPUT.addEventListener("blur", function(event){
        if(headerHighlight){
            changeHeaderColor();
        }
    })
}

// Get text input for new task and append task to the ul.
function addTask(){
    let taskText = task_INPUT.innerHTML;
    task_INPUT.innerHTML = "";
    task_INPUT.blur();
    if(taskText != ""){
        let newTask = createTaskObject(taskText);
        task_LIST.appendChild(newTask);
        addTaskEventListeners(newTask);   
    }     
}

// Listen for enter in form
function submitOnEnter(event){
    if(event.which === 13){
        event.target.parentNode.dispatchEvent(new Event("submit", {cancelable: true}));
       // event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
        event.preventDefault();
    }
}

// Generate new task object with desired text value;
function createTaskObject(text){
    // Create new Task
    let newTask = document.createElement("li");
    // Append new image to the task (in a span)
    imgspan = createImageSpan();
    // Filter and add task's text
    newTask.innerHTML = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    newTask.className = "task";
    newTask.draggable = "true";
    newTask.append(imgspan);
    return newTask;
}

// Create a span with a X image to be used in a new task
function createImageSpan(){
    let imgspan = document.createElement("span");
    let image = document.createElement("img");
    image.src = xImage;
    image.draggable = false;
    image.className = "image";    
    imgspan.append(image);
    imgspan.draggable = false;
    imgspan.className = "imagespan";
    imgspan.style.position = "absolute";
    imgspan.style.left = "-30px";
    return imgspan;
}

// Add Event listeners to new Task to allow drag and drop
function addTaskEventListeners(task){
    task.addEventListener("touchstart", function(event){
        if(event.target.className != "image" && event.target.className != "imagespan" && event.target.className == "task"){
            draggedTask = event.target;
            if(headerHighlight){
                changeHeaderColor();
            }            
            swapTaskStyle("start",event);
            startDragObject(event);
            isDragging = true;
        }
        else{return false;}
    });

    task.addEventListener("touchmove", function(event){
        if(isDragging){
        dragObject(event);
    }});
    
    task.addEventListener("touchend", function(event){
        var changedTouchItem = event.changedTouches.item(0);
        var elemFromPoint = document.elementsFromPoint(changedTouchItem.pageX, changedTouchItem.pageY)[1];
        console.log(elemFromPoint);
        swapTaskStyle("end", event);
        task_LIST.removeChild(cloneTask);
        if(elemFromPoint.className=="task" && elemFromPoint.className != "image" && elemFromPoint.className != "imagespan"){
            draggedTask.borderColor = highlight_COLOR;
            console.log(elemFromPoint.className);
            swapTasks(elemFromPoint); 
        }
        
    })
}

function swapTaskStyle(string, event) {
    if(string  == "enter"){
        event.target.style.borderColor = secondaryHighlight_COLOR;
        event.target.style.borderStyle = "dotted";
    }
    else if(string == "leave"){
        event.target.style.borderColor = highlight_COLOR;
        event.target.style.borderStyle = "solid";
    }
    else if(string == "end"){
        draggedTask.style.borderColor = highlight_COLOR;
        isDragging = false;
        event.target.style.opacity = 1.0;
    }
    else if(string == "start"){
        event.target.style.borderColor = secondaryHighlight_COLOR;
    }
}

// Action that executes when drag starts
function startDragObject(event){
    cloneTask = event.target.cloneNode(true); 
    event.target.style.opacity = "0.5";
    cloneTask.className = "draggableTask";
    cloneTask.style.position = "absolute";
    cloneTask.style.visibility = "hidden";
    // Remove cloneTask's X image and appends the task to the list
    cloneTask.removeChild(cloneTask.childNodes[1]);
    task_LIST.appendChild(cloneTask);
    // Change cloneTask position
    cloneTask.style.left = "5%";
    cloneTask.style.right = "0%";
    cloneTask.style.maxWidth = "95%";
    cloneTask.style.top = event.pageY;   
}

function dragObject(event){
    offset = -210;
    var elem = event.changedTouches.item(0);
    cloneTask.style.top = (elem.pageY+offset) + "px";
    cloneTask.style.visibility = "visible"; 
}

// Swap two tasks upon drop
function swapTasks(targetTask){
    // Clone the tasks to be swapped
    draggedTaskClone = draggedTask.cloneNode(true);
    targetTaskClone = targetTask.cloneNode(true);
    // Assign event listeners to the clones
    addTaskEventListeners(draggedTaskClone);
    addTaskEventListeners(targetTaskClone);
    // Reset Style
    draggedTaskClone.style.borderColor = highlight_COLOR;
    draggedTaskClone.style.opacity = "1.0";
    targetTaskClone.style.borderColor = highlight_COLOR;
    targetTaskClone.style.borderStyle = "solid";
    // Swap
    targetTask.parentNode.replaceChild(draggedTaskClone,targetTask);
    draggedTask.parentNode.replaceChild(targetTaskClone,draggedTask);    
}

// Change header background and font color upon entering text input
function changeHeaderColor(){
    if(!headerHighlight){
        HEADER.style.backgroundColor = highlight_COLOR;
        HEADER.style.color = header_COLOR;
        task_INPUT.style.borderColor = highlight_COLOR;
        headerHighlight = true;
        console.log("highlighting");
    }
    else{
        HEADER.style.backgroundColor = header_COLOR;
        HEADER.style.color = highlight_COLOR;
        task_INPUT.style.borderColor = header_COLOR;
        headerHighlight = false;
        console.log("bluring");
    }    
}

function verifyDragOver(event){
    var changedTouch = event.changedTouches.item(0);
    var elem = document.elementFromPoint(changedTouch.pageX, changedTouch.pageY);
    elem.style.backgroundColor = "#FF00FF";
}

main();