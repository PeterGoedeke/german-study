
let destListNames = [] 
const cache = {}
// helper function to add a question into a given list
function copyQuestion(question, i) {
    if(!destListNames[i]) {
        floatText(`No list at hotkey ${i}`, 'lightgreen')
        return
    }
    // retrieve the list of questions from the cache if possible, otherwise load it and store it in the cache
    const questions = cache[destListNames[i]] || (cache[destListNames[i]] = loadQuestionList(destListNames[i]))
    questions.unshift(question)
    saveQuestionList(destListNames[i], questions)
    floatText(`Question copied to ${destListNames[i]}`, 'lightgreen')
}

// object to contain information about what element and object should currently be effected by the focus utilities
let focused = {element: undefined, object: undefined}
// change the focus from one element and object to another set
function focusElement(element, object) {
    if(focused.element) focused.element.classList.remove('focused')
    element.classList.add('focused')
    focused = {element, object}
}
// remove focus from the currently focused element and object if another element is clicked
document.body.addEventListener('click', e => {
    if(focused.element && e.target !== focused.element) {
        focused.element.classList.remove('focused')
        focused = {}
    }
})
// whenever a key is pressed, check to see whether an action should be taken on the focused object
document.body.addEventListener('keyup', e => {
    const num = e.which - 48 // get the number pressed from the unicode

    if(focused.object) {
        if(num >= 0 && num <= 10) { // if the key is one of the number row keys
            const listElementFocused = typeof focused.object == 'string'
            const questionFocused = typeof focused.object == 'object' && (focused.element || e.ctrlKey)
            if(listElementFocused) { 
                // set the respective list to the pressed hotkey for question copying
                destListNames[num] = focused.object
                floatText(`Ctrl ${num}: ${focused.object}`, 'lightgreen')
            }
            else if(questionFocused) {
                // copy the question to the list corresponding to the hotkey pressed
                copyQuestion(focused.object, num)
            }
        }
        // if the user pressed the combination Ctrl + L in the quiz pane
        else if(typeof focused.object == 'object' && !focused.element && e.ctrlKey && e.which == keys.L) {
            // toggle the lock status of the current question
            floatText(`Question ${focused.object.locked ? 'unlocked' : 'locked'}`, 'lightgreen')
            focused.object.locked = !focused.object.locked
        }
    }
})