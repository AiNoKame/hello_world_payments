'use strict';

/**
 * @ngdoc function
 * @name helloWorldPaymentsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the helloWorldPaymentsApp
 */
angular.module('helloWorldPaymentsApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
