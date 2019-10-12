//global vars
const totalTime=questions.length*15;
const timePenalty=15;
let secondsLeft=totalTime;
let timerInterval;
let feedbackInterval;
let quizScore=0;
let questionIndex=0;
let wrongAnswers=0;
let gameInProgress=false;
let currentScreen="startScreen";

//generate page structure
function generateStructure(){
    let bodyEl=document.querySelector("body");
    bodyEl.innerHTML=`
    <div id="container">
        <div id="header"></div>
        <div id="feedback"></div>
        <div id="quiz"></div>
    </div>
    `;
}

//render header menu
function renderHeader() {
    //header html
    let headerHTML=`
        <ul><li><a href="#" id="startScreen">Start Screen</a></li>
        <li><a href="#" id="highScores">High Scores</a></li></ul>
        <p id="time">Time: ${secondsLeft}</p>
        `;
    //set header html
    let headerEl=document.querySelector("#header");
    headerEl.innerHTML=headerHTML;
    //high score link & listener
    let highScoreEL=document.querySelector('#highScores');
    highScoreEL.addEventListener("click", renderHighScoreScreen);
    //start screen link & listener
    let startScreenEL=document.querySelector('#startScreen');
    startScreenEL.addEventListener("click", renderStartScreen);
}

// render start screen
function renderStartScreen(){
    //sets currentScreen condition
    currentScreen="startScreen";
    //log screen state
    console.log(currentScreen);
    //start screen html
    let startPageHTML = `
        <h1>Coding Quiz Challenge</h1>
        <p>Try to answer the following code-related questions within the time limit. Keep in mind that incorrect answers will penalize your score/time by 10 seconds!</p>
        <button id="startButton">
        `;
    //button text reflects game state    
    if (gameInProgress){
        startPageHTML+=`Resume Quiz </button>`
    } else {
        startPageHTML+=`Start Quiz </button>`
    }
    //set quizEl to start screen html
    let quizEl=document.querySelector("#quiz");
    quizEl.innerHTML=startPageHTML;
    //select start button
    let startButton=document.querySelector("#startButton");
    //add event listener to start button, run function to start quiz
    startButton.addEventListener("click", startCodeQuiz);
}

//quiz timer
function quizTimer() {
    //reinitialize Timer
    secondsLeft=totalTime;
    //update seconds left in html
    renderHeader();
    timerInterval = setInterval(function () {
        //decrement seconds
        secondsLeft--;
        //update seconds left in html
        renderHeader();
        console.log("time: "+secondsLeft);
        //counter end condition
        if (secondsLeft === 0) {
            clearInterval(timerInterval);
            console.log("timer done");
            //reset game state
            gameInProgress=false;
            questionIndex=0;
            secondsLeft=totalTime;
            //render end screen
            renderEndScreen();
        }
    }, 1000);
}

// render answer feedback
function answerFeedback(message) {
    //get feedback element
    let feedbackEl=document.querySelector("#feedback");
    //clear feedback / timer function
    function clearFeedback() {
        //clear existing timer and feedback txt
        clearInterval(feedbackInterval);
        feedbackEl.textContent="";
    }
    clearFeedback();
    //set the feedback element to the message
    feedbackEl.textContent=message;
    console.log(message);
    //clear the feeedback element after 1500ms
    feedbackInterval = setInterval(function () {
        clearFeedback();
    }, 1500);
}

//render end screen 
function renderEndScreen(){
    currentScreen="endScreen";
    //log screen state
    console.log(currentScreen);
    //html with final score and high score initials prompt
    const doneScreenHTML = `
        <h1>All Done</h1>
        <p>Time Remaining: ${secondsLeft}s<br>
        Incorrect Answers: ${wrongAnswers}<br>
        Time Penalty: -${wrongAnswers*timePenalty}s<br>
        Your Final Score Is: ${quizScore}</p>

        <form>
            <div>
            <label for="player-initials">Enter your initials: </label>
            <input type="text" maxlength="3" id="player-initials" name="player-initials">
            </div>
            <div class="button">
            <button id="scoreSubmit" type="submit">Submit Score</button>
            </div>   
        </form>    
        `;  
    // set quizEl to end screen html   
    let quizEl=document.querySelector("#quiz"); 
    quizEl.innerHTML=doneScreenHTML;
    //high score submit button event listener to save initials and score to local storage
    let submitEl=document.querySelector("#scoreSubmit"); 
    submitEl.addEventListener("click", function(event) {
        event.preventDefault();
        //get initials input and makes uppercase. 
        let initialVal=document.querySelector("#player-initials").value.toUpperCase();
        //validate initials input (alpha chars only)
        if (initialVal.match(/^[A-Za-z]+$/)){
            //create scoreData object
            let scoreData= {
                initials: initialVal, 
                score: quizScore
            };
            //serialize score object for localStorage
            let scoreDataSerial=JSON.stringify(scoreData);
            console.log(scoreDataSerial);
            //create key value for localStorage (scoreIndex#)
            let scoreIndex="scoreIndex"+window.localStorage.length;
            //write to localStorage
            window.localStorage.setItem(scoreIndex, scoreDataSerial);
            //render high score screen
            renderHighScoreScreen();
        //invalid form input condition
        }else {
            alert("Please enter valid initials.");
        }
    });
}

