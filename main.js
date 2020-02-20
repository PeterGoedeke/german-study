const times = Object.freeze({
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    fortnight: 1000 * 60 * 60 * 24 * 7 * 2,
    month: 1000 * 60 * 60 * 24 * 7 * 2 * 2,
})

// helper function to display text to the output box
function output(text) {
    const display = document.querySelector('.output')
    display.textContent = text
}
// helper function to set the placeholder of the input box
function setInputPlaceholder(text) {
    input.placeholder = text
}

        setTimeout(() => {
            input.style.backgroundColor = 'white'
        }, 250)
    }
}

// setup the input to step through the iterator controlling the flow of the application
const input = document.querySelector('.input')
input.addEventListener('keypress', e => {
    if(event.which == 13) {
        event.preventDefault()
        const value = input.value
        input.value = ''
        it.next(value)
    }
})

// helper function to sanitise text
function sanitise(text) {
    return text.trim().replace(/ /g, '').toLowerCase()
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
    // set the streak values to those expected when the answer is right or wrong
    answeredRight() {
        if(this.correctAnswerStreak == -1) this.correctAnswerStreak = 1
        else this.correctAnswerStreak ++
    },
    answeredWrong() {
        this.correctAnswerStreak = -1
    },
    // by passing in the question text and the user's answer text and seeing if they both match, isCorrectAnswer works without
    // needing to know whether german or english is being tested
    isCorrectAnswer(german, english) {
        return sanitise(german) == this.sanitisedGerman && sanitise(english) == this.sanitisedEnglish
    }
}

// factory for creating question object
function createQuestion(german, english, difficulty = 3, weighting = 10, correctAnswerStreak = 0) {
    const question = Object.create(questionProto)
    question.german = german
    question.english = english
    question.difficulty = difficulty
    question.weighting = weighting
    question.correctAnswerStreak = correctAnswerStreak

    return question
}

let testingGerman = true
const it = (function() {
    const questions = [
        createQuestion('bald', 'soon'),
        createQuestion('bis', 'until'),
        createQuestion('hallo', 'hello'),
        createQuestion('tschuss', 'see you'),
        createQuestion('eher', 'rather'),
    ]
    // questions are weighted based on how likely they are to be asked
    function getWeightingTotal() {
        return questions.reduce((total, question) => total += question.weighting, 0)
    }
    // selects a random question which was not the most recently asked question
    let lastQuestion
    function pickQuestion() {
        // pick a random number below the weight total
        const totalWeighting = getWeightingTotal()
        const pickIndex = Math.floor(Math.random() * totalWeighting)
        // iterate through the array. effectively decrease the random number by the sum of all weightings of questions iterated past
        // if the weighting of the question is bigger than the random number, this means that the the number corresponds to that question
        for(let i = 0, j = 0; i < questions.length; j += questions[i].weighting, i++) {
            if(questions[i].weighting > pickIndex - j) {
                // don't allow duplicates
                if(lastQuestion == questions[i]) return pickQuestion()
                else {
                    lastQuestion = questions[i]
                    return questions[i]
                }
            }
        }
        console.error('Failed to select question.')
    }
    // checks to see whether all of the questions have been answered to the point at which they drop to low priority
    function areAllAnswered() {
        for(let i = 0; i < questions.length; i ++) {
            if(questions[i].weighting != 1) {
                return false
            }
        }
        return true
    }

    function *eventLoop() {
        // iterate through until a break is called
        while(true) {
            // display the new question
            setInputPlaceholder('Enter text here')
            const currentQuestion = pickQuestion()
            output(currentQuestion.text)
            
            const userInput = yield
            // if user input is correct, mark it as so and move to next question
            if(sanitise(userInput) == currentQuestion.answerText) {
                currentQuestion.answeredRight()
                // check if question has been answered enough to drop in priority
                if(currentQuestion.correctAnswerStreak == currentQuestion.difficulty) {
                    currentQuestion.weighting = 1

                    if(areAllAnswered()) {
                        output('All questions answered')
                        break;
                    }
                }
            }
            // if the user input is false, mark is as so and pause
            else {
                setInputPlaceholder('Incorrect. Press any key to continue')
                currentQuestion.weighting += getWeightingTotal() * 0.75
                currentQuestion.answeredWrong()
                yield
            }
        }
    }
    return eventLoop()
})()
it.next()