import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, update, set, push, onChildAdded, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

const replicateProxy = "https://replicate-api-proxy.glitch.me"

let isInteracting = false;
let isEditing = false;
let editingObject = null;
let objects = {};

// ML input boxes
const image_container = document.getElementById("image_container");
var input_image_field = document.createElement("input");
input_image_field.type = "text";
input_image_field.id = "input_image_prompt";
input_image_field.value = "Text to image Stable Diffusion model for modeling worms";
input_image_field.size = 100;

image_container.prepend(input_image_field);

input_image_field.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        askForPicture(input_image_field.value);
    }
});

const text_container = document.getElementById("text_container");
var input_field = document.createElement("input");
input_field.type = "text";
input_field.id = "input_prompt";
input_field.value = "Text to image Llama 2 model for modeling worms";
input_field.size = 100;
text_container.prepend(input_field);
input_field.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        askForWords(input_field.value);
    }
});

// Get the input box and the canvas element
const canvas = document.createElement('canvas');
canvas.setAttribute('id', 'myCanvas');
canvas.style.position = 'absolute';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.left = '0';
canvas.style.top = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
document.body.appendChild(canvas);
console.log('canvas', canvas.width, canvas.height);

const mainDiv = document.createElement('div');
mainDiv.style.position = 'absolute';
mainDiv.style.left = '0%';
mainDiv.style.top = '0%';
mainDiv.style.width = '100%';
mainDiv.style.height = '100%';
mainDiv.style.zIndex = '0';
mainDiv.style.backgroundImage = 'forest.jpg';  
mainDiv.style.backgroundSize = 'cover';  
document.body.appendChild(mainDiv);

const inputBox = document.createElement('input');
inputBox.setAttribute('type', 'text');
inputBox.setAttribute('id', 'inputBox');
inputBox.setAttribute('placeholder', 'Enter text here');
inputBox.style.position = 'absolute';
inputBox.style.left = '50%';
inputBox.style.top = '50%';
inputBox.style.transform = 'translate(-50%, -50%)';
inputBox.style.zIndex = '100';
inputBox.style.fontSize = '30px';
inputBox.style.fontFamily = 'Arial';
document.body.appendChild(inputBox);

// Add event listener to the input box
inputBox.addEventListener('keydown', function (event) {
    // Check if the Enter key is pressed

    if (event.key === 'Enter') {
        // const inputValue = inputBox.value;
        const inputBoxRect = inputBox.getBoundingClientRect();
        const x = inputBoxRect.left;
        const y = inputBoxRect.top;
        // Add image to the database
        const user = auth.currentUser;
        if (!user) {
            document.getElementById('inputBox').value = "Please Log in";
            return;
        }
        let userName = user.displayName;
        if (!userName) userName = user.email.split("@")[0];
        const data = { type: 'image', position: { x: x, y: y }, imageSrc: 'worm.png', userName: userName };
        if (isEditing) {
            console.log("update editing", editingObject.key, data);
            updateJSONFieldInFirebase('texts', editingObject.key, data);
            isEditing = false;
        } else {
            addNewThingToFirebase('texts', data);
        }
        // Clear the input box
        inputBox.value = '';
        //don't draw it locally until you hear back from firebase
    }
});

function redrawAll() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.font = '30px Arial';
    // ctx.fillStyle = 'black';
    // for (let key in objects) {
    //     const object = objects[key];
    //     if (object.type === 'text') {
    //         ctx.fillText(object.userName + ": " + object.text, object.position.x, object.position.y,);
    //     }
    // }
    for (let key in objects) {
        const object = objects[key];
        if (object.type === 'image') {
            const img = new Image();

            const imageWidth = 10;
            const imageHeight = 10;

            img.onload = function () {
                img.width = imageWidth;
                img.height = imageHeight;

                ctx.drawImage(img, object.position.x, object.position.y);
            };

            img.src = object.imageSrc;
        }
    }
}

// document.addEventListener('keydown', (event) => {

//     if (event.key === 'Escape') {
//         isEditing = false;
//         inputBox.value = "";
//     } else if (isEditing && event.shiftKey && (event.key === 'Backspace' || event.key === 'Delete')) {
//         console.log("delete");
//         deleteFromFirebase('texts', editingObject.key);
//     }
// });





// // Add event listener to the document for mouse down event
// mainDiv.addEventListener('mousedown', (event) => {
//     // Set the location of the input box to the mouse locatio
//     isInteracting = true;
//     editingObject = findNearbyObjects(event.clientX, event.clientY, 150);
//     if (editingObject) {
//         isEditing = true
//         console.log("editing", isEditing);
//         inputBox.value = editingObject.text;
//         inputBox.style.left = (editingObject.position.x + 150) + 'px';
//         inputBox.style.top = (editingObject.position.y - 10) + 'px';
//         inputBox.style.color = "red";

