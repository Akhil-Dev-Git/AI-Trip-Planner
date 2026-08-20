// basic test of the logic
let localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, val) { this.data[key] = val; }
};

const users = JSON.parse(localStorage.getItem('tripPlannerUsersDb') || '[]');
users.push({ username: "test", email: "test@test.com", password: "pwd" });
localStorage.setItem('tripPlannerUsersDb', JSON.stringify(users));

const loginUsers = JSON.parse(localStorage.getItem('tripPlannerUsersDb') || '[]');
const userRecord = loginUsers.find(u => u.username === "test" && u.password === "pwd");
console.log("Found:", !!userRecord);
