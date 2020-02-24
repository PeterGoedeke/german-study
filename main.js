const keys = Object.freeze({
    enter: 13,
    tab: 9,
    left: 37,
    right: 39
})

// turns an element into an input and calls a callback when the element is unfocused or enter is pressed
function inputify(element, cb, element2, cb2, setText = true) {
    let input = document.createElement('input')
    if(setText) input.value = element.textContent
    element.textContent = ''
    element.classList.add('activeInput')
    element.appendChild(input)
    
    function callCb() {
        element.classList.remove('activeInput')
        input.removeEventListener('keypress', callCbEnter)
        cb(input.value)
    }
    function callCbEnter() {
        if(event.which == keys.enter) {
            element.classList.remove('activeInput')
            input.removeEventListener('blur', callCb)
            cb(input.value)
        }
        else if(element2 && (event.which == keys.tab || event.which == keys.left || event.which == keys.right)) {
            inputify(element2, cb2, element, cb, setText)
        }
    }

    input.addEventListener('blur', callCb)
    input.addEventListener('keydown', callCbEnter)
    input.addEventListener('click', event => event.stopImmediatePropagation())

    setTimeout(() => {
        input.focus()
        input.select()
    }, 0)
}
// convert a string into an array of possible answers
function getAnswersFromString(str) {
    return str.split(';').map(e => e.trim())
}


// returns the percentage of a list of questions which have a weighting of 1 (e.g. which have been marked as learnt)
// for german, english, and overall
function getCompletionPercentage(questions) {
    const totals = questions.reduce((total, question) => {
        total.german += (question.weightGerman == 1)
        total.english += (question.weightEnglish == 1)
        total.both += (question.weightGerman == 1)
        total.both += (question.weightEnglish == 1)
        return total
    }, { german: 0, english: 0, both: 0 }) 
    
    totals.german = 'German: ' + Math.round(totals.german / questions.length * 100) + '%'
    totals.english = 'English: ' + Math.round(totals.english / questions.length * 100) + '%'
    totals.both = 'Overall: ' + Math.round(totals.both / (questions.length * 2) * 100) + '%'
    return totals
}

