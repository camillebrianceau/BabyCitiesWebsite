window.addEventListener("load", function () {
  const mobileNav = document.querySelector("#mobileNav");
  const showMenuButton = document.querySelector("#showMenu");
  const hideMenuButton = document.querySelector("#hideMenu");

  if (showMenuButton && mobileNav) {
    showMenuButton.addEventListener("click", function () {
      mobileNav.classList.remove("hidden");
    });
  }

  if (hideMenuButton && mobileNav) {
    hideMenuButton.addEventListener("click", function () {
      mobileNav.classList.add("hidden");
    });
  }

  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        mobileNav.classList.add("hidden");
      });
    });
  }

  document.querySelectorAll("[toggleElement]").forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const answerElement = toggle.querySelector("[answer]");
      const caretElement = toggle.querySelector("img");

      if (answerElement.classList.contains("hidden")) {
        answerElement.classList.remove("hidden");
        caretElement.classList.add("rotate-90");
      } else {
        answerElement.classList.add("hidden");
        caretElement.classList.remove("rotate-90");
      }
    });
  });

  const statsSection = document.querySelector("[data-stats-section]");
  const storyFinder = document.querySelector("[data-story-finder]");
  const storyCount = document.querySelector("[data-story-count]");
  const storyTypePicker = document.querySelector("[data-story-type-picker]");
  const storyTypeMenu = document.querySelector("[data-story-type-menu]");
  const storyTypeLabel = document.querySelector("[data-story-type-label]");
  const storyTypeIcon = document.querySelector("[data-story-type-icon]");
  const storyFilterPicker = document.querySelector("[data-story-filter-picker]");
  const storyFilterMenu = document.querySelector("[data-story-filter-menu]");
  const storyFilterLabel = document.querySelector("[data-story-filter-label]");
  const storyFilterIcon = document.querySelector("[data-story-filter-icon]");

  const DEFAULT_TYPE_OPTION = {
    value: "",
    label: "restaurants",
    icon: "dist/assetsbis/images/map-markers/points-png/restaurant-icon.png",
    queryLabel: "restaurant",
  };

  const BABY_FILTER_OPTIONS = [
    {
      value: "highchair",
      label: "high chair",
      icon: "dist/assetsbis/images/babyfilters/highchair-red.png",
    },
    {
      value: "stroller",
      label: "stroller access",
      icon: "dist/assetsbis/images/babyfilters/buggy-red.png",
    },
    {
      value: "changing",
      label: "changing table",
      icon: "dist/assetsbis/images/babyfilters/changer-red.png",
    },
    {
      value: "nursing",
      label: "nursing area",
      icon: "dist/assetsbis/images/babyfilters/nursing-red.png",
    },
    {
      value: "microwave",
      label: "microwave",
      icon: "dist/assetsbis/images/babyfilters/microwave-red.png",
    },
    {
      value: "playground_in",
      label: "indoor play",
      icon: "dist/assetsbis/images/babyfilters/playground-red.png",
    },
    {
      value: "playground_out",
      label: "outdoor play",
      icon: "dist/assetsbis/images/babyfilters/swing-red.png",
    },
    {
      value: "",
      label: "any baby filter",
      icon: "dist/assetsbis/images/babyfilters/changer-red.png",
    },
  ];

  const FALLBACK_PLACE_TYPE_OPTIONS = [
    {
      value: "",
      label: "cafes",
      icon: "dist/assetsbis/images/map-markers/points-png/cafe-bars-icon.png",
      queryLabel: "cafe",
    },
    {
      value: "",
      label: "restaurants",
      icon: "dist/assetsbis/images/map-markers/points-png/restaurant-icon.png",
      queryLabel: "restaurant",
    },
    {
      value: "",
      label: "parks",
      icon: "dist/assetsbis/images/map-markers/points-png/park-icon.png",
      queryLabel: "park",
    },
    {
      value: "",
      label: "beaches",
      icon: "dist/assetsbis/images/map-markers/points-png/beach-icon.png",
      queryLabel: "beach",
    },
    {
      value: "",
      label: "shops",
      icon: "dist/assetsbis/images/map-markers/points-png/shop-icon.png",
      queryLabel: "shop",
    },
    {
      value: "",
      label: "museums",
      icon: "dist/assetsbis/images/map-markers/points-png/museum-icon.png",
      queryLabel: "museum",
    },
    {
      value: "",
      label: "stations",
      icon: "dist/assetsbis/images/map-markers/points-png/train-icon.png",
      queryLabel: "station",
    },
    {
      value: "",
      label: "airports",
      icon: "dist/assetsbis/images/map-markers/points-png/airport-icon.png",
      queryLabel: "airport",
    },
    {
      value: "",
      label: "services",
      icon: "dist/assetsbis/images/map-markers/points-png/services-icon.png",
      queryLabel: "service",
    },
    {
      value: "",
      label: "places",
      icon: "dist/assetsbis/images/map-markers/points-png/favorites-icon.png",
      queryLabel: "",
    },
  ];

  let storyTypeOptions = [DEFAULT_TYPE_OPTION];
  let selectedStoryType = DEFAULT_TYPE_OPTION;
  let selectedStoryFilter =
    BABY_FILTER_OPTIONS.find((option) => option.value === "stroller") ||
    BABY_FILTER_OPTIONS[0];
  let loadedPlaceTypeOptions = [];
  const animatedNumbers = new WeakMap();
  const pendingStats = new Map();
  let statsAnimationReady = false;

  function formatStat(value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "-";
    }

    return value.toLocaleString("en-US");
  }

  function parseStatValue(value) {
    if (value === null || value === undefined || value === "") {
      return NaN;
    }

    return Number(value);
  }

  function easeOutQuart(progress) {
    return 1 - Math.pow(1 - progress, 4);
  }

  function setAnimatedValue(element, value) {
    if (!element) return;
    element.textContent = formatStat(value);
    element.dataset.currentValue = String(value);
  }

  function animateNumber(element, nextValue, duration) {
    if (!element) return;

    if (typeof nextValue !== "number" || Number.isNaN(nextValue)) {
      const runningAnimation = animatedNumbers.get(element);
      if (runningAnimation) {
        cancelAnimationFrame(runningAnimation);
        animatedNumbers.delete(element);
      }
      element.textContent = "-";
      delete element.dataset.currentValue;
      return;
    }

    const targetValue = Math.max(0, Math.round(nextValue));
    const previousValue = Number(element.dataset.currentValue);
    const startValue = Number.isFinite(previousValue) ? previousValue : 0;

    const runningAnimation = animatedNumbers.get(element);
    if (runningAnimation) {
      cancelAnimationFrame(runningAnimation);
    }

    if (startValue === targetValue) {
      setAnimatedValue(element, targetValue);
      return;
    }

    const animationDuration = duration || 1100;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.round(
        startValue + (targetValue - startValue) * easedProgress
      );

      setAnimatedValue(element, currentValue);

      if (progress < 1) {
        const frameId = requestAnimationFrame(step);
        animatedNumbers.set(element, frameId);
      } else {
        setAnimatedValue(element, targetValue);
        animatedNumbers.delete(element);
      }
    }

    const frameId = requestAnimationFrame(step);
    animatedNumbers.set(element, frameId);
  }

  function updateStat(name, value) {
    const element = document.querySelector(`[data-stat-value="${name}"]`);
    if (!element) return;

    if (!statsAnimationReady) {
      pendingStats.set(name, value);
      return;
    }

    animateNumber(element, value, 1250);
  }

  function flushPendingStats() {
    if (statsAnimationReady) return;

    statsAnimationReady = true;
    pendingStats.forEach((value, name) => {
      const element = document.querySelector(`[data-stat-value="${name}"]`);
      if (!element) return;
      animateNumber(element, value, 1250);
    });
    pendingStats.clear();
  }

  function getSupabaseConfig() {
    return window.BABYCITIES_SUPABASE_CONFIG || {};
  }

  function getSupabaseBaseUrl(url) {
    return (url || "").replace(/\/+$/, "");
  }

  function getSupabaseHeaders(anonKey, extraHeaders) {
    return Object.assign(
      {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      extraHeaders || {}
    );
  }

  function normalizeLabel(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function dedupePlaceTypeOptions(options) {
    const deduped = new Map();

    options.forEach((option) => {
      const key = normalizeLabel(option.label);
      if (!key) {
        return;
      }
      const existing = deduped.get(key);
      if (!existing) {
        deduped.set(key, option);
        return;
      }

      if (!existing.value && option.value) {
        deduped.set(key, option);
      }
    });

    return Array.from(deduped.values());
  }

  function findMatchingOption(options, matchers, fallbackOption) {
    const normalizedMatchers = (matchers || []).map(normalizeLabel);

    const matchedOption = options.find((option) => {
      const optionLabel = normalizeLabel(option.label);
      return normalizedMatchers.some(
        (matcher) => optionLabel === matcher || optionLabel.includes(matcher)
      );
    });

    return matchedOption || fallbackOption || options[0];
  }

  function getMatchingPlaceTypeIds(option) {
    if (!option) return [];

    if (option.value) {
      return [option.value];
    }

    const queryLabel = normalizeLabel(option.queryLabel || option.label);
    if (!queryLabel) {
      return [];
    }

    return loadedPlaceTypeOptions
      .filter((placeTypeOption) => {
        const optionLabel = normalizeLabel(placeTypeOption.label);
        return (
          optionLabel === queryLabel ||
          optionLabel.includes(queryLabel) ||
          queryLabel.includes(optionLabel)
        );
      })
      .map((placeTypeOption) => placeTypeOption.value)
      .filter(Boolean);
  }

  async function fetchMatchingPlaceTypeIds(url, anonKey, option) {
    if (!option || !option.queryLabel || !url || !anonKey) {
      return [];
    }

    const queryLabel = normalizeLabel(option.queryLabel);
    if (!queryLabel) {
      return [];
    }

    const params = new URLSearchParams();
    params.set("select", "id,name");
    params.set("name", `ilike.*${queryLabel}*`);
    params.set("order", "name.asc");

    const endpoint = `${getSupabaseBaseUrl(url)}/rest/v1/place_types?${params.toString()}`;

    try {
      const response = await fetch(endpoint, {
        headers: getSupabaseHeaders(anonKey),
      });

      if (!response.ok) {
        throw new Error(`Place type match request failed with ${response.status}`);
      }

      const rows = await response.json();
      return rows.map((row) => String(row.id)).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function getPlaceTypeIconPath(name) {
    const normalized = normalizeLabel(name);

    if (
      normalized.includes("cafe") ||
      normalized.includes("coffee") ||
      normalized.includes("bar")
    ) {
      return "dist/assetsbis/images/map-markers/points-png/cafe-bars-icon.png";
    }

    if (
      normalized.includes("restaurant") ||
      normalized.includes("food") ||
      normalized.includes("eat")
    ) {
      return "dist/assetsbis/images/map-markers/points-png/restaurant-icon.png";
    }

    if (
      normalized.includes("park") ||
      normalized.includes("garden") ||
      normalized.includes("playground")
    ) {
      return "dist/assetsbis/images/map-markers/points-png/park-icon.png";
    }

    if (normalized.includes("beach")) {
      return "dist/assetsbis/images/map-markers/points-png/beach-icon.png";
    }

    if (
      normalized.includes("train") ||
      normalized.includes("station") ||
      normalized.includes("metro")
    ) {
      return "dist/assetsbis/images/map-markers/points-png/train-icon.png";
    }

    if (normalized.includes("airport")) {
      return "dist/assetsbis/images/map-markers/points-png/airport-icon.png";
    }

    if (normalized.includes("museum")) {
      return "dist/assetsbis/images/map-markers/points-png/museum-icon.png";
    }

    if (
      normalized.includes("shop") ||
      normalized.includes("store") ||
      normalized.includes("market")
    ) {
      return "dist/assetsbis/images/map-markers/points-png/shop-icon.png";
    }

    if (
      normalized.includes("service") ||
      normalized.includes("pharmacy") ||
      normalized.includes("toilet")
    ) {
      return "dist/assetsbis/images/map-markers/points-png/services-icon.png";
    }

    return DEFAULT_TYPE_OPTION.icon;
  }

  function updateStoryCount(value) {
    if (!storyCount) return;
    animateNumber(storyCount, value, 900);
  }

  function updatePickerDisplay(option, labelElement, iconElement) {
    if (!option) return;
    if (labelElement) labelElement.textContent = option.label;
    if (iconElement) iconElement.src = option.icon;
  }

  function closePicker(picker) {
    if (picker) {
      picker.removeAttribute("open");
    }
  }

  function buildPickerOptions(menu, options, onSelect) {
    if (!menu) return;

    menu.innerHTML = "";

    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "story-inline-picker-option font-montserrat";
      button.innerHTML = `<img src="${option.icon}" alt="" /><span>${option.label}</span>`;
      button.addEventListener("click", function () {
        onSelect(option);
      });
      menu.appendChild(button);
    });
  }

  function onStoryFilterSelect(option) {
    selectedStoryFilter = option;
    updatePickerDisplay(option, storyFilterLabel, storyFilterIcon);
    closePicker(storyFilterPicker);
    loadStoryCount();
  }

  function onStoryTypeSelect(option) {
    selectedStoryType = option;
    updatePickerDisplay(option, storyTypeLabel, storyTypeIcon);
    closePicker(storyTypePicker);
    loadStoryCount();
  }

  function renderStoryFilterOptions() {
    if (!storyFilterMenu) return;
    buildPickerOptions(storyFilterMenu, BABY_FILTER_OPTIONS, onStoryFilterSelect);
    updatePickerDisplay(selectedStoryFilter, storyFilterLabel, storyFilterIcon);
  }

  function renderStoryTypeOptions() {
    if (!storyTypeMenu) return;
    buildPickerOptions(storyTypeMenu, storyTypeOptions, onStoryTypeSelect);
    updatePickerDisplay(selectedStoryType, storyTypeLabel, storyTypeIcon);
  }

  async function loadSupabaseStats() {
    if (!statsSection) return;

    const config = getSupabaseConfig();
    const url = config.url || "";
    const anonKey = config.anonKey || "";
    const view = config.view || "public_stats";
    const placesField = config.placesField || "places_count";
    const countriesField = config.countriesField || "countries_count";
    const usersField = config.usersField || "users_count";

    if (!url || !anonKey) {
      return;
    }

    try {
      const endpoint = `${getSupabaseBaseUrl(url)}/rest/v1/${view}?select=*&limit=1`;
      const response = await fetch(endpoint, {
        headers: getSupabaseHeaders(anonKey),
      });

      if (!response.ok) {
        throw new Error(`Supabase stats request failed with ${response.status}`);
      }

      const rows = await response.json();
      const stats = Array.isArray(rows) ? rows[0] : null;

      if (!stats) {
        throw new Error("No stats row returned");
      }

      updateStat("places", parseStatValue(stats[placesField]));
      updateStat("countries", parseStatValue(stats[countriesField]));
      updateStat("users", parseStatValue(stats[usersField]));
    } catch (error) {
      updateStat("places", NaN);
      updateStat("countries", NaN);
      updateStat("users", NaN);
    }
  }

  async function loadPlaceTypes() {
    if (!storyFinder || !storyTypeMenu) return;

    const config = getSupabaseConfig();
    const url = config.url || "";
    const anonKey = config.anonKey || "";

    renderStoryFilterOptions();

    if (!url || !anonKey) {
      storyTypeOptions = dedupePlaceTypeOptions(FALLBACK_PLACE_TYPE_OPTIONS);
      selectedStoryType = findMatchingOption(
        storyTypeOptions,
        ["restaurant", "restaurants", "resto"],
        DEFAULT_TYPE_OPTION
      );
      renderStoryTypeOptions();
      return;
    }

    const endpoint = `${getSupabaseBaseUrl(
      url
    )}/rest/v1/place_types?select=id,name&order=name.asc`;

    try {
      const response = await fetch(endpoint, {
        headers: getSupabaseHeaders(anonKey),
      });

      if (!response.ok) {
        throw new Error(`Place types request failed with ${response.status}`);
      }

      const rows = await response.json();
      const apiOptions = rows.map((row) => ({
        value: String(row.id),
        label: row.name,
        icon: getPlaceTypeIconPath(row.name),
        queryLabel: normalizeLabel(row.name),
      }));

      loadedPlaceTypeOptions = apiOptions;

      storyTypeOptions =
        apiOptions.length > 0
          ? dedupePlaceTypeOptions(apiOptions)
          : dedupePlaceTypeOptions(FALLBACK_PLACE_TYPE_OPTIONS);
    } catch (error) {
      loadedPlaceTypeOptions = [];
      storyTypeOptions = dedupePlaceTypeOptions(FALLBACK_PLACE_TYPE_OPTIONS);
    }

    selectedStoryType = findMatchingOption(
      storyTypeOptions,
      ["restaurant", "restaurants", "resto"],
      DEFAULT_TYPE_OPTION
    );
    renderStoryTypeOptions();
  }

  async function loadStoryCount() {
    if (!storyFinder) return;

    const config = getSupabaseConfig();
    const url = config.url || "";
    const anonKey = config.anonKey || "";

    if (!url || !anonKey) {
      updateStoryCount(NaN);
      return;
    }

    const params = new URLSearchParams();
    params.set("select", "id");

    let matchingTypeIds = getMatchingPlaceTypeIds(selectedStoryType);

    if (
      matchingTypeIds.length === 0 &&
      selectedStoryType &&
      selectedStoryType.queryLabel
    ) {
      matchingTypeIds = await fetchMatchingPlaceTypeIds(
        url,
        anonKey,
        selectedStoryType
      );
    }

    if (matchingTypeIds.length === 1) {
      params.set("type", `eq.${matchingTypeIds[0]}`);
    } else if (matchingTypeIds.length > 1) {
      params.set("type", `in.(${matchingTypeIds.join(",")})`);
    }

    if (selectedStoryFilter && selectedStoryFilter.value) {
      params.set(selectedStoryFilter.value, "is.true");
    }

    const endpoint = `${getSupabaseBaseUrl(url)}/rest/v1/places?${params.toString()}`;

    updateStoryCount(NaN);

    try {
      let response = await fetch(endpoint, {
        method: "HEAD",
        headers: getSupabaseHeaders(anonKey, {
          Prefer: "count=exact",
        }),
      });

      if (!response.ok) {
        response = await fetch(endpoint, {
          headers: getSupabaseHeaders(anonKey, {
            Prefer: "count=exact",
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`Places count request failed with ${response.status}`);
      }

      const contentRange = response.headers.get("content-range") || "";
      const total = contentRange.split("/")[1];

      updateStoryCount(parseStatValue(total));
    } catch (error) {
      updateStoryCount(NaN);
    }
  }

  document.addEventListener("click", function (event) {
    if (storyTypePicker && !storyTypePicker.contains(event.target)) {
      closePicker(storyTypePicker);
    }

    if (storyFilterPicker && !storyFilterPicker.contains(event.target)) {
      closePicker(storyFilterPicker);
    }
  });

  if (statsSection) {
    if ("IntersectionObserver" in window) {
      const statsObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              flushPendingStats();
              statsObserver.disconnect();
            }
          });
        },
        {
          threshold: 0.35,
        }
      );

      statsObserver.observe(statsSection);
    } else {
      statsAnimationReady = true;
    }
  } else {
    statsAnimationReady = true;
  }

  loadSupabaseStats();
  loadPlaceTypes().then(loadStoryCount);
});
