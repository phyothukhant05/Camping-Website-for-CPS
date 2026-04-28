(function () {
  const page = document.querySelector("[data-news-page]");

  if (!page) {
    return;
  }

  const tabs = page.querySelectorAll("[data-news-tab]");
  const cards = page.querySelectorAll("[data-news-card]");
  const emptyState = page.querySelector("[data-news-empty]");
  const shareButton = page.querySelector("[data-news-share]");

  function applyFilter(filter) {
    let visible = 0;

    cards.forEach((card) => {
      const category = card.getAttribute("data-news-category") || "";
      const show = filter === "all" || category === filter;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.getAttribute("data-news-tab") || "all";

      tabs.forEach((item) => {
        item.setAttribute("aria-selected", item === tab ? "true" : "false");
      });

      applyFilter(filter);
    });
  });

  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const url = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            text: "CPS news and promotions",
            url
          });
        } catch (error) {
          if (error && error.name !== "AbortError") {
            await copyNewsLink(url);
          }
        }
      } else {
        await copyNewsLink(url);
      }
    });
  }

  async function copyNewsLink(url) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
      return;
    }
  }
})();