//     } else {
//         isEditing = false;
//         inputBox.style.left = event.clientX + 'px';
//         inputBox.style.top = event.clientY + 'px';
//         inputBox.style.color = "black";
//         inputBox.value = "";
//     }
//     inputBox.focus();

// });
// mainDiv.addEventListener('mousemove', (event) => {
//     // Set the location of the input box to the mouse location
//     if (isInteracting && !isEditing) {
//         inputBox.style.left = event.clientX + 'px';
//         inputBox.style.top = event.clientY + 'px';
//     }
// });
// mainDiv.addEventListener('mouseup', (event) => {
//     isInteracting = false;
// });

////FIREBASE STUFF

let db, auth, app;
let googleAuthProvider;
let appName = "SharedMinds2DAuthExample";
initFirebase();

function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyBpTMSJLUDNFoL_CYBdWTOmAJ1G1VDvLek",
        authDomain: "shared-minds-c89fd.firebaseapp.com",
        databaseURL: "https://shared-minds-c89fd-default-rtdb.firebaseio.com",
        projectId: "shared-minds-c89fd",
        storageBucket: "shared-minds-c89fd.appspot.com",
        messagingSenderId: "456443820332",
        appId: "1:456443820332:web:9e7a531fb2db7692a25489"
      };
    app = initializeApp(firebaseConfig);
    //make a folder in your firebase for this example


    db = getDatabase();
    auth = getAuth();
    googleAuthProvider = new GoogleAuthProvider();

    subscribeToData('texts');
}

function findNearbyObjects(x, y, radius) {
    let closeObject = null;
    let smallestDistance = Infinity;
    for (let key in objects) {
        const object = objects[key];
        const distance = Math.sqrt((object.position.x - x) ** 2 + (object.position.y - y) ** 2);
        if (distance < radius && distance < smallestDistance) {
            closeObject = object;
            smallestDistance = distance;
        }
    }
    console.log("closest object", closeObject);
    return closeObject;
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log("userino is signed in", user);
        showLogOutButton(user);
        // ...
    } else {
        console.log("userino is signed out");
        showLoginButtons();
        // User is signed out
        // ...
    }
});



function addNewThingToFirebase(folder, data) {
    //firebase will supply the key,  this will trigger "onChildAdded" below
    const dbRef = ref(db, appName + '/' + folder);
    const newKey = push(dbRef, data).key;
    return newKey; //useful for later updating
}

function subscribeToData(folder) {
    //get callbacks when there are changes either by you locally or others remotely
    const commentsRef = ref(db, appName + '/' + folder + '/');
    onChildAdded(commentsRef, (data) => {
        console.log("added", data, data.key, data.val());
        let localData = data.val();
        localData.key = data.key;
        objects[data.key] = localData;
        redrawAll();
    });
    onChildChanged(commentsRef, (data) => {
        console.log("changed", data.key, data.val());
        objects[data.key] = data.val();
        redrawAll();
    });
    onChildRemoved(commentsRef, (data) => {
        console.log("removed", data, data.key, data.val());
        delete objects[data.key];
        isEditing = false;
        inputBox.value = "";
        inputBox.style.color = "black";
        redrawAll();
    });
}



////THIS EXAMPLE IS NOT USING THESE FUNCTIONS
function updateJSONFieldInFirebase(folder, key, data) {
    console.log(appName + '/' + folder + '/' + key)
    const dbRef = ref(db, appName + '/' + folder + '/' + key);
    update(dbRef, data);
}

function deleteFromFirebase(folder, key) {
    console.log("deleting", appName + '/' + folder + '/' + key);
    const dbRef = ref(db, appName + '/' + folder + '/' + key);
    set(dbRef, null);
}

function setDataInFirebase(folder, key, data) {
    //if it doesn't exist, it adds (pushes) with you providing the key
    //if it does exist, it overwrites
    const dbRef = ref(db, appName + '/' + folder)
    set(dbRef, data);
}

function getStuffFromFirebase() {
    //make a one time ask, not a subscription
    const dbRef = ref(db, appName + folder);
    onValue(dbRef, (snapshot) => {
        console.log("here is a snapshot of everyting", snapshot.val());
    });
}


let authDiv = document.createElement("div");
authDiv.style.position = "absolute";
authDiv.style.top = "10%";
authDiv.style.left = "85%";
authDiv.style.width = "150px";
//authDiv.style.height = "150px";
authDiv.style.backgroundColor = "lightpink";
authDiv.style.border = "1px solid black";
authDiv.style.padding = "10px";
authDiv.style.zIndex = "3000";
document.body.appendChild(authDiv);


