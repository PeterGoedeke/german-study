const fs = require('fs')
const xlsx = require('node-xlsx')

function writeIfDoesntExist(filePath) {
    if(!fs.existsSync(`./lists/${filePath}.json`)) {
        fs.writeFileSync(`./lists/${filePath}.json`, '', 'ascii')
    }
}
function loadQuestionList(filePath) {
    writeIfDoesntExist(filePath)
    const data = JSON.parse(fs.readFileSync(`./lists/${filePath}`, 'ascii'))
    const questions = []
    data.forEach(q => questions.push(createQuestion(
        q.german, q.english, q.difficulty, q.weightGerman, q.weightEnglish, q.streakGerman, q.streakEnglish
    )))
    return questions
}
function saveQuestionList(filePath, questions) {
    fs.writeFileSync(`./lists/${filePath}.json`, JSON.stringify(questions, null, 4), 'ascii')
}

function getCompletionPercentage(questions) {
    return questions.reduce((total, question) => total += (question.weighting == 1), 0) / questions.length * 100 + '%'
}

function importFromExcel(filePath) {
    const spreadSheet = xlsx.parse(fs.readFileSync(`./lists/${filePath}.xlsx`));
    const questions = []
    spreadSheet[0].data.forEach(row => questions.push(createQuestion(row[0], row[1])))
    return questions
}

const display = (function() {
    const menuCont = document.querySelector('.menuContainer')
    const listPreviewCont = document.querySelector('.listPreviewContainer')
    const quizCont = document.querySelector('.quizContainer')

    function setDisplays(menu, list, quiz) {
        menuCont.style.display = (menu ? 'grid' : 'none')
        listPreviewCont.style.display = (list ? 'grid' : 'none')
        quizCont.style.display = (quiz ? 'grid' : 'none')
    }
    const menu = () => setDisplays(true, false, false)
    const listPreview = () => setDisplays(false, true, false)
    const quiz = () => setDisplays(false, false, true)

    const createListElement = function() {
        const element = document.createElement('div')
        element.className = 'list'
        const german = document.createElement('div')
        german.className = 'german'
        german.textContent = 'G'
        const english = document.createElement('div')
        english.className = 'english'
        english.textContent = 'E'
        const variable = document.createElement('div')
        variable.className = 'variable'
        variable.textContent = 'V'

        element.appendChild(german)
        element.appendChild(english)
        element.appendChild(variable)

        return [element, german, english, variable]
    }

    function listClicked(list, testingGerman, testingVariable) {
        quiz()
        it = getIterator(loadQuestionList(list), testingGerman, testingVariable)
        it.next()
    }

    function displayLists() {
        const lists = fs.readdirSync('./lists/')

        lists.filter(list => list.endsWith('.json'))
        lists.forEach(list => {
            const elements = createListElement()
            const element = elements[0]
            element.appendChild(document.createTextNode(list.slice(0, -5)))
            elements[1].addEventListener('click', e => {
                listClicked(list, true, false)
            })
            elements[2].addEventListener('click', e => {
                listClicked(list, false, false)
            })
            elements[3].addEventListener('click', e => {
                listClicked(list, true, true)
            })
            menuCont.querySelector('.lists').appendChild(element)
        })
    }
    displayLists()

    return {
        menu, listPreview, quiz
    }
})()