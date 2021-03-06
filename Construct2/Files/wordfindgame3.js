/**
* Wordfind.js 0.0.1
* (c) 2012 Bill, BunKat LLC.
* Wordfind is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/wordfind
*/

window.terminou = 0;

function reverse(s){
    return s.split("").reverse().join("");
}

function initialize() {
    sessionStorage.removeItem("dinheiro");
}

function initializeAcertos() {
    sessionStorage.removeItem("acertos");
}

function getValor() {
	if (typeof(Storage) !== "undefined") {
    		var dinheiro = sessionStorage.dinheiro
                if (dinheiro == null || dinheiro == "NaN") {
                   dinheiro = 0;
                   sessionStorage.dinheiro = dinheiro;
                }
	}
        
        
        //console.log("get => " + sessionStorage.dinheiro);
        return dinheiro;
}

function getValorAcertos() {
  if (typeof(Storage) !== "undefined") {
        var acertos = sessionStorage.acertos
                if (acertos == null || acertos == "NaN") {
                   acertos = 0;
                   sessionStorage.acertos = acertos;
                }
  }
        
        
        //console.log("get => " + sessionStorage.acertos);
        return acertos;
}

function setValor(newValue) {

       if (typeof(Storage) !== "undefined") {
                var dinheiro = sessionStorage.getItem("dinheiro");
                dinheiro = parseInt(dinheiro) + newValue;
                if (dinheiro < 0) {
                	dinheiro = 0;
                }
    		sessionStorage.setItem("dinheiro", dinheiro);
	}
        
        console.log("set dinheiro => " + dinheiro);	
}

function setValorAcertos(newValue) {

       if (typeof(Storage) !== "undefined") {
                var acertos = sessionStorage.getItem("acertos");
                acertos = parseInt(acertos) + newValue;
        sessionStorage.setItem("acertos", acertos);
  }
        
        console.log("set acertos => " + acertos);  
}

function atualizarDinheiro(newValue) {

       if (typeof(Storage) !== "undefined") {
                var dinheiro = sessionStorage.getItem("dinheiro");
                dinheiro = newValue;
        sessionStorage.setItem("dinheiro", dinheiro);
  }
        
        console.log("valor dinheiro => " + dinheiro); 
}