function showLogOutButton(user) {
    authDiv.innerHTML = "";
    let userNameDiv = document.createElement("div");
    if (user.photoURL) {
        let userPic = document.createElement("img");
        userPic.src = user.photoURL;
        userPic.style.width = "50px";
        userPic.style.height = "50px";
        authDiv.appendChild(userPic);
    }
    if (user.displayName) {
        userNameDiv.innerHTML = user.displayName;
    } else {
        userNameDiv.innerHTML = user.email;
    }
    let logOutButton = document.createElement("button");
    authDiv.appendChild(userNameDiv);
    logOutButton.innerHTML = "Log Out";
    logOutButton.setAttribute("id", "logOut");
    logOutButton.setAttribute("class", "authButton");
    authDiv.appendChild(logOutButton);
    document.getElementById("logOut").addEventListener("click", function () {
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log("signed out");
        }).catch((error) => {
            // An error happened.
            console.log("error signing out");
        });
    });

}

function showLoginButtons() {
    authDiv.innerHTML = "";
    let signUpWithGoogleButton = document.createElement("button");
    signUpWithGoogleButton.innerHTML = "Google Login";
    signUpWithGoogleButton.setAttribute("id", "signInWithGoogle");
    signUpWithGoogleButton.setAttribute("class", "authButton");
    authDiv.appendChild(signUpWithGoogleButton);

    authDiv.appendChild(document.createElement("br"));
    authDiv.appendChild(document.createElement("br"));

    let emailDiv = document.createElement("div");
    emailDiv.innerHTML = "Email";
    authDiv.appendChild(emailDiv);

    let emailInput = document.createElement("input");
    emailInput.setAttribute("id", "email");
    emailInput.setAttribute("class", "authInput");
    emailInput.setAttribute("type", "text");
    emailInput.setAttribute("placeholder", "email@email.com");
    authDiv.appendChild(emailInput);

    let passwordInput = document.createElement("input");
    passwordInput.setAttribute("id", "password");
    passwordInput.setAttribute("type", "password");
    passwordInput.setAttribute("class", "authInput");
    passwordInput.setAttribute("placeholder", "password");
    passwordInput.setAttribute("suggest", "current-password");
    passwordInput.setAttribute("autocomplete", "on");
    authDiv.appendChild(passwordInput);

    let signUpWithEmailButton = document.createElement("button");
    signUpWithEmailButton.innerHTML = "Sign Up";
    signUpWithEmailButton.setAttribute("id", "signUpWithEmail");
    signUpWithEmailButton.setAttribute("class", "authButton");
    authDiv.appendChild(signUpWithEmailButton);

    let signInWithEmailButton = document.createElement("button");
    signInWithEmailButton.innerHTML = "Sign In";
    signInWithEmailButton.setAttribute("id", "signInWithEmail");
    signInWithEmailButton.setAttribute("class", "authButton");
    authDiv.appendChild(signInWithEmailButton);

    document.getElementById("signInWithGoogle").addEventListener("click", function (event) {
        signInWithPopup(auth, googleAuthProvider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
        event.stopPropagation();
    });

    document.getElementById("signInWithEmail").addEventListener("click", function (event) {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
        event.stopPropagation();
    });

    document.getElementById("signUpWithEmail").addEventListener("click", function (event) {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
        event.stopPropagation();
    });
}

// ML STUFF
function placeImage(img) {
    var texture = new THREE.Texture(img);
    console.log(img, texture);
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: false });
    var geo = new THREE.PlaneGeometry(512, 512);
    var mesh = new THREE.Mesh(geo, material);

    const posInWorld = new THREE.Vector3();
    //remember we attached a tiny to the  front of the camera in init, now we are asking for its position

    in_front_of_you.position.set(0, 0, distanceFromCamera);  //base the the z position on camera field of view
    in_front_of_you.getWorldPosition(posInWorld);
    mesh.position.x = posInWorld.x;
    mesh.position.y = posInWorld.y;
    mesh.position.z = posInWorld.z;
    console.log(posInWorld);
    mesh.lookAt(0, 0, 0);
    //mesh.scale.set(10,10, 10);
    scene.add(mesh);
    images.push({ "object": mesh, "texture": texture });
}


async function askForPicture(inputField) {
    prompt = inputField.value;
    inputField.value = "Waiting for reply for:" + prompt;


    let data = {
        "version": "c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        input: {
            "prompt": prompt,
            "width": 1024,
            "height": 512,
        },
    };
    console.log("Asking for Picture Info From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    let url = "https://replicate-api-proxy.glitch.me" +" /replicate_api";
    console.log("url", url, "options", options);
    const picture_info = await fetch(url, options);
    //console.log("picture_response", picture_info);
    const proxy_said = await picture_info.json();

    if (proxy_said.output.length == 0) {
        alert("Something went wrong, try it again");
    } else {
        inputField.value = prompt;
        //Loading of the home test image - img1
        var incomingImage = new Image();
        incomingImage.crossOrigin = "anonymous";
        incomingImage.onload = function () {
            placeImage(incomingImage);
        };
        incomingImage.src = proxy_said.output[0];
    }
}

function animate() {
    requestAnimationFrame(animate);
    for (var i = 0; i < images.length; i++) {
        images[i].texture.needsUpdate = true;
    }
    renderer.render(scene, camera3D);
}