const fs = require('fs')
const xlsx = require('node-xlsx')

// helper function to make sure that a requested file will exist, even if empty
function writeIfDoesntExist(filePath) {
    if(!fs.existsSync(`./lists/${filePath}`)) {
        fs.writeFileSync(`./lists/${filePath}`, '', 'ascii')
    }
}
// load a JSON file into an array of question objects
function loadQuestionList(filePath) {
    writeIfDoesntExist(filePath)
    const data = JSON.parse(fs.readFileSync(`./lists/${filePath}`, 'ascii'))
    const questions = []
    data.forEach(q => questions.push(createQuestion(
        q.german, q.english, q.difficulty, q.weightGerman, q.weightEnglish, q.streakGerman, q.streakEnglish, q.reanswerTimeGerman, q.reanswerTimeEnglish, q.lastAnsweredGerman, q.lastAnsweredEnglish, q.locked
    )))
    return questions
}
// save a question array to JSON file
function saveQuestionList(filePath, questions) {
    fs.writeFileSync(`./lists/${filePath}`, JSON.stringify(questions, null, 4), 'ascii')
}
// read an excel table into an array of questions
function importFromExcel(filePath) {
    const spreadSheet = xlsx.parse(fs.readFileSync(`./lists/${filePath}.xlsx`));
    const questions = []
    spreadSheet[0].data.forEach(row => questions.push(createQuestion(getAnswersFromString(row[0]), getAnswersFromString(row[1]))))
    return questions
}
// returns all JSON files in the main lists directory
function getListNames() {
    return fs.readdirSync('./lists/').filter(list => list.endsWith('.json'))
}