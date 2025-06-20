// db.js
const { Sequelize, Model, DataTypes } = require("sequelize");

const DB_NAME = "MDPSEHAT";
const DB_USER = "root";
const DB_PASS = "";
const DB_HOST = "localhost";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

// User
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

// Program
class Program extends Model {}
Program.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    program_name: { type: DataTypes.STRING, allowNull: false },
    pricing: { type: DataTypes.FLOAT, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: "Program",
    tableName: "programs",
    timestamps: true,
    paranoid: true,
  }
);

// UserProgram
class UserProgram extends Model {}
UserProgram.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    program_id: DataTypes.STRING,
    username: DataTypes.STRING,
    expires_in: DataTypes.DATE,
    chat_group_id: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "UserProgram",
    tableName: "user_programs",
    timestamps: true,
    paranoid: true,
  }
);

// ProgramProgress
class ProgramProgress extends Model {}
ProgramProgress.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    program_id: DataTypes.STRING,
    progress_index: DataTypes.INTEGER,
    progress_list: DataTypes.STRING,
    progress_list_type: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "ProgramProgress",
    tableName: "program_progresses",
    timestamps: true,
    paranoid: true,
  }
);

// Meal
class Meal extends Model {}
Meal.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    meal_name: DataTypes.STRING,
    ingredients: DataTypes.TEXT,
    calories: DataTypes.FLOAT,
    fat: DataTypes.FLOAT,
    protein: DataTypes.FLOAT,
    program_id: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "Meal",
    tableName: "meals",
    timestamps: true,
    paranoid: true,
  }
);

// Plan
class Plan extends Model {}
Plan.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    plan_name: DataTypes.STRING,
    total_calories: DataTypes.FLOAT,
    total_estimated_price: DataTypes.FLOAT,
    expert_username: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "Plan",
    tableName: "plans",
    timestamps: true,
    paranoid: true,
  }
);

// MealPlan
class MealPlan extends Model {}
MealPlan.init(
  {
    plain_id: DataTypes.STRING,
    meal_id: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "MealPlan",
    tableName: "meal_plans",
    timestamps: true,
    paranoid: true,
  }
);

// Meetup
class Meetup extends Model {}
Meetup.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    meetup_title: DataTypes.STRING,
    meetup_time: DataTypes.DATE,
    customer_username: DataTypes.STRING,
    expert_username: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "Meetup",
    tableName: "meetups",
    timestamps: true,
    paranoid: true,
  }
);

// Workout
class Workout extends Model {}
Workout.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    workout_title: DataTypes.STRING,
    estimated_time: DataTypes.INTEGER,
    focused_at: DataTypes.STRING,
    program_id: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "Workout",
    tableName: "workouts",
    timestamps: true,
    paranoid: true,
  }
);

// ChatGroup
class ChatGroup extends Model {}
ChatGroup.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    chat_name: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "ChatGroup",
    tableName: "chat_groups",
    timestamps: true,
    paranoid: true,
  }
);

// UserChat
class UserChat extends Model {}
UserChat.init(
  {
    username: DataTypes.STRING,
    chat_group_id: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "UserChat",
    tableName: "user_chats",
    timestamps: true,
    paranoid: true,
  }
);

// ChatLog
class ChatLog extends Model {}
ChatLog.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    chat_group_id: DataTypes.STRING,
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

// Associations
User.hasMany(UserProgram, { foreignKey: "username" });
User.hasMany(Meetup, {
  as: "CustomerMeetups",
  foreignKey: "customer_username",
});
User.hasMany(Meetup, { as: "ExpertMeetups", foreignKey: "expert_username" });
User.hasMany(Plan, { foreignKey: "expert_username" });
User.hasMany(Workout, { foreignKey: "expert_username" });
User.hasMany(UserChat, { foreignKey: "username" });
User.hasMany(ChatLog, { foreignKey: "username" });

Program.hasMany(UserProgram, { foreignKey: "program_id" });
Program.hasMany(ProgramProgress, { foreignKey: "program_id" });

UserProgram.belongsTo(User, { foreignKey: "username" });
UserProgram.belongsTo(Program, { foreignKey: "program_id" });
UserProgram.belongsTo(ChatGroup, { foreignKey: "chat_group_id" });

ProgramProgress.belongsTo(Program, { foreignKey: "program_id" });

Plan.belongsTo(User, { as: "Expert", foreignKey: "expert_username" });
Plan.belongsToMany(Meal, { through: MealPlan, foreignKey: "plain_id" });
Meal.belongsToMany(Plan, { through: MealPlan, foreignKey: "meal_id" });

MealPlan.belongsTo(Plan, { foreignKey: "plain_id" });
MealPlan.belongsTo(Meal, { foreignKey: "meal_id" });

Meetup.belongsTo(User, { as: "Customer", foreignKey: "customer_username" });
Meetup.belongsTo(User, { as: "Expert", foreignKey: "expert_username" });

Workout.belongsTo(User, { as: "Expert", foreignKey: "expert_username" });

ChatGroup.hasMany(UserProgram, { foreignKey: "chat_group_id" });
ChatGroup.hasMany(UserChat, { foreignKey: "chat_group_id" });
ChatGroup.hasMany(ChatLog, { foreignKey: "chat_group_id" });

UserChat.belongsTo(User, { foreignKey: "username" });
UserChat.belongsTo(ChatGroup, { foreignKey: "chat_group_id" });

ChatLog.belongsTo(User, { foreignKey: "username" });
ChatLog.belongsTo(ChatGroup, { foreignKey: "chat_group_id" });

Meal.belongsTo(Program, { foreignKey: "program_id" });
Program.hasMany(Meal, { foreignKey: "program_id" });

Workout.belongsTo(Program, { foreignKey: "program_id" });
Program.hasMany(Workout, { foreignKey: "program_id" });

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
