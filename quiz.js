const times = Object.freeze({
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    fortnight: 1000 * 60 * 60 * 24 * 7 * 2,
    month: 1000 * 60 * 60 * 24 * 7 * 2 * 2,
})
const DEFAULTWEIGHT = 10
// functions which give first value smaller or larger than the argument value from the times object
function getNextTime(time) {
    for(const key in times) {
        if(time < times[key]) return times[key]
    }
    return times.month
}
function getPreviousTime(time) {
    const keys = []
    for(const key in times) keys.push(key)
    keys.reverse()
    for(let i = 0; i < keys.length; i++) {
        if(time > times[keys[i]]) return times[keys[i]]
    }
    return times.hour
}
// allow retrieval of the name of the time by providing the time millisecond value
function getTimeLabel(time) {
    for(const key in times) {
        if(time == times[key]) return key
    }
}

// helper function to display text to the output box
function output(text) {
    const display = document.querySelector('.output')
    display.textContent = text
}
// helper function to set the placeholder of the input box
function setInputPlaceholder(text) {
    input.placeholder = text
}

// set the colours of the streak boxes to their appropriate values based on the correct answer streak of the current question
function setStreakVisual(streak, justChanged = false) {
    const streaks = [
        document.querySelector('.streak1'),
        document.querySelector('.streak2'),
        document.querySelector('.streak3')
    ]
    // apply a transition which will make the streak box 'pop' for 200ms
    function popEffect(element) {
        element.style.transform = 'scale(1.3)'
        element.style.zIndex = '2'
        setTimeout(() => {
            element.style.transform = ''
            element.style.zIndex = 'initial'
        }, 200)
    }
    // set the colours of the boxes based on correct answer streak
    if(streak == -1) {
        if(justChanged) popEffect(streaks[0])
        streaks[0].style.backgroundColor = 'red'
        streaks[1].style.backgroundColor = 'white'
        streaks[2].style.backgroundColor = 'white'
        return
    }
    // stop higher streaks from attempting to access non-existant array elements
    if(streak > 3) {
        streak = 3
        justChanged = false
    }

    for(let i = 0; i < streaks.length; i++) {
        streaks[i].style.backgroundColor = (i < streak ? 'green' : 'white')
    }
    if(justChanged) popEffect(streaks[streak - 1])
}

// setup the input to step through the iterator controlling the flow of the application
let it
const input = document.querySelector('.input')
input.addEventListener('keypress', e => {
    if(event.which == 13) {
        event.preventDefault()
        const value = input.value
        it.next(value)
    }
})

// helper function to sanitise text or each element of an array
function sanitise(text) {
    if(Array.isArray(text)) {
        const newArray = text.map(element => sanitise(element))
        return newArray
    }
    return text.trim().replace(/ /g, '').replace(/ *\([^)]*\) */g, "").toLowerCase()
}

const questionProto = {
    // convenient to have the question be aware of which language is the answer and which is the question
    get rawText() {
        return testingGerman ? this.german : this.english
    },
    get text() {
        return this.rawText.join(', ')
    },
    get answerText() {
        return testingGerman ? this.english.join(', ') : this.german.join(', ')
    },
    // set the streak values to those expected when the answer is right or wrong
    answeredRight() {
        if(this.correctAnswerStreak == -1) this.correctAnswerStreak = 1
        else this.correctAnswerStreak ++

        // if question has been answered to completion, reduce priority
        if(this.correctAnswerStreak == this.difficulty) {
            this.weighting = 1
            this.lastAnswered = Date.now()
        }
    },
    answeredWrong() {
        this.correctAnswerStreak = -1
        this.lastAnswered = 0
    },
    // return the appropriate values based on which is being tested
    get weighting() {
        return (testingGerman ? this.weightGerman : this.weightEnglish)
    },
    set weighting(x) {
        if(testingGerman) this.weightGerman = x
        else this.weightEnglish = x
    },
    get correctAnswerStreak() {
        return (testingGerman ? this.streakGerman : this.streakEnglish)
    },
    set correctAnswerStreak(x) {
        if(testingGerman) this.streakGerman = x
        else this.streakEnglish = x
    },
    get lastAnswered() {
        return (testingGerman ? this.lastAnsweredGerman : this.lastAnsweredEnglish)
    },
    set lastAnswered(x) {
        if(testingGerman) this.lastAnsweredGerman = x
        else this.lastAnsweredEnglish = x
    },
    get reanswerTime() {
        return (testingGerman ? this.reanswerTimeGerman : this.reanswerTimeEnglish)
    },
    // by passing in the question text and the user's answer text and seeing if they both match, isCorrectAnswer works without
    // needing to know whether german or english is being tested
    isCorrectAnswer(userInput, question) {
        // return correct if the answer is correct
        const correct = sanitise(this.english).includes(sanitise(userInput)) && question === this.german
        || sanitise(this.german).includes(sanitise(userInput)) && question === this.english
        if(correct) return ans.CORRECT

        // otherwise, test to see whether the problem is that the user used the wrong definite article
        function testForWrongArticle(arr) {
            const articles = ['der', 'die', 'das']
            const answersWithoutArticle = sanitise(arr).map(elem => elem.slice(3))
            for(let i = 0; i < arr.length; i++) {
                // check if the strings match with the articles removed
                const isPossibleMatch = sanitise(userInput.slice(3)) == answersWithoutArticle[i]
                // true if the rest of the strings match and the first three characters of the user input and matching answer are articles
                if(isPossibleMatch && articles.includes(arr[i].slice(0, 3)) && articles.includes(sanitise(userInput.slice(0, 3)))) {
                    return true
                }
            }
        }
        // doesn't make sense to test this if looking for answers in english
        if(question === this.english && testForWrongArticle(this.german)) return ans.WRONGARTICLE

        // if the answer is not correct, check if it is because of a typo and return typo if it was
        let wasTypo = false
        function testForTypos(arr) {
            const distances = sanitise(arr).map(elem => levenshteinDistance(elem, sanitise(userInput)))
            for(let i = 0; i < arr.length; i++) {
                // 20% difference between the user input and a potential answer is considered to be a possible typo
                if(distances[i] / sanitise(arr)[i].length <= .2) wasTypo = true
            }
        }
        if(this.german === question) testForTypos(this.english)
        else if(this.english === question) testForTypos(this.german)
        if(wasTypo) return ans.TYPO

        // if the answer was not correct, not wrong because of a mistake of article, and not a typo, then the answer is wrong
        return ans.WRONG
    }
}


