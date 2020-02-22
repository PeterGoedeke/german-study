const fs = require('fs')
const xlsx = require('node-xlsx')

function writeIfDoesntExist(filePath) {
    if(!fs.existsSync(`./${filePath}.json`)) {
        fs.writeFileSync(`./${filePath}.json`, '', 'ascii')
    }
}
function loadQuestionList(filePath) {
    writeIfDoesntExist(filePath)
    const data = JSON.parse(fs.readFileSync(`./${filePath}.json`, 'ascii'))
    const questions = []
    data.forEach(q => questions.push(createQuestion(
        q.german, q.english, q.difficulty, q.weightGerman, q.weightEnglish, q.streakGerman, q.streakEnglish
    )))
    return questions
}
function saveQuestionList(filePath, questions) {
    fs.writeFileSync(`./${filePath}.json`, JSON.stringify(questions, null, 4), 'ascii')
}

function getCompletionPercentage(questions) {
    return questions.reduce((total, question) => total += (question.weighting == 1), 0) / questions.length * 100 + '%'
}

function importFromExcel(filePath) {
    const spreadSheet = xlsx.parse(fs.readFileSync(`./${filePath}.xlsx`));
    const questions = []
    spreadSheet[0].data.forEach(row => questions.push(createQuestion(row[0], row[1])))
    return questions
}

const display = (function() {
    const menuCont = document.querySelector('.menuContainer')
    const listPreviewCont = document.querySelector('.listPreviewContainer')
    const quizCont = document.querySelector('.quizContainer')

    return {
        menu() {

        },
        listPreview() {

        },
        quiz() {
            menuCont.style.display = 'none'
            listPreviewCont.style.display = 'none'
            quizCont.style.display = 'grid'
        }
    }
})()
display.quiz()

saveQuestionList('questions2', [createQuestion(['test'], ['test2']), createQuestion(['test'], ['test2']), createQuestion(['test'], ['test2'])])

const questions = loadQuestionList('questions')
let it = getIterator(questions)
it.next()