const listHandler = (function() {
    // variables to pass to the quiz mainLoop when start buton clicked
    let listQuestions = []
    let listName
    let testingGerman = true
    let testingVariable = false
    // adding event listeners to allow for setting of said varaibles by user
    const germanButton = document.querySelector('.selectGerman')
    const englishButton = document.querySelector('.selectEnglish')
    const variableButton = document.querySelector('.selectVariable')
    germanButton.addEventListener('click', () => setSelected(germanButton, true, false))
    englishButton.addEventListener('click', () => setSelected(englishButton, false, false))
    variableButton.addEventListener('click', () => setSelected(variableButton, true, true))
    // helper function to change selection modes
    function setSelected(element, mode, variable) {
        germanButton.classList.remove('selected')
        englishButton.classList.remove('selected')
        variableButton.classList.remove('selected')

        element.classList.add('selected')
        testingGerman = mode
        testingVariable = variable
        
        listHandler.updateDisplay()
    }

    // setup the start quiz buton
    const startQuizButton = document.querySelector('.sbStart')
    startQuizButton.addEventListener('click', enterQuizMode)

    function enterQuizMode() {
        panes.quiz()
        // pass in the user's selected quiz-mode variables and start the mainLoop
        it = getIterator(listQuestions, testingGerman, testingVariable)
        it.next()
    }

    // functions to set a question's german or english status to ready to answer
    function refreshQuestionGerman(question) {
        question.weightGerman = DEFAULTWEIGHT
        question.lastAnsweredGerman = 0
        question.streakGerman = 0
    }
    function refreshQuestionEnglish(question) {
        question.weightEnglish = DEFAULTWEIGHT
        question.lastAnsweredEnglish = 0
        question.streakEnglish = 0
    }
    // set all questions marked as answered which are ready for answering to the default weighting
    function refreshQuestionWeightings() {
        listQuestions.forEach(question => {
            if(question.lastAnsweredGerman + question.reanswerTimeGerman < Date.now()) {
                if(!question.locked && question.weightGerman == 1) {
                    question.reanswerTimeGerman = getNextTime(question.reanswerTimeGerman)
                }
                refreshQuestionGerman(question)
            }
            if(question.lastAnsweredEnglish + question.reanswerTimeEnglish < Date.now()) {
                if(!question.locked && question.weightEnglish == 1) {
                    question.reanswerTimeEnglish = getNextTime(question.reanswerTimeEnglish)
                }
                refreshQuestionEnglish(question)
            }
        })
        saveQuestionList(listName, listQuestions)
    }

    // when one of the arrows is clicked to increase or decrease the time between question answerings, change the display and the
    // question appropriately
    function arrowClicked(up, question, intervalDisplay) {
        const argument = testingGerman ? question.reanswerTimeGerman : question.reanswerTimeEnglish
        const val = (up ? getNextTime(argument) : getPreviousTime(argument)) 
        if(testingGerman) {
            question.reanswerTimeGerman = val
            refreshQuestionGerman(question)
        }
        else {
            question.reanswerTimeEnglish = val
            refreshQuestionEnglish(question)
        }
        intervalDisplay.textContent = getTimeLabel(val)
        saveQuestionList(listName, listQuestions)
    }

    // returns a question preview element which contains the tools to edit how often the question should be reasked, whether it should be locked, and which contains the german and the english text of the question
    function getQuestionElement(question) {
        const element = document.createElement('div')
        element.className = 'questionPreview'

        // append the text elements representing the german and english text of the question
        const german = document.createElement('div')
        german.className = 'questionText'
        german.textContent = question.german.join(', ')
        element.appendChild(german)
        
        const english = document.createElement('div')
        english.className = 'questionText'
        english.textContent = question.english.join(', ')
        element.appendChild(english)

        // add event listeners onto the german and english text to allow for the changing of the text values
        german.addEventListener('click', () => {
            german.textContent = question.german.join('; ') // change the text content so that the input value is separated by semicolons
            inputify(german, changeGerman, english, changeEnglish)
        })
        english.addEventListener('click', () => {
            english.textContent = question.english.join('; ') // change the text content so that the input value is separated by semicolons
            inputify(english, changeEnglish, german, changeGerman)
        })
        // helper functions to change the value of the english or german text when the user has finished their input
        function changeGerman(value) {
            question.german = getAnswersFromString(value)
            german.textContent = question.german.join(', ')
            saveQuestionList(listName, listQuestions)
        }
        function changeEnglish(value) {
            question.english = getAnswersFromString(value)
            english.textContent = question.english.join(', ')
            saveQuestionList(listName, listQuestions)
        }

        // do not append the reanswer time controls when testing variable, as there are separate values for english and german
        if(!testingVariable) {
            const upArrow = document.createElement('div')
            upArrow.className = 'arrow'
            upArrow.addEventListener('click', e => {
                arrowClicked(true, question, intervalDisplay)
            })
            const intervalDisplay = document.createElement('div')
            intervalDisplay.className = 'intervalDisplay'
            intervalDisplay.textContent = (testingGerman ? getTimeLabel(question.reanswerTimeGerman) : getTimeLabel(question.reanswerTimeEnglish))
            const downArrow = document.createElement('div')
            downArrow.className = 'arrow'
            downArrow.addEventListener('click', e => {
                arrowClicked(false, question, intervalDisplay)
            })
            element.appendChild(upArrow)
            element.appendChild(intervalDisplay)
            element.appendChild(downArrow)
        }
        // append the lock button which is able to be toggled on click, changing the locked status of the question
        const lock = document.createElement('div')
        lock.className = 'lock'
        if(question.locked) lock.classList.add('isLocked')
        lock.addEventListener('click', () => {
            question.locked = !question.locked
            lock.classList.toggle('isLocked')
            saveQuestionList(listName, listQuestions)
        })
        element.appendChild(lock)
        
        // append the delete button which can be clicked to remove the respective question from the list entirely
        const deleteButton = document.createElement('div')
        deleteButton.className = 'delete'
        deleteButton.addEventListener('click', () => {
            listQuestions.splice(listQuestions.indexOf(question), 1)
            saveQuestionList(listName, listQuestions)
            listHandler.updateDisplay()
        })
        element.appendChild(deleteButton)

        if(testingGerman && question.weightGerman != 1) element.style.backgroundColor = '#faf8ca' // pale yellow
        else if(!testingGerman && question.weightEnglish != 1) element.style.backgroundColor = '#faf8ca' // pale yellow
        else element.style.backgroundColor = '#cffcdb' // pale green

        if(testingVariable) {
            element.style.backgroundColor = 'white'
            german.style.backgroundColor = (question.weightGerman != 1 ? '#faf8ca' : '#cffcdb')
            english.style.backgroundColor = (question.weightEnglish != 1 ? '#faf8ca' : '#cffcdb')
        }

        return element
    }

    // set up the header inputs to be able to add new questions
    const germanInput = document.querySelector('.setGerman > input')
    const englishInput = document.querySelector('.setEnglish > input')
    germanInput.addEventListener('keydown', event => keypressHeaderInputs(event, englishInput))
    englishInput.addEventListener('keydown', event => keypressHeaderInputs(event, germanInput))
    // function to run the header inputs
    function keypressHeaderInputs(event, other) {
        if(event.which == keys.enter) {
            // if valid, create a new question, add it to the list, and refresh the display
            if(germanInput.value && englishInput.value) {
                const question = createQuestion(getAnswersFromString(germanInput.value), getAnswersFromString(englishInput.value))
                listQuestions.unshift(question)
                listHandler.updateDisplay()
                saveQuestionList(listName, listQuestions)
                germanInput.value = ''
                englishInput.value = ''
                
                germanInput.focus()
                germanInput.select()
            }
        }
    }

    // setting up the file management buttons so that the user is able to duplicate, delete, lock, and rename their list
    const deleteListButton = document.querySelector('.deleteList')
    const duplicateListButton = document.querySelector('.duplicateList')
    const renameButton = document.querySelector('.renameList')
    const lockButton = document.querySelector('.lockList')
    const findDuplicatesButton = document.querySelector('.findDuplicates')
    deleteListButton.addEventListener('dblclick', () => {
        deleteList(listName)
        panes.back()
    })
    duplicateListButton.addEventListener('click', () => {
        duplicateList(listName, listName.slice(0, -5) + ' - copy.json')
        panes.back() 
    })
    renameButton.addEventListener('click', () => {
        inputify(renameButton, value => {
            const succeeded = renameList(listName, value + '.json')
            renameButton.textContent = 'Rename'
            listName = value + '.json'
        }, false, false, false)
    })
    let lockClicked = false
    lockButton.addEventListener('click', () => {
        lockClicked = !lockClicked
        listQuestions.forEach(question => question.locked = lockClicked)
        listHandler.updateDisplay()
        saveQuestionList(listName, listQuestions)
    })
    findDuplicatesButton.addEventListener('click', () => {
        let indices = []
        // gather the indices at which questions with duplicate text exist
        for(let i = 0; i < listQuestions.length - 1; i++) {
            for(let j = i + 1; j < listQuestions.length; j++) {
                const englishIsSame = listQuestions[i].english.join(', ') == listQuestions[j].english.join(', ')
                const germanIsSame = listQuestions[i].german.join(', ') == listQuestions[j].german.join(', ')
                
                if(englishIsSame || germanIsSame) {
                    indices.unshift(i, j)
                }
            }
        }
        // move all of these questions to the front of the list
        indices = removeDuplicates(indices)
        indices.forEach(index => {
            const question = listQuestions.splice(index, 1)[0]
            listQuestions.unshift(question)
        })
        listHandler.updateDisplay()
        // add a separator after the recently shifted elements to make the distinction clear
        const separator = document.createElement('div')
        separator.className = 'questionPreview'
        questionsSubPane.insertBefore(separator, document.querySelectorAll('.questionPreview')[indices.length])
    })


    const questionsSubPane = document.querySelector('.questions')

    return {
        // allows the list of questions to be set by the pane handler when the active pane changes to the list preview pane
        assignList(questions, list) {
            listQuestions = questions
            listName = list
            // saveQuestionList('questions.json', questions)
        },
        // sets the percentage learned icon to its appropriate value and show a preview of the questions
        updateDisplay() {
            const listPreviewHeaderSubPane = document.querySelector('.sbHeader')
            const totals = getCompletionPercentage(listQuestions)
            germanButton.textContent = totals.german
            englishButton.textContent = totals.english
            variableButton.textContent = totals.both
            refreshQuestionWeightings()

            // add question previews
            while(questionsSubPane.firstChild) questionsSubPane.removeChild(questionsSubPane.firstChild)
            listQuestions.forEach(question => {
                questionsSubPane.appendChild(getQuestionElement(question))
            })
        },
        get path() {
            return listName
        }
    }
})()

