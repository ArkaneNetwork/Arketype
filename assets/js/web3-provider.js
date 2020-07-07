(function () {
    'use strict';

    app.initApp = function () {
        app.page = app.page || {};
        $('.auth-loginlink').on('click', function (event) {
            let idpHint = $(this).data('idp-hint');
            let options = {
                clientId: 'Arketype',
                network: {
                    name: $('#settings-rpc-name').val() || "Kovan",
                    nodeUrl: $('#settings-rpc-endpoint').val() || 'https://kovan.arkane.network'
                },
                environment: app.env,
            };
            if (idpHint) {
                options.authenticationOptions = {idpHint: idpHint}
            }
            console.log('initializing arkane web3 provider with', options);
            Arkane.createArkaneProviderEngine(options)
                .then(function (provider) {
                    window.web3 = new Web3(provider);
                    handleAuthenticated();
                })
                .catch((reason) => {
                    if (reason) {
                        switch (reason) {
                            case 'not-authenticated':
                                console.log('User is not authenticated (closed window?)', reason);
                                break;
                            case 'no-wallet-linked':
                                console.log('No wallet was linked to this application', reason);
                                break;
                            default:
                                console.log('Something went wrong while creating the Arkane provider', reason);
                        }
                    } else {
                        console.log('Something went wrong while creating the Arkane provider');
                    }
                });
        });

        $(app).on('authenticated', function () {
            window.web3.eth.getAccounts(function (err, wallets) {
                app.log(wallets, 'Wallets');
                updateWallets(wallets);
            });

            if (!app.page.initialised) {
                initLogout();
                initWalletControls();
                initNetworkControls();
                initRequestTransactionForm();
                app.page.initialised = true;
            }
        });
    };

    function handleAuthenticated() {
        document.body.classList.remove('not-logged-in');
        document.body.classList.add('logged-in');
        $(app).trigger('authenticated');
    }

    function getWallets(el) {
        window.web3.eth.getAccounts(function (err, wallets) {
            app.log(wallets, 'Wallets');
            updateWallets(wallets);
        });
    }

    function initLogout() {
        $('#auth-logout').click(() => {
            window.Arkane.arkaneConnect().logout()
                .then(() => {
                    document.body.classList.remove('logged-in');
                    document.body.classList.add('not-logged-in');
                    app.clearLog();
                    clearWallets();
                });
        });
    }

    function initWalletControls() {
        initLinkWallets();
        initManageWallets();
        initRefreshWallets();
    }

    function initNetworkControls() {
        if (Arkane.arkaneSubProvider.network) {
            $('#network-mgmt-rpc-name').val(Arkane.arkaneSubProvider.network.name);
            $('#network-mgmt-endpoint').val(Arkane.arkaneSubProvider.network.nodeUrl);
        }
    }

    function initLinkWallets() {
        $('#link-wallets').click(() => {
            window.Arkane.arkaneConnect()
                .linkWallets()
                .then(function () {
                    getWallets();
                });
        });
    }

    function initManageWallets() {
        $('#manage-wallets').click(() => {
            window.Arkane.arkaneConnect()
                .manageWallets('ETHEREUM')
                .then(function () {
                    getWallets();
                });
        });
    }

    function initRefreshWallets() {
        $('#refresh-wallets').click(() => {
            getWallets();
        });
    }


    function initRequestTransactionForm() {
        var signForm = document.querySelector('#sign-form');
        if (signForm) {
            signForm.addEventListener('submit', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var rawTransaction = {
                    from: $('select[name="from"]', signForm).val(),
                    to: $('input[name="to"]', signForm).val(),
                    value: $('input[name="value"]', signForm).val(),
                    gas: $('input[name="gas"]', signForm).val() || undefined,
                    gasPrice: $('input[name="gas-price"]', signForm).val() || undefined,
                    nonce: $('input[name="nonce"]', signForm).val() || undefined,
                    data: $('textarea[name="data"]', signForm).val() || undefined,
                };

                window.web3.eth.signTransaction(rawTransaction, (err, result) => {
                    if (err) {
                        app.error("error: " + err.message ? err.message : JSON.stringify(err));
                    } else {
                        app.log(result);
                    }
                });
            });
        }

        var executeForm = document.querySelector('#execute-form');
        if (executeForm) {
            executeForm.addEventListener('submit', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var rawTransaction = {
                    from: $('select[name="from"]', executeForm).val(),
                    to: $('input[name="to"]', executeForm).val(),
                    value: $('input[name="value"]', executeForm).val(),
                    gas: $('input[name="gas"]', executeForm).val() || undefined,
                    gasPrice: $('input[name="gas-price"]', executeForm).val() || undefined,
                    nonce: $('input[name="nonce"]', executeForm).val() || undefined,
                    data: $('textarea[name="data"]', executeForm).val() || undefined,
                };

                window.web3.eth.sendTransaction(rawTransaction, function (err, result) {
                    if (err) {
                        app.error("error: " + err.message ? err.message : JSON.stringify(err));
                    } else {
                        app.log(JSON.stringify(result));
                    }
                });
            });
        }
    }

    function updateWallets(wallets) {
        const walletsSelect = $('select[name="from"]');
        walletsSelect && walletsSelect.empty();
        if (wallets) {
            wallets.forEach(wallet => walletsSelect.append($(
                '<option>',
                {value: wallet, text: wallet, 'data-address': wallet}
            )));
        }
    }

    function clearWallets() {
        const walletsSelect = $('select[name="from"]');
        walletsSelect && walletsSelect.empty();
    }
})();
