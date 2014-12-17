Walkthrough: A Sample Application With Ripple-Rest
==================================================

Ripple-Rest is Ripple's [RESTful API] that developers can use to interact with the Ripple Network. Let's build an AngularJS app that uses Ripple-Rest to create a simple Ripple wallet interface that:

  - displays balances
  - displays the last 10 transactions
  - sends payments to other ripple wallets

In the end, we'll have something that looks like this:

> Start Page

> ![Start Page](http://i.imgur.com/XLF15W7.png)

> Wallet Interface

> ![Wallet Interface](http://i.imgur.com/kWCO5aD.png)

The source code can be found at the [Hello World Payments GitHub repository].

### 1. Set Up A Ripple-Rest Server

First, you need to set up a server. These are the quick start instructions from the [Ripple-Rest GitHub repository]:

> Run git clone https://github.com/ripple/ripple-rest.git in a terminal and switch into the ripple-rest directory
>
> Install dependencies needed: npm install
>
> Copy the config example to config.json: cp config-example.json config.json
>
> Run node server.js to start the server
>
> Visit http://localhost:5990 to view available endpoints and to get started
>
> Note: Restarting the server will delete the database so this CANNOT BE USED IN PRODUCTION.

### 2. Set Up Two Ripple Wallets

Next, you need two Ripple Wallets to test the app. If you already have two wallet addresses, feel free to skip to *part 3*. If you don't, head to https://www.rippletrade.com/#/register and create two wallets.

![RippleTrade.com Sign Up Page](http://i.imgur.com/DaRoLIm.png)

Take note of your Ripple secret (always starts with *s*), and after verifying and logging in, click on your Ripple Name (~RippleName) to see your Ripple address (always starts with *r*). Fund one of your wallets with the currency of your choice, but testing with [XRP] (Ripples) will be simplest. You can go to https://www.bitstamp.net to convert USD to XRP.

### 3. Scaffold The App With Yeoman

![Yeoman](https://www.openshift.com/sites/default/files/images/yeoman-logo.png)

Let's get started quickly with Yeoman. If you have Yeoman installed, skip to *Install AngularJS generator*.

If you don't have Yeoman installed, let's go through steps 1 - 5 in [this guide to Scaffold a web app with Yeoman].

#### Install Yeoman Dependencies

In your terminal (Mac), shell (UNIX), or console (Windows), check if you have node.

```sh
$ node --version && npm --version
```

If you need to install Node, or it's outdated, download it from http://nodejs.org/download. Then check if you have Git.

```sh
$ git --version
```

If you don't have git installed, use npm to install it. If you get permission errors, prefix the npm command with sudo.

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

Press **enter** to run the Angular generator, and type **no** to using Sass and **yes** to using Twitter Bootstrap. Include all the default modules, and press **enter** to start the generator.

![modules](http://i.imgur.com/ZoG7x74.png)

#### Start Server

```sh
$ grunt serve
```

This will open the browser, and on any edits to the app source files, the page will live reload. All of our work will lie in the in the **hello_world_payments/app** folder. So let's get started.

### 4. Create Start Page

### 5. Create Wallet Interface, Part 1 ([Account Balances])

### 6. Create Wallet Interface, Part 2 ([Account Transactions])

### 7. Create Payment Interface, Part 1 ([Preparing a Payment])

### 8. Create Payment Interface, Part 2 (Choosing a Payment Option)

### 9. Create Payment Interface, Part 3 ([Submitting a Payment])

### 10. Create Payment Interface, Part 4 ([Confirming a Payment])

### Conclusion
That's it. **Congratulations!** You can now cutomize the simple Ripple wallet to your liking. Here's a [Bootstrap Guide] to help with styling. For more information on Ripple-Rest, check out the [Getting Started] guide and the [Ripple-Rest Github repository].

Links:

* [Ripple-Rest API] [RESTful API]
* [Ripple-Rest GitHub repository]
* [Let's Scaffold a Web App With Yeoman] [this guide to scaffold a web app with Yeoman]
* [Bootstrap Guide]
* [Getting Started with Ripple-Rest] [Getting Started]
* [Ripple-Rest API Objects]
* [Account Balances]
* [Account Transactions]
* [Preparing a Payment]
* [Submitting a Payment]
* [Confirming a Payment]
* [Promises Guide]
* [RippleTrade](https://www.rippletrade.com)
* [BitStamp](https://www.bitstamp.net)
* [XRP]

[RESTful API]:http://dev.ripple.com/ripple-rest.html#ripple-rest-api
[Hello World Payments GitHub repository]:https://github.com/AiNoKame/hello_world_payments
[Ripple-Rest GitHub repository]:https://github.com/ripple/ripple-rest
[this guide to scaffold a web app with Yeoman]:http://yeoman.io/codelab.html
[Bootstrap Guide]:http://www.tutorialrepublic.com/twitter-bootstrap-tutorial
[Getting Started]:http://dev.ripple.com/ripple-rest.html#getting-started
[Ripple-Rest API Objects]:http://dev.ripple.com/ripple-rest.html#api-objects
[Account Balances]:http://dev.ripple.com/ripple-rest.html#account-balances
[Account Transactions]:http://dev.ripple.com/ripple-rest.html#payment-history
[Preparing a Payment]:http://dev.ripple.com/ripple-rest.html#preparing-a-payment
[Submitting a Payment]:http://dev.ripple.com/ripple-rest.html#submitting-a-payment
[Confirming a Payment]:http://dev.ripple.com/ripple-rest.html#confirming-a-payment
[Promises Guide]:http://www.dwmkerr.com/promises-in-angularjs-the-definitive-guide
[XRP]:https://www.ripplelabs.com/xrp-distribution
