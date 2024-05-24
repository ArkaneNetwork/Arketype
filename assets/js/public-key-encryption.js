(function() {
        'use strict';

        $(function() {
            $(app).on('authenticated', function() {
                getSigningMethodPublicKeys()
                    .then(function(pKeys) {
                        app.page.signingMethodPublicKeys = pKeys;
                        populateSelect(pKeys);
                        bindButtons();
                        if (!app.page.initialised) {
                            app.page.initialised = true;
                        }
                    });
            });
        });

        function getSigningMethodPublicKeys() {
            const url = `${app.environment.api}/security`;
            return fetch(url, {
                method: 'GET'
            }).then(r => {
                return r.json();
            })
              .then(r => {
                  return r['result']['signingMethod']['publicKeys']
              })
        }


        function populateSelect(pKeys) {
            const select = $('#signing-methods-pk');
            for (let i = 0; i < pKeys.length; i++) {
                // Create an option element
                const option = document.createElement("option");
                const publicKey = pKeys[i];

                // Set the text of the option
                option.text = `${publicKey.keyspec} - ${publicKey.id}`;

                // Set the value of the option (optional)
                option.value = publicKey.key;

                // Append the option to the select element
                select.append(option);
            }
        }

        function createSignature(log) {
            const requestBody = $('#encryption-request-body').val();
            const signature = btoa(String.fromCharCode(...sha256.digest(requestBody)));

            if (log) {
                app.log(signature, 'sha56 signature');
            }
            return signature;
        }

        function createSigningMethod(log) {
            const id = $('#signing-methods-id').val();
            const value = $('#signing-methods-value').val();
            const idempotencyKey = $('#signing-methods-id-key').val();
            const signingMethod = {
                id,
                value,
                idempotencyKey,
                signature: {
                    type: 'sha256',
                    value: createSignature(false)
                }
            };

            if (log) {
                app.log(signingMethod, 'raw signing-method');
            }
            return signingMethod;
        }

        function generateRandomAesKey() {
            return window.crypto.subtle.generateKey({
                                                        name: "AES-GCM",
                                                        length: 256,
                                                    },
                                                    true,
                                                    ["encrypt", "decrypt"]);
        }

        function encryptKeyWithRsa(key) {
            return window.crypto.subtle.exportKey('raw', key)
                         .then(exportedKey => {
                             function str2ab(str) {
                                 const buffer = new Uint8Array(str.length);
                                 for (let i = 0; i < str.length; i++) {
                                     buffer[i] = str.charCodeAt(i);
                                 }
                                 return buffer;
                             }

                             const pkeybuffer = str2ab(atob($('#signing-methods-pk').find(":selected").val()));
                             window.crypto.subtle.importKey('spki', pkeybuffer, {
                                                                name: "RSA-OAEP", // The algorithm the imported key will be used with
                                                                hash: "SHA-256",  // The hash function to be used with the algorithm
                                                            },
                                                            true,
                                                            ['encrypt'])
                                   .then(publicKey => {
                                       return window.crypto.subtle.encrypt(
                                           {
                                               name: "RSA-OAEP",
                                           },
                                           publicKey,
                                           exportedKey
                                       );
                                   })
                         });

        }


        function encryptSigningMethodWithAes(key,
                                             iv) {
            const encoder = new TextEncoder();
            return window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM", // CTR and CBC modes are also available.
                    iv // The initialization vector.
                },
                key, // The CryptoKey. You can get one with window.crypto.subtle.importKey().
                encoder.encode(JSON.stringify(createSigningMethod(false))));
        }

        function arrayBufferToBase64(buffer) {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }

        function encryptUsingSelectedPkey() {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            generateRandomAesKey()
                .then(key => {
                    encryptSigningMethodWithAes(key, iv)
                        .then(encrypted => {
                            encryptKeyWithRsa(key)
                                .then(encryptedKey => {
                                    const encryptedHeader = {
                                        encryption: {
                                            type: 'AES/GCM/NoPadding',
                                            iv: arrayBufferToBase64(iv),
                                            key: arrayBufferToBase64(encryptedKey)
                                        },
                                        data: arrayBufferToBase64(encrypted)
                                    }
                                    app.log(btoa(JSON.stringify(encryptedHeader)), 'encryptedSigningMethod');
                                })
                        })
                });

        }

        function bindButtons() {
            $('#encryption-request-btn').click(encryptUsingSelectedPkey);
            $('#build-signature-btn').click(() => createSignature(true));
            $('#build-request-btn').click(() => createSigningMethod(true))
        }

    }

)
();
