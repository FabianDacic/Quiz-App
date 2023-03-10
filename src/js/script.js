let answer = {}
const table = document.getElementById('highScoreTable')
const answerButton = document.getElementById('confirmAnswer')
const progressBarTag = document.getElementById('progressBar')
const quizTimerTag = document.getElementById('quizTimer')
const questionTag = document.getElementById('question')
const playerAnswerTag = document.getElementById('playerAnswer')
const playerAlternativeTag = document.getElementById('playerAlternative')
const endGameTag = document.getElementById('endGame')
const winnerPage = document.getElementById('winner')
const checkTableBtn = document.querySelector('#winner button')
const scorePageTag = document.getElementById('scorePage')
const maxTime = 10
const startingURL = 'https://courselab.lnu.se/quiz/question/1'
let isOptional = false
let gap
let cntDown
let srvResp

/**
 * This function hides all elements present in a container.
 *
 * @param {document} parent Container of the elements.
 */
function hideElements (parent) {
  const children = document.querySelector(parent).children
  for (let i = 0; i < children.length; i++) {
    children[i].style.visibility = 'hidden'
    children[i].style.display = 'none'
    children[i].checked = false
  }
}

let correctAnswers = 0
let passTime = 0
let userName

/**
 * Hides the content in the main page so to speak.
 */
function hideMainPage () {
  document.getElementById('mainPage').style.display = 'none'
  document.getElementById('startButton').style.display = 'none'
}

const showQuestion = function (srvResp) {
  hideMainPage()
  document.getElementById('mainHeader').style.visibility = 'visible'
  questionTag.style.visibility = 'visible'
  questionTag.style.display = 'block'
  questionTag.style.visibility = 'visible'
  answerButton.hidden = false
  playerAnswerTag.style.visibility = 'visible'
  playerAnswerTag.style.display = 'block'
  playerAnswerTag.value = ''
  const question = document.getElementById('actualQuestion')
  question.textContent = srvResp.question
}

const showAlternatives = function (alternatives) {
  document.querySelector('#playerAnswer').style.visibility = 'hidden'
  playerAnswerTag.style.display = 'none'
  answerButton.hidden = true
  document.querySelector('#playerAlternative').style.visibility = 'visible'
  const alternativesLength = Object.keys(alternatives).length
  const divChoice = document.querySelector('#playerAlternative')
  for (let index = 0; index < alternativesLength; index++) {
    const radio = document.createElement('input')
    radio.setAttribute('type', 'radio')
    radio.className = 'rad-input'
    radio.name = 'choices'
    radio.value = 'alt' + (index + 1)
    radio.id = 'radio' + (index + 1)
    divChoice.appendChild(radio)
    const label = document.createElement('label')
    label.id = 'label' + (index + 1)
    label.textContent = alternatives['alt' + (index + 1)]
    label.className = 'rad-label'
    const br = document.createElement('br')
    label.htmlFor = radio.id
    divChoice.appendChild(label)
    divChoice.appendChild(br)
  }
}

document.getElementById('playerAlternative').addEventListener('click', function (event) {
  if (event.target && event.target.matches("input[type='radio']")) {
    getRadioValue()
  }
})

const showGameOverPage = function () {
  hideElements('#mainDiv')
  endGameTag.style.visibility = 'visible'
  endGameTag.style.display = 'block'
}

const startPageDisplay = function () {
  progressBarTag.classList.remove('round-time-bar')
  document.getElementById('mainHeader').style.visibility = 'hidden'
  playerAlternativeTag.style.visibility = 'hidden'
  questionTag.style.visibility = 'hidden'
  playerAnswerTag.style.visibility = 'hidden'
  endGameTag.style.visibility = 'hidden'
  endGameTag.style.display = 'none'
  winnerPage.style.visibility = 'hidden'
  winnerPage.style.display = 'none'
  scorePageTag.style.visibility = 'hidden'
}

