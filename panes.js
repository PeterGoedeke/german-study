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
        element.addEventListener('contextmenu', e => {
            focusElement(element, list)
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