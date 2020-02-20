const times = Object.freeze({
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    fortnight: 1000 * 60 * 60 * 24 * 7 * 2,
    month: 1000 * 60 * 60 * 24 * 7 * 2 * 2,
})

function output(text) {
    const display = document.querySelector('.output')
    display.textContent = text
}
function applyInputVisual(text, colorFlashColor) {
    input.placeholder = text
    if(colorFlashColor) {
        input.style.backgroundColor = colorFlashColor
        setTimeout(() => {
            input.style.backgroundColor = 'white'
        }, 250)
    }
}

const input = document.querySelector('.input')
input.addEventListener('keypress', e => {
    if(event.which == 13) {
        event.preventDefault()
        const value = input.value
        input.value = ''
        it.next(value)
    }
})

function sanitise(text) {
    return text.trim().replace(/ /g, '').toLowerCase()
}
function weightedRandom(min, max) {
    return Math.floor(Math.abs(Math.random() - Math.random()) * (1 + max - min) + min)
}

const questionProto = {
    // convenient to have the question contain its sanitised texts for answer checking
    get sanitisedGerman() {
        return sanitise(this.german)
    },
    get sanitisedEnglish() {
        return sanitise(this.english)
    },
    // convenient to have the question be aware of which language is the answer and which is the question
    get text() {
        return testingGerman ? this.german : this.english
    },
    get answerText() {
        return testingGerman ? this.sanitisedEnglish : this.sanitisedGerman
    },
    // by passing in the question text and the user's answer text and seeing if they both match, isCorrectAnswer works without
    // needing to know whether german or english is being tested
    isCorrectAnswer(german, english) {
        return sanitise(german) == this.sanitisedGerman && sanitise(english) == this.sanitisedEnglish
    }
}

function createQuestion(german, english, lastAsked, frequency, difficulty = 3, answered = 0) {
    const question = Object.create(questionProto)
    question.german = german
    question.english = english
    question.difficulty = difficulty

    return question
}

let testingGerman = true
const it = (function() {
    const questions = [
        createQuestion('bald', 'soon'),
        createQuestion('bis', 'until'),
        createQuestion('hallo', 'hello')
    ]

    const questionQueue = []
    function initialiseQuestionQueue() {
        questions.forEach(question => {
            for(let i = 0; i < question.difficulty; i++) {
                const index = Math.floor(Math.random() * questionQueue.length)
                questionQueue.splice(index, 0, question)
            }
            separateIdenticalQuestions()
        })
    }
    initialiseQuestionQueue()

    // adds more of a question into the question queue, weighted towards the lower end
    function spliceQuestions(question, times) {
        for(let i = 0; i < times; i++) {
            // randomly choose the index; more likely to be closer to the start
            let index = weightedRandom(0, questionQueue.length)
            if(index == 0) index ++ // don't allow the question to be placed at front of list
            questionQueue.splice(index, 0, question)
        }
    }
    // retrieves a random question which is not the same question as the argument
    function getOtherQuestion(question) {
        let counter = 0
        let otherQuestion = question
        while(otherQuestion == question) {
            counter ++
            otherQuestion = questions[Math.floor(Math.random() * questions.length)]
            // prevent infinite loop
            if(counter >= 500) {
                console.error('Only argument question exists')
                break;
            }
        }
        return otherQuestion
    }
    // stops the question queue from containing the same question multiple times in a row
    function separateIdenticalQuestions() {
        // loop through queue backwards so that splicing doesn't interfere with looping
        for(let i = questionQueue.length; i > 1; i--) {
            if(questionQueue[i - 1] == questionQueue[i - 2]) {
                questionQueue.splice(i - 1, 0, getOtherQuestion(questionQueue[i - 1]))
            }
        }
    }

    function *eventLoop() {
        while(true) {
            applyInputVisual('Enter text here')
            const currentQuestion = questionQueue.shift()
            output(currentQuestion.text)

            const userInput = yield
            if(sanitise(userInput) == currentQuestion.answerText)
                applyInputVisual('Enter text here')
            else {
                applyInputVisual('Incorrect. Press any key to continue', 'red')
                spliceQuestions(currentQuestion, currentQuestion.difficulty)
                separateIdenticalQuestions()
                console.log(questionQueue)
                yield
            }

        }
    }

    return eventLoop()
})()
it.next()