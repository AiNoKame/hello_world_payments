'use strict';

/**
 * @ngdoc function
 * @name helloWorldPaymentsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the helloWorldPaymentsApp
 */
angular.module('helloWorldPaymentsApp')
  .controller('MainCtrl', ['$scope', '$http', '$q', 'localStorageService', 'RippleRest', 
    function ($scope, $http, $q, localStorageService, RippleRest) {
    var hostname = 'http://localhost',
        port = '5990',
        socketAddress = hostname + ':' + port,
        baseUrl;
    
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

    // ng-show conditional
    $scope.started = false;

    // ng-switch state
    $scope.moneyTransferFlowState = 'preparing'

    $scope.startErrorMessage = '';
    $scope.preparePaymentErrorMessage = '';
    $scope.sendPaymentErrorMessage = '';
    $scope.sendPaymentSuccessMessage = '';
    $scope.validatePaymentErrorMessage = '';
    $scope.validatePaymentSuccessMessage = '';

    $scope.balances = [];
    $scope.transactions = [];

    // required for payment submission POST
    var uuid, path, sendData;
    $scope.payment = {
      amount: '',
      currency: '',
      destination_account: '',
      rippleSecret: ''
    };
    $scope.paths = [];

    // will not start unless account has balances and transactions
    $scope.start = function() {
      baseUrl = socketAddress + '/v1/accounts/' + $scope.rippleAddress;

      $http.get(baseUrl + '/balances')
        .then(function(response) {
          if (!response.data.success) {
            return $q.reject(response);
          } else {
            $scope.balances = response.data.balances;
            
            return $http.get(baseUrl + '/payments');
          }
        })
        .then(function(response) {
          if (!response.data.success) {
            return $q.reject(response);
          } else {
            $scope.started = true;
            $scope.startErrorMessage = '';
            $scope.transactions = response.data.payments;
          }
        })
        .catch(function(error) {
          $scope.startErrorMessage = error.data.message || error;
          $scope.rippleAddress = '';
        });
    };

    // start over payment process
    $scope.cancel = function() {
      $scope.startErrorMessage = '';
      $scope.preparePaymentErrorMessage = '';
      $scope.sendPaymentErrorMessage = '';
      $scope.sendPaymentSuccessMessage = '';
      $scope.validatePaymentErrorMessage = '';
      $scope.validatePaymentSuccessMessage = '';
      $scope.moneyTransferFlowState = 'preparing';
    };

    // set up payment process and find valid payment paths
    $scope.preparePayment = function() {
      var pathUrl = baseUrl + '/payments/paths/' + $scope.payment.destination_account + 
                    '/' + $scope.payment.amount + '+' + $scope.payment.currency;
      var currency = $scope.payment.currency.toUpperCase();

      // add issuer if currency is not XRP
      if (currency !== 'XRP') {
        pathUrl += '+' + issuer[currency];
      }
      
      // prepare payment and find viable paths
      $http.get(pathUrl)
        .then(function(response) {
          if (!response.data.success) {
            return $q.reject(response)
          } else {
            $scope.preparePaymentErrorMessage = '';
            $scope.paths = response.data.payments;
            $scope.moneyTransferFlowState = 'pathChoosing';
          }
        })
        .catch(function(error) {
          $scope.preparePaymentErrorMessage = error.data.message || error;
        });
    };

    $scope.choosePath = function(index) {
      var currency;

      path = $scope.paths[index];
      currency = path.source_amount.currency.toUpperCase();

      // add issuer if currency is not XRP
      if (currency !== 'XRP') {
        path.source_amount.issuer = issuer[currency];
      }

      $scope.moneyTransferFlowState = 'sending';
    };

    $scope.sendPayment = function() {
      var uuidUrl = socketAddress + '/uuid';
      var sendUrl = socketAddress + '/payments';

      // generate UUID for transaction ID, unique for every transaction
      $http.get(uuidUrl)
        .then(function(response) {
          if (!response.data.success) {
            return $q.reject(response);
          } else {
            uuid = response.data.uuid;

            sendData = {
              client_resource_id: uuid,
              secret: $scope.payment.rippleSecret,
              payment: path
            };
            
            // send payment
            return $http.post(sendUrl, sendData);
          }
        })
        .then(function(response) {
          if (!response.data.success) {
            return $q.reject(response);
          } else {
            var message = [$scope.payment.amount, $scope.payment.currency, 'successfully sent!'];
            
            $scope.sendPaymentErrorMessage = '';
            $scope.sendPaymentSuccessMessage = message.join(' ');
            $scope.moneyTransferFlowState = 'confirming';

            // TODO - Update balances and transactions tables after sending confirmation
          }
        })
        .catch(function(error) {
          $scope.sendPaymentErrorMessage = error.data.message || error;
        });
    };

    $scope.confirmPayment = function() {
      var confirmUrl = baseUrl + '/payments/' + uuid;

      $http.get(confirmUrl)
        .then(function(response) {
          if (!response.data.success) {
            return $q.reject(response);
          } else {
            $scope.validatePaymentSuccessMessage = 'Successfully validated';

            setTimeout(function() {
              $scope.$apply(function() {
                $scope.validatePaymentSuccessMessage = '';
                $scope.moneyTransferFlowState = 'preparing';
              });
            }.bind(this), 3000);
          }
        })
        .catch(function(error) {
          $scope.validatePaymentErrorMessage = error.data.message || error.data;
        });
    };
  }])
  .factory('RippleRest', function RippleRest($http, $q) {
    var rippleRest = {};

    rippleRest._get = function(baseUrl, paths) {
      return $http.get(baseUrl + paths.join(''))
        .then(function(response) {
          if (response.data.success) {
            return response.data;
          } else {
            return $q.reject(response.data);
          }
        })
        .catch(function(error) {
          return $q.reject(error.data);
        });
    };

    rippleRest.getBalances = function(baseUrl) {
      return this._get(baseUrl, ['/balances']);
    };

    rippleRest.getTransactions = function(baseUrl) {
      return this._get(baseUrl, ['/payments']);
    };

    rippleRest.preparePayment = function(baseUrl, destinationAccount, destinationAmount) {
      return this._get(baseUrl, ['/payments/paths/', destinationAccount, '/', destinationAmount]);
    };

    rippleRest.confirmPayment = function(baseUrl, hash) {
      return this._get(baseUrl, ['/payments/', hash]);
    };

    rippleRest.submitPayment = function(server, paymentObj, secret, hash) {
      return $http.post(server + '/v1/payments', {paymentObj: payment, secret: secret, hash: hash})
        .then(function(response) {
          if (response.data.success) {
            return response.data;
          } else {
            return $q.reject(response.data);
          }
        })
        .catch(function(error) {
          return $q.reject(error.data);
        });
    };

    return rippleRest;
  });
