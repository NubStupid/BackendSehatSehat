const express = require("express");
const axios = require("axios");
const { Op, where, Sequelize } = require("sequelize");
const {
  Program,
  User,
  ChatLog,
  ProgramProgress,
  Meal,
  Workout,
  UserProgram,
  ChatGroup,
} = require("./db");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 3000;

// Chatbot
require("dotenv").config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { interrupt } = require("@langchain/langgraph");

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

async function runChatbot(input) {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful and professional health and fitness assistant. Answer clearly and concisely in user's respective language. Avoid any other topics other than healthy diets and workout and health benefits!",
    },
    {
      role: "user",
      content: input,
    },
  ];

  const result = await model.invoke(messages);
  console.log("Gemini Response:", result.content);
  return result.content;
}

async function runCustomerService(input) {
  const messages = [
    {
      role: "system",
      content: `You are a Customer Service Agent!, your task is to answer user's question that has been provided with an answer below!
        1. If the user ask about who made Sehat Sehat, answer with 'Sehat Sehat was made by Ferdinand, Calvin, Hanvy, and Cecilia'
        2. If the user ask what is Sehat Sehat, answer with 'Sehat Sehat is a online health monitoring website powered by Android Studio'
        3. If the user ask how to apply for a program, answer with 'To apply for program, first you need to topup in the profile section, by simply tapping your user icon. Then you can find the topup button, then you can assert the ammount of money you want to topup. Then you can go to the Program page and find which program you like to buy'
        4. If the user ask the purpose of this website, answer with 'This website is built for a group project at ISTTS or now known as Institut STTS'
        5. If the user ask about the contribution each developer had, please answer refering to this github link 'https://github.com/NubStupid/FrontEndSehatSehat' and 'https://github.com/NubStupid/BackendSehatSehat'
        
        If the user ask a question other than the example above, please make sure to reply that you are a customer service agent only provided to help guide the user in Sehat Sehat application!
        Other than that, you can variate your answer but keep the ensence of the example above! You can also reply in the user's native language!
        `,
    },
    {
      role: "user",
      content: input,
    },
  ];

  const result = await model.invoke(messages);
  console.log("Gemini Response:", result.content);
  return result.content;
}

app.post("/api/v1/chatbot", async (req, res) => {
  const { message } = req.body;
  // const chatbotUserExist = await User.findByPk("chatbot")

  const response = await runChatbot(message);
  return res.json({ response: response });
});

app.post("/api/v1/customer_service", async (req, res) => {
  const { message } = req.body;
  const response = await runCustomerService(message);
  return res.json({ response: response });
});

// ============

//  === NEWS ===
app.get("/api/v1/news", async (req, res) => {
  const response = await axios.get(
    "https://newsapi.org/v2/top-headlines?category=health&apiKey=" +
      process.env.NEWS_API_KEY
  );
  const articles = response.data.articles;
  const articles_formatted = articles
    .filter((a) => a.content != null)
    .map((a) => {
      if (a.content != null) {
        return {
          author: a.author == null ? "Not defined" : a.author,
          title: a.title,
          description: a.description,
          publishedAt: a.publishedAt,
          content: a.content,
        };
      }
    });
  return res.json({
    response: articles_formatted,
  });
});

// ===========

//  === NEWS ===
// app.get("/api/v1/news", async (req, res) => {
//   const response = await axios.get(
//     "https://newsapi.org/v2/top-headlines?category=health&apiKey=" +
//       process.env.NEWS_API_KEY
//   );
//   const articles = response.data.articles;
//   const articles_formatted = articles
//     .filter((a) => a.content != null)
//     .map((a) => {
//       if (a.content != null) {
//         return {
//           author: a.author == null ? "Not defined" : a.author,
//           title: a.title,
//           description: a.description,
//           publishedAt: a.publishedAt,
//           content: a.content,
//         };
//       }
//     });
//   return res.json({
//     response: articles_formatted,
//   });
// });

// ===========

// == Chat_LOG ==

