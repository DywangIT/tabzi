function Tabzi(selector, options = {}) {
    this.opt = Object.assign(
        {
            remember: false,
            onChange: null,
            activeClassName: "tabzi--active"
        },
        options
    );
    this._tabBar = document.querySelector(selector);
    if (!this._tabBar) {
        console.error(`Tabzi: No container found for seclector '${selector}'`);
        return;
    }
    this._origionalHTML = this._tabBar.innerHTML;

    this._tabList = Array.from(this._tabBar.querySelectorAll("li a"));
    if (!this._tabList) {
        console.error(`Tabzi: No tabList found inside the tabBar`);
        return;
    }

    this._panels = this._getPenels();
    if (this._panels.length != this._tabList.length) return;
    // Activate tab in history
    const params = new URLSearchParams(location.search);
    this._paramKey = selector.replace(/[^a-zA-Z0-9]/g, "");
    const paramValue = params.get(this._paramKey);
    const defaltTab =
        (this.opt.remember &&
            paramValue &&
            this._tabList.find(
                (tab) =>
                    tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "") ===
                    paramValue
            )) ||
        this._tabList[0];

    this._activateTab(defaltTab, false, false);

    this.currentTab = defaltTab;

    this._tabList.forEach((tab) => {
        tab.onclick = (event) => {
            event.preventDefault();
            if (this.currentTab !== tab) {
                this.currentTab = tab;
                this._activateTab(tab);
            }
        };
    });
}

Tabzi.prototype._activateTab = function (
    selectedTab,
    triggerOnChange = true,
    updateURL = this.opt.remember
) {
    this._tabList.forEach((tab) =>
        tab.closest("li").classList.remove(this.opt.activeClassName)
    );
    selectedTab.closest("li").classList.add(this.opt.activeClassName);
    this._panels.forEach((panel) => (panel.hidden = true));
    const activePanel = document.querySelector(
        selectedTab.getAttribute("href")
    );
    activePanel.hidden = false;

    if (updateURL) {
        const params = new URLSearchParams(location.search);
        const paramValue = selectedTab
            .getAttribute("href")
            .replace(/[^a-zA-Z0-9]/g, "");
        params.set(this._paramKey, paramValue);
        history.replaceState(null, null, `?${params}`);
    }

    if ((typeof this.opt.onChange === "function") & triggerOnChange) {
        this.opt.onChange({
            selectedTab,
            panel: activePanel
        });
    }
};

Tabzi.prototype._getPenels = function () {
    return this._tabList
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

Tabzi.prototype.destroy = function () {
    this._tabBar.innerHTML = this._origionalHTML;
    this._panels.forEach((panel) => (panel.hidden = false));
    this._tabBar = null;
    this._tabList = null;
    this._panels = null;
};
