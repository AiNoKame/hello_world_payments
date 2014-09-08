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

    // for invalid wallet login
    $scope.startErrorMessage = '';
    $scope.paymentErrorMessage = '';

    // required for payment submission POST
    $scope.rippleSecret = '';
    $scope.balances = [];
    $scope.transactions = [];
    $scope.payment = {
      amount: '',
      currency: '',
      destination_account: ''
    };

    var _handleStartError = function(message) {
      $scope.startErrorMessage = message;
      $scope.rippleAddress = '';
    }

    // will not start unless account has balances and transactions
    $scope.start = function() {
      baseURL = socketAddress + '/accounts/' + $scope.rippleAddress;

      $http.get(baseURL + '/balances').
        success(function(data, status, headers, config) {
          $scope.balances = data.balances;
          
          $http.get(baseURL + '/payments').
            success(function(data, status, headers, config) {
              $scope.started = true;
              $scope.startErrorMessage = '';
              $scope.transactions = data.payments;
            }).
            error(function(data) {
              _handleStartError(data.message);
            });
        }).
        error(function(data) {
          _handleStartError(data.message);
        });

    };

    // one shot volley to prepare, send, and confirm payment
    $scope.sendPayment = function() {
      var uuid, path, sendData;
      var pathURL = baseURL + '/payments/paths/' + $scope.payment.destination_account + 
                    '/' + $scope.payment.amount + '+' + $scope.payment.currency;
      var uuidURL = socketAddress + '/uuid';
      var sendURL = socketAddress + '/payments';
      var confirmURL = baseURL + '/payments/'; // incomplete - requires hash or uuid/client_resource_id

      // add issuer if currency is not XRP
      if ($scope.payment.currency.toUpperCase() !== 'XRP') {
        pathURL += '+' + issuer[$scope.payment.currency];
      }
      
      // prepare payment and find viable paths
      $http.get(pathURL).
        success(function(data) {
          path = data.payments[0];

          // generate UUID for transaction ID, unique for every transaction
          $http.get(uuidURL).
            success(function(data) {
              uuid = data.uuid;
              sendData = {
                client_resource_id: uuid,
                secret: $scope.rippleSecret,
                payment: path
              };
              
              // send payment
              $http.post(sendURL, sendData).
                success(function() {

                  // confirm payment
                  // $http.get(confirmURL + uuid).
                  //   success(function(data, status, headers, config) {
                  //     console.log('SUCCESS!', data);
                  //   }).
                  //   error(function(data) {
                  //     $scope.paymentErrorMessage = data.message;
                  // });
                }).
                error(function(data) {
                  $scope.paymentErrorMessage = data.message;
                });
            }).
            error(function(data) {
              $scope.paymentErrorMessage = data.message;
            });
      }).
      error(function(data) {
        $scope.paymentErrorMessage = data.message;
      });
    };
  }]);
