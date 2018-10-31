//DOM Variables
var $round = $("#round");
var $timer = $("#timer");
var $question = $("#question");
var $answers = $("#answers");
var $correct_answers = $("#correct_span");
var $incorrect_answers = $("#incorrect_span");


//Gloabal Variables
var trivia_JSON;
var round = 0;
var interval;
var timeout;
var time_remaining = 0;
var out_of_time = false;
var correct_answers = 0;
var incorrect_answers = 0;


//function to decode html special char codes occasioanlly included in API response
function decodeHtml(html) {

  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;

}


//function to reveal incorrect & correct answers
function reveal() {

  $("button[data-value]").each(function (element) {

    if ($(this).attr("data-value") === "true") {
      this.style.backgroundColor = "green";
    } else {
      this.style.backgroundColor = "red";
    }

  });
}


//function to generate question & answers
function generateTriva() {

  //store trivia one of 5 triva objects based on round
  var result = trivia_JSON.results[round];

  //clear elements of game-card div
  $round.empty();
  $question.empty();
  $answers.empty();

  $round.append($("<p>").text("Round: " + (round + 1)));

  //store question
  var question = $("<p>").text(decodeHtml(result.question));

  //append/display question
  $question.append(question);

  //store incorrect answers object
  var incorrect_answers = result.incorrect_answers;

  //store correct answer sting
  var correct_answer = result.correct_answer;

  //create array to hold all answers
  var answers_array = [];

  //push incorrect answers to array
  incorrect_answers.forEach(element => {
    answers_array.push(decodeHtml(element));
  });

  //push correct answer to array
  answers_array.push(decodeHtml(correct_answer));

  //generate random index to 'shuffle' correct answer
  index = Math.floor(Math.random() * 3)

  //temp variable to hold answer being overwritten
  var temp = answers_array[index];
  answers_array[index] = answers_array[3];
  answers_array[3] = temp;

  //generate buttons from answer array
  for (i = 0; i < answers_array.length; i++) {

    //if we are generating a button for the correct answer...
    if (i === index) {

      //create the button with data-value set to true
      var correct_button = $("<button>").text(answers_array[i]);
      correct_button.attr("data-value", "true");
      correct_button.attr("class", "correct_btn");
      $answers.append(correct_button);

    } else {

      //otherwise create with data-value set to false
      var incorrect_button = $("<button>").text(answers_array[i]);
      incorrect_button.attr("data-value", "false");
      incorrect_button.attr("class", "incorrect_btn");
      $answers.append(incorrect_button);
    }
  }
}


//function to generate timer
function timer(time_per_question) {

  //time_remaining initialized to time_per_question
  out_of_time = false;
  time_remaining = time_per_question;
  $timer.empty();
  time_display = $("<p>");
  $timer.append(time_display);
  time_display.text(time_remaining);

  //clear interval before setting interval
  interval = clearInterval(interval);
  interval = setInterval(function () {

    //if time is still left, continue counting down
    if (time_remaining > 0) {
      time_remaining--;
      time_display.text(time_remaining);
    } else {
      out_of_time = true;
      interval = clearInterval(interval);
      reveal();
      timeout = clearTimeout
      timeout = setTimeout(newRound, 1000 * 2);
    }

  }, 1000);

}


//main function, gets new triva and starts timer, also tracks round #
function newRound() {

  if (round <= 4) {

    generateTriva();
    timer(10);
    round++;

  } else {

    $round.empty();
    $timer.empty();
    $question.empty();
    $answers.empty();
    game_over_p = $("<p>").text("Game Over")
    $("#question").append(game_over_p);
    round = 0;

  }
}

//start button click
$(".start-btn").on("click", function () {

  var url = "https://opentdb.com/api.php?amount=5&category=17&type=multiple"

  $.ajax({
    url: url,
    method: "GET"
  })

    .then(function (response) {

      round = 0;

      trivia_JSON = response;

      newRound();

    });
});

//Event delegation for answer buttons
$("#answers").on("click", "button", function () {

  //prevent buttons from functioning after time is up 
  if (!out_of_time) {

    //check answer, increment correct / incorrect answer count
    if (this.getAttribute("data-value") === "true") {

      correct_answers++;
      $correct_answers.text(correct_answers);
      interval = clearInterval(interval);
      this.style.backgroundColor = "green";

    } else if (this.getAttribute("data-value") === "false") {

      incorrect_answers++
      $incorrect_answers.text(incorrect_answers);
      interval = clearInterval(interval);
      this.style.backgroundColor = "red";
      
    }

    //reveal correct/incorrect answers
    reveal();

    //wait a bit then show new trivia
    timeout = clearTimeout(timeout);
    timeout = setTimeout(newRound, (1000 * 2));

  }

});

