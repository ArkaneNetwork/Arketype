(function() {
    'use strict';

    $(function() {
        $(app).on('authenticated', function() {
            if (!app.page.initialised) {
                app.page.addConnectEvents('.get-wallets', getWallets);
                initGetWalletEvent();
                initManageWalletsEvent();
                initLinkWalletsEvent();
                initClaimWalletsEvent();
            }
        });
    });

    function getWallets(el) {
        var secretType = el.dataset.chain.toUpperCase();
        getWalletsBySecretType(secretType).then(function() {
            el.dataset.success = 'true';
        });
    }

    function getWalletsBySecretType(secretType) {
        return window.venlyConnect.api.getWallets({secretType: secretType})
                     .then(function(wallets) {
                         app.log(wallets, 'Wallets ' + secretType);
                         wallets = wallets.filter((wallet) => wallet.walletType !== 'APPLICATION');
                         app.page.updateWallets(wallets, secretType);
                     });
    }

    function initGetWalletEvent() {
        document.querySelectorAll('.get-wallets').forEach(function(el) {
            el.addEventListener('click', function() {
                getWallets(el);
            });
        });
    }

    function initManageWalletsEvent() {
        document.querySelectorAll('.manage-wallets').forEach(function(el) {
            el.addEventListener('click', function() {
                var chain = this.dataset.chain;
                if (app.getWindowMode() === 'POPUP') {
                    window.venlyConnect.flows.manageWallets(chain).then((result) => {
                        app.log(result, 'manage-wallets finished');
                        getWalletsBySecretType(this.dataset.chain.toUpperCase());
                    }).catch((result) => {
                        app.error(result, 'manage-wallets');
                    });
                } else {
                    window.venlyConnect.flows.manageWallets(chain, {redirectUri: app.redirectUri, correlationID: `${Date.now()}`});
                }
            });
        });
    }

    function initLinkWalletsEvent() {
        document.getElementById('link-wallets').addEventListener('click', function() {
            if (app.getWindowMode() === 'POPUP') {
                window.venlyConnect.flows.linkWallets().then((result) => {
                    app.log(result, 'link-wallets finished');
                    var chain = document.querySelector('#nav-tabContent > .active').dataset.chain;
                    getWalletsBySecretType(chain.toUpperCase());
                }).catch((result) => {
                    app.error(result, 'link-wallets');
                });
            } else {
                window.venlyConnect.flows.linkWallets({redirectUri: app.redirectUri});
            }
        });
    }

    function initClaimWalletsEvent() {
        document.getElementById('claim-wallets').addEventListener('click', function () {
            if (app.getWindowMode() === 'POPUP') {
                window.venlyConnect.flows.claimWallets().then((result) => {
                    app.log(result, 'claim-wallets finished');
                    var chain = document.querySelector('#nav-tabContent > .active').dataset.chain;
                    getWalletsBySecretType(chain.toUpperCase());
                }).catch((result) => {
                    app.error(result, 'claim-wallets');
                });
            } else {
                window.venlyConnect.flows.claimWallets({redirectUri: app.redirectUri});
            }
        });
    }
})();
