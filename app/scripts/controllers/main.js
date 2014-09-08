'use strict';

/**
 * @ngdoc function
 * @name helloWorldPaymentsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helloWorldPaymentsApp
 */
angular.module('helloWorldPaymentsApp')
  .controller('MainCtrl', ['$scope', '$http', 'localStorageService', 
    function ($scope, $http, localStorageService) {
    var hostname = 'http://localhost',
        port = '5990',
        socketAddress = hostname + ':' + port + '/v1',
        baseURL;
    
    var issuer = {
      'AUD': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // BitStamp
      'BTC': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // BitStamp
      'CAD': 'rBcYpuDT1aXNo4jnqczWJTytKGdBGufsre', // WeExchange
      'CHF': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // BitStamp
      'CNY': 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK', // rippleCN
      'EUR': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // BitStamp
      'GBP': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // BitStamp
      'JPY': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // BitStamp
      'LTC': 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK', // rippleCN
      'TRC': 'rfYv1TXnwgDDK4WQNbFALykYuEBnrR4pDX', // DividendRippler
      'USD': 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // BitStamp
    };

    // user does not have to enter their ripple address more than once on initial page
    var rippleAddressInStore = localStorageService.get('rippleAddress');
    $scope.rippleAddress = rippleAddressInStore || '';

    // save any changes to $rippleAddress in local storage
    $scope.$watch('rippleAddress', function(newAddress) {
      localStorageService.set('rippleAddress', newAddress);
    });

    // ng-show conditional to split start prompt and wallet info
    $scope.started = false;

    $scope.startErrorMessage = '';
    $scope.paymentErrorMessage = '';
    $scope.paymentSuccessMessage = '';

    $scope.balances = [];
    $scope.transactions = [];

    // required for payment submission POST
    $scope.rippleSecret = '';
    $scope.payment = {
      amount: '',
      currency: '',
      destination_account: ''
    };

    // will not start unless account has balances and transactions
    $scope.start = function() {
      baseURL = socketAddress + '/accounts/' + $scope.rippleAddress;

      $http.get(baseURL + '/balances')
        .then(function(response) {

          $scope.balances = response.data.balances;
          
          return $http.get(baseURL + '/payments');
        })
        .then(function(response) {
          $scope.started = true;
          $scope.startErrorMessage = '';
          $scope.transactions = response.data.payments;
        })
        .catch(function(error) {
          $scope.startErrorMessage = error.data.message;
          $scope.rippleAddress = '';
        });
    };

    // one shot volley to prepare, send, and confirm payment
    $scope.sendPayment = function() {
      var uuid, message, path, sendData;
      var pathURL = baseURL + '/payments/paths/' + $scope.payment.destination_account + 
                    '/' + $scope.payment.amount + '+' + $scope.payment.currency;
      var uuidURL = socketAddress + '/uuid';
      var sendURL = socketAddress + '/payments';
      var confirmURL = baseURL + '/payments/'; // append hash or uuid/client_resource_id

      $scope.paymentSuccessMessage = '';
      $scope.paymentErrorMessage = '';

      // add issuer if currency is not XRP
      if ($scope.payment.currency.toUpperCase() !== 'XRP') {
        pathURL += '+' + issuer[$scope.payment.currency];
      }
      
      // prepare payment and find viable paths
      $http.get(pathURL)
        .then(function(response) {
          console.log('response?', response);
          path = response.data.payments[0];

          // generate UUID for transaction ID, unique for every transaction
          return $http.get(uuidURL);
        })
        .then(function(response) {
          uuid = response.data.uuid;
          sendData = {
            client_resource_id: uuid,
            secret: $scope.rippleSecret,
            payment: path
          };
          
          // send payment
          return $http.post(sendURL, sendData);
        })
        .then(function(response) {
          message = [$scope.payment.amount, $scope.payment.currency, 'successfully sent!'];

          $scope.paymentSuccessMessage = message.join(' ');
        //   //confirm payment
        //   return $http.get(confirmURL + uuid);
        })
        // .then(function(response) {
        //   console.log('SUCCESS!', response.data);
        // })
        .catch(function(error) {
          $scope.paymentErrorMessage = error.data.message;
        })
        .finally(function() {
          $scope.rippleSecret = '';
          $scope.payment.amount = '';
          $scope.payment.currency = '';
          $scope.payment.destination_account = '';
        });
    };
  }]);
