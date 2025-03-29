// 等待 DOM 完全加載
document.addEventListener("DOMContentLoaded", function () {
  // 獲取篩選按鈕和篩選面板元素
  const filterButton = document.getElementById("filterButton");
  const filterPanel = document.getElementById("filterPanel");

  // 為篩選按鈕添加點擊事件
  filterButton.addEventListener("click", function () {
    // 切換篩選面板的顯示/隱藏
    filterPanel.classList.toggle("hidden");

    // 更新按鈕圖標
    const icon = this.querySelector("i");
    if (filterPanel.classList.contains("hidden")) {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-filter");
    } else {
      icon.classList.remove("fa-filter");
      icon.classList.add("fa-times");
    }
  });

  // 點擊篩選面板外部時關閉面板
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

  // 關鍵字管理
  const keywordInput = document.getElementById("keywordInput");
  const keywordList = document.getElementById("keywordList");
  const keywords = new Set(); // 使用 Set 來存儲唯一的關鍵字

  // 地區關鍵字管理
  const areaInput = document.getElementById("areaInput");
  const areaList = document.getElementById("areaList");
  const areas = new Set(); // 使用 Set 來存儲唯一的地區

  // 添加關鍵字
  keywordInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const keyword = this.value.trim();

      if (keyword && !keywords.has(keyword)) {
        keywords.add(keyword);
        addKeywordTag(keyword, keywordList, keywords);
        this.value = ""; // 清空輸入框
      }
    }
  });

  // 添加地區
  areaInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const area = this.value.trim();

      if (area && !areas.has(area)) {
        areas.add(area);
        addKeywordTag(area, areaList, areas);
        this.value = ""; // 清空輸入框
      }
    }
  });

  // 創建關鍵字標籤
  function addKeywordTag(text, container, set) {
    const tag = document.createElement("div");
    tag.className = "keyword-tag";
    tag.innerHTML = `
      ${text}
      <span class="remove-keyword" title="移除關鍵字">
        <i class="fas fa-times"></i>
      </span>
    `;

    // 添加移除事件
    tag.querySelector(".remove-keyword").addEventListener("click", function () {
      set.delete(text);
      tag.remove();
    });

    container.appendChild(tag);
  }
});
