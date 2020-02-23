// returns the percentage of a list of questions which have a weighting of 1 (e.g. which have been marked as learnt)
function getCompletionPercentage(questions) {
    return questions.reduce((total, question) => total += (question.weighting == 1), 0) / questions.length * 100 + '%'
}

const listPreviewHandler = (function() {
    // variables to pass to the quiz mainLoop when start buton clicked
    let listQuestions = []
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
    return {
        // allows the list of questions to be set by the pane handler when the active pane changes to the list preview pane
        assignList(questions) {
            listQuestions = questions
            this.updatePercentage()
        },
        // sets the percentage learned icon to its appropriate value
        updatePercentage() {
            const listPreviewHeaderSubPane = document.querySelector('.sbHeader')
            listPreviewHeaderSubPane.textContent = getCompletionPercentage(listQuestions)
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
            // pass relevant information to the listPreviewHandler if there is information to pass
            // if nothing is passed the listPreviewHandler will still contain the information from last time
            // nothing is passed when the back button is pressed
            if(list) {
                const questions = loadQuestionList(list)
                listPreviewHandler.assignList(questions)
            }
            listPreviewHandler.updatePercentage()
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