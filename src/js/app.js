App = {
  web3Provider: null,
  contracts: {},
  currentAccount: null,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
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
    web3 = new Web3(App.web3Provider);

    currentAccount = web3.currentProvider.selectedAddress

    return App.initContract();
  },

  initContract: function() {

    $.getJSON('RentContract.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var RentArtifact = data;
      App.contracts.RentContract = TruffleContract(RentArtifact);

      // Set the provider for our contract
      App.contracts.RentContract.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.getAvailableHouses();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.add-property', App.handleAdd);
  },

  getAvailableHouses: function () {

    var rentContract;

    App.contracts.RentContract.deployed().then(function (instance) {

      rentContract = instance;

      return rentContract.AvailableHouses();           

    }).then(async function (availableHousesIds) {

      var ids = availableHousesIds;
      var houseRow = $('#housesRow');
      var houseTemplate = $('#housesTemplate');

        for (var i = 0; i < ids.length; i++) {

          var id = ids[i].c[0] // ??? i hate javascript        

          await rentContract.GetHouseAddress(id).then(function (result) {     
            houseTemplate.find('.house-location').text(result);
            return rentContract.GetRentCost(id);            
          }).then(function (result) {
            houseTemplate.find('.rent-cost').text(result);
            }).then(function (){
              houseTemplate.find('.btn-rent').attr('data-id', id);
              houseRow.append(houseTemplate.html());       
            })}
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  handleAdd: function (event) {

    event.preventDefault();

    var address = $('#propertyAddress').val();
    var price = $('#rentPrice').val();

    App.contracts.RentContract.deployed().then(function (instance) {

      var rentContract = instance;
      // Execute adopt as a transaction by sending account
      return rentContract.AddHouse(address, price, { from: currentAccount });
      }).then(function (result) {
        return App.getAvailableHouses();
    }).catch(function (err) {
      console.log(err.message);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