const displayHighscore = function (newHighscore) {
  progressBarTag.classList.remove('round-time-bar')
  hideElements('#mainDiv')
  document.querySelector('#scorePage').style.visibility = 'visible'
  document.querySelector('#scorePage').style.display = 'block'
  let listPlayer = 5

  if (newHighscore.length < 5) {
    listPlayer = newHighscore.length
  }

  for (let i = 0; i < listPlayer; i++) {
    const tr = document.createElement('tr')
    const playerName = document.createElement('td')
    const timeElapsed = document.createElement('td')
    const playerScore = document.createElement('td')
    tr.appendChild(playerName)
    tr.appendChild(timeElapsed)
    tr.appendChild(playerScore)
    table.appendChild(tr)
    playerName.innerText = newHighscore[i].name
    timeElapsed.innerText = newHighscore[i].time
    playerScore.innerText = newHighscore[i].score
  }
  const button = document.createElement('button')
  button.textContent = 'Try again'
  document.querySelector('#scorePage').appendChild(button)
}

/**
 * This async function is used to retrieve the question from the server.
 *
 * @param {URL} url The url that is used to retrieve the question.
 * @returns {JSON} Returns the response of the url in json if status code is OK.
 */
async function getQuestion (url) {
  const data = {
    method: 'GET'
  }
  const response = await fetch(url, data)
  if (response.ok) {
    return response.json()
  } else {
    gameOver()
  }
  throw new Error(`HTTP error! status: ${response.status}`)
}

/**
 * This function is used to process the question after it has been retrieved.
 *
 * @param {URL} url The url that contains the question.
 */
function processQuestions (url) {
  getQuestion(url).then(result => {
    srvResp = result
    showQuestion(srvResp)
    if (!srvResp.alternatives) {
      document.querySelector('#playerAlternative').style.visibility = 'hidden'
      document.querySelector('#playerAnswer').style.visibility = 'visible'
    } else {
      isOptional = true
      showAlternatives(srvResp.alternatives)
    }
    startTimer(maxTime, quizTimerTag)
    quizTimerTag.style.display = 'none'
  })
}

/**
 * A function used to retrieve the value of the radio chosen by the player.
 */
function getRadioValue () {
  progressBarTag.classList.remove('round-time-bar')
  stopTimer()
  const inputs = document.getElementsByName('choices')
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].checked) {
      answer = {
        answer: inputs[i].value
      }
    }
  }
  const divChoice = document.querySelector('#playerAlternative')
  while (divChoice.firstChild) {
    divChoice.firstChild.remove()
  }
  processAnswer()
}

answerButton.addEventListener('click', () => {
  progressBarTag.classList.remove('round-time-bar')
  stopTimer()
  let value
  if (isOptional === false) {
    value = document.querySelector('.answer').value
  } else {
    document.querySelectorAll('#radio').forEach(element => {
      if (element.checked) {
        value = element.value
      }
    })
    const divChoice = document.querySelector('#playerAlternative')
    while (divChoice.firstChild) {
      divChoice.firstChild.remove()
    }
  }
  answer = {
    answer: value
  }
  processAnswer()
})

// Support for enter as well
document.getElementById('playerAnswer').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    answerButton.click()
  }
})

// Support for enter as well
document.getElementById('chosenName').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    document.getElementById('startButton').click()
  }
})

/**
 * Returns the response from the server in json in case the answer is correct.
 *
 * @returns {JSON} Server response.
 */
async function sendAnswer () {
  const config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answer)
  }
  try {
    const response = await fetch(srvResp.nextURL, config)
    if (response.ok) {
      return response.json()
    } else {
      gameOver()
    }
  } catch (error) {
    console.log('Something went wrong')
  }
}

checkTableBtn.addEventListener('click', () => {
  showWinPage()
})

/**
 * This function displays a win page specific to the player.
 *
 * @param {string} msg The message that is to be displayed on the win page for the player.
 */
