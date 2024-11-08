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

function addImageToGallery(imageUrl, key) {
  const gallery = document.getElementById("imageGallery");
  const imgContainer = document.createElement("div");
  imgContainer.className = "image-container";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.onclick = () => showFullscreenImage(imageUrl);

  imgContainer.appendChild(img);
  gallery.appendChild(imgContainer);
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

// CSS 스타일 (필요한 경우 추가)
const style = document.createElement("style");
style.textContent = `
  .delete-confirm-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background: #fff;
    border: 2px solid #ccc;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    text-align: center;
    z-index: 1000;
  }
  .delete-confirm-input {
    margin: 10px 0;
    padding: 8px;
    width: 80%;
  }
  .confirm-delete-button {
    margin: 5px;
    padding: 8px 16px;
    background: red;
    color: white;
    border: none;
    cursor: pointer;
    opacity: 0.5;
  }
  .confirm-delete-button.active {
    opacity: 1;
  }
  .cancel-delete-button {
    margin: 5px;
    padding: 8px 16px;
    background: #ccc;
    color: black;
    border: none;
    cursor: pointer;
  }
`;
document.head.appendChild(style);
