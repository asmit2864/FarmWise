const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();
const PORT = 2000;


const apiKey = 'LxcrYUWZz7XFD3X2XPgNkLsgjVY9KKPm';
const externalUserId = 'asmit';

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));


// ondemand
// Function to create a chat session
async function createChatSession() {
    try {
      const response = await axios.post(
        'https://api.on-demand.io/chat/v1/sessions',
        {
          pluginIds: [],
          externalUserId: externalUserId
        },
        {
          headers: {
            apikey: apiKey
          }
        }
      );
      return response.data.data.id; // Extract session ID
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }



     



  // crops route
app.post('/get-crops', async (req, res) => {
    // Extract data from the form fields
    const {  size_unit,field_size, month, soil_type, city, water_availability } = req.body;
    
      // Function to submit a query
async function submitQuery(sessionId) {
  try {
    const response = await axios.post(
      `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
      {
        endpointId: 'predefined-openai-gpt4o',
        query: `Given the following agricultural conditions, provide a ranked list of the top 5 crops that can be efficiently grown. For each crop, explain why it is suitable for these conditions, along with its market demand and potential profitability. The conditions are:

Climate: Find the coordinates of ${city} and provide recommendations based on the climate of those coordinates in the month of ${month}.
Field size: Consider the field size, which is ${field_size} ${size_unit}.
Soil type: The soil type is ${soil_type}.
Water availability: The water availability is ${water_availability}, either in terms of rainfall, irrigation capacity, or other sources.
For each crop, please include:

Suitability: Explain how the crop fits the climate, soil type, water requirements, and field size.
Market Demand: Discuss the current and projected market demand for the crop in both local and global markets.
Profitability: Provide insights into the crop's potential for profitability, considering factors like yield, market prices, and cost of production. Include any relevant trends or opportunities that could affect the financial returns.Make sure to make the text look beautiful by boldening the headings and subheadings and not using * symbols."`,
        pluginIds: ['plugin-1713924030', 'plugin-1726230330', 'plugin-1717467138', 'plugin-1717419365'],
        responseMode: 'sync'
      },
      // pluginsIds: Internet plugin, Crops Info, Crop suggestion, Weather details based on cordinates
      {
        headers: {
          apikey: apiKey
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting query:', error);
    throw error;
  }
}
    
    // Main function to execute the API calls
    async function getResult() {
      try {
        const sessionId = await createChatSession();
        // console.log('Session ID:', sessionId);
        const queryResponse = await submitQuery(sessionId);
        
        return (queryResponse.data.answer);
      } catch (error) {
        console.error('Error in main function:', error);
      }
    }

    const result= await getResult();

             // Send a new page with the paragraph
    res.send(`
      <html>
  <head>
    <title>Crop Suggestion Result</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
    <div style="max-width: 1000px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #2c3e50; font-size: 2rem; text-align: center; margin-bottom: 20px;">Your Crop Suggestions</h1>
      
      <pre style="white-space: pre-wrap; word-wrap: break-word; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-size: 1rem; line-height: 1.6; color: #34495e;">
        <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 1rem;">${result}</p>
      </pre>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="Farmers.html"><button style="background-color: #27ae60; color: white; font-size: 1rem; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
          Talk to an Experienced Farmer
        </button></a>
      </div>
    </div>
  </body>
</html>

  `);
    
    
});

app.post('/getWorkers', async (req, res) => {
  // Extract data from the form fields
  const {  city } = req.body;
    
  // Function to submit a query
async function submitQuery(sessionId) {
try {
const response = await axios.post(
  `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
  {
    endpointId: 'predefined-openai-gpt4o',
    query: `Get me a well organised numbered list of workers nearest to the city ${city} with thier names, cities and contacts. Make sure not to add anything else just the list`,
    pluginIds: ['plugin-1726272280'],
    responseMode: 'sync'
  },
  // pluginsIds: Labour'sDemoSheet
  {
    headers: {
      apikey: apiKey
    }
  }
);
return response.data;
} catch (error) {
console.error('Error submitting query:', error);
throw error;
}
}

// Main function to execute the API calls
async function getResult() {
  try {
    const sessionId = await createChatSession();
    // console.log('Session ID:', sessionId);
    const queryResponse = await submitQuery(sessionId);
    
    return (queryResponse.data.answer);
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

const result1= await getResult();

         // Send a new page with the paragraph
res.send(`
  <html>
<head>
<title>Workers Nearest to Your Location</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
<div style="max-width: 1000px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
  <h1 style="color: #2c3e50; font-size: 2rem; text-align: center; margin-bottom: 20px;">Your Crop Suggestions</h1>
  
  <pre style="white-space: pre-wrap; word-wrap: break-word; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-size: 1rem; line-height: 1.6; color: #34495e;">
    <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 1rem;">${result1}</p>
  </pre>
  
  <div style="text-align: center; margin-top: 20px;">
    <a href="index.html"><button style="background-color: #27ae60; color: white; font-size: 1rem; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      Home Page
    </button></a>
  </div>
</div>
</body>
</html>

`);
})


// Connect to MongoDB
mongoose.connect('mongodb+srv://asmit16903:asmit16903@gaming.kft4tbf.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('Connected to MongoDB')
})
.catch((err)=>{
    console.error('Error connecting to MongoDB');
})

// Homepage route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// LOGIN:

// Define User schema and model
const UserSchema = new mongoose.Schema({
    name:String,
    email:String,
    password: String
},
{
    timestamps:true
});

const User = mongoose.model('User', UserSchema);

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            res.redirect('/crop_suggestion.html');
        } else {
            res.send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




// SIGNUP:
// Signup route


app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const user = await User.findOne({ email });

        if (!user) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create a new user
            const newUser = new User({ name, email, password: hashedPassword });
            await newUser.save();

            // Redirect to login page
            res.redirect('/login.html');
        } else {
            // User already exists
            res.status(400).send("User already exists");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




// LOGOUT:
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});




// PROFILE
// API endpoint to fetch users
app.get('/users', async (req, res) => {
    const email = req.session.user.email;
    const users = await User.findOne({email});
    if(!users){
        res.send("Invalid user session");
    }
    else{
        res.json(users);
    }
});

// UPDATE PROFILE
app.post('/updateProfile', async (req, res) => {
    const {name, password} = req.body;

    try {
        const email = req.session.user.email;
        const user = await User.findOne({email});
        if(!user){
            res.send("Invalid user session");
        }
        else{
            user.name = name;
            user.password = bcrypt.hashSync(password, 10);
            await user.save();
            res.send("Changes saved successfully")
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
