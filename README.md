Walkthrough: A Sample Application With Ripple-Rest
==================================================

[Ripple-Rest] is Ripple's RESTful API that developers can use to interact with the Ripple Network. Let's build an AngularJS app that uses Ripple-Rest to create a simple Ripple wallet interface that:

  - displays all balances
  - displays the last 10 transactions
  - sends payments to other Ripple addresses

In the end, we'll have something that looks like this:

> Start Page

> ![Start Page](http://i.imgur.com/XLF15W7.png)

> Wallet Interface

> ![Wallet Interface](http://i.imgur.com/kWCO5aD.png)

The source code can be found at the [Hello World Payments GitHub repository].

### 1. Set Up Two Ripple Wallets

First, you need two Ripple wallets to test the app. If you already have two wallet addresses, feel free to skip to *part 2*. If you don't, head to https://www.rippletrade.com/#/register and create two wallets.

![RippleTrade.com Sign Up Page](http://i.imgur.com/DaRoLIm.png)

It's **very important** to take note of your Ripple secret (always starts with *s*). After verifying and logging in, click on your Ripple Name (~RippleName) to see your Ripple address (always starts with *r*).

Fund **one** of your wallets with the currency of your choice (so you can test the transfer feature), but testing with [XRP] (Ripples) will be simplest. You can go to https://www.bitstamp.net to transfer USD to your Ripple wallet, which has an XRP value on the Ripple Network. You can then transfer XRP using that USD, which opens up the world of currencies at your fingertips. Soon you'll be trading USD for JPY and gold at practically no cost.

### 2. Scaffold The App With Yeoman

![Yeoman](https://www.openshift.com/sites/default/files/images/yeoman-logo.png)

Yeoman is fantastic. It'll get our project wireframe constructed quickly, and it can generate all types of application stacks. If you have Yeoman installed, skip to *Install AngularJS generator*.

If you don't have Yeoman installed, let's go through steps 1 - 5 in [this guide to Scaffold a web app with Yeoman].

#### Install Yeoman Dependencies

In your terminal (Mac), shell (UNIX), or console (Windows), check if you have Node, a JavaScript platform for making web applications. It comes bundled with NPM, an extremely powerful module manager that will make getting all the tools you need, including Yeoman, simple.

```sh
$ node --version && npm --version
```

If you need to install Node, or it's outdated, download it from http://nodejs.org/download. Then check if you have Git, which will allow you to interact with GitHub repositories on the Command Line.

```sh
$ git --version
```

If you don't have Git installed, use NPM to install it. If you get permission errors, prefix the NPM command with sudo.

```sh
$ npm install -g git
```
or
```sh
$ sudo npm install -g git
```

#### Install Yeoman and Confirm Installation

```sh
$ npm install -g yo
$ yo --version && bower --version && grunt --version
```

#### Install AngularJS Generator

```sh
$ npm install -g generator-angular@0.9.2
```

#### Create Project

```sh
$ mkdir hello_world_payments && cd hello_world_payments
$ yo
```

![yo](http://i.imgur.com/lKg116X.png)

Press **enter** to run the Angular generator, and type **no** to using Sass and **yes** to using Twitter Bootstrap, both of which help with CSS styling. Include all the default modules (green means it's already included, so you don't have to press **space** to actually select it), and press **enter** to start the generator.

![modules](http://i.imgur.com/ZoG7x74.png)

#### Start Server

```sh
$ grunt serve
```

This will open the browser, and on any edits to the app source files, the page will live reload. All of our work will lie in the in the **hello_world_payments/app/** folder.

### 3. Set Up A Ripple-Rest Server

Now that we have Node and Git, you need to set up the Ripple-Rest server. These are the quick start instructions from the [Ripple-Rest GitHub repository]:

> In a terminal run:
>
> ```sh
> $ git clone https://github.com/ripple/ripple-rest.git
> ```
>
> ```sh
> $ cd ripple-rest
> ```
>
> Install dependencies needed:
> ```sh
> $ npm install
> ```
>
> Copy the config example to config.json:
> ```sh
> $ cp config-example.json config.json
> ```
>
> Start the server:
> ```sh
> $ node server.js
> ```
>
> Visit http://localhost:5990 to view available endpoints and to get started
>
> Note: Restarting the server will delete the SQLite3 database so this CANNOT BE USED IN PRODUCTION.

*npm install* with no parameters installs all the NPM modules listed in a **package.json** file in the same directory.

Now everything is set up, and we can start coding.

### 4. Create Start Page

The first function will "open" a wallet based on a given Ripple address, so let's make a form to input the address into. We'll use it to access a couple of Ripple-Rest endpoints that obtain the address' balances and transaction history.

Let's edit the bootstrapped app first. We don't need the *about* page, so open **index.html**. Comment out or delete the two lines that refer to *about*:

> near the top

```sh
<!-- <li><a ng-href="#/about">About</a></li> -->
```

> near the bottom

```sh
<!-- <script src="scripts/controllers/about.js"></script> -->
```

Open **main.html** in **app/views/** and delete everything. Replace it with a form asking for a Ripple address:

```sh
<div class="container">

  <!-- Ripple Address Input -->
  <div ng-show="!started">
    <form ng-submit="start()">
      <h2 class="text-primary">What is your ripple address?</h2>
      <div class="input-group">
        <input type="text" ng-model="rippleAddress"
          placeholder="Example: r123456789abcdefg" class="form-control" required>
        <span class="input-group-btn" required>
          <input type="submit" class="btn btn-primary" value="Start">
        </span>
      </div>
    </form>
  </div>
  <p ng-model=startErrorMessage class="text-danger">{{ startErrorMessage }}</p>
</div>
```

The classes give it Bootstrap styling to attach the form to the button as well as set the coloring.

ng-show and ng-submit are AngularJS directives that work with scope models in the view's controller. A scope model is the data associated with a view, and the controller implements the view's functional aspect.

* ng-show will show the HTML element when the expression evaluates to true; the corresponding scope model boolean, **started**, should be false to show this div (!false will evaluate to true)
* ng-submit will perform the function in the main view controller, **start()**, when the submit button element is clicked

To make the form work, you now have to implement the controller associated with **main.html**, which is **main.js** in **app/scripts/controllers/**.

Replace the contents of the controller function with:

```sh
var hostname = 'http://localhost',
  port = '5990',
  socketAddress = hostname + ':' + port + '/v1', // ripple-rest server
  baseUrl; // set after user inputs ripple address

  $scope.rippleAddress = '';

  // ng-show conditional
  $scope.started = false;
```

This sets up the address string we'll be using to access the Ripple-Rest endpoints. This assumes you used the default Ripple-Rest setup instructions, so if you have a custom hostname and port, use those instead.

Now let's give this form some functionality.

### 5. Create Wallet Interface, Part 1 ([Account Balances])

The view will soon be able to change in order to display the wallet information associated with the Ripple address you entered in the start view. Let's display all the balances the provided Ripple address has using Ripple-Rest's **/balances** endpoint.

First, append the following html after the input section (but still within the main div.container element):

```sh
<!-- Account Information Panel -->
<div ng-show="started">

  <!-- Wallet Address -->
  <h3 class="text-primary" ng-model="rippleAddress">
    Ripple Wallet Address <small>{{ rippleAddress }}</small>
  </h3>

  <!-- List of Balances -->
  <h3 class="text-primary">Balances</h3>
  <table class="table table-condensed">
    <thead>
      <tr>
        <th>Currency</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="balance in balances">
        <td>{{ balance.currency }}</td>
        <td>{{ balance.value }}</td>
      </tr>
    </tbody>
  </table>
</div>
```

This includes an ng-repeat directive to display elements of a scope model array, **balances**, as individual table rows. ng-model corresponds to the contents of a given scope model to be used within that HTML element and will be exposed within the {{ }}, which acts like a variable or template for displaying the scope model's value.

The controller code needs to inject the $http and $q dependencies (for HTTP requests and integrating Promises) as well as a soon-to-be-implemented AngularJS factory, Ripple-Rest, so add those to the dependency list in the arguments of the controller function alongside $scope:

```sh
angular.module('helloWorldPaymentsApp')
  .controller('MainCtrl', ['$scope', '$http', '$q', 'RippleRest',
    function ($scope, $http, $q, RippleRest) {
```

Let's implement a factory service to encapsulate the Ripple-Rest functionality and create functions using the Ripple-Rest endpoints. Create the factory outside of the controller and attached to the angular module, and let's make two functions inside of it:

```sh
angular.module('helloWorldPaymentsApp')
  .controller(...)
  .factory('RippleRest', function RippleRest($http, $q) {
    var rippleRest = {};

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

    rippleRest.getBalances = function(baseUrl) {
      return this._get(baseUrl, ['/balances']);
    };

    return rippleRest;
  )};
```

All of our GET functions will work in conjuction with **rippleRest._get()** to err requests that successfully make contact with the server (get a 200 response) but still have some error in the request body (which returns an object with a property of "success" equal to **false**). Sort of like guarding against false positive. It also formulates the url path to request the proper Ripple-Rest endpoint.

The **.then()** and **.catch()** follow the style of Promises (here is a [Promises Guide] for the uninitiated) which allow the chaining of asynchronous functions such that the results of the preceding function can feed into the the input of the proceeding function. It also catches any errors at any step and handles them in one spot.

* **.then()** executes once the prior function finishes
* **.catch()** handles the errors (manually thrown with **$q.reject()**)

The **/balances** endpoint returns an object with the currencies and amounts that the provided Ripple address account line has. Finally, let's actually query that info by invoking the **getBalances()** function in the controller:

```sh
// wallet information tables
$scope.balances = [];

$scope.start = function() {
  baseUrl = socketAddress + '/accounts/' + $scope.rippleAddress;

  RippleRest.getBalances(baseUrl)
    .then(function(response) {
      $scope.balances = response.balances;
      $scope.started = true;
      $scope.startErrorMessage = '';
    })
    .catch(function(error) {
      $scope.startErrorMessage = error.message || error;
      $scope.rippleAddress = '';
    });
};
```

Now when the Ripple address is submitted, ng-submit will invoke **$scope.start()** from the main controller which will invoke **getBalances()** from the RippleRest factory. Any error messages will be displayed in the app, and if the GET is successful:

* balance information, stored in an array, will be stored in the $scope.balances model and will consequently be displayed as rows in the table using ng-repeat
* error messages will clear
* the initial view with the Ripple address form will hide
* the Ripple wallet information view will appear

Try it out with your Ripple addresses!

The foundation of the application is mostly set up, so let's add more functionality.

### 6. Create Wallet Interface, Part 2 ([Account Transactions])

We've shown our balances, so now let's make another table with the 10 most recent transactions using Ripple-Rest's **/payments** endpoint.

In **main.html**, within the *Wallet Information Panel* and below the balances table, let's add the transactions table:

```sh
<!-- List of Transactions -->
<h3 class="text-primary">Transactions</h3>
<table class="table table-striped">
  <thead>
    <tr>
      <th>Date</th>
      <th>Source Address</th>
      <th>Direction</th>
      <th>Currency</th>
      <th>Amount</th>
      <th>Issuer</th>
      <th>State</th>
    </tr>
  </thead>
  <tbody>
    <tr ng-repeat="transaction in transactions">
      <td>{{ transaction.payment.timestamp }}</td>
      <td>{{ transaction.payment.source_account }}</td>
      <td>{{ transaction.payment.direction }}</td>
      <td>{{ transaction.payment.source_amount.currency }}</td>
      <td>{{ transaction.payment.source_amount.value }}</td>
      <td>{{ transaction.payment.source_amount.issuer }}</td>
      <td>{{ transaction.payment.state }}</td>
    </tr>
  </tbody>
</table>
```

Our factory should include a new function:

```sh
rippleRest.getTransactions = function(baseUrl) {
  return this._get(baseUrl, ['/payments']);
};
```

And our controller should change the **$scope.start()** function to chain **getBalances()** with **getTransactions()**, since we want to display both to ensure the "log in" executes properly (such that properly opening a wallet should access its balances and transactions):

```sh
// wallet information tables
$scope.balances = [];
$scope.transactions = [];

$scope.startErrorMessage = '';

// will not start unless given account can poll balances and transactions
$scope.start = function() {
  baseUrl = socketAddress + '/accounts/' + $scope.rippleAddress;

  RippleRest.getBalances(baseUrl)
    .then(function(response) {
      $scope.balances = response.balances;

      return RippleRest.getTransactions(baseUrl);
    })
    .then(function(response) {
      console.log(response);
      $scope.started = true;
      $scope.startErrorMessage = '';
      $scope.transactions = response.payments;
    })
    .catch(function(error) {
      $scope.startErrorMessage = error.message || error;
      $scope.rippleAddress = '';
    });
};
```

We're halfway there!

### 7. Create Payment Interface, Part 1 ([Preparing a Payment])

For the final piece of functionality, let's make a system for sending payments. There will be four parts to this:

* Preparing the payment object with the amount to send, the currency of the amount, and the destination Ripple address (this will be what the recipient receives)
* Choosing the payment option (this will be what the sender uses to pay the recipient)
* Submitting the payment (with the sender's payment option and Ripple secret to sign the transaction and make it valid)
* Confirming the payment and refreshing the balances and transactions tables

These steps will have a format of:

* what to add to **main.html**
* what to add to **main.js** in the controller
* what **main.js** in the factory

Just append the variables up at top and the functions/methods at the bottom.

Preparing a payment will use the **/payments/paymentOptions** Ripple-Rest endpoint to generate payment paths, offering to pay with different currencies from their balance to help the user figure out *how* to pay the recipient given the information of *what* they should receive.

> **main.html**

```sh
<!-- Money Transfer Panel -->
<div ng-switch="moneyTransferFlowState">

  <!-- Send Payment Flow, step 1/4, preparation (set amount, currency, destination ripple wallet address) -->
  <div ng-switch-when="preparing">
    <form class="form-inline" ng-submit="preparePayment()">
      <div class="form-group">
        <label>I want to send</label>
        <input type="text" ng-model="payment.amount" autofocus="true"
            placeholder="0.0001" class="form-control" required>
        <input type="text" ng-model="payment.currency"
            placeholder="XRP" class="form-control" required>
        <label>to</label>
        <input type="text" ng-model="payment.destination_account"
            placeholder="ripple address" class="form-control" required>
        <button type="submit" class="btn btn-primary">Choose Payment Option</button>
        <p ng-model=preparePaymentErrorMessage class="text-danger">
            {{ preparePaymentErrorMessage }}
        </p>
      </div>
    </form>
  </div>

</div>
```

The new piece of code here is ng-switch which is similar to ng-show in functionality. Each value of the ng-switch model corresponds to a view, so you could attach more than two views (compared to the boolean style of ng-show) to an ng-switch model. The four view states for **$scope.moneyTransferFlowState** will be:

* preparing
* paymentOptionChoosing
* sending
* confirming

When the functions for each state complete, the state will be changed, forming a payment process loop.


> **main.js** controller

```sh
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
  $scope.moneyTransferFlowState = 'preparing'
};

$scope.cancel();

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
```

The payment object corresponds to a Ripple-Rest Payment object, one of the [Ripple-Rest API Objects].

There is a **$scope.cancel()** function used in conjuction with a "Start Over" button used in later states that will clear the error/success messages and reset the payment flow to the *preparing* state. You can delete the previous **$scope.balances** declararation, because **$scope.cancel()** is immediately invoked at load to initialize it.

> **main.js** factory

```sh
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

rippleRest.preparePayment = function(baseUrl, destinationAccount, amount, currency) {
  var issuer = this.issuerAddress[currency.toUpperCase()];

  if (issuer) issuer = '+' + issuer;

  return this._get(baseUrl, ['/payments/paymentOptions/', destinationAccount, '/', amount, '+', currency, issuer]);
};
```

Issuers deal with converting XRP to other currencies and vice versa. They will be used if you want to send currencies other than XRP or your recipient wants a currency other than XRP.

The issuers' information here is obtained from the [Ripple wiki's list of gateways]. One trick to finding the ripple address of other issuers is going to the issuer's website and accessing *domainIndexPage/ripple.txt* to find a ripple.txt file that includes information about the gateway that the issuer uses to connect to the Ripple Network.

### 8. Create Payment Interface, Part 2 (Choosing a Payment Option)

Now that we have the payment options, let's allow the user to choose one.

> **main.html**

```sh
<!-- Send Payment Flow, step 2/4, choose payment payment option -->
<div ng-switch-when="paymentOptionChoosing">
    <label>I want to pay with</label>
    <div ng-repeat="paymentOption in paymentOptions" >
      <button type="button" class="btn btn-primary" ng-click="choosepaymentOption($index)">
        {{ paymentOption.source_amount.value }} {{ paymentOption.source_amount.currency }}
      </button>
    </div>
</div>
```

The $index argument passes in the index of the clicked ng-repeated button, associated with the singular *paymentOption* element within the **$scope.paymentOptions* array.

> **main.js** controller

```sh
// choose to fund payment with specified currency
$scope.choosepaymentOption = function(index) {
  paymentOption = $scope.paymentOptions[index];

  // add issuer if currency is not XRP
  paymentOption.source_amount.issuer = RippleRest.issuerAddress[paymentOption.source_amount.currency.toUpperCase()];

  $scope.moneyTransferFlowState = 'sending';
};
```

### 9. Create Payment Interface, Part 3 ([Submitting a Payment])

All the previous steps come to a head here, where we finally aggregate all the payment information and POST the payment to the Ripple-Rest **/payments** endpoint.

> **main.html**

```sh
<!-- Send Payment Flow, step 3/4, send payment (with secret) -->
<div ng-switch-when="sending">
<form class="form-inline" ng-submit="sendPayment()">
  <div class="form-group">
    <label>My secret is</label>
    <div class="input-group">
      <input type="text" ng-model="payment.rippleSecret"
        placeholder="?" class="form-control" required>
      <span class="input-group-btn" required>
        <button type="submit" class="btn btn-primary">Send</button>
      </span>
    </div>
    <p ng-model=sendPaymentErrorMessage class="text-danger">
        {{ sendPaymentErrorMessage }}
    </p>
  </div>
</form>
</div>
```

> **main.js** controller

```sh
// actually submits payment to ledger
$scope.sendPayment = function() {
  // generate UUID for transaction ID, unique for every transaction
  RippleRest.getUUID(socketAddress)
    .then(function(response) {
      return RippleRest.submitPayment(socketAddress, paymentOption, $scope.payment.rippleSecret, response.uuid);
    })
    .then(function(response) {
      var message = [$scope.payment.amount, $scope.payment.currency, 'successfully sent!'];

      $scope.sendPaymentErrorMessage = '';
      $scope.sendPaymentSuccessMessage = message.join(' ');
      $scope.moneyTransferFlowState = 'confirming';
    })
    .catch(function(error) {
      $scope.sendPaymentErrorMessage = error.message || error;
    });
};
```

A universally unique identifier (UUID) can be created to send along with the payment object, but any integer may be used.

> **main.js** factory

```sh
rippleRest.getUUID = function(serverUrl) {
  return this._get(serverUrl, ['/uuid']);
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
```

### 10. Create Payment Interface, Part 4 ([Confirming a Payment])

Lastly, let's use the Ripple-Rest **/payments/** endpoint and provide it a hash or UUID to check whether or not the payment succeeded.

> **main.html**

```sh
<!-- Send Payment Flow, step 4/4, payment validation -->
<div ng-switch-when="confirming">
<form class="form-inline" ng-submit="confirmPayment()">
  <div class="form-group">
    <p ng-model=preparePaymentSuccessMessage class="text-success">
      {{ sendPaymentSuccessMessage }}
    </p>
    <button type="submit" class="btn btn-info">
      Check Validation
    </button>
    <span class="text-success">
      {{ validatePaymentSuccessMessage }}
    </span>
    <span class="text-failure">
      {{ validatePaymentErrorMessage }}
    </span>
  </div>
</form>
</div>
<form ng-submit="cancel()">
<button type="submit" class="btn btn-danger">Start Over</button>
</form>
</div>
```

> **main.js** controller

```sh
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
      }, 10000);

    })
    .catch(function(error) {
      $scope.validatePaymentErrorMessage = error.message || error;
    });
};
```

**$scope.$apply** is necessary here to apply the proper $scope context. Each view state in an ng-switch has its own $scope context, so the **$apply()** allows the proper context to be bound inside the setTimeout when the timer starts.

> **main.js** factory

```sh
rippleRest.confirmPayment = function(baseUrl, hash) {
  return this._get(baseUrl, ['/payments/', hash]);
};
```

### Conclusion
And that's it. **Congratulations!** You can now cutomize the simple Ripple wallet to your liking. Here's a [Bootstrap Guide] to help with styling.

You could set up LocalStorage to locally store scope model information during testing (since AngularJS doesn't natively support environmental variables). This [LocalStorage Guide] will help you get started with that. Then just this code at the top the controller before the **$scope.start()** function:

```sh
// user does not have to enter their ripple address again on initial page after refresh
// unless there's an error
var rippleAddressInStore = localStorageService.get('rippleAddress');
$scope.rippleAddress = rippleAddressInStore || '';

// save any changes to $rippleAddress in local storage
$scope.$watch('rippleAddress', function(newAddress) {
  localStorageService.set('rippleAddress', newAddress);
});
```

And an **extremely helpful** feature is to use the **/notifications** endpoint to poll any new transactions on the account to constantly refresh the balances and transactions tables. [Notifications] will also yield more than just payment transactions, such as trust line requests and account configuration changes.

For more information on Ripple-Rest, check out the [Getting Started] guide and the [Ripple-Rest Github repository].

Links:

* [Ripple-Rest API] [Ripple-Rest]
* [Ripple-Rest GitHub repository]
* [Let's Scaffold a Web App With Yeoman] [this guide to scaffold a web app with Yeoman]
* [LocalStorage Guide]
* [Bootstrap Guide]
* [Getting Started with Ripple-Rest] [Getting Started]
* [Ripple-Rest API Objects]
* [Ripple Wiki's List of Gateways] [Ripple wiki's list of gateways]
* [Account Balances]
* [Account Transactions]
* [Preparing a Payment]
* [Submitting a Payment]
* [Confirming a Payment]
* [Notifications]
* [Promises Guide]
* [RippleTrade](https://www.rippletrade.com)
* [BitStamp](https://www.bitstamp.net)
* [XRP]

[Ripple-Rest]:http://dev.ripple.com/ripple-rest.html#ripple-rest-api
[Hello World Payments GitHub repository]:https://github.com/AiNoKame/hello_world_payments
[Ripple-Rest GitHub repository]:https://github.com/ripple/ripple-rest
[this guide to scaffold a web app with Yeoman]:http://yeoman.io/codelab.html
[LocalStorage Guide]:http://yeoman.io/codelab/local-storage.html
[Bootstrap Guide]:http://www.tutorialrepublic.com/twitter-bootstrap-tutorial
[Getting Started]:http://dev.ripple.com/ripple-rest.html#getting-started
[Ripple-Rest API Objects]:http://dev.ripple.com/ripple-rest.html#api-objects
[Ripple wiki's list of gateways]:https://ripple.com/wiki/index.php?title=Gateway_List&oldid=4623
[Account Balances]:http://dev.ripple.com/ripple-rest.html#account-balances
[Account Transactions]:http://dev.ripple.com/ripple-rest.html#payment-history
[Preparing a Payment]:http://dev.ripple.com/ripple-rest.html#preparing-a-payment
[Submitting a Payment]:http://dev.ripple.com/ripple-rest.html#submitting-a-payment
[Confirming a Payment]:http://dev.ripple.com/ripple-rest.html#confirming-a-payment
[Notifications]:http://dev.ripple.com/ripple-rest.html#checking-notifications
[Promises Guide]:http://www.dwmkerr.com/promises-in-angularjs-the-definitive-guide
[XRP]:https://www.ripplelabs.com/xrp-distribution
