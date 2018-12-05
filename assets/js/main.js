var app = app || {};
app.auth = {};

app.initApp = function() {
    window.arkaneConnect = new ArkaneConnect('Arketype', {chains: ['Ethereum'], environment: 'staging'});
    window.arkaneConnect
          .checkAuthenticated()
          .then((result) => {
                  $('input[name=redirect]').val(window.location.href);
                  return result.authenticated(app.handleAuthenticated)
                               .notAuthenticated((auth) => {
                                   document.body.classList.add('not-logged-in');
                               });
              }
          )
          .catch(reason => app.log(reason));
    app.attachLinkEvents();
};

app.attachLinkEvents = function() {
    document.getElementById('auth-loginlink').addEventListener('click', function(e) {
        e.preventDefault();
        window.arkaneConnect.authenticate();
    });

    document.getElementById('auth-logout').addEventListener('click', function(e) {
        e.preventDefault();
        window.arkaneConnect.logout();
    });
};

app.handleAuthenticated = (auth) => {
    app.auth = auth;
    document.body.classList.add('logged-in');
    $('#auth-username').text(app.auth.subject);
    app.updateToken(app.auth.token);
    window.arkaneConnect.addOnTokenRefreshCallback(app.updateToken);
    app.addConnectEvents();
    app.getWallets();
};

app.updateToken = (token) => {
    $('input[name="bearer"]').val(app.auth.token);
    $('#auth-token').val(token);
};

