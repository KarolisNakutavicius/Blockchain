App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

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

    document.querySelector('form').addEventListener('submit', (e) => {
      const data = Object.fromEntries(new FormData(e.target).entries());
      console.log(data)
    });
  },

  getAvailableHouses: function() {
    // var adoptionInstance;

    // App.contracts.Adoption.deployed().then(function(instance) {
    //   adoptionInstance = instance;
    
    //   return adoptionInstance.getAdopters.call();
    // }).then(function(adopters) {
    //   for (i = 0; i < adopters.length; i++) {
    //     if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
    //       $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
    //     }
    //   }
    // }).catch(function(err) {
    //   console.log(err.message);
    // });

  },

  handleAdd: function (event) {
    event.preventDefault();
    var address = $('#propertyAddress').val();
    var price = $('#rentPrice').val();

    var RentContract;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.RentContract.deployed().then(function (instance) {

        RentContract = instance;
        // Execute adopt as a transaction by sending account
        return RentContract.AddHouse(address, price, { from: account });
      // }).then(function (result) {
      //   return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
