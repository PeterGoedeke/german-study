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
// helper function to remove duplicate elements from an array
function removeDuplicates(a) {
    const seen = {}
    return a.filter(item => seen.hasOwnProperty(item) ? false : (seen[item] = true))
}

// times enum and helper functions which interact with the times enum
const times = Object.freeze({
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    fortnight: 1000 * 60 * 60 * 24 * 7 * 2,
    month: 1000 * 60 * 60 * 24 * 7 * 2 * 2,
})
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

// helper function to sanitise text or each element of an array
function sanitise(text) {
    if(Array.isArray(text)) {
        const newArray = text.map(element => sanitise(element))
        return newArray
    }
    return text.trim().replace(/ /g, '').replace(/ *\([^)]*\) */g, "").toLowerCase()
}

// below are the helper functions which deal with displaying or interacting with the DOM

// displays a temporary, fading-out message on the screen
function floatText(text, color ) {
    const floater = document.createElement('div')
    floater.className = 'textFloater'
    floater.style.color = (color ? color : 'rgba(255, 62, 62, 0.5);')
    floater.textContent = text
    
    document.body.appendChild(floater)
    setTimeout(() => {floater.style.transform = 'translateY(-30px)'}, 0)
    setTimeout(() => {
        document.body.removeChild(floater)
    }, 1000)
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