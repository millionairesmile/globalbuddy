// Firebase SDK에서 필요한 모듈 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref as dbRef,
  push,
  set,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

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
const storage = getStorage(app);
const menusRef = dbRef(db, "menus");
const imagesRef = dbRef(db, "images");

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

  // 실시간 메뉴 데이터 동기화
  onValue(menusRef, (snapshot) => {
    const menuList = document.getElementById("menuItems");
    menuList.innerHTML = "";
    let index = 1; // 인덱스 번호 초기화

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        addMenuToList(index, data.name, data.menu, key);
        index++; // 인덱스 증가
      });
    }
  });

  // 실시간 이미지 데이터 동기화
  onValue(imagesRef, (snapshot) => {
    const gallery = document.getElementById("imageGallery");
    gallery.innerHTML = "";

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        addImageToGallery(data.url, childSnapshot.key);
      });
    }
  });
});

// 이미지 업로드 및 표시 관련 함수들
window.fileInputHandler = function (event) {
  const files = event.target.files;
  uploadImages(files);
};

window.dropHandler = function (event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  uploadImages(files);
};

window.dragOverHandler = function (event) {
  event.preventDefault();
};

async function uploadImages(files) {
  for (const file of Array.from(files)) {
    if (file.type.startsWith("image/")) {
      try {
        const imageRef = storageRef(
          storage,
          `images/${Date.now()}_${file.name}`
        );
        const snapshot = await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const newImageRef = push(imagesRef);
        await set(newImageRef, {
          url: downloadURL,
          timestamp: Date.now(),
          filename: file.name,
        });
      } catch (error) {
        console.error("이미지 업로드 중 오류 발생:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    }
  }
}

// 이미지 갤러리에 사진 추가 후 클래스 업데이트
function addImageToGallery(imageUrl, key) {
  const gallery = document.getElementById("imageGallery");
  const imgContainer = document.createElement("div");
  imgContainer.className = "image-container";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.onclick = () => showFullscreenImage(imageUrl);

  imgContainer.appendChild(img);
  gallery.appendChild(imgContainer);

  updateGalleryLayout(gallery);
}

// 이미지 갤러리의 레이아웃을 업데이트하는 함수
function updateGalleryLayout(gallery) {
  const imagesCount = gallery.childElementCount;
  gallery.classList.remove("single-image", "two-images", "multiple-images");

  if (imagesCount === 1) {
    gallery.classList.add("single-image");
  } else if (imagesCount === 2) {
    gallery.classList.add("two-images");
  } else {
    gallery.classList.add("multiple-images");
  }
}

async function deleteImage(key, imageUrl) {
  if (!confirm("이미지를 삭제하시겠습니까?")) return;

  try {
    const imageRef = storageRef(storage, imageUrl);
    await deleteObject(imageRef);

    await remove(dbRef(db, `images/${key}`));
  } catch (error) {
    console.error("이미지 삭제 중 오류 발생:", error);
    alert("이미지 삭제 중 오류가 발생했습니다.");
  }
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

// Clear 기능
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

window.clearImages = async function () {
  const clearPassword = document.getElementById("clearPassword").value;
  const correctPassword = "1234";

  if (clearPassword === correctPassword) {
    if (!confirm("모든 이미지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const imagesStorageRef = storageRef(storage, "images");
      const items = await listAll(imagesStorageRef);

      const deletePromises = items.items.map(async (item) => {
        try {
          await deleteObject(item);
        } catch (error) {
          console.error(`이미지 ${item.name} 삭제 중 오류 발생:`, error);
        }
      });

      await Promise.all(deletePromises);
      await remove(imagesRef);

      document.getElementById("imageGallery").innerHTML = "";
      alert("모든 이미지가 삭제되었습니다.");
      document.getElementById("clearPassword").value = "";
    } catch (error) {
      console.error("이미지 초기화 중 오류 발생:", error);
      alert("이미지 초기화 중 오류가 발생했습니다.");
    }
  } else {
    alert("비밀번호가 올바르지 않습니다.");
  }
};

// 메뉴 추가 함수
async function addMenu() {
  const nameInput = document.getElementById("name");
  const menuInput = document.getElementById("menu");
  const name = nameInput.value.trim();
  const menu = menuInput.value.trim();

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

    nameInput.value = "";
    menuInput.value = "";
    nameInput.focus();
  } catch (error) {
    console.error("메뉴 추가 중 오류 발생:", error);
    alert("메뉴를 추가하는 중 오류가 발생했습니다.");
  }
}

function addMenuToList(index, name, menu, key) {
  const menuList = document.getElementById("menuItems");
  const listItem = document.createElement("li");
  listItem.dataset.key = key;

  const textSpan = document.createElement("span");
  textSpan.textContent = `${index}. ${name}: ${menu}`; // 인덱스 추가
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

function deleteMenu(menuKey) {
  // 기존 삭제 버튼 클릭 시 삭제 확인 모달 표시
  const confirmDiv = document.createElement("div");
  confirmDiv.classList.add("delete-confirm-modal");

  const instruction = document.createElement("p");
  instruction.textContent = "Type 'delete' to confirm:";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.placeholder = "delete를 입력하세요";
  inputField.classList.add("delete-confirm-input");

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.disabled = true; // 초기 비활성화
  deleteButton.classList.add("confirm-delete-button");

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.classList.add("cancel-delete-button");

  // 모달에 요소 추가
  confirmDiv.appendChild(instruction);
  confirmDiv.appendChild(inputField);
  confirmDiv.appendChild(deleteButton);
  confirmDiv.appendChild(cancelButton);
  document.body.appendChild(confirmDiv);

  // 입력 확인 이벤트
  inputField.addEventListener("input", () => {
    if (inputField.value.trim() === "delete") {
      deleteButton.disabled = false; // delete가 맞으면 버튼 활성화
      deleteButton.classList.add("active");
    } else {
      deleteButton.disabled = true; // 틀리면 버튼 비활성화
      deleteButton.classList.remove("active");
    }
  });

  // Delete 버튼 클릭 시 실제 삭제
  deleteButton.onclick = () => {
    remove(dbRef(db, "menus/" + menuKey))
      .then(() => {
        console.log("메뉴가 삭제되었습니다.");
        confirmDiv.remove(); // 모달 제거
      })
      .catch((error) => {
        console.error("메뉴 삭제 중 오류 발생:", error);
        alert("메뉴 삭제 중 오류가 발생했습니다.");
        confirmDiv.remove(); // 모달 제거
      });
  };

  // Cancel 버튼 클릭 시 모달 제거
  cancelButton.onclick = () => {
    confirmDiv.remove();
  };
}

let currentPage = 0;
const itemsPerPage = 10;

function updateMenuDisplay() {
  const menuItems = document.getElementById("menuItems");
  const totalPages = Math.ceil(menuItems.children.length / itemsPerPage);

  // 현재 페이지가 범위를 벗어나지 않도록 제한
  currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));

  // 페이지에 따라 Y축 이동
  const offsetY = -(currentPage * 100) + "%";
  menuItems.style.transform = `translateY(${offsetY})`;
}

function changePage(direction) {
  currentPage += direction;
  updateMenuDisplay();
}

// 초기 디스플레이 업데이트
updateMenuDisplay();

// CSS 스타일 (필요한 경우 추가)
const style = document.createElement("style");
style.textContent = `
.delete-confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  width: 300px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;
  font-family: Arial, sans-serif;
}

/* Text instruction */
.delete-confirm-modal p {
  font-size: 14px;
  color: #555;
  margin-bottom: 12px;
}

/* Input field for typing 'delete' */
.delete-confirm-input {
  padding: 8px;
  width: 80%;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

/* Buttons */
.confirm-delete-button,
.cancel-delete-button {
  padding: 8px 15px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  margin: 5px;
  font-weight: bold;
}

.confirm-delete-button {
  opacity: 0.5; /* 비활성화 시 반투명 */
}

.confirm-delete-button.active {
  opacity: 1; /* 활성화 시 완전 불투명 */
}

/* Hover Effect for Active Delete Button */
.confirm-delete-button.active:hover {
  background-color: #c0392b;
}

.cancel-delete-button {
  background-color: #95a5a6;
}

.cancel-delete-button:hover {
  background-color: #7f8c8d;
}
`;
document.head.appendChild(style);
