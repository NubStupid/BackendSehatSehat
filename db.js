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
User.init({
  username: { type: DataTypes.STRING(32), primaryKey: true, allowNull: false },
  display_name: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  dob: { type: DataTypes.DATEONLY, allowNull: true },
  role: { type: DataTypes.STRING, allowNull: false },
  pp_url: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: 'User', tableName: 'users', timestamps: true, paranoid: true });

class Program extends Model {}
Program.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  program_name: DataTypes.STRING,
  pricing: DataTypes.FLOAT,
}, { sequelize, modelName: 'Program', tableName: 'programs', timestamps: true, paranoid: true });

class UserProgram extends Model {}
UserProgram.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  program_id: DataTypes.STRING,
  username: DataTypes.STRING,
  expires_in: DataTypes.DATE,
  chat_group_id: DataTypes.STRING,
}, { sequelize, modelName: 'UserProgram', tableName: 'user_programs', timestamps: true, paranoid: true });

class ProgramProgress extends Model {}
ProgramProgress.init({
  program_id: DataTypes.STRING, // Changed from INTEGER to STRING to match Program.id
  progress_index: DataTypes.INTEGER,
  progress_list: DataTypes.STRING,
  progress_list_type: DataTypes.STRING,
}, { sequelize, modelName: 'ProgramProgress', tableName: 'program_progresses', timestamps: true, paranoid: true });

class Meal extends Model {}
Meal.init({ 
  id: { type: DataTypes.STRING, primaryKey: true },
  meal_name: DataTypes.STRING,
  ingredients: DataTypes.TEXT,
  instructions: DataTypes.TEXT,
  calories: DataTypes.FLOAT,
  fat: DataTypes.FLOAT,
  protein: DataTypes.FLOAT,
  estimated_price: DataTypes.FLOAT,
  estimated_time: DataTypes.INTEGER,
}, { sequelize, modelName: 'Meal', tableName: 'meals', timestamps: true, paranoid: true });

class Plan extends Model {}
Plan.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  plan_name: DataTypes.STRING,
  total_calories: DataTypes.FLOAT,
  total_estimated_price: DataTypes.FLOAT,
  expert_username: DataTypes.STRING,
}, { sequelize, modelName: 'Plan', tableName: 'plans', timestamps: true, paranoid: true });

class MealPlan extends Model {}
MealPlan.init({
  plain_id: DataTypes.STRING, // Changed from INTEGER to STRING to match Plan.id
  meal_id: DataTypes.STRING,  // Changed from INTEGER to STRING to match Meal.id
}, { sequelize, modelName: 'MealPlan', tableName: 'meal_plans', timestamps: true, paranoid: true });

class Meetup extends Model {}
Meetup.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  meetup_title: DataTypes.STRING,
  meetup_time: DataTypes.DATE,
  customer_username: DataTypes.STRING,
  expert_username: DataTypes.STRING,
}, { sequelize, modelName: 'Meetup', tableName: 'meetups', timestamps: true, paranoid: true });

class Workout extends Model {}
Workout.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  workout_title: DataTypes.STRING,
  workout_list: DataTypes.TEXT,
  estimated_time: DataTypes.INTEGER,
  focused_at: DataTypes.STRING,
  expert_username: DataTypes.STRING,
}, { sequelize, modelName: 'Workout', tableName: 'workouts', timestamps: true, paranoid: true });

class ChatGroup extends Model {}
ChatGroup.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  chat_name: DataTypes.STRING,
}, { sequelize, modelName: 'ChatGroup', tableName: 'chat_groups', timestamps: true, paranoid: true });

class UserChat extends Model {}
UserChat.init({
  username: DataTypes.STRING,
  chat_group_id: DataTypes.STRING,
}, { sequelize, modelName: 'UserChat', tableName: 'user_chats', timestamps: true, paranoid: true });

class ChatLog extends Model {}
ChatLog.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  chat_group_id: DataTypes.STRING,
  username: DataTypes.STRING,
  content: DataTypes.TEXT,
}, { sequelize, modelName: 'ChatLog', tableName: 'chat_logs', timestamps: true, paranoid: true });

// Define Associations
// User associations
User.hasMany(UserProgram, { foreignKey: 'username', sourceKey: 'username' });
User.hasMany(Meetup, { as: 'CustomerMeetups', foreignKey: 'customer_username', sourceKey: 'username' });
User.hasMany(Meetup, { as: 'ExpertMeetups', foreignKey: 'expert_username', sourceKey: 'username' });
User.hasMany(Plan, { foreignKey: 'expert_username', sourceKey: 'username' });
User.hasMany(Workout, { foreignKey: 'expert_username', sourceKey: 'username' });
User.hasMany(UserChat, { foreignKey: 'username', sourceKey: 'username' });
User.hasMany(ChatLog, { foreignKey: 'username', sourceKey: 'username' });

// Program associations
Program.hasMany(UserProgram, { foreignKey: 'program_id', sourceKey: 'id' });
Program.hasMany(ProgramProgress, { foreignKey: 'program_id', sourceKey: 'id' });

// UserProgram associations
UserProgram.belongsTo(User, { foreignKey: 'username', targetKey: 'username' });
UserProgram.belongsTo(Program, { foreignKey: 'program_id', targetKey: 'id' });
UserProgram.belongsTo(ChatGroup, { foreignKey: 'chat_group_id', targetKey: 'id' });

// ProgramProgress associations
ProgramProgress.belongsTo(Program, { foreignKey: 'program_id', targetKey: 'id' });

// Plan associations
Plan.belongsTo(User, { as: 'Expert', foreignKey: 'expert_username', targetKey: 'username' });
Plan.belongsToMany(Meal, { through: MealPlan, foreignKey: 'plain_id', otherKey: 'meal_id' });

// Meal associations
Meal.belongsToMany(Plan, { through: MealPlan, foreignKey: 'meal_id', otherKey: 'plain_id' });

// MealPlan associations
MealPlan.belongsTo(Plan, { foreignKey: 'plain_id', targetKey: 'id' });
MealPlan.belongsTo(Meal, { foreignKey: 'meal_id', targetKey: 'id' });

// Meetup associations
Meetup.belongsTo(User, { as: 'Customer', foreignKey: 'customer_username', targetKey: 'username' });
Meetup.belongsTo(User, { as: 'Expert', foreignKey: 'expert_username', targetKey: 'username' });

// Workout associations
Workout.belongsTo(User, { as: 'Expert', foreignKey: 'expert_username', targetKey: 'username' });

// ChatGroup associations
ChatGroup.hasMany(UserProgram, { foreignKey: 'chat_group_id', sourceKey: 'id' });
ChatGroup.hasMany(UserChat, { foreignKey: 'chat_group_id', sourceKey: 'id' });
ChatGroup.hasMany(ChatLog, { foreignKey: 'chat_group_id', sourceKey: 'id' });

// UserChat associations
UserChat.belongsTo(User, { foreignKey: 'username', targetKey: 'username' });
UserChat.belongsTo(ChatGroup, { foreignKey: 'chat_group_id', targetKey: 'id' });

// ChatLog associations
ChatLog.belongsTo(User, { foreignKey: 'username', targetKey: 'username' });
ChatLog.belongsTo(ChatGroup, { foreignKey: 'chat_group_id', targetKey: 'id' });

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