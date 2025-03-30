// Firebase 數據庫引用
const database = firebase.database();
const discountsRef = database.ref("discounts");

// 初始化 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
  authDomain: "discount-hunter-xxxxx.firebaseapp.com",
  databaseURL: "https://discount-hunter-xxxxx-default-rtdb.firebaseio.com",
  projectId: "discount-hunter-xxxxx",
  storageBucket: "discount-hunter-xxxxx.appspot.com",
  messagingSenderId: "xxxxxxxxxxxx",
  appId: "1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxxxx",
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 顯示優惠列表
function displayDiscounts(discounts) {
  const searchResults = document.getElementById("searchResults");
  if (!searchResults) return;

  // 保留標題
  const title = searchResults.querySelector(".section-title");
  searchResults.innerHTML = "";
  if (title) {
    searchResults.appendChild(title);
  }

  // 顯示優惠卡片
  Object.values(discounts)
    .reverse()
    .forEach((discount) => {
      const card = createDiscountCard(discount);
      searchResults.appendChild(card);
    });
}

// 創建優惠卡片
function createDiscountCard(discount) {
  const card = document.createElement("a");
  card.href = `discount-detail.html?id=${discount.id}`;
  card.className = "discount-card";

  const date = new Date(discount.date);
  const formattedDate = date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  card.innerHTML = `
    <div class="discount-header">
      <span class="discount-tag">${discount.tag}</span>
      <span class="discount-date">${formattedDate}</span>
    </div>
    <div class="discount-content">
      <h3 class="discount-title">${discount.title}</h3>
      <p class="discount-description">${discount.description}</p>
      <div class="discount-footer">
        <span class="discount-location">
          <i class="fas fa-map-marker-alt"></i> ${discount.location}
        </span>
        <span class="discount-category">
          <i class="fas fa-${getIconForCategory(discount.category)}"></i> ${
    discount.category
  }
        </span>
      </div>
    </div>
  `;

  return card;
}

// 添加新優惠
async function addDiscount(event) {
  event.preventDefault();

  try {
    // 顯示載入中提示
    const submitButton = event.target.querySelector(".submit-button");
    const originalText = submitButton.textContent;
    submitButton.textContent = "新增中...";
    submitButton.disabled = true;

    const form = event.target;
    const newDiscount = {
      id: Date.now().toString(),
      tag: form.tag.value,
      date: form.date.value,
      title: form.title.value,
      description: form.description.value,
      location: form.location.value,
      category: form.category.value,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    };

    console.log("準備保存優惠數據...");
    // 保存到 Firebase 並等待完成
    await discountsRef.child(newDiscount.id).set(newDiscount);
    console.log("優惠數據保存成功！");

    // 顯示成功消息
    alert("優惠新增成功！");

    // 使用多種方式嘗試跳轉
    console.log("準備跳轉到首頁...");
    try {
      window.location.href = "index.html";
    } catch (error) {
      console.error("第一種跳轉方式失敗:", error);
      try {
        window.location.replace("index.html");
      } catch (error) {
        console.error("第二種跳轉方式失敗:", error);
        try {
          window.location = "index.html";
        } catch (error) {
          console.error("第三種跳轉方式失敗:", error);
          // 如果所有跳轉方式都失敗，提供手動返回的提示
          alert("跳轉失敗，請點擊確定後手動返回首頁");
        }
      }
    }
  } catch (error) {
    console.error("Error adding discount:", error);
    alert("新增優惠失敗，請稍後再試。");

    // 恢復按鈕狀態
    const submitButton = event.target.querySelector(".submit-button");
    submitButton.textContent = "新增優惠";
    submitButton.disabled = false;
  }
}

// 根據類別獲取圖標
function getIconForCategory(category) {
  const iconMap = {
    飲品: "coffee",
    餐飲: "utensils",
    購物: "shopping-cart",
    信用卡: "credit-card",
    電影: "film",
    娛樂: "ticket-alt",
    其他: "tag",
  };
  return iconMap[category] || "tag";
}

