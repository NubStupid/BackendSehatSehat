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
      topup: 150000,
    },
    {
      username: "expert_budi",
      display_name: "Expert Budi",
      password: "expert123",
      dob: "1985-05-12",
      role: "expert",
      pp_url: "",
      topup: 0,
    },
    {
      username: "expert_maria",
      display_name: "Expert Maria",
      password: "fitpass",
      dob: "1988-07-21",
      role: "expert",
      pp_url: "",
      topup: 0,
    },
    {
      username: "anna_admin",
      display_name: "Anna Admin",
      password: "admin123",
      dob: "1980-03-10",
      role: "admin",
      pp_url: "",
      topup: 0,
    },
    {
      username: "sarah_customer",
      display_name: "Sarah Wilson",
      password: "sarah123",
      dob: "1992-08-15",
      role: "customer",
      pp_url: "",
      topup: 100000,
    },
  ]);

    // {
    //   username: "chef_jane",
    //   display_name: "Chef Jane",
    //   password: "cookwell",
    //   dob: "1985-05-12",
    //   role: "chef",
    //   pp_url: "",
    // },
    // {
    //   username: "mike_trainer",
    //   display_name: "Mike Trainer",
    //   password: "fitpass",
    //   dob: "1988-07-21",
    //   role: "gym",
    //   pp_url: "",
    // },

  const programs = await Program.bulkCreate([
    { id: "PR00001", program_name: "Slim Fit Project", pricing: 100000 },
    { id: "PR00002", program_name: "Muscle Building Pro", pricing: 150000 },
    { id: "PR00003", program_name: "Cardio Blast", pricing: 120000 },
    { id: "PR00004", program_name: "Flexibility Master", pricing: 80000 },
    { id: "PR00005", program_name: "Athletic Performance", pricing: 200000 },
    { id: "PR00006", program_name: "Weight Loss Journey", pricing: 180000 },
    { id: "PR00007", program_name: "Core Strength Plus", pricing: 90000 },
    { id: "PR00008", program_name: "Beginner Fitness", pricing: 70000 },
  ]);

  await UserProgram.bulkCreate([
    {
      id: "UP00001",
      program_id: "PR00001",
      username: "john_doe",
      expires_in: "2026-12-31",
      chat_group_id: "CG00001",
    },
    {
      id: "UP00002",
      program_id: "PR00002",
      username: "john_doe",
      expires_in: "2026-04-15",
      chat_group_id: "CG00002",
    },
    {
      id: "UP00003",
      program_id: "PR00003",
      username: "sarah_customer",
      expires_in: "2026-03-30",
      chat_group_id: "CG00003",
    },
  ]);

  await ProgramProgress.bulkCreate([
    {
      program_id: "PR00001",
      progress_index: 1,
      progress_list: "PL00001,PL00002",
      progress_list_type: "meal",
    },
    {
      program_id: "PR00002",
      progress_index: 1,
      progress_list: "WO00001,WO00002",
      progress_list_type: "workout",
    },
  ]);

  const meals = await Meal.bulkCreate([
    {
      id: "ME00001",
      meal_name: "Grilled Chicken Salad",
      ingredients: "chicken, lettuce, tomato, cucumber, olive oil",
      instructions: "Grill chicken breast, mix with fresh salad vegetables",
      calories: 250,
      fat: 10,
      protein: 30,
      estimated_price: 30000,
      estimated_time: 20,
    },
    {
      id: "ME00002",
      meal_name: "Protein Shake",
      ingredients: "milk, protein powder, banana",
      instructions: "Blend all ingredients until smooth",
      calories: 150,
      fat: 5,
      protein: 25,
      estimated_price: 15000,
      estimated_time: 5,
    },
    {
      id: "ME00003",
      meal_name: "Quinoa Bowl",
      ingredients: "quinoa, vegetables, avocado, nuts",
      instructions: "Cook quinoa, add fresh vegetables and toppings",
      calories: 350,
      fat: 15,
      protein: 12,
      estimated_price: 25000,
      estimated_time: 15,
    },
  ]);

  const plans = await Plan.bulkCreate([
    {
      id: "PL00001",
      plan_name: "Day 1 Weight Loss Plan",
      total_calories: 400,
      total_estimated_price: 45000,
      expert_username: "chef_jane",
    },
    {
      id: "PL00002",
      plan_name: "Day 2 Muscle Gain Plan",
      total_calories: 500,
      total_estimated_price: 40000,
      expert_username: "chef_jane",
    },
  ]);

  await MealPlan.bulkCreate([
    { plain_id: "PL00001", meal_id: "ME00001" },
    { plain_id: "PL00001", meal_id: "ME00002" },
    { plain_id: "PL00002", meal_id: "ME00002" },
    { plain_id: "PL00002", meal_id: "ME00003" },
  ]);

  await Meetup.bulkCreate([
    {
      id: "MU00001",
      meetup_title: "Initial Consultation",
      meetup_time: "2026-06-11 10:00:00",
      customer_username: "john_doe",
      expert_username: "expert_maria",
    },
    {
      id: "MU00002",
      meetup_title: "Progress Review",
      meetup_time: "2026-06-12 14:00:00",
      customer_username: "john_doe",
      expert_username: "expert_budi",
    },
    {
      id: "MU00003",
      meetup_title: "Nutrition Planning",
      meetup_time: "2026-06-13 09:00:00",
      customer_username: "sarah_customer",
      expert_username: "expert_maria",
    },
    {
      id: "MU00004",
      meetup_title: "Workout Assessment",
      meetup_time: "2026-06-14 16:00:00",
      customer_username: "john_doe",
      expert_username: "expert_budi",
    },
    {
      id: "MU00005",
      meetup_title: "Weekly Check-in",
      meetup_time: "2026-06-15 11:00:00",
      customer_username: "sarah_customer",
      expert_username: "expert_budi",
    },
  ]);

  await Workout.bulkCreate([
    {
      id: "WO00001",
      workout_title: "Cardio Morning",
      workout_list: "Running,Cycling,Jump Rope",
      estimated_time: 60,
      focused_at: "cardiovascular",
      expert_username: "expert_budi",
    },
    {
      id: "WO00002",
      workout_title: "Upper Body Ignite",
      workout_list: "Push-ups,Pull-ups,Bench Press,Shoulder Press",
      estimated_time: 45,
      focused_at: "upper body",
      expert_username: "expert_maria",
    },
    {
      id: "WO00003",
      workout_title: "Yoga Flow",
      workout_list: "Sun Salutation,Warrior Poses,Tree Pose",
      estimated_time: 45,
      focused_at: "flexibility",
      expert_username: "expert_budi",
    },
    {
      id: "WO00004",
      workout_title: "HIIT Training",
      workout_list: "Burpees,Mountain Climbers,High Knees,Jumping Jacks",
      estimated_time: 30,
      focused_at: "full body",
      expert_username: "expert_budi",
    },
    {
      id: "WO00005",
      workout_title: "Strength Training",
      workout_list: "Squats,Deadlifts,Lunges,Planks",
      estimated_time: 50,
      focused_at: "strength",
      expert_username: "expert_maria",
    },
    {
      id: "WO00006",
      workout_title: "Pilates",
      workout_list: "Core Exercises,Flexibility,Balance",
      estimated_time: 40,
      focused_at: "core",
      expert_username: "expert_maria",
    },
    {
      id: "WO00007",
      workout_title: "CrossFit",
      workout_list: "Olympic Lifts,Functional Movements,Cardio",
      estimated_time: 60,
      focused_at: "functional fitness",
      expert_username: "expert_maria",
    },
    {
      id: "WO00008",
      workout_title: "Swimming",
      workout_list: "Freestyle,Backstroke,Breaststroke",
      estimated_time: 45,
      focused_at: "full body cardio",
      expert_username: "expert_budi",
    },
  ]);

  await ChatGroup.bulkCreate([
    { id: "CG00001", chat_name: "Slim Fit Project Group" },
    { id: "CG00002", chat_name: "Muscle Building Group" },
    { id: "CG00003", chat_name: "Cardio Blast Group" },
    { id: "CG00004", chat_name: "Chatbot Group - john_doe" },
    { id: "CG00005", chat_name: "Chatbot Group - sarah_customer" },
  ]);

  await UserChat.bulkCreate([
    { username: "john_doe", chat_group_id: "CG00001" },
    { username: "expert_maria", chat_group_id: "CG00001" },
    { username: "expert_budi", chat_group_id: "CG00001" },
    { username: "john_doe", chat_group_id: "CG00002" },
    { username: "expert_budi", chat_group_id: "CG00002" },
    { username: "sarah_customer", chat_group_id: "CG00003" },
    { username: "expert_maria", chat_group_id: "CG00003" },
    { username: "john_doe", chat_group_id: "CG00004" },
    { username: "sarah_customer", chat_group_id: "CG00005" },
  ]);

  await ChatLog.bulkCreate([
    {
      id: "CL00001",
      chat_group_id: "CG00001",
      username: "john_doe",
      content: "Hi! I'm excited to start my fitness journey!",
    },
    {
      id: "CL00002",
      chat_group_id: "CG00001",
      username: "expert_budi",
      content: "Welcome, John! I'll help you with your nutrition plan.",
    },
    {
      id: "CL00003",
      chat_group_id: "CG00001",
      username: "expert_maria",
      content: "Great to have you here! Let's achieve your goals together.",
    },
    {
      id: "CL00004",
      chat_group_id: "CG00004",
      username: "john_doe",
      content: "What's the best way to start my weight loss journey?",
    },
    {
      id: "CL00005",
      chat_group_id: "CG00004",
      username: "Chatbot",
      content:
        "Great question! Starting a weight loss journey requires a combination of proper nutrition and regular exercise. I recommend beginning with a balanced diet rich in lean proteins, vegetables, and whole grains, combined with 30 minutes of moderate exercise 3-4 times per week. Would you like specific meal or workout suggestions?",
    },
  ]);

  console.log("Database seeded successfully!");
  process.exit(0);
})();