app.post("/api/v1/chat", async (req, res) => {
  const { content, username, chat_group } = req.body;
  console.log(content, username, chat_group);

  const countID = (await ChatLog.findAll()).length;
  const newID = "CL" + (countID + 1).toString().padStart(5, "0");
  console.log(newID);

  const group_exist = await ChatGroup.findByPk(chat_group);
  if (group_exist == null) {
    if (
      chat_group.split("_").includes("chatbot") ||
      chat_group.split("_").includes("cs")
    ) {
      let group_name = chat_group.split("_").includes("chatbot")
        ? "Chatbot Group"
        : "Customer Service";
      await ChatGroup.create({
        id: chat_group,
        chat_name: group_name + " - " + username,
      });
    }
  }

  await ChatLog.create({
    id: newID,
    chat_group_id: chat_group,
    username: username,
    content: content,
  });

  return res.status(200).json({
    status: 200,
    message: "Chatlog successfully created!",
  });
});

app.get("/api/v1/chat/:chat_group_id", async (req, res) => {
  const { chat_group_id } = req.params;

  const chats = await ChatLog.findAll({
    chat_group_id: chat_group_id,
  });
  return res.status(200).json({
    status: 200,
    chats: chats,
  });
});

app.post("/api/v1/workout/sync", async (req, res) => {
  const workout = await Workout.findAll();
  return res.status(200).json({
    status: 200,
    workouts: workout,
  });
});

app.post("/api/v1/meal/sync", async (req, res) => {
  const meals = await Meal.findAll();
  return res.status(200).json({
    status: 200,
    meals: meals,
  });
});

app.post("/api/v1/users/sync", async (req, res) => {
  const users = await User.findAll();
  const users_sync = users.map((l) => {
    if (l.deletedAt != null) {
      return {
        ...l.dataValues,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
        deletedAt: new Date(l.deletedAt).getTime(),
      };
    } else {
      return {
        ...l.dataValues,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
      };
    }
  });
  return res.status(200).json({
    status: 200,
    users: users_sync,
  });
});

app.post("/api/v1/programs/sync", async (req, res) => {
  const programs = await Program.findAll();
  const program_sync = programs.map((l) => {
    if (l.deletedAt != null) {
      return {
        ...l.dataValues,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
        deletedAt: new Date(l.deletedAt).getTime(),
      };
    } else {
      return {
        ...l.dataValues,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
      };
    }
  });
  console.log(program_sync);

  return res.status(200).json({
    status: 200,
    programs: program_sync,
  });
});

app.post("/api/v1/programs/progress/sync", async (req, res) => {
  const programs = await ProgramProgress.findAll();
  const program_sync = programs.map((l) => {
    if (l.deletedAt != null) {
      return {
        ...l.dataValues,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
        deletedAt: new Date(l.deletedAt).getTime(),
      };
    } else {
      return {
        ...l.dataValues,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
      };
    }
  });
  console.log(program_sync);

  return res.status(200).json({
    status: 200,
    progress: program_sync,
  });
});

app.put("/api/v1/programs/progress/:progress_id", async (req, res) => {
  const { progress_id } = req.params;
  let progress = await ProgramProgress.findByPk(progress_id);
  if (progress != null) {
    await ProgramProgress.update(
      {
        progress_index: Sequelize.literal("progress_index + 1"),
      },
      {
        where: {
          id: progress_id,
        },
      }
    );
  }
  progress = await ProgramProgress.findByPk(progress_id);
  return res.status(200).json({
    status: 200,
    progress: {
      ...progress.dataValues,
      createdAt: new Date(progress.createdAt).getTime(),
      updatedAt: new Date(progress.updatedAt).getTime(),
      deletedAt: new Date(progress.deletedAt).getTime(),
    },
  });
});

app.post("/api/v1/programs/user/sync", async (req, res) => {
  const programs = await UserProgram.findAll();
  const program_sync = programs.map((l) => {
    if (l.deletedAt != null) {
      return {
        ...l.dataValues,
        expires_in: new Date(l.expires_in).getTime(),
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
        deletedAt: new Date(l.deletedAt).getTime(),
      };
    } else {
      return {
        ...l.dataValues,
        expires_in: new Date(l.expires_in).getTime(),
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
      };
    }
  });
  console.log(program_sync);

  return res.status(200).json({
    status: 200,
    userPrograms: program_sync,
  });
});

