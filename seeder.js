// seeder.js
const {
  sequelize,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST,
  User,
  Program,
  UserProgram,
  ProgramProgress,
  Meal,
  Plan,
  MealPlan,
  Meetup,
  Workout,
  ChatGroup,
  UserChat,
  ChatLog,
} = require("./db");

const mysql = require("mysql2/promise");

function generateId(prefix, index) {
  return `${prefix}${String(index).padStart(5, "0")}`;
}

(async function () {
  const conn = await mysql.createConnection({
    user: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
  });
  
  await conn.query(`drop database if exists ${DB_NAME}`);
  await conn.query(`create database ${DB_NAME}`);
  await sequelize.sync({ force: true });

  await User.bulkCreate([
    {
      username: "john_doe",
      display_name: "John Doe",
      password: "pass123",
      dob: "1990-01-01",
      role: "customer",
      pp_url: "",
    },
    {
      username: "chef_jane",
      display_name: "Chef Jane",
      password: "cookwell",
      dob: "1985-05-12",
      role: "chef",
      pp_url: "",
    },
    {
      username: "mike_trainer",
      display_name: "Mike Trainer",
      password: "fitpass",
      dob: "1988-07-21",
      role: "gym",
      pp_url: "",
    },
    {
      username: "anna_admin",
      display_name: "Anna Admin",
      password: "admin123",
      dob: "1980-03-10",
      role: "admin",
      pp_url: "",
    },
  ]);

  const programs = await Program.bulkCreate([
    { id: "PR00001", program_name: "Weight Loss", pricing: 100000 },
    { id: "PR00002", program_name: "Muscle Gain", pricing: 150000 },
  ]);

  await UserProgram.bulkCreate([
    {
      id: "UP00001",
      program_id: "PR00001",
      username: "US00001",
      expires_in: "2025-12-31",
      chat_group_id: "CG00001",
    },
  ]);

  await ProgramProgress.bulkCreate([
    {
      program_id: "PR00001",
      progress_index: 1,
      progress_list: "PL00001,PL00002",
      progress_list_type: "meal",
    },
  ]);

  const meals = await Meal.bulkCreate([
    {
      id: "ME00001",
      meal_name: "Grilled Chicken Salad",
      ingredients: "chicken, lettuce, tomato",
      instructions: "Grill chicken, mix with salad",
      calories: 250,
      fat: 10,
      protein: 30,
      estimated_price: 30000,
      estimated_time: 20,
    },
    {
      id: "ME00002",
      meal_name: "Protein Shake",
      ingredients: "milk, protein powder",
      instructions: "Blend all",
      calories: 150,
      fat: 5,
      protein: 25,
      estimated_price: 15000,
      estimated_time: 5,
    },
  ]);

  const plans = await Plan.bulkCreate([
    {
      id: "PL00001",
      plan_name: "Day 1 Plan",
      total_calories: 400,
      total_estimated_price: 45000,
      expert_username: "US00002",
    },
  ]);

  await MealPlan.bulkCreate([
    { plain_id: "PL00001", meal_id: "ME00001" },
    { plain_id: "PL00001", meal_id: "ME00002" },
  ]);

  await Meetup.bulkCreate([
    {
      id: "MU00001",
      meetup_title: "Initial Consultation",
      meetup_time: "2025-06-01 10:00:00",
      customer_username: "US00001",
      expert_username: "US00003",
    },
  ]);

  await Workout.bulkCreate([
    {
      id: "WO00001",
      workout_title: "Beginner Workout",
      workout_list: "Pushups,Squats",
      estimated_time: 30,
      focused_at: "upper body",
      expert_username: "US00003",
    },
  ]);

  await ChatGroup.create({ id: "CG00001", chat_name: "Weight Loss Group" });

  await UserChat.bulkCreate([
    { username: "US00001", chat_group_id: "CG00001" },
    { username: "US00002", chat_group_id: "CG00001" },
  ]);

  await ChatLog.bulkCreate([
    {
      id: "CL00001",
      chat_group_id: "CG00001",
      username: "US00001",
      content: "Hi! I'm excited to start!",
    },
    {
      id: "CL00002",
      chat_group_id: "CG00001",
      username: "US00002",
      content: "Welcome, John! Let's do this!",
    },
  ]);

  process.exit(0);
})();