function winPlayerPage (msg) {
  document.getElementById('mainHeader').style.visibility = 'hidden'
  playerAnswerTag.style.visibility = 'hidden'
  playerAnswerTag.style.display = 'none'
  questionTag.style.visibility = 'hidden'
  questionTag.style.display = 'none'
  const greetPlayerMsg = document.createElement('p')
  winnerPage.style.visibility = 'visible'
  winnerPage.style.display = 'block'
  const victoryMessage = document.createElement('p')
  victoryMessage.innerHTML = msg
  greetPlayerMsg.innerHTML = 'Congratulations ' + userName + '! ' + 'You completed the quiz in: ' + passTime + ' seconds.'
  checkTableBtn.parentNode.insertBefore(greetPlayerMsg, checkTableBtn.previousSibling)
  greetPlayerMsg.parentNode.insertBefore(victoryMessage, greetPlayerMsg)
}

/**
 * Depending on whether the server provides a nextURL or not, it processes it accordingly.
 */
function processAnswer () {
  sendAnswer().then(res => {
    srvResp = res
    correctAnswers++
    if (!srvResp.nextURL) {
      winPlayerPage(srvResp.message)
    } else if (srvResp.nextURL) {
      processQuestions(srvResp.nextURL)
      isOptional = false
    }
  })
}

/**
 * This function starts the timer and although hidden it runs on the same page as the question one.
 *
 * @param {number} duration Duration is the amount of time.
 * @param {document} display Display is the element that will be used to show the content.
 */
function startTimer (duration, display) {
  progressBarTag.classList.add('round-time-bar')
  cntDown = duration
  gap = setInterval(() => {
    display.textContent = cntDown
    if (--cntDown < 0) {
      gameOver()
    }
  }, 1000)
}

/**
 * Simply stops the timer that is going.
 */
function stopTimer () {
  progressBarTag.classList.remove('round-time-bar')
  clearInterval(gap)
  passTime += maxTime - cntDown
}

/**
 * Presents an endgame "page" to the user in case of an invalid answer.
 */
function gameOver () {
  progressBarTag.classList.remove('round-time-bar')
  showGameOverPage()
  const button = document.querySelector('#endGame button')
  button.addEventListener('click', () => {
    document.location.reload()
  })
}

/**
 * Starts the application and shows a greeting page.
 */
function startApplication () {
  processQuestions(startingURL)
  sendAnswer()
  document.querySelector('#endGame').style.visibility = 'hidden'
}

/**
 * Processing of the data that will be displayed once the game is won.
 */
function showWinPage () {
  progressBarTag.classList.remove('round-time-bar')
  winnerPage.style.visibility = 'hidden'
  winnerPage.style.display = 'none'
  let newHighscore
  if (!localStorage.highscore) {
    newHighscore = [{ name: userName, time: passTime, score: correctAnswers }]
  } else {
    newHighscore = JSON.parse(window.localStorage.highscore)
    newHighscore.push({ name: userName, time: passTime, score: correctAnswers })
  }
  correctAnswers = 0
  newHighscore = newHighscore.sort(function (n, m) {
    return n.time - m.time
  })
  localStorage.highscore = JSON.stringify(newHighscore)
  displayHighscore(newHighscore)
  document.querySelector('#scorePage button').addEventListener('click', () => {
    document.location.reload()
  })
}

/**
 * This function checks if the name input box is empty or not.
 *
 * @param {string} str String that is to be tested if it's empty.
 * @returns {boolean} True if is empty otherwise false.
 */
function isEmpty (str) {
  return !str.trim().length
}

document.getElementById('chosenName').addEventListener('input', function () {
  if (isEmpty(this.value)) {
    alert('Please enter a name!')
  }
})

startPageDisplay()
const button = document.getElementById('startButton')
button.addEventListener('click', () => {
  userName = button.previousElementSibling.value
  startApplication()
})
