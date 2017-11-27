var request = require('request');
var inquirer = require("inquirer");
var fullMovie = "";
var selectedLetter = "";
var selected = false;
var complete = true;

function Word(movie, year, actors){
	this.movie = movie,
	this.year = year,
	this.actors = actors,
	this.movieArray = [],
	this.chosenLetters = [],
	this.guesses = 10,
	this.answer = "",
	this.printWord = function(){
		var movieChar = "";
		for(var i = 0; i < this.movie.length; i++){
			movieChar = this.movie.charCodeAt(i);
			if((movieChar > 64 && movieChar < 91) || (movieChar > 96 && movieChar < 123)){
				var newLetter = new Letter(" _", String.fromCharCode(movieChar));
			} else {
				var newLetter = new Letter(" " + String.fromCharCode(movieChar), String.fromCharCode(movieChar));
			}
			fullMovie = fullMovie.concat(newLetter.display);
			this.movieArray.push(newLetter);
		}
		console.log(fullMovie);
	},
	this.checkAgainstChosenLetters = function(){
		selected = false;
		for(var i = 0; i < this.chosenLetters.length; i++){
			if(selectedLetter.toLowerCase() === this.chosenLetters[i].toLowerCase()){
				selected = true;
			}
		}
		if(selected === true){
			console.log("You've already selected that letter.");
			this.enterLetter(this);
		} else {
			this.validateCharacter();
		}
	},
	this.validateCharacter = function(){
		var selectedLetterNumber = selectedLetter.charCodeAt(0);
		this.answer = "Incorrect!";
		if((selectedLetterNumber > 64 && selectedLetterNumber < 91) || (selectedLetterNumber > 96 && selectedLetterNumber < 123)){
			for(var i = 0; i < this.movieArray.length; i++){
				if(selectedLetter.toLowerCase() === this.movieArray[i].letter.toLowerCase()){
					this.movieArray[i].display = " " + this.movieArray[i].letter;
					this.answer = "Correct!";
					fullMovie = fullMovie.concat(this.movieArray[i].display);
				} else{
					fullMovie = fullMovie.concat(this.movieArray[i].display);	
				}
			}
			complete = true;
			for(i = 0; i < this.movieArray.length; i++){
				if(this.movieArray[i].display === " _"){
					complete = false;
				}
			}
			if(complete === true){
				console.log("You win!");
				console.log(this.movie + " (" + this.year + ")");
				console.log("Staring: " + this.actors);
				movieSearch();
			} else {
				if(this.answer === "Incorrect!"){
					this.guesses = this.guesses - 1;
				}
				if(this.guesses === 0){
					console.log("No More Guesses Left! The Answer is:");
					console.log(this.movie + " (" + this.year + ")");
					console.log("Staring: " + this.actors);
					movieSearch();
				} else{
					if(this.answer === "Incorrect!"){
						console.log(this.answer + " You have " + this.guesses + " guesses left.");
						console.log(fullMovie);
						this.chosenLetters.push(selectedLetter);
						this.enterLetter(this);
					} else{
						console.log(this.answer);
						console.log(fullMovie);
						this.chosenLetters.push(selectedLetter);
						this.enterLetter(this);
					}
				}
			}
		} else{
			console.log("Invalid input.");
			this.enterLetter(this);
		}
	}
	this.enterLetter = function(newObject){
		inquirer.prompt([
			{
				name: "letter",
				message: "Please Select a Letter: "
			}
		]).then(function(answers){
			selectedLetter = answers.letter;
			fullMovie = "";
			newObject.checkAgainstChosenLetters();
		});
	};
};

function Letter(display, letter){
	this.display = display,
	this.letter = letter
}

function movieSearch(){
	fullMovie = "";
	var randomNumber = Math.floor((Math.random() * 10));;
	// Generate a random number between 65 & 90 to generate characters from the alphabet
	var randomMovie = Math.floor(Math.random() * ((90-65)+1) + 65);
	// Generate a random number between 1980 & 20147 to get more recent movies
	var randomYear = Math.floor(Math.random() * ((2017-1980)+1) + 1980);
	// Generate a random number between 1 & 2 to pull movies from only the first 2 pages of the api call
	var randomPage = Math.floor((Math.random() * 2) + 1);
	var movieTitle = "";
	// URL for the first api call for the random movie
	var queryUrl = 'http://www.omdbapi.com/?s="'+String.fromCharCode(randomMovie)+'"*&y='+randomYear+'&page='+randomPage+'&type=movie&apikey=trilogy';
	var queryUrl2 = "";
	var languageArray = [];
	var votes = 0;
	// First api request to iMDB
	request(queryUrl, function(error, response, body){
		if (!error && response.statusCode === 200){
			// Movie that was randomly generated
			movieTitle = JSON.parse(body).Search[randomNumber].Title;
			// URL for the second api call to get the movie info
			queryUrl2 = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy";
			// Second api request to iMDB
			request(queryUrl2, function(error, response, body){
				if (!error && response.statusCode === 200){
					// Array created in case there are multiple languages
					if(JSON.parse(body).Language === undefined){
						movieSearch();
					} else{
						languageArray = JSON.parse(body).Language.split(", ");
						// Remove any commas from the vote number
						votes = JSON.parse(body).imdbVotes.replace(/\,/g,"");
						// Check to make sure that it is an english movie and at least 20,000 votes on iMDB
						if(languageArray[0] === "English" && parseFloat(votes) > 20000){
							console.log("New Game!");
							var newWord = new Word(JSON.parse(body).Title, JSON.parse(body).Year, JSON.parse(body).Actors)
							newWord.printWord();
							newWord.enterLetter(newWord);
						} else {
							movieSearch();
						}
					}
				} else{
					movieSearch();
				}
			});
		} else{
			movieSearch();
		}
	});
}

function enterLetter(movieObject){
	inquirer.prompt([
		{
			name: "letter",
			message: "Please Select a Letter: "
		}
	]).then(function(answers){
		selectedLetter = answers.letter
		movieObject();
	});
};

movieSearch();