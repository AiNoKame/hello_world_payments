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
        socketAddress = hostname + ':' + port + '/v1', // ripple-rest server
        baseUrl; // set after user inputs ripple address

    // user does not have to enter their ripple address again on initial page after refresh (unless there's an error)
    var rippleAddressInStore = localStorageService.get('rippleAddress');
    $scope.rippleAddress = rippleAddressInStore || '';

    // save any changes to $rippleAddress in local storage
    $scope.$watch('rippleAddress', function(newAddress) {
      localStorageService.set('rippleAddress', newAddress);
    });

    // ng-show conditional
    $scope.started = false;

    // walet information tables
    $scope.balances = [];
    $scope.transactions = [];

    // required for payment submission
    var uuid, paymentOption;
    $scope.paymentOptions = [];
    $scope.payment = {
      amount: '',
      currency: '',
      destination_account: '',
      rippleSecret: ''
    };

    // start over payment process
    $scope.cancel = function() {
      // reset messages
      $scope.startErrorMessage = '';
      $scope.preparePaymentErrorMessage = '';
      $scope.sendPaymentErrorMessage = '';
      $scope.sendPaymentSuccessMessage = '';
      $scope.validatePaymentErrorMessage = '';
      $scope.validatePaymentSuccessMessage = '';

      // ng-switch state
      $scope.moneyTransferFlowState = 'preparing';
    };

    $scope.cancel();

    // will not start unless given account can poll balances and transactions
    $scope.start = function() {
      baseUrl = socketAddress + '/accounts/' + $scope.rippleAddress;

      RippleRest.getBalances(baseUrl)
        .then(function(response) {
          $scope.balances = response.balances;

          return RippleRest.getTransactions(baseUrl);
        })
        .then(function(response) {
          var payments = response.payments;

          $scope.started = true;
          $scope.startErrorMessage = '';
          $scope.transactions = payments; // NO, do this after getPreviousNotifications

          return RippleRest.getPreviousNotifications(baseUrl, payments[payments.length - 1].payment.hash);
        })
        .catch(function(error) {
          $scope.startErrorMessage = error.message || error;
          $scope.rippleAddress = '';
        });
    };

    // set up payment process and find valid payment paymentOptions for available usable currencies
    $scope.preparePayment = function() {
      RippleRest.preparePayment(baseUrl,
                                $scope.payment.destination_account,
                                $scope.payment.amount,
                                $scope.payment.currency)
        .then(function(response) {
          $scope.preparePaymentErrorMessage = '';
          $scope.paymentOptions = response.payments;
          $scope.moneyTransferFlowState = 'paymentOptionChoosing';
        })
        .catch(function(error) {
          $scope.preparePaymentErrorMessage = error.message || error;
        });
    };

    // choose to fund payment with specified currency
    $scope.choosepaymentOption = function(index) {
      paymentOption = $scope.paymentOptions[index];

      // add issuer if currency is not XRP
      paymentOption.source_amount.issuer = RippleRest.issuerAddress[paymentOption.source_amount.currency.toUpperCase()];

      $scope.moneyTransferFlowState = 'sending';
    };

    // actually submits payment to ledger
    $scope.sendPayment = function() {
      // generate UUID for transaction ID, unique for every transaction
      RippleRest.getUUID(socketAddress)
        .then(function(response) {
          return RippleRest.submitPayment(socketAddress, paymentOption, $scope.payment.rippleSecret, response.uuid);
        })
        .then(function() {
          var message = [$scope.payment.amount, $scope.payment.currency, 'successfully sent!'];

          $scope.sendPaymentErrorMessage = '';
          $scope.sendPaymentSuccessMessage = message.join(' ');
          $scope.moneyTransferFlowState = 'confirming';
        })
        .catch(function(error) {
          $scope.sendPaymentErrorMessage = error.message || error;
        });
    };

    $scope.confirmPayment = function() {
      RippleRest.confirmPayment(baseUrl, uuid)
        .then(function(){
          $scope.validatePaymentSuccessMessage = 'Successfully validated';

          setTimeout(function() {
            $scope.$apply(function() {
              $scope.validatePaymentSuccessMessage = '';
              $scope.moneyTransferFlowState = 'preparing'; // reset payment flow

              // Update balances and transactions tables
              $scope.start();
            });
          }.bind(this), 10000);

        })
        .catch(function(error) {
          $scope.validatePaymentErrorMessage = error.message || error;
        });
    };
  }])

  .factory('Notification', function Notification() {
    function Notification(data) {
      this.data = data;
    }

    Notification.prototype.getNextUrl = function() {
      return this.data.next_notification_url;
    };

    Notification.prototype.getPrevUrl = function() {
      return this.data.previous_notification_url;
    };

    Notification.prototype.isFirst = function() {
      return this.data.next_notification_url === '';
    };

    Notification.prototype.isLast = function() {
      return this.data.previous_notification_url === '';
    };

    Notification.prototype.isOutgoing = function() {
      return this.data.direction === 'outgoing';
    };

    Notification.prototype.isIncoming = function() {
      return this.data.direction === 'incoming';
    };

    Notification.prototype.isValidated = function() {
      return this.data.state === 'validated';
    };

    Notification.prototype.isSuccess = function() {
      return this.data.result === 'tesSUCCESS';
    };

    return Notification;
  })

  .factory('RippleRest', function RippleRest($http, $q, Notification) {
    var rippleRest = {};

    rippleRest.issuerAddress = {
      'XRP': '',
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

    // to handle error catching in response when success is false and make cleaner looking GET calls for various endpoints
    rippleRest._get = function(baseUrl, paymentOptions) {
      return $http.get(baseUrl + paymentOptions.join(''))
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

    rippleRest.getNewNotificaionts = function(baseUrl, hash) {
      return this._get(baseUrl, ['/notifications/', hash]);
    };

    rippleRest.getPreviousNotifications = function(baseUrl, hash) {
      return this._get(baseUrl, ['/notifications/', hash])
        .then(function(response) {
          var notifications = [];
          var notification = new Notification(response.notification);

          console.log('getPreviousNotifications response', response);
          console.log(notification);

          while(false) {
          }
        });
    };

    rippleRest.getUUID = function(serverUrl) {
      return this._get(serverUrl, ['/uuid']);
    };

    rippleRest.getBalances = function(baseUrl) {
      return this._get(baseUrl, ['/balances']);
    };

    rippleRest.getTransactions = function(baseUrl) {
      return this._get(baseUrl, ['/payments']);
    };

    rippleRest.preparePayment = function(baseUrl, destinationAccount, amount, currency) {
      var issuer = this.issuerAddress[currency.toUpperCase()];

      if (issuer) issuer = '+' + issuer;

      return this._get(baseUrl, ['/payments/paymentOptions/', destinationAccount, '/', amount, '+', currency, issuer]);
    };

    rippleRest.submitPayment = function(serverUrl, paymentObj, secret, hash) {
      return $http.post(serverUrl + '/payments', {payment: paymentObj, secret: secret, client_resource_id: hash})
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

    rippleRest.confirmPayment = function(baseUrl, hash) {
      return this._get(baseUrl, ['/payments/', hash]);
    };

    return rippleRest;
  });
