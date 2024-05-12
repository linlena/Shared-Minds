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
  sec0: "THESE TERMS AND CONDITIONS (\"TERMS\") GOVERN YOUR PARTICIPATION IN THIS PROJECT (\"PROJECT\") AND YOUR USE OF THE ASSOCIATED SOFTWARE (\"SOFTWARE\") AND SERVICES (\"SERVICE\") PROVIDED BY LENA LIN. BY PARTICIPATING IN THIS PROJECT AND USING ITS ACCOMPANYING SOFTWARE, YOU AGREE TO BE BOUND BY THESE TERMS. PLEASE READ THESE TERMS CAREFULLY BEFORE CONTINUING.",
  sec1: "<p>By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use the Service.</p>",
  sec2: "2.1 Description: The Service is the first third of a three-part project meant to critically engage participants in thinking about the subtle, unique issues raised by a chronically online society. This Project consists of a laser cut acrylic frame that resembles a falsely transparent butterfly png file. There is a removable background checkerboard pane with a QR code to these Terms.<br><br><u>In full transparency, all users who read the Terms and Conditions are granted permission to modify the Terms and Conditions according to their will. All changes are saved via the \“Disagree\” button, contractually binding following users until all changes are reverted to the original Terms via the \“Agree\” button.</u><br><br>Modifications are live and sync automatically. The Service may be modified, updated, or discontinued at any time without notice. We reserve the right to modify or discontinue the Service (or any part thereof) without notice at any time. <br> 2.2 Motive: Lena Lin reserves all rights to express her belief that labor is not fun due to the crushing weight of capitalistic standards, and even passion projects are constructed primarily to meet academic milestones.",
  sec3: "3.1 Eligibility: By participating in the Project, you represent and warrant that you are of legal age and have the legal capacity to enter into these Terms. \n 3.2 User Responsibilities: You agree to provide accurate and complete information when using the Software, comply with all applicable laws and regulations while participating in the Project, and respect the privacy and rights of other participants and users.",
  sec4: "<p>4.1 Registration: In order to access certain features of the Service, you may be required to register and provide accurate information. The key word here is “may” because no registration is actually required whatsoever. <br> 4.2 Accuracy of Information: You agree to provide accurate, current, and complete information during the registration process and to update your information promptly if it changes.<br>4.3 Account Security: You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.</p>",
  sec5: "<p>5.1 Acceptable Use: You agree to use the Service only for lawful purposes and in compliance with these Terms. You may not use the Service in any manner that could: <ul><li>Disable, overburden, or impair the Service</li><li>Attempt to gain unauthorized access to any part of the Service or its related systems or networks</li><li>Use the Service to harass, abuse, or harm others.</li></ul></p><p>5.2 Prohibited Conduct: You may not engage in any conduct that:<ul><li>Violates any applicable laws or regulations</li><li>Infringes the rights of others</li><li>Interferes with or disrupts the Service or servers or networks connected to the Service.</li></ul></p><p>5.3 User Content: You are solely responsible for any content, messages, or other information that you upload, post, or transmit through the Service (\"User Content\"). By submitting or posting User Content, you grant Lena Lin a worldwide, royalty-free, perpetual, irrevocable, non-exclusive, and fully sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, and display such User Content.</p>",
  sec6: "<p>Your privacy is important to us. Please review our <a href=\"https://www.youtube.com/watch?v=4kR5Pifi8h0\">Privacy Policy</a> to understand how we collect, use, and protect your personal information.</p>",
  sec7: "7.1 Data Collection: The Software may collect certain information and data about your interactions and usage patterns pertaining to your use of the Software in accordance with our Privacy Policy. By using the Software, you consent to the collection and use of your information as described in our Privacy Policy, including but not limited to: usage statistics, device information, location data (if applicable), and other relevant data necessary for the operation of the Software. \n 7.2 Data Usage: We may use the collected data for purposes including but not limited to: improving the Software and user experience, providing support and customer service, and research and analytics.",
  sec8: "8.1 Ownership: Lena Lin retains all rights, title, and interest in and to the Service, including all intellectual property rights. \n 8.2 License: Subject to your compliance with these Terms, Lena Lin grants you a limited, non-exclusive, non-transferable license to use the Service for your participation in the Project, and for your personal and non-commercial use.",
  sec9: "<p>9.1 Context: Winston Smith is a low-ranking member of the ruling Party in London, in the nation of Oceania. Everywhere Winston goes, even his own home, the Party watches him through telescreens; everywhere he looks he sees the face of the Party\'s seemingly omniscient leader, a figure known only as Big Brother. The Party controls everything in Oceania, even the people\'s history and language. Currently, the Party is forcing the implementation of an invented language called Newspeak, which attempts to prevent political rebellion by eliminating all words related to it. Even thinking rebellious thoughts is illegal. Such thoughtcrime is, in fact, the worst of all crimes.<br>9.2 Introduction: As the novel opens, Winston feels frustrated by the oppression and rigid control of the Party, which prohibits free thought, sex, and any expression of individuality. Winston dislikes the party and has illegally purchased a diary in which to write his criminal thoughts. He has also become fixated on a powerful Party member named O\'Brien, whom Winston believes is a secret member of the Brotherhood—the mysterious, legendary group that works to overthrow the Party.<br>9.3 Rising Action: Winston works in the Ministry of Truth, where he alters historical records to fit the needs of the Party. He notices a coworker, a beautiful dark-haired girl, staring at him, and worries that she is an informant who will turn him in for his thoughtcrime. He is troubled by the Party\'s control of history: the Party claims that Oceania has always been allied with Eastasia in a war against Eurasia, but Winston seems to recall a time when this was not true. The Party also claims that Emmanuel Goldstein, the alleged leader of the Brotherhood, is the most dangerous man alive, but this does not seem plausible to Winston. Winston spends his evenings wandering through the poorest neighborhoods in London, where the proletarians, or proles, live squalid lives, relatively free of Party monitoring.<br>9.4 Catalyst: One day, Winston receives a note from the dark-haired girl that reads \“I love you.\” She tells him her name, Julia, and they begin a covert affair, always on the lookout for signs of Party monitoring. Eventually they rent a room above the secondhand store in the prole district where Winston bought the diary. This relationship lasts for some time. Winston is sure that they will be caught and punished sooner or later.",
  sec10: "<p>10.1 No Warranty: The Software is provided on an \"as is\" and \"as available\" basis, without warranties of any kind, either express or implied. Lena Lin makes no representations or warranties of any kind regarding the Service. <br>10.2 Limitation of Liability: To the fullest extent permitted by law, in no event shall Lena Lin be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your participation in the Project or use of or inability to use the Service.</p>",
  sec11: "We reserve the right to suspend or terminate your participation in the Project and use of the Service at any time, with or without cause, and without notice or liability to you. You agree to indemnify and hold harmless Lena Lin and her affiliates, officers, directors, employees, and agents from any and all claims, liabilities, damages, costs, and expenses, including attorneys' fees, arising from your use of the Service or your violation of these Terms.",
  sec12: "We reserve the right to modify or revise these Terms at any time. By continuing to participate in the Project or use the Service after such changes, you agree to be bound by the revised Terms.",
  sec13: "<p>These Terms shall be governed by and construed in accordance with the laws of New York State, without regard to its conflict of law principles.</p>",
  sec14: "<p>If you have any questions about these Terms or our Service, please contact us at linlenaa@gmail.com.</p>"
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
        textElement.innerHTML = defaultValue;
      }
    });

    // retrieve current value 
    const currentRef = ref(db, `current/${secID}`);

    onValue(currentRef, (snapshot) => {
      const currentValue = snapshot.val();
      if (currentValue) {
        textElement.innerHTML = currentValue;
      }
    });
  });

  // AGREE BUTTON (saves current value to Firebase) 
  // DISAGREE
  document.getElementById('agreeButton').addEventListener('click', () => {
    editableText.forEach(textElement => {
      const secID = textElement.id;
      const newText = textElement.innerHTML.trim();

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
  // AGREE
  document.getElementById('disagreeButton').addEventListener('click', () => {
    editableText.forEach(textElement => {
      const secID = textElement.id;
      const defaultRef = ref(db, `defaults/${secID}`);

      onValue(defaultRef, (snapshot) => {
        const defaultValue = snapshot.val();
        if (defaultValue) {
          textElement.innerHTML = defaultValue;
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

    const img1 = document.getElementById('img1');
    img1.style.display = "block";
  });
});


