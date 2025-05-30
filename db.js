// db.js
const { Sequelize, Model, DataTypes } = require("sequelize");

const DB_NAME = "MDPSEHAT";
const DB_USER = "root";
const DB_PASS = "";
const DB_HOST = "localhost";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: "mysql",
});

class User extends Model {}
User.init(
  {
    username: {
      type: DataTypes.STRING(32),
      primaryKey: true,
      allowNull: false,
    },
    display_name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: false },
    pp_url: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    paranoid: true,
  }
);

class Program extends Model {}
Program.init(
  {
    program_name: DataTypes.STRING,
    pricing: DataTypes.FLOAT,
  },
  {
    sequelize,
    modelName: "Program",
    tableName: "programs",
    timestamps: true,
    paranoid: true,
  }
);

class UserProgram extends Model {}
UserProgram.init(
  {
    program_id: DataTypes.INTEGER,
    username: DataTypes.STRING,
    expires_in: DataTypes.DATE,
    chat_group_id: DataTypes.INTEGER,
  },
  { sequelize, modelName: "UserProgram", tableName: "user_programs" }
);

class ProgramProgress extends Model {}
ProgramProgress.init(
  {
    program_id: DataTypes.INTEGER,
    progress_index: DataTypes.INTEGER,
    progress_list: DataTypes.STRING,
    progress_list_type: DataTypes.STRING,
  },
  { sequelize, modelName: "ProgramProgress", tableName: "program_progresses" }
);

class Meal extends Model {}
Meal.init(
  {
    meal_name: DataTypes.STRING,
    ingredients: DataTypes.TEXT,
    instructions: DataTypes.TEXT,
    calories: DataTypes.FLOAT,
    fat: DataTypes.FLOAT,
    protein: DataTypes.FLOAT,
    estimated_price: DataTypes.FLOAT,
    estimated_time: DataTypes.INTEGER,
  },
  { sequelize, modelName: "Meal", tableName: "meals" }
);

class Plan extends Model {}
Plan.init(
  {
    plan_name: DataTypes.STRING,
    total_calories: DataTypes.FLOAT,
    total_estimated_price: DataTypes.FLOAT,
    expert_username: DataTypes.STRING,
  },
  { sequelize, modelName: "Plan", tableName: "plans" }
);

class MealPlan extends Model {}
MealPlan.init(
  {
    plain_id: DataTypes.INTEGER,
    meal_id: DataTypes.INTEGER,
  },
  { sequelize, modelName: "MealPlan", tableName: "meal_plans" }
);

class Meetup extends Model {}
Meetup.init(
  {
    meetup_title: DataTypes.STRING,
    meetup_time: DataTypes.DATE,
    customer_username: DataTypes.STRING,
    expert_username: DataTypes.STRING,
  },
  { sequelize, modelName: "Meetup", tableName: "meetups" }
);

class Workout extends Model {}
Workout.init(
  {
    workout_title: DataTypes.STRING,
    workout_list: DataTypes.TEXT,
    estimated_time: DataTypes.INTEGER,
    focused_at: DataTypes.STRING,
    expert_username: DataTypes.STRING,
  },
  { sequelize, modelName: "Workout", tableName: "workouts" }
);

class ChatGroup extends Model {}
ChatGroup.init(
  {
    chat_name: DataTypes.STRING,
  },
  { sequelize, modelName: "ChatGroup", tableName: "chat_groups" }
);

class UserChat extends Model {}
UserChat.init(
  {
    username: DataTypes.STRING,
    chat_group_id: DataTypes.INTEGER,
  },
  { sequelize, modelName: "UserChat", tableName: "user_chats" }
);

class ChatLog extends Model {}
ChatLog.init(
  {
    chat_group_id: DataTypes.INTEGER,
    username: DataTypes.STRING,
    content: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "ChatLog",
    tableName: "chat_logs",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = {
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
};
