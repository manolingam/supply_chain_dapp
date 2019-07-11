App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",
    itemState : {
        0:'Harvested',
        1:'Processed',
        2:'Packed',
        3:'For Sale',
        4:'Sold',
        5:'Shipped',
        6:'Received',
        7:'Purchased'
    },

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        // App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        // App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        // console.log(
        //     // App.sku,
        //     App.upc,
        //     // App.ownerID, 
        //     App.originFarmerID, 
        //     App.originFarmName, 
        //     App.originFarmInformation, 
        //     App.originFarmLatitude, 
        //     App.originFarmLongitude, 
        //     App.productNotes, 
        //     App.productPrice, 
        //     App.distributorID, 
        //     App.retailerID, 
        //     App.consumerID
        // );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];
            $("#current-address").text(App.metamaskAccountID)
        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain='../../build/contracts/SupplyChain.json';
        
        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            // console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            App.fetchEvents();

            App.contracts.SupplyChain.deployed().then((instance) => {
                return instance.sku()
            }).then((res) => {
                $('#current-sku').text(res - 1)
            })

        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        // console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            }
    },

    harvestItem: function(event) {
        event.preventDefault();

        App.readForm()
        App.upc = $("#upc-farmer").val();

        if(App.upc != '') {

            App.contracts.SupplyChain.deployed().then(function(instance) {
                return instance.harvestItem(
                    App.upc, 
                    App.metamaskAccountID, 
                    App.originFarmName, 
                    App.originFarmInformation, 
                    App.originFarmLatitude, 
                    App.originFarmLongitude, 
                    App.productNotes
                );
            }).then(function(result) {
                $("#ftc-item").text(result);
                console.log('harvestItem',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            alert("Enter UPC ID!")
        }
    },

    processItem: function (event) {
        event.preventDefault();
        
        App.upc = $("#upc-farmer").val();

        if(App.upc != ''){
            App.contracts.SupplyChain.deployed().then(function(instance) {
                return instance.processItem(App.upc, {from: App.metamaskAccountID});
            }).then(function(result) {
                $("#ftc-item").text(result);
                console.log('processItem',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            alert('Enter UPC ID!')
        }
    },
    
    packItem: function (event) {
        event.preventDefault();

        App.upc = $("#upc-farmer").val();

        if(App.upc != '') {
            App.contracts.SupplyChain.deployed().then(function(instance) {
                return instance.packItem(App.upc, {from: App.metamaskAccountID});
            }).then(function(result) {
                $("#ftc-item").text(result);
                console.log('packItem',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            alert("Enter UPC ID!")
        }
    },

    sellItem: function (event) {
        event.preventDefault();

        App.productPrice = $("#productPrice").val();
        App.upc = $("#upc-farmer").val();

        if(App.upc != '') {
            App.contracts.SupplyChain.deployed().then(function(instance) {
                // const productPrice = web3.toWei(1, "ether");
                return instance.sellItem(App.upc, App.productPrice, {from: App.metamaskAccountID});
            }).then(function(result) {
                $("#ftc-item").text(result);
                console.log('sellItem',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            alert("Enter UPC ID!")
        }
    },

    buyItem: function (event) {
        event.preventDefault();

        App.upc = $("#upc-distributor").val();
        App.fetchItemBufferTwo();

        if(App.upc != ''){
            App.contracts.SupplyChain.deployed().then(function(instance) {
                const walletValue = web3.toWei(App.productPrice, "ether");
                console.log('Wallet Value', walletValue)
                return instance.buyItem(App.upc, {from: App.metamaskAccountID, value: walletValue});
            }).then(function(result) {
                $("#ftc-item").text(result);
                console.log('buyItem',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            alert('Enter UPC ID!')
        }
    },

    shipItem: function (event) {
        event.preventDefault();
        
        App.upc = $("#upc-distributor").val();

        if(App.upc != '') {
            App.contracts.SupplyChain.deployed().then(function(instance) {
                return instance.shipItem(App.upc, {from: App.metamaskAccountID});
            }).then(function(result) {
                $("#ftc-item").text(result);
                console.log('shipItem',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            alert('Enter UPC ID!')
        }
    },

    receiveItem: function (event) {
        event.preventDefault();
        
        App.upc = $("#upc-retailer").val();

        if(App.upc != '') {
            App.contracts.SupplyChain.deployed().then(function(instance) {
                return instance.receiveItem(App.upc, {from: App.metamaskAccountID});
            }).then(function(result) {
                $("#ftc-item").text(result);
                console.log('receiveItem',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            alert('Enter UPC ID!')
        }
    },

    purchaseItem: function (event) {
        event.preventDefault();
    
        App.upc = $("#upc-consumer").val();

        if(App.upc != '') {
            App.contracts.SupplyChain.deployed().then(function(instance) {
                return instance.purchaseItem(App.upc, {from: App.metamaskAccountID});
            }).then(function(result) {
                $("#ftc-item").text(result);
                console.log('purchaseItem',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            alert("Enter UPC ID!")
        }
    },

    fetchItemBufferOne: function () {
    
        App.upc = $('#upc').val();
        
        if(App.upc != '') {
            App.contracts.SupplyChain.deployed().then(function(instance) {
                return instance.fetchItemBufferOne(App.upc);
              }).then(function(result) {
                  $("#sku-value").text(result[0]);
                  $("#owner-id-value").text(result[2]);
                  $("#farmer-id-value").text(result[3]);
                  $("#farm-name-value").text(result[4]);
                  $("#farm-info-value").text(result[5]);
                  $("#farm-lat-value").text(result[6]);
                  $("#farm-long-value").text(result[7]);
                console.log('fetchItemBufferOne', result);
              }).catch(function(err) {
                console.log(err.message);
              });
        } else {
            alert("Enter UPC ID!")
        }        
    },

    fetchItemBufferTwo: function () {
        
        App.upc = $('#upc').val();

        if(App.upc != '') {
            App.contracts.SupplyChain.deployed().then(function(instance) {
                return instance.fetchItemBufferTwo.call(App.upc);
              }).then(function(result) {
                var itemCurrentState = App.itemState[result[5]] 
                App.productPrice = result[4]
                $("#upc-value").text(result[1]);
                $("#product-id-value").text(result[2]);
                $("#product-note-value").text(result[3]);
                $("#product-price-value").text(result[4] + " ETH");
                $("#item-state-value").text(itemCurrentState);
                $("#distributor-id-value").text(result[6]);
                $("#retailer-id-value").text(result[7]);
                $("#consumer-id-value").text(result[8]);
                console.log('fetchItemBufferTwo', result);
              }).catch(function(err) {
                console.log(err.message);
              });
        } else {
            alert("Enter UPC ID!")
        }
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });
        
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