app.post("/api/v1/chat/sync", async (req, res) => {
  const { group_id, logs } = req.body;
  console.log(logs);

  const all_logs = await ChatLog.findAll({
    where: {
      chat_group_id: group_id,
    },
  });

  const synced_logs = await Promise.all(
    all_logs.map(async (log) => {
      let contained = false;
      for (let l of logs) {
        if (l.id == log.dataValues.id) {
          contained = true;
          await ChatLog.update(
            {
              content: l.content,
            },
            {
              where: {
                id: l.id,
              },
            }
          );
          return l;
        }
      }

      if (contained != true) {
        console.log(log.dataValues);
        return log.dataValues;
      }
    })
  );

  const formatted_sync = synced_logs.map((l) => {
    if (l.deletedAt != null) {
      return {
        ...l,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
        deletedAt: new Date(l.deletedAt).getTime(),
      };
    } else {
      return {
        ...l,
        createdAt: new Date(l.createdAt).getTime(),
        updatedAt: new Date(l.updatedAt).getTime(),
      };
    }
  });

  console.log(JSON.stringify(formatted_sync));
  return res.status(200).json({
    status: 200,
    chats: formatted_sync,
  });
});

// ==============

// Middlewares
async function userAvailable(req, res, next) {
  const { username } = req.body || req.params;
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
    if (exists)
      return res.status(400).json({ error: "Username already taken" });
    const user = await User.create({
      username,
      display_name,
      password,
      dob,
      role: "customer",
      pp_url,
    });
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Registration failed", details: err.message });
  }
});

app.listen(port, function () {
  console.log(`listening on port:${port}...`);
});

// Get Program
app.get("/api/v1/user/:username/programs", async (req, res) => {
  try {
    const { username } = req.params;

    const userPrograms = await UserProgram.findAll({
      where: { username },
      include: [
        {
          model: Program,
          foreignKey: "program_id",
          targetKey: "id",
        },
      ],
    });

    return res.status(200).json({
      status: 200,
      programs: userPrograms,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch user programs",
      error: error.message,
    });
  }
});