//high score screen
function renderHighScoreScreen() {
    //set currentScreen condition;
    currentScreen="highScoreScreen";
    //log screen state
    console.log(currentScreen);
    //high score screen html
    let highScoreScreenHTML = `
        <h1>High Scores</h1>
        <ul id="highScoresList">`
    //initialize unsorted score array
    let unsortedScore=[];
    //loop over high scores and generate list html, if localStorage.length is >0
    for (let i=0;i<localStorage.length;i++){
        //create key value to read localStorage
        let scoreIndex="scoreIndex"+i;
        //get parsed score object from localStorage
        let singleScore=JSON.parse(localStorage.getItem(scoreIndex));
        //add score object to array to be sorted later
        unsortedScore.push(singleScore);
        console.log(singleScore);
    };
    //sort scores and store in new array
    let sortedScore=unsortedScore.sort(function(a, b){
        return a.score-b.score
    })
    //reverse sort to descending
    sortedScore.reverse();
    //display sorted scores to screen
    for (let i=0;i<sortedScore.length;i++){
        //append new list element to html
        highScoreScreenHTML+=`<li data-index=${i}>${sortedScore[i].initials}: ${sortedScore[i].score}</li>`
    }
    //display 'no scores' message if localStorage is empty (localStorage.length is 0)
    if (localStorage.length===0){
        highScoreScreenHTML+= `<p id="noScores">No scores to display.</p>`;
    }
    //append list end tag and clear button to html
    highScoreScreenHTML+= `
        </ul>
        <br>
        <button type="button" id="clearScores">Clear Scores</button>
        `; 
    // set quizEl to score screen html   
    let quizEl=document.querySelector("#quiz"); 
    quizEl.innerHTML=highScoreScreenHTML;    
    // event listener for clearScores button
    let clearScoresEl=document.querySelector("#clearScores");
    clearScoresEl.addEventListener("click", function(){
        //clear local storage
        localStorage.clear();
        console.log("clearScores");
        //re-render high score screen
        renderHighScoreScreen();
    });
}

// start code quiz 
function startCodeQuiz(event) {
    //starts timer if game is not already in progress
    if (gameInProgress===false){
        quizTimer();
    }
    //sets gameInProgress and currentScreen conditions to true
    gameInProgress=true;
    currentScreen="quizScreen";
    //log screen state
    console.log(currentScreen);
    //loadQuestion function       
    function loadQuestion(){    
        //quiz html template
        const codeQuizHTML = `
            <h1>Question ${questionIndex + 1}</h1>
            <p>${questions[questionIndex].title}</p>
            <ul id="answers">
            <li><button type="button">${questions[questionIndex].choices[0]}</button></li>
            <li><button type="button">${questions[questionIndex].choices[1]}</button></li>
            <li><button type="button">${questions[questionIndex].choices[2]}</button></li>
            <li><button type="button">${questions[questionIndex].choices[3]}</button></li>
            </ul>
            `;   
        //set body to quiz html
        let quizEl=document.querySelector("#quiz");
        quizEl.innerHTML=codeQuizHTML;
        //select feedback element for eval feedback below
        let feedbackEl=document.querySelector("#feedback");
        //add event listener for answer selection that also runs answer evaluation
        let answersEl=document.querySelector("#answers");
        answersEl.addEventListener("click", function(event) {
            //evaluate answer
            if (event.target.textContent===questions[questionIndex].answer){
                //positive answer feedback to screen
                answerFeedback("Correct!");
            } else {
                //negative answer feedback to screen
                answerFeedback("Incorrect!");
                //increment wrongAnswers
                wrongAnswers++;
            }
            //iterate questionIndex 
            questionIndex++;
            //load next question if one exists (recursive)
            if (questionIndex<questions.length){
                loadQuestion();
            //exit condition for end of questions   
            } else {
                //stop timer
                clearInterval(timerInterval);
                //calculate score
                quizScore=secondsLeft-(wrongAnswers*timePenalty); 
                console.log("seconds left: "+secondsLeft);
                console.log("wrong answers: "+wrongAnswers);
                console.log("wrong answer penalty: -"+wrongAnswers*timePenalty);
                console.log("final score: "+quizScore);
                //fix negative scores
                if (quizScore<0){
                    quizScore=0;
                }
                console.log("non-negative final score: "+quizScore);
                //reset game state
                gameInProgress=false;
                questionIndex=0;
                // secondsLeft=totalTime;
                //end screen html
                renderEndScreen();
            }
        });
    }
    //first run of loadQuestion    
    loadQuestion();
}

/////////////////////////////
// main program function
function runApp(){
    generateStructure();
    renderHeader();
    renderStartScreen();
}

//run program
runApp();
