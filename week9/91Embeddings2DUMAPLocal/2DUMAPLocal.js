// Import UMAP library from a CDN
import { UMAP } from "https://cdn.skypack.dev/umap-js";

// Create a canvas element and set its attributes
let canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "absolute";
canvas.style.left = "0px";
canvas.style.top = "0px";
document.body.append(canvas);
let ctx = canvas.getContext('2d');

// Create an input field for users to enter a universal motto
let createUniverseField = document.createElement('input');
createUniverseField.type = "text";
createUniverseField.style.position = "absolute";
createUniverseField.style.left = "80%";
createUniverseField.style.top = "90%";
createUniverseField.style.transform = "translate(-50%,-50%)";
createUniverseField.style.width = "350px";
createUniverseField.id = "createUniverse";
createUniverseField.placeholder = "Enter a motto and press Enter to create a universe";
document.body.append(createUniverseField);

// Listen for the 'Enter' key press event on the input field to create a universe
createUniverseField.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        let universalMotto = createUniverseField.value;
        console.log("create universe", universalMotto);
        createUniverse(universalMotto);
    }
});

// Initialize the application
init();

// Function to initialize the application
function init() {
    // Retrieve embeddings and sentences from local storage if available and run UMAP
    let embeddingsAndSentences = JSON.parse(localStorage.getItem("embeddings"));
    if (embeddingsAndSentences) {
        runUMAP(embeddingsAndSentences);
    } else {
        console.log("no embeddings");
    }
}

// Function to place a sentence on the canvas
function placeSentence(sentence, fitting) {
    console.log("placeSentence", sentence, fitting);
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(100,100,100,127)";
    let w = ctx.measureText(sentence).width;
    ctx.fillText(sentence, fitting[0] * window.innerWidth - w / 2, fitting[1] * window.innerHeight);
}

// Function to create a universe based on a given motto
async function createUniverse(universalMotto) {
    // Show loading cursor
    document.body.style.cursor = "progress";

    // Prepare prompt for generating sentences
    let text = "give me a json object with 36 short descriptions of actions that someone might take if told the motto" + universalMotto + ", organized into 6 categories of type of actions";

    // Data for fetching sentences from OpenAI
    const data = {
        model: "gpt-3.5-turbo-instruct",
        prompt: text,
        temperature: 1,
        max_tokens: 1000,
    };

    // Fetch sentences from OpenAI
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    };
    const openAIProxy = "https://openai-api-proxy.glitch.me";
    const url = openAIProxy + "/AskOpenAI/";
    const response = await fetch(url, options);
    const openAI_json = await response.json();
    let arrayOfStrings = openAI_json.choices[0].text.split("\n");
    let sentences = "";
    for (let i = 0; i < arrayOfStrings.length; i++) {
        let thisSentence = arrayOfStrings[i].substring(1);
        if (thisSentence.length < 30) {
            continue;
        }
        console.log("prompt created", thisSentence);
        sentences += thisSentence + "\n";
    }

    // Data for fetching embeddings
    let embeddingData = {
        version: "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
        input: {
            inputs: sentences,
        },
    };
    options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(embeddingData),
    };
    const replicateProxy = "https://replicate-api-proxy.glitch.me";
    const replicateURL = replicateProxy + "/create_n_get/";
    const raw = await fetch(replicateURL, options)
    const embeddingsJSON = await raw.json();
    console.log("embeddingsJSON", embeddingsJSON.output);
    document.body.style.cursor = "auto";
    localStorage.setItem("embeddings", JSON.stringify(embeddingsJSON.output));
    runUMAP(embeddingsJSON.output)
}

// Function to run UMAP algorithm and place sentences on the canvas
function runUMAP(embeddingsAndSentences) {
    console.log("embeddingsAndSentences", embeddingsAndSentences);
    let embeddings = [];
    for (let i = 0; i < embeddingsAndSentences.length; i++) {
        embeddings.push(embeddingsAndSentences[i].embedding);
    }
    var myrng = new Math.seedrandom('hello.');
    let umap = new UMAP({
        nNeighbors: 6,
        minDist: .5,
        nComponents: 2,
        random: myrng,
        spread: .99,
    });
    let fittings = umap.fit(embeddings);
    fittings = normalize(fittings);
    for (let i = 0; i < embeddingsAndSentences.length; i++) {
        placeSentence(embeddingsAndSentences[i].input, fittings[i]);
    }
}

// Function to normalize an array of numbers
function normalize(arrayOfNumbers) {
    let max = [0, 0];
    let min = [0, 0];
    for (let i = 0; i < arrayOfNumbers.length; i++) {
        for (let j = 0; j < 2; j++) {
            if (arrayOfNumbers[i][j] > max[j]) {
                max[j] = arrayOfNumbers[i][j];
            }
            if (arrayOfNumbers[i][j] < min[j]) {
                min[j] = arrayOfNumbers[i][j];
            }
        }
    }
    for (let i = 0; i < arrayOfNumbers.length; i++) {
        for (let j = 0; j < 2; j++) {
            arrayOfNumbers[i][j] = (arrayOfNumbers[i][j] - min[j]) / (max[j] - min[j]);
        }
    }
    return arrayOfNumbers;
}