// Get user workouts/schedule
app.get("/api/v1/user/:username/workouts", async (req, res) => {
  try {
    const { username } = req.params;
    const { date } = req.query; // Optional date filter

    let whereClause = {};
    if (date) {
      const startDate = new Date(date + "T00:00:00.000Z");
      const endDate = new Date(date + "T23:59:59.999Z");
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const workouts = await Workout.findAll({
      where: whereClause,
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      status: 200,
      workouts: workouts,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch workouts",
      error: error.message,
    });
  }
});

// Get user meetups/schedule
app.get("/api/v1/user/:username/meetups", async (req, res) => {
  try {
    const { username } = req.params;
    const { date } = req.query; // Optional date filter

    let whereClause = {
      customer_username: username,
    };

    if (date) {
      const startDate = new Date(date + "T00:00:00.000Z");
      const endDate = new Date(date + "T23:59:59.999Z");
      whereClause.meetup_time = {
        [Op.between]: [startDate, endDate],
      };
    }

    const meetups = await Meetup.findAll({
      where: whereClause,
      order: [["meetup_time", "ASC"]],
    });

    return res.status(200).json({
      status: 200,
      meetups: meetups,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch meetups",
      error: error.message,
    });
  }
});

// Get user dashboard data (combined endpoint)
app.get("/api/v1/user/:username/dashboard", async (req, res) => {
  try {
    const { username } = req.params;

    // Get user info
    const user = await User.findOne({
      where: { username },
      attributes: ["username", "display_name", "role", "pp_url"],
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Get user programs with progress
    const userPrograms = await UserProgram.findAll({
      where: { username },
      include: [
        {
          model: Program,
          foreignKey: "program_id",
          targetKey: "id",
        },
      ],
    });

    // Get recent workouts
    const recentWorkouts = await Workout.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
    });

    // Get upcoming meetups
    const upcomingMeetups = await Meetup.findAll({
      where: {
        customer_username: username,
        meetup_time: {
          [Op.gte]: new Date(),
        },
      },
      order: [["meetup_time", "ASC"]],
      limit: 5,
    });

    return res.status(200).json({
      status: 200,
      data: {
        user: user,
        programs: userPrograms,
        workouts: recentWorkouts,
        meetups: upcomingMeetups,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
});

// Get all programs (for program listing)
app.get("/api/v1/programs", async (req, res) => {
  try {
    const programs = await Program.findAll({ where: { deletedAt: null } });

    return res.status(200).json({
      status: 200,
      programs: programs,
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch programs",
      error: error.message,
    });
  }
});

// GET program by ID
app.get("/api/v1/programs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const program = await Program.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });
    if (!program) {
      return res.status(404).json({ status: 404, error: "Program not found" });
    }
    return res.status(200).json({
      status: 200,
      program: program,
    });
  } catch (err) {
    return res.status(500).json({ status: 500, error: err.message });
  }
});

// POST create program
app.post("/api/v1/programs", async (req, res) => {
  const { program_name, pricing } = req.body;
  try {
    // Hitung ID baru
    const countID = (await Program.findAll()).length;
    const newID = "PR" + (countID + 1).toString().padStart(5, "0");

    const newProgram = await Program.create({
      id: newID,
      program_name: program_name,
      pricing: parseFloat(pricing),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    return res.status(201).json({
      status: 201,
      message: "Program created",
      program: newProgram,
    });
  } catch (err) {
    return res.status(500).json({ status: 500, error: err.message });
  }
});

// PUT update program
app.put("/api/v1/programs/:id", async (req, res) => {
  const { id } = req.params;
  const { program_name, pricing } = req.body;
  try {
    const program = await Program.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!program) {
      return res
        .status(404)
        .json({ status: 404, message: "Program not found" });
    }

    program.program_name = program_name;
    program.pricing = parseFloat(pricing);
    program.updatedAt = new Date();
    await program.save();

    return res.status(200).json({
      status: 200,
      message: "Program updated",
      program: program,
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
});

// DELETE (soft delete) program
app.delete("/api/v1/programs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCount = await Program.destroy({ where: { id } });

    if (deletedCount === 0) {
      return res.status(404).json({ status: 404, error: "Program not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Program deleted (soft)",
    });
  } catch (err) {
    return res.status(500).json({ status: 500, error: err.message });
  }
});

// GET all users (untuk admin)
app.get("/api/v1/users", async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["createdAt", "DESC"]],
    });

    const transformedUsers = users.map((user) => ({
      ...user.toJSON(),
      createdAt: new Date(user.createdAt).getTime(),
      updatedAt: new Date(user.updatedAt).getTime(),
    }));

    return res.status(200).json({
      status: 200,
      users: transformedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// DELETE user by username (permanent delete)
app.delete(
  "/api/v1/users/:username",
  // Optional: cek apakah user ada dan role admin
  userAvailable,
  async (req, res) => {
    const { username } = req.params;
    try {
      // Hapus baris di table User
      const deletedCount = await User.destroy({
        where: { username },
      });

      if (deletedCount === 0) {
        return res.status(404).json({ status: 404, error: "User not found" });
      }

      return res
        .status(200)
        .json({ status: 200, message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ status: 500, error: err.message });
    }
  }
);

// pengaturan id meal dan workout
const padId = (prefix, number) => {
  return `${prefix}${String(number).padStart(5, "0")}`;
};

// POST /meals - Tambah Meal
app.post("/meals", async (req, res) => {
  try {
    const { meal_name, ingredients, calories, fat, protein, program_id } =
      req.body;

    if (
      !meal_name ||
      ingredients == null ||
      calories == null ||
      fat == null ||
      protein == null ||
      !program_id
    ) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Hitung jumlah meal yang ada untuk ID baru
    const totalMeals = await Meal.count();
    const mealId = padId("ME", totalMeals + 1);

    const newMeal = await Meal.create({
      id: mealId,
      meal_name,
      ingredients,
      calories,
      fat,
      protein,
      program_id,
    });

    res.status(201).json(newMeal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan meal" });
  }
});

// POST /workouts - Tambah Workout
app.post("/workouts", async (req, res) => {
  try {
    const { workout_title, estimated_time, focused_at, program_id } = req.body;

    if (
      !workout_title ||
      estimated_time == null ||
      !focused_at ||
      !program_id
    ) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const totalWorkouts = await Workout.count();
    const workoutId = padId("WO", totalWorkouts + 1);

    const newWorkout = await Workout.create({
      id: workoutId,
      workout_title,
      estimated_time,
      focused_at,
      program_id,
    });

    res.status(201).json(newWorkout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan workout" });
  }
});

// ambil semua makanan dari 1 program
app.get("/api/v1/programs/:program_id/meals", async (req, res) => {
  const { program_id } = req.params;
  try {
    const meals = await Meal.findAll({
      where: { program_id: program_id },
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json({
      status: 200,
      meals: meals,
    });
  } catch (err) {
    console.error("Error fetching meals:", err);
    return res.status(500).json({
      status: 500,
      message: "Gagal mengambil meals",
      error: err.message,
    });
  }
});

// ambil semua workout dari 1 program
app.get("/api/v1/programs/:program_id/workouts", async (req, res) => {
  const { program_id } = req.params;
  try {
    const workouts = await Workout.findAll({
      where: { program_id: program_id },
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json({
      status: 200,
      workouts: workouts,
    });
  } catch (err) {
    console.error("Error fetching workouts:", err);
    return res.status(500).json({
      status: 500,
      message: "Gagal mengambil workouts",
      error: err.message,
    });
  }
});

// ubah role
app.put("/api/v1/users/:username/:role", async (req, res) => {
  const { username, role } = req.params;

  const validRoles = ["customer", "trainer", "admin"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({
      status: 400,
      message: `Invalid role. Allowed roles are: ${validRoles.join(", ")}`,
    });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: `User with username '${username}' not found`,
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      message: "User role updated successfully",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to update user role",
      error: err.message,
    });
  }
});

// dapetin report bulanan
app.get("/api/v1/reports/monthly-purchases", async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const results = await UserProgram.findAll({
      where: {
        createdAt: { [Op.between]: [start, end] },
      },
      include: [
        {
          model: Program,
          attributes: ["program_name", "pricing"],
        },
      ],
      attributes: [
        "program_id",
        [Sequelize.fn("COUNT", Sequelize.col("username")), "buyerCount"],
        [
          Sequelize.fn("SUM", Sequelize.literal("Program.pricing")),
          "totalRevenue",
        ],
        [
          Sequelize.fn("MIN", Sequelize.col("UserProgram.createdAt")),
          "purchaseDate",
        ],
      ],
      group: ["program_id", "Program.id"],
    });

    const report = results.map((r) => ({
      programName: r.Program.program_name,
      purchaseDate: r.getDataValue("purchaseDate").toISOString().split("T")[0],
      buyerCount: parseInt(r.getDataValue("buyerCount")),
      totalRevenue: parseFloat(r.getDataValue("totalRevenue")),
    }));

    console.log("report: ", report);

    res.status(200).json(report);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Gagal mengambil laporan bulanan" });
  }
});

app.get("/api/v1/reports", async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);

    const results = await UserProgram.findAll({
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      include: [{ model: Program, attributes: ["program_name", "pricing"] }],
      attributes: [
        "program_id",
        [Sequelize.fn("COUNT", Sequelize.col("username")), "buyerCount"],
        [
          Sequelize.fn("SUM", Sequelize.literal("Program.pricing")),
          "totalRevenue",
        ],
        [
          Sequelize.fn("MIN", Sequelize.col("UserProgram.createdAt")),
          "purchaseDate",
        ],
      ],
      group: ["program_id", "Program.id"],
    });

    const report = results.map((r) => ({
      programName: r.Program.program_name,
      purchaseDate: r.getDataValue("purchaseDate").toISOString().split("T")[0],
      buyerCount: parseInt(r.getDataValue("buyerCount")),
      totalRevenue: parseFloat(r.getDataValue("totalRevenue")),
    }));

    res.status(200).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil laporan" });
  }
});

// report dgn filter start dan end
app.get("/api/v1/reports/:start/:end", async (req, res) => {
  try {
    const { start, end } = req.params;
    const startDate = new Date(start);
    const endDate = new Date(end);

    console.log(startDate, " ", endDate);

    const results = await UserProgram.findAll({
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      include: [{ model: Program, attributes: ["program_name", "pricing"] }],
      attributes: [
        "program_id",
        [Sequelize.fn("COUNT", Sequelize.col("username")), "buyerCount"],
        [
          Sequelize.fn("SUM", Sequelize.literal("Program.pricing")),
          "totalRevenue",
        ],
        [
          Sequelize.fn("MIN", Sequelize.col("UserProgram.createdAt")),
          "purchaseDate",
        ],
      ],
      group: ["program_id", "Program.id"],
    });

    // console.log(results);

    const report = results.map((r) => ({
      programName: r.Program.program_name,
      purchaseDate: r.getDataValue("purchaseDate").toISOString().split("T")[0],
      buyerCount: parseInt(r.getDataValue("buyerCount")),
      totalRevenue: parseFloat(r.getDataValue("totalRevenue")),
    }));

    console.log(report);

    res.status(200).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil laporan" });
  }
});

app.post("/api/v1/programs/user", async (req, res) => {
  const { username } = req.body;
  const user_programs = await UserProgram.findAll({
    where: {
      username: username,
    },
  });
  const programs = await Promise.all(
    user_programs.map(async (up) => {
      const p = await Program.findByPk(up.program_id);
      return p;
    })
  );
  console.log(programs);

  return res.send(programs);
});

app.put("/api/v1/users/:username/topup/:amount", async (req, res) => {
  const { username } = req.params;
  let amount = req.params;

  amount = parseInt(req.params.amount, 10);

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: `User with username '${username}' not found`,
      });
    }

    user.balance += amount;
    await user.save();

    return res.status(200).json({
      message: "User balance updated successfully",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to update user balance",
      error: err.message,
    });
  }
});

// --- ambil detail user berdasarkan username ---
app.get("/api/v1/users/:username", userAvailable, async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json(req.user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

// --- update profil user ---
app.put(
  "/api/v1/users/:username/updateProfile/:display_name/:password/:dob",
  userAvailable,
  async (req, res) => {
    const { display_name, password, dob } = req.params;
    const user = req.user;
    try {
      user.display_name = display_name;
      user.password = password;
      user.dob = dob;
      user.updatedAt = new Date();
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  }
);

// const options = {
//   method: 'POST',
//   headers: {
//     accept: 'application/json',
//     'content-type': 'application/json',
//     authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`
//   },
//   body: JSON.stringify({
//     payment_type: 'qris',
//     transaction_details: {order_id: 'order_id-0123', gross_amount: 100000},
//     qris: {acquirer: 'gopay'}
//   })
// };

// fetch(url, options)
//   .then(res => res.json())
//   .then(json => console.log(json))
//   .catch(err => console.error(err));

app.post("/api/v1/transaction", async (req, res) => {
  const { transactionDetails, acquirer, userId, programPrice } = req.body;

  try {
    let paymentUrl = null;

    if (acquirer === "Balance") {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.balance < programPrice) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      user.balance -= programPrice;
      await user.save();

      const userProgramCount = await UserProgram.count();
      const userProgramId =
        "UP" + String(userProgramCount + 1).padStart(5, "0");

      const programProgressCount = await ProgramProgress.count();
      const programProgressId =
        "PP" + String(programProgressCount + 1).padStart(5, "0");

      const program = await Program.findByPk(transactionDetails.order_id);
      if (!program)
        return res.status(404).json({ message: "Program not found" });

      const meals = await Meal.findAll({
        where: { program_id: program.id },
        attributes: ["id"],
      });
      const workouts = await Workout.findAll({
        where: { program_id: program.id },
        attributes: ["id"],
      });

      const mealsArray = meals.map((meal) => meal.id);
      const workoutsArray = workouts.map((workout) => workout.id);

      const progressList = [...mealsArray, ...workoutsArray].join(",");
      const progressListType = "meal,workout";

      const chatGroupCount = await ChatGroup.count();
      const chatGroupId = "CG" + String(chatGroupCount + 1).padStart(5, "0");

      const now = new Date();
      const chatName = `${program.program_name} Group`;

      await ChatGroup.create({
        id: chatGroupId,
        chat_name: chatName,
        createdAt: now,
        updatedAt: now,
      });

      await ProgramProgress.create({
        id: programProgressId,
        program_id: program.id,
        progress_index: 0,
        progress_list: progressList,
        progress_list_type: progressListType,
      });

      await UserProgram.create({
        id: userProgramId,
        program_id: program.id,
        username: user.username,
        expires_in: Date.now() + 30 * 24 * 60 * 60 * 1000,
        chat_group_id: chatGroupId,
        program_progress_id: programProgressId,
      });

      return res.status(200).json({
        status: 200,
        payment_url: null,
        newBalance: user.balance,
      });
    }

    const paymentData = {
      payment_type: "qris",
      transaction_details: transactionDetails,
      qris: { acquirer },
    };

    const response = await axios.post(
      process.env.MIDTRANS_API_URL,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            process.env.MIDTRANS_SERVER_KEY + ":"
          ).toString("base64")}`,
        },
      }
    );

    if (response.status === 200 && response.data.actions) {
      paymentUrl = response.data.actions[0].url;
    }

    return res.status(200).json({ status: 200, payment_url: paymentUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});
