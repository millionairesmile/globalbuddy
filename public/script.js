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
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
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
const menusRef = ref(db, "menus");

document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.querySelector("#addButton");
  addButton.addEventListener("click", addMenu);

  const imageInput = document.getElementById("imageUpload");
  imageInput.addEventListener("change", uploadImage);

  // 실시간 데이터 동기화 설정
  onValue(menusRef, (snapshot) => {
    const menuList = document.getElementById("menuItems");
    const gallery = document.getElementById("imageGallery");
    menuList.innerHTML = ""; // 기존 목록 초기화
    gallery.innerHTML = ""; // 기존 이미지 초기화

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        addMenuToList(data.name, data.menu, key);

        // 이미지 URL이 있는 경우 갤러리에 추가
        if (data.imageUrl) {
          addImageToGallery(data.imageUrl);
        }
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

// 이미지 업로드 함수
async function uploadImage(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드할 수 있습니다.");
    return;
  }

  const imageRef = storageRef(storage, `menuImages/${file.name}`);
  try {
    const snapshot = await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // 업로드한 이미지 URL을 Realtime Database에 저장
    const newMenuRef = push(menusRef);
    await set(newMenuRef, {
      imageUrl: imageUrl,
      timestamp: Date.now(),
    });

    alert("이미지가 성공적으로 업로드되었습니다.");
  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error);
    alert("이미지 업로드 중 오류가 발생했습니다.");
  }
}

// 갤러리에 이미지 추가 함수
function addImageToGallery(url) {
  const gallery = document.getElementById("imageGallery");
  const img = document.createElement("img");
  img.src = url;
  img.onclick = () => showFullscreenImage(url);
  gallery.appendChild(img);
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
