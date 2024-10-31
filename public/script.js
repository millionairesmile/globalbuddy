// Firebase SDK에서 필요한 모듈 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyCF4rHF-mrKPBFhGdgOxBXej5M8D9DewZE",
  authDomain: "global-buddy.firebaseapp.com",
  databaseURL: "https://global-buddy-default-rtdb.firebaseio.com",
  projectId: "global-buddy",
  storageBucket: "global-buddy.appspot.com",
  messagingSenderId: "339499892201",
  appId: "1:339499892201:web:f6a1f1e72baba7e70fdf78",
  measurementId: "G-L4RY8ELS8D",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const menusRef = ref(db, "menus");

document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.querySelector("#addButton");
  addButton.addEventListener("click", addMenu);

  // Enter 키 입력 처리
  const inputs = document.querySelectorAll(".input-area input");
  inputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        addMenu();
      }
    });
  });

  // 실시간 데이터 동기화 설정
  onValue(menusRef, (snapshot) => {
    const menuList = document.getElementById("menuItems");
    menuList.innerHTML = ""; // 기존 목록 초기화

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        addMenuToList(data.name, data.menu, key);
      });
    }
  });
});

// 메뉴 추가 함수
async function addMenu() {
  const nameInput = document.getElementById("name");
  const menuInput = document.getElementById("menu");
  const name = nameInput.value.trim();
  const menu = menuInput.value.trim();

  // 입력 유효성 검사
  if (!name || !menu) {
    alert("이름과 메뉴를 모두 입력해주세요.");
    return;
  }

  try {
    const newMenuRef = push(menusRef);
    await set(newMenuRef, {
      name: name,
      menu: menu,
      timestamp: Date.now(),
    });

    // 입력 필드 초기화
    nameInput.value = "";
    menuInput.value = "";
    nameInput.focus();
  } catch (error) {
    console.error("메뉴 추가 중 오류 발생:", error);
    alert("메뉴를 추가하는 중 오류가 발생했습니다.");
  }
}

// 메뉴 목록에 추가하는 함수
function addMenuToList(name, menu, key) {
  const menuList = document.getElementById("menuItems");
  const listItem = document.createElement("li");
  listItem.dataset.key = key;

  const textSpan = document.createElement("span");
  textSpan.textContent = `${name}: ${menu}`;
  listItem.appendChild(textSpan);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-button");
  deleteButton.onclick = function () {
    deleteMenu(key);
  };

  listItem.appendChild(deleteButton);
  menuList.appendChild(listItem);
}

// 메뉴 삭제 함수
function deleteMenu(menuKey) {
  remove(ref(db, "menus/" + menuKey))
    .then(() => {
      console.log("메뉴가 삭제되었습니다.");
    })
    .catch((error) => {
      console.error("메뉴 삭제 중 오류 발생:", error);
      alert("메뉴 삭제 중 오류가 발생했습니다.");
    });
}

// 이미지 업로드 및 표시 관련 함수들
window.fileInputHandler = function (event) {
  const files = event.target.files;
  displayImages(files);
};

window.dropHandler = function (event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  displayImages(files);
};

window.dragOverHandler = function (event) {
  event.preventDefault();
};

function displayImages(files) {
  const gallery = document.getElementById("imageGallery");
  Array.from(files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.onclick = () => showFullscreenImage(img.src);
      gallery.appendChild(img);
    }
  });
}

function showFullscreenImage(src) {
  const fullscreenDiv = document.createElement("div");
  fullscreenDiv.classList.add("fullscreen-image");

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.innerHTML = "&times;";
  backButton.onclick = (e) => {
    e.stopPropagation();
    fullscreenDiv.remove();
  };

  const img = document.createElement("img");
  img.src = src;

  fullscreenDiv.appendChild(backButton);
  fullscreenDiv.appendChild(img);
  document.body.appendChild(fullscreenDiv);

  fullscreenDiv.onclick = (e) => {
    if (e.target === fullscreenDiv) {
      fullscreenDiv.remove();
    }
  };
}

// Clear 기능들을 전역 스코프에 추가
window.clearMenu = function () {
  const clearPassword = document.getElementById("clearPassword").value;
  const correctPassword = "1234";
  if (clearPassword === correctPassword) {
    remove(menusRef)
      .then(() => {
        alert("목록이 초기화되었습니다.");
        document.getElementById("clearPassword").value = "";
      })
      .catch((error) => {
        console.error("목록 초기화 중 오류 발생:", error);
        alert("목록 초기화 중 오류가 발생했습니다.");
      });
  } else {
    alert("비밀번호가 올바르지 않습니다.");
  }
};

window.clearImages = function () {
  const clearPassword = document.getElementById("clearPassword").value;
  const correctPassword = "1234";
  if (clearPassword === correctPassword) {
    document.getElementById("imageGallery").innerHTML = "";
    alert("이미지가 모두 삭제되었습니다.");
    document.getElementById("clearPassword").value = "";
  } else {
    alert("비밀번호가 올바르지 않습니다.");
  }
};
