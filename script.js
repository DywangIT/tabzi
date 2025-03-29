function Tabzi(selector, options = {}) {
    this.opt = Object.assign(
        {
            remember: false,
            onChange: null,
            activeClassName: "tabzi--active"
        },
        options
    );
    // Get components
    this._tabBar = document.querySelector(selector);
    if (!this._tabBar) {
        console.error(`Tabzi: No container found for selector '${selector}'`);
        return;
    }
    this._origionalHTML = this._tabBar.innerHTML;

    this._tabs = Array.from(this._tabBar.querySelectorAll("li a"));
    if (!this._tabs) {
        console.error("Tabzi: No tabs found inside the container");
        return;
    }
    this._panels = this._getPenels();
    if (this._panels.length !== this._tabs.length) return;
    // Param key
    this._paramKey = selector.replace(/[^a-zA-Z0-9]/g, "");
    // Active tab in history
    const params = new URLSearchParams(location.search);
    const selectedTab = params.get(this._paramKey);
    const defaltTab =
        (this.opt.remember &&
            selectedTab &&
            this._tabs.find(
                (tab) =>
                    tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "") ===
                    selectedTab
            )) ||
        this._tabs[0];
    this._activateTab(defaltTab, false, false);
    this.currentTab = defaltTab;
    // Add event
    this._tabs.forEach((tab) => {
        tab.onclick = (event) => {
            event.preventDefault();

            if (this.currentTab !== tab) {
                this.currentTab = tab;
                this._activateTab(tab);
            }
        };
    });
}
// Get panels
Tabzi.prototype._getPenels = function () {
    return this._tabs
        .map((tab) => {
            const panel = document.querySelector(tab.getAttribute("href"));
            if (!panel) {
                console.error(
                    `Tabzi: No panel found for selector '${tab.getAttribute(
                        "href"
                    )}'`
                );
            }
            return panel;
        })
        .filter(Boolean);
};
// Activate Tab
Tabzi.prototype._activateTab = function (
    tab,
    triggerOnChange = true,
    updateURL = this.opt.remember
) {
    if (updateURL) {
        const params = new URLSearchParams(location.search);
        const paramKey = tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "");
        params.set(this._paramKey, paramKey);
        history.replaceState(null, null, `?${params}`);
    }

    this._tabs.forEach((tab) =>
        tab.closest("li").classList.remove(this.opt.activeClassName)
    );
    tab.closest("li").classList.add(this.opt.activeClassName);
    this._panels.forEach((panel) => (panel.hidden = true));
    const activePanel = document.querySelector(tab.getAttribute("href"));
    activePanel.hidden = false;

    if (typeof this.opt.onChange === "function" && triggerOnChange) {
        this.opt.onChange({
            tab,
            panel: activePanel
        });
    }
};
// Clean up to optimize
Tabzi.prototype.destroy = function () {
    this._tabBar.innerHTML = this._origionalHTML;
    this._panels.forEach((panel) => (panel.hidden = false));
    this._tabBar = null;
    this._tabs = null;
    this._panels = null;
};
