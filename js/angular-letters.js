/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree',['firebase', 'akoenig.deckgrid']);
var controllers = {};
fruitTree.controller(controllers);

controllers.lettersCtrl = function ($scope,$firebase) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    var baseColors = ['c', 'cd', 'd','dd','e','f','fd','g','gd','a','ad','b'];
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
        ordr.ratingSort = function (card) {
            var order = card.order;
            return -ordr[order].getRating();
        }
    }




    $scope.root = new Order();
    $scope.getColor = function (order) {
        return order.substring(0,1);
    };
    $scope.reset = function () {
        $scope.root = new Order();
    }


   // $scope.firebase = $firebase(new Firebase('https://frukt.firebaseio.com')); //creating a firebase object
   // $scope.remote = {};
   // $scope.remote.root = new Order();
   // $scope.firebase.$bind($scope, "remote"); //bind a $scope.remoteLetters object for saving

   // $scope.saveToFireBase = function () {
   //     $scope.remote.root = $scope.root;
   // };
   // $scope.loadFromFireBase = function () {
   //     var remoteroot = $scope.remote.root;
   //     $scope.root = remoteroot;
   // };


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


    $scope.saveToLocalStorage = function () {
        localStorage["sayings"] = JSON.stringify($scope.sayings);
        localStorage["currentLetters"] = JSON.stringify($scope.currentLetters);
        localStorage["bit"] = $scope.bit;
        localStorage["colors"] = JSON.stringify($scope.colors);
        localStorage["rating"] = JSON.stringify($scope.rating);
    };




};

