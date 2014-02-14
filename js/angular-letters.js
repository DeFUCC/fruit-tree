/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree', ['firebase', 'ui.bootstrap' /*, 'akoenig.deckgrid' */]);
var controllers = {};
fruitTree.controller(controllers);



 fruitTree.directive("roll", function($compile) {
 return {
 restrict: "E",
 templateUrl: 'roll.html',
 scope: {
     tape: '=',
     width: '=',
     rate: '=',
     select: '='
 },
 controller: function($scope) {
     $scope.selector = function (card) {
         $scope.select = card || '';
     }
 },
 compile: function(tElement, tAttr) {
 var contents = tElement.contents().remove();
 var compiledContents;
 return function(scope, iElement, iAttr) {
 if(!compiledContents) {
 compiledContents = $compile(contents);
 }
 compiledContents(scope, function(clone, scope) {
 iElement.append(clone);
 });
 };
 }
 };
 });


controllers.lettersCtrl = function ($scope, $firebase) {
    var baseLetters = ['A', 'B', 'C', 'E', 'H', 'K', 'M', 'O', 'P', 'T', 'X', 'Y'];
    var baseColors = ['c', 'cd', 'd', 'dd', 'e', 'f', 'fd', 'g', 'gd', 'a', 'ad', 'b'];
    var boxWidth = 160;
    var retina = window.devicePixelRatio > 1;
    if (retina) {
        boxWidth = 320
    }
    $scope.columner = function () {
        var fruit = document.getElementById('fruit');
        $scope.width = fruit.clientWidth;
        $scope.colsmax = Math.floor($scope.width / boxWidth);
        $scope.cols = $scope.colsmax;
        $scope.boxWidth = $scope.width/$scope.cols -5 +'px';
        $scope.$apply();
    };

    window.onresize = $scope.columner;

    function shuffle(massive) {
        arr = massive.concat();
        for (var i = arr.length - 1; i > 0; i--) {
            var num = Math.floor(Math.random() * (i + 1));
            var d = arr[num];
            arr[num] = arr[i];
            arr[i] = d;
        }

        return arr;
    }

    function Order(order, type, picLink, text, date) {
        this.pluses = 0;
        this.zeros = 0;
        this.minuses = 0;
        this.date = date;
        this.order = order || '0';
        this.type = type || '';
        this.picLink = picLink || '';
        this.text = text || '';
        this.bit = 1;
        this.branches = [];
        this.availableOrders = baseLetters.concat();
        this.pretaken = '';
        this.freeOrders = shuffle(this.availableOrders);
    }


    $scope.ratingSort = function (card) {
        return card.minuses - card.pluses;
    };
    $scope.shuffleOrders = function (stem) {
        stem.freeOrders = shuffle(stem.availableOrders);
    };
    $scope.rate = {};
    $scope.rate.plus = function (card) {card.pluses++};
    $scope.rate.minus = function (card) {card.minuses++};
    $scope.rate.zero = function (card) {card.zeros++};
    $scope.rate.getTotal = function (card) {return card.pluses + card.minuses + card.zeros};
    $scope.rate.getRating = function (card) {return card.pluses - card.minuses;};
    $scope.rate.getColor = function (order) {return order.substring(0, 1);};
    $scope.rate.sort = function (card) {return card.minuses - card.pluses;};


    $scope.refillOrders = function (stem) {
        var current, result = baseLetters.concat(), order;

        for (var b = 0; b < this.bit; b++) {
            current = result.slice(0);
            order = 0;
            for (var i = 0; i < current.length; i++) {

                for (var j = 0; j < 12; j++) {

                    result[order++] = current[i] + baseLetters[j];
                }
            }
        }
        stem.bit++;
        stem.availableOrders = result;
        $scope.shuffleOrders(stem);
    };
    $scope.say = function (stem, order, type, picLink, text) {
        var place = stem.availableOrders.indexOf(order);
        if (place >= 0) {
            var time = new Date();
            var date = time.toJSON();
            if (!stem.branches) {stem.branches = []}
            stem.branches.push(new Order(order, type, picLink, text, date));
            stem.availableOrders.splice(place, 1);
            $scope.pretaken = '';
            $scope.pretake='';
            $scope.sayingType='';
            $scope.picLink='';
            $scope.hidden=true;
            $scope.shuffleOrders(stem);
            $scope.linkedText = '';   //view repair
            if (stem.availableOrders.length == 0) {
                refillOrders(stem)
            }
            return true;
        }
        return false;
    };

    $scope.returnOrder = function (stem) {
        if ($scope.pretaken != '') {
            $scope.pretaken = '';
            $scope.shuffleOrders(stem);
        }
    };
    $scope.pretakeOrder = function (stem, order) {
        $scope.pretaken = order;
        $scope.shuffleOrders(stem);
    };


    $scope.select = function(card) {
        $scope.sel = card || '';
    };

    $scope.getColor = function (order) {
        return order.substring(0, 1);
    };
    $scope.reset = function () {
        $scope.root = new Order();
        $scope.sel='';
        $scope.pretaken='';
    };


    $scope.firebase = $firebase(new Firebase('https://frukt.firebaseio.com')); //creating a firebase object
    $scope.firebase.$bind($scope, "remote"); //bind a $scope.remote object for saving

    $scope.saveToFireBase = function () {
        $scope.remote.root = $scope.root;
    };
    $scope.loadFromFireBase = function () {
        $scope.root = $scope.remote.root;
        $scope.shuffleOrders($scope.root);
    };


    $scope.root = new Order();
    $scope.sel='';

    $scope.pretaken = '';
    $scope.types = ['Design', 'Event', 'Person', 'Saying'];

    /*   $scope.loadFromLocalStorage = function () {
     if (localStorage.length > 0) {
     $scope.root = new Order();
     $scope.root.importSayings(JSON.parse(localStorage["root"]));
     $scope.root.shuffleOrders();
     }
     };


     $scope.saveToLocalStorage = function () {
     localStorage["root"] = JSON.stringify($scope.root.exportSayings());
     console.log(localStorage['root']);
     };

     */


};

