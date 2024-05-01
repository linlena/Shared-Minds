import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBpTMSJLUDNFoL_CYBdWTOmAJ1G1VDvLek",
  authDomain: "shared-minds-c89fd.firebaseapp.com",
  databaseURL: "https://shared-minds-c89fd-default-rtdb.firebaseio.com",
  projectId: "shared-minds-c89fd",
  storageBucket: "shared-minds-c89fd.appspot.com",
  messagingSenderId: "456443820332",
  appId: "1:456443820332:web:9e7a531fb2db7692a25489"
};

const app = initializeApp(firebaseConfig);
var db = getDatabase();

// SETTING DEFAULT VALUES (in Firebase)
const defaults = {
  sec3: "3.1 Eligibility: By participating in the Project, you represent and warrant that you are of legal age and have the legal capacity to enter into these Terms. \n 3.2 User Responsibilities: You agree to provide accurate and complete information when using the Software, comply with all applicable laws and regulations while participating in the Project, and respect the privacy and rights of other participants and users.",
  sec4: "4.1 Registration: In order to access certain features of the Service, you may be required to register and provide accurate information. The key word here is “may” because no registration is actually required whatsoever. \n 4.2 Accuracy of Information: You agree to provide accurate, current, and complete information during the registration process and to update your information promptly if it changes. \n 4.3 Account Security: You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.",
  sec7: "7.1 Data Collection: The Software may collect certain information and data about your interactions and usage patterns pertaining to your use of the Software in accordance with our Privacy Policy. By using the Software, you consent to the collection and use of your information as described in our Privacy Policy, including but not limited to: usage statistics, device information, location data (if applicable), and other relevant data necessary for the operation of the Software. \n 7.2 Data Usage: We may use the collected data for purposes including but not limited to: improving the Software and user experience, providing support and customer service, and research and analytics.",
  sec8: "8.1 Ownership: Lena Lin retains all rights, title, and interest in and to the Service, including all intellectual property rights. \n 8.2 License: Subject to your compliance with these Terms, Lena Lin grants you a limited, non-exclusive, non-transferable license to use the Service for your participation in the Project, and for your personal and non-commercial use.",
  sec11: "We reserve the right to suspend or terminate your participation in the Project and use of the Service at any time, with or without cause, and without notice or liability to you. You agree to indemnify and hold harmless Lena Lin and her affiliates, officers, directors, employees, and agents from any and all claims, liabilities, damages, costs, and expenses, including attorneys' fees, arising from your use of the Service or your violation of these Terms.",
  sec12: "We reserve the right to modify or revise these Terms at any time. By continuing to participate in the Project or use the Service after such changes, you agree to be bound by the revised Terms."
};
function initializeDefaultValues() {
  for (const secID in defaults) {
    const defaultValue = defaults[secID];
  
    set(ref(db, `defaults/${secID}`), defaultValue)
      .then(() => {
        console.log(`${secID} set to default value: ${defaultValue}`);
      })
      .catch((error) => {
        console.error(`Error setting ${secID} to default value:`, error);
      });
  }
}

// LOAD DOM
document.addEventListener('DOMContentLoaded', () => {
  initializeDefaultValues();
  const editableText = document.querySelectorAll('[contenteditable="true"]');

  // for each editable section ( 3, 4, 7, 8, 11, and 12)
  editableText.forEach(textElement => {
    const secID = textElement.id;

    // retrieve default value
    const defaultRef = ref(db, `defaults/${secID}`);

    onValue(defaultRef, (snapshot) => {
      const defaultValue = snapshot.val();
      if (defaultValue) {
        textElement.innerText = defaultValue;
      }
    });

    // retrieve current value 
    const currentRef = ref(db, `current/${secID}`);

    onValue(currentRef, (snapshot) => {
      const currentValue = snapshot.val();
      if (currentValue) {
        textElement.innerText = currentValue;
      }
    });
  });

  // AGREE BUTTON (saves current value to Firebase) 
  document.getElementById('agreeButton').addEventListener('click', () => {
    editableText.forEach(textElement => {
      const secID = textElement.id;
      const newText = textElement.innerText.trim();

      set(ref(db, `current/${secID}`), newText)
        .then(() => {
          console.log(`${secID} updated successfully.`);
        })
        .catch((error) => {
          console.error(`Error updating ${secID}:`, error);
        });
    });
  });

  // DISAGREE BUTTON (resets current values to default values) 
  document.getElementById('disagreeButton').addEventListener('click', () => {
    editableText.forEach(textElement => {
      const secID = textElement.id;
      const defaultRef = ref(db, `defaults/${secID}`);

      onValue(defaultRef, (snapshot) => {
        const defaultValue = snapshot.val();
        if (defaultValue) {
          textElement.innerText = defaultValue;
          set(ref(db, `current/${secID}`), defaultValue) 
            .then(() => {
              console.log(`${secID} reset to default.`);
            })
            .catch((error) => {
              console.error(`Error resetting ${secID} to default:`, error);
            });
        }
      });
    });
  });
});