// 搜尋功能
function searchDiscounts(keyword) {
  if (!keyword) {
    // 如果沒有關鍵字，顯示所有優惠
    discountsRef.once("value").then((snapshot) => {
      const discounts = snapshot.val() || {};
      displayDiscounts(discounts);
    });
    return;
  }

  // 從 Firebase 獲取所有優惠並進行過濾
  discountsRef.once("value").then((snapshot) => {
    const discounts = snapshot.val() || {};
    const filteredDiscounts = Object.values(discounts).filter((discount) => {
      const searchString =
        `${discount.title} ${discount.description} ${discount.location} ${discount.category}`.toLowerCase();
      return searchString.includes(keyword.toLowerCase());
    });

    // 將過濾後的結果轉換為對象格式
    const filteredResults = {};
    filteredDiscounts.forEach((discount) => {
      filteredResults[discount.id] = discount;
    });

    displayDiscounts(filteredResults);
  });
}

// 頁面載入時顯示優惠
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 獲取所有優惠數據
    const snapshot = await discountsRef.once("value");
    const discounts = [];
    snapshot.forEach((childSnapshot) => {
      discounts.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    // 按創建時間排序（最新的在前）
    discounts.sort((a, b) => b.createdAt - a.createdAt);

    // 更新搜尋結果區域
    const searchResults = document.getElementById("searchResults");
    if (searchResults) {
      // 清空現有內容
      searchResults.innerHTML = '<h2 class="section-title">熱門優惠</h2>';

      // 添加優惠卡片
      discounts.forEach((discount) => {
        const discountCard = createDiscountCard(discount);
        searchResults.appendChild(discountCard);
      });
    }
  } catch (error) {
    console.error("Error fetching discounts:", error);
  }

  // 監聽數據變化
  discountsRef.on("value", (snapshot) => {
    const discounts = snapshot.val() || {};
    displayDiscounts(discounts);
  });

  // 只在新增優惠頁面綁定表單提交事件
  if (window.location.pathname.includes("add-discount.html")) {
    const addForm = document.getElementById("addDiscountForm");
    if (addForm) {
      addForm.addEventListener("submit", addDiscount);
    }
  }

  // 只在首頁綁定搜尋相關事件
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    // 綁定搜尋按鈕事件
    const searchButton = document.getElementById("searchButton");
    if (searchButton) {
      searchButton.addEventListener("click", () => {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
          searchDiscounts(searchInput.value);
        }
      });
    }

    // 綁定搜尋輸入框事件（即時搜尋）
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchDiscounts(e.target.value);
      });
    }

    // 篩選面板相關代碼
    const filterButton = document.getElementById("filterButton");
    const filterPanel = document.getElementById("filterPanel");

    if (filterButton && filterPanel) {
      filterButton.addEventListener("click", function () {
        filterPanel.classList.toggle("hidden");
        const icon = this.querySelector("i");
        if (filterPanel.classList.contains("hidden")) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-filter");
        } else {
          icon.classList.remove("fa-filter");
          icon.classList.add("fa-times");
        }
      });

      // 點擊面板外部關閉
      document.addEventListener("click", function (event) {
        if (
          !filterPanel.contains(event.target) &&
          !filterButton.contains(event.target)
        ) {
          filterPanel.classList.add("hidden");
          const icon = filterButton.querySelector("i");
          icon.classList.remove("fa-times");
          icon.classList.add("fa-filter");
        }
      });
    }
  }
});

// 處理詳情頁面
if (window.location.pathname.includes("discount-detail.html")) {
  const urlParams = new URLSearchParams(window.location.search);
  const discountId = urlParams.get("id");

  if (discountId) {
    discountsRef
      .child(discountId)
      .once("value")
      .then((snapshot) => {
        const discount = snapshot.val();
        if (discount) {
          document.querySelector(".detail-title").textContent = discount.title;
          document.querySelector(".detail-description").textContent =
            discount.description;
          document.querySelector(".discount-tag").textContent = discount.tag;
          document.querySelector(".discount-date").textContent = discount.date;

          const locationInfo = document.querySelector(
            ".info-item:nth-child(1) span"
          );
          const categoryInfo = document.querySelector(
            ".info-item:nth-child(2) span"
          );

          if (locationInfo) locationInfo.textContent = discount.location;
          if (categoryInfo) categoryInfo.textContent = discount.category;
        }
      });
  }
}