app.addConnectEvents = function() {
    document.getElementById('get-wallets').addEventListener('click', function() {
        window.arkaneConnect.getWallets().then(function(e) {
            app.log(e);
            var secretTypes = ['ETHEREUM', 'VECHAIN'];
            for (s of secretTypes) {

            }
            $("#sign-ETHEREUM-form select[name='walletId']").find('option').remove();
            $("#sign-VECHAIN-form select[name='walletId']").find('option').remove();
            $("#execute-ETHEREUM-form select[name='walletId']").find('option').remove();
            $("#execute-VECHAIN-form select[name='walletId']").find('option').remove();
            for (w of e) {
                $(`#sign-${w.secretType}-form select[name='walletId']`).append($('<option>', {
                    value: w.id,
                    text: w.address
                }));
                $(`#execute-${w.secretType}-form select[name='walletId']`).append($('<option>', {
                    value: w.id,
                    text: w.address
                }));
            }
            $('#sign').show();
            $('#execute').show();
        });
    });

    document.getElementById('manage-wallets').addEventListener('click', function() {
        window.arkaneConnect.manageWallets();
    });

    document.getElementById('link-wallets').addEventListener('click', function() {
        window.arkaneConnect.linkWallets();
    });

    document.getElementById('get-profile').addEventListener('click', function() {
        window.arkaneConnect.getProfile().then(function(e) {
            app.log(e);
        });
    });

    document.getElementById('sign-ETHEREUM-form').addEventListener('submit', function(e) {
        e.preventDefault();
        window.arkaneConnect.signTransaction(
            {
                type: 'ETHEREUM_TRANSACTION',
                walletId: $("#sign-ETHEREUM-form select[name='walletId']").val(),
                submit: false,
                to: $("#sign-ETHEREUM-form input[name='to']").val(),
                value: $("#sign-ETHEREUM-form input[name='value']").val(),
            },
            'http://localhost:4000'
        );
    });

    document.getElementById('sign-VECHAIN-form').addEventListener('submit', function(e) {
        e.preventDefault();
        window.arkaneConnect.signTransaction(
            {
                type: 'VECHAIN_TRANSACTION',
                walletId: $("#sign-VECHAIN-form select[name='walletId']").val(),
                submit: false,
                clauses: [{
                    to: $("#sign-VECHAIN-form input[name='to']").val(),
                    amount: $("#sign-VECHAIN-form input[name='value']").val(),
                }]
            },
            'http://localhost:4000'
        );
    });

    document.getElementById('execute-ETHEREUM-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Generic ETH transaction
        // window.arkaneConnect.executeTransaction(
        //     {
        //         walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
        //         to: $("#execute-ETHEREUM-form input[name='to']").val(),
        //         value: ($("#execute-ETHEREUM-form input[name='value']").val() / Math.pow(10, 18)),
        //         secretType: 'ETHEREUM',
        //     },
        //     'http://localhost:4000'
        // );

        // Generic ERC20 transaction
        window.arkaneConnect.executeTransaction(
            {
                walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
                to: $("#execute-ETHEREUM-form input[name='to']").val(),
                value: ($("#execute-ETHEREUM-form input[name='value']").val() / Math.pow(10, 18)),
                secretType: 'ETHEREUM',
                tokenAddress: '0x02f96ef85cad6639500ca1cc8356f0b5ca5bf1d2',
            },
            'http://localhost:4000'
        );

        // Native ETH transaction
        // window.arkaneConnect.executeNativeTransaction(
        //     {
        //         type: 'ETH_TRANSACTION',
        //         walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
        //         to: $("#execute-ETHEREUM-form input[name='to']").val(),
        //         value: $("#execute-ETHEREUM-form input[name='value']").val(),
        //     },
        //     'http://localhost:4000'
        // );

        // Native ERC20 transaction
        // window.arkaneConnect.executeNativeTransaction(
        //     {
        //         type: 'ETHEREUM_ERC20_TRANSACTION',
        //         walletId: $("#execute-ETHEREUM-form select[name='walletId']").val(),
        //         to: $("#execute-ETHEREUM-form input[name='to']").val(),
        //         value: $("#execute-ETHEREUM-form input[name='value']").val(),
        //         tokenAddress: '0x02f96ef85cad6639500ca1cc8356f0b5ca5bf1d2',
        //     },
        //     'http://localhost:4000'
        // );
    });

    document.getElementById('execute-VECHAIN-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Generic VET transaction
        // window.arkaneConnect.executeTransaction(
        //     {
        //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
        //         to: $("#execute-VECHAIN-form input[name='to']").val(),
        //         value: ($("#execute-VECHAIN-form input[name='value']").val() / Math.pow(10, 18)),
        //         secretType: 'VECHAIN',
        //     },
        //     'http://localhost:4000'
        // );

        // Generic VIP180 transaction
        window.arkaneConnect.executeTransaction(
            {
                walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
                to: $("#execute-VECHAIN-form input[name='to']").val(),
                value: ($("#execute-VECHAIN-form input[name='value']").val() / Math.pow(10, 18)),
                secretType: 'VECHAIN',
                tokenAddress: '0x9c6e62b3334294d70c8e410941f52d482557955b',
            },
            'http://localhost:4000'
        );

        // Native VET transaction
        // window.arkaneConnect.executeNativeTransaction(
        //     {
        //         type: 'VET_TRANSACTION',
        //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
        //         clauses: [{
        //             to: $("#execute-VECHAIN-form input[name='to']").val(),
        //             amount: $("#execute-VECHAIN-form input[name='value']").val(),
        //         }]
        //     },
        //     'http://localhost:4000'
        // );

        // Native VIP180 transaction
        // window.arkaneConnect.executeNativeTransaction(
        //     {
        //         type: 'VECHAIN_VIP180_TRANSACTION',
        //         walletId: $("#execute-VECHAIN-form select[name='walletId']").val(),
        //         clauses: [{
        //             to: $("#execute-VECHAIN-form input[name='to']").val(),
        //             amount: $("#execute-VECHAIN-form input[name='value']").val(),
        //             tokenAddress: '0x9c6e62b3334294d70c8e410941f52d482557955b',
        //         }]
        //     },
        //     'http://localhost:4000'
        // );
    });

    document.getElementById('close-signer').addEventListener('click', function() {
        window.arkaneConnect.destroySigner();
    });
};

app.getWallets = function() {
    window.arkaneConnect.getWallets().then(function(result) {
        app.log(result);
    })
};

app.log = function(txt) {
    if (isObject(txt)) {
        txt = JSON.stringify(txt, null, 2);
    }
    var date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    txt = '---' + date + '---\n' + txt;
    $('#appLog').html(txt + '\n\n' + $('#appLog').html());
};

function isObject(obj) {
    return obj === Object(obj);
}

app.initApp();