const ans = Object.freeze({
    WRONG: 0,
    CORRECT: 1,
    TYPO: 2,
    WRONGARTICLE: 3
})

// factory for creating question object
function createQuestion(german, english, difficulty = 3, weightGerman = DEFAULTWEIGHT, weightEnglish = DEFAULTWEIGHT, streakGerman = 0,
    streakEnglish = 0, reanswerTimeGerman = times.hour, reanswerTimeEnglish = times.hour, lastAnsweredGerman = 0, lastAnsweredEnglish = 0, locked = false
) {
    const question = Object.assign(Object.create(questionProto), {
        german, english, difficulty, weightGerman, weightEnglish, streakGerman, streakEnglish, reanswerTimeGerman, reanswerTimeEnglish, lastAnsweredGerman, lastAnsweredEnglish, locked
    })
    return question
}

let testingVariable = false
let testingGerman = true
const getIterator = (function() {
    let questions = []
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
            if(!testingVariable && questions[i].weighting != 1) {
                return false
            }
            if(testingVariable) {
                if(questions[i].weightGerman != 1 || questions[i].weightEnglish != 1) {
                    return false
                }
            }
        }
        return true
    }

    function *eventLoop(questionsParam, testingGermanParam, testingVariableParam = false) {
        // pass through parameters and use them within the scope of the whole IIFE to define quiz settings
        questions = questionsParam
        testingGerman = testingGermanParam
        testingVariable = testingVariableParam

        // iterate through until a break is called
        presentQuestionLoop:
        while(true) {
            // display the new question
            setInputPlaceholder('Enter text here')
            const currentQuestion = pickQuestion()
            if(testingVariable) testingGerman = Math.random() < 0.5
            setTimeout(() => setStreakVisual(currentQuestion.correctAnswerStreak), 200)
            output(currentQuestion.text)
            let firstTry = true
            
            // the checkAnswerLoop exists so that the user may attempt to answer each question twice if their first attempt is
            // deemed to be either a typo or a mistaken article
            // continuing the check answer loop allows for a reanswer; breaking asks the next question
            checkAnswerLoop:
            while(true) {
                const userInput = yield
                // if user input is correct, mark it as so and move to next question
                const answerStatus = currentQuestion.isCorrectAnswer(userInput, currentQuestion.rawText)
                if(answerStatus == ans.CORRECT) {
                    currentQuestion.answeredRight()
                    saveQuestionList(listHandler.path, questions)
                    setStreakVisual(currentQuestion.correctAnswerStreak, true)
                    // check if all questions have been answered
                    if(areAllAnswered()) {
                        output('All questions answered')
                        input.value = ''
                        break presentQuestionLoop
                    }
                    input.value = ''
                    break checkAnswerLoop
                }
                else if(answerStatus == ans.WRONGARTICLE && firstTry) {
                    floatText('Wrong article')
                    firstTry = false
                    continue checkAnswerLoop
                }
                else if(answerStatus == ans.TYPO && firstTry) {
                    floatText('Typo')
                    firstTry = false
                    continue checkAnswerLoop
                }
                // if the user input is false, mark is as so and pause
                else {
                    setInputPlaceholder('Incorrect. Press any key to continue')
                    output(`Correct answer:\n${currentQuestion.answerText}`)
                    currentQuestion.weighting += getWeightingTotal() * 0.4
                    currentQuestion.answeredWrong()
                    saveQuestionList(listHandler.path, questions)
                    setStreakVisual(currentQuestion.correctAnswerStreak, true)
                    yield
                    input.value = ''
                    break checkAnswerLoop
                }
            }
        }
    }
    return eventLoop
})()

// displays a temporary, fading-out message on the screen
function floatText(text) {
    const floater = document.createElement('div')
    floater.className = 'textFloater'
    floater.textContent = text
    
    document.body.appendChild(floater)
    setTimeout(() => {floater.style.transform = 'translateY(-30px)'}, 0)
    setTimeout(() => {
        document.body.removeChild(floater)
    }, 1000)
}