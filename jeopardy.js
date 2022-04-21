// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const NUM_CATEGORIES = 6
const HEIGHT = 5
let categories = [];
// let board = document.querySelector("#board") // #board is not even there in HTML
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
let countViewedAnswers = 0

async function getCategoryIds() {
    const response = await axios.get('http://jservice.io/api/categories?count=20');
    let catIds = response.data.map(c => c.id);
    return _.sampleSize(catIds, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  let response = await axios.get(`http://jservice.io/api/category?id=${catId}`);
  let cat = response.data;
  let allClues = cat.clues;
  let randomClues = _.sampleSize(allClues, HEIGHT);
  let clues = randomClues.map(c => ({
    question: c.question,
    answer: c.answer,
    showing: null,
  }));

  return { title: cat.title, clues: clues };
}


          

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

 async function fillTable() {
    
    $("#game-table thead").empty();
    let $tr = $("<tr>");
    
    for (let categId = 0; categId < NUM_CATEGORIES; categId++) {
        console.log("hello1", categories[categId]);
      $tr.append($("<th>").text(categories[categId].title));
    }
    $("#game-table thead").append($tr);
  
   
    $("#game-table tbody").empty();
    for (let cluId = 0; cluId < HEIGHT; cluId++) {
      let $tr = $("<tr>");
      for (let categId = 0; categId < NUM_CATEGORIES; categId++) {
        $tr.append($("<td>").attr("id", `${categId}-${cluId}`).text("?"));
      }
      $("#game-table tbody").append($tr);
    }
  }




/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

 function handleClick(evt) {
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];
    console.log("clues", clue);
    let msg;
  
    if (!clue.showing) {
      msg = clue.question;
      clue.showing = "question";
    } else if (clue.showing === "question") {
      msg = clue.answer;
      clue.showing = "answer";
      countViewedAnswers += 1; // counting all answers here
    } else {
      // already showing answer; ignore
      return
    }
    
    $(`#${catId}-${clueId}`).html(msg);

    // adding win condition to notify user they won
    if (countViewedAnswers == 30){  // since answers cannot exceed 30
      alert('Great job, you answered all the questions!')
    }
  }
/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

 async function setupAndStart() {
    let catIds = await getCategoryIds();

    categories = []; // need to reset this to empty so game restarts next time
    countViewedAnswers = 0; // need to reset this to 0 so game restarts next time

    for (let catId of catIds) {
      categories.push(await getCategory(catId));
    }
    fillTable();
  }
  
  $("#restart").on("click", setupAndStart);
  
  $(async function () {
      setupAndStart();
      console.log("goodbye", $("#game-table"));
      $("#game-table").on("click", "td", handleClick);
    }
  );