const panes = (function() {
    // sets up the back button
    let currentPane
    const backButton = document.querySelector('.back')
    backButton.addEventListener('click', () => panes.back())

    // stores the three main panes and important descendents
    const menuPane = document.querySelector('.menuContainer')
    const listPreviewPane = document.querySelector('.listPreviewContainer')
    const quizPane = document.querySelector('.quizContainer')

    // setup the new list button
    const newListButton = document.querySelector('.newList')
    newListButton.addEventListener('click', () => {
        saveQuestionList('new.json', [], true) // this only works if the new.json file does not exist
        populateMenu()
    })

    const listsSubPane = menuPane.querySelector('.lists')
    // changes the view of the application betwen the menu, list preview, and quiz panes
    function swapMenuPanes(menu, list, quiz) {
        menuPane.style.display = (menu ? 'grid' : 'none')
        listPreviewPane.style.display = (list ? 'grid' : 'none')
        quizPane.style.display = (quiz ? 'grid' : 'none')
    }

    // creates a button for the menu pane corresponding to a question list; clicking navigates to the list preview for the respective list
    function createListButton(list) {
        const element = document.createElement('div')
        element.className = 'list'
        element.textContent = list.slice(0, -5) // remove .json ending from text
        element.addEventListener('click', e => {
            panes.listPreview(list)
        })
        return element
    }
    // populates the lists sub pane of the menu with a button for each question list
    function populateMenu() {
        // ensure that lists don't duplicate each time the user navigates to the menu pane
        while(listsSubPane.firstChild) listsSubPane.removeChild(listsSubPane.firstChild)

        const lists = getListNames()
        lists.forEach(list => {
            const element = createListButton(list)
            listsSubPane.appendChild(element)
        })
    }
    return {
        // return helper functions which call the swapMenuPanes function with the appropriate arguments
        menu() {
            currentPane = 'menu'
            backButton.style.display = 'none'

            populateMenu()
            swapMenuPanes(true, false, false)
        },
        listPreview(list) {
            currentPane = 'list'
            backButton.style.display = 'block'

            swapMenuPanes(false, true, false)
            // pass relevant information to the listHandler if there is information to pass
            // if nothing is passed the listHandler will still contain the information from last time
            // nothing is passed when the back button is pressed
            if(list) {
                const questions = loadQuestionList(list)
                listHandler.assignList(questions, list)
            }
            listHandler.updateDisplay()
        },
        quiz() {
            currentPane = 'quiz'
            backButton.style.display = 'block'

            swapMenuPanes(false, false, true)
        },
        // navigates backwards one pane
        back() {
            if(currentPane == 'quiz') {
                this.listPreview()
            }
            else if(currentPane == 'list') {
                this.menu()
            }
        }
    }
})()
// the default pane upon opening the application is the menu pane
panes.menu()

// helper function to remove duplicate elements from an array
function removeDuplicates(a) {
    const seen = {}
    return a.filter(item => seen.hasOwnProperty(item) ? false : (seen[item] = true))
}