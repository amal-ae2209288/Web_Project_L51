document.addEventListener("DOMContentLoaded", function () {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  const topAvatar = document.getElementById("topAvatar");
  const topUser = document.getElementById("topUser");
  const meAvatar = document.getElementById("meAvatar");
  const meName = document.getElementById("meName");
  const meHandle = document.getElementById("meHandle");
  const meBio = document.getElementById("meBio");
  const followingCount = document.getElementById("followingCount");

  const nameInput = document.getElementById("name");
  const bioInput = document.getElementById("bio");
  const avatarInput = document.getElementById("avatar");
  const saveBtn = document.getElementById("saveBtn");

  function showAvatar(element, user) {
    if (user.avatar && user.avatar !== "") {
      element.innerHTML = '<img src="' + user.avatar + '" alt="' + user.name + '">';
    } else {
      element.textContent = user.name.charAt(0).toUpperCase();
    }
  }

  function loadProfile() {
  let user = getCurrentUser();
/*
const viewUserId = getData("viewUserId");

if (viewUserId) {
  const users = getData("users") || [];

  for (let i = 0; i < users.length; i++) {
    if (users[i].id === viewUserId) {
      user = users[i];
      break;
    }
  }

  saveData("viewUserId", null);
}*/

    if (!user) {
      return;
    }

    topUser.textContent = "@" + user.username;
    meName.textContent = user.name;
    meHandle.textContent = "@" + user.username;
    meBio.textContent = user.bio || "No bio yet.";

    if (user.following) {
      followingCount.textContent = user.following.length;
    } else {
      followingCount.textContent = "0";
    }

    nameInput.value = user.name || "";
    bioInput.value = user.bio || "";
    avatarInput.value = user.avatar || "";

    showAvatar(topAvatar, user);
    showAvatar(meAvatar, user);
  }

  function updateProfile() {
  const newName = nameInput.value.trim();
  const newBio = bioInput.value.trim();
  const newAvatar = avatarInput.value.trim();

  if (newName === "") {
    alert("Name cannot be empty");
    return;
  }

  const users = getData("users") || [];

  for (let i = 0; i < users.length; i++) {
    if (users[i].id === currentUser.id) {
      users[i].name = newName;
      users[i].bio = newBio;
      users[i].avatar = newAvatar;

      saveData("users", users);
      saveData("currentUser", users[i]);

      // update page 
      topUser.textContent = "@" + users[i].username;
      meName.textContent = users[i].name;
      meHandle.textContent = "@" + users[i].username;
      meBio.textContent = users[i].bio || "No bio yet.";

      nameInput.value = users[i].name || "";
      bioInput.value = users[i].bio || "";
      avatarInput.value = users[i].avatar || "";

      showAvatar(topAvatar, users[i]);
      showAvatar(meAvatar, users[i]);

      return;
    }
  }

  alert("User not found");
}

  if (saveBtn) {
  saveBtn.addEventListener("click", function () {
    updateProfile();
  });
}

  window.logout = function () {
    saveData("currentUser", null);
    window.location.href = "index.html";
  };

  loadProfile();
});