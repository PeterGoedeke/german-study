const keys = Object.freeze({
    enter: 13,
    tab: 9,
    right: 37,
    up: 38,
    left: 39,
    down: 40,
    L: 76
})

// returns the percentage of a list of questions which have a weighting of 1 (e.g. which have been marked as learnt)
// for german, english, and overall
function getCompletionPercentage(questions) {
    const totals = questions.reduce((total, question) => {
        total.german += (question.weightGerman == COMPLETIONWEIGHT)
        total.english += (question.weightEnglish == COMPLETIONWEIGHT)
        total.both += (question.weightGerman == COMPLETIONWEIGHT)
        total.both += (question.weightEnglish == COMPLETIONWEIGHT)
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
        question.wrongGerman = 0
    }
    function refreshQuestionEnglish(question) {
        question.weightEnglish = DEFAULTWEIGHT
        question.lastAnsweredEnglish = 0
        question.streakEnglish = 0
        question.wrongEnglish = 0
    }
    // set all questions marked as answered which are ready for answering to the default weighting
    function refreshQuestionWeightings() {
        listQuestions.forEach(question => {
            if(question.lastAnsweredGerman + question.reanswerTimeGerman < Date.now() && question.weightGerman == COMPLETIONWEIGHT) {
                if(!question.locked && question.weightGerman == COMPLETIONWEIGHT) {
                    question.reanswerTimeGerman = getNextTime(question.reanswerTimeGerman)
                }
                refreshQuestionGerman(question)
            }
            if(question.lastAnsweredEnglish + question.reanswerTimeEnglish < Date.now() && question.weightEnglish == COMPLETIONWEIGHT) {
                if(!question.locked && question.weightEnglish == COMPLETIONWEIGHT) {
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
        // allow the question to be focused so that it can be easily copied to another list
        element.addEventListener('contextmenu', e => {
            focusElement(element, question)
        })

        // display how many times the user has answered the question wrong since the last refresh
        const wrongCounter = document.createElement('div')
        wrongCounter.className = 'wrongCounter'
        wrongCounter.textContent = (testingGerman ? question.wrongGerman : question.wrongEnglish) || ''
        if(testingVariable) wrongCounter.textContent = ''
        element.appendChild(wrongCounter)

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

        if(testingGerman && question.weightGerman != COMPLETIONWEIGHT) element.style.backgroundColor = '#faf8ca' // pale yellow
        else if(!testingGerman && question.weightEnglish != COMPLETIONWEIGHT) element.style.backgroundColor = '#faf8ca' // pale yellow
        else element.style.backgroundColor = '#cffcdb' // pale green

        if(testingVariable) {
            element.style.backgroundColor = 'white'
            german.style.backgroundColor = (question.weightGerman != COMPLETIONWEIGHT ? '#faf8ca' : '#cffcdb')
            english.style.backgroundColor = (question.weightEnglish != COMPLETIONWEIGHT ? '#faf8ca' : '#cffcdb')
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
                questionsSubPane.insertBefore(getQuestionElement(question), questionsSubPane.firstChild)
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
        listHandler.updateDisplay(false)
        saveQuestionList(listName, listQuestions)
    })
    findDuplicatesButton.addEventListener('click', () => {
        const seenGerman = {}
        const seenEnglish = {}
        const duplicateQuestions = []
        console.log(listQuestions.length)
        listQuestions.forEach(question => {
            for(const value of question.german) seenGerman[value] = (seenGerman[value] + 1 || 1)
            for(const value of question.english) {
                seenEnglish[value] = (seenEnglish[value] + 1 || 1)
            }
        })
        console.log(seenEnglish)
        for(let i = listQuestions.length - 1; i >= 0; i--) {
            for(const value of listQuestions[i].german) {
                if(seenGerman[value] > 1) {
                    // if(listQuestions[i] == undefined) console.log(i, listQuestions)
                    duplicateQuestions.push(listQuestions.splice(i, 1)[0])
                    continue
                }
            }
            if(listQuestions[i]) {
                for(const value of listQuestions[i].english) if(seenEnglish[value] > 1) {
                    duplicateQuestions.push(listQuestions.splice(i, 1)[0])
                    continue
                }
            }
        }
        console.log(duplicateQuestions)
        listQuestions.unshift(...duplicateQuestions)
        console.log(listQuestions.length, listQuestions)

        // let indices = []
        // // gather the indices at which questions with duplicate text exist
        // for(let i = listQuestions.length - 1; i >= 1; i--) {
        //     const questions = []
        //     let wasSame = false
        //     for(let j = i - 1; j >= 0; j--) {
        //         // const englishIsSame = listQuestions[i].english.join(', ') == listQuestions[j].english.join(', ')
        //         // const germanIsSame = listQuestions[i].german.join(', ') == listQuestions[j].german.join(', ')
        //         let isSame = false
        //         listQuestions[i].english.forEach(e => {
        //             if(listQuestions[j].english.includes(e)) {
        //                 wasSame = isSame = true
        //                 console.log(listQuestions[i], listQuestions[j])
        //             }
        //         })
        //         listQuestions[i].german.forEach(e => {
        //             if(listQuestions[j].german.includes(e)) {
        //                 wasSame = isSame = true
        //                 console.log(listQuestions[i], e)
        //             }
        //         })
        //         if(isSame) questions.push(listQuestions.slice(j, 1))

        //         // for(let k = 0; k < listQuestions[i].english.length; k++) {
        //         //     if(sanitise(listQuestions[j].english).includes(sanitise(listQuestions[i].english[k]))
        //         //     || sanitise(listQuestions[j].german).includes(sanitise(listQuestions[i].german[k]))) {
        //         //         isSame = true
        //         //         console.log(listQuestions[j].english, listQuestions[i].english[k])
        //         //         break
        //         //     }
        //         // }

        //     }
        //     if(wasSame) {
        //         questions.push(listQuestions.slice(i, 1))

        //     }
        // }
        // // move all of these questions to the front of the list
        // indices = removeDuplicates(indices).sort()
        // indices.forEach(index => {
        //     const x = listQuestions.splice(index, 1)[0]
        //     listQuestions.unshift(x)
        // })


        listHandler.updateDisplay(false)
        // add a separator after the recently shifted elements to make the distinction clear
        const separator = document.createElement('div')
        separator.className = 'questionPreview'
        questionsSubPane.insertBefore(separator, document.querySelectorAll('.questionPreview')[duplicateQuestions.length])
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
        updateDisplay(sort = true) {
            const totals = getCompletionPercentage(listQuestions)
            germanButton.textContent = totals.german
            englishButton.textContent = totals.english
            variableButton.textContent = totals.both
            refreshQuestionWeightings()

            // add question previews with those which have been answered wrong the most being placed first
            while(questionsSubPane.firstChild) questionsSubPane.removeChild(questionsSubPane.firstChild)

            if(sort) {
                let sortedListQuestions
                if(testingVariable) sortedListQuestions = listQuestions
                else if(testingGerman) sortedListQuestions = listQuestions.sort((a, b) => b.wrongGerman - a.wrongGerman)
                else sortedListQuestions = listQuestions.sort((a, b) => b.wrongEnglish - a.wrongEnglish)  
                sortedListQuestions.forEach(question => {
                    questionsSubPane.appendChild(getQuestionElement(question))
                })
            }
            else {
                listQuestions.forEach(question => {
                    questionsSubPane.appendChild(getQuestionElement(question))
                })
            }
        },
        get path() {
            return listName
        }
    }
})()