(function (document, $, wordfind3) {

  'use strict';

  /**
  * An example game using the puzzles created from wordfind.js. Click and drag
  * to highlight words.
  *
  * WordFindGame requires wordfind.js and jQuery.
  */

  /**
  * Initializes the WordFindGame object.
  *
  * @api private
  */
  var WordFindGame3 = function() {

    // List of words for this game
    var wordList;

    /**
    * Draws the puzzle by inserting rows of buttons into el.
    *
    * @param {String} el: The jQuery element to write the puzzle to
    * @param {[[String]]} puzzle: The puzzle to draw
    */
    var drawPuzzle = function (el, puzzle) {
      
      initializeAcertos();
      var output = '';
      // for each row in the puzzle
      for (var i = 0, height = puzzle.length; i < height; i++) {
        // append a div to represent a row in the puzzle
        var row = puzzle[i];
        output += '<div>';
        // for each element in that row
        for (var j = 0, width = row.length; j < width; j++) {
            // append our button with the appropriate class
            output += '<button class="puzzleSquare" x="' + j + '" y="' + i + '">';
            output += row[j] || '&nbsp;';
            output += '</button>';
        }
        // close our div that represents a row
        output += '</div>';
      }

      $(el).html(output);
    };

    /**
    * Draws the words by inserting an unordered list into el.
    *
    * @param {String} el: The jQuery element to write the words to
    * @param {[String]} words: The words to draw
    */
    var drawWords = function (el, words) {
      
      var output = '<ul>';
      for (var i = 0, len = words.length; i < len; i++) {
        var word = words[i];
        output += '<li class="word ' + word + '">' + word;
      }
      output += '</ul>';

      $(el).html(output);
    };


    /**
    * Game play events.
    *
    * The following events handle the turns, word selection, word finding, and
    * game end.
    *
    */

    // Game state
    var startSquare, selectedSquares = [], curOrientation, curWord = '';

    /**
    * Event that handles mouse down on a new square. Initializes the game state
    * to the letter that was selected.
    *
    */
    var startTurn = function () {
      $(this).addClass('selected');
      startSquare = this;
      selectedSquares.push(this);
      curWord = $(this).text();
    };



    /**
    * Event that handles mouse over on a new square. Ensures that the new square
    * is adjacent to the previous square and the new square is along the path
    * of an actual word.
    *
    */
    var select = function (target) {
      // if the user hasn't started a word yet, just return
      if (!startSquare) {
        return;
      }

      // if the new square is actually the previous square, just return
      var lastSquare = selectedSquares[selectedSquares.length-1];
      if (lastSquare == target) {
        return;
      }

      // see if the user backed up and correct the selectedSquares state if
      // they did
      var backTo;
      for (var i = 0, len = selectedSquares.length; i < len; i++) {
        if (selectedSquares[i] == target) {
          backTo = i+1;
          break;
        }
      }

      while (backTo < selectedSquares.length) {
        $(selectedSquares[selectedSquares.length-1]).removeClass('selected');
        selectedSquares.splice(backTo,1);
        curWord = curWord.substr(0, curWord.length-1);
      }


      // see if this is just a new orientation from the first square
      // this is needed to make selecting diagonal words easier
      var newOrientation = calcOrientation(
          $(startSquare).attr('x')-0,
          $(startSquare).attr('y')-0,
          $(target).attr('x')-0,
          $(target).attr('y')-0
          );

      if (newOrientation) {
        selectedSquares = [startSquare];
        curWord = $(startSquare).text();
        if (lastSquare !== startSquare) {
          // clear all selected squares 
          $('.selected').removeClass('selected');
          // add the first selected letter back
          $(startSquare).addClass('selected');
          lastSquare = startSquare;
        }
        curOrientation = newOrientation;
      }

      // see if the move is along the same orientation as the last move
      var orientation = calcOrientation(
          $(lastSquare).attr('x')-0,
          $(lastSquare).attr('y')-0,
          $(target).attr('x')-0,
          $(target).attr('y')-0
          );

      // if the new square isn't along a valid orientation, just ignore it.
      // this makes selecting diagonal words less frustrating
      if (!orientation) {
        return;
      }

      // finally, if there was no previous orientation or this move is along
      // the same orientation as the last move then play the move
      if (!curOrientation || curOrientation === orientation) {
        curOrientation = orientation;
        playTurn(target);
      }

    };
    
    var touchMove = function(e) {
      var xPos = e.originalEvent.touches[0].pageX;
      var yPos = e.originalEvent.touches[0].pageY;
      var targetElement = document.elementFromPoint(xPos, yPos);
      select(targetElement)
    };
    
    var mouseMove = function() { 
      select(this);
    };

    /**
    * Updates the game state when the previous selection was valid.
    *
    * @param {el} square: The jQuery element that was played
    */
    var playTurn = function (square) {

      // make sure we are still forming a valid word
      for (var i = 0, len = wordList.length; i < len; i++) {
        //if (wordList[i].indexOf(curWord + $(square).text()) === 0){ 
          $(square).addClass('selected');
          selectedSquares.push(square);
          curWord += $(square).text();
          break;
        //}
      }
    };

    /**
    * Event that handles mouse up on a square. Checks to see if a valid word
    * was created and updates the class of the letters and word if it was. Then
    * resets the game state to start a new word.
    *
    */
    var endTurn = function () {

      //window.terminou = 0;

      // see if we formed a valid word
      var ok = false;
      for (var i = 0, len = wordList.length; i < len; i++) {
        
        if (wordList[i] === curWord || wordList[i] == reverse(curWord)) {
          $('.selected').addClass('found');
          wordList.splice(i,1);
          $('.' + curWord).addClass('wordFound');
          //window.terminou = 1;
          //this.terminou = 1;
          //atualiza(1);
          setValor(50);
          setValorAcertos(1);
          ok = true;
        }

        if (wordList.length === 0) {
          $('.puzzleSquare').addClass('complete');
          //atualiza(2);
        }
      }

      // reset the turn, wrong selection
      $('.selected').removeClass('selected');
      startSquare = null;
      selectedSquares = [];
      curWord = '';
      curOrientation = null;
      //encontra o numero de palavras encontradas pelo jogador
      if (typeof(Storage) !== "undefined") {
        var acertos = sessionStorage.getItem("acertos");
        acertos = parseInt(acertos);
      }
      //se o jogador encontrou todas nao retira nenhum ponto dele
      if (!ok && (acertos != 5)){
      	setValor(-25);
      }
      return wordList.length;
      //if (window.terminou === 1) {
      //  return "terminou"
      //}
     
    };

    /**
    * Given two points, ensure that they are adjacent and determine what
    * orientation the second point is relative to the first
    *
    * @param {int} x1: The x coordinate of the first point
    * @param {int} y1: The y coordinate of the first point
    * @param {int} x2: The x coordinate of the second point
    * @param {int} y2: The y coordinate of the second point
    */
    var calcOrientation = function (x1, y1, x2, y2) {

      for (var orientation in wordfind3.orientations) {
        var nextFn = wordfind3.orientations[orientation];
        var nextPos = nextFn(x1, y1, 1);

        if (nextPos.x === x2 && nextPos.y === y2) {
          return orientation;
        }
      }

      return null;
    };

    //Fontes: https://trechodecodigo.wordpress.com/remover-acentos-javascript/
    //        https://www.w3schools.com/jsref/jsref_replace.asp
    var tratarPalavra = function(palavra){
      var palavraSemAcento = "";
      var caracterComAcento = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ";
      var caracterSemAcento = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC";

      //Troca acentos da palavra por caracteres normais
      for (var i = 0; i < palavra.length; i++){
        var char = palavra.substr(i, 1);
        var indexAcento = caracterComAcento.indexOf(char);
        if (indexAcento != -1) {
          palavraSemAcento += caracterSemAcento.substr(indexAcento, 1);
        } else {
          palavraSemAcento += char;
        }
      }

      //Remove alguns possiveis caracteres especiais
      palavraSemAcento = palavraSemAcento.replace(/ |-|&|#|@/g, "");

      return palavraSemAcento;
    } 

    var readJSON = function(caso){
      var palavras = "";
      var casos = "";

        $.ajax({
            url: "casos.json",
            //force to handle it as text
            dataType: "text",
            mimeType: "application/json",
            async: false,
            success: function(data) {

                //data downloaded so we call parseJSON function
                //and pass downloaded data
                casos = $.parseJSON(data);
                //now json variable contains data in json format
                //let's display a few items
                if (caso == 1){
                  palavras = casos.caso1respostas;
                }
                if (caso == 2){
                  palavras = casos.caso2respostas;
                }
                if (caso == 3){
                  palavras = casos.caso3respostas;
                }
            }
        });

        return palavras;
    };

    return {

      /**
      * Creates a new word find game and draws the board and words.
      *
      * Returns the puzzle that was created.
      *
      * @param {[String]} number: The number of case
      * @param {String} puzzleEl: Selector to use when inserting the puzzle
      * @param {String} wordsEl: Selector to use when inserting the word list
      * @param {Options} options: WordFind options to use when creating the puzzle
      */
      create: function(number, puzzleEl, wordsEl, options) {
        
        var words = readJSON(number);
        for (var i = 0; i < words.length; i++) {
          words[i] = tratarPalavra(words[i]);
        }
        wordList = words.slice(0).sort();

        var puzzle = wordfind3.newPuzzle(number, options);

        // draw out all of the words
        drawPuzzle(puzzleEl, puzzle);
        drawWords(wordsEl, wordList);

        // attach events to the buttons
        // optimistically add events for windows 8 touch
        if (window.navigator.msPointerEnabled) {
          $('.puzzleSquare').on('MSPointerDown', startTurn);
          $('.puzzleSquare').on('MSPointerOver', select);
          $('.puzzleSquare').on('MSPointerUp', endTurn);
        }
        else {
          $('.puzzleSquare').mousedown(startTurn);
          $('.puzzleSquare').mouseenter(mouseMove);
          $('.puzzleSquare').mouseup(endTurn);
          $('.puzzleSquare').on("touchstart", startTurn);
          $('.puzzleSquare').on("touchmove", touchMove);
          $('.puzzleSquare').on("touchend", endTurn);
        }

        return puzzle;
      },

      /**
      * Solves an existing puzzle.
      *
      * @param {[[String]]} puzzle: The puzzle to solve
      * @param {[String]} words: The words to solve for
      */
      solve: function(/*puzzle, words*/) {

        /*var solution = wordfind3.solve(puzzle, words).found;

        for( var i = 0, len = solution.length; i < len; i++) {
          var word = solution[i].word,
              orientation = solution[i].orientation,
              x = solution[i].x,
              y = solution[i].y,
              next = wordfind3.orientations[orientation];

          if (!$('.' + word).hasClass('wordFound')) {
            for (var j = 0, size = word.length; j < size; j++) {
              var nextPos = next(x, y, j);
              $('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
            }

            $('.' + word).addClass('wordFound');
          }
        }*/

//      console.log(this.terminou);
      },


    };
  };


  /**
  * Allow game to be used within the browser
  */
  window.wordfindgame3 = WordFindGame3();

}(document, jQuery, wordfind3));

