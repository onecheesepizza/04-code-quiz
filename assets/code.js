//global vars
let totalTime=questions.length*10;
let secondsLeft=totalTime;
let timerInterval;
let quizScore=0;
let questionIndex=0;
let wrongAnswers=0;
let gameInProgress=false;
let currentScreen="startScreen";

//generate page structure
function generateStructure(){
    let bodyEl=document.querySelector("body");
    bodyEl.innerHTML=`
    <div id="header"></div>
    <div id="quiz"></div>
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
    //set body to start screen html
    let quizEl=document.querySelector("#quiz");
    quizEl.innerHTML=startPageHTML;
    //select start button
    let startButton=document.querySelector("#startButton");
    //add event listener to start button, run function to start quiz
    startButton.addEventListener("click", startCodeQuiz);
}

//quiz timer
function quizTimer() {
    secondsLeft=totalTime;
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

//render end screen 
function renderEndScreen(){
    currentScreen="endScreen";
    //log screen state
    console.log(currentScreen);
    //html with final score and high score initials prompt
    const doneScreenHTML = `
        <h1>All Done</h1
        <p>Your final score is: ${quizScore}</p>
        <form>
            <div>
            <label for="player-initials">Enter your initials: </label>
            <input type="text" maxlength="3" id="player-initials" name="player-initials">
            </div>
            <div class="button">
            <button id="scoreSubmit" type="submit">Submit</button>
            </div>   
        </form>    
        `;  
    // set body to end screen html   
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
    //high score html
    let highScoreScreenHTML = `
        <h1>High Scores</h1
        <ul id="highScoresList">`
        //loop over high scores and generate list html, if localStorage.length is >0
        for (let i=0;i<localStorage.length;i++){
            //create key value to read localStorage
            let scoreIndex="scoreIndex"+i;
            //get parsed score object from localStorage
            let singleScore=JSON.parse(localStorage.getItem(scoreIndex));
            console.log(singleScore);
            //append new list element to html
            highScoreScreenHTML+= `<li data-index=${i}>${singleScore.initials}: ${singleScore.score}</li>`
        };
        //display 'no scores' message if localStorage is empty (localStorage.length is 0)
        if (localStorage.length===0){
            highScoreScreenHTML+= `<p id="noScores">No scores to display.</p>`;
        }
    //append list end tag to html
    highScoreScreenHTML+= `</ul>`; 
    // set body to score screen html   
    let quizEl=document.querySelector("#quiz"); 
    quizEl.innerHTML=highScoreScreenHTML;    
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
            <h1>Question ${questionIndex + 1}</h1
            <p>${questions[questionIndex].title}</p>
            <ul id="answers">
            <li>${questions[questionIndex].choices[0]}</li>
            <li>${questions[questionIndex].choices[1]}</li>
            <li>${questions[questionIndex].choices[2]}</li>
            <li>${questions[questionIndex].choices[3]}</li>
            </ul>
            `;   
        //set body to quiz html
        let quizEl=document.querySelector("#quiz");
        quizEl.innerHTML=codeQuizHTML;
        //add event listener for answer selection that also runs answer evaluation
        let answersEl=document.querySelector("#answers");
        answersEl.addEventListener("click", function(event) {
            //evaluate answer
            if (event.target.textContent===questions[questionIndex].answer){
                console.log("correct answer");
            } else {
                console.log("wrong answer");
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
                quizScore=secondsLeft-(wrongAnswers*10); 
                console.log("seconds left: "+secondsLeft);
                console.log("wrong answers: "+wrongAnswers);
                console.log("wrong answer penalty: "+wrongAnswers*10);
                console.log("final score: "+quizScore);
                //fix negative scores
                if (quizScore<0){
                    quizScore=0;
                }
                console.log("non-negative final score: "+quizScore);
                //reset game state
                gameInProgress=false;
                questionIndex=0;
                secondsLeft=totalTime;
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
