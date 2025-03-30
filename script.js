// Firebase 數據庫引用
const database = firebase.database();
const discountsRef = database.ref("discounts");

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

  card.innerHTML = `
    <div class="discount-header">
      <span class="discount-tag">${discount.tag}</span>
      <span class="discount-date">${discount.date}</span>
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

  try {
    // 保存到 Firebase
    await discountsRef.child(newDiscount.id).set(newDiscount);

    // 顯示成功消息
    alert("優惠新增成功！");

    // 重定向到首頁
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error adding discount:", error);
    alert("新增優惠失敗，請稍後再試。");
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
document.addEventListener("DOMContentLoaded", () => {
  // 監聽數據變化
  discountsRef.on("value", (snapshot) => {
    const discounts = snapshot.val() || {};
    displayDiscounts(discounts);
  });

  // 綁定表單提交事件
  const addForm = document.getElementById("addDiscountForm");
  if (addForm) {
    addForm.addEventListener("submit", addDiscount);
  }

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
