/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree',['firebase', 'akoenig.deckgrid']);
var controllers = {};
fruitTree.controller(controllers);

controllers.lettersCtrl = function ($scope,$firebase) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    var baseColors = ['c', 'cd', 'd','dd','e','f','fd','g','gd','a','ad','b'];

    function Order (order, text) {
        var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
        var ordr = this,
            bit = 1,
            availableOrders = baseLetters.concat(),
            pluses=0, zeros=0, minuses=0;
        var refillOrders = function () {
            var current, result=baseLetters.concat(), order;

            for (var b=0;b<bit; b++) {
                current = result.slice(0);
                order=0;
                for (var i=0; i<current.length;i++) {

                    for (var j=0;j<12;j++) {

                        result[order++]=current[i]+baseLetters[j];
                    }
                }
            }
            bit++;
            availableOrders = result;
            ordr.shuffleOrders();
        };
        ordr.order = order || '0';
        ordr.text = text || '';
        ordr.color = ordr.order.substring(0,1);
        ordr.sayings = [];
        ordr.pretakenOrders = [];
        ordr.freeOrders = shuffle(availableOrders);
        ordr.shuffleOrders = function () {
            ordr.freeOrders = shuffle(availableOrders);
        };
        ordr.pretakeOrder = function (order) {
            var place = availableOrders.indexOf(order);
               if (place>=0){
                    var time = new Date();
                    availableOrders.splice(place,1);
                    ordr.pretakenOrders.push({order:order, time:time});
                    return {order:order, time:time}
               }
            return false;
        };
        ordr.returnOrder = function (order) {
            var place = ordr.pretakenOrders.indexOf(order);
            if (place>=0){
                ordr.pretakenOrders.splice(place,1);
                availableOrders.push(order);
            }
        };
        ordr.say = function (order, text) {
            var place = availableOrders.indexOf(order);
            if (place>=0) {
                ordr.sayings.push({order:order, text:text});
                ordr[order]=new Order(order,text);
                availableOrders.splice(place,1);
                ordr.shuffleOrders();
                $scope.linkedText = '';   //view repair
                if (availableOrders.length == 0) {refillOrders()};
                return true;
            }
            return false;
        };
        ordr.rate = function (sign) {
            switch (sign) {
                case '+':
                    pluses++;
                    break;
                case '0':
                    zeros++;
                    break;
                case '-':
                    minuses++;
                    break;
                default:
                    zeros++;
            }
        };
        ordr.getRating = function () {
            return pluses - minuses;
        };
        ordr.getTotal = function () {
            return pluses + minuses + zeros;
        };
    }

    $scope.root = new Order();


    $scope.availableColors = baseColors.concat();
    $scope.bit = 1;
    $scope.currentLetters = baseLetters.concat();
    $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
    $scope.popLetter = $scope.showLetters.pop();
    $scope.sayings = [];
    $scope.colors = [];
    $scope.rating = [];
    $scope.fireLetters = $firebase(new Firebase('http://fruit-tree.firebaseio.com')); //creating a firebase object
    $scope.fireLetters.$bind($scope, "remoteLetters"); //bind a $scope.remoteLetters object for saving
    $scope.saveToFireBase = function () {
        var remote = $scope.remoteLetters;
        remote.sayings = $scope.sayings;
        remote.currentLetters = $scope.currentLetters;
        remote.bit = $scope.bit;
        remote.colors = $scope.colors;
        remote.rating = $scope.rating;
    };
    $scope.loadFromFireBase = function () {
        var remote = $scope.remoteLetters;
        $scope.sayings = remote.sayings;
        $scope.currentLetters = remote.currentLetters;
        $scope.bit = remote.bit;
        $scope.colors = remote.colors;
        $scope.rating = remote.rating;
        $scope.shuffleLetters();
    };


    $scope.takeLetter = function(letter) {
        var place = $scope.currentLetters.indexOf(letter);
        if (place >= 0) {
            $scope.sayings.push({letter: letter, text: $scope.linkedText});
            $scope.rating.push({letter:letter, pluses:0,minuses:0,zeros:0});
            $scope.currentLetters.splice(place,1);
            $scope.linkedText = '';
            $scope.saveToLocalStorage();
            $scope.saveToFireBase();
            $scope.shuffleLetters();
        }
    };

    $scope.selectOrder = function (obj) {
        $scope.selectedOrder = obj;
    };

    $scope.storageStatus = function() { return localStorage.length};

    $scope.loadFromLocalStorage = function () {
       if (localStorage.length > 0) {
       $scope.currentLetters=JSON.parse(localStorage["currentLetters"]);
       $scope.sayings=JSON.parse(localStorage["sayings"]);
       $scope.bit=localStorage["bit"];
       $scope.colors=JSON.parse(localStorage["colors"]);
       $scope.rating=JSON.parse(localStorage["rating"]);
       $scope.shuffleLetters();
       }
    };

    $scope.restart = function(){
        localStorage.clear();
        $scope.bit = 1;
        $scope.currentLetters = baseLetters.concat();
        $scope.shuffleLetters();
        $scope.sayings = [];
        $scope.colors = [];
        $scope.rating = [];
        $scope.selectedOrder=false;
    };

    $scope.saveToLocalStorage = function () {
        localStorage["sayings"] = JSON.stringify($scope.sayings);
        localStorage["currentLetters"] = JSON.stringify($scope.currentLetters);
        localStorage["bit"] = $scope.bit;
        localStorage["colors"] = JSON.stringify($scope.colors);
        localStorage["rating"] = JSON.stringify($scope.rating);
    };

    $scope.refillLetters = function () {
        var current, result=baseLetters.concat(), order;

        for (var b=0;b<$scope.bit; b++) {
            current = result.slice(0);
            order=0;
            for (var i=0; i<current.length;i++) {

                for (var j=0;j<12;j++) {

                    result[order++]=current[i]+baseLetters[j];
                }
            }
        }
        $scope.bit++;
        $scope.currentLetters = result;
        $scope.shuffleLetters();
    };

    $scope.shuffleLetters = function (){
        $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
        $scope.popLetter = $scope.showLetters.shift();
    };

    $scope.armColor = function(letter){
        for (var i=0; i<$scope.colors.length; i++) {
            if (letter == $scope.colors[i].letter) {
                return $scope.colors[i].color;
            }
        }
        var color = 'c';
        if ($scope.availableColors.length == 0) {$scope.availableColors = baseColors.concat();}
        color = $scope.availableColors.shift();
        $scope.colors.push({letter:letter, color:color});
        return color;
    };

    $scope.rate = {
      plus: function (letter){
          var have = false;
          for (var i=0; i<$scope.rating.length; i++) {
              if (letter == $scope.rating[i].letter) {
                  ++$scope.rating[i].pluses;
                  have=true;
              }
          }
          if (!have) {$scope.rating.push({letter:letter, pluses:1, minuses:0, zeros:0})}
          $scope.saveToLocalStorage();
          $scope.saveToFireBase();
      },
      zero:function (letter){
          var have = false;
          for (var i=0; i<$scope.rating.length; i++) {
              if (letter == $scope.rating[i].letter) {
                  ++$scope.rating[i].zeros;
                  have=true;
              }
          }
          if (!have) {$scope.rating.push({letter:letter, pluses:0, minuses:0, zeros:1})}
          $scope.saveToLocalStorage();
          $scope.saveToFireBase();
      },
      minus: function (letter){
          var have = false;
          for (var i=0; i<$scope.rating.length; i++) {
              if (letter == $scope.rating[i].letter) {
                  ++$scope.rating[i].minuses;
                  have=true;
              }
          }
          if (!have) {$scope.rating.push({letter:letter, pluses:0, minuses:1, zeros:0})}
          $scope.saveToLocalStorage();
          $scope.saveToFireBase();
      },
      getTotal: function (letter) {
          for (var i=0; i<$scope.rating.length; i++) {
              if (letter == $scope.rating[i].letter) {
                  var total = $scope.rating[i].pluses + $scope.rating[i].minuses + $scope.rating[i].zeros;
                  return total;
              }
          }
          return 0;
      },
      getRating: function (letter) {
          for (var i=0; i<$scope.rating.length; i++) {
              if (letter == $scope.rating[i].letter) {
                  var rating = $scope.rating[i].pluses - $scope.rating[i].minuses;
                  return rating;
              }
          }
          return 0;
      }
    };

    $scope.sortByRating = function (card) {
            for (var i=0; i<$scope.rating.length; i++) {
                if (card.letter == $scope.rating[i].letter) {
                    return $scope.rating[i].minuses - $scope.rating[i].pluses;
                }
            }
            return 0;
    };

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


};

