function getUsers() {
  return Storage.get("users", []);
}

function saveUsers(users) {
  Storage.set("users", users);
}


function setSession(userId) {
  Storage.set("session", { userId });
}

function clearSession() {
  localStorage.removeItem("session");
}
function getSessionUser() {
  const session = Storage.get("session", null);
  if (!session) return null;
  const users = getUsers();
  return users.find(u => u.id === session.userId) || null;
}

function requireLogin() {
  const me = getSessionUser();
  if (!me) window.location.href = "index.html";
  return me;
}



function logout() {
  clearSession();
  window.location.href = "index.html";
}

function signup({ name, username, password, confirm }) {
  const users = getUsers();

  if (!name.trim()) throw new Error("Name is required.");
  if (!username.trim()) throw new Error("Username is required.");
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase()))
    throw new Error("Username already exists.");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  if (password !== confirm) throw new Error("Passwords do not match.");

  const newUser = {
    id: uid("u"),
    name: name.trim(),
    username: username.trim(),
    password,
    bio: "Computer Science student. Love coding and coffee.",
    avatar: "",
    following: []
  };

  users.push(newUser);
  saveUsers(users);
  setSession(newUser.id);
}

function login({ username, password }) {
  const users = getUsers();
  const user = users.find(u => u.username === username.trim());
  if (!user) throw new Error("User not found.");
  if (user.password !== password) throw new Error("Wrong password.");
  setSession(user.id);
}

/* Optional: seed demo data(runs once) */
(function seedOnce(){
  const users = getUsers();
  const posts = Storage.get("posts", []);
  if (users.length > 0) return;

  const u1 = { id: uid("u"), name:"Khadija", username:"khadija01", password:"123456", bio:"Digital Artist.", avatar:"", following:[] };
  const u2 = { id: uid("u"), name:"Max", username:"maxdev", password:"123456", bio:"Backend developer. Love to solve complex problems!", avatar:"", following:[] };
  const u3 = { id: uid("u"), name:"Sara", username:"sarablog", password:"123456", bio:"Blogging about tech and travel ✈️", avatar:"", following:[] };
  const u4 = { id: uid("u"), name:"Arwa", username:"arwa", password:"123456", bio:"Computer Science student. Love coding and coffee.", avatar:"", following:[] };
  u1.following = [u2.id, u3.id];

  saveUsers([u1,u2,u3,u4]);
  Storage.set("posts", [
    { id: uid("p"), authorId: u2.id, content:"Working on a clean UI today ✨", createdAt: Date.now()-1000*60*40 },
    { id: uid("p"), authorId: u4.id, content:"Excited to have built this social media platform! #coding #webdev", createdAt: Date.now()-1000*60*15 },
    { id: uid("p"), authorId: u3.id, content:"New blog post soon 👀", createdAt: Date.now()-1000*60*8 },
    { id: uid("p"), authorId: u1.id, content:"digital artwort is always my comfort zoon", createdAt: Date.now()-1000*60*8 }
  ]);
})();