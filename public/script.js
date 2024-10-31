// DOM이 완전히 로드된 후 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", function () {
  // Add 버튼에 이벤트 리스너 추가
  const addButton = document.querySelector(".input-area button");
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
});

function addMenu() {
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
    // 새 리스트 아이템 생성
    const listItem = document.createElement("li");

    // 텍스트 내용을 담을 span 엘리먼트 생성
    const textSpan = document.createElement("span");
    textSpan.textContent = `${name}: ${menu}`;
    listItem.appendChild(textSpan);

    // 삭제 버튼 생성
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function () {
      listItem.remove();
    };

    // 리스트 아이템에 삭제 버튼 추가
    listItem.appendChild(deleteButton);

    // 메뉴 리스트에 새로운 아이템 추가
    const menuList = document.getElementById("menuItems");
    menuList.appendChild(listItem);

    // 입력 필드 초기화
    nameInput.value = "";
    menuInput.value = "";

    // 첫 번째 입력 필드로 포커스 이동
    nameInput.focus();
  } catch (error) {
    console.error("메뉴 추가 중 오류 발생:", error);
    alert("메뉴를 추가하는 중 오류가 발생했습니다.");
  }
}

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

function showFullscreenImage(src) {
  const fullscreenDiv = document.createElement("div");
  fullscreenDiv.classList.add("fullscreen-image");

  // 뒤로가기 버튼 추가
  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.innerHTML = "&times;";
  backButton.onclick = (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    fullscreenDiv.remove();
  };

  const img = document.createElement("img");
  img.src = src;

  fullscreenDiv.appendChild(backButton);
  fullscreenDiv.appendChild(img);
  document.body.appendChild(fullscreenDiv);

  // 배경 클릭시에도 닫히도록 설정
  fullscreenDiv.onclick = (e) => {
    if (e.target === fullscreenDiv) {
      fullscreenDiv.remove();
    }
  };
}
