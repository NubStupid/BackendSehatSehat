const express = require("express");
const { Op, where } = require("sequelize");
const { User, ChatLog } = require("./db");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 3000;

// Chatbot

require("dotenv").config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

async function runChatbot(input) {
  const messages = [
    { role: "user", content: input }
  ];
  
  const result = await model.invoke(messages);
  console.log("Gemini Response:", result.content);
  return result.content
}

app.post("/api/v1/chatbot", async (req, res) => {
  const { message } = req.body;
  const response = await runChatbot(message);
  return res.json({ reply: response });
});

// ============

// == Chat_LOG ==

app.post("/api/v1/chat",async (req,res)=>{
  const {content,username,chat_group} = req.body
  const countID = (await ChatLog.findAll()).length
  const newID = "CL"+(countID+1).toString().padStart(5,"0")

  await ChatLog.create({
    id:newID,
    chat_group_id:chat_group,
    username:username,
    content:content
  })

  return res.status(200).json({
    status:200,
    message:"Chatlog successfully created!"
  })
})

app.get("/api/v1/chat/:chat_group_id",async(req,res)=>{
  const {chat_group_id} = req.params

  const chats = await ChatLog.findAll({
    chat_group_id:chat_group_id
  })
  return res.status(200).json({
    status:200,
    chats:chats
  })
})

app.post("/api/v1/chat/sync", async (req,res)=>{
  const {group_id, logs} = req.body
  const all_logs = await ChatLog.findAll({
    where:{
      chat_group_id:group_id
    }
  })

  const synced_logs = await Promise.all(all_logs.map(async (log)=>{
    let contained = false
    for(let l of logs){
      if(l.id == log.dataValues.id){
        contained = true
        await ChatLog.update({
          content:l.content
        },{
          where:{
              id:l.id
          }
        })
        return l
      }
    }

    if(contained != true){
      console.log(log.dataValues);
      return log.dataValues
    }
  }))

  const formatted_sync = synced_logs.map((l)=>{
    if(l.deletedAt != null){
      return {
        ...l,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
        deletedAt: new Date(l.deletedAt).getTime(),
      }
    }else{
      return {
        ...l,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
      }
    }
  })

  console.log(JSON.stringify(formatted_sync));
  return res.status(200).json({
    status:200,
    chats:formatted_sync
  })
})

// ==============


// Middlewares
async function userAvailable(req, res, next) {
  const { username } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  req.user = user;
  next();
}
function userRoleAuthentication(roles = []) {
  return (req, res, next) => {
    if (!roles.length || roles.includes(req.user.role)) {
      return next(); 
    }
    return res.status(403).json({ error: "Unauthorized role" });
  };
}


// Login

app.post("/api/v1/login", [userAvailable], async (req, res) => {
  const { password } = req.body;
  if (req.user.password !== password) {
    return res.status(401).json({ error: "Invalid password" });
  }
  res.json({ message: "Login successful", user: req.user });
});

// Register

app.post("/api/v1/register", async (req, res) => {
  const { username, display_name, password, dob, pp_url } = req.body;
  try {
    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(400).json({ error: "Username already taken" });
    const user = await User.create({ username, display_name, password, dob, role:"customer", pp_url });
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});



app.listen(port, function () {
  console.log(`listening on port:${port}...`);
});
