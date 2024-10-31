// Firebase Realtime Database 관련 모듈 가져오기
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase 초기화 후 데이터베이스 가져오기
const db = getDatabase();

document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.getElementById("addButton");
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

  // 페이지 로드 시 데이터 가져오기
  loadMenus();
});

// 메뉴 추가 함수
function addMenu() {
  const nameInput = document.getElementById("name");
  const menuInput = document.getElementById("menu");
  const name = nameInput.value.trim();
  const menu = menuInput.value.trim();

  if (!name || !menu) {
    alert("이름과 메뉴를 모두 입력해주세요.");
    return;
  }

  try {
    // Firebase Realtime Database에 메뉴 추가
    const newMenuKey = ref(db, "menus").push().key; // 새로운 메뉴의 키 생성
    set(ref(db, "menus/" + newMenuKey), {
      name: name,
      menu: menu,
    });

    // 리스트에 추가
    addMenuToList(name, menu, newMenuKey);

    // 입력 필드 초기화
    nameInput.value = "";
    menuInput.value = "";
    nameInput.focus();
  } catch (error) {
    console.error("메뉴 추가 중 오류 발생:", error);
    alert("메뉴를 추가하는 중 오류가 발생했습니다.");
  }
}

// 페이지 로드 시 메뉴 불러오기
function loadMenus() {
  const menusRef = ref(db, "menus/");
  get(menusRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const menuData = childSnapshot.val();
          addMenuToList(menuData.name, menuData.menu, childSnapshot.key);
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("데이터를 가져오는 중 오류 발생:", error);
    });
}

// 메뉴 목록에 추가하는 함수
function addMenuToList(name, menu, menuKey) {
  const menuList = document.getElementById("menuItems");

  const listItem = document.createElement("li");
  const textSpan = document.createElement("span");
  textSpan.textContent = `${name}: ${menu}`;
  listItem.appendChild(textSpan);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-button");
  deleteButton.onclick = function () {
    deleteMenu(menuKey);
    listItem.remove();
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
    });
}

// 나머지 기존 코드 (이미지 업로드, 클리어 등)...

// 이미지 업로드 관련 함수들
function fileInputHandler(event) {
  const files = event.target.files;
  displayImages(files);
}

function dropHandler(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  displayImages(files);
}

function dragOverHandler(event) {
  event.preventDefault();
}

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
  fullscreenDiv.onclick = () => fullscreenDiv.remove();
  const img = document.createElement("img");
  img.src = src;
  fullscreenDiv.appendChild(img);
  document.body.appendChild(fullscreenDiv);
}

// Clear functions
function clearMenu() {
  const clearPassword = document.getElementById("clearPassword").value;
  const correctPassword = "1234";
  if (clearPassword === correctPassword) {
    document.getElementById("menuItems").innerHTML = "";
    alert("목록이 초기화되었습니다.");
    document.getElementById("clearPassword").value = "";
  } else {
    alert("비밀번호가 올바르지 않습니다.");
  }
}

function clearImages() {
  const clearPassword = document.getElementById("clearPassword").value;
  const correctPassword = "1234";
  if (clearPassword === correctPassword) {
    document.getElementById("imageGallery").innerHTML = "";
    alert("이미지가 모두 삭제되었습니다.");
    document.getElementById("clearPassword").value = "";
  } else {
    alert("비밀번호가 올바르지 않습니다.");
  }
}
