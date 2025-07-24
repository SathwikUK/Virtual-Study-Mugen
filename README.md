<div align="center">
  <img src="./Screenshots/one.png" alt="VSM Logo" width="1200" />

# 👨‍💻 Virtual Study Mugen (VSM💌)

Virtual Study Mugen (VSM) is a collaborative study platform that empowers students to communicate effectively through real-time messaging and seamless file sharing. It enables users to exchange notes, documents, and study materials effortlessly, fostering an engaging learning environment where students can also form study groups. With a robust role-based system that clearly distinguishes between admin and student users, VSM ensures a secure, organized space for academic collaboration and resource sharing.
</div>

## 🧑‍🔧 Tech Stack

<table align="center">
  <tr>
    <td align="center" width="110">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" width="48" height="48" alt="Express" />
      <br><strong>Express</strong>
    </td>
    <td align="center" width="110">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" width="48" height="48" alt="MongoDB" />
      <br><strong>MongoDB</strong>
    </td>
    <td align="center" width="110">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="48" height="48" alt="Node.js" />
      <br><strong>Node.js</strong>
    </td>
    <td align="center" width="110">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="48" height="48" alt="React" />
      <br><strong>React</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="110">
      <img src="https://jwt.io/img/pic_logo.svg" width="48" height="48" alt="JWT" />
      <br><strong>JWT</strong>
    </td>
    <td align="center" width="110">
      <img src="https://nodemailer.com/nm_logo_200x136.png" width="48" height="48" alt="Nodemailer" />
      <br><strong>Nodemailer</strong>
    </td>
    <td align="center" width="110">
      <img src="https://socket.io/images/logo.svg" width="48" height="48" alt="Socket.io" />
      <br><strong>Socket.io</strong>
    </td>
    <td align="center" width="110">
      <img src="https://www.svgrepo.com/show/306500/openai.svg" width="48" height="48" alt="OpenAI" />
      <br><strong>OpenAI</strong>
    </td>
  </tr>
</table>

## ✨ Features

- ⚡ **RESTful API** — Well-structured endpoints for seamless integration
- 🔐 **Role Based Login** — Secure login system with distinct roles for admin and student
- 📱 **Responsive Design** — Optimized for a range of devices and screen sizes
- 💬 **Real-time Chat** — Connect and collaborate instantly
- 👥 **Group Creation** — Form study groups effortlessly
- 🛠 **Admin Panel** — Manage users and content efficiently
- 🎨 **Custom Themes** — Personalize your study environment with unique purple-inspired themes
- 🤖 **AI Assistance** — Leverage OpenAI integrations for enhanced learning and support

## 🛠 Setup & Installation

1. **Clone the repository**
```bash
git clone https://github.com/SathwikUK/Virtual-Study-Mugen
```

2. **Install dependencies for the root**
```bash
npm install
```

3. **Start the frontend**
```bash
cd vsm/frontend
npm install
npm run dev
```

4. **Set up the backend**
```bash
cd vsm/backend
npm install

# Create a .env file in the backend directory with the following content:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_16_digit_app_password
COHERE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your_custom_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
```

5. **Start the backend**
```bash
npm start
```

### 🗝 Environment Variables Guide:
- **MONGO_URI**: Your MongoDB Atlas connection string
- **EMAIL_HOST**: SMTP server host (smtp.gmail.com for Gmail)
- **EMAIL_PORT**: SMTP server port (587 for TLS)
- **EMAIL_USER**: Your Gmail address
- **EMAIL_PASS**: Your Gmail App Password (16-digit)
- **COHERE_API_KEY**: Your Cohere API key
- **JWT_SECRET**: Custom secret key for JWT tokens
- **FRONTEND_URL**: Frontend application URL

### 🔏 Important Security Notes:
1. Never commit your .env file to version control
2. Add .env to your .gitignore file
3. Use strong, unique values for JWT_SECRET
4. For Gmail, use App Password instead of account password
5. Keep your API keys secure

## 📸 Workflow



<table>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/one.png" alt="Landing Page" />
      <p><strong>Landing Page</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/two.png" alt="Login Process" />
      <p><strong>Login Process</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/three.png" alt="Registration Page" />
      <p><strong>Registration Page</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/four.png" alt="Dashboard Overview" />
      <p><strong>OTP Verification</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/five.png" alt="Real-time Chat Interface" />
      <p><strong>User Dashboard</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/six.png" alt="Group Creation Page" />
      <p><strong>Chat Section</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/seven.png" alt="Admin Panel - User Management" />
      <p><strong>Group Details</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/eight.png" alt="Admin Panel - Content Management" />
      <p><strong>Group Invitation</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/nine.png" alt="Custom Themes Settings" />
      <p><strong>Deleting Group</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/ten.png" alt="AI Assistance Integration" />
      <p><strong>Create Group</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/eleven.png" alt="Notification System" />
      <p><strong>User Profile</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/twelve.png" alt="Profile Settings" />
      <p><strong>Editing User Profile</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/thirteen.png" alt="Study Group Chat" />
      <p><strong>Click on Robo Icon</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/fourteen.png" alt="Calendar and Events" />
      <p><strong>Chat with Hina</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/fifteen.png" alt="Resource Sharing" />
      <p><strong>Notification</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/sixteen.png" alt="Notifications Overview" />
      <p><strong>Admin Dashboard-Users</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./Screenshots/seventeen.png" alt="Help & Support" />
      <p><strong>Admin Dashboard-Groups</strong></p>
    </td>
    <td width="50%" align="center">
      <img src="./Screenshots/eighteen.png" alt="Final Overview" />
      <p><strong>Home</strong></p>
    </td>
  </tr>
</table>



## 🌐 Live Demo

<div align="left">
  <a href="https://virtual-study-mugen.vercel.app/" target="_blank">
    <img src="./Screenshots/one.png" alt="Live Demo" width="200" />
  </a>
  <p><strong>Click the image above to view the live demo</strong></p>
</div>

## 📫 Contact

<div align="left">
  <a href="https://www.instagram.com/SathwikUK" target="_blank">
    <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="40" />
  </a>&nbsp;&nbsp;
  <a href="https://www.linkedin.com/in/sathwikUK" target="_blank">
    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="40" />
  </a>&nbsp;&nbsp;
  <a href="https://github.com/SathwikUK" target="_blank">
    <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" width="40" />
  </a>&nbsp;&nbsp;
  <a href="mailto:sathwiksampengala@gmail.com" target="_blank">
    <img src="https://img.icons8.com/color/48/000000/new-post.png" alt="Email" width="40" />
  </a>
</div>

<div align="right">
  <h1>Made with 💜 by the VSM(o2🐼,k0🐻‍❄️,k4🐻)</h1>
</div